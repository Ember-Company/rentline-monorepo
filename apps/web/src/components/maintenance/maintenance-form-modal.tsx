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
	Textarea,
} from "@heroui/react";
import { useForm } from "@tanstack/react-form";
import z from "zod";
import { Label } from "@/components/ui/label";
import { properties } from "@/lib/mock-data/properties";
import type { MaintenanceRequest } from "./types";

interface MaintenanceFormModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (data: FormData) => void;
	selectedRequest?: MaintenanceRequest | null;
}

export interface FormData {
	propertyId: string;
	unit: string;
	issue: string;
	description: string;
	priority: MaintenanceRequest["priority"];
	status: MaintenanceRequest["status"];
	assignedTo: string;
	estimatedCost: string;
}

export function MaintenanceFormModal({
	isOpen,
	onClose,
	onSubmit,
	selectedRequest,
}: MaintenanceFormModalProps) {
	const form = useForm({
		defaultValues: {
			propertyId: selectedRequest?.propertyId.toString() || "",
			unit: selectedRequest?.unit || "",
			issue: selectedRequest?.issue || "",
			description: selectedRequest?.description || "",
			priority:
				selectedRequest?.priority ||
				("medium" as MaintenanceRequest["priority"]),
			status:
				selectedRequest?.status || ("pending" as MaintenanceRequest["status"]),
			assignedTo: selectedRequest?.assignedTo || "",
			estimatedCost: selectedRequest?.estimatedCost?.toString() || "",
		},
		onSubmit: async ({ value }) => {
			onSubmit(value);
			form.reset();
		},
		validators: {
			onSubmit: z.object({
				propertyId: z.string().min(1, "Imóvel é obrigatório"),
				issue: z.string().min(1, "Título é obrigatório"),
				description: z.string().min(1, "Descrição é obrigatória"),
				priority: z.enum(["low", "medium", "high", "urgent"]),
				status: z.enum(["pending", "in-progress", "completed", "cancelled"]),
			}),
		},
	});

	const handleClose = () => {
		form.reset();
		onClose();
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleClose}
			size="2xl"
			classNames={{ backdrop: "bg-black/50" }}
		>
			<ModalContent>
				<ModalHeader className="border-gray-200 border-b pb-4">
					<div>
						<h2 className="font-bold text-gray-900 text-xl">
							{selectedRequest
								? "Editar Solicitação"
								: "Nova Solicitação de Manutenção"}
						</h2>
						<p className="mt-1 text-gray-500 text-sm">
							{selectedRequest
								? "Atualize os detalhes da solicitação"
								: "Crie uma nova solicitação de manutenção"}
						</p>
					</div>
				</ModalHeader>
				<ModalBody className="py-6">
					<form
						onSubmit={(e) => {
							e.preventDefault();
							form.handleSubmit();
						}}
						className="space-y-4"
					>
						<div className="grid grid-cols-2 gap-4">
							<form.Field name="propertyId">
								{(field) => (
									<div className="space-y-2">
										<Label htmlFor={field.name}>Imóvel *</Label>
										<Select
											selectedKeys={
												field.state.value ? [field.state.value] : []
											}
											onSelectionChange={(keys) =>
												field.handleChange(Array.from(keys)[0] as string)
											}
											placeholder="Selecione o imóvel"
											classNames={{ trigger: "border-gray-200" }}
										>
											{properties.map((property) => (
												<SelectItem key={property.id.toString()}>
													{property.address}
												</SelectItem>
											))}
										</Select>
										{field.state.meta.errors.map((error) => (
											<p key={error?.message} className="text-danger text-sm">
												{error?.message}
											</p>
										))}
									</div>
								)}
							</form.Field>

							<form.Field name="unit">
								{(field) => (
									<div className="space-y-2">
										<Label htmlFor={field.name}>Unidade</Label>
										<Input
											id={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onValueChange={(e) => field.handleChange(e)}
											placeholder="Ex: Apto 101"
											classNames={{ inputWrapper: "border-gray-200" }}
										/>
									</div>
								)}
							</form.Field>
						</div>

						<form.Field name="issue">
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>Título *</Label>
									<Input
										id={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onValueChange={(e) => field.handleChange(e)}
										placeholder="Descrição breve do problema"
										classNames={{ inputWrapper: "border-gray-200" }}
									/>
									{field.state.meta.errors.map((error) => (
										<p key={error?.message} className="text-danger text-sm">
											{error?.message}
										</p>
									))}
								</div>
							)}
						</form.Field>

						<form.Field name="description">
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>Descrição *</Label>
									<Textarea
										id={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onValueChange={(e) => field.handleChange(e)}
										placeholder="Descrição detalhada do problema..."
										minRows={3}
										classNames={{ inputWrapper: "border-gray-200" }}
									/>
									{field.state.meta.errors.map((error) => (
										<p key={error?.message} className="text-danger text-sm">
											{error?.message}
										</p>
									))}
								</div>
							)}
						</form.Field>

						<div className="grid grid-cols-2 gap-4">
							<form.Field name="priority">
								{(field) => (
									<div className="space-y-2">
										<Label htmlFor={field.name}>Prioridade *</Label>
										<Select
											selectedKeys={[field.state.value]}
											onSelectionChange={(keys) =>
												field.handleChange(
													Array.from(keys)[0] as MaintenanceRequest["priority"],
												)
											}
											classNames={{ trigger: "border-gray-200" }}
										>
											<SelectItem key="low">Baixa</SelectItem>
											<SelectItem key="medium">Média</SelectItem>
											<SelectItem key="high">Alta</SelectItem>
											<SelectItem key="urgent">Urgente</SelectItem>
										</Select>
									</div>
								)}
							</form.Field>

							<form.Field name="status">
								{(field) => (
									<div className="space-y-2">
										<Label htmlFor={field.name}>Status *</Label>
										<Select
											selectedKeys={[field.state.value]}
											onSelectionChange={(keys) =>
												field.handleChange(
													Array.from(keys)[0] as MaintenanceRequest["status"],
												)
											}
											classNames={{ trigger: "border-gray-200" }}
										>
											<SelectItem key="pending">Pendente</SelectItem>
											<SelectItem key="in-progress">Em Andamento</SelectItem>
											<SelectItem key="completed">Concluído</SelectItem>
											<SelectItem key="cancelled">Cancelado</SelectItem>
										</Select>
									</div>
								)}
							</form.Field>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<form.Field name="assignedTo">
								{(field) => (
									<div className="space-y-2">
										<Label htmlFor={field.name}>Responsável</Label>
										<Input
											id={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onValueChange={(e) => field.handleChange(e)}
											placeholder="Nome do prestador"
											classNames={{ inputWrapper: "border-gray-200" }}
										/>
									</div>
								)}
							</form.Field>

							<form.Field name="estimatedCost">
								{(field) => (
									<div className="space-y-2">
										<Label htmlFor={field.name}>Custo Estimado</Label>
										<Input
											id={field.name}
											type="number"
											value={field.state.value}
											onBlur={field.handleBlur}
											onValueChange={(e) => field.handleChange(e)}
											placeholder="0,00"
											startContent={
												<span className="text-gray-500 text-sm">R$</span>
											}
											classNames={{ inputWrapper: "border-gray-200" }}
										/>
									</div>
								)}
							</form.Field>
						</div>
					</form>
				</ModalBody>
				<ModalFooter className="border-gray-200 border-t pt-4">
					<Button variant="light" onPress={handleClose}>
						Cancelar
					</Button>
					<Button
						color="primary"
						onPress={() => form.handleSubmit()}
						isLoading={form.state.isSubmitting}
					>
						{selectedRequest ? "Salvar Alterações" : "Criar Solicitação"}
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}
