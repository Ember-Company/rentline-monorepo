import { Card, CardBody } from "@heroui/react";
import { type LucideIcon, TrendingDown, TrendingUp } from "lucide-react";

export interface StatCardProps {
	title: string;
	value: string | number;
	subtitle?: string;
	icon: LucideIcon;
	trend?: { value: number; positive: boolean };
	color?: "gray" | "green" | "red" | "blue" | "yellow";
}

const colorClasses = {
	gray: "bg-gray-100 text-gray-600",
	green: "bg-green-100 text-green-600",
	red: "bg-red-100 text-red-600",
	blue: "bg-blue-100 text-blue-600",
	yellow: "bg-yellow-100 text-yellow-600",
} as const;

export function StatCard({
	title,
	value,
	subtitle,
	icon: Icon,
	trend,
	color = "gray",
}: StatCardProps) {
	return (
		<Card className="border border-gray-200 shadow-sm">
			<CardBody className="p-4">
				<div className="flex items-start justify-between">
					<div>
						<p className="text-gray-500 text-sm">{title}</p>
						<p className="mt-1 font-bold text-2xl text-gray-900">{value}</p>
						{subtitle && <p className="text-gray-500 text-xs">{subtitle}</p>}
						{trend && (
							<div
								className={`mt-1 flex items-center gap-1 text-xs ${trend.positive ? "text-green-600" : "text-red-600"}`}
							>
								{trend.positive ? (
									<TrendingUp className="h-3 w-3" />
								) : (
									<TrendingDown className="h-3 w-3" />
								)}
								<span>{trend.value}%</span>
							</div>
						)}
					</div>
					<div
						className={`flex h-10 w-10 items-center justify-center rounded-lg ${colorClasses[color]}`}
					>
						<Icon className="h-5 w-5" />
					</div>
				</div>
			</CardBody>
		</Card>
	);
}
