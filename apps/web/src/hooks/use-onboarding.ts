import { useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useCreateOrganization, useInviteTeamMember } from "./use-organization";
import { trpc } from "@/utils/trpc";
import { useMutation } from "@tanstack/react-query";

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
		razaoSocial?: string;
		nomeFantasia?: string;
		dataAbertura?: string;
		cnae?: string;
		porte?: string;
		inscricaoEstadual?: string;
		inscricaoMunicipal?: string;
	};
	branding?: {
		logo?: string;
	};
	team?: Array<{
		email: string;
		role: string;
	}>;
};

function normalizeSlug(slug: string): string {
	return slug.trim().toLowerCase().replace(/\s+/g, "-");
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

	// Build metadata for CNPJ-related and extra fields
	const metadata: Record<string, unknown> = {};

	if (org.razaoSocial) metadata.razaoSocial = org.razaoSocial;
	if (org.nomeFantasia) metadata.nomeFantasia = org.nomeFantasia;
	if (org.dataAbertura) metadata.dataAbertura = org.dataAbertura;
	if (org.cnae) metadata.cnae = org.cnae;
	if (org.porte) metadata.porte = org.porte;
	if (org.inscricaoEstadual) metadata.inscricaoEstadual = org.inscricaoEstadual;
	if (org.inscricaoMunicipal) metadata.inscricaoMunicipal = org.inscricaoMunicipal;
	if (onboardingData.branding?.logo) metadata.logo = onboardingData.branding.logo;

	return {
		name: org.name.trim(),
		slug: normalizeSlug(org.slug),
		logo: onboardingData.branding?.logo,
		metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
		// Additional fields
		...(org.address && { address: org.address }),
		...(org.city && { city: org.city }),
		...(org.state && { state: org.state }),
		...(org.postalCode && { postalCode: org.postalCode }),
		...(org.country && { country: org.country }),
		...(org.phone && { phone: org.phone }),
		...(org.email && { email: org.email }),
		...(org.website && { website: org.website }),
		...(org.cnpj && { cnpj: org.cnpj.replace(/\D/g, "") }),
		...(org.type && { type: org.type }),
	};
}

export function useCompleteOnboarding() {
	const navigate = useNavigate();
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const { createOrganization } = useCreateOrganization();
	const { inviteMember } = useInviteTeamMember();

	const updateOnboardingMutation = useMutation(
		trpc.user.updateUserOnboarding.mutationOptions(),
	);

	const completeOnboarding = useCallback(async () => {
		setIsSubmitting(true);
		setError(null);

		try {
			// Get onboarding data from sessionStorage
			const storedData = sessionStorage.getItem("onboarding_data");
			
			if (!storedData) {
				// Don't throw error, just set error state and return early
				// This allows the UI to show the error without breaking the flow
				setError("No onboarding data found in session. Please go back and complete the previous steps.");
				setIsSubmitting(false);
				return;
			}

			let onboardingData: OnboardingData;
			try {
				onboardingData = JSON.parse(storedData);
			} catch (parseError) {
				console.error("Failed to parse onboarding data:", parseError);
				throw new Error("Invalid onboarding data format. Please start over.");
			}

			// Log the data for debugging
			console.log("Onboarding data from sessionStorage:", onboardingData);

			// Validate that organization data exists
			if (!onboardingData.organization) {
				console.error("Missing organization in onboarding data:", onboardingData);
				console.error("Full sessionStorage data:", storedData);
				throw new Error(
					"Organization data is missing. Please go back to the organization step and complete it."
				);
			}

			// Validate required organization fields
			if (!onboardingData.organization.name || !onboardingData.organization.slug) {
				console.error("Incomplete organization data:", onboardingData.organization);
				throw new Error(
					"Organization name or slug is missing. Please go back to the organization step and complete it."
				);
			}

			// Build organization data
			const orgData = buildOrganizationData(onboardingData);

			// Create organization - this must succeed for onboarding to complete
			try {
				const createdOrg = await createOrganization(orgData);
				if (!createdOrg || !createdOrg.id) {
					throw new Error("Organization creation did not return a valid organization");
				}
				// Organization created successfully, continue with onboarding
			} catch (orgError) {
				console.error("Organization creation error:", orgError);
				const errorMsg = orgError instanceof Error ? orgError.message : String(orgError);
				
				// If it's the "no data returned" error, it might still be created
				// But we should still treat it as an error to be safe
				// The user can retry if needed
				throw new Error(
					`Failed to create organization: ${errorMsg}. Please check if it was created and try again.`
				);
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

			// Update onboarding status - only if organization was successfully created
			try {
				await updateOnboardingMutation.mutateAsync({
					hasOnboarded: true,
				});
			} catch (err) {
				console.warn("Failed to update onboarding status:", err);
				// Don't clear sessionStorage if update failed - allow retry
				setError("Failed to update onboarding status. Please try again.");
				setIsSubmitting(false);
				return;
			}

			// Clear sessionStorage only after successful completion
			sessionStorage.removeItem("onboarding_data");

			setIsSubmitting(false);
			
			// Only show success toast if we got here without errors
			toast.success("Onboarding completed successfully!");

			// Navigate to next step
			setTimeout(() => {
				navigate("/onboarding/notifications");
			}, 500);
		} catch (err) {
			console.error("Onboarding error:", err);
			const errorMessage =
				err instanceof Error ? err.message : "Failed to complete onboarding. Please try again.";

			setError(errorMessage);
			setIsSubmitting(false);
			// Only show error toast if it's a real error (not the "no data returned" false positive)
			if (!errorMessage.includes("No organization data returned")) {
				toast.error(errorMessage);
			}
		}
	}, [createOrganization, inviteMember, navigate, updateOnboardingMutation]);

	return {
		completeOnboarding,
		error,
		isSubmitting,
	};
}

