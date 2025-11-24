import { Card, CardBody, CardHeader } from "@heroui/react";
import { Chip } from "@heroui/react";

type AmenitiesSectionProps = {
	amenities: string[];
};

export function AmenitiesSection({ amenities }: AmenitiesSectionProps) {
	return (
		<Card className="border border-gray-200 shadow-sm">
			<CardHeader>
				<h3 className="text-lg font-semibold text-gray-900">Amenities</h3>
			</CardHeader>
			<CardBody>
				<div className="flex flex-wrap gap-2">
					{amenities.map((amenity, index) => (
						<Chip
							key={index}
							variant="flat"
							color="default"
							size="md"
						>
							{amenity}
						</Chip>
					))}
				</div>
			</CardBody>
		</Card>
	);
}

