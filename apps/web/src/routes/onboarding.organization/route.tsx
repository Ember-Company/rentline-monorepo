import type { Route } from "./+types/route";
import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { OrganizationBasicInfo } from "@/components/onboarding/OrganizationBasicInfo";
import { OrganizationAddress } from "@/components/onboarding/OrganizationAddress";
import { OrganizationContact } from "@/components/onboarding/OrganizationContact";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";

export function meta(_args: Route.MetaArgs) {
	return [{ title: "Organization Details - Onboarding" }];
}

export default function OrganizationStep() {
	const navigate = useNavigate();
	const [currentStep, setCurrentStep] = useState(1);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const form = useForm({
		defaultValues: {
			name: "",
			slug: "",
			cnpj: "",
			razaoSocial: "",
			nomeFantasia: "",
			dataAbertura: "",
			cnae: "",
			porte: "",
			inscricaoEstadual: "",
			inscricaoMunicipal: "",
			address: "",
			city: "",
			state: "",
			postalCode: "",
			country: "Brasil",
			phone: "",
			email: "",
			website: "",
			type: "landlord",
		},
		onSubmit: async ({ value }) => {
			setIsSubmitting(true);
			try {
				// Store in sessionStorage for later submission
				const onboardingData = JSON.parse(
					sessionStorage.getItem("onboarding_data") || "{}",
				);
				onboardingData.organization = { ...value, type: "landlord" };
				sessionStorage.setItem(
					"onboarding_data",
					JSON.stringify(onboardingData),
				);

				toast.success("Dados da organização salvos");
				navigate("/onboarding/branding");
			} catch {
				toast.error("Erro ao salvar dados da organização");
			} finally {
				setIsSubmitting(false);
			}
		},
		// Validation is handled in individual step components
	});

	// Load existing data if available
	useEffect(() => {
		const existingData = JSON.parse(
			sessionStorage.getItem("onboarding_data") || "{}",
		);
		if (existingData.organization && !form.state.values.name) {
			form.setFieldValue("name", existingData.organization.name || "");
			form.setFieldValue("slug", existingData.organization.slug || "");
			form.setFieldValue("cnpj", existingData.organization.cnpj || "");
			form.setFieldValue("address", existingData.organization.address || "");
			form.setFieldValue("city", existingData.organization.city || "");
			form.setFieldValue("state", existingData.organization.state || "");
			form.setFieldValue(
				"postalCode",
				existingData.organization.postalCode || "",
			);
			form.setFieldValue(
				"country",
				existingData.organization.country || "Brasil",
			);
			form.setFieldValue("phone", existingData.organization.phone || "");
			form.setFieldValue("email", existingData.organization.email || "");
			form.setFieldValue("website", existingData.organization.website || "");
		}
	}, []);

	const handleNext = () => {
		if (currentStep < 3) {
			// Validate current step before proceeding
			if (currentStep === 1) {
				const name = form.state.values.name;
				const slug = form.state.values.slug;
				const cnpj = form.state.values.cnpj;
				if (!name || !slug || !cnpj) {
					toast.error("Por favor, preencha todos os campos obrigatórios");
					return;
				}
			} else if (currentStep === 2) {
				const address = form.state.values.address;
				const city = form.state.values.city;
				const state = form.state.values.state;
				const postalCode = form.state.values.postalCode;
				if (!address || !city || !state || !postalCode) {
					toast.error("Por favor, preencha todos os campos obrigatórios");
					return;
				}
			}
			setCurrentStep(currentStep + 1);
		} else {
			// Final step - submit form
			form.handleSubmit();
		}
	};

	const handleBack = () => {
		if (currentStep > 1) {
			setCurrentStep(currentStep - 1);
		}
	};

	const getStepTitle = () => {
		if (currentStep === 1) return "Organization Details";
		if (currentStep === 2) return "Organization Address";
		return "Contact Information";
	};

	const getStepDescription = () => {
		if (currentStep === 1)
			return "Set up your organization's basic information to get started with property management.";
		if (currentStep === 2)
			return "Add your organization's address details for accurate location tracking.";
		return "Provide contact information so tenants and partners can reach you easily.";
	};

	return (
		<OnboardingLayout
			title={getStepTitle()}
			description={getStepDescription()}
			showProgress={true}
		>
			<div className="space-y-6">
				{currentStep === 1 && (
					<OrganizationBasicInfo
						form={form}
						onNext={handleNext}
						isSubmitting={isSubmitting}
					/>
				)}
				{currentStep === 2 && (
					<OrganizationAddress
						form={form}
						onNext={handleNext}
						onBack={handleBack}
						isSubmitting={isSubmitting}
					/>
				)}
				{currentStep === 3 && (
					<OrganizationContact
						form={form}
						onNext={handleNext}
						onBack={handleBack}
						isSubmitting={isSubmitting}
					/>
				)}
			</div>
		</OnboardingLayout>
	);
}
