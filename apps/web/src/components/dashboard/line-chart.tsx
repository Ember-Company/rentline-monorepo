import { Card, CardBody, CardHeader, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";
import { MoreVertical } from "lucide-react";

type DataPoint = {
	month: string;
	value: number;
};

type LineChartProps = {
	title: string;
	data: DataPoint[];
	maxValue?: number;
};

export function LineChart({ title, data, maxValue = 50000 }: LineChartProps) {
	const max = Math.max(...data.map((d) => d.value), maxValue);
	const height = 200;

	return (
		<Card className="border border-gray-200 shadow-sm">
			<CardHeader className="flex justify-between items-center pb-2">
				<h3 className="text-lg font-semibold text-gray-900">{title}</h3>
				<Dropdown>
					<DropdownTrigger>
						<Button
							isIconOnly
							variant="light"
							size="sm"
							className="text-gray-400"
						>
							<MoreVertical className="w-4 h-4" />
						</Button>
					</DropdownTrigger>
					<DropdownMenu aria-label="Chart actions">
						<DropdownItem key="view">View Details</DropdownItem>
						<DropdownItem key="export">Export</DropdownItem>
					</DropdownMenu>
				</Dropdown>
			</CardHeader>
			<CardBody className="pt-0">
				<div className="relative" style={{ height: `${height}px` }}>
					{/* Y-axis labels */}
					<div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500 pr-2">
						<span>${(maxValue / 1000).toFixed(0)}K</span>
						<span>${(maxValue / 2000).toFixed(0)}K</span>
						<span>$00</span>
					</div>

					{/* Chart area */}
					<div className="ml-8 h-full relative">
						{/* Grid lines */}
						<div className="absolute inset-0 flex flex-col justify-between">
							<div className="border-t border-gray-200" />
							<div className="border-t border-gray-200" />
							<div className="border-t border-gray-200" />
						</div>

						{/* Line chart */}
						<div className="absolute inset-0">
							<svg
								width="100%"
								height="100%"
								viewBox={`0 0 ${data.length * 50 + 40} ${height}`}
								preserveAspectRatio="none"
							>
								{/* Line */}
								<polyline
									fill="none"
									stroke="rgb(59, 130, 246)"
									strokeWidth="2.5"
									points={data
										.map(
											(d, i) =>
												`${i * 50 + 20},${height - 20 - (d.value / max) * (height - 40)}`
										)
										.join(" ")}
								/>
								{/* Dots */}
								{data.map((d, i) => (
									<circle
										key={i}
										cx={i * 50 + 20}
										cy={height - 20 - (d.value / max) * (height - 40)}
										r="4"
										fill="rgb(59, 130, 246)"
									/>
								))}
							</svg>
						</div>

						{/* X-axis labels */}
						<div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 pt-2 px-2">
							{data.map((d, i) => (
								<span key={i} className="flex-1 text-center">
									{d.month}
								</span>
							))}
						</div>
					</div>
				</div>
			</CardBody>
		</Card>
	);
}

