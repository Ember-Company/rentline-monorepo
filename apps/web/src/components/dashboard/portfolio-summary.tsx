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
				<h2 className="text-xl font-semibold">Portfolio Summary</h2>
			</CardHeader>
			<CardBody className="space-y-4">
				<div className="flex justify-between items-center">
					<span className="text-sm text-muted-foreground">Monthly Income</span>
					<span className="font-semibold">{formatCurrency(monthlyIncome)}</span>
				</div>
				<div className="flex justify-between items-center">
					<span className="text-sm text-muted-foreground">Monthly Expenses</span>
					<span className="font-semibold">{formatCurrency(monthlyExpenses)}</span>
				</div>
				<div className="flex justify-between items-center pt-2 border-t">
					<span className="text-sm font-medium">Net Cash Flow</span>
					<span className="text-lg font-bold text-success">
						{formatCurrency(netCashFlow)}
					</span>
				</div>
				{trend && (
					<div className="pt-2">
						<div className="flex items-center gap-2 text-sm">
							<TrendingUp
								className={`w-4 h-4 ${
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

