import {
	Button,
	Card,
	CardBody,
	CardHeader,
	Select,
	SelectItem,
} from "@heroui/react";
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
			<CardHeader className="flex items-center justify-between pb-2">
				<div className="flex-1">
					<h3 className="font-semibold text-gray-900 text-lg">{title}</h3>
					<div className="mt-1 flex items-center gap-4">
						<p className="font-bold text-2xl text-gray-900">
							{total.toLocaleString()}
						</p>
						<div className="flex items-center gap-1 text-green-600 text-sm">
							<span>+{percentage}%</span>
						</div>
						<p className="text-gray-500 text-xs">Last updated: {lastUpdated}</p>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Select
						selectedKeys={[period]}
						onSelectionChange={(keys) =>
							setPeriod(Array.from(keys)[0] as string)
						}
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
						<RefreshCw className="h-4 w-4" />
					</Button>
				</div>
			</CardHeader>
			<CardBody className="pt-0">
				<div className="relative" style={{ height: `${height}px` }}>
					{/* Y-axis labels */}
					<div className="absolute top-0 bottom-0 left-0 flex w-12 flex-col justify-between pr-2 text-gray-500 text-xs">
						<span>$1K</span>
						<span>$800</span>
						<span>$600</span>
						<span className="font-medium text-primary">Avg</span>
						<span>$400</span>
						<span>$200</span>
						<span>$0</span>
					</div>

					{/* Chart area */}
					<div className="relative ml-12 h-full">
						{/* Grid lines */}
						<div className="absolute inset-0 flex flex-col justify-between">
							<div className="border-gray-200 border-t" />
							<div className="border-gray-200 border-t" />
							<div className="border-primary-200 border-t" />
							<div className="border-gray-200 border-t" />
							<div className="border-gray-200 border-t" />
							<div className="border-gray-200 border-t" />
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
											className="group relative cursor-pointer rounded-t bg-primary transition-all hover:bg-primary-700"
											style={{ height: `${rentHeight}px`, width: "48%" }}
											title={`Property Rent: ${d.rent}`}
										>
											<div className="-top-6 -translate-x-1/2 absolute left-1/2 transform whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-white text-xs opacity-0 group-hover:opacity-100">
												Property Rent {d.rent}
											</div>
										</div>
										{/* Property Sale bar (lighter orange) */}
										<div
											className="group relative cursor-pointer rounded-t bg-secondary transition-all hover:bg-secondary-500"
											style={{ height: `${saleHeight}px`, width: "48%" }}
											title={`Property Sale: ${d.sale}`}
										>
											<div className="-top-6 -translate-x-1/2 absolute left-1/2 transform whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-white text-xs opacity-0 group-hover:opacity-100">
												Property Sale {d.sale}
											</div>
										</div>
									</div>
								);
							})}
						</div>

						{/* X-axis labels */}
						<div className="absolute right-0 bottom-0 left-0 flex justify-between px-2 pt-2 text-gray-500 text-xs">
							{data.map((d, i) => (
								<span key={i} className="flex-1 truncate text-center">
									{d.day}
								</span>
							))}
						</div>
					</div>
				</div>

				{/* Legend */}
				<div className="mt-4 flex items-center justify-end gap-4 text-sm">
					<div className="flex items-center gap-2">
						<div className="h-3 w-3 rounded bg-primary" />
						<span className="text-gray-600">Property Rent</span>
					</div>
					<div className="flex items-center gap-2">
						<div className="h-3 w-3 rounded bg-secondary" />
						<span className="text-gray-600">Property Sale</span>
					</div>
				</div>
			</CardBody>
		</Card>
	);
}
