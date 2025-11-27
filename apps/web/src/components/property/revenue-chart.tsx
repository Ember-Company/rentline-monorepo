import { Card, CardBody, CardHeader, Select, SelectItem } from "@heroui/react";
import { useState } from "react";

type RevenueData = {
	month: string;
	income: number;
	expense: number;
	revenue: number;
};

type RevenueChartProps = {
	title?: string;
	data: RevenueData[];
	period?: string;
	onPeriodChange?: (period: string) => void;
};

export function RevenueChart({
	title = "Rental Revenue",
	data,
	period = "This year",
	onPeriodChange,
}: RevenueChartProps) {
	const maxValue = Math.max(
		...data.flatMap((d) => [d.income, d.expense, d.revenue]),
		100000,
	);
	const height = 300;
	const barWidth = 20;
	const spacing = 8;
	const groupWidth = barWidth * 3 + spacing * 2;
	const chartWidth = data.length * (groupWidth + 20) + 40;

	const totalIncome = data.reduce((sum, d) => sum + d.income, 0);
	const totalExpense = data.reduce((sum, d) => sum + d.expense, 0);
	const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);

	return (
		<Card className="border border-gray-200 shadow-sm">
			<CardHeader className="flex items-center justify-between pb-2">
				<h3 className="font-semibold text-gray-900 text-lg">{title}</h3>
				<Select
					selectedKeys={[period]}
					onSelectionChange={(keys) => {
						const selected = Array.from(keys)[0] as string;
						onPeriodChange?.(selected);
					}}
					className="w-32"
					size="sm"
				>
					<SelectItem key="This month">This month</SelectItem>
					<SelectItem key="This quarter">This quarter</SelectItem>
					<SelectItem key="This year">This year</SelectItem>
					<SelectItem key="Last year">Last year</SelectItem>
				</Select>
			</CardHeader>
			<CardBody className="pt-0">
				{/* Legend */}
				<div className="mb-4 flex gap-6 text-sm">
					<div className="flex items-center gap-2">
						<div className="h-3 w-3 rounded bg-purple-300" />
						<span className="text-gray-600">
							Income: {formatCurrency(totalIncome)}
						</span>
					</div>
					<div className="flex items-center gap-2">
						<div className="h-3 w-3 rounded bg-blue-500" />
						<span className="text-gray-600">
							Expense: {formatCurrency(totalExpense)}
						</span>
					</div>
					<div className="flex items-center gap-2">
						<div className="h-3 w-3 rounded bg-purple-600" />
						<span className="text-gray-600">
							Revenue: {formatCurrency(totalRevenue)}
						</span>
					</div>
				</div>

				<div className="relative overflow-x-auto">
					<div style={{ minWidth: `${chartWidth}px`, height: `${height}px` }}>
						{/* Y-axis labels */}
						<div className="absolute top-0 bottom-0 left-0 flex w-12 flex-col justify-between pr-2 text-gray-500 text-xs">
							<span>${(maxValue / 1000).toFixed(0)}K</span>
							<span>${(maxValue / 2000).toFixed(0)}K</span>
							<span>$0K</span>
						</div>

						{/* Chart area */}
						<div className="relative ml-12 h-full">
							{/* Grid lines */}
							<div className="absolute inset-0 flex flex-col justify-between">
								<div className="border-gray-200 border-t" />
								<div className="border-gray-200 border-t" />
								<div className="border-gray-200 border-t" />
							</div>

							{/* Bars */}
							<svg
								width="100%"
								height="100%"
								viewBox={`0 0 ${chartWidth} ${height}`}
								preserveAspectRatio="none"
								className="absolute inset-0"
							>
								{data.map((d, i) => {
									const x = i * (groupWidth + 20) + 20;
									const incomeHeight = (d.income / maxValue) * (height - 40);
									const expenseHeight = (d.expense / maxValue) * (height - 40);
									const revenueHeight = (d.revenue / maxValue) * (height - 40);

									return (
										<g key={i}>
											{/* Income bar (light purple) */}
											<rect
												x={x}
												y={height - 20 - incomeHeight}
												width={barWidth}
												height={incomeHeight}
												fill="#c084fc"
												rx="2"
											/>
											{/* Expense bar (blue) */}
											<rect
												x={x + barWidth + spacing}
												y={height - 20 - expenseHeight}
												width={barWidth}
												height={expenseHeight}
												fill="#3b82f6"
												rx="2"
											/>
											{/* Revenue bar (dark purple) */}
											<rect
												x={x + (barWidth + spacing) * 2}
												y={height - 20 - revenueHeight}
												width={barWidth}
												height={revenueHeight}
												fill="#9333ea"
												rx="2"
											/>
										</g>
									);
								})}
							</svg>

							{/* X-axis labels */}
							<div className="absolute right-0 bottom-0 left-0 flex justify-between px-2 pt-2 text-gray-500 text-xs">
								{data.map((d, i) => (
									<span key={i} className="flex-1 text-center">
										{d.month}
									</span>
								))}
							</div>
						</div>
					</div>
				</div>
			</CardBody>
		</Card>
	);
}

function formatCurrency(amount: number): string {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(amount);
}
