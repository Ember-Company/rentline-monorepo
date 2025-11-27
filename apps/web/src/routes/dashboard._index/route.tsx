import { Avatar, Button, Card, CardBody, Progress } from "@heroui/react";
import {
	AlertCircle,
	ArrowRight,
	Building2,
	Calendar,
	CheckCircle,
	Clock,
	DollarSign,
	FileText,
	Home,
	Plus,
	TrendingDown,
	TrendingUp,
	Users,
	Wrench,
} from "lucide-react";
import { Link } from "react-router";
import { formatCurrency } from "@/lib/utils/format";
import type { Route } from "./+types/route";

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "Dashboard - Rentline" },
		{ name: "description", content: "Real estate management dashboard" },
	];
}

// Mock data for dashboard
const dashboardData = {
	totalIncome: 143083,
	totalExpenses: 72138,
	netProfit: 70945,
	occupancyRate: 92,
	totalProperties: 24,
	occupiedUnits: 22,
	vacantUnits: 2,
	totalTenants: 28,
	pendingPayments: 5,
	overduePayments: 2,
	maintenanceRequests: 8,
	pendingMaintenance: 3,
};

const recentPayments = [
	{
		id: 1,
		tenant: "John Smith",
		property: "123 Main St, Apt 2B",
		amount: 2500,
		date: "2025-01-15",
		status: "paid" as const,
	},
	{
		id: 2,
		tenant: "Sarah Johnson",
		property: "456 Oak Ave, Unit 5",
		amount: 3200,
		date: "2025-01-14",
		status: "paid" as const,
	},
	{
		id: 3,
		tenant: "Mike Davis",
		property: "789 Pine Rd",
		amount: 2800,
		date: "2025-01-13",
		status: "pending" as const,
	},
	{
		id: 4,
		tenant: "Emily Brown",
		property: "321 Elm St, Apt 3A",
		amount: 2100,
		date: "2025-01-12",
		status: "overdue" as const,
	},
];

const upcomingLeases = [
	{
		id: 1,
		tenant: "David Wilson",
		property: "654 Maple Dr",
		expiresIn: 14,
		rent: 3500,
	},
	{
		id: 2,
		tenant: "Jennifer Lee",
		property: "987 Cedar Ln",
		expiresIn: 28,
		rent: 2400,
	},
	{
		id: 3,
		tenant: "Robert Taylor",
		property: "147 Birch Ave",
		expiresIn: 45,
		rent: 2900,
	},
];

const recentMaintenance = [
	{
		id: 1,
		issue: "Leaky faucet in kitchen",
		property: "123 Main St, Apt 2B",
		priority: "medium" as const,
		status: "pending" as const,
	},
	{
		id: 2,
		issue: "HVAC not working",
		property: "456 Oak Ave, Unit 5",
		priority: "urgent" as const,
		status: "in-progress" as const,
	},
	{
		id: 3,
		issue: "Broken window",
		property: "789 Pine Rd",
		priority: "high" as const,
		status: "completed" as const,
	},
];

