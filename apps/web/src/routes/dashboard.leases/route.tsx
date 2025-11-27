import { Button } from "@heroui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import {
	type LeaseData,
	LeaseRenewModal,
	type LeaseStatus,
	LeasesFilters,
	LeasesStats,
	LeasesTable,
	LeaseTerminateModal,
	type LeaseType,
} from "@/components/leases";
import { trpc } from "@/utils/trpc";
import type { Route } from "./+types/route";

export function meta(_args: Route.MetaArgs) {
	return [
		{ title: "Contratos - Rentline" },
		{ name: "description", content: "Gerenciamento de contratos de locação" },
	];
}

export default function LeasesPage() {
	const queryClient = useQueryClient();

	// Filters state
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<LeaseStatus | "all">("all");
	const [typeFilter, setTypeFilter] = useState<LeaseType | "all">("all");

	// Modal state
	const [renewLease, setRenewLease] = useState<LeaseData | null>(null);
	const [terminateLease, setTerminateLease] = useState<LeaseData | null>(null);

	// Fetch leases
	const { data: leasesData, isLoading } = useQuery({
		...trpc.leases.list.queryOptions({
			status: statusFilter === "all" ? undefined : statusFilter,
			includeExpired: true,
		}),
	});

	// Mutations
	const renewMutation = useMutation({
		...trpc.leases.renew.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["leases"] });
			toast.success("Contrato renovado com sucesso!");
			setRenewLease(null);
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
			setTerminateLease(null);
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
		},
		onError: (error) => {
			toast.error(error.message || "Erro ao excluir contrato");
		},
	});

	// Filter leases
	const filteredLeases = useMemo(() => {
		const leases = (leasesData?.leases || []) as LeaseData[];

		return leases.filter((lease) => {
			// Search filter
			if (searchQuery) {
				const query = searchQuery.toLowerCase();
				const matchesProperty =
					lease.property?.name?.toLowerCase().includes(query) ||
					lease.unit?.property?.name?.toLowerCase().includes(query);
				const matchesTenant =
					lease.tenantContact?.firstName?.toLowerCase().includes(query) ||
					lease.tenantContact?.lastName?.toLowerCase().includes(query) ||
					lease.tenantContact?.email?.toLowerCase().includes(query);

				if (!matchesProperty && !matchesTenant) return false;
			}

			// Type filter
			if (typeFilter !== "all" && lease.leaseType !== typeFilter) {
				return false;
			}

			return true;
		});
	}, [leasesData?.leases, searchQuery, typeFilter]);

	const hasActiveFilters =
		searchQuery !== "" || statusFilter !== "all" || typeFilter !== "all";

	const clearFilters = () => {
		setSearchQuery("");
		setStatusFilter("all");
		setTypeFilter("all");
	};

	const handleRenew = (data: {
		newEndDate: string;
		newRentAmount?: number;
	}) => {
		if (!renewLease) return;
		renewMutation.mutate({
			id: renewLease.id,
			...data,
		});
	};

	const handleTerminate = (data: { moveOutDate?: string; reason?: string }) => {
		if (!terminateLease) return;
		terminateMutation.mutate({
			id: terminateLease.id,
			...data,
		});
	};

	const handleDelete = (lease: LeaseData) => {
		if (confirm("Tem certeza que deseja excluir este contrato?")) {
			deleteMutation.mutate({ id: lease.id });
		}
	};

	return (
		<div className="space-y-6 pb-12">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-bold text-2xl text-gray-900">Contratos</h1>
					<p className="text-gray-500 text-sm">
						Gerencie todos os contratos de locação da sua organização
					</p>
				</div>
				<Button
					as={Link}
					to="/dashboard/properties"
					color="primary"
					startContent={<Plus className="h-4 w-4" />}
				>
					Novo Contrato
				</Button>
			</div>

			{/* Stats */}
			<LeasesStats leases={filteredLeases} isLoading={isLoading} />

			{/* Filters */}
			<LeasesFilters
				searchQuery={searchQuery}
				onSearchChange={setSearchQuery}
				statusFilter={statusFilter}
				onStatusChange={setStatusFilter}
				typeFilter={typeFilter}
				onTypeChange={setTypeFilter}
				onClearFilters={clearFilters}
				hasActiveFilters={hasActiveFilters}
			/>

			{/* Table */}
			<LeasesTable
				leases={filteredLeases}
				isLoading={isLoading}
				onRenew={setRenewLease}
				onTerminate={setTerminateLease}
				onDelete={handleDelete}
			/>

			{/* Empty state when no leases exist at all */}
			{!isLoading && !leasesData?.leases?.length && (
				<div className="mt-8 flex flex-col items-center justify-center rounded-xl border-2 border-gray-200 border-dashed bg-gray-50 py-16">
					<div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
						<FileText className="h-8 w-8 text-primary" />
					</div>
					<h3 className="font-semibold text-gray-900 text-lg">
						Nenhum contrato cadastrado
					</h3>
					<p className="mt-1 max-w-md text-center text-gray-500 text-sm">
						Comece criando um contrato para um dos seus imóveis. Contratos
						permitem gerenciar inquilinos, cobranças e pagamentos.
					</p>
					<Button
						as={Link}
						to="/dashboard/properties"
						color="primary"
						className="mt-6"
						startContent={<Plus className="h-4 w-4" />}
					>
						Criar Primeiro Contrato
					</Button>
				</div>
			)}

			{/* Modals */}
			<LeaseRenewModal
				isOpen={!!renewLease}
				onClose={() => setRenewLease(null)}
				lease={renewLease}
				onConfirm={handleRenew}
				isLoading={renewMutation.isPending}
			/>

			<LeaseTerminateModal
				isOpen={!!terminateLease}
				onClose={() => setTerminateLease(null)}
				lease={terminateLease}
				onConfirm={handleTerminate}
				isLoading={terminateMutation.isPending}
			/>
		</div>
	);
}
