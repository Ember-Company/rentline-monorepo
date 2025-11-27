import {
	Button,
	Divider,
	Input,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	Textarea,
} from "@heroui/react";
import { Calendar, Plus, Receipt, Trash2 } from "lucide-react";
import { useState } from "react";
import type { LeaseData } from "./types";
import { getPropertyName } from "./types";

interface LineItem {
	description: string;
	amount: number;
	quantity: number;
}

interface InvoiceModalProps {
	isOpen: boolean;
	onClose: () => void;
	lease: LeaseData | null;
	onConfirm: (data: {
		dueDate: string;
		amount: number;
		lineItems: LineItem[];
		notes?: string;
	}) => void;
	isLoading?: boolean;
}

export function InvoiceModal({
	isOpen,
	onClose,
	lease,
	onConfirm,
	isLoading,
}: InvoiceModalProps) {
	const [dueDate, setDueDate] = useState("");
	const [lineItems, setLineItems] = useState<LineItem[]>([
		{ description: "Aluguel Mensal", amount: 0, quantity: 1 },
	]);
	const [notes, setNotes] = useState("");

	const handleOpen = () => {
		// Set due date to next payment due day
		const now = new Date();
		const dueDay = lease?.paymentDueDay || 1;
		let nextDue = new Date(now.getFullYear(), now.getMonth(), dueDay);
		if (nextDue <= now) {
			nextDue = new Date(now.getFullYear(), now.getMonth() + 1, dueDay);
		}
		setDueDate(nextDue.toISOString().split("T")[0]);
		setLineItems([
			{
				description: "Aluguel Mensal",
				amount: lease ? Number(lease.rentAmount) : 0,
				quantity: 1,
			},
		]);
		setNotes("");
	};

	const addLineItem = () => {
		setLineItems([...lineItems, { description: "", amount: 0, quantity: 1 }]);
	};

	const removeLineItem = (index: number) => {
		if (lineItems.length > 1) {
			setLineItems(lineItems.filter((_, i) => i !== index));
		}
	};

	const updateLineItem = (
		index: number,
		field: keyof LineItem,
		value: string | number,
	) => {
		const updated = [...lineItems];
		updated[index] = { ...updated[index], [field]: value };
		setLineItems(updated);
	};

	const totalAmount = lineItems.reduce(
		(sum, item) => sum + item.amount * item.quantity,
		0,
	);

	const handleConfirm = () => {
		if (!dueDate || totalAmount <= 0) return;
		onConfirm({
			dueDate,
			amount: totalAmount,
			lineItems,
			notes: notes || undefined,
		});
	};

	const formatCurrency = (value: number) =>
		new Intl.NumberFormat("pt-BR", {
			style: "currency",
			currency: "BRL",
		}).format(value);

	if (!lease) return null;

	return (
		<Modal
			isOpen={isOpen}
			onOpenChange={(open) => {
				if (open) handleOpen();
				if (!open) onClose();
			}}
			size="2xl"
		>
			<ModalContent>
				<ModalHeader className="flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
						<Receipt className="h-5 w-5 text-blue-600" />
					</div>
					<div>
						<h3 className="font-semibold text-lg">Criar Cobrança</h3>
						<p className="font-normal text-gray-500 text-sm">
							{getPropertyName(lease)}
						</p>
					</div>
				</ModalHeader>

				<ModalBody>
					{/* Due date */}
					<Input
						type="date"
						label="Data de Vencimento"
						value={dueDate}
						onValueChange={setDueDate}
						startContent={<Calendar className="h-4 w-4 text-gray-400" />}
						isRequired
					/>

					<Divider className="my-4" />

					{/* Line items */}
					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<h4 className="font-medium text-gray-700 text-sm">
								Itens da Cobrança
							</h4>
							<Button
								size="sm"
								variant="light"
								startContent={<Plus className="h-4 w-4" />}
								onPress={addLineItem}
							>
								Adicionar Item
							</Button>
						</div>

						{lineItems.map((item, index) => (
							<div
								key={index}
								className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3"
							>
								<div className="flex-1 space-y-3">
									<Input
										size="sm"
										label="Descrição"
										value={item.description}
										onValueChange={(v) =>
											updateLineItem(index, "description", v)
										}
									/>
									<div className="grid grid-cols-2 gap-3">
										<Input
											size="sm"
											type="number"
											label="Valor"
											value={String(item.amount)}
											onValueChange={(v) =>
												updateLineItem(index, "amount", Number(v))
											}
											startContent={
												<span className="text-gray-400 text-xs">R$</span>
											}
										/>
										<Input
											size="sm"
											type="number"
											label="Quantidade"
											value={String(item.quantity)}
											onValueChange={(v) =>
												updateLineItem(index, "quantity", Number(v))
											}
										/>
									</div>
								</div>
								{lineItems.length > 1 && (
									<Button
										isIconOnly
										size="sm"
										variant="light"
										color="danger"
										onPress={() => removeLineItem(index)}
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								)}
							</div>
						))}
					</div>

					{/* Total */}
					<div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
						<div className="flex items-center justify-between">
							<span className="font-medium text-gray-700">Total</span>
							<span className="font-bold text-gray-900 text-xl">
								{formatCurrency(totalAmount)}
							</span>
						</div>
					</div>

					{/* Notes */}
					<Textarea
						label="Observações"
						placeholder="Observações adicionais para a cobrança..."
						value={notes}
						onValueChange={setNotes}
						minRows={2}
					/>
				</ModalBody>

				<ModalFooter>
					<Button variant="light" onPress={onClose}>
						Cancelar
					</Button>
					<Button
						color="primary"
						startContent={<Receipt className="h-4 w-4" />}
						onPress={handleConfirm}
						isLoading={isLoading}
						isDisabled={!dueDate || totalAmount <= 0}
					>
						Criar Cobrança
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}
