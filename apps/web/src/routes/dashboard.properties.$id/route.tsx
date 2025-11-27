import { Spinner } from "@heroui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, DollarSign, FileText, Wrench } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { CrudModal } from "@/components/dashboard/crud-modal";
import {
	ContactLinkModal,
	ContactsTab,
	type ExpenseFormData,
	ExpenseModal,
	FinancesTab,
	LeasesTab,
	type MaintenanceFormData,
	MaintenanceModal,
	MaintenanceTab,
	OverviewTab,
	type PaymentFormData,
	PaymentModal,
	PropertyHeader,
	UnitsTab,
} from "@/components/property/detail";
import { StatCard } from "@/components/ui/stat-card";
import { formatBRL } from "@/lib/constants/brazil";
import { useDeleteProperty, useProperty, useUnits } from "@/lib/hooks";
import { trpc } from "@/utils/trpc";
import type { Route } from "./+types/route";

export function meta(_args: Route.MetaArgs) {
	return [
		{ title: "Detalhes do Imóvel - Rentline" },
		{ name: "description", content: "Visualizar detalhes do imóvel" },
	];
}

export default function PropertyDetailPage({ params }: Route.ComponentProps) {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const propertyId = params.id;

	// UI State
	const [activeTab, setActiveTab] = useState<string>("overview");
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
	const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
	const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
	const [isContactLinkModalOpen, setIsContactLinkModalOpen] = useState(false);
	const [selectedLeaseId, setSelectedLeaseId] = useState<string | null>(null);

	// Data fetching
	const { data: propertyData, isLoading, error } = useProperty(propertyId);
	const { data: unitsData, isLoading: isLoadingUnits } = useUnits({
		propertyId,
	});
	const { data: leasesData } = useQuery({
		...trpc.leases.list.queryOptions({ propertyId }),
		enabled: !!propertyId,
	});
	const { data: paymentsData } = useQuery({
		...trpc.payments.list.queryOptions({ propertyId, limit: 20 }),
		enabled: !!propertyId,
	});
	const { data: expensesData } = useQuery({
		...trpc.expenses.list.queryOptions({ propertyId, limit: 20 }),
		enabled: !!propertyId,
	});
	const { data: maintenanceData } = useQuery({
		...trpc.maintenance.list.queryOptions({ propertyId, limit: 20 }),
		enabled: !!propertyId,
	});
	const { data: propertyContactsData } = useQuery({
		...trpc.contacts.getByProperty.queryOptions({ propertyId }),
		enabled: !!propertyId,
	});
	const { data: allContactsData } = useQuery({
		...trpc.contacts.list.queryOptions({}),
	});

	// Mutations
	const deleteProperty = useDeleteProperty();
	const linkContactMutation = useMutation({
		...trpc.contacts.linkToProperty.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["contacts", "getByProperty"],
			});
			toast.success("Contato vinculado com sucesso");
		},
		onError: () => toast.error("Erro ao vincular contato"),
	});
	const unlinkContactMutation = useMutation({
		...trpc.contacts.unlinkFromProperty.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["contacts", "getByProperty"],
			});
			toast.success("Contato desvinculado com sucesso");
		},
		onError: () => toast.error("Erro ao desvincular contato"),
	});
	const createPaymentMutation = useMutation({
		...trpc.payments.create.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["payments"] });
			toast.success("Pagamento registrado com sucesso");
			setIsPaymentModalOpen(false);
		},
		onError: () => toast.error("Erro ao registrar pagamento"),
	});
	const createExpenseMutation = useMutation({
		...trpc.expenses.create.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["expenses"] });
			toast.success("Despesa registrada com sucesso");
			setIsExpenseModalOpen(false);
		},
		onError: () => toast.error("Erro ao registrar despesa"),
	});
	const createMaintenanceMutation = useMutation({
		...trpc.maintenance.create.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["maintenance"] });
			toast.success("Solicitação criada com sucesso");
			setIsMaintenanceModalOpen(false);
		},
		onError: () => toast.error("Erro ao criar solicitação"),
	});

	// Derived data
	const property = propertyData?.property;
	const units = unitsData?.units || [];
	const leases = leasesData?.leases || [];
	const payments = paymentsData?.payments || [];
	const expenses = expensesData?.expenses || [];
	const maintenanceRequests = maintenanceData?.requests || [];
	const propertyContacts = propertyContactsData?.contacts || [];
	const allContacts = allContactsData?.contacts || [];

	// Calculations
	const occupiedUnits = units.filter((u) => u.status === "occupied").length;
	const occupancyRate =
		units.length > 0 ? (occupiedUnits / units.length) * 100 : 0;
	const activeLeases = leases.filter((l) => l.status === "active").length;
	const totalMonthlyRent = leases
		.filter((l) => l.status === "active")
		.reduce((sum, l) => sum + Number(l.rentAmount), 0);
	const totalPayments = payments
		.filter((p) => p.status === "completed")
		.reduce((sum, p) => sum + Number(p.amount), 0);
	const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
	const netIncome = totalPayments - totalExpenses;
	const pendingPayments = payments.filter((p) => p.status === "pending").length;

	const availableContacts = useMemo(() => {
		const linkedIds = propertyContacts.map((c) => c.id);
		return allContacts.filter((c) => !linkedIds.includes(c.id));
	}, [allContacts, propertyContacts]);

	// Handlers
	const handleDelete = async () => {
		try {
			await deleteProperty.mutateAsync({ id: propertyId });
			toast.success("Imóvel excluído com sucesso");
			navigate("/dashboard/properties");
		} catch {
			toast.error("Erro ao excluir imóvel");
		}
	};

	const handlePaymentSubmit = (data: PaymentFormData) => {
		createPaymentMutation.mutate({
			leaseId: data.leaseId,
			amount: data.amount,
			currencyId: "BRL",
			date: data.date,
			type: data.type,
			status: "completed",
			notes: data.notes,
		});
	};

	const handleExpenseSubmit = (data: ExpenseFormData) => {
		createExpenseMutation.mutate({
			propertyId,
			amount: data.amount,
			currencyId: "BRL",
			date: data.date,
			category: data.category,
			description: data.description,
			vendor: data.vendor,
		});
	};

	const handleMaintenanceSubmit = (data: MaintenanceFormData) => {
		createMaintenanceMutation.mutate({
			unitId: data.unitId || units[0]?.id || "",
			title: data.title,
			description: data.description,
			priority: data.priority,
		});
	};

	// Loading & Error states
	if (isLoading) {
		return (
			<div className="flex h-96 items-center justify-center">
				<Spinner size="lg" />
			</div>
		);
	}

	if (error || !property) {
		return (
			<div className="flex h-96 flex-col items-center justify-center gap-4">
				<p className="text-gray-500">Imóvel não encontrado</p>
				<button
					type="button"
					onClick={() => navigate("/dashboard/properties")}
					className="text-primary hover:underline"
				>
					Voltar para lista
				</button>
			</div>
		);
	}

	const tabs = [
		{ key: "overview", label: "Visão Geral" },
		...(property.type === "apartment_building" || property.type === "office"
			? [{ key: "units", label: `Unidades (${units.length})` }]
			: []),
		{ key: "leases", label: `Contratos (${leases.length})` },
		{ key: "finances", label: "Financeiro" },
		{ key: "maintenance", label: `Manutenção (${maintenanceRequests.length})` },
		{ key: "contacts", label: `Contatos (${propertyContacts.length})` },
	];

	return (
		<div className="space-y-6 pb-12">
			<PropertyHeader
				property={property}
				onDelete={() => setIsDeleteModalOpen(true)}
			/>

			{/* Quick Stats */}
			<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
				{(property.type === "apartment_building" ||
					property.type === "office") && (
					<StatCard
						title="Ocupação"
						value={`${occupancyRate.toFixed(0)}%`}
						subtitle={`${occupiedUnits}/${units.length} unidades`}
						icon={Building2}
						color="blue"
					/>
				)}
				<StatCard
					title="Contratos Ativos"
					value={activeLeases}
					subtitle={`de ${leases.length} total`}
					icon={FileText}
					color="green"
				/>
				<StatCard
					title="Receita Mensal"
					value={formatBRL(totalMonthlyRent)}
					subtitle="contratos ativos"
					icon={DollarSign}
					color="green"
				/>
				<StatCard
					title="Manutenções"
					value={
						maintenanceRequests.filter((m) => m.status !== "closed").length
					}
					subtitle="pendentes"
					icon={Wrench}
					color="yellow"
				/>
			</div>

			{/* Tabs Navigation */}
			<div className="flex gap-1 overflow-x-auto border-gray-200 border-b">
				{tabs.map((tab) => (
					<button
						key={tab.key}
						type="button"
						onClick={() => setActiveTab(tab.key)}
						className={`whitespace-nowrap px-4 py-2 font-medium text-sm transition-colors ${
							activeTab === tab.key
								? "border-primary border-b-2 text-primary"
								: "text-gray-600 hover:text-gray-900"
						}`}
					>
						{tab.label}
					</button>
				))}
			</div>

			{/* Tab Content */}
			{activeTab === "overview" && (
				<OverviewTab
					property={property}
					payments={payments}
					expenses={expenses}
					propertyContacts={propertyContacts}
					totalPayments={totalPayments}
					totalExpenses={totalExpenses}
					netIncome={netIncome}
					onAddPayment={() => setIsPaymentModalOpen(true)}
					onAddExpense={() => setIsExpenseModalOpen(true)}
					onLinkContact={() => setIsContactLinkModalOpen(true)}
					onUnlinkContact={(contactId) =>
						unlinkContactMutation.mutate({ propertyId, contactId })
					}
				/>
			)}

			{activeTab === "units" && (
				<UnitsTab
					propertyId={propertyId}
					units={units}
					isLoading={isLoadingUnits}
				/>
			)}

			{activeTab === "leases" && (
				<LeasesTab
					propertyId={propertyId}
					leases={leases}
					onRecordPayment={(leaseId) => {
						setSelectedLeaseId(leaseId);
						setIsPaymentModalOpen(true);
					}}
				/>
			)}

			{activeTab === "finances" && (
				<FinancesTab
					payments={payments}
					expenses={expenses}
					totalPayments={totalPayments}
					totalExpenses={totalExpenses}
					netIncome={netIncome}
					pendingPayments={pendingPayments}
					onAddPayment={() => setIsPaymentModalOpen(true)}
					onAddExpense={() => setIsExpenseModalOpen(true)}
				/>
			)}

			{activeTab === "maintenance" && (
				<MaintenanceTab
					maintenanceRequests={maintenanceRequests}
					onAddRequest={() => setIsMaintenanceModalOpen(true)}
				/>
			)}

			{activeTab === "contacts" && (
				<ContactsTab
					propertyContacts={propertyContacts}
					onLinkContact={() => setIsContactLinkModalOpen(true)}
					onUnlinkContact={(contactId) =>
						unlinkContactMutation.mutate({ propertyId, contactId })
					}
				/>
			)}

			{/* Modals */}
			<CrudModal
				isOpen={isDeleteModalOpen}
				onClose={() => setIsDeleteModalOpen(false)}
				title="Excluir Imóvel"
				onDelete={handleDelete}
				deleteLabel="Excluir"
				size="md"
				isLoading={deleteProperty.isPending}
			>
				<p>
					Tem certeza que deseja excluir <strong>{property.name}</strong>? Esta
					ação não pode ser desfeita.
				</p>
			</CrudModal>

			<PaymentModal
				isOpen={isPaymentModalOpen}
				onClose={() => {
					setIsPaymentModalOpen(false);
					setSelectedLeaseId(null);
				}}
				onSubmit={handlePaymentSubmit}
				isLoading={createPaymentMutation.isPending}
				leases={leases}
				selectedLeaseId={selectedLeaseId}
			/>

			<ExpenseModal
				isOpen={isExpenseModalOpen}
				onClose={() => setIsExpenseModalOpen(false)}
				onSubmit={handleExpenseSubmit}
				isLoading={createExpenseMutation.isPending}
			/>

			<MaintenanceModal
				isOpen={isMaintenanceModalOpen}
				onClose={() => setIsMaintenanceModalOpen(false)}
				onSubmit={handleMaintenanceSubmit}
				isLoading={createMaintenanceMutation.isPending}
				units={units}
			/>

			<ContactLinkModal
				isOpen={isContactLinkModalOpen}
				onClose={() => setIsContactLinkModalOpen(false)}
				availableContacts={availableContacts}
				onLinkContact={(contactId, role) =>
					linkContactMutation.mutate({ propertyId, contactId, role })
				}
			/>
		</div>
	);
}
