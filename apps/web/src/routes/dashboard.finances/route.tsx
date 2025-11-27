import {
	Button,
	Card,
	CardBody,
	CardHeader,
	Input,
	Select,
	SelectItem,
	Table,
	TableBody,
	TableCell,
	TableColumn,
	TableHeader,
	TableRow,
} from "@heroui/react";
import {
	DollarSign,
	Download,
	Search,
	TrendingDown,
	TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { MetricCard } from "@/components/dashboard/metric-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { formatCurrency } from "@/lib/utils/format";
import type { Route } from "./+types/route";

type FinancialRecord = {
	id: number;
	category: string;
	description: string;
	amount: number;
	type: "income" | "expense";
	date: string;
	property?: string;
};

const financialRecords: FinancialRecord[] = [
	{
		id: 1,
		category: "Rent",
		description: "Monthly rent payment",
		amount: 2500,
		type: "income",
		date: "2024-01-15",
		property: "123 Main St, Apt 2B",
	},
	{
		id: 2,
		category: "Maintenance",
		description: "HVAC repair",
		amount: 850,
		type: "expense",
		date: "2024-01-14",
		property: "456 Oak Ave, Unit 5",
	},
	{
		id: 3,
		category: "Rent",
		description: "Monthly rent payment",
		amount: 3200,
		type: "income",
		date: "2024-01-13",
		property: "456 Oak Ave, Unit 5",
	},
	{
		id: 4,
		category: "Insurance",
		description: "Property insurance",
		amount: 450,
		type: "expense",
		date: "2024-01-10",
	},
];

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "Finances - Rentline" },
		{ name: "description", content: "Financial overview and records" },
	];
}

export default function FinancesPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [typeFilter, setTypeFilter] = useState<string>("all");

	const filteredRecords = financialRecords.filter((record) => {
		const matchesSearch =
			record.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
			record.category.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesType = typeFilter === "all" || record.type === typeFilter;
		return matchesSearch && matchesType;
	});

	const totalIncome = financialRecords
		.filter((r) => r.type === "income")
		.reduce((sum, r) => sum + r.amount, 0);
	const totalExpenses = financialRecords
		.filter((r) => r.type === "expense")
		.reduce((sum, r) => sum + r.amount, 0);
	const netProfit = totalIncome - totalExpenses;

	return (
		<div className="space-y-6">
			<PageHeader
				title="Finances"
				subtitle="Financial overview and transaction records"
				actions={
					<Button
						variant="bordered"
						startContent={<Download className="h-4 w-4" />}
					>
						Export Report
					</Button>
				}
			/>

			{/* Summary Cards */}
			<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
				<MetricCard
					title="Total Income"
					value={totalIncome}
					trend={{ percentage: 6, label: "Than last month" }}
				/>
				<MetricCard
					title="Total Expenses"
					value={totalExpenses}
					trend={{ percentage: 4, label: "Than last month" }}
				/>
				<div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
					<div className="flex items-start justify-between">
						<div className="flex-1">
							<p className="mb-2 text-gray-600 text-sm">Net Profit</p>
							<p
								className={`mb-3 font-bold text-2xl ${
									netProfit >= 0 ? "text-green-600" : "text-red-600"
								}`}
							>
								{formatCurrency(netProfit)}
							</p>
							<div
								className={`flex items-center gap-1 text-sm ${
									netProfit >= 0 ? "text-green-600" : "text-red-600"
								}`}
							>
								{netProfit >= 0 ? (
									<TrendingUp className="h-4 w-4" />
								) : (
									<TrendingDown className="h-4 w-4" />
								)}
								<span>
									{Math.abs(((netProfit / totalIncome) * 100).toFixed(1))}%
									margin
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			<Card className="border border-gray-200 shadow-sm">
				<CardHeader className="flex items-center justify-between">
					<div>
						<h2 className="font-semibold text-xl">Financial Records</h2>
						<p className="text-gray-600 text-sm">
							{filteredRecords.length} records found
						</p>
					</div>
					<div className="flex gap-2">
						<Input
							placeholder="Search records..."
							value={searchQuery}
							onValueChange={setSearchQuery}
							startContent={<Search className="h-4 w-4" />}
							classNames={{
								input: "text-sm",
								inputWrapper: "bg-gray-50 border-gray-200 max-w-xs",
							}}
						/>
						<Select
							selectedKeys={[typeFilter]}
							onSelectionChange={(keys) =>
								setTypeFilter(Array.from(keys)[0] as string)
							}
							className="w-32"
							labelPlacement="outside"
						>
							<SelectItem key="all">All Types</SelectItem>
							<SelectItem key="income">Income</SelectItem>
							<SelectItem key="expense">Expense</SelectItem>
						</Select>
					</div>
				</CardHeader>
				<CardBody>
					<Table aria-label="Financial records table" removeWrapper>
						<TableHeader>
							<TableColumn>DATE</TableColumn>
							<TableColumn>CATEGORY</TableColumn>
							<TableColumn>DESCRIPTION</TableColumn>
							<TableColumn>PROPERTY</TableColumn>
							<TableColumn>AMOUNT</TableColumn>
							<TableColumn>TYPE</TableColumn>
						</TableHeader>
						<TableBody>
							{filteredRecords.map((record) => (
								<TableRow key={record.id}>
									<TableCell>
										<span className="text-gray-600 text-sm">{record.date}</span>
									</TableCell>
									<TableCell>
										<span className="font-medium">{record.category}</span>
									</TableCell>
									<TableCell>{record.description}</TableCell>
									<TableCell>
										{record.property || (
											<span className="text-gray-400">N/A</span>
										)}
									</TableCell>
									<TableCell>
										<span
											className={`font-semibold ${
												record.type === "income"
													? "text-green-600"
													: "text-red-600"
											}`}
										>
											{record.type === "expense" ? "-" : "+"}
											{formatCurrency(record.amount)}
										</span>
									</TableCell>
									<TableCell>
										<span
											className={`rounded px-2 py-1 text-sm ${
												record.type === "income"
													? "bg-green-100 text-green-700"
													: "bg-red-100 text-red-700"
											}`}
										>
											{record.type.charAt(0).toUpperCase() +
												record.type.slice(1)}
										</span>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardBody>
			</Card>
		</div>
	);
}
