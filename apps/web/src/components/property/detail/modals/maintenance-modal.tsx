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
import { useState } from "react";
import { toast } from "sonner";
import type { Unit } from "../types";

interface MaintenanceModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (data: MaintenanceFormData) => void;
	isLoading: boolean;
	units: Unit[];
}

export interface MaintenanceFormData {
	unitId?: string;
	title: string;
	description?: string;
	priority: "low" | "medium" | "high" | "urgent";
}

export function MaintenanceModal({
	isOpen,
	onClose,
	onSubmit,
	isLoading,
	units,
}: MaintenanceModalProps) {
	return (
		<Modal isOpen={isOpen} onClose={onClose} size="lg">
			<ModalContent>
				{(onModalClose) => (
					<MaintenanceForm
						onClose={onModalClose}
						onSubmit={onSubmit}
						isLoading={isLoading}
						units={units}
					/>
				)}
			</ModalContent>
		</Modal>
	);
}

interface MaintenanceFormProps {
	onClose: () => void;
	onSubmit: (data: MaintenanceFormData) => void;
	isLoading: boolean;
	units: Unit[];
}

function MaintenanceForm({
	onClose,
	onSubmit,
	isLoading,
	units,
}: MaintenanceFormProps) {
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [priority, setPriority] = useState("medium");
	const [unitId, setUnitId] = useState("");

	const handleSubmit = () => {
		if (!title) {
			toast.error("Informe o título da solicitação");
			return;
		}

		onSubmit({
			unitId: unitId || units[0]?.id,
			title,
			description: description || undefined,
			priority: priority as MaintenanceFormData["priority"],
		});
	};

	return (
		<>
			<ModalHeader>Nova Solicitação de Manutenção</ModalHeader>
			<ModalBody>
				<div className="space-y-4">
					<Input
						label="Título"
						placeholder="Descrição breve do problema"
						value={title}
						onValueChange={setTitle}
						isRequired
					/>
					<Textarea
						label="Descrição"
						placeholder="Detalhes sobre o problema..."
						value={description}
						onValueChange={setDescription}
						minRows={3}
					/>
					<Select
						label="Prioridade"
						selectedKeys={[priority]}
						onSelectionChange={(keys) =>
							setPriority(Array.from(keys)[0] as string)
						}
					>
						<SelectItem key="low">Baixa</SelectItem>
						<SelectItem key="medium">Média</SelectItem>
						<SelectItem key="high">Alta</SelectItem>
						<SelectItem key="urgent">Urgente</SelectItem>
					</Select>
					{units.length > 0 && (
						<Select
							label="Unidade"
							placeholder="Selecione a unidade"
							selectedKeys={unitId ? [unitId] : []}
							onSelectionChange={(keys) =>
								setUnitId(Array.from(keys)[0] as string)
							}
						>
							{units.map((u) => (
								<SelectItem key={u.id}>
									{u.name || `Unidade ${u.unitNumber}`}
								</SelectItem>
							))}
						</Select>
					)}
				</div>
			</ModalBody>
			<ModalFooter>
				<Button variant="light" onPress={onClose}>
					Cancelar
				</Button>
				<Button color="primary" isLoading={isLoading} onPress={handleSubmit}>
					Criar Solicitação
				</Button>
			</ModalFooter>
		</>
	);
}
