import {
	Button,
	Card,
	CardBody,
	CardHeader,
	Dropdown,
	DropdownItem,
	DropdownMenu,
	DropdownTrigger,
	Link,
} from "@heroui/react";
import { MoreVertical } from "lucide-react";

type DonutChartProps = {
	title: string;
	completed: number;
	total: number;
	waiting: number;
};

export function DonutChart({
	title,
	completed,
	total,
	waiting,
}: DonutChartProps) {
	const percentage = (completed / total) * 100;
	const circumference = 2 * Math.PI * 40;
	const strokeDasharray = circumference;
	const strokeDashoffset = circumference - (percentage / 100) * circumference;

	return (
		<Card className="border border-gray-200 shadow-sm">
			<CardHeader className="flex items-center justify-between pb-2">
				<h3 className="font-semibold text-gray-900 text-lg">{title}</h3>
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
					<DropdownMenu aria-label="Chart actions">
						<DropdownItem key="view">View Details</DropdownItem>
						<DropdownItem key="export">Export</DropdownItem>
					</DropdownMenu>
				</Dropdown>
			</CardHeader>
			<CardBody className="pt-0">
				<div className="flex flex-col items-center">
					<div className="relative mb-4 h-32 w-32">
						<svg className="-rotate-90 h-32 w-32 transform">
							<circle
								cx="64"
								cy="64"
								r="40"
								stroke="#e5e7eb"
								strokeWidth="12"
								fill="none"
							/>
							<circle
								cx="64"
								cy="64"
								r="40"
								stroke="#3b82f6"
								strokeWidth="12"
								fill="none"
								strokeDasharray={strokeDasharray}
								strokeDashoffset={strokeDashoffset}
								strokeLinecap="round"
							/>
							<circle
								cx="64"
								cy="64"
								r="40"
								stroke="#f97316"
								strokeWidth="12"
								fill="none"
								strokeDasharray={strokeDasharray}
								strokeDashoffset={
									strokeDashoffset - (waiting / total) * circumference
								}
								strokeLinecap="round"
								className="opacity-50"
							/>
						</svg>
						<div className="absolute inset-0 flex items-center justify-center">
							<div className="text-center">
								<p className="font-bold text-2xl text-gray-900">
									{completed}/{total}
								</p>
								<p className="text-gray-500 text-xs">Units</p>
							</div>
						</div>
					</div>
					<div className="w-full space-y-2">
						<div className="flex items-center justify-between text-sm">
							<span className="text-gray-600">Has been maintained</span>
						</div>
						<div className="flex items-center justify-between text-sm">
							<span className="text-gray-600">
								{waiting} Units still waiting
							</span>
							<Link href="#" className="text-primary text-sm">
								See details
							</Link>
						</div>
					</div>
				</div>
			</CardBody>
		</Card>
	);
}
