import { Button, Input, Select, SelectItem } from "@heroui/react";
import { useForm } from "@tanstack/react-form";
import { ArrowRight, Building2, MapPin } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import z from "zod";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { BRAZILIAN_STATES } from "@/lib/constants/brazil";
import type { Route } from "./+types/route";

export function meta(_args: Route.MetaArgs) {
	return [{ title: "Dados da Empresa - Rentline" }];
}

const organizationSchema = z.object({
	name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
	slug: z
		.string()
		.min(2, "Identificador deve ter no mínimo 2 caracteres")
		.regex(/^[a-z0-9-]+$/, "Use apenas letras minúsculas, números e hífens"),
	city: z.string().min(2, "Informe a cidade"),
	state: z.string().min(2, "Selecione o estado"),
});

export default function OrganizationStep() {
	const navigate = useNavigate();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const form = useForm({
		defaultValues: {
			name: "",
			slug: "",
			city: "",
			state: "",
		},
		onSubmit: async ({ value }) => {
			setIsSubmitting(true);
			try {
				// Store in sessionStorage for later submission
				const onboardingData = JSON.parse(
					sessionStorage.getItem("onboarding_data") || "{}",
				);
				onboardingData.organization = {
					...value,
					type: "landlord",
					country: "Brasil",
				};
				sessionStorage.setItem(
					"onboarding_data",
					JSON.stringify(onboardingData),
				);

				toast.success("Dados salvos!");
				navigate("/onboarding/branding");
			} catch {
				toast.error("Erro ao salvar dados");
			} finally {
				setIsSubmitting(false);
			}
		},
		validators: {
			onSubmit: organizationSchema,
		},
	});

	// Auto-generate slug from name
	const handleNameChange = (name: string) => {
		form.setFieldValue("name", name);
		const slug = name
			.toLowerCase()
			.normalize("NFD")
			.replace(/[\u0300-\u036f]/g, "")
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-|-$/g, "");
		form.setFieldValue("slug", slug);
	};

	return (
		<OnboardingLayout
			title="Dados da Empresa"
			description="Informe os dados básicos da sua imobiliária ou empresa de administração de imóveis."
		>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
				className="space-y-6"
			>
				{/* Company Name */}
				<form.Field name="name">
					{(field) => (
						<Input
							label="Nome da empresa"
							placeholder="Ex: Imobiliária São Paulo"
							value={field.state.value}
							onBlur={field.handleBlur}
							onValueChange={handleNameChange}
							startContent={<Building2 className="h-4 w-4 text-gray-400" />}
							isRequired
							isInvalid={field.state.meta.errors.length > 0}
							errorMessage={field.state.meta.errors[0]?.message}
							labelPlacement="outside"
						/>
					)}
				</form.Field>

				{/* Slug */}
				<form.Field name="slug">
					{(field) => (
						<div className="space-y-2">
							<Input
								label="Identificador único"
								placeholder="ex: imobiliaria-sao-paulo"
								value={field.state.value}
								onBlur={field.handleBlur}
								onValueChange={(value) => field.handleChange(value)}
								description="Usado na URL do seu painel"
								isRequired
								isInvalid={field.state.meta.errors.length > 0}
								errorMessage={field.state.meta.errors[0]?.message}
								labelPlacement="outside"
							/>
							<p className="text-xs text-gray-500">
								rentline.com.br/
								<span className="font-medium text-primary">
									{field.state.value || "sua-empresa"}
								</span>
							</p>
						</div>
					)}
				</form.Field>

				{/* Location */}
				<div className="grid grid-cols-2 gap-4">
					<form.Field name="city">
						{(field) => (
							<Input
								label="Cidade"
								placeholder="São Paulo"
								value={field.state.value}
								onBlur={field.handleBlur}
								onValueChange={(value) => field.handleChange(value)}
								startContent={<MapPin className="h-4 w-4 text-gray-400" />}
								isRequired
								isInvalid={field.state.meta.errors.length > 0}
								errorMessage={field.state.meta.errors[0]?.message}
								labelPlacement="outside"
							/>
						)}
					</form.Field>

					<form.Field name="state">
						{(field) => (
							<Select
								label="Estado"
								placeholder="Selecione"
								selectedKeys={field.state.value ? [field.state.value] : []}
								onSelectionChange={(keys) => {
									const value = Array.from(keys)[0] as string;
									field.handleChange(value);
								}}
								isRequired
								isInvalid={field.state.meta.errors.length > 0}
								errorMessage={field.state.meta.errors[0]?.message}
								labelPlacement="outside"
							>
								{BRAZILIAN_STATES.map((state) => (
									<SelectItem key={state.value}>{state.label}</SelectItem>
								))}
							</Select>
						)}
					</form.Field>
				</div>

				{/* Submit */}
				<div className="flex items-center justify-between pt-4">
					<p className="text-sm text-gray-500">
						Campos com <span className="text-red-500">*</span> são obrigatórios
					</p>
					<form.Subscribe>
						{(state) => (
							<Button
								type="submit"
								color="primary"
								size="lg"
								isDisabled={!state.canSubmit}
								isLoading={isSubmitting}
								endContent={!isSubmitting && <ArrowRight className="h-4 w-4" />}
							>
								{isSubmitting ? "Salvando..." : "Continuar"}
							</Button>
						)}
					</form.Subscribe>
				</div>
			</form>
		</OnboardingLayout>
	);
}
