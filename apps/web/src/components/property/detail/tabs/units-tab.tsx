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
	Spinner,
	Table,
	TableBody,
	TableCell,
	TableColumn,
	TableHeader,
	TableRow,
} from "@heroui/react";
import { Eye, FileText, MoreVertical, Pencil, Plus } from "lucide-react";
import { useNavigate } from "react-router";
import {
	formatArea,
	formatBRL,
	UNIT_STATUS_LABELS,
} from "@/lib/constants/brazil";
import type { UnitStatus } from "@/lib/types/api";
import type { Unit } from "../types";
import { getUnitStatusColor } from "../utils";

interface UnitsTabProps {
	propertyId: string;
	units: Unit[];
	isLoading: boolean;
}

export function UnitsTab({ propertyId, units, isLoading }: UnitsTabProps) {
	const navigate = useNavigate();

	return (
		<Card className="border border-gray-200 shadow-sm">
			<CardHeader className="flex items-center justify-between border-gray-100 border-b bg-gray-50/50 px-6 py-4">
				<h3 className="font-semibold text-gray-900 text-lg">Unidades</h3>
				<Button
					color="primary"
					size="sm"
					startContent={<Plus className="h-4 w-4" />}
					onPress={() => navigate(`/dashboard/properties/${propertyId}/edit`)}
				>
					Adicionar Unidade
				</Button>
			</CardHeader>
			<CardBody className="p-0">
				{isLoading ? (
					<div className="flex justify-center py-12">
						<Spinner />
					</div>
				) : units.length === 0 ? (
					<EmptyState
						message="Nenhuma unidade cadastrada"
						actionLabel="Adicionar primeira unidade"
						onAction={() =>
							navigate(`/dashboard/properties/${propertyId}/edit`)
						}
					/>
				) : (
					<UnitsTable units={units} />
				)}
			</CardBody>
		</Card>
	);
}

function UnitsTable({ units }: { units: Unit[] }) {
	return (
		<Table removeWrapper aria-label="Unidades">
			<TableHeader>
				<TableColumn>UNIDADE</TableColumn>
				<TableColumn>TIPO</TableColumn>
				<TableColumn>ÁREA</TableColumn>
				<TableColumn>QUARTOS</TableColumn>
				<TableColumn>CATEGORIA</TableColumn>
				<TableColumn>VALORES</TableColumn>
				<TableColumn>STATUS</TableColumn>
				<TableColumn width={50}>AÇÕES</TableColumn>
			</TableHeader>
			<TableBody>
				{units.map((unit) => (
					<TableRow key={unit.id} className="hover:bg-gray-50">
						<TableCell>
							<p className="font-medium text-gray-900">
								{unit.name || `Unidade ${unit.unitNumber}`}
							</p>
							<p className="text-gray-500 text-xs">Nº {unit.unitNumber}</p>
						</TableCell>
						<TableCell className="text-gray-600">
							{getUnitTypeLabel(unit.type)}
						</TableCell>
						<TableCell className="text-gray-600">
							{unit.area ? formatArea(Number(unit.area)) : "-"}
						</TableCell>
						<TableCell className="text-gray-600">
							{unit.bedrooms || "-"}
						</TableCell>
						<TableCell>
							<Chip
								size="sm"
								variant="flat"
								color={
									unit.category === "rent"
										? "primary"
										: unit.category === "sale"
											? "success"
											: "warning"
								}
							>
								{unit.category === "rent"
									? "Aluguel"
									: unit.category === "sale"
										? "Venda"
										: "Ambos"}
							</Chip>
						</TableCell>
						<TableCell>
							<div className="space-y-1">
								{(unit.category === "rent" || unit.category === "both") &&
									unit.rentAmount && (
										<div className="text-gray-600 text-xs">
											Aluguel: {formatBRL(Number(unit.rentAmount))}
										</div>
									)}
								{(unit.category === "sale" || unit.category === "both") &&
									unit.salePrice && (
										<div className="font-medium text-gray-900 text-xs">
											Venda: {formatBRL(Number(unit.salePrice))}
										</div>
									)}
								{!unit.rentAmount && !unit.salePrice && (
									<span className="text-gray-400 text-xs">-</span>
								)}
							</div>
						</TableCell>
						<TableCell>
							<Chip
								size="sm"
								variant="flat"
								color={getUnitStatusColor(unit.status as UnitStatus)}
							>
								{UNIT_STATUS_LABELS[unit.status as UnitStatus]}
							</Chip>
						</TableCell>
						<TableCell>
							<UnitActions />
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}

function UnitActions() {
	return (
		<Dropdown>
			<DropdownTrigger>
				<Button isIconOnly variant="light" size="sm">
					<MoreVertical className="h-4 w-4" />
				</Button>
			</DropdownTrigger>
			<DropdownMenu aria-label="Ações">
				<DropdownItem key="view" startContent={<Eye className="h-4 w-4" />}>
					Ver detalhes
				</DropdownItem>
				<DropdownItem key="edit" startContent={<Pencil className="h-4 w-4" />}>
					Editar
				</DropdownItem>
				<DropdownItem
					key="lease"
					startContent={<FileText className="h-4 w-4" />}
				>
					Novo contrato
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

function getUnitTypeLabel(type: string) {
	const labels: Record<string, string> = {
		apartment: "Apartamento",
		office: "Sala",
		retail: "Loja",
		storage: "Depósito",
		parking: "Vaga",
	};
	return labels[type] || type;
}
