import {
	Avatar,
	Button,
	Card,
	CardBody,
	CardHeader,
	Chip,
	Dropdown,
	DropdownItem,
	DropdownMenu,
	DropdownTrigger,
	Table,
	TableBody,
	TableCell,
	TableColumn,
	TableHeader,
	TableRow,
} from "@heroui/react";
import { DollarSign, MoreVertical, Pencil, Plus } from "lucide-react";
import { useNavigate } from "react-router";
import { formatBRL } from "@/lib/constants/brazil";
import type { Lease } from "../types";
import { getLeaseStatusColor, getLeaseStatusLabel } from "../utils";

interface LeasesTabProps {
	propertyId: string;
	leases: Lease[];
	onRecordPayment: (leaseId: string) => void;
}

export function LeasesTab({
	propertyId,
	leases,
	onRecordPayment,
}: LeasesTabProps) {
	const navigate = useNavigate();

	return (
		<Card className="border border-gray-200 shadow-sm">
			<CardHeader className="flex items-center justify-between border-gray-100 border-b bg-gray-50/50 px-6 py-4">
				<h3 className="font-semibold text-gray-900 text-lg">
					Contratos de Locação
				</h3>
				<Button
					color="primary"
					size="sm"
					startContent={<Plus className="h-4 w-4" />}
					onPress={() =>
						navigate(`/dashboard/properties/${propertyId}/lease/new`)
					}
				>
					Novo Contrato
				</Button>
			</CardHeader>
			<CardBody className="p-0">
				{leases.length === 0 ? (
					<EmptyState
						message="Nenhum contrato cadastrado"
						actionLabel="Criar primeiro contrato"
						onAction={() =>
							navigate(`/dashboard/properties/${propertyId}/lease/new`)
						}
					/>
				) : (
					<LeasesTable
						propertyId={propertyId}
						leases={leases}
						onRecordPayment={onRecordPayment}
					/>
				)}
			</CardBody>
		</Card>
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
				<TableColumn width={50}>AÇÕES</TableColumn>
			</TableHeader>
			<TableBody>
				{leases.map((lease) => (
					<TableRow key={lease.id} className="hover:bg-gray-50">
						<TableCell>
							<div className="flex items-center gap-3">
								<Avatar
									name={lease.tenantContact?.firstName || "?"}
									size="sm"
								/>
								<div>
									<p className="font-medium text-gray-900">
										{lease.tenantContact?.firstName}{" "}
										{lease.tenantContact?.lastName}
									</p>
									<p className="text-gray-500 text-xs">
										{lease.tenantContact?.email}
									</p>
								</div>
							</div>
						</TableCell>
						<TableCell className="text-gray-600">
							{lease.unit?.unitNumber || "Imóvel todo"}
						</TableCell>
						<TableCell>
							<p className="text-gray-900 text-sm">
								{new Date(lease.startDate).toLocaleDateString("pt-BR")}
							</p>
							<p className="text-gray-500 text-xs">
								até{" "}
								{lease.endDate
									? new Date(lease.endDate).toLocaleDateString("pt-BR")
									: "Indeterminado"}
							</p>
						</TableCell>
						<TableCell className="font-medium text-gray-900">
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
						<TableCell>
							<LeaseActions
								leaseId={lease.id}
								propertyId={propertyId}
								onEdit={() =>
									navigate(
										`/dashboard/properties/${propertyId}/lease/${lease.id}/edit`,
									)
								}
								onRecordPayment={() => onRecordPayment(lease.id)}
							/>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}

interface LeaseActionsProps {
	leaseId: string;
	propertyId: string;
	onEdit: () => void;
	onRecordPayment: () => void;
}

function LeaseActions({ onEdit, onRecordPayment }: LeaseActionsProps) {
	return (
		<Dropdown>
			<DropdownTrigger>
				<Button isIconOnly variant="light" size="sm">
					<MoreVertical className="h-4 w-4" />
				</Button>
			</DropdownTrigger>
			<DropdownMenu aria-label="Ações">
				<DropdownItem
					key="edit"
					startContent={<Pencil className="h-4 w-4" />}
					onPress={onEdit}
				>
					Editar
				</DropdownItem>
				<DropdownItem
					key="payment"
					startContent={<DollarSign className="h-4 w-4" />}
					onPress={onRecordPayment}
				>
					Registrar pagamento
				</DropdownItem>
			</DropdownMenu>
		</Dropdown>
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
		<div className="py-12 text-center">
			<p className="text-gray-500">{message}</p>
			<Button className="mt-4" variant="light" onPress={onAction}>
				{actionLabel}
			</Button>
		</div>
	);
}
