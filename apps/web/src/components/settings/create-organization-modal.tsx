import {
	Button,
	Input,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	Select,
	SelectItem,
} from "@heroui/react";
import { useForm } from "@tanstack/react-form";
import { Building2, MapPin } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import z from "zod";
import { BRAZILIAN_STATES } from "@/lib/constants/brazil";
import { useOrganizations } from "@/hooks/use-organization-management";

interface CreateOrganizationModalProps {
	isOpen: boolean;
	onClose: () => void;
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

export function CreateOrganizationModal({
	isOpen,
	onClose,
}: CreateOrganizationModalProps) {
	const navigate = useNavigate();
	const { createOrganization, isCreating } = useOrganizations();

	const form = useForm({
		defaultValues: {
			name: "",
			slug: "",
			city: "",
			state: "",
		},
		onSubmit: async ({ value }) => {
			try {
				await createOrganization({
					name: value.name,
					slug: value.slug,
					city: value.city,
					state: value.state,
					country: "Brasil",
					type: "landlord",
				});

				toast.success("Organização criada com sucesso!");
				form.reset();
				onClose();
			} catch (error) {
				toast.error(
					error instanceof Error ? error.message : "Erro ao criar organização"
				);
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

	const handleClose = () => {
		form.reset();
		onClose();
	};

	return (
		<Modal isOpen={isOpen} onClose={handleClose} size="2xl" scrollBehavior="inside">
			<ModalContent>
				<ModalHeader className="flex items-center gap-2">
					<Building2 className="h-5 w-5 text-primary" />
					Criar Nova Organização
				</ModalHeader>
				<ModalBody>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							e.stopPropagation();
							form.handleSubmit();
						}}
						className="space-y-4"
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
					</form>
				</ModalBody>
				<ModalFooter>
					<Button variant="light" onPress={handleClose}>
						Cancelar
					</Button>
					<form.Subscribe>
						{(state) => (
							<Button
								color="primary"
								onPress={() => form.handleSubmit()}
								isDisabled={!state.canSubmit}
								isLoading={isCreating}
							>
								Criar Organização
							</Button>
						)}
					</form.Subscribe>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}

