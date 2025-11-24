import { Card, CardBody } from "@heroui/react";
import { ArrowUp, ArrowDown } from "lucide-react";
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

export function ModernMetricCard({ title, value, trend }: ModernMetricCardProps) {
	const isPositive = trend.isPositive ?? trend.percentage > 0;
	const formattedValue = typeof value === "number" ? formatCurrency(value) : value;

	return (
		<Card className="border border-gray-200 shadow-sm">
			<CardBody className="p-6">
				<div>
					<p className="text-sm text-gray-600 mb-2">{title}</p>
					<p className="text-3xl font-bold text-gray-900 mb-3">
						{formattedValue}
					</p>
					<div className={`flex items-center gap-1 text-sm ${
						isPositive ? "text-green-600" : "text-red-600"
					}`}>
						{isPositive ? (
							<ArrowUp className="w-4 h-4" />
						) : (
							<ArrowDown className="w-4 h-4" />
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

