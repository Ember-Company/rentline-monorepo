import {
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
import { MoreVertical, Plus } from "lucide-react";
import type { MaintenanceRequest } from "../types";
import {
	getMaintenancePriorityColor,
	getMaintenancePriorityLabel,
	getMaintenanceStatusColor,
	getMaintenanceStatusLabel,
} from "../utils";

interface MaintenanceTabProps {
	maintenanceRequests: MaintenanceRequest[];
	onAddRequest: () => void;
}

export function MaintenanceTab({
	maintenanceRequests,
	onAddRequest,
}: MaintenanceTabProps) {
	return (
		<Card className="border border-gray-200 shadow-sm">
			<CardHeader className="flex items-center justify-between border-gray-100 border-b bg-gray-50/50 px-6 py-4">
				<h3 className="font-semibold text-gray-900 text-lg">
					Solicitações de Manutenção
				</h3>
				<Button
					color="primary"
					size="sm"
					startContent={<Plus className="h-4 w-4" />}
					onPress={onAddRequest}
				>
					Nova Solicitação
				</Button>
			</CardHeader>
			<CardBody className="p-0">
				{maintenanceRequests.length === 0 ? (
					<EmptyState onAction={onAddRequest} />
				) : (
					<MaintenanceTable requests={maintenanceRequests} />
				)}
			</CardBody>
		</Card>
	);
}

function MaintenanceTable({ requests }: { requests: MaintenanceRequest[] }) {
	return (
		<Table removeWrapper aria-label="Manutenções">
			<TableHeader>
				<TableColumn>TÍTULO</TableColumn>
				<TableColumn>UNIDADE</TableColumn>
				<TableColumn>PRIORIDADE</TableColumn>
				<TableColumn>STATUS</TableColumn>
				<TableColumn>DATA</TableColumn>
				<TableColumn width={50}>AÇÕES</TableColumn>
			</TableHeader>
			<TableBody>
				{requests.map((request) => (
					<TableRow key={request.id} className="hover:bg-gray-50">
						<TableCell>
							<p className="font-medium text-gray-900">{request.title}</p>
							{request.description && (
								<p className="max-w-xs truncate text-gray-500 text-xs">
									{request.description}
								</p>
							)}
						</TableCell>
						<TableCell className="text-gray-600">
							{request.unit?.unitNumber || "-"}
						</TableCell>
						<TableCell>
							<Chip
								size="sm"
								variant="flat"
								color={getMaintenancePriorityColor(request.priority)}
							>
								{getMaintenancePriorityLabel(request.priority)}
							</Chip>
						</TableCell>
						<TableCell>
							<Chip
								size="sm"
								variant="flat"
								color={getMaintenanceStatusColor(request.status)}
							>
								{getMaintenanceStatusLabel(request.status)}
							</Chip>
						</TableCell>
						<TableCell className="text-gray-600 text-sm">
							{new Date(request.createdAt).toLocaleDateString("pt-BR")}
						</TableCell>
						<TableCell>
							<RequestActions />
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}

function RequestActions() {
	return (
		<Dropdown>
			<DropdownTrigger>
				<Button isIconOnly variant="light" size="sm">
					<MoreVertical className="h-4 w-4" />
				</Button>
			</DropdownTrigger>
			<DropdownMenu aria-label="Ações">
				<DropdownItem key="view">Ver detalhes</DropdownItem>
				<DropdownItem key="assign">Atribuir</DropdownItem>
				<DropdownItem key="close">Fechar</DropdownItem>
			</DropdownMenu>
		</Dropdown>
	);
}

function EmptyState({ onAction }: { onAction: () => void }) {
	return (
		<div className="py-12 text-center">
			<p className="text-gray-500">Nenhuma solicitação de manutenção</p>
			<Button className="mt-4" variant="light" onPress={onAction}>
				Criar primeira solicitação
			</Button>
		</div>
	);
}
