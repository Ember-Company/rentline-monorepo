import { Button, Card, CardBody, CardHeader, Chip } from "@heroui/react";
import { Plus } from "lucide-react";
import type { PropertyDetail } from "@/lib/mock-data/property-details";
import { formatCurrency, formatDate } from "@/lib/utils/format";

type RentOverviewCardProps = {
	property: PropertyDetail;
	onAddTenant?: () => void;
};

export function RentOverviewCard({
	property,
	onAddTenant,
}: RentOverviewCardProps) {
	// Find overdue payments
	const overduePayment = property.payments.find((p) => p.status === "overdue");
	const nextDueDate = overduePayment
		? overduePayment.period
		: property.payments.length > 0
			? property.payments[0].period
			: "N/A";

	return (
		<Card className="border border-gray-200 shadow-sm">
			<CardHeader>
				<h3 className="font-semibold text-gray-900 text-lg">Rent overview</h3>
			</CardHeader>
			<CardBody>
				{overduePayment && (
					<Chip color="danger" variant="flat" className="mb-4">
						OVERDUE
					</Chip>
				)}
				<div className="mb-2">
					<p className="font-bold text-3xl text-gray-900">
						{formatCurrency(overduePayment?.amount || property.rent)}
					</p>
				</div>
				<p className="text-gray-600 text-sm">Due {nextDueDate}</p>
			</CardBody>
		</Card>
	);
}
