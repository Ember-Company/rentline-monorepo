import {
	Button,
	Card,
	CardBody,
	Dropdown,
	DropdownItem,
	DropdownMenu,
	DropdownTrigger,
} from "@heroui/react";
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
						<p className="mb-2 text-gray-600 text-sm">{title}</p>
						<p className="mb-3 font-bold text-2xl text-gray-900">
							{formatCurrency(value)}
						</p>
						<div className="flex items-center gap-1 text-green-600 text-sm">
							<ArrowUp className="h-4 w-4" />
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
								<MoreVertical className="h-4 w-4" />
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
