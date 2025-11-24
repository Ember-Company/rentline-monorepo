import { Card, CardBody } from "@heroui/react";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import type { PropertyDetail } from "@/lib/mock-data/property-types";

interface PropertyInfoCardProps {
	property: PropertyDetail;
}

export function PropertyInfoCard({ property }: PropertyInfoCardProps) {
	return (
		<Card className="border border-gray-200 shadow-sm">
			<CardBody className="p-6">
				<h3 className="text-lg font-semibold text-gray-900 mb-6">Property Information</h3>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div className="space-y-4">
						<div>
							<p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
								Property Type
							</p>
							<p className="text-base font-medium text-gray-900 capitalize">{property.type}</p>
						</div>
						<div>
							<p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
								Category
							</p>
							<p className="text-base font-medium text-gray-900 capitalize">
								{property.category}
							</p>
						</div>
						{property.squareFeet && (
							<div>
								<p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
									Total Square Feet
								</p>
								<p className="text-base font-medium text-gray-900">
									{property.squareFeet.toLocaleString()} sq ft
								</p>
							</div>
						)}
						{property.bedrooms && (
							<div>
								<p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
									Bedrooms
								</p>
								<p className="text-base font-medium text-gray-900">{property.bedrooms}</p>
							</div>
						)}
						{property.bathrooms && (
							<div>
								<p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
									Bathrooms
								</p>
								<p className="text-base font-medium text-gray-900">{property.bathrooms}</p>
							</div>
						)}
						{property.lotSize && (
							<div>
								<p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
									Lot Size
								</p>
								<p className="text-base font-medium text-gray-900">{property.lotSize} acres</p>
							</div>
						)}
						{property.floors && (
							<div>
								<p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
									Floors
								</p>
								<p className="text-base font-medium text-gray-900">{property.floors}</p>
							</div>
						)}
					</div>
					<div className="space-y-4">
						{property.price && (
							<div>
								<p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
									Sale Price
								</p>
								<p className="text-base font-medium text-gray-900">
									{formatCurrency(property.price, property.currency)}
								</p>
							</div>
						)}
						{property.monthlyRent && (
							<div>
								<p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
									Monthly Rent
								</p>
								<p className="text-base font-medium text-gray-900">
									{formatCurrency(property.monthlyRent, property.currency)}
								</p>
							</div>
						)}
						{property.units && property.units.length > 0 && (
							<div>
								<p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
									Total Units
								</p>
								<p className="text-base font-medium text-gray-900">{property.units.length}</p>
							</div>
						)}
						<div>
							<p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
								Status
							</p>
							<p className="text-base font-medium text-gray-900 capitalize">{property.status}</p>
						</div>
						<div>
							<p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
								Listed On
							</p>
							<p className="text-base font-medium text-gray-900">
								{formatDate(property.listedOn)}
							</p>
						</div>
						<div>
							<p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
								Last Updated
							</p>
							<p className="text-base font-medium text-gray-900">
								{formatDate(property.lastUpdate)}
							</p>
						</div>
					</div>
				</div>
				{property.description && (
					<div className="mt-6 pt-6 border-t border-gray-200">
						<p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
							Description
						</p>
						<p className="text-base text-gray-700 leading-relaxed">{property.description}</p>
					</div>
				)}
			</CardBody>
		</Card>
	);
}

