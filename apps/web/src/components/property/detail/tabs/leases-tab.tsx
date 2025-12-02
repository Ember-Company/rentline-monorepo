import {
	Button,
	Card,
	CardBody,
	CardHeader,
	Chip,
	Input,
	Select,
	SelectItem,
	Table,
	TableBody,
	TableCell,
	TableColumn,
	TableHeader,
	TableRow,
} from "@heroui/react";
import { Building2, FileText, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { formatBRL } from "@/lib/constants/brazil";
import { useDeleteLease } from "@/lib/hooks/use-leases";
import { FullFeaturedLeaseForm, LeaseActionsMenu } from "@/components/leases";
import type { LeaseStatus } from "@/components/leases/types";
import type { Lease } from "../types";
import { getLeaseStatusColor, getLeaseStatusLabel } from "../utils";

interface LeasesTabProps {
	propertyId: string;
	leases: Lease[];
	onRecordPayment: (leaseId: string) => void;
}

const statusOptions: { value: LeaseStatus | "all"; label: string }[] = [
	{ value: "all", label: "Todos" },
	{ value: "active", label: "Ativos" },
	{ value: "pending", label: "Pendentes" },
	{ value: "draft", label: "Rascunhos" },
	{ value: "expired", label: "Expirados" },
	{ value: "terminated", label: "Encerrados" },
];

export function LeasesTab({
	propertyId,
	leases,
	onRecordPayment,
}: LeasesTabProps) {
	const navigate = useNavigate();
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<LeaseStatus | "all">("all");
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

	// Filter leases
	const filteredLeases = useMemo(() => {
		return leases.filter((lease) => {
			// Status filter
			if (statusFilter !== "all" && lease.status !== statusFilter) {
				return false;
			}

			// Search filter
			if (searchQuery) {
				const query = searchQuery.toLowerCase();
				const matchesTenant =
					lease.tenantContact?.firstName?.toLowerCase().includes(query) ||
					lease.tenantContact?.lastName?.toLowerCase().includes(query) ||
					lease.tenantContact?.email?.toLowerCase().includes(query);
				const matchesUnit = lease.unit?.unitNumber?.toLowerCase().includes(query);

				if (!matchesTenant && !matchesUnit) return false;
			}

			return true;
		});
	}, [leases, searchQuery, statusFilter]);

	const activeLeases = leases.filter((l) => l.status === "active").length;
	const pendingLeases = leases.filter((l) => l.status === "pending").length;
	const inactiveLeases = leases.filter(
		(l) => l.status === "expired" || l.status === "terminated"
	).length;

	return (
		<div className="space-y-6">
			{/* Stats Cards */}
			<div className="grid grid-cols-3 gap-4">
				<Card className="border border-gray-200 dark:border-gray-700">
					<CardBody className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-gray-500">Contratos Ativos</p>
								<p className="text-2xl font-bold text-gray-900 dark:text-white">
									{activeLeases}
								</p>
							</div>
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20">
								<FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
							</div>
						</div>
					</CardBody>
				</Card>

				<Card className="border border-gray-200 dark:border-gray-700">
					<CardBody className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-gray-500">Pendentes</p>
								<p className="text-2xl font-bold text-gray-900 dark:text-white">
									{pendingLeases}
								</p>
							</div>
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/20">
								<FileText className="h-5 w-5 text-amber-600 dark:text-amber-400" />
							</div>
						</div>
					</CardBody>
				</Card>

				<Card className="border border-gray-200 dark:border-gray-700">
					<CardBody className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-gray-500">Inativos</p>
								<p className="text-2xl font-bold text-gray-900 dark:text-white">
									{inactiveLeases}
								</p>
							</div>
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
								<FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />
							</div>
						</div>
					</CardBody>
				</Card>
			</div>

			{/* Leases Table */}
			<Card className="border border-gray-200 shadow-sm dark:border-gray-700">
				<CardHeader className="flex items-center justify-between border-b border-gray-200 bg-gray-50/50 px-6 py-4 dark:border-gray-700 dark:bg-gray-800/50">
					<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
						Contratos de Locação ({filteredLeases.length})
					</h3>
					<Button
						color="primary"
						size="sm"
						startContent={<Plus className="h-4 w-4" />}
						onPress={() => setIsCreateModalOpen(true)}
					>
						Novo Contrato
					</Button>
				</CardHeader>
				<CardBody className="p-0">
					{leases.length === 0 ? (
						<EmptyState
							message="Nenhum contrato cadastrado para este imóvel"
							actionLabel="Criar primeiro contrato"
							onAction={() => setIsCreateModalOpen(true)}
						/>
					) : (
						<>
							{/* Filters */}
							<div className="border-b border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
								<div className="flex flex-col gap-4 sm:flex-row">
									<Input
										placeholder="Buscar por inquilino ou unidade..."
										value={searchQuery}
										onValueChange={setSearchQuery}
										startContent={<Search className="h-4 w-4 text-gray-400" />}
										className="flex-1"
										size="sm"
									/>
									<Select
										placeholder="Filtrar por status"
										selectedKeys={[statusFilter]}
										onSelectionChange={(keys) =>
											setStatusFilter(Array.from(keys)[0] as LeaseStatus | "all")
										}
										className="w-full sm:w-48"
										size="sm"
									>
										{statusOptions.map((option) => (
											<SelectItem key={option.value}>{option.label}</SelectItem>
										))}
									</Select>
								</div>
							</div>

							{filteredLeases.length === 0 ? (
								<div className="py-12 text-center">
									<p className="text-gray-500">
										Nenhum contrato encontrado com os filtros aplicados
									</p>
								</div>
							) : (
								<LeasesTable
									propertyId={propertyId}
									leases={filteredLeases}
									onRecordPayment={onRecordPayment}
								/>
							)}
						</>
					)}
				</CardBody>
			</Card>

			{/* Create Lease Modal */}
			<FullFeaturedLeaseForm
				isOpen={isCreateModalOpen}
				onClose={() => setIsCreateModalOpen(false)}
				propertyId={propertyId}
			/>
		</div>
	);
}

interface LeasesTableProps {
	propertyId: string;
	leases: Lease[];
	onRecordPayment: (leaseId: string) => void;
}

function LeasesTable({
	propertyId,
	leases,
	onRecordPayment,
}: LeasesTableProps) {
	const navigate = useNavigate();

	return (
		<Table removeWrapper aria-label="Contratos">
			<TableHeader>
				<TableColumn>INQUILINO</TableColumn>
				<TableColumn>UNIDADE</TableColumn>
				<TableColumn>PERÍODO</TableColumn>
				<TableColumn>ALUGUEL</TableColumn>
				<TableColumn>STATUS</TableColumn>
				<TableColumn width={80}>AÇÕES</TableColumn>
			</TableHeader>
			<TableBody>
				{leases.map((lease) => (
					<TableRow
						key={lease.id}
						className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
						onClick={() => navigate(`/dashboard/leases/${lease.id}`)}
					>
						<TableCell>
							<div className="flex items-center gap-3">
								<div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
									{lease.tenantContact?.firstName?.[0] || "?"}
								</div>
								<div>
									<p className="font-medium text-gray-900 dark:text-white">
										{lease.tenantContact?.firstName} {lease.tenantContact?.lastName}
									</p>
									<p className="text-xs text-gray-500">
										{lease.tenantContact?.email}
									</p>
								</div>
							</div>
						</TableCell>
						<TableCell className="text-gray-600 dark:text-gray-400">
							{lease.unit?.unitNumber || "Imóvel todo"}
						</TableCell>
						<TableCell>
							<p className="text-sm text-gray-900 dark:text-white">
								{new Date(lease.startDate).toLocaleDateString("pt-BR")}
							</p>
							<p className="text-xs text-gray-500">
								até{" "}
								{lease.endDate
									? new Date(lease.endDate).toLocaleDateString("pt-BR")
									: "Indeterminado"}
							</p>
						</TableCell>
						<TableCell className="font-medium text-gray-900 dark:text-white">
							{formatBRL(Number(lease.rentAmount))}/mês
						</TableCell>
						<TableCell>
							<Chip
								size="sm"
								variant="flat"
								color={getLeaseStatusColor(lease.status)}
							>
								{getLeaseStatusLabel(lease.status)}
							</Chip>
						</TableCell>
						<TableCell onClick={(e) => e.stopPropagation()}>
							<LeaseActionsMenu
								lease={lease}
								onEdit={() =>
									navigate(`/dashboard/leases/${lease.id}/edit`)
								}
								onRecordPayment={() => onRecordPayment(lease.id)}
								showViewDetails={false}
							/>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}

function EmptyState({
	message,
	actionLabel,
	onAction,
}: {
	message: string;
	actionLabel: string;
	onAction: () => void;
}) {
	return (
		<div className="flex flex-col items-center justify-center py-12">
			<div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
				<Building2 className="h-8 w-8 text-gray-400" />
			</div>
			<p className="mb-2 font-medium text-gray-900 dark:text-white">{message}</p>
			<p className="mb-6 text-sm text-gray-500">
				Crie um contrato para começar a gerenciar locações deste imóvel.
			</p>
			<Button color="primary" variant="flat" onPress={onAction}>
				{actionLabel}
			</Button>
		</div>
	);
}
