import { Card, CardBody } from "@heroui/react";
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
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
						<p className="mb-1 text-muted-foreground text-sm">{title}</p>
						<p
							className={`font-bold text-2xl ${valueColorClasses[valueColor]}`}
						>
							{formattedValue}
						</p>
						{subtitle && (
							<p className="mt-1 text-muted-foreground text-xs">{subtitle}</p>
						)}
						{trend && (
							<p
								className={`mt-1 flex items-center gap-1 text-xs ${
									trend.isPositive ? "text-success" : "text-danger"
								}`}
							>
								{trend.isPositive ? (
									<ArrowUpRight className="h-3 w-3" />
								) : (
									<ArrowDownRight className="h-3 w-3" />
								)}
								{trend.value}
							</p>
						)}
					</div>
					<div className={`rounded-lg p-3 ${iconColorClasses[iconColor]}`}>
						<Icon className="h-6 w-6" />
					</div>
				</div>
			</CardBody>
		</Card>
	);
}
