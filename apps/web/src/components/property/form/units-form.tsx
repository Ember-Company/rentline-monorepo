import {
	Button,
	Card,
	CardBody,
	CardHeader,
	Input,
	Select,
	SelectItem,
	Spinner,
} from "@heroui/react";
import { Building2, Plus, Trash2 } from "lucide-react";
import { UNIT_TYPES } from "@/lib/constants/brazil";
import type { UnitType } from "@/lib/types/api";

export interface UnitFormData {
	id: string;
	isNew: boolean;
	unitNumber: string;
	name: string;
	type: UnitType;
	floor: string;
	bedrooms: string;
	bathrooms: string;
	area: string;
	category: "rent" | "sale" | "both";
	rentAmount: string;
	depositAmount: string;
	salePrice: string;
}

export function createEmptyUnit(): UnitFormData {
	return {
		id: crypto.randomUUID(),
		isNew: true,
		unitNumber: "",
		name: "",
		type: "apartment",
		floor: "",
		bedrooms: "",
		bathrooms: "",
		area: "",
		category: "rent",
		rentAmount: "",
		depositAmount: "",
		salePrice: "",
	};
}

interface UnitsFormProps {
	units: UnitFormData[];
	deletedUnitIds: string[];
	isLoading?: boolean;
	isDisabled?: boolean;
	onAddUnit: () => void;
	onRemoveUnit: (id: string, isNew: boolean) => void;
	onUpdateUnit: (id: string, field: keyof UnitFormData, value: string) => void;
}

export function UnitsForm({
	units,
	deletedUnitIds,
	isLoading,
	isDisabled,
	onAddUnit,
	onRemoveUnit,
	onUpdateUnit,
}: UnitsFormProps) {
	return (
		<Card className="border border-gray-200 shadow-sm">
			<CardHeader className="border-gray-100 border-b bg-gray-50/50 px-6 py-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100">
							<Building2 className="h-5 w-5 text-teal-600" />
						</div>
						<div>
							<h2 className="font-semibold text-gray-900 text-lg">Unidades</h2>
							<p className="text-gray-500 text-sm">
								Gerencie as unidades do prédio
							</p>
						</div>
					</div>
					<Button
						color="primary"
						variant="flat"
						size="sm"
						startContent={<Plus className="h-4 w-4" />}
						onPress={onAddUnit}
						isDisabled={isDisabled}
					>
						Adicionar
					</Button>
				</div>
			</CardHeader>
			<CardBody className="p-6">
				{isLoading ? (
					<div className="flex justify-center py-8">
						<Spinner />
					</div>
				) : (
					<div className="space-y-4">
						{units.map((unit, index) => (
							<UnitCard
								key={unit.id}
								unit={unit}
								index={index}
								canRemove={units.length > 1}
								isDisabled={isDisabled}
								onRemove={() => onRemoveUnit(unit.id, unit.isNew)}
								onUpdate={(field, value) => onUpdateUnit(unit.id, field, value)}
							/>
						))}
					</div>
				)}
				<UnitsSummary
					totalUnits={units.length}
					deletedCount={deletedUnitIds.length}
				/>
			</CardBody>
		</Card>
	);
}

interface UnitCardProps {
	unit: UnitFormData;
	index: number;
	canRemove: boolean;
	isDisabled?: boolean;
	onRemove: () => void;
	onUpdate: (field: keyof UnitFormData, value: string) => void;
}

