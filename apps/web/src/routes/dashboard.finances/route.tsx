import type { Route } from "./+types/route";
import { Card, CardBody, CardHeader, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Input, Button, Select, SelectItem } from "@heroui/react";
import { Search, Download, DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { MetricCard } from "@/components/dashboard/metric-card";
import { formatCurrency } from "@/lib/utils/format";
import { useState } from "react";

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
					<Button variant="bordered" startContent={<Download className="w-4 h-4" />}>
						Export Report
					</Button>
				}
			/>

			{/* Summary Cards */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
				<div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
					<div className="flex items-start justify-between">
						<div className="flex-1">
							<p className="text-sm text-gray-600 mb-2">Net Profit</p>
							<p
								className={`text-2xl font-bold mb-3 ${
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
									<TrendingUp className="w-4 h-4" />
								) : (
									<TrendingDown className="w-4 h-4" />
								)}
								<span>
									{Math.abs(((netProfit / totalIncome) * 100).toFixed(1))}% margin
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			<Card className="border border-gray-200 shadow-sm">
				<CardHeader className="flex justify-between items-center">
					<div>
						<h2 className="text-xl font-semibold">Financial Records</h2>
						<p className="text-sm text-gray-600">
							{filteredRecords.length} records found
						</p>
					</div>
					<div className="flex gap-2">
						<Input
							placeholder="Search records..."
							value={searchQuery}
							onValueChange={setSearchQuery}
							startContent={<Search className="w-4 h-4" />}
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
										<span className="text-sm text-gray-600">{record.date}</span>
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
												record.type === "income" ? "text-green-600" : "text-red-600"
											}`}
										>
											{record.type === "expense" ? "-" : "+"}
											{formatCurrency(record.amount)}
										</span>
									</TableCell>
									<TableCell>
										<span
											className={`text-sm px-2 py-1 rounded ${
												record.type === "income"
													? "bg-green-100 text-green-700"
													: "bg-red-100 text-red-700"
											}`}
										>
											{record.type.charAt(0).toUpperCase() + record.type.slice(1)}
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

