import {
	Button,
	Card,
	CardBody,
	CardHeader,
	Select,
	SelectItem,
} from "@heroui/react";
import { BarChart3, Download, FileText, TrendingUp } from "lucide-react";
import { DonutChart } from "@/components/dashboard/donut-chart";
import { LineChart } from "@/components/dashboard/line-chart";
import { MetricCard } from "@/components/dashboard/metric-card";
import { PageHeader } from "@/components/dashboard/page-header";
import type { Route } from "./+types/route";

const propertyOverviewData = [
	{ month: "Jan", value: 12000 },
	{ month: "Feb", value: 15000 },
	{ month: "Mar", value: 18000 },
	{ month: "Apr", value: 22000 },
	{ month: "May", value: 30928 },
	{ month: "Jun", value: 28000 },
	{ month: "Jul", value: 32000 },
	{ month: "Aug", value: 35000 },
	{ month: "Sep", value: 38000 },
	{ month: "Oct", value: 40000 },
	{ month: "Nov", value: 42000 },
	{ month: "Dec", value: 45000 },
];

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "Reports - Rentline" },
		{ name: "description", content: "View and generate reports" },
	];
}

export default function ReportsPage() {
	return (
		<div className="space-y-6">
			<PageHeader
				title="Reports"
				subtitle="Generate and view detailed reports"
				actions={
					<>
						<Select
							defaultSelectedKeys={["monthly"]}
							className="w-40"
							labelPlacement="outside"
						>
							<SelectItem key="daily">Daily</SelectItem>
							<SelectItem key="weekly">Weekly</SelectItem>
							<SelectItem key="monthly">Monthly</SelectItem>
							<SelectItem key="yearly">Yearly</SelectItem>
						</Select>
						<Button
							color="primary"
							startContent={<Download className="h-4 w-4" />}
						>
							Export Report
						</Button>
					</>
				}
			/>

			{/* Summary Cards */}
			<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
				<MetricCard
					title="Total Income"
					value={143083}
					trend={{ percentage: 6, label: "Than last month" }}
				/>
				<MetricCard
					title="Total Expenses"
					value={72138}
					trend={{ percentage: 4, label: "Than last month" }}
				/>
				<MetricCard
					title="Net Profit"
					value={70945}
					trend={{ percentage: 8, label: "Than last month" }}
				/>
			</div>

			{/* Charts */}
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
				<LineChart
					title="Property Performance"
					data={propertyOverviewData}
					maxValue={50000}
				/>
				<DonutChart
					title="Maintenance Status"
					completed={96}
					total={172}
					waiting={76}
				/>
			</div>

			{/* Report Types */}
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
				<Card className="cursor-pointer border border-gray-200 shadow-sm transition-shadow hover:shadow-md">
					<CardBody className="p-6">
						<div className="flex items-center gap-4">
							<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
								<FileText className="h-6 w-6 text-blue-600" />
							</div>
							<div>
								<h3 className="font-semibold text-gray-900">Income Report</h3>
								<p className="text-gray-600 text-sm">View income details</p>
							</div>
						</div>
					</CardBody>
				</Card>
				<Card className="cursor-pointer border border-gray-200 shadow-sm transition-shadow hover:shadow-md">
					<CardBody className="p-6">
						<div className="flex items-center gap-4">
							<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
								<BarChart3 className="h-6 w-6 text-green-600" />
							</div>
							<div>
								<h3 className="font-semibold text-gray-900">Expense Report</h3>
								<p className="text-gray-600 text-sm">View expense breakdown</p>
							</div>
						</div>
					</CardBody>
				</Card>
				<Card className="cursor-pointer border border-gray-200 shadow-sm transition-shadow hover:shadow-md">
					<CardBody className="p-6">
						<div className="flex items-center gap-4">
							<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
								<TrendingUp className="h-6 w-6 text-purple-600" />
							</div>
							<div>
								<h3 className="font-semibold text-gray-900">Profit Report</h3>
								<p className="text-gray-600 text-sm">View profit analysis</p>
							</div>
						</div>
					</CardBody>
				</Card>
			</div>
		</div>
	);
}