function UnitCard({
	unit,
	index,
	canRemove,
	isDisabled,
	onRemove,
	onUpdate,
}: UnitCardProps) {
	return (
		<div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
			<div className="mb-3 flex items-center justify-between">
				<span className="font-medium text-gray-700 text-sm">
					Unidade {index + 1}
					{unit.isNew && (
						<span className="ml-2 rounded bg-green-100 px-2 py-0.5 text-green-700 text-xs">
							Nova
						</span>
					)}
				</span>
				{canRemove && (
					<Button
						isIconOnly
						size="sm"
						variant="light"
						color="danger"
						onPress={onRemove}
						isDisabled={isDisabled}
					>
						<Trash2 className="h-4 w-4" />
					</Button>
				)}
			</div>
			<div className="grid grid-cols-2 gap-3 md:grid-cols-4">
				<Input
					size="sm"
					label="Número"
					placeholder="01, 101, etc."
					value={unit.unitNumber}
					onValueChange={(v) => onUpdate("unitNumber", v)}
					isRequired
					isDisabled={isDisabled}
					classNames={{
						inputWrapper: "border-gray-200 bg-white hover:border-gray-300",
					}}
				/>
				<Input
					size="sm"
					label="Nome"
					placeholder="Apto 01"
					value={unit.name}
					onValueChange={(v) => onUpdate("name", v)}
					isDisabled={isDisabled}
					classNames={{
						inputWrapper: "border-gray-200 bg-white hover:border-gray-300",
					}}
				/>
				<Select
					size="sm"
					label="Tipo"
					selectedKeys={[unit.type]}
					onSelectionChange={(keys) =>
						onUpdate("type", Array.from(keys)[0] as string)
					}
					isDisabled={isDisabled}
					classNames={{
						trigger: "border-gray-200 bg-white hover:border-gray-300",
					}}
				>
					{UNIT_TYPES.map((t) => (
						<SelectItem key={t.value}>{t.label}</SelectItem>
					))}
				</Select>
				<Input
					size="sm"
					type="number"
					label="Andar"
					placeholder="1"
					value={unit.floor}
					onValueChange={(v) => onUpdate("floor", v)}
					isDisabled={isDisabled}
					classNames={{
						inputWrapper: "border-gray-200 bg-white hover:border-gray-300",
					}}
				/>
			</div>

			{/* Category Selection */}
			<div className="mt-3">
				<Select
					size="sm"
					label="Disponibilidade"
					description="Alugar, vender ou ambos"
					selectedKeys={[unit.category]}
					onSelectionChange={(keys) =>
						onUpdate("category", Array.from(keys)[0] as string)
					}
					isDisabled={isDisabled}
					classNames={{
						trigger: "border-gray-200 bg-white hover:border-gray-300",
					}}
				>
					<SelectItem key="rent">Apenas Aluguel</SelectItem>
					<SelectItem key="sale">Apenas Venda</SelectItem>
					<SelectItem key="both">Aluguel e Venda</SelectItem>
				</Select>
			</div>

			{/* Physical Characteristics */}
			<div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3">
				<Input
					size="sm"
					type="number"
					label="Quartos"
					placeholder="0"
					value={unit.bedrooms}
					onValueChange={(v) => onUpdate("bedrooms", v)}
					isDisabled={isDisabled}
					classNames={{
						inputWrapper: "border-gray-200 bg-white hover:border-gray-300",
					}}
				/>
				<Input
					size="sm"
					type="number"
					label="Banheiros"
					placeholder="0"
					value={unit.bathrooms}
					onValueChange={(v) => onUpdate("bathrooms", v)}
					isDisabled={isDisabled}
					classNames={{
						inputWrapper: "border-gray-200 bg-white hover:border-gray-300",
					}}
				/>
				<Input
					size="sm"
					type="number"
					label="Área (m²)"
					placeholder="0"
					value={unit.area}
					onValueChange={(v) => onUpdate("area", v)}
					isDisabled={isDisabled}
					classNames={{
						inputWrapper: "border-gray-200 bg-white hover:border-gray-300",
					}}
				/>
			</div>

			{/* Financial Fields - Conditional based on category */}
			<div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
				{(unit.category === "rent" || unit.category === "both") && (
					<>
						<Input
							size="sm"
							type="number"
							label="Aluguel Mensal (R$)"
							placeholder="0,00"
							value={unit.rentAmount}
							onValueChange={(v) => onUpdate("rentAmount", v)}
							isDisabled={isDisabled}
							startContent={<span className="text-gray-400 text-sm">R$</span>}
							classNames={{
								inputWrapper: "border-gray-200 bg-white hover:border-gray-300",
							}}
						/>
						<Input
							size="sm"
							type="number"
							label="Depósito (R$)"
							placeholder="0,00"
							value={unit.depositAmount}
							onValueChange={(v) => onUpdate("depositAmount", v)}
							isDisabled={isDisabled}
							startContent={<span className="text-gray-400 text-sm">R$</span>}
							classNames={{
								inputWrapper: "border-gray-200 bg-white hover:border-gray-300",
							}}
						/>
					</>
				)}
				{(unit.category === "sale" || unit.category === "both") && (
					<Input
						size="sm"
						type="number"
						label="Preço de Venda (R$)"
						placeholder="0,00"
						value={unit.salePrice}
						onValueChange={(v) => onUpdate("salePrice", v)}
						isDisabled={isDisabled}
						startContent={<span className="text-gray-400 text-sm">R$</span>}
						classNames={{
							inputWrapper: "border-gray-200 bg-white hover:border-gray-300",
						}}
					/>
				)}
			</div>
		</div>
	);
}

function UnitsSummary({
	totalUnits,
	deletedCount,
}: {
	totalUnits: number;
	deletedCount: number;
}) {
	return (
		<p className="mt-4 text-gray-500 text-sm">
			{totalUnits} {totalUnits === 1 ? "unidade" : "unidades"}
			{deletedCount > 0 && (
				<span className="ml-2 text-red-500">
					({deletedCount} a ser{deletedCount > 1 ? "em" : ""} removida
					{deletedCount > 1 ? "s" : ""})
				</span>
			)}
		</p>
	);
}
