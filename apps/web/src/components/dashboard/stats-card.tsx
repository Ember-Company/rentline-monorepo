import { Card, CardBody } from "@heroui/react";
import { type LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";

type StatsCardProps = {
	title: string;
	value: string | number;
	subtitle?: string;
	trend?: {
		value: string;
		isPositive: boolean;
	};
	icon: LucideIcon;
	iconColor?: "primary" | "success" | "danger" | "warning";
	valueColor?: "default" | "danger" | "success";
};

export function StatsCard({
	title,
	value,
	subtitle,
	trend,
	icon: Icon,
	iconColor = "primary",
	valueColor = "default",
}: StatsCardProps) {
	const iconColorClasses = {
		primary: "bg-primary/10 text-primary",
		success: "bg-success/10 text-success",
		danger: "bg-danger/10 text-danger",
		warning: "bg-warning/10 text-warning",
	};

	const valueColorClasses = {
		default: "",
		danger: "text-danger",
		success: "text-success",
	};

	const formattedValue =
		typeof value === "number" ? formatCurrency(value) : value;

	return (
		<Card>
			<CardBody className="p-6">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-sm text-muted-foreground mb-1">{title}</p>
						<p
							className={`text-2xl font-bold ${valueColorClasses[valueColor]}`}
						>
							{formattedValue}
						</p>
						{subtitle && (
							<p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
						)}
						{trend && (
							<p
								className={`text-xs mt-1 flex items-center gap-1 ${
									trend.isPositive ? "text-success" : "text-danger"
								}`}
							>
								{trend.isPositive ? (
									<ArrowUpRight className="w-3 h-3" />
								) : (
									<ArrowDownRight className="w-3 h-3" />
								)}
								{trend.value}
							</p>
						)}
					</div>
					<div className={`p-3 rounded-lg ${iconColorClasses[iconColor]}`}>
						<Icon className="w-6 h-6" />
					</div>
				</div>
			</CardBody>
		</Card>
	);
}
