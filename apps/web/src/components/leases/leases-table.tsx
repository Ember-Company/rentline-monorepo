import {
	Avatar,
	Button,
	Chip,
	Dropdown,
	DropdownItem,
	DropdownMenu,
	DropdownTrigger,
	Spinner,
	Table,
	TableBody,
	TableCell,
	TableColumn,
	TableHeader,
	TableRow,
} from "@heroui/react";
import {
	Edit,
	Eye,
	FileText,
	MoreVertical,
	RefreshCw,
	Trash2,
	XCircle,
} from "lucide-react";
import { Link } from "react-router";
import type { LeaseData, LeaseStatus } from "./types";
import {
	formatTenantName,
	getDaysUntilExpiration,
	getPropertyName,
	leaseStatusConfig,
	leaseTypeConfig,
} from "./types";

interface LeasesTableProps {
	leases: LeaseData[];
	isLoading?: boolean;
	onRenew?: (lease: LeaseData) => void;
	onTerminate?: (lease: LeaseData) => void;
	onDelete?: (lease: LeaseData) => void;
}

export function LeasesTable({
	leases,
	isLoading,
	onRenew,
	onTerminate,
	onDelete,
}: LeasesTableProps) {
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

	if (isLoading) {
		return (
			<div className="flex h-64 items-center justify-center">
				<Spinner size="lg" />
			</div>
		);
	}

	if (leases.length === 0) {
		return (
			<div className="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-gray-200 border-dashed bg-gray-50">
				<FileText className="mb-3 h-12 w-12 text-gray-400" />
				<p className="font-medium text-gray-600 text-lg">
					Nenhum contrato encontrado
				</p>
				<p className="text-gray-500 text-sm">
					Crie um novo contrato para começar
				</p>
			</div>
		);
	}

	return (
		<Table
			aria-label="Tabela de contratos"
			classNames={{
				wrapper: "border border-gray-200 shadow-sm rounded-lg",
				th: "bg-gray-50 text-gray-600 font-medium",
			}}
		>
			<TableHeader>
				<TableColumn>IMÓVEL / INQUILINO</TableColumn>
				<TableColumn>TIPO</TableColumn>
				<TableColumn>PERÍODO</TableColumn>
				<TableColumn>ALUGUEL</TableColumn>
				<TableColumn>STATUS</TableColumn>
				<TableColumn align="center">AÇÕES</TableColumn>
			</TableHeader>
			<TableBody>
				{leases.map((lease) => {
					const statusConfig = leaseStatusConfig[lease.status as LeaseStatus];
					const typeConfig = leaseTypeConfig[lease.leaseType];
					const daysUntilExpiration = getDaysUntilExpiration(lease.endDate);
					const isExpiringSoon =
						daysUntilExpiration !== null &&
						daysUntilExpiration > 0 &&
						daysUntilExpiration <= 30;

					return (
						<TableRow key={lease.id} className="hover:bg-gray-50">
							<TableCell>
								<Link to={`/dashboard/leases/${lease.id}`} className="block">
									<div className="flex items-center gap-3">
										<Avatar
											name={formatTenantName(lease.tenantContact)[0]}
											size="sm"
											className="bg-primary-100 text-primary"
										/>
										<div>
											<p className="font-medium text-gray-900">
												{getPropertyName(lease)}
											</p>
											<p className="text-gray-500 text-sm">
												{formatTenantName(lease.tenantContact)}
											</p>
										</div>
									</div>
								</Link>
							</TableCell>
							<TableCell>
								<span className="text-gray-600 text-sm">
									{typeConfig?.label || lease.leaseType}
								</span>
							</TableCell>
							<TableCell>
								<div>
									<p className="text-gray-900 text-sm">
										{formatDate(lease.startDate)}
									</p>
									{lease.endDate && (
										<p className="text-gray-500 text-xs">
											até {formatDate(lease.endDate)}
										</p>
									)}
									{isExpiringSoon && (
										<Chip
											size="sm"
											color="warning"
											variant="flat"
											className="mt-1"
										>
											{daysUntilExpiration} dias restantes
										</Chip>
									)}
								</div>
							</TableCell>
							<TableCell>
								<div>
									<p className="font-medium text-gray-900">
										{formatCurrency(Number(lease.rentAmount))}
									</p>
									<p className="text-gray-500 text-xs">
										Venc. dia {lease.paymentDueDay}
									</p>
								</div>
							</TableCell>
							<TableCell>
								<Chip
									size="sm"
									color={statusConfig?.color || "default"}
									variant="flat"
								>
									{statusConfig?.label || lease.status}
								</Chip>
							</TableCell>
							<TableCell>
								<div className="flex items-center justify-center gap-1">
									<Button
										as={Link}
										to={`/dashboard/leases/${lease.id}`}
										variant="light"
										isIconOnly
										size="sm"
									>
										<Eye className="h-4 w-4" />
									</Button>
									<Dropdown>
										<DropdownTrigger>
											<Button variant="light" isIconOnly size="sm">
												<MoreVertical className="h-4 w-4" />
											</Button>
										</DropdownTrigger>
										<DropdownMenu aria-label="Ações do contrato">
											<DropdownItem
												key="edit"
												startContent={<Edit className="h-4 w-4" />}
												href={`/dashboard/leases/${lease.id}/edit`}
											>
												Editar
											</DropdownItem>
											{lease.status === "active" && (
												<DropdownItem
													key="renew"
													startContent={<RefreshCw className="h-4 w-4" />}
													onPress={() => onRenew?.(lease)}
												>
													Renovar
												</DropdownItem>
											)}
											{lease.status === "active" && (
												<DropdownItem
													key="terminate"
													startContent={<XCircle className="h-4 w-4" />}
													className="text-warning"
													onPress={() => onTerminate?.(lease)}
												>
													Encerrar
												</DropdownItem>
											)}
											<DropdownItem
												key="delete"
												startContent={<Trash2 className="h-4 w-4" />}
												className="text-danger"
												onPress={() => onDelete?.(lease)}
											>
												Excluir
											</DropdownItem>
										</DropdownMenu>
									</Dropdown>
								</div>
							</TableCell>
						</TableRow>
					);
				})}
			</TableBody>
		</Table>
	);
}
