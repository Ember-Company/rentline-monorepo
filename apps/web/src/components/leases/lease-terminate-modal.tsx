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
import { AlertTriangle, Calendar, XCircle } from "lucide-react";
import { useState } from "react";
import type { LeaseData } from "./types";
import { formatTenantName, getPropertyName } from "./types";

interface LeaseTerminateModalProps {
	isOpen: boolean;
	onClose: () => void;
	lease: LeaseData | null;
	onConfirm: (data: { moveOutDate?: string; reason?: string }) => void;
	isLoading?: boolean;
}

export function LeaseTerminateModal({
	isOpen,
	onClose,
	lease,
	onConfirm,
	isLoading,
}: LeaseTerminateModalProps) {
	const [moveOutDate, setMoveOutDate] = useState("");
	const [reason, setReason] = useState("");

	const handleOpen = () => {
		setMoveOutDate(new Date().toISOString().split("T")[0]);
		setReason("");
	};

	const handleConfirm = () => {
		onConfirm({
			moveOutDate: moveOutDate || undefined,
			reason: reason || undefined,
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
					<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning-100">
						<XCircle className="h-5 w-5 text-warning" />
					</div>
					<div>
						<h3 className="font-semibold text-lg">Encerrar Contrato</h3>
						<p className="font-normal text-gray-500 text-sm">
							{getPropertyName(lease)}
						</p>
					</div>
				</ModalHeader>

				<ModalBody>
					{/* Warning */}
					<div className="flex items-start gap-3 rounded-lg border border-warning-200 bg-warning-50 p-4">
						<AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-warning" />
						<div className="text-sm">
							<p className="font-medium text-warning-800">Atenção</p>
							<p className="text-warning-700">
								Esta ação encerrará o contrato permanentemente. O inquilino será
								notificado e a unidade ficará disponível para novos contratos.
							</p>
						</div>
					</div>

					{/* Current lease info */}
					<div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
						<h4 className="mb-3 font-medium text-gray-700 text-sm">
							Informações do Contrato
						</h4>
						<div className="grid grid-cols-2 gap-4 text-sm">
							<div>
								<span className="text-gray-500">Inquilino:</span>
								<p className="font-medium">
									{formatTenantName(lease.tenantContact)}
								</p>
							</div>
							<div>
								<span className="text-gray-500">Aluguel:</span>
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
								<span className="text-gray-500">Término Previsto:</span>
								<p className="font-medium">
									{lease.endDate
										? new Date(lease.endDate).toLocaleDateString("pt-BR")
										: "Indeterminado"}
								</p>
							</div>
						</div>
					</div>

					<Divider className="my-4" />

					{/* Termination details */}
					<div className="space-y-4">
						<h4 className="font-medium text-gray-700 text-sm">
							Detalhes do Encerramento
						</h4>

						<Input
							type="date"
							label="Data de Desocupação"
							value={moveOutDate}
							onValueChange={setMoveOutDate}
							startContent={<Calendar className="h-4 w-4 text-gray-400" />}
							description="Data em que o inquilino deve desocupar o imóvel"
						/>

						<Textarea
							label="Motivo do Encerramento"
							placeholder="Descreva o motivo do encerramento do contrato..."
							value={reason}
							onValueChange={setReason}
							minRows={3}
						/>
					</div>
				</ModalBody>

				<ModalFooter>
					<Button variant="light" onPress={onClose}>
						Cancelar
					</Button>
					<Button
						color="warning"
						startContent={<XCircle className="h-4 w-4" />}
						onPress={handleConfirm}
						isLoading={isLoading}
					>
						Encerrar Contrato
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}
