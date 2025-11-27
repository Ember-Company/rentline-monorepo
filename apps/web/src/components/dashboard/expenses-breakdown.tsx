import { Card, CardBody, CardHeader } from "@heroui/react";
import { formatCurrency } from "@/lib/utils/format";

type Expense = {
	category: string;
	amount: number;
	percentage: number;
};

type ExpensesBreakdownProps = {
	expenses: Expense[];
	title?: string;
	subtitle?: string;
};

export function ExpensesBreakdown({
	expenses,
	title = "Expenses by Category",
	subtitle = "This month",
}: ExpensesBreakdownProps) {
	const total = expenses.reduce((sum, e) => sum + e.amount, 0);

	return (
		<Card>
			<CardHeader>
				<div>
					<h2 className="font-semibold text-xl">{title}</h2>
					<p className="text-muted-foreground text-sm">{subtitle}</p>
				</div>
			</CardHeader>
			<CardBody>
				<div className="space-y-4">
					{expenses.map((expense, index) => (
						<div key={index} className="space-y-2">
							<div className="flex items-center justify-between">
								<span className="font-medium text-sm">{expense.category}</span>
								<span className="font-semibold text-sm">
									{formatCurrency(expense.amount)}
								</span>
							</div>
							<div className="h-2 w-full rounded-full bg-default-100">
								<div
									className="h-2 rounded-full bg-primary transition-all"
									style={{ width: `${expense.percentage}%` }}
								/>
							</div>
						</div>
					))}
					<div className="border-t pt-4">
						<div className="flex items-center justify-between">
							<span className="font-semibold">Total Expenses</span>
							<span className="font-bold text-lg">{formatCurrency(total)}</span>
						</div>
					</div>
				</div>
			</CardBody>
		</Card>
	);
}
