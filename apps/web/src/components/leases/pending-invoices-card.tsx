import {
	Button,
	Card,
	CardBody,
	CardHeader,
	Chip,
	Spinner,
} from "@heroui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Check, ChevronRight, Receipt } from "lucide-react";
import { Link } from "react-router";
import { toast } from "sonner";
import { trpc } from "@/utils/trpc";
import type { InvoiceData } from "./types";
import { invoiceStatusConfig } from "./types";

interface PendingInvoicesCardProps {
	limit?: number;
}

export function PendingInvoicesCard({ limit = 5 }: PendingInvoicesCardProps) {
	const queryClient = useQueryClient();

	const { data, isLoading } = useQuery({
		...trpc.invoices.list.queryOptions({
			status: "overdue",
			limit: limit,
		}),
	});

	const markAsPaidMutation = useMutation({
		...trpc.invoices.markAsPaid.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["invoices"] });
			queryClient.invalidateQueries({ queryKey: ["payments"] });
			toast.success("Cobrança marcada como paga!");
		},
		onError: (error) => {
			toast.error(error.message || "Erro ao marcar cobrança como paga");
		},
	});

	const invoices = (data?.invoices || []) as unknown as InvoiceData[];
	const overdueCount = data?.overdueCount || 0;
	const pendingTotal = data?.pendingTotal || 0;

	const formatCurrency = (value: number) =>
		new Intl.NumberFormat("pt-BR", {
			style: "currency",
			currency: "BRL",
		}).format(value);

	const formatDate = (date: string) =>
		new Date(date).toLocaleDateString("pt-BR", {
			day: "2-digit",
			month: "short",
		});

	if (isLoading) {
		return (
			<Card className="border border-gray-200 shadow-sm">
				<CardBody className="flex h-48 items-center justify-center">
					<Spinner />
				</CardBody>
			</Card>
		);
	}

	if (invoices.length === 0) {
		return (
			<Card className="border border-green-200 bg-green-50 shadow-sm">
				<CardBody className="py-8 text-center">
					<div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
						<Check className="h-6 w-6 text-green-600" />
					</div>
					<p className="font-medium text-green-800">Tudo em dia!</p>
					<p className="text-green-700 text-sm">Não há cobranças vencidas</p>
				</CardBody>
			</Card>
		);
	}

	return (
		<Card className="border border-red-200 bg-red-50 shadow-sm">
			<CardHeader className="border-red-200 border-b px-6 py-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
							<AlertTriangle className="h-5 w-5 text-red-600" />
						</div>
						<div>
							<h3 className="font-semibold text-lg text-red-900">
								Cobranças Vencidas
							</h3>
							<p className="text-red-700 text-sm">
								{overdueCount} cobrança(s) • {formatCurrency(pendingTotal)} em
								aberto
							</p>
						</div>
					</div>
					<Button
						as={Link}
						to="/dashboard/finances?tab=invoices"
						variant="light"
						size="sm"
						endContent={<ChevronRight className="h-4 w-4" />}
					>
						Ver Todas
					</Button>
				</div>
			</CardHeader>
			<CardBody className="p-0">
				<div className="divide-y divide-red-200">
					{invoices.map((invoice) => {
						const statusConfig = invoiceStatusConfig[invoice.status];
						const daysOverdue = Math.floor(
							(Date.now() - new Date(invoice.dueDate).getTime()) /
								(1000 * 60 * 60 * 24),
						);

						return (
							<div
								key={invoice.id}
								className="flex items-center justify-between p-4"
							>
								<div className="flex items-center gap-4">
									<Receipt className="h-5 w-5 text-red-500" />
									<div>
										<Link
											to={`/dashboard/leases/${invoice.leaseId}`}
											className="font-medium text-gray-900 hover:text-primary hover:underline"
										>
											{invoice.invoiceNumber ||
												`Cobrança #${invoice.id.slice(0, 8)}`}
										</Link>
										<p className="text-gray-500 text-sm">
											{invoice.lease?.tenantContact?.firstName}{" "}
											{invoice.lease?.tenantContact?.lastName}
										</p>
									</div>
								</div>
								<div className="flex items-center gap-3">
									<div className="text-right">
										<p className="font-semibold text-red-600">
											{formatCurrency(Number(invoice.amount))}
										</p>
										<Chip size="sm" color="danger" variant="flat">
											{daysOverdue} dias em atraso
										</Chip>
									</div>
									<Button
										size="sm"
										color="success"
										variant="flat"
										startContent={<Check className="h-4 w-4" />}
										onPress={() =>
											markAsPaidMutation.mutate({ id: invoice.id })
										}
										isLoading={markAsPaidMutation.isPending}
									>
										Pago
									</Button>
								</div>
							</div>
						);
					})}
				</div>
			</CardBody>
		</Card>
	);
}
