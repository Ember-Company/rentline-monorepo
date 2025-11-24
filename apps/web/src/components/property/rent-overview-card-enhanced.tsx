import { Card, CardBody, Button, Chip, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";
import { Edit, ChevronDown, Plus } from "lucide-react";
import { useNavigate } from "react-router";
import { formatCurrency } from "@/lib/utils/format";
import { formatDate } from "@/lib/utils/format";
import type { PropertyDetail, Lease } from "@/lib/mock-data/property-types";

interface RentOverviewCardEnhancedProps {
	property: PropertyDetail;
	lease?: Lease;
	onEditLease?: () => void;
}

export function RentOverviewCardEnhanced({
	property,
	lease,
	onEditLease,
}: RentOverviewCardEnhancedProps) {
	const navigate = useNavigate();

	if (!lease) {
		return (
			<Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
				<CardBody className="p-6">
					<div className="flex items-start justify-between mb-4">
						<h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
							Rent overview
						</h3>
					</div>
					<div className="text-center py-8">
						<p className="text-gray-500 mb-4">No active lease</p>
						<Button
							color="primary"
							startContent={<Plus className="h-4 w-4" />}
							onPress={() => {
								if (onEditLease) {
									onEditLease();
								} else {
									navigate(`/dashboard/properties/${property.id}/lease/new`);
								}
							}}
						>
							Add Lease
						</Button>
					</div>
				</CardBody>
			</Card>
		);
	}

	const today = new Date();
	const dueDate = new Date(today.getFullYear(), today.getMonth(), lease.paymentDay);
	if (dueDate < today) {
		dueDate.setMonth(dueDate.getMonth() + 1);
	}
	const isOverdue = dueDate < today;

	const handleEditLease = () => {
		if (onEditLease) {
			onEditLease();
		} else {
			navigate(`/dashboard/properties/${property.id}/lease/${lease.id}/edit`);
		}
	};

	return (
		<Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
			<CardBody className="p-6">
				<div className="flex items-start justify-between mb-4">
					<h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
						Rent overview
					</h3>
					<Dropdown>
						<DropdownTrigger>
							<Button
								variant="light"
								size="sm"
								endContent={<ChevronDown className="h-4 w-4" />}
								className="text-gray-600 hover:text-gray-900"
							>
								Edit lease
							</Button>
						</DropdownTrigger>
						<DropdownMenu aria-label="Lease actions">
							<DropdownItem key="edit" onPress={handleEditLease}>
								Edit lease
							</DropdownItem>
							<DropdownItem key="renew">Renew lease</DropdownItem>
							<DropdownItem key="terminate" color="danger">
								Terminate lease
							</DropdownItem>
						</DropdownMenu>
					</Dropdown>
				</div>

				{isOverdue && (
					<Chip
						color="danger"
						variant="flat"
						className="mb-4 font-semibold text-xs"
						size="sm"
					>
						OVERDUE
					</Chip>
				)}

				<div className="space-y-1">
					<p className="text-3xl font-bold text-gray-900">
						{formatCurrency(lease.monthlyRent, lease.currency)}
					</p>
					<p className="text-sm text-gray-600">
						Due {formatDate(dueDate.toISOString().split("T")[0])}
					</p>
				</div>
			</CardBody>
		</Card>
	);
}

