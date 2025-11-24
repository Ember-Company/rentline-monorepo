import { Card, CardBody, Button } from "@heroui/react";
import { RefreshCw, Home } from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";

type Property = {
	id: number;
	name: string;
	location: string;
	price: number;
	image?: string;
};

type PropertyCardsProps = {
	properties: Property[];
	onRefresh?: () => void;
};

export function PropertyCards({ properties, onRefresh }: PropertyCardsProps) {
	return (
		<Card className="border border-gray-200 shadow-sm">
			<CardBody className="p-6">
				<div className="flex items-center justify-between mb-4">
					<h3 className="text-lg font-semibold text-gray-900">My Properties</h3>
					<Button
						isIconOnly
						variant="light"
						size="sm"
						onPress={onRefresh}
						aria-label="Refresh"
					>
						<RefreshCw className="w-4 h-4" />
					</Button>
				</div>
				<div className="space-y-4">
					{properties.map((property) => (
						<div
							key={property.id}
							className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
						>
							<div className="w-20 h-20 rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center flex-shrink-0">
								{property.image ? (
									<img
										src={property.image}
										alt={property.name}
										className="w-full h-full object-cover rounded-lg"
									/>
								) : (
									<Home className="w-8 h-8 text-gray-400" />
								)}
							</div>
							<div className="flex-1 min-w-0">
								<h4 className="font-semibold text-gray-900 mb-1 truncate">
									{property.name}
								</h4>
								<p className="text-sm text-gray-600 truncate">{property.location}</p>
								<p className="text-lg font-bold text-gray-900 mt-1">
									{formatCurrency(property.price)} /month
								</p>
							</div>
						</div>
					))}
				</div>
			</CardBody>
		</Card>
	);
}

