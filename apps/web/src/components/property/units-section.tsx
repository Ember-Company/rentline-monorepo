import { Card, CardBody, Button, Chip } from "@heroui/react";
import { Plus, Home } from "lucide-react";
import { Link } from "react-router";
import { formatCurrency } from "@/lib/utils/format";
import type { PropertyDetail } from "@/lib/mock-data/property-types";

interface UnitsSectionProps {
	property: PropertyDetail;
	onAddUnit?: () => void;
}

export function UnitsSection({ property, onAddUnit }: UnitsSectionProps) {
	if (!property.units || property.units.length === 0) {
		return (
			<Card className="border border-gray-200 shadow-sm">
				<CardBody className="p-6">
					<div className="flex items-center justify-between mb-6">
						<h3 className="text-lg font-semibold text-gray-900">Units/Rooms</h3>
						<Button
							size="sm"
							color="primary"
							startContent={<Plus className="h-4 w-4" />}
							onPress={onAddUnit}
						>
							New
						</Button>
					</div>
					<div className="text-center py-12">
						<div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
							<Home className="w-8 h-8 text-gray-400" />
						</div>
						<p className="text-gray-600 font-medium mb-2">No units added</p>
						<p className="text-sm text-gray-500 mb-4">
							Start by adding units to this property
						</p>
						<Button
							size="sm"
							color="primary"
							startContent={<Plus className="h-4 w-4" />}
							onPress={onAddUnit}
						>
							Add Your First Unit
						</Button>
					</div>
				</CardBody>
			</Card>
		);
	}

	const getStatusColor = (status: string) => {
		switch (status) {
			case "occupied":
				return "success";
			case "vacant":
				return "default";
			case "maintenance":
				return "warning";
			default:
				return "default";
		}
	};

	const getStatusLabel = (status: string) => {
		return status.toUpperCase();
	};

	return (
		<Card className="border border-gray-200 shadow-sm">
			<CardBody className="p-6">
				<div className="flex items-center justify-between mb-6">
					<h3 className="text-lg font-semibold text-gray-900">
						Units/Rooms ({property.units.length})
					</h3>
					<Button
						size="sm"
						color="primary"
						startContent={<Plus className="h-4 w-4" />}
						onPress={onAddUnit}
					>
						New
					</Button>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{property.units.map((unit) => (
						<Link
							key={unit.id}
							to={`/dashboard/properties/${property.id}/units/${unit.id}`}
							className="block"
						>
							<div className="border border-gray-200 rounded-lg p-4 hover:border-primary hover:shadow-md transition-all cursor-pointer h-full">
								<div className="flex items-start justify-between mb-3">
									<div className="flex items-center gap-2">
										<div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
											<Home className="w-5 h-5 text-primary-600" />
										</div>
										<div>
											<p className="font-semibold text-gray-900">Apt. {unit.unitNumber}</p>
											<p className="text-xs text-gray-500">{unit.type}</p>
										</div>
									</div>
									<Chip
										size="sm"
										color={getStatusColor(unit.status)}
										variant="flat"
										className="font-semibold"
									>
										{getStatusLabel(unit.status)}
									</Chip>
								</div>
								<div className="space-y-1 text-sm">
									{unit.bedrooms && (
										<p className="text-gray-600">
											<span className="font-medium">{unit.bedrooms}</span> bed
											{unit.bedrooms > 1 ? "s" : ""}
										</p>
									)}
									{unit.bathrooms && (
										<p className="text-gray-600">
											<span className="font-medium">{unit.bathrooms}</span> bath
											{unit.bathrooms > 1 ? "s" : ""}
										</p>
									)}
									{unit.squareFeet && (
										<p className="text-gray-600">
											<span className="font-medium">{unit.squareFeet.toLocaleString()}</span> sq ft
										</p>
									)}
									<p className="text-gray-900 font-semibold mt-2">
										{formatCurrency(unit.rent, property.currency)}
									</p>
								</div>
							</div>
						</Link>
					))}
				</div>
			</CardBody>
		</Card>
	);
}
