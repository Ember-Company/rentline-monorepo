import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";
import { Home, MoreVertical, ChevronDown } from "lucide-react";
import { Link } from "react-router";
import { formatDate } from "@/lib/utils/format";
import type { PropertyDetail } from "@/lib/mock-data/property-types";

interface EnhancedPropertyHeaderProps {
	property: PropertyDetail;
	activeLeaseId?: string;
	onLeaseChange?: (leaseId: string) => void;
	onAddClick?: () => void;
}

export function EnhancedPropertyHeader({
	property,
	activeLeaseId,
	onLeaseChange,
	onAddClick,
}: EnhancedPropertyHeaderProps) {
	const activeLease = property.leases.find((l) => l.id === activeLeaseId) || property.leases[0];

	return (
		<div className="space-y-4 pb-4">
			{/* Breadcrumbs */}
			<div className="flex items-center gap-2 text-sm text-gray-600">
				<Link to="/dashboard/properties" className="hover:text-primary transition-colors">
					Properties
				</Link>
				<span>/</span>
				<span className="text-gray-900 font-medium">{property.name}</span>
			</div>

			{/* Property Name and Address */}
			<div className="flex items-start justify-between gap-4">
				<div className="flex items-start gap-3 flex-1 min-w-0">
					<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary-100 to-primary-200 flex-shrink-0">
						<Home className="h-6 w-6 text-primary-600" />
					</div>
					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-2 mb-1">
							<h1 className="text-2xl font-bold text-gray-900 truncate">{property.name}</h1>
							<Dropdown>
								<DropdownTrigger>
									<Button
										isIconOnly
										variant="light"
										size="sm"
										className="min-w-0 flex-shrink-0"
									>
										<MoreVertical className="h-4 w-4" />
									</Button>
								</DropdownTrigger>
								<DropdownMenu aria-label="Property actions">
									<DropdownItem key="edit">Edit Property</DropdownItem>
									<DropdownItem key="duplicate">Duplicate</DropdownItem>
									<DropdownItem key="delete" color="danger">
										Delete
									</DropdownItem>
								</DropdownMenu>
							</Dropdown>
						</div>
						<p className="text-sm text-gray-600 truncate">
							{property.address}, {property.city}, {property.state}, {property.postalCode}
						</p>
					</div>
				</div>

				{/* Lease Info and Add Button */}
				<div className="flex items-center gap-3 flex-shrink-0">
					{activeLease && (
						<Dropdown>
							<DropdownTrigger>
								<Button
									variant="bordered"
									endContent={<ChevronDown className="h-4 w-4" />}
									className="border-gray-300 text-left h-auto py-2"
								>
									<div className="flex flex-col items-start">
										<span className="text-xs font-medium text-gray-700">Lease</span>
										<span className="text-xs font-normal text-gray-600">
											{formatDate(activeLease.startDate)} - {formatDate(activeLease.endDate)}
										</span>
									</div>
								</Button>
							</DropdownTrigger>
							<DropdownMenu
								aria-label="Lease selection"
								selectedKeys={activeLeaseId ? [activeLeaseId] : []}
								selectionMode="single"
								onSelectionChange={(keys) => {
									const selected = Array.from(keys)[0] as string;
									onLeaseChange?.(selected);
								}}
							>
								{property.leases.map((lease) => (
									<DropdownItem key={lease.id}>
										{formatDate(lease.startDate)} - {formatDate(lease.endDate)}
									</DropdownItem>
								))}
							</DropdownMenu>
						</Dropdown>
					)}
					<Button
						color="primary"
						onPress={onAddClick}
						className="bg-primary text-white hover:bg-primary-600"
					>
						+ Add
					</Button>
				</div>
			</div>
		</div>
	);
}

