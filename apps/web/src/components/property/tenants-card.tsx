import {
	Avatar,
	Button,
	Card,
	CardBody,
	CardHeader,
	Chip,
} from "@heroui/react";
import { MoreVertical, Plus } from "lucide-react";
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
			<CardHeader className="flex items-center justify-between">
				<h3 className="font-semibold text-gray-900 text-lg">
					Tenants ({property.tenants.length})
				</h3>
				<Button
					size="sm"
					variant="light"
					startContent={<Plus className="h-4 w-4" />}
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
							className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
						>
							<div className="flex flex-1 items-center gap-3">
								<Avatar name={tenant.name} size="md" className="h-10 w-10" />
								<div className="flex-1">
									<p className="font-semibold text-gray-900">{tenant.name}</p>
									<p className="text-gray-600 text-sm">{tenant.email}</p>
								</div>
								<Chip
									size="sm"
									color={getStatusColor(tenant.status)}
									variant="flat"
								>
									{tenant.status.toUpperCase()}
								</Chip>
							</div>
							<Button isIconOnly variant="light" size="sm">
								<MoreVertical className="h-4 w-4" />
							</Button>
						</div>
					))}
					{property.tenants.length === 0 && (
						<p className="py-4 text-center text-gray-500 text-sm">
							No tenants assigned
						</p>
					)}
				</div>
			</CardBody>
		</Card>
	);
}
