import { Card, CardBody, Input, Select, SelectItem } from "@heroui/react";
import { Filter, Search } from "lucide-react";

interface MaintenanceFiltersProps {
	searchQuery: string;
	statusFilter: string;
	priorityFilter: string;
	onSearchChange: (value: string) => void;
	onStatusChange: (value: string) => void;
	onPriorityChange: (value: string) => void;
}

export function MaintenanceFilters({
	searchQuery,
	statusFilter,
	priorityFilter,
	onSearchChange,
	onStatusChange,
	onPriorityChange,
}: MaintenanceFiltersProps) {
	return (
		<Card className="border border-gray-200 shadow-sm">
			<CardBody className="p-4">
				<div className="flex flex-col gap-4 md:flex-row md:items-center">
					<Input
						placeholder="Buscar solicitações..."
						value={searchQuery}
						onValueChange={onSearchChange}
						startContent={<Search className="h-4 w-4 text-gray-400" />}
						classNames={{
							input: "text-sm",
							inputWrapper: "bg-white border-gray-200 hover:border-gray-300",
						}}
						className="md:max-w-xs"
					/>
					<div className="flex gap-2">
						<Select
							selectedKeys={[statusFilter]}
							onSelectionChange={(keys) =>
								onStatusChange(Array.from(keys)[0] as string)
							}
							className="w-40"
							classNames={{
								trigger: "border-gray-200",
							}}
							startContent={<Filter className="h-4 w-4 text-gray-400" />}
						>
							<SelectItem key="all">Todos Status</SelectItem>
							<SelectItem key="pending">Pendente</SelectItem>
							<SelectItem key="in-progress">Em Andamento</SelectItem>
							<SelectItem key="completed">Concluído</SelectItem>
							<SelectItem key="cancelled">Cancelado</SelectItem>
						</Select>
						<Select
							selectedKeys={[priorityFilter]}
							onSelectionChange={(keys) =>
								onPriorityChange(Array.from(keys)[0] as string)
							}
							className="w-40"
							classNames={{
								trigger: "border-gray-200",
							}}
						>
							<SelectItem key="all">Todas Prioridades</SelectItem>
							<SelectItem key="urgent">Urgente</SelectItem>
							<SelectItem key="high">Alta</SelectItem>
							<SelectItem key="medium">Média</SelectItem>
							<SelectItem key="low">Baixa</SelectItem>
						</Select>
					</div>
				</div>
			</CardBody>
		</Card>
	);
}
