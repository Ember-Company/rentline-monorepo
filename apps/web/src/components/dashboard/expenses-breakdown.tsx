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
					<h2 className="text-xl font-semibold">{title}</h2>
					<p className="text-sm text-muted-foreground">{subtitle}</p>
				</div>
			</CardHeader>
			<CardBody>
				<div className="space-y-4">
					{expenses.map((expense, index) => (
						<div key={index} className="space-y-2">
							<div className="flex justify-between items-center">
								<span className="text-sm font-medium">{expense.category}</span>
								<span className="text-sm font-semibold">
									{formatCurrency(expense.amount)}
								</span>
							</div>
							<div className="w-full bg-default-100 rounded-full h-2">
								<div
									className="bg-primary h-2 rounded-full transition-all"
									style={{ width: `${expense.percentage}%` }}
								/>
							</div>
						</div>
					))}
					<div className="pt-4 border-t">
						<div className="flex justify-between items-center">
							<span className="font-semibold">Total Expenses</span>
							<span className="text-lg font-bold">{formatCurrency(total)}</span>
						</div>
					</div>
				</div>
			</CardBody>
		</Card>
	);
}

