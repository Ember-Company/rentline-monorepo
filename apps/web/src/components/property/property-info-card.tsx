import { Card, CardBody } from "@heroui/react";
import type { PropertyDetail } from "@/lib/mock-data/property-types";
import { formatCurrency, formatDate } from "@/lib/utils/format";

interface PropertyInfoCardProps {
	property: PropertyDetail;
}

export function PropertyInfoCard({ property }: PropertyInfoCardProps) {
	return (
		<Card className="border border-gray-200 shadow-sm">
			<CardBody className="p-6">
				<h3 className="mb-6 font-semibold text-gray-900 text-lg">
					Property Information
				</h3>
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
					<div className="space-y-4">
						<div>
							<p className="mb-1 font-semibold text-gray-500 text-xs uppercase tracking-wide">
								Property Type
							</p>
							<p className="font-medium text-base text-gray-900 capitalize">
								{property.type}
							</p>
						</div>
						<div>
							<p className="mb-1 font-semibold text-gray-500 text-xs uppercase tracking-wide">
								Category
							</p>
							<p className="font-medium text-base text-gray-900 capitalize">
								{property.category}
							</p>
						</div>
						{property.squareFeet && (
							<div>
								<p className="mb-1 font-semibold text-gray-500 text-xs uppercase tracking-wide">
									Total Square Feet
								</p>
								<p className="font-medium text-base text-gray-900">
									{property.squareFeet.toLocaleString()} sq ft
								</p>
							</div>
						)}
						{property.bedrooms && (
							<div>
								<p className="mb-1 font-semibold text-gray-500 text-xs uppercase tracking-wide">
									Bedrooms
								</p>
								<p className="font-medium text-base text-gray-900">
									{property.bedrooms}
								</p>
							</div>
						)}
						{property.bathrooms && (
							<div>
								<p className="mb-1 font-semibold text-gray-500 text-xs uppercase tracking-wide">
									Bathrooms
								</p>
								<p className="font-medium text-base text-gray-900">
									{property.bathrooms}
								</p>
							</div>
						)}
						{property.lotSize && (
							<div>
								<p className="mb-1 font-semibold text-gray-500 text-xs uppercase tracking-wide">
									Lot Size
								</p>
								<p className="font-medium text-base text-gray-900">
									{property.lotSize} acres
								</p>
							</div>
						)}
						{property.floors && (
							<div>
								<p className="mb-1 font-semibold text-gray-500 text-xs uppercase tracking-wide">
									Floors
								</p>
								<p className="font-medium text-base text-gray-900">
									{property.floors}
								</p>
							</div>
						)}
					</div>
					<div className="space-y-4">
						{property.price && (
							<div>
								<p className="mb-1 font-semibold text-gray-500 text-xs uppercase tracking-wide">
									Sale Price
								</p>
								<p className="font-medium text-base text-gray-900">
									{formatCurrency(property.price, property.currency)}
								</p>
							</div>
						)}
						{property.monthlyRent && (
							<div>
								<p className="mb-1 font-semibold text-gray-500 text-xs uppercase tracking-wide">
									Monthly Rent
								</p>
								<p className="font-medium text-base text-gray-900">
									{formatCurrency(property.monthlyRent, property.currency)}
								</p>
							</div>
						)}
						{property.units && property.units.length > 0 && (
							<div>
								<p className="mb-1 font-semibold text-gray-500 text-xs uppercase tracking-wide">
									Total Units
								</p>
								<p className="font-medium text-base text-gray-900">
									{property.units.length}
								</p>
							</div>
						)}
						<div>
							<p className="mb-1 font-semibold text-gray-500 text-xs uppercase tracking-wide">
								Status
							</p>
							<p className="font-medium text-base text-gray-900 capitalize">
								{property.status}
							</p>
						</div>
						<div>
							<p className="mb-1 font-semibold text-gray-500 text-xs uppercase tracking-wide">
								Listed On
							</p>
							<p className="font-medium text-base text-gray-900">
								{formatDate(property.listedOn)}
							</p>
						</div>
						<div>
							<p className="mb-1 font-semibold text-gray-500 text-xs uppercase tracking-wide">
								Last Updated
							</p>
							<p className="font-medium text-base text-gray-900">
								{formatDate(property.lastUpdate)}
							</p>
						</div>
					</div>
				</div>
				{property.description && (
					<div className="mt-6 border-gray-200 border-t pt-6">
						<p className="mb-2 font-semibold text-gray-500 text-xs uppercase tracking-wide">
							Description
						</p>
						<p className="text-base text-gray-700 leading-relaxed">
							{property.description}
						</p>
					</div>
				)}
			</CardBody>
		</Card>
	);
}
