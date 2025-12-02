import {
	Button,
	Divider,
	Input,
	Select,
	SelectItem,
	Spinner,
} from "@heroui/react";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { Building2, Globe, MapPin, Phone, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BRAZILIAN_STATES } from "@/lib/constants/brazil";
import { authClient } from "@/lib/auth-client";
import {
	ORGANIZATION_DETAILS_QUERY_KEY,
	useOrganizationDetails,
} from "@/hooks/use-organization-details";

interface OrganizationGeneralProps {
	organizationId: string;
}

interface OrgData {
	name?: string;
	slug?: string;
	email?: string | null;
	phone?: string | null;
	website?: string | null;
	cnpj?: string | null;
	address?: string | null;
	city?: string | null;
	state?: string | null;
	postalCode?: string | null;
	country?: string | null;
}

export function OrganizationGeneral({ organizationId }: OrganizationGeneralProps) {
	const queryClient = useQueryClient();
	const [isUpdating, setIsUpdating] = useState(false);
	
	// Use shared React Query hook - prevents duplicate requests
	const {
		data: organization,
		isLoading,
		error,
	} = useOrganizationDetails(organizationId);

	const form = useForm({
		defaultValues: {
			name: "",
			slug: "",
			email: "",
			phone: "",
			website: "",
			cnpj: "",
			address: "",
			city: "",
			state: "",
			postalCode: "",
			country: "Brasil",
		},
		onSubmit: async ({ value }) => {
			setIsUpdating(true);
			try {
				// Build update data with all fields - better-auth accepts all these fields
				const updateData: Record<string, unknown> = {
					name: value.name,
					slug: value.slug,
				};

				// Add optional fields
				if (value.email) updateData.email = value.email;
				if (value.phone) updateData.phone = value.phone;
				if (value.website) updateData.website = value.website;
				if (value.cnpj) updateData.cnpj = value.cnpj.replace(/\D/g, "");
				if (value.address) updateData.address = value.address;
				if (value.city) updateData.city = value.city;
				if (value.state) updateData.state = value.state;
				if (value.postalCode) updateData.postalCode = value.postalCode.replace(/\D/g, "");
				if (value.country) updateData.country = value.country;

				const { error } = await authClient.organization.update({
					organizationId,
					data: updateData,
				});

				if (error) {
					throw new Error(
						typeof error === "string" ? error : (error as { message?: string }).message || "Failed to update"
					);
				}

				// Invalidate organization details query to refetch fresh data
				queryClient.invalidateQueries({
					queryKey: ORGANIZATION_DETAILS_QUERY_KEY(organizationId),
				});

				toast.success("Organização atualizada com sucesso!");
			} catch (error) {
				console.error("Failed to update organization:", error);
				toast.error(error instanceof Error ? error.message : "Falha ao atualizar");
			} finally {
				setIsUpdating(false);
			}
		},
	});

	// Update form when organization data loads
	useEffect(() => {
		if (organization) {
			form.setFieldValue("name", organization.name || "");
			form.setFieldValue("slug", organization.slug || "");
			form.setFieldValue("email", organization.email || "");
			form.setFieldValue("phone", organization.phone || "");
			form.setFieldValue("website", organization.website || "");
			form.setFieldValue("cnpj", formatCNPJ(organization.cnpj || ""));
			form.setFieldValue("address", organization.address || "");
			form.setFieldValue("city", organization.city || "");
			form.setFieldValue("state", organization.state || "");
			form.setFieldValue("postalCode", formatCEP(organization.postalCode || ""));
			form.setFieldValue("country", organization.country || "Brasil");
		}
	}, [organization, form]);

	if (isLoading) {
		return (
			<div className="flex h-64 items-center justify-center">
				<Spinner size="lg" />
			</div>
		);
	}

	if (error || !organization) {
		return (
			<div className="flex flex-col items-center justify-center py-12">
				<Building2 className="mb-4 h-12 w-12 text-default-foreground/50" />
				<p className="text-default-foreground">
					{error instanceof Error ? error.message : "Organização não encontrada"}
				</p>
			</div>
		);
	}

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
			className="space-y-6"
		>
			{/* Basic Info */}
			<div className="space-y-4">
				<div className="flex items-center gap-2">
					<Building2 className="h-5 w-5 text-primary" />
					<h3 className="text-lg font-semibold text-foreground">
						Informações Básicas
					</h3>
				</div>

				<div className="grid gap-4 sm:grid-cols-2">
					<form.Field name="name">
						{(field) => (
							<Input
								label="Nome da Organização"
								placeholder="Minha Empresa"
								value={field.state.value}
								onValueChange={field.handleChange}
								onBlur={field.handleBlur}
								isRequired
								labelPlacement="outside"
							/>
						)}
					</form.Field>

					<form.Field name="slug">
						{(field) => (
							<Input
								label="Identificador (slug)"
								placeholder="minha-empresa"
								value={field.state.value}
								onValueChange={(value) =>
									field.handleChange(
										value
											.toLowerCase()
											.replace(/[^a-z0-9-]/g, "-")
											.replace(/-+/g, "-")
									)
								}
								onBlur={field.handleBlur}
								description="Usado na URL da organização"
								isRequired
								labelPlacement="outside"
							/>
						)}
					</form.Field>
				</div>

				<div className="grid gap-4 sm:grid-cols-2">
					<form.Field name="country">
						{(field) => (
							<Input
								label="País"
								value={field.state.value || "Brasil"}
								isReadOnly
								labelPlacement="outside"
								description="O país não pode ser alterado"
								startContent={<Globe className="h-4 w-4 text-default-foreground/50" />}
							/>
						)}
					</form.Field>

					{form.getFieldValue("country") === "Brasil" && (
						<form.Field name="cnpj">
							{(field) => (
								<Input
									label="CNPJ"
									placeholder="00.000.000/0000-00"
									value={field.state.value}
									onValueChange={(value) => field.handleChange(formatCNPJ(value))}
									onBlur={field.handleBlur}
									maxLength={18}
									labelPlacement="outside"
								/>
							)}
						</form.Field>
					)}
				</div>
			</div>

			<Divider />

			{/* Contact Info */}
			<div className="space-y-4">
				<div className="flex items-center gap-2">
					<Phone className="h-5 w-5 text-primary" />
					<h3 className="text-lg font-semibold text-foreground">
						Contato
					</h3>
				</div>

				<div className="grid gap-4 sm:grid-cols-2">
					<form.Field name="email">
						{(field) => (
							<Input
								label="Email"
								type="email"
								placeholder="contato@empresa.com.br"
								value={field.state.value}
								onValueChange={field.handleChange}
								onBlur={field.handleBlur}
								labelPlacement="outside"
							/>
						)}
					</form.Field>

					<form.Field name="phone">
						{(field) => (
							<Input
								label="Telefone"
								placeholder="(11) 99999-9999"
								value={field.state.value}
								onValueChange={(value) => field.handleChange(formatPhone(value))}
								onBlur={field.handleBlur}
								maxLength={15}
								labelPlacement="outside"
							/>
						)}
					</form.Field>
				</div>

				<form.Field name="website">
					{(field) => (
						<Input
							label="Website"
							placeholder="https://www.empresa.com.br"
							value={field.state.value}
							onValueChange={field.handleChange}
							onBlur={field.handleBlur}
							startContent={<Globe className="h-4 w-4 text-default-foreground/50" />}
							labelPlacement="outside"
						/>
					)}
				</form.Field>
			</div>

			<Divider />

			{/* Address */}
			<div className="space-y-4">
				<div className="flex items-center gap-2">
					<MapPin className="h-5 w-5 text-primary" />
					<h3 className="text-lg font-semibold text-foreground">
						Endereço
					</h3>
				</div>

				<form.Field name="address">
					{(field) => (
						<Input
							label="Endereço"
							placeholder="Rua, número, complemento"
							value={field.state.value}
							onValueChange={field.handleChange}
							onBlur={field.handleBlur}
							labelPlacement="outside"
						/>
					)}
				</form.Field>

				<div className="grid gap-4 sm:grid-cols-3">
					<form.Field name="city">
						{(field) => (
							<Input
								label="Cidade"
								placeholder="São Paulo"
								value={field.state.value}
								onValueChange={field.handleChange}
								onBlur={field.handleBlur}
								labelPlacement="outside"
							/>
						)}
					</form.Field>

					<form.Field name="state">
						{(field) => (
							form.getFieldValue("country") === "Brasil" ? (
								<Select
									label="Estado"
									placeholder="Selecione"
									selectedKeys={field.state.value ? [field.state.value] : []}
									onSelectionChange={(keys) =>
										field.handleChange(Array.from(keys)[0] as string)
									}
									labelPlacement="outside"
								>
									{BRAZILIAN_STATES.map((state) => (
										<SelectItem key={state.value}>{state.label}</SelectItem>
									))}
								</Select>
							) : (
								<Input
									label="Estado / Província"
									placeholder="Ex: California"
									value={field.state.value}
									onValueChange={field.handleChange}
									onBlur={field.handleBlur}
									labelPlacement="outside"
								/>
							)
						)}
					</form.Field>

					<form.Field name="postalCode">
						{(field) => (
							<Input
								label="CEP"
								placeholder="00000-000"
								value={field.state.value}
								onValueChange={(value) => field.handleChange(formatCEP(value))}
								onBlur={field.handleBlur}
								maxLength={9}
								labelPlacement="outside"
							/>
						)}
					</form.Field>
				</div>
			</div>

			{/* Submit */}
			<div className="flex justify-end border-t border-default-200 pt-6">
				<Button
					type="submit"
					color="primary"
					startContent={<Save className="h-4 w-4" />}
					isLoading={isUpdating}
				>
					Salvar Alterações
				</Button>
			</div>
		</form>
	);
}

// Formatting helpers
function formatCNPJ(value: string): string {
	const cleaned = value.replace(/\D/g, "").slice(0, 14);
	return cleaned
		.replace(/^(\d{2})(\d)/, "$1.$2")
		.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
		.replace(/\.(\d{3})(\d)/, ".$1/$2")
		.replace(/(\d{4})(\d)/, "$1-$2");
}

function formatCEP(value: string): string {
	const cleaned = value.replace(/\D/g, "").slice(0, 8);
	return cleaned.replace(/^(\d{5})(\d)/, "$1-$2");
}

function formatPhone(value: string): string {
	const cleaned = value.replace(/\D/g, "").slice(0, 11);
	if (cleaned.length <= 10) {
		return cleaned
			.replace(/^(\d{2})(\d)/, "($1) $2")
			.replace(/(\d{4})(\d)/, "$1-$2");
	}
	return cleaned
		.replace(/^(\d{2})(\d)/, "($1) $2")
		.replace(/(\d{5})(\d)/, "$1-$2");
}
