import { Card, CardBody, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";
import { ArrowUp, MoreVertical } from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";

type MetricCardProps = {
	title: string;
	value: number;
	trend: {
		percentage: number;
		label: string;
	};
};

export function MetricCard({ title, value, trend }: MetricCardProps) {
	return (
		<Card className="border border-gray-200 shadow-sm">
			<CardBody className="p-6">
				<div className="flex items-start justify-between">
					<div className="flex-1">
						<p className="text-sm text-gray-600 mb-2">{title}</p>
						<p className="text-2xl font-bold text-gray-900 mb-3">
							{formatCurrency(value)}
						</p>
						<div className="flex items-center gap-1 text-sm text-green-600">
							<ArrowUp className="w-4 h-4" />
							<span>
								{trend.percentage}% {trend.label}
							</span>
						</div>
					</div>
					<Dropdown>
						<DropdownTrigger>
							<Button
								isIconOnly
								variant="light"
								size="sm"
								className="text-gray-400"
							>
								<MoreVertical className="w-4 h-4" />
							</Button>
						</DropdownTrigger>
						<DropdownMenu aria-label="Card actions">
							<DropdownItem key="view">View Details</DropdownItem>
							<DropdownItem key="export">Export</DropdownItem>
						</DropdownMenu>
					</Dropdown>
				</div>
			</CardBody>
		</Card>
	);
}

