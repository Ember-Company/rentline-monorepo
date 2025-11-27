import { Card, CardBody } from "@heroui/react";
import type { PropertyDetail } from "@/lib/mock-data/property-details";
import { formatCurrency, formatDate } from "@/lib/utils/format";

type PropertyDetailsCardProps = {
	property: PropertyDetail;
};

export function PropertyDetailsCard({ property }: PropertyDetailsCardProps) {
	const details = [
		{ label: "ID", value: property.id.toString() },
		{ label: "Rent", value: formatCurrency(property.rent) },
		{ label: "Sqft", value: property.squareFeet.toLocaleString() },
		{ label: "Price", value: formatCurrency(property.price) },
		{ label: "Units", value: property.units.toString() },
		{ label: "Listed on", value: formatDate(property.listedOn) },
	];

	return (
		<Card className="border border-gray-200 shadow-sm">
			<CardBody>
				<div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
					{details.map((detail) => (
						<div key={detail.label} className="space-y-1">
							<p className="text-gray-500 text-sm">{detail.label}</p>
							<p className="font-semibold text-base text-gray-900">
								{detail.value}
							</p>
						</div>
					))}
				</div>
			</CardBody>
		</Card>
	);
}
