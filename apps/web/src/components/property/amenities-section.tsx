import { Card, CardBody, CardHeader, Chip } from "@heroui/react";

type AmenitiesSectionProps = {
	amenities: string[];
};

export function AmenitiesSection({ amenities }: AmenitiesSectionProps) {
	return (
		<Card className="border border-gray-200 shadow-sm">
			<CardHeader>
				<h3 className="font-semibold text-gray-900 text-lg">Amenities</h3>
			</CardHeader>
			<CardBody>
				<div className="flex flex-wrap gap-2">
					{amenities.map((amenity, index) => (
						<Chip key={index} variant="flat" color="default" size="md">
							{amenity}
						</Chip>
					))}
				</div>
			</CardBody>
		</Card>
	);
}
