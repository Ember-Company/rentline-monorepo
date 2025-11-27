import {
	Button,
	Card,
	CardBody,
	CardHeader,
	Chip,
	Progress,
} from "@heroui/react";
import { AlertTriangle, Calendar, Check, Clock, Receipt } from "lucide-react";
import type { InvoiceData, LeaseData } from "../types";
import { invoiceStatusConfig } from "../types";

interface LeaseRentScheduleProps {
	lease: LeaseData;
	invoices: InvoiceData[];
	onGenerateInvoices: () => void;
	onMarkAsPaid: (invoiceId: string) => void;
	isGenerating?: boolean;
}

export function LeaseRentSchedule({
	lease,
	invoices,
	onGenerateInvoices,
	onMarkAsPaid,
	isGenerating,
}: LeaseRentScheduleProps) {
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

	// Calculate stats
	const totalExpected = invoices.reduce(
		(sum, inv) => sum + Number(inv.amount),
		0,
	);
	const totalPaid = invoices
		.filter((inv) => inv.status === "paid")
		.reduce((sum, inv) => sum + Number(inv.amount), 0);
	const totalOverdue = invoices
		.filter((inv) => inv.status === "overdue")
		.reduce((sum, inv) => sum + Number(inv.amount), 0);
	const paymentProgress =
		totalExpected > 0 ? (totalPaid / totalExpected) * 100 : 0;

	// Group invoices by status
	const pendingInvoices = invoices.filter(
		(inv) => inv.status === "pending" || inv.status === "overdue",
	);
	const paidInvoices = invoices.filter((inv) => inv.status === "paid");

	return (
		<div className="space-y-6">
			{/* Summary Card */}
			<Card className="border border-gray-200 shadow-sm">
				<CardBody className="p-6">
					<div className="grid gap-6 md:grid-cols-4">
						<div>
							<p className="text-gray-500 text-sm">Total Esperado</p>
							<p className="font-bold text-2xl text-gray-900">
								{formatCurrency(totalExpected)}
							</p>
						</div>
						<div>
							<p className="text-gray-500 text-sm">Total Recebido</p>
							<p className="font-bold text-2xl text-green-600">
								{formatCurrency(totalPaid)}
							</p>
						</div>
						<div>
							<p className="text-gray-500 text-sm">Em Atraso</p>
							<p className="font-bold text-2xl text-red-600">
								{formatCurrency(totalOverdue)}
							</p>
						</div>
						<div>
							<p className="text-gray-500 text-sm">Progresso</p>
							<div className="mt-2">
								<Progress
									value={paymentProgress}
									color={paymentProgress >= 100 ? "success" : "primary"}
									size="md"
									className="max-w-full"
								/>
								<p className="mt-1 text-gray-600 text-sm">
									{paymentProgress.toFixed(1)}% recebido
								</p>
							</div>
						</div>
					</div>
				</CardBody>
			</Card>

			{/* Actions */}
			{lease.status === "active" && (
				<div className="flex justify-end">
					<Button
						color="primary"
						variant="flat"
						startContent={<Calendar className="h-4 w-4" />}
						onPress={onGenerateInvoices}
						isLoading={isGenerating}
					>
						Gerar Cobranças Futuras
					</Button>
				</div>
			)}

			{/* Pending Invoices */}
			{pendingInvoices.length > 0 && (
				<Card className="border border-gray-200 shadow-sm">
					<CardHeader className="border-gray-100 border-b bg-gray-50/50 px-6 py-4">
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
								<Clock className="h-5 w-5 text-amber-600" />
							</div>
							<div>
								<h3 className="font-semibold text-gray-900 text-lg">
									Cobranças Pendentes
								</h3>
								<p className="text-gray-500 text-sm">
									{pendingInvoices.length} cobrança(s)
								</p>
							</div>
						</div>
					</CardHeader>
					<CardBody className="p-0">
						<div className="divide-y divide-gray-100">
							{pendingInvoices.map((invoice) => {
								const statusConfig = invoiceStatusConfig[invoice.status];
								const isOverdue = invoice.status === "overdue";

								return (
									<div
										key={invoice.id}
										className={`flex items-center justify-between p-4 ${isOverdue ? "bg-red-50" : ""}`}
									>
										<div className="flex items-center gap-4">
											{isOverdue ? (
												<AlertTriangle className="h-5 w-5 text-red-500" />
											) : (
												<Receipt className="h-5 w-5 text-gray-400" />
											)}
											<div>
												<p className="font-medium text-gray-900">
													{invoice.invoiceNumber ||
														`Cobrança ${invoice.id.slice(0, 8)}`}
												</p>
												<p className="text-gray-500 text-sm">
													Vencimento: {formatDate(invoice.dueDate)}
												</p>
											</div>
										</div>
										<div className="flex items-center gap-4">
											<div className="text-right">
												<p className="font-semibold text-gray-900">
													{formatCurrency(Number(invoice.amount))}
												</p>
												<Chip
													size="sm"
													color={statusConfig?.color || "default"}
													variant="flat"
												>
													{statusConfig?.label || invoice.status}
												</Chip>
											</div>
											<Button
												size="sm"
												color="success"
												variant="flat"
												startContent={<Check className="h-4 w-4" />}
												onPress={() => onMarkAsPaid(invoice.id)}
											>
												Marcar Pago
											</Button>
										</div>
									</div>
								);
							})}
						</div>
					</CardBody>
				</Card>
			)}

			{/* Paid Invoices */}
			{paidInvoices.length > 0 && (
				<Card className="border border-gray-200 shadow-sm">
					<CardHeader className="border-gray-100 border-b bg-gray-50/50 px-6 py-4">
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
								<Check className="h-5 w-5 text-green-600" />
							</div>
							<div>
								<h3 className="font-semibold text-gray-900 text-lg">
									Cobranças Pagas
								</h3>
								<p className="text-gray-500 text-sm">
									{paidInvoices.length} cobrança(s)
								</p>
							</div>
						</div>
					</CardHeader>
					<CardBody className="p-0">
						<div className="divide-y divide-gray-100">
							{paidInvoices.slice(0, 5).map((invoice) => (
								<div
									key={invoice.id}
									className="flex items-center justify-between p-4"
								>
									<div className="flex items-center gap-4">
										<Check className="h-5 w-5 text-green-500" />
										<div>
											<p className="font-medium text-gray-900">
												{invoice.invoiceNumber ||
													`Cobrança ${invoice.id.slice(0, 8)}`}
											</p>
											<p className="text-gray-500 text-sm">
												Pago em:{" "}
												{invoice.paidAt ? formatDate(invoice.paidAt) : "N/A"}
											</p>
										</div>
									</div>
									<p className="font-semibold text-gray-900">
										{formatCurrency(Number(invoice.amount))}
									</p>
								</div>
							))}
							{paidInvoices.length > 5 && (
								<div className="p-4 text-center">
									<p className="text-gray-500 text-sm">
										+ {paidInvoices.length - 5} cobrança(s) paga(s)
									</p>
								</div>
							)}
						</div>
					</CardBody>
				</Card>
			)}

			{/* Empty state */}
			{invoices.length === 0 && (
				<Card className="border border-gray-200 shadow-sm">
					<CardBody className="py-12 text-center">
						<Receipt className="mx-auto mb-4 h-12 w-12 text-gray-400" />
						<p className="font-medium text-gray-600 text-lg">
							Nenhuma cobrança gerada
						</p>
						<p className="text-gray-500 text-sm">
							Clique em "Gerar Cobranças Futuras" para criar cobranças
							automáticas
						</p>
					</CardBody>
				</Card>
			)}
		</div>
	);
}
