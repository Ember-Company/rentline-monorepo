import { Spinner, Tab, Tabs } from "@heroui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import {
	type InvoiceData,
	InvoiceModal,
	type LeaseData,
	LeaseRenewModal,
	LeaseTerminateModal,
	type PaymentData,
} from "@/components/leases";
import {
	LeaseHeader,
	LeaseOverview,
	LeasePayments,
	LeaseRentSchedule,
} from "@/components/leases/detail";
import { trpc } from "@/utils/trpc";
import type { Route } from "./+types/route";

export function meta(_args: Route.MetaArgs) {
	return [
		{ title: "Detalhes do Contrato - Rentline" },
		{
			name: "description",
			content: "Visualizar detalhes do contrato de locação",
		},
	];
}

export default function LeaseDetailPage({ params }: Route.ComponentProps) {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const leaseId = params.id;

	// Active tab
	const [activeTab, setActiveTab] = useState("overview");

	// Modal state
	const [showRenewModal, setShowRenewModal] = useState(false);
	const [showTerminateModal, setShowTerminateModal] = useState(false);
	const [showInvoiceModal, setShowInvoiceModal] = useState(false);

	// Fetch lease data
	const { data: leaseData, isLoading: loadingLease } = useQuery({
		...trpc.leases.getById.queryOptions({ id: leaseId }),
	});

	// Fetch invoices for this lease
	const { data: invoicesData, isLoading: loadingInvoices } = useQuery({
		...trpc.invoices.list.queryOptions({ leaseId }),
	});

	// Fetch payments for this lease
	const { data: paymentsData, isLoading: loadingPayments } = useQuery({
		...trpc.payments.list.queryOptions({ leaseId }),
	});

	// Mutations
	const renewMutation = useMutation({
		...trpc.leases.renew.mutationOptions(),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["leases"] });
			toast.success("Contrato renovado com sucesso!");
			setShowRenewModal(false);
			// Navigate to the new lease
			if (data.lease?.id) {
				navigate(`/dashboard/leases/${data.lease.id}`);
			}
		},
		onError: (error) => {
			toast.error(error.message || "Erro ao renovar contrato");
		},
	});

	const terminateMutation = useMutation({
		...trpc.leases.terminate.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["leases"] });
			toast.success("Contrato encerrado com sucesso!");
			setShowTerminateModal(false);
		},
		onError: (error) => {
			toast.error(error.message || "Erro ao encerrar contrato");
		},
	});

	const deleteMutation = useMutation({
		...trpc.leases.delete.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["leases"] });
			toast.success("Contrato excluído com sucesso!");
			navigate("/dashboard/leases");
		},
		onError: (error) => {
			toast.error(error.message || "Erro ao excluir contrato");
		},
	});

	const createInvoiceMutation = useMutation({
		...trpc.invoices.create.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["invoices"] });
			toast.success("Cobrança criada com sucesso!");
			setShowInvoiceModal(false);
		},
		onError: (error) => {
			toast.error(error.message || "Erro ao criar cobrança");
		},
	});

	const generateInvoicesMutation = useMutation({
		...trpc.invoices.generateRecurring.mutationOptions(),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["invoices"] });
			toast.success(`${data.count} cobrança(s) gerada(s) com sucesso!`);
		},
		onError: (error) => {
			toast.error(error.message || "Erro ao gerar cobranças");
		},
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

	// Loading state
	if (loadingLease) {
		return (
			<div className="flex h-96 items-center justify-center">
				<Spinner size="lg" />
			</div>
		);
	}

	// Error state
	if (!leaseData?.lease) {
		return (
			<div className="flex h-96 flex-col items-center justify-center gap-4">
				<p className="font-medium text-gray-600 text-lg">
					Contrato não encontrado
				</p>
				<button
					onClick={() => navigate("/dashboard/leases")}
					className="text-primary hover:underline"
				>
					Voltar para contratos
				</button>
			</div>
		);
	}

	const lease = leaseData.lease as unknown as LeaseData;
	const invoices = (invoicesData?.invoices || []) as unknown as InvoiceData[];
	const payments = (paymentsData?.payments || []) as unknown as PaymentData[];

	const handleRenew = (data: {
		newEndDate: string;
		newRentAmount?: number;
	}) => {
		renewMutation.mutate({
			id: leaseId,
			...data,
		});
	};

	const handleTerminate = (data: { moveOutDate?: string; reason?: string }) => {
		terminateMutation.mutate({
			id: leaseId,
			...data,
		});
	};

	const handleDelete = () => {
		if (
			confirm(
				"Tem certeza que deseja excluir este contrato? Esta ação não pode ser desfeita.",
			)
		) {
			deleteMutation.mutate({ id: leaseId });
		}
	};

	const handleCreateInvoice = (data: {
		dueDate: string;
		amount: number;
		lineItems: { description: string; amount: number; quantity: number }[];
		notes?: string;
	}) => {
		createInvoiceMutation.mutate({
			leaseId,
			dueDate: data.dueDate,
			amount: data.amount,
			currencyId: lease.currencyId || "BRL",
			lineItems: data.lineItems,
			notes: data.notes,
		});
	};

	const handleGenerateInvoices = () => {
		if (!lease.endDate) {
			toast.error(
				"Não é possível gerar cobranças para contratos sem data de término",
			);
			return;
		}

		const startDate = new Date();
		generateInvoicesMutation.mutate({
			leaseId,
			startDate: startDate.toISOString(),
			endDate: lease.endDate,
			amount: Number(lease.rentAmount),
			description: "Aluguel Mensal",
		});
	};

	const handleMarkAsPaid = (invoiceId: string) => {
		markAsPaidMutation.mutate({ id: invoiceId });
	};

	return (
		<div className="space-y-6 pb-12">
			{/* Header */}
			<LeaseHeader
				lease={lease}
				onRenew={() => setShowRenewModal(true)}
				onTerminate={() => setShowTerminateModal(true)}
				onDelete={handleDelete}
				onCreateInvoice={() => setShowInvoiceModal(true)}
			/>

			{/* Tabs */}
			<Tabs
				selectedKey={activeTab}
				onSelectionChange={(key) => setActiveTab(key as string)}
				aria-label="Seções do contrato"
				color="primary"
				variant="underlined"
				classNames={{
					tabList: "gap-6 border-b border-gray-200",
					cursor: "bg-primary",
					tab: "px-0 h-12",
					tabContent: "group-data-[selected=true]:text-primary",
				}}
			>
				<Tab key="overview" title="Visão Geral" />
				<Tab key="rent" title="Cobranças" />
				<Tab key="payments" title="Pagamentos" />
				<Tab key="documents" title="Documentos" />
			</Tabs>

			{/* Tab Content */}
			{activeTab === "overview" && <LeaseOverview lease={lease} />}

			{activeTab === "rent" && (
				<LeaseRentSchedule
					lease={lease}
					invoices={invoices}
					onGenerateInvoices={handleGenerateInvoices}
					onMarkAsPaid={handleMarkAsPaid}
					isGenerating={generateInvoicesMutation.isPending}
				/>
			)}

			{activeTab === "payments" && (
				<LeasePayments
					payments={payments}
					isLoading={loadingPayments}
					onAddPayment={() => setActiveTab("rent")}
				/>
			)}

			{activeTab === "documents" && (
				<div className="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-gray-200 border-dashed bg-gray-50">
					<p className="font-medium text-gray-600 text-lg">Documentos</p>
					<p className="text-gray-500 text-sm">
						Funcionalidade em desenvolvimento
					</p>
				</div>
			)}

			{/* Modals */}
			<LeaseRenewModal
				isOpen={showRenewModal}
				onClose={() => setShowRenewModal(false)}
				lease={lease}
				onConfirm={handleRenew}
				isLoading={renewMutation.isPending}
			/>

			<LeaseTerminateModal
				isOpen={showTerminateModal}
				onClose={() => setShowTerminateModal(false)}
				lease={lease}
				onConfirm={handleTerminate}
				isLoading={terminateMutation.isPending}
			/>

			<InvoiceModal
				isOpen={showInvoiceModal}
				onClose={() => setShowInvoiceModal(false)}
				lease={lease}
				onConfirm={handleCreateInvoice}
				isLoading={createInvoiceMutation.isPending}
			/>
		</div>
	);
}
