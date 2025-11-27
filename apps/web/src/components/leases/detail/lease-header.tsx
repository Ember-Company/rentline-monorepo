import {
	Button,
	Chip,
	Dropdown,
	DropdownItem,
	DropdownMenu,
	DropdownTrigger,
} from "@heroui/react";
import {
	ArrowLeft,
	Edit,
	FileText,
	MoreVertical,
	Receipt,
	RefreshCw,
	Trash2,
	XCircle,
} from "lucide-react";
import { Link } from "react-router";
import type { LeaseData, LeaseStatus } from "../types";
import {
	formatTenantName,
	getDaysUntilExpiration,
	getPropertyName,
	leaseStatusConfig,
} from "../types";

interface LeaseHeaderProps {
	lease: LeaseData;
	onRenew: () => void;
	onTerminate: () => void;
	onDelete: () => void;
	onCreateInvoice: () => void;
}

export function LeaseHeader({
	lease,
	onRenew,
	onTerminate,
	onDelete,
	onCreateInvoice,
}: LeaseHeaderProps) {
	const statusConfig = leaseStatusConfig[lease.status as LeaseStatus];
	const daysUntilExpiration = getDaysUntilExpiration(lease.endDate);
	const isExpiringSoon =
		daysUntilExpiration !== null &&
		daysUntilExpiration > 0 &&
		daysUntilExpiration <= 30;

	return (
		<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			<div className="flex items-center gap-4">
				<Button as={Link} to="/dashboard/leases" variant="light" isIconOnly>
					<ArrowLeft className="h-5 w-5" />
				</Button>
				<div>
					<div className="flex items-center gap-3">
						<h1 className="font-bold text-2xl text-gray-900">
							{getPropertyName(lease)}
						</h1>
						<Chip
							color={statusConfig?.color || "default"}
							variant="flat"
							size="sm"
						>
							{statusConfig?.label || lease.status}
						</Chip>
						{isExpiringSoon && (
							<Chip color="warning" variant="flat" size="sm">
								{daysUntilExpiration} dias restantes
							</Chip>
						)}
					</div>
					<p className="text-gray-500 text-sm">
						Inquilino: {formatTenantName(lease.tenantContact)}
						{lease.tenantContact?.email && ` • ${lease.tenantContact.email}`}
					</p>
				</div>
			</div>

			<div className="flex items-center gap-2">
				{lease.status === "active" && (
					<Button
						color="primary"
						variant="flat"
						startContent={<Receipt className="h-4 w-4" />}
						onPress={onCreateInvoice}
					>
						Criar Cobrança
					</Button>
				)}

				<Button
					as={Link}
					to={`/dashboard/leases/${lease.id}/edit`}
					variant="bordered"
					startContent={<Edit className="h-4 w-4" />}
				>
					Editar
				</Button>

				<Dropdown>
					<DropdownTrigger>
						<Button variant="bordered" isIconOnly>
							<MoreVertical className="h-4 w-4" />
						</Button>
					</DropdownTrigger>
					<DropdownMenu aria-label="Ações do contrato">
						<DropdownItem
							key="documents"
							startContent={<FileText className="h-4 w-4" />}
						>
							Documentos
						</DropdownItem>
						{lease.status === "active" && (
							<DropdownItem
								key="renew"
								startContent={<RefreshCw className="h-4 w-4" />}
								onPress={onRenew}
							>
								Renovar Contrato
							</DropdownItem>
						)}
						{lease.status === "active" && (
							<DropdownItem
								key="terminate"
								startContent={<XCircle className="h-4 w-4" />}
								className="text-warning"
								onPress={onTerminate}
							>
								Encerrar Contrato
							</DropdownItem>
						)}
						<DropdownItem
							key="delete"
							startContent={<Trash2 className="h-4 w-4" />}
							className="text-danger"
							onPress={onDelete}
						>
							Excluir
						</DropdownItem>
					</DropdownMenu>
				</Dropdown>
			</div>
		</div>
	);
}
