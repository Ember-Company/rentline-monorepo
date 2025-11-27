import { Card, CardBody } from "@heroui/react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";

type ModernMetricCardProps = {
	title: string;
	value: number | string;
	trend: {
		percentage: number;
		label: string;
		isPositive?: boolean;
	};
};

export function ModernMetricCard({
	title,
	value,
	trend,
}: ModernMetricCardProps) {
	const isPositive = trend.isPositive ?? trend.percentage > 0;
	const formattedValue =
		typeof value === "number" ? formatCurrency(value) : value;

	return (
		<Card className="border border-gray-200 shadow-sm">
			<CardBody className="p-6">
				<div>
					<p className="mb-2 text-gray-600 text-sm">{title}</p>
					<p className="mb-3 font-bold text-3xl text-gray-900">
						{formattedValue}
					</p>
					<div
						className={`flex items-center gap-1 text-sm ${
							isPositive ? "text-green-600" : "text-red-600"
						}`}
					>
						{isPositive ? (
							<ArrowUp className="h-4 w-4" />
						) : (
							<ArrowDown className="h-4 w-4" />
						)}
						<span>
							{Math.abs(trend.percentage)}% {trend.label}
						</span>
					</div>
				</div>
			</CardBody>
		</Card>
	);
}
