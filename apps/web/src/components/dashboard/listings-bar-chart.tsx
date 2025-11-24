import { Card, CardBody, CardHeader, Select, SelectItem, Button } from "@heroui/react";
import { RefreshCw } from "lucide-react";
import { useState } from "react";

type BarData = {
	day: string;
	rent: number;
	sale: number;
};

type ListingsBarChartProps = {
	title?: string;
	total: number;
	percentage: number;
	lastUpdated: string;
	data: BarData[];
	onRefresh?: () => void;
};

export function ListingsBarChart({
	title = "Total Listings",
	total,
	percentage,
	lastUpdated,
	data,
	onRefresh,
}: ListingsBarChartProps) {
	const [period, setPeriod] = useState("weekly");
	const maxValue = Math.max(...data.flatMap((d) => [d.rent, d.sale]), 1000);
	const height = 250;

	return (
		<Card className="border border-gray-200 shadow-sm">
			<CardHeader className="flex justify-between items-center pb-2">
				<div className="flex-1">
					<h3 className="text-lg font-semibold text-gray-900">{title}</h3>
					<div className="flex items-center gap-4 mt-1">
						<p className="text-2xl font-bold text-gray-900">{total.toLocaleString()}</p>
						<div className="flex items-center gap-1 text-sm text-green-600">
							<span>+{percentage}%</span>
						</div>
						<p className="text-xs text-gray-500">Last updated: {lastUpdated}</p>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Select
						selectedKeys={[period]}
						onSelectionChange={(keys) => setPeriod(Array.from(keys)[0] as string)}
						className="w-32"
						size="sm"
					>
						<SelectItem key="daily">Daily</SelectItem>
						<SelectItem key="weekly">Weekly</SelectItem>
						<SelectItem key="monthly">Monthly</SelectItem>
					</Select>
					<Button
						isIconOnly
						variant="light"
						size="sm"
						onPress={onRefresh}
						aria-label="Refresh"
					>
						<RefreshCw className="w-4 h-4" />
					</Button>
				</div>
			</CardHeader>
			<CardBody className="pt-0">
				<div className="relative" style={{ height: `${height}px` }}>
					{/* Y-axis labels */}
					<div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500 pr-2 w-12">
						<span>$1K</span>
						<span>$800</span>
						<span>$600</span>
						<span className="text-primary font-medium">Avg</span>
						<span>$400</span>
						<span>$200</span>
						<span>$0</span>
					</div>

					{/* Chart area */}
					<div className="ml-12 h-full relative">
						{/* Grid lines */}
						<div className="absolute inset-0 flex flex-col justify-between">
							<div className="border-t border-gray-200" />
							<div className="border-t border-gray-200" />
							<div className="border-t border-primary-200" />
							<div className="border-t border-gray-200" />
							<div className="border-t border-gray-200" />
							<div className="border-t border-gray-200" />
						</div>

						{/* Bars */}
						<div className="absolute inset-0 flex items-end justify-between gap-2 px-2">
							{data.map((d, i) => {
								const rentHeight = (d.rent / maxValue) * (height - 40);
								const saleHeight = (d.sale / maxValue) * (height - 40);
								const barWidth = `calc((100% - ${(data.length - 1) * 8}px) / ${data.length})`;

								return (
									<div
										key={i}
										className="flex items-end gap-1"
										style={{ width: barWidth }}
									>
										{/* Property Rent bar (darker orange) */}
										<div
											className="bg-primary rounded-t transition-all hover:bg-primary-700 cursor-pointer relative group"
											style={{ height: `${rentHeight}px`, width: "48%" }}
											title={`Property Rent: ${d.rent}`}
										>
											<div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
												Property Rent {d.rent}
											</div>
										</div>
										{/* Property Sale bar (lighter orange) */}
										<div
											className="bg-secondary rounded-t transition-all hover:bg-secondary-500 cursor-pointer relative group"
											style={{ height: `${saleHeight}px`, width: "48%" }}
											title={`Property Sale: ${d.sale}`}
										>
											<div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
												Property Sale {d.sale}
											</div>
										</div>
									</div>
								);
							})}
						</div>

						{/* X-axis labels */}
						<div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 pt-2 px-2">
							{data.map((d, i) => (
								<span key={i} className="flex-1 text-center truncate">
									{d.day}
								</span>
							))}
						</div>
					</div>
				</div>

				{/* Legend */}
				<div className="flex items-center justify-end gap-4 mt-4 text-sm">
					<div className="flex items-center gap-2">
						<div className="w-3 h-3 rounded bg-primary" />
						<span className="text-gray-600">Property Rent</span>
					</div>
					<div className="flex items-center gap-2">
						<div className="w-3 h-3 rounded bg-secondary" />
						<span className="text-gray-600">Property Sale</span>
					</div>
				</div>
			</CardBody>
		</Card>
	);
}

