import type { Route } from "./+types/route";
import { MetricCard } from "@/components/dashboard/metric-card";
import { LineChart } from "@/components/dashboard/line-chart";
import { DonutChart } from "@/components/dashboard/donut-chart";
import { UnitListing } from "@/components/dashboard/unit-listing";

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "Dashboard - Rentline" },
		{ name: "description", content: "Real estate management dashboard" },
	];
}

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

export default function Dashboard() {
	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="mb-6">
				<h1 className="text-2xl font-bold text-gray-900 mb-2">Overview</h1>
				<p className="text-gray-600">
					This is a detailed analysis of property sales and rental
				</p>
			</div>

			{/* Top Row - Key Metrics Cards */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
					title="Average Orders"
					value={136173}
					trend={{ percentage: 4, label: "Than last month" }}
				/>
			</div>

			{/* Middle Row - Charts */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<LineChart
					title="Property Overview"
					data={propertyOverviewData}
					maxValue={50000}
				/>
				<DonutChart
					title="Maintenance Units"
					completed={96}
					total={172}
					waiting={76}
				/>
			</div>

			{/* Bottom Section - Unit Listing */}
			<UnitListing />
		</div>
	);
}

