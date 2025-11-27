import { Button, Card, CardBody, Chip } from "@heroui/react";
import { Home, Plus } from "lucide-react";
import { Link } from "react-router";
import type { PropertyDetail } from "@/lib/mock-data/property-types";
import { formatCurrency } from "@/lib/utils/format";

interface UnitsSectionProps {
	property: PropertyDetail;
	onAddUnit?: () => void;
}

export function UnitsSection({ property, onAddUnit }: UnitsSectionProps) {
	if (!property.units || property.units.length === 0) {
		return (
			<Card className="border border-gray-200 shadow-sm">
				<CardBody className="p-6">
					<div className="mb-6 flex items-center justify-between">
						<h3 className="font-semibold text-gray-900 text-lg">Units/Rooms</h3>
						<Button
							size="sm"
							color="primary"
							startContent={<Plus className="h-4 w-4" />}
							onPress={onAddUnit}
						>
							New
						</Button>
					</div>
					<div className="py-12 text-center">
						<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
							<Home className="h-8 w-8 text-gray-400" />
						</div>
						<p className="mb-2 font-medium text-gray-600">No units added</p>
						<p className="mb-4 text-gray-500 text-sm">
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
				<div className="mb-6 flex items-center justify-between">
					<h3 className="font-semibold text-gray-900 text-lg">
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
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
					{property.units.map((unit) => (
						<Link
							key={unit.id}
							to={`/dashboard/properties/${property.id}/units/${unit.id}`}
							className="block"
						>
							<div className="h-full cursor-pointer rounded-lg border border-gray-200 p-4 transition-all hover:border-primary hover:shadow-md">
								<div className="mb-3 flex items-start justify-between">
									<div className="flex items-center gap-2">
										<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100">
											<Home className="h-5 w-5 text-primary-600" />
										</div>
										<div>
											<p className="font-semibold text-gray-900">
												Apt. {unit.unitNumber}
											</p>
											<p className="text-gray-500 text-xs">{unit.type}</p>
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
											<span className="font-medium">
												{unit.squareFeet.toLocaleString()}
											</span>{" "}
											sq ft
										</p>
									)}
									<p className="mt-2 font-semibold text-gray-900">
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
