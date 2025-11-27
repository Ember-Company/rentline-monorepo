import {
	Button,
	Card,
	CardBody,
	Chip,
	Dropdown,
	DropdownItem,
	DropdownMenu,
	DropdownTrigger,
} from "@heroui/react";
import { ChevronDown, Edit, Plus } from "lucide-react";
import { useNavigate } from "react-router";
import type { Lease, PropertyDetail } from "@/lib/mock-data/property-types";
import { formatCurrency, formatDate } from "@/lib/utils/format";

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
			<Card className="border border-gray-200 shadow-sm transition-shadow hover:shadow-md">
				<CardBody className="p-6">
					<div className="mb-4 flex items-start justify-between">
						<h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
							Rent overview
						</h3>
					</div>
					<div className="py-8 text-center">
						<p className="mb-4 text-gray-500">No active lease</p>
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
	const dueDate = new Date(
		today.getFullYear(),
		today.getMonth(),
		lease.paymentDay,
	);
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
		<Card className="border border-gray-200 shadow-sm transition-shadow hover:shadow-md">
			<CardBody className="p-6">
				<div className="mb-4 flex items-start justify-between">
					<h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
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
					<p className="font-bold text-3xl text-gray-900">
						{formatCurrency(lease.monthlyRent, lease.currency)}
					</p>
					<p className="text-gray-600 text-sm">
						Due {formatDate(dueDate.toISOString().split("T")[0])}
					</p>
				</div>
			</CardBody>
		</Card>
	);
}
