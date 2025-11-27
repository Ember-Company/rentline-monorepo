import {
	Button,
	Card,
	CardBody,
	CardHeader,
	Chip,
	Spinner,
} from "@heroui/react";
import {
	ArrowDownRight,
	ArrowUpRight,
	CreditCard,
	MoreHorizontal,
	Plus,
} from "lucide-react";
import type { PaymentData, PaymentType } from "../types";
import { paymentTypeConfig } from "../types";

interface LeasePaymentsProps {
	payments: PaymentData[];
	isLoading?: boolean;
	onAddPayment: () => void;
}

export function LeasePayments({
	payments,
	isLoading,
	onAddPayment,
}: LeasePaymentsProps) {
	const formatCurrency = (value: number) =>
		new Intl.NumberFormat("pt-BR", {
			style: "currency",
			currency: "BRL",
		}).format(value);

	const formatDate = (date: string) =>
		new Date(date).toLocaleDateString("pt-BR", {
			day: "2-digit",
			month: "short",
			year: "numeric",
		});

	// Calculate totals
	const totalReceived = payments
		.filter((p) => p.status === "completed" && p.type !== "refund")
		.reduce((sum, p) => sum + Number(p.amount), 0);

	const totalRefunded = payments
		.filter((p) => p.type === "refund")
		.reduce((sum, p) => sum + Number(p.amount), 0);

	const getPaymentIcon = (type: PaymentType) => {
		if (type === "refund")
			return <ArrowDownRight className="h-4 w-4 text-red-500" />;
		return <ArrowUpRight className="h-4 w-4 text-green-500" />;
	};

	if (isLoading) {
		return (
			<Card className="border border-gray-200 shadow-sm">
				<CardBody className="flex h-64 items-center justify-center">
					<Spinner size="lg" />
				</CardBody>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			{/* Summary */}
			<div className="grid gap-4 sm:grid-cols-2">
				<Card className="border border-gray-200 bg-green-50 shadow-sm">
					<CardBody className="p-4">
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
								<ArrowUpRight className="h-5 w-5 text-green-600" />
							</div>
							<div>
								<p className="text-green-700 text-sm">Total Recebido</p>
								<p className="font-bold text-green-800 text-xl">
									{formatCurrency(totalReceived)}
								</p>
							</div>
						</div>
					</CardBody>
				</Card>
				<Card className="border border-gray-200 bg-red-50 shadow-sm">
					<CardBody className="p-4">
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
								<ArrowDownRight className="h-5 w-5 text-red-600" />
							</div>
							<div>
								<p className="text-red-700 text-sm">Total Reembolsado</p>
								<p className="font-bold text-red-800 text-xl">
									{formatCurrency(totalRefunded)}
								</p>
							</div>
						</div>
					</CardBody>
				</Card>
			</div>

			{/* Payments List */}
			<Card className="border border-gray-200 shadow-sm">
				<CardHeader className="flex items-center justify-between border-gray-100 border-b bg-gray-50/50 px-6 py-4">
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100">
							<CreditCard className="h-5 w-5 text-primary" />
						</div>
						<div>
							<h3 className="font-semibold text-gray-900 text-lg">
								Histórico de Pagamentos
							</h3>
							<p className="text-gray-500 text-sm">
								{payments.length} pagamento(s)
							</p>
						</div>
					</div>
					<Button
						color="primary"
						variant="flat"
						size="sm"
						startContent={<Plus className="h-4 w-4" />}
						onPress={onAddPayment}
					>
						Registrar Pagamento
					</Button>
				</CardHeader>

				{payments.length === 0 ? (
					<CardBody className="py-12 text-center">
						<CreditCard className="mx-auto mb-4 h-12 w-12 text-gray-400" />
						<p className="font-medium text-gray-600 text-lg">
							Nenhum pagamento registrado
						</p>
						<p className="text-gray-500 text-sm">
							Registre pagamentos recebidos do inquilino
						</p>
					</CardBody>
				) : (
					<CardBody className="p-0">
						<div className="divide-y divide-gray-100">
							{payments.map((payment) => {
								const typeConfig =
									paymentTypeConfig[payment.type as PaymentType];
								const isRefund = payment.type === "refund";

								return (
									<div
										key={payment.id}
										className="flex items-center justify-between p-4 hover:bg-gray-50"
									>
										<div className="flex items-center gap-4">
											{getPaymentIcon(payment.type as PaymentType)}
											<div>
												<p className="font-medium text-gray-900">
													{typeConfig?.label || payment.type}
												</p>
												<p className="text-gray-500 text-sm">
													{formatDate(payment.date)}
													{payment.reference && ` • Ref: ${payment.reference}`}
												</p>
												{payment.periodStart && payment.periodEnd && (
													<p className="text-gray-400 text-xs">
														Período: {formatDate(payment.periodStart)} -{" "}
														{formatDate(payment.periodEnd)}
													</p>
												)}
											</div>
										</div>
										<div className="flex items-center gap-3">
											<div className="text-right">
												<p
													className={`font-semibold ${isRefund ? "text-red-600" : "text-green-600"}`}
												>
													{isRefund ? "-" : "+"}
													{formatCurrency(Number(payment.amount))}
												</p>
												<Chip
													size="sm"
													color={
														payment.status === "completed"
															? "success"
															: "warning"
													}
													variant="flat"
												>
													{payment.status === "completed"
														? "Confirmado"
														: "Pendente"}
												</Chip>
											</div>
											<Button variant="light" isIconOnly size="sm">
												<MoreHorizontal className="h-4 w-4" />
											</Button>
										</div>
									</div>
								);
							})}
						</div>
					</CardBody>
				)}
			</Card>
		</div>
	);
}
