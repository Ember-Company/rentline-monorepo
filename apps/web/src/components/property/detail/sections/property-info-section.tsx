import {
	Card,
	CardBody,
	CardHeader,
	Chip,
	Divider,
} from "@heroui/react";
import {
	Bath,
	BedDouble,
	Building2,
	Calendar,
	Car,
	Ruler,
} from "lucide-react";
import { formatArea, formatBRL } from "@/lib/constants/brazil";
import type { Property } from "../types";

interface PropertyInfoSectionProps {
	property: Property;
}

export function PropertyInfoSection({ property }: PropertyInfoSectionProps) {
	// Determine which fields to show based on property type
	const isBuilding = property.type === "apartment_building" || property.type === "office";
	const isSingleUnit = property.type === "house" || property.type === "land";
	
	return (
		<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
			<Card className="border border-gray-200 shadow-sm lg:col-span-2">
				<CardHeader className="border-gray-100 border-b bg-gray-50/50 px-6 py-4">
					<h3 className="font-semibold text-gray-900 text-lg">
						Informações do Imóvel
					</h3>
				</CardHeader>
				<CardBody className="p-6">
					<div className="grid grid-cols-2 gap-6 md:grid-cols-3">
						{property.totalArea && (
							<InfoItem
								icon={Ruler}
								label="Área Total"
								value={formatArea(Number(property.totalArea))}
							/>
						)}
						{property.bedrooms && !isBuilding && (
							<InfoItem
								icon={BedDouble}
								label="Quartos"
								value={property.bedrooms.toString()}
							/>
						)}
						{property.bathrooms && !isBuilding && (
							<InfoItem
								icon={Bath}
								label="Banheiros"
								value={property.bathrooms.toString()}
							/>
						)}
						{property.parkingSpaces && (
							<InfoItem
								icon={Car}
								label="Vagas"
								value={property.parkingSpaces.toString()}
							/>
						)}
						{property.floors && isBuilding && (
							<InfoItem
								icon={Building2}
								label="Andares"
								value={property.floors.toString()}
							/>
						)}
						{property.yearBuilt && (
							<InfoItem
								icon={Calendar}
								label="Ano"
								value={property.yearBuilt.toString()}
							/>
						)}
					</div>
					{property.description && (
						<>
							<Divider className="my-6" />
							<div>
								<p className="mb-2 font-medium text-gray-700 text-sm">
									Descrição
								</p>
								<p className="text-gray-600 text-sm">{property.description}</p>
							</div>
						</>
					)}
					{property.amenities && property.amenities.length > 0 && (
						<>
							<Divider className="my-6" />
							<div>
								<p className="mb-3 font-medium text-gray-700 text-sm">
									Comodidades
								</p>
								<div className="flex flex-wrap gap-2">
									{property.amenities.map((amenity: string, i: number) => (
										<Chip key={i} size="sm" variant="flat">
											{amenity}
										</Chip>
									))}
								</div>
							</div>
						</>
					)}
				</CardBody>
			</Card>

			<Card className="border border-gray-200 shadow-sm">
				<CardHeader className="border-gray-100 border-b bg-gray-50/50 px-6 py-4">
					<h3 className="font-semibold text-gray-900 text-lg">Valores</h3>
				</CardHeader>
				<CardBody className="space-y-4 p-6">
					{property.monthlyRent && (
						<div className="flex items-center justify-between">
							<span className="text-gray-500 text-sm">Aluguel Mensal</span>
							<span className="font-semibold text-green-600">
								{formatBRL(Number(property.monthlyRent))}
							</span>
						</div>
					)}
					{property.askingPrice && (
						<div className="flex items-center justify-between">
							<span className="text-gray-500 text-sm">Valor de Venda</span>
							<span className="font-semibold text-gray-900">
								{formatBRL(Number(property.askingPrice))}
							</span>
						</div>
					)}
					{property.currentValue && (
						<div className="flex items-center justify-between">
							<span className="text-gray-500 text-sm">Valor Atual</span>
							<span className="font-semibold text-gray-900">
								{formatBRL(Number(property.currentValue))}
							</span>
						</div>
					)}
				</CardBody>
			</Card>
		</div>
	);
}

// Info Item Component
function InfoItem({
	icon: Icon,
	label,
	value,
}: {
	icon: typeof Ruler;
	label: string;
	value: string;
}) {
	return (
		<div className="flex items-start gap-3">
			<Icon className="h-5 w-5 text-gray-400" />
			<div>
				<p className="text-gray-500 text-sm">{label}</p>
				<p className="font-semibold text-gray-900">{value}</p>
			</div>
		</div>
	);
}
