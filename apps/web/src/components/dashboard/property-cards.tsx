import { Button, Card, CardBody } from "@heroui/react";
import { Home, RefreshCw } from "lucide-react";
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
				<div className="mb-4 flex items-center justify-between">
					<h3 className="font-semibold text-gray-900 text-lg">My Properties</h3>
					<Button
						isIconOnly
						variant="light"
						size="sm"
						onPress={onRefresh}
						aria-label="Refresh"
					>
						<RefreshCw className="h-4 w-4" />
					</Button>
				</div>
				<div className="space-y-4">
					{properties.map((property) => (
						<div
							key={property.id}
							className="flex cursor-pointer items-center gap-4 rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50"
						>
							<div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-gray-200 to-gray-300">
								{property.image ? (
									<img
										src={property.image}
										alt={property.name}
										className="h-full w-full rounded-lg object-cover"
									/>
								) : (
									<Home className="h-8 w-8 text-gray-400" />
								)}
							</div>
							<div className="min-w-0 flex-1">
								<h4 className="mb-1 truncate font-semibold text-gray-900">
									{property.name}
								</h4>
								<p className="truncate text-gray-600 text-sm">
									{property.location}
								</p>
								<p className="mt-1 font-bold text-gray-900 text-lg">
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
