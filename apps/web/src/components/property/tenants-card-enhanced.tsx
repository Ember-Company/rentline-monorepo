import {
	Avatar,
	Button,
	Card,
	CardBody,
	Chip,
	Dropdown,
	DropdownItem,
	DropdownMenu,
	DropdownTrigger,
} from "@heroui/react";
import { MoreVertical, Plus } from "lucide-react";
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
		<Card className="border border-gray-200 shadow-sm transition-shadow hover:shadow-md">
			<CardBody className="p-6">
				<div className="mb-4 flex items-center justify-between">
					<h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
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
						<div className="py-8 text-center">
							<p className="mb-4 text-gray-500 text-sm">
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
								className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-gray-50"
							>
								<div className="flex min-w-0 flex-1 items-center gap-3">
									<Avatar
										name={tenant.avatar || tenant.name}
										className="bg-orange-100 font-semibold text-orange-600"
										size="sm"
									/>
									<div className="min-w-0 flex-1">
										<p className="truncate font-medium text-gray-900 text-sm">
											{tenant.name}
										</p>
										<p className="truncate text-gray-500 text-xs">
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
