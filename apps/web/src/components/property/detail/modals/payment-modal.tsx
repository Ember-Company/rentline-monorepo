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
import type { Lease } from "../types";

interface PaymentModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (data: PaymentFormData) => void;
	isLoading: boolean;
	leases: Lease[];
	selectedLeaseId?: string | null;
}

export interface PaymentFormData {
	leaseId: string;
	amount: number;
	date: string;
	type: "rent" | "deposit" | "fee" | "other";
	notes?: string;
}

export function PaymentModal({
	isOpen,
	onClose,
	onSubmit,
	isLoading,
	leases,
	selectedLeaseId,
}: PaymentModalProps) {
	return (
		<Modal isOpen={isOpen} onClose={onClose} size="lg">
			<ModalContent>
				{(onModalClose) => (
					<PaymentForm
						onClose={onModalClose}
						onSubmit={onSubmit}
						isLoading={isLoading}
						leases={leases}
						selectedLeaseId={selectedLeaseId}
					/>
				)}
			</ModalContent>
		</Modal>
	);
}

interface PaymentFormProps {
	onClose: () => void;
	onSubmit: (data: PaymentFormData) => void;
	isLoading: boolean;
	leases: Lease[];
	selectedLeaseId?: string | null;
}

function PaymentForm({
	onClose,
	onSubmit,
	isLoading,
	leases,
	selectedLeaseId,
}: PaymentFormProps) {
	const [amount, setAmount] = useState("");
	const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
	const [type, setType] = useState("rent");
	const [notes, setNotes] = useState("");

	const activeLease = leases.find((l) => l.status === "active") || leases[0];

	const handleSubmit = () => {
		if (!amount || !activeLease) {
			toast.error("Preencha todos os campos obrigatórios");
			return;
		}

		onSubmit({
			leaseId: selectedLeaseId || activeLease.id,
			amount: Number(amount),
			date,
			type: type as PaymentFormData["type"],
			notes: notes || undefined,
		});
	};

	return (
		<>
			<ModalHeader>Registrar Pagamento</ModalHeader>
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
						label="Tipo"
						selectedKeys={[type]}
						onSelectionChange={(keys) => setType(Array.from(keys)[0] as string)}
					>
						<SelectItem key="rent">Aluguel</SelectItem>
						<SelectItem key="deposit">Depósito</SelectItem>
						<SelectItem key="fee">Taxa</SelectItem>
						<SelectItem key="other">Outro</SelectItem>
					</Select>
					<Textarea
						label="Observações"
						placeholder="Observações sobre o pagamento..."
						value={notes}
						onValueChange={setNotes}
					/>
				</div>
			</ModalBody>
			<ModalFooter>
				<Button variant="light" onPress={onClose}>
					Cancelar
				</Button>
				<Button color="primary" isLoading={isLoading} onPress={handleSubmit}>
					Registrar
				</Button>
			</ModalFooter>
		</>
	);
}
