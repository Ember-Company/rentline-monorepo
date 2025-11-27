import {
	Avatar,
	Button,
	Card,
	CardBody,
	Chip,
	Dropdown,
	DropdownItem,
	DropdownMenu,
	DropdownTrigger,
	Pagination,
	Table,
	TableBody,
	TableCell,
	TableColumn,
	TableHeader,
	TableRow,
} from "@heroui/react";
import { MoreVertical } from "lucide-react";
import { formatDate } from "@/lib/utils/format";
import type { MaintenanceRequest } from "./types";
import { priorityColors, statusColors } from "./types";

interface MaintenanceTableProps {
	requests: MaintenanceRequest[];
	totalPages: number;
	currentPage: number;
	totalCount: number;
	rowsPerPage: number;
	onPageChange: (page: number) => void;
	onEdit: (request: MaintenanceRequest) => void;
	onDelete: (request: MaintenanceRequest) => void;
	onStatusChange: (
		request: MaintenanceRequest,
		status: MaintenanceRequest["status"],
	) => void;
}

export function MaintenanceTable({
	requests,
	totalPages,
	currentPage,
	totalCount,
	rowsPerPage,
	onPageChange,
	onEdit,
	onDelete,
	onStatusChange,
}: MaintenanceTableProps) {
	const getPriorityLabel = (priority: MaintenanceRequest["priority"]) => {
		const labels = {
			urgent: "URGENTE",
			high: "ALTA",
			medium: "MÉDIA",
			low: "BAIXA",
		};
		return labels[priority];
	};

	const getStatusLabel = (status: MaintenanceRequest["status"]) => {
		const labels = {
			pending: "PENDENTE",
			"in-progress": "EM ANDAMENTO",
			completed: "CONCLUÍDO",
			cancelled: "CANCELADO",
		};
		return labels[status];
	};

	return (
		<Card className="border border-gray-200 shadow-sm">
			<CardBody className="p-0">
				<Table
					aria-label="Tabela de manutenções"
					removeWrapper
					classNames={{
						base: "min-h-[400px]",
						thead: "[&>tr]:first:shadow-none",
						th: "bg-gray-50 text-gray-600 font-semibold text-xs uppercase tracking-wider border-b border-gray-200 px-4 py-3",
						td: "border-b border-gray-100 px-4 py-3",
					}}
				>
					<TableHeader>
						<TableColumn>SOLICITAÇÃO</TableColumn>
						<TableColumn>IMÓVEL</TableColumn>
						<TableColumn>PRIORIDADE</TableColumn>
						<TableColumn>STATUS</TableColumn>
						<TableColumn>RESPONSÁVEL</TableColumn>
						<TableColumn>DATA</TableColumn>
						<TableColumn width={60}>AÇÕES</TableColumn>
					</TableHeader>
					<TableBody emptyContent="Nenhuma solicitação encontrada">
						{requests.map((request) => (
							<TableRow
								key={request.id}
								className="transition-colors hover:bg-gray-50"
							>
								<TableCell>
									<div>
										<p className="font-medium text-gray-900">{request.issue}</p>
										{request.tenantName && (
											<p className="text-gray-500 text-sm">
												Solicitado por {request.tenantName}
											</p>
										)}
									</div>
								</TableCell>
								<TableCell>
									<div>
										<p className="font-medium text-gray-900">
											{request.property}
										</p>
										<p className="text-gray-500 text-sm">{request.unit}</p>
									</div>
								</TableCell>
								<TableCell>
									<Chip
										size="sm"
										variant="flat"
										color={priorityColors[request.priority]}
										classNames={{ content: "text-xs font-medium" }}
									>
										{getPriorityLabel(request.priority)}
									</Chip>
								</TableCell>
								<TableCell>
									<Dropdown>
										<DropdownTrigger>
											<Chip
												size="sm"
												variant="flat"
												color={statusColors[request.status]}
												className="cursor-pointer"
												classNames={{ content: "text-xs font-medium" }}
											>
												{getStatusLabel(request.status)}
											</Chip>
										</DropdownTrigger>
										<DropdownMenu
											aria-label="Alterar status"
											onAction={(key) =>
												onStatusChange(
													request,
													key as MaintenanceRequest["status"],
												)
											}
										>
											<DropdownItem key="pending">Pendente</DropdownItem>
											<DropdownItem key="in-progress">
												Em Andamento
											</DropdownItem>
											<DropdownItem key="completed">Concluído</DropdownItem>
											<DropdownItem key="cancelled">Cancelado</DropdownItem>
										</DropdownMenu>
									</Dropdown>
								</TableCell>
								<TableCell>
									{request.assignedTo ? (
										<div className="flex items-center gap-2">
											<Avatar name={request.assignedTo} size="sm" />
											<span className="text-gray-900 text-sm">
												{request.assignedTo}
											</span>
										</div>
									) : (
										<span className="text-gray-400 text-sm">Não atribuído</span>
									)}
								</TableCell>
								<TableCell>
									<div>
										<p className="text-gray-900 text-sm">
											{formatDate(request.requestedDate)}
										</p>
										{request.completedDate && (
											<p className="text-emerald-600 text-xs">
												Concluído {formatDate(request.completedDate)}
											</p>
										)}
									</div>
								</TableCell>
								<TableCell>
									<Dropdown>
										<DropdownTrigger>
											<Button
												isIconOnly
												variant="light"
												size="sm"
												className="min-w-0 text-gray-400 hover:text-gray-600"
											>
												<MoreVertical className="h-4 w-4" />
											</Button>
										</DropdownTrigger>
										<DropdownMenu aria-label="Ações">
											<DropdownItem key="edit" onPress={() => onEdit(request)}>
												Editar
											</DropdownItem>
											<DropdownItem
												key="delete"
												color="danger"
												className="text-danger"
												onPress={() => onDelete(request)}
											>
												Excluir
											</DropdownItem>
										</DropdownMenu>
									</Dropdown>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>

				{totalPages > 1 && (
					<div className="flex items-center justify-between border-gray-200 border-t px-6 py-4">
						<p className="text-gray-500 text-sm">
							Exibindo {(currentPage - 1) * rowsPerPage + 1} a{" "}
							{Math.min(currentPage * rowsPerPage, totalCount)} de {totalCount}{" "}
							resultados
						</p>
						<Pagination
							total={totalPages}
							page={currentPage}
							onChange={onPageChange}
							showControls
							size="sm"
							classNames={{ cursor: "bg-primary" }}
						/>
					</div>
				)}
			</CardBody>
		</Card>
	);
}