export default function Dashboard() {
	const netProfitMargin =
		dashboardData.totalIncome > 0
			? ((dashboardData.netProfit / dashboardData.totalIncome) * 100).toFixed(1)
			: "0";

	return (
		<div className="space-y-8">
			{/* Welcome Header */}
			<div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
				<div>
					<h1 className="font-bold text-3xl text-gray-900">Welcome back!</h1>
					<p className="mt-1 text-gray-600">
						Here's what's happening with your properties today.
					</p>
				</div>
				<div className="flex gap-3">
					<Button
						as={Link}
						to="/dashboard/properties"
						variant="bordered"
						className="font-medium"
						startContent={<Plus className="h-4 w-4" />}
					>
						Add Property
					</Button>
					<Button
						as={Link}
						to="/dashboard/payments"
						color="primary"
						className="font-medium"
						startContent={<DollarSign className="h-4 w-4" />}
					>
						Record Payment
					</Button>
				</div>
			</div>

			{/* Main Stats Grid */}
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
				{/* Total Income */}
				<Card className="overflow-hidden border border-gray-200 shadow-sm">
					<CardBody className="p-6">
						<div className="flex items-start justify-between">
							<div>
								<p className="font-medium text-gray-500 text-sm">
									Total Income
								</p>
								<p className="mt-2 font-bold text-3xl text-gray-900">
									{formatCurrency(dashboardData.totalIncome)}
								</p>
								<div className="mt-2 flex items-center gap-1">
									<TrendingUp className="h-4 w-4 text-emerald-500" />
									<span className="font-medium text-emerald-600 text-sm">
										+12.5%
									</span>
									<span className="text-gray-500 text-sm">vs last month</span>
								</div>
							</div>
							<div className="rounded-xl bg-emerald-50 p-3">
								<DollarSign className="h-6 w-6 text-emerald-600" />
							</div>
						</div>
					</CardBody>
				</Card>

				{/* Total Expenses */}
				<Card className="overflow-hidden border border-gray-200 shadow-sm">
					<CardBody className="p-6">
						<div className="flex items-start justify-between">
							<div>
								<p className="font-medium text-gray-500 text-sm">
									Total Expenses
								</p>
								<p className="mt-2 font-bold text-3xl text-gray-900">
									{formatCurrency(dashboardData.totalExpenses)}
								</p>
								<div className="mt-2 flex items-center gap-1">
									<TrendingDown className="h-4 w-4 text-red-500" />
									<span className="font-medium text-red-600 text-sm">
										+8.2%
									</span>
									<span className="text-gray-500 text-sm">vs last month</span>
								</div>
							</div>
							<div className="rounded-xl bg-red-50 p-3">
								<FileText className="h-6 w-6 text-red-600" />
							</div>
						</div>
					</CardBody>
				</Card>

				{/* Net Profit */}
				<Card className="overflow-hidden border border-gray-200 shadow-sm">
					<CardBody className="p-6">
						<div className="flex items-start justify-between">
							<div>
								<p className="font-medium text-gray-500 text-sm">Net Profit</p>
								<p className="mt-2 font-bold text-3xl text-emerald-600">
									{formatCurrency(dashboardData.netProfit)}
								</p>
								<div className="mt-2 flex items-center gap-1">
									<span className="font-medium text-gray-600 text-sm">
										{netProfitMargin}% margin
									</span>
								</div>
							</div>
							<div className="rounded-xl bg-primary/10 p-3">
								<TrendingUp className="h-6 w-6 text-primary" />
							</div>
						</div>
					</CardBody>
				</Card>

				{/* Occupancy Rate */}
				<Card className="overflow-hidden border border-gray-200 shadow-sm">
					<CardBody className="p-6">
						<div className="flex items-start justify-between">
							<div className="flex-1">
								<p className="font-medium text-gray-500 text-sm">
									Occupancy Rate
								</p>
								<p className="mt-2 font-bold text-3xl text-gray-900">
									{dashboardData.occupancyRate}%
								</p>
								<Progress
									value={dashboardData.occupancyRate}
									className="mt-3"
									classNames={{
										indicator: "bg-primary",
										track: "bg-gray-100",
									}}
									size="sm"
								/>
							</div>
							<div className="rounded-xl bg-blue-50 p-3">
								<Building2 className="h-6 w-6 text-blue-600" />
							</div>
						</div>
					</CardBody>
				</Card>
			</div>

			{/* Quick Stats */}
			<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
				<Link
					to="/dashboard/properties"
					className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-primary hover:shadow-md"
				>
					<div className="rounded-lg bg-primary/10 p-2.5">
						<Home className="h-5 w-5 text-primary" />
					</div>
					<div>
						<p className="font-bold text-2xl text-gray-900">
							{dashboardData.totalProperties}
						</p>
						<p className="text-gray-500 text-sm">Properties</p>
					</div>
				</Link>

				<Link
					to="/dashboard/tenants"
					className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-primary hover:shadow-md"
				>
					<div className="rounded-lg bg-emerald-50 p-2.5">
						<Users className="h-5 w-5 text-emerald-600" />
					</div>
					<div>
						<p className="font-bold text-2xl text-gray-900">
							{dashboardData.totalTenants}
						</p>
						<p className="text-gray-500 text-sm">Tenants</p>
					</div>
				</Link>

				<Link
					to="/dashboard/payments"
					className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-primary hover:shadow-md"
				>
					<div className="rounded-lg bg-amber-50 p-2.5">
						<Clock className="h-5 w-5 text-amber-600" />
					</div>
					<div>
						<p className="font-bold text-2xl text-gray-900">
							{dashboardData.pendingPayments}
						</p>
						<p className="text-gray-500 text-sm">Pending Payments</p>
					</div>
				</Link>

				<Link
					to="/dashboard/maintenance"
					className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-primary hover:shadow-md"
				>
					<div className="rounded-lg bg-red-50 p-2.5">
						<Wrench className="h-5 w-5 text-red-600" />
					</div>
					<div>
						<p className="font-bold text-2xl text-gray-900">
							{dashboardData.pendingMaintenance}
						</p>
						<p className="text-gray-500 text-sm">Open Requests</p>
					</div>
				</Link>
			</div>

			{/* Main Content Grid */}
			<div className="grid gap-6 lg:grid-cols-3">
				{/* Recent Payments */}
				<Card className="border border-gray-200 shadow-sm lg:col-span-2">
					<CardBody className="p-0">
						<div className="flex items-center justify-between border-gray-200 border-b p-6">
							<div>
								<h2 className="font-semibold text-gray-900 text-lg">
									Recent Payments
								</h2>
								<p className="mt-1 text-gray-500 text-sm">
									Latest rent payments from tenants
								</p>
							</div>
							<Button
								as={Link}
								to="/dashboard/payments"
								variant="light"
								size="sm"
								endContent={<ArrowRight className="h-4 w-4" />}
							>
								View All
							</Button>
						</div>
						<div className="divide-y divide-gray-100">
							{recentPayments.map((payment) => (
								<div
									key={payment.id}
									className="flex items-center justify-between p-4 hover:bg-gray-50"
								>
									<div className="flex items-center gap-4">
										<Avatar
											name={payment.tenant
												.split(" ")
												.map((n) => n[0])
												.join("")}
											className="bg-primary/10 font-semibold text-primary"
											size="sm"
										/>
										<div>
											<p className="font-medium text-gray-900">
												{payment.tenant}
											</p>
											<p className="text-gray-500 text-sm">
												{payment.property}
											</p>
										</div>
									</div>
									<div className="text-right">
										<p className="font-semibold text-gray-900">
											{formatCurrency(payment.amount)}
										</p>
										<span
											className={`inline-flex items-center gap-1 font-medium text-xs ${
												payment.status === "paid"
													? "text-emerald-600"
													: payment.status === "pending"
														? "text-amber-600"
														: "text-red-600"
											}`}
										>
											{payment.status === "paid" && (
												<CheckCircle className="h-3 w-3" />
											)}
											{payment.status === "pending" && (
												<Clock className="h-3 w-3" />
											)}
											{payment.status === "overdue" && (
												<AlertCircle className="h-3 w-3" />
											)}
											{payment.status.charAt(0).toUpperCase() +
												payment.status.slice(1)}
										</span>
									</div>
								</div>
							))}
						</div>
					</CardBody>
				</Card>

				{/* Upcoming Lease Expirations */}
				<Card className="border border-gray-200 shadow-sm">
					<CardBody className="p-0">
						<div className="flex items-center justify-between border-gray-200 border-b p-6">
							<div>
								<h2 className="font-semibold text-gray-900 text-lg">
									Lease Expirations
								</h2>
								<p className="mt-1 text-gray-500 text-sm">Upcoming renewals</p>
							</div>
							<Calendar className="h-5 w-5 text-gray-400" />
						</div>
						<div className="divide-y divide-gray-100">
							{upcomingLeases.map((lease) => (
								<div key={lease.id} className="p-4 hover:bg-gray-50">
									<div className="flex items-start justify-between">
										<div>
											<p className="font-medium text-gray-900">
												{lease.tenant}
											</p>
											<p className="text-gray-500 text-sm">{lease.property}</p>
										</div>
										<span
											className={`rounded-full px-2 py-1 font-medium text-xs ${
												lease.expiresIn <= 14
													? "bg-red-100 text-red-700"
													: lease.expiresIn <= 30
														? "bg-amber-100 text-amber-700"
														: "bg-gray-100 text-gray-700"
											}`}
										>
											{lease.expiresIn} days
										</span>
									</div>
									<p className="mt-2 font-medium text-gray-700 text-sm">
										{formatCurrency(lease.rent)}/month
									</p>
								</div>
							))}
						</div>
						<div className="border-gray-200 border-t p-4">
							<Button
								as={Link}
								to="/dashboard/properties"
								variant="light"
								size="sm"
								className="w-full"
								endContent={<ArrowRight className="h-4 w-4" />}
							>
								View All Leases
							</Button>
						</div>
					</CardBody>
				</Card>
			</div>

			{/* Maintenance Requests */}
			<Card className="border border-gray-200 shadow-sm">
				<CardBody className="p-0">
					<div className="flex items-center justify-between border-gray-200 border-b p-6">
						<div>
							<h2 className="font-semibold text-gray-900 text-lg">
								Maintenance Requests
							</h2>
							<p className="mt-1 text-gray-500 text-sm">
								{dashboardData.pendingMaintenance} open requests need attention
							</p>
						</div>
						<Button
							as={Link}
							to="/dashboard/maintenance"
							variant="light"
							size="sm"
							endContent={<ArrowRight className="h-4 w-4" />}
						>
							View All
						</Button>
					</div>
					<div className="grid gap-4 p-6 md:grid-cols-3">
						{recentMaintenance.map((request) => (
							<div
								key={request.id}
								className="rounded-xl border border-gray-200 p-4 transition-all hover:border-primary hover:shadow-md"
							>
								<div className="mb-3 flex items-start justify-between">
									<span
										className={`rounded-full px-2 py-1 font-medium text-xs ${
											request.priority === "urgent"
												? "bg-red-100 text-red-700"
												: request.priority === "high"
													? "bg-amber-100 text-amber-700"
													: "bg-gray-100 text-gray-700"
										}`}
									>
										{request.priority.toUpperCase()}
									</span>
									<span
										className={`inline-flex items-center gap-1 font-medium text-xs ${
											request.status === "completed"
												? "text-emerald-600"
												: request.status === "in-progress"
													? "text-blue-600"
													: "text-amber-600"
										}`}
									>
										{request.status === "completed" && (
											<CheckCircle className="h-3 w-3" />
										)}
										{request.status === "in-progress" && (
											<Clock className="h-3 w-3" />
										)}
										{request.status === "pending" && (
											<AlertCircle className="h-3 w-3" />
										)}
										{request.status.charAt(0).toUpperCase() +
											request.status.slice(1).replace("-", " ")}
									</span>
								</div>
								<p className="font-medium text-gray-900">{request.issue}</p>
								<p className="mt-1 text-gray-500 text-sm">{request.property}</p>
							</div>
						))}
					</div>
				</CardBody>
			</Card>
		</div>
	);
}
