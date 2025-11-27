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

interface ExpenseModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (data: ExpenseFormData) => void;
	isLoading: boolean;
}

export interface ExpenseFormData {
	amount: number;
	date: string;
	category:
		| "maintenance"
		| "utilities"
		| "tax"
		| "insurance"
		| "repairs"
		| "supplies";
	description?: string;
	vendor?: string;
}

export function ExpenseModal({
	isOpen,
	onClose,
	onSubmit,
	isLoading,
}: ExpenseModalProps) {
	return (
		<Modal isOpen={isOpen} onClose={onClose} size="lg">
			<ModalContent>
				{(onModalClose) => (
					<ExpenseForm
						onClose={onModalClose}
						onSubmit={onSubmit}
						isLoading={isLoading}
					/>
				)}
			</ModalContent>
		</Modal>
	);
}

interface ExpenseFormProps {
	onClose: () => void;
	onSubmit: (data: ExpenseFormData) => void;
	isLoading: boolean;
}

function ExpenseForm({ onClose, onSubmit, isLoading }: ExpenseFormProps) {
	const [amount, setAmount] = useState("");
	const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
	const [category, setCategory] = useState("maintenance");
	const [description, setDescription] = useState("");
	const [vendor, setVendor] = useState("");

	const handleSubmit = () => {
		if (!amount) {
			toast.error("Preencha o valor da despesa");
			return;
		}

		onSubmit({
			amount: Number(amount),
			date,
			category: category as ExpenseFormData["category"],
			description: description || undefined,
			vendor: vendor || undefined,
		});
	};

	return (
		<>
			<ModalHeader>Registrar Despesa</ModalHeader>
			<ModalBody>
				<div className="space-y-4">
					<Input
						label="Valor"
						type="number"
						placeholder="0,00"
						value={amount}
						onValueChange={setAmount}
						startContent="R$"
					/>
					<Input
						label="Data"
						type="date"
						value={date}
						onValueChange={setDate}
					/>
					<Select
						label="Categoria"
						selectedKeys={[category]}
						onSelectionChange={(keys) =>
							setCategory(Array.from(keys)[0] as string)
						}
					>
						<SelectItem key="maintenance">Manutenção</SelectItem>
						<SelectItem key="utilities">Utilidades</SelectItem>
						<SelectItem key="tax">Impostos</SelectItem>
						<SelectItem key="insurance">Seguro</SelectItem>
						<SelectItem key="repairs">Reparos</SelectItem>
						<SelectItem key="supplies">Suprimentos</SelectItem>
					</Select>
					<Input
						label="Fornecedor"
						placeholder="Nome do fornecedor"
						value={vendor}
						onValueChange={setVendor}
					/>
					<Textarea
						label="Descrição"
						placeholder="Descrição da despesa..."
						value={description}
						onValueChange={setDescription}
					/>
				</div>
			</ModalBody>
			<ModalFooter>
				<Button variant="light" onPress={onClose}>
					Cancelar
				</Button>
				<Button color="danger" isLoading={isLoading} onPress={handleSubmit}>
					Registrar
				</Button>
			</ModalFooter>
		</>
	);
}
