import {
	Button,
	Divider,
	Input,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
} from "@heroui/react";
import { Calendar, DollarSign, RefreshCw } from "lucide-react";
import { useState } from "react";
import type { LeaseData } from "./types";
import { formatTenantName, getPropertyName } from "./types";

interface LeaseRenewModalProps {
	isOpen: boolean;
	onClose: () => void;
	lease: LeaseData | null;
	onConfirm: (data: { newEndDate: string; newRentAmount?: number }) => void;
	isLoading?: boolean;
}

export function LeaseRenewModal({
	isOpen,
	onClose,
	lease,
	onConfirm,
	isLoading,
}: LeaseRenewModalProps) {
	const [newEndDate, setNewEndDate] = useState("");
	const [newRentAmount, setNewRentAmount] = useState("");
	const [adjustRent, setAdjustRent] = useState(false);

	// Calculate suggested end date (1 year from current end date or today)
	const suggestEndDate = () => {
		const baseDate = lease?.endDate ? new Date(lease.endDate) : new Date();
		baseDate.setFullYear(baseDate.getFullYear() + 1);
		return baseDate.toISOString().split("T")[0];
	};

	const handleOpen = () => {
		setNewEndDate(suggestEndDate());
		setNewRentAmount(lease ? String(lease.rentAmount) : "");
		setAdjustRent(false);
	};

	const handleConfirm = () => {
		if (!newEndDate) return;
		onConfirm({
			newEndDate,
			newRentAmount:
				adjustRent && newRentAmount ? Number(newRentAmount) : undefined,
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
			size="lg"
		>
			<ModalContent>
				<ModalHeader className="flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100">
						<RefreshCw className="h-5 w-5 text-primary" />
					</div>
					<div>
						<h3 className="font-semibold text-lg">Renovar Contrato</h3>
						<p className="font-normal text-gray-500 text-sm">
							{getPropertyName(lease)}
						</p>
					</div>
				</ModalHeader>

				<ModalBody>
					{/* Current lease info */}
					<div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
						<h4 className="mb-3 font-medium text-gray-700 text-sm">
							Contrato Atual
						</h4>
						<div className="grid grid-cols-2 gap-4 text-sm">
							<div>
								<span className="text-gray-500">Inquilino:</span>
								<p className="font-medium">
									{formatTenantName(lease.tenantContact)}
								</p>
							</div>
							<div>
								<span className="text-gray-500">Aluguel Atual:</span>
								<p className="font-medium">
									{formatCurrency(Number(lease.rentAmount))}
								</p>
							</div>
							<div>
								<span className="text-gray-500">Início:</span>
								<p className="font-medium">
									{new Date(lease.startDate).toLocaleDateString("pt-BR")}
								</p>
							</div>
							<div>
								<span className="text-gray-500">Término:</span>
								<p className="font-medium">
									{lease.endDate
										? new Date(lease.endDate).toLocaleDateString("pt-BR")
										: "Indeterminado"}
								</p>
							</div>
						</div>
					</div>

					<Divider className="my-4" />

					{/* New lease terms */}
					<div className="space-y-4">
						<h4 className="font-medium text-gray-700 text-sm">Novos Termos</h4>

						<Input
							type="date"
							label="Nova Data de Término"
							value={newEndDate}
							onValueChange={setNewEndDate}
							startContent={<Calendar className="h-4 w-4 text-gray-400" />}
							isRequired
						/>

						<div className="flex items-center gap-2">
							<input
								type="checkbox"
								id="adjustRent"
								checked={adjustRent}
								onChange={(e) => setAdjustRent(e.target.checked)}
								className="rounded border-gray-300"
							/>
							<label htmlFor="adjustRent" className="text-gray-700 text-sm">
								Ajustar valor do aluguel
							</label>
						</div>

						{adjustRent && (
							<Input
								type="number"
								label="Novo Valor do Aluguel"
								value={newRentAmount}
								onValueChange={setNewRentAmount}
								startContent={<DollarSign className="h-4 w-4 text-gray-400" />}
								description={`Valor atual: ${formatCurrency(Number(lease.rentAmount))}`}
							/>
						)}
					</div>

					{/* Summary */}
					{newEndDate && (
						<div className="mt-4 rounded-lg border border-primary-200 bg-primary-50 p-4">
							<h4 className="mb-2 font-medium text-primary-700 text-sm">
								Resumo da Renovação
							</h4>
							<div className="space-y-1 text-sm">
								<p>
									<span className="text-primary-600">Novo término:</span>{" "}
									<span className="font-medium">
										{new Date(newEndDate).toLocaleDateString("pt-BR")}
									</span>
								</p>
								{adjustRent && newRentAmount && (
									<p>
										<span className="text-primary-600">Novo aluguel:</span>{" "}
										<span className="font-medium">
											{formatCurrency(Number(newRentAmount))}
										</span>
										{Number(newRentAmount) > Number(lease.rentAmount) && (
											<span className="ml-2 text-green-600 text-xs">
												(+
												{(
													(Number(newRentAmount) / Number(lease.rentAmount) -
														1) *
													100
												).toFixed(1)}
												%)
											</span>
										)}
									</p>
								)}
							</div>
						</div>
					)}
				</ModalBody>

				<ModalFooter>
					<Button variant="light" onPress={onClose}>
						Cancelar
					</Button>
					<Button
						color="primary"
						startContent={<RefreshCw className="h-4 w-4" />}
						onPress={handleConfirm}
						isLoading={isLoading}
						isDisabled={!newEndDate}
					>
						Renovar Contrato
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}
