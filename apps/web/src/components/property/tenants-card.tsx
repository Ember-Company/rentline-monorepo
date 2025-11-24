import { Card, CardBody, CardHeader, Button, Avatar, Chip } from "@heroui/react";
import { Plus, MoreVertical } from "lucide-react";
import type { PropertyDetail } from "@/lib/mock-data/property-details";

type TenantsCardProps = {
	property: PropertyDetail;
	onAddTenant?: () => void;
};

export function TenantsCard({ property, onAddTenant }: TenantsCardProps) {
	const getStatusColor = (
		status: "accepted" | "pending" | "rejected",
	): "success" | "warning" | "danger" => {
		switch (status) {
			case "accepted":
				return "success";
			case "pending":
				return "warning";
			case "rejected":
				return "danger";
		}
	};

	return (
		<Card className="border border-gray-200 shadow-sm">
			<CardHeader className="flex justify-between items-center">
				<h3 className="text-lg font-semibold text-gray-900">
					Tenants ({property.tenants.length})
				</h3>
				<Button
					size="sm"
					variant="light"
					startContent={<Plus className="w-4 h-4" />}
					onPress={onAddTenant}
				>
					New
				</Button>
			</CardHeader>
			<CardBody>
				<div className="space-y-4">
					{property.tenants.map((tenant) => (
						<div
							key={tenant.id}
							className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
						>
							<div className="flex items-center gap-3 flex-1">
								<Avatar
									name={tenant.name}
									size="md"
									className="w-10 h-10"
								/>
								<div className="flex-1">
									<p className="font-semibold text-gray-900">{tenant.name}</p>
									<p className="text-sm text-gray-600">{tenant.email}</p>
								</div>
								<Chip
									size="sm"
									color={getStatusColor(tenant.status)}
									variant="flat"
								>
									{tenant.status.toUpperCase()}
								</Chip>
							</div>
							<Button
								isIconOnly
								variant="light"
								size="sm"
							>
								<MoreVertical className="w-4 h-4" />
							</Button>
						</div>
					))}
					{property.tenants.length === 0 && (
						<p className="text-sm text-gray-500 text-center py-4">
							No tenants assigned
						</p>
					)}
				</div>
			</CardBody>
		</Card>
	);
}

