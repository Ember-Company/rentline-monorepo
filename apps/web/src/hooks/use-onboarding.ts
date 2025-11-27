import { useMutation } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { trpc } from "@/utils/trpc";
import { useCreateOrganization, useInviteTeamMember } from "./use-organization";

type OnboardingData = {
	organization?: {
		name: string;
		slug: string;
		address?: string;
		city?: string;
		state?: string;
		postalCode?: string;
		country?: string;
		phone?: string;
		email?: string;
		website?: string;
		cnpj?: string;
		type?: string;
	};
	branding?: {
		logo?: string;
		primaryColor?: string;
	};
	team?: Array<{
		email: string;
		role: string;
	}>;
	properties?: Array<{
		id: string;
		name: string;
		address: string;
		city: string;
		type: string;
	}>;
};

function normalizeSlug(slug: string): string {
	return slug
		.trim()
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");
}

function buildOrganizationData(onboardingData: OnboardingData) {
	if (!onboardingData.organization) {
		throw new Error("Organization data is missing");
	}

	const org = onboardingData.organization;

	if (!org.name) {
		throw new Error("Organization name is required");
	}

	if (!org.slug) {
		throw new Error("Organization slug is required");
	}

	// Build the organization data - only include fields that have values
	const result: {
		name: string;
		slug: string;
		logo?: string;
		address?: string;
		city?: string;
		state?: string;
		postalCode?: string;
		country?: string;
		phone?: string;
		email?: string;
		website?: string;
		cnpj?: string;
		type?: string;
		metadata?: Record<string, unknown>;
	} = {
		name: org.name.trim(),
		slug: normalizeSlug(org.slug),
	};

	// Add optional organization fields
	if (org.address) result.address = org.address;
	if (org.city) result.city = org.city;
	if (org.state) result.state = org.state;
	if (org.postalCode) result.postalCode = org.postalCode;
	if (org.country) result.country = org.country;
	if (org.phone) result.phone = org.phone;
	if (org.email) result.email = org.email;
	if (org.website) result.website = org.website;
	if (org.cnpj) result.cnpj = org.cnpj.replace(/\D/g, "");
	if (org.type) result.type = org.type;

	// Add branding
	if (onboardingData.branding?.logo) {
		result.logo = onboardingData.branding.logo;
	}

	// Build metadata for extra fields
	const metadata: Record<string, unknown> = {};
	if (onboardingData.branding?.primaryColor) {
		metadata.primaryColor = onboardingData.branding.primaryColor;
	}

	if (Object.keys(metadata).length > 0) {
		result.metadata = metadata;
	}

	return result;
}

export function useCompleteOnboarding() {
	const navigate = useNavigate();
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);

	const { createOrganization } = useCreateOrganization();
	const { inviteMember } = useInviteTeamMember();

	const updateOnboardingMutation = useMutation(
		trpc.user.updateUserOnboarding.mutationOptions(),
	);

	const completeOnboarding = useCallback(async () => {
		setIsSubmitting(true);
		setError(null);
		setIsSuccess(false);

		try {
			// Get onboarding data from sessionStorage
			const storedData = sessionStorage.getItem("onboarding_data");

			if (!storedData) {
				setError(
					"Dados de configuração não encontrados. Por favor, volte e complete os passos anteriores.",
				);
				setIsSubmitting(false);
				return;
			}

			let onboardingData: OnboardingData;
			try {
				onboardingData = JSON.parse(storedData);
				console.log("Parsed onboarding data:", onboardingData);
			} catch (parseError) {
				console.error("Failed to parse onboarding data:", parseError);
				throw new Error(
					"Formato de dados inválido. Por favor, recomece o processo.",
				);
			}

			// Validate that organization data exists
			if (!onboardingData.organization) {
				console.error(
					"Missing organization in onboarding data:",
					onboardingData,
				);
				throw new Error(
					"Dados da organização não encontrados. Por favor, volte e preencha os dados da empresa.",
				);
			}

			// Validate required organization fields
			if (
				!onboardingData.organization.name ||
				!onboardingData.organization.slug
			) {
				console.error(
					"Incomplete organization data:",
					onboardingData.organization,
				);
				throw new Error(
					"Nome ou identificador da organização não preenchido. Por favor, complete os dados da empresa.",
				);
			}

			// Build organization data
			const orgData = buildOrganizationData(onboardingData);
			console.log("Built organization data:", orgData);

			// Create organization
			try {
				const createdOrg = await createOrganization(orgData);
				if (!createdOrg || !createdOrg.id) {
					throw new Error("Não foi possível criar a organização");
				}
				console.log("Organization created:", createdOrg);
			} catch (orgError) {
				console.error("Organization creation error:", orgError);
				const errorMsg =
					orgError instanceof Error ? orgError.message : String(orgError);
				throw new Error(`Erro ao criar organização: ${errorMsg}`);
			}

			// Invite team members (non-blocking)
			if (onboardingData.team && onboardingData.team.length > 0) {
				await Promise.allSettled(
					onboardingData.team.map((member) =>
						inviteMember(member.email, member.role).catch((err) => {
							console.warn(`Failed to invite ${member.email}:`, err);
							return null;
						}),
					),
				);
			}

			// Update onboarding status
			try {
				await updateOnboardingMutation.mutateAsync({
					hasOnboarded: true,
				});
			} catch (err) {
				console.warn("Failed to update onboarding status:", err);
				setError("Erro ao atualizar status. Por favor, tente novamente.");
				setIsSubmitting(false);
				return;
			}

			// Clear sessionStorage only after successful completion
			sessionStorage.removeItem("onboarding_data");

			setIsSubmitting(false);
			setIsSuccess(true);
			toast.success("Configuração concluída com sucesso!");
		} catch (err) {
			console.error("Onboarding error:", err);
			const errorMessage =
				err instanceof Error
					? err.message
					: "Erro ao completar configuração. Por favor, tente novamente.";
			setError(errorMessage);
			setIsSubmitting(false);
			toast.error(errorMessage);
		}
	}, [createOrganization, inviteMember, updateOnboardingMutation]);

	return {
		completeOnboarding,
		error,
		isSubmitting,
		isSuccess,
	};
}
