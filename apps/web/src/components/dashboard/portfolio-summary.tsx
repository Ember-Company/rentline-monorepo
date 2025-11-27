import { Card, CardBody, CardHeader } from "@heroui/react";
import { TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";

type PortfolioSummaryProps = {
	monthlyIncome: number;
	monthlyExpenses: number;
	netCashFlow: number;
	trend?: {
		value: string;
		isPositive: boolean;
	};
};

export function PortfolioSummary({
	monthlyIncome,
	monthlyExpenses,
	netCashFlow,
	trend,
}: PortfolioSummaryProps) {
	return (
		<Card>
			<CardHeader>
				<h2 className="font-semibold text-xl">Portfolio Summary</h2>
			</CardHeader>
			<CardBody className="space-y-4">
				<div className="flex items-center justify-between">
					<span className="text-muted-foreground text-sm">Monthly Income</span>
					<span className="font-semibold">{formatCurrency(monthlyIncome)}</span>
				</div>
				<div className="flex items-center justify-between">
					<span className="text-muted-foreground text-sm">
						Monthly Expenses
					</span>
					<span className="font-semibold">
						{formatCurrency(monthlyExpenses)}
					</span>
				</div>
				<div className="flex items-center justify-between border-t pt-2">
					<span className="font-medium text-sm">Net Cash Flow</span>
					<span className="font-bold text-lg text-success">
						{formatCurrency(netCashFlow)}
					</span>
				</div>
				{trend && (
					<div className="pt-2">
						<div className="flex items-center gap-2 text-sm">
							<TrendingUp
								className={`h-4 w-4 ${
									trend.isPositive ? "text-success" : "text-danger"
								}`}
							/>
							<span
								className={`font-medium ${
									trend.isPositive ? "text-success" : "text-danger"
								}`}
							>
								{trend.value}
							</span>
						</div>
					</div>
				)}
			</CardBody>
		</Card>
	);
}
