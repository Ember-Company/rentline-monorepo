import { Card, CardBody, Button, Avatar, Chip, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";
import { Plus, MoreVertical } from "lucide-react";
import type { PropertyDetail } from "@/lib/mock-data/property-types";
import type { TenantEntity } from "@/lib/mock-data/tenants-entities";

interface TenantsCardEnhancedProps {
	property: PropertyDetail;
	tenantDetails: Array<{
		propertyTenant: PropertyDetail["tenants"][0];
		tenant: TenantEntity;
	}>;
	onAddTenant?: () => void;
	hasActiveLease?: boolean;
}

export function TenantsCardEnhanced({
	property,
	tenantDetails,
	onAddTenant,
	hasActiveLease = false,
}: TenantsCardEnhancedProps) {
	const getStatusColor = (status: string) => {
		switch (status) {
			case "accepted":
				return "primary";
			case "pending":
				return "warning";
			case "rejected":
				return "danger";
			default:
				return "default";
		}
	};

	const getStatusLabel = (status: string) => {
		return status.toUpperCase();
	};

	return (
		<Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
			<CardBody className="p-6">
				<div className="flex items-center justify-between mb-4">
					<h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
						Tenants ({tenantDetails.length})
					</h3>
					<Button
						size="sm"
						variant="bordered"
						startContent={<Plus className="h-4 w-4" />}
						onPress={onAddTenant}
						isDisabled={!hasActiveLease}
						className="border-gray-300 hover:border-primary hover:text-primary disabled:opacity-50"
					>
						New
					</Button>
				</div>

				<div className="space-y-3">
					{tenantDetails.length === 0 ? (
						<div className="text-center py-8">
							<p className="text-sm text-gray-500 mb-4">
								{hasActiveLease
									? "No tenants assigned"
									: "Create a lease first to add tenants"}
							</p>
							{hasActiveLease && (
								<Button
									size="sm"
									color="primary"
									startContent={<Plus className="h-4 w-4" />}
									onPress={onAddTenant}
								>
									Add Tenant
								</Button>
							)}
						</div>
					) : (
						tenantDetails.map(({ propertyTenant, tenant }) => (
							<div
								key={propertyTenant.id}
								className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
							>
								<div className="flex items-center gap-3 flex-1 min-w-0">
									<Avatar
										name={tenant.avatar || tenant.name}
										className="bg-orange-100 text-orange-600 font-semibold"
										size="sm"
									/>
									<div className="flex-1 min-w-0">
										<p className="text-sm font-medium text-gray-900 truncate">
											{tenant.name}
										</p>
										<p className="text-xs text-gray-500 truncate">
											{tenant.email}
										</p>
									</div>
									<Chip
										size="sm"
										color={getStatusColor(propertyTenant.status)}
										variant="flat"
									>
										{getStatusLabel(propertyTenant.status)}
									</Chip>
								</div>
								<Dropdown>
									<DropdownTrigger>
										<Button
											isIconOnly
											variant="light"
											size="sm"
											className="min-w-0"
										>
											<MoreVertical className="h-4 w-4" />
										</Button>
									</DropdownTrigger>
									<DropdownMenu aria-label="Tenant actions">
										<DropdownItem key="view">View Details</DropdownItem>
										<DropdownItem key="edit">Edit</DropdownItem>
										<DropdownItem key="remove" color="danger">
											Remove
										</DropdownItem>
									</DropdownMenu>
								</Dropdown>
							</div>
						))
					)}
				</div>
			</CardBody>
		</Card>
	);
}

