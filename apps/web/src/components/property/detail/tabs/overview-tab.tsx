import type { Expense, Payment, Property } from "../types";
import { PropertyInfoSection } from "../sections/property-info-section";
import { FinancialSummarySection } from "../sections/financial-summary-section";

interface OverviewTabProps {
	property: Property;
	payments: Payment[];
	expenses: Expense[];
	totalPayments: number;
	totalExpenses: number;
	netIncome: number;
	onAddPayment: () => void;
	onAddExpense: () => void;
}

export function OverviewTab({
	property,
	payments,
	expenses,
	totalPayments,
	totalExpenses,
	netIncome,
	onAddPayment,
	onAddExpense,
}: OverviewTabProps) {
	return (
		<div className="space-y-6">
			<PropertyInfoSection property={property} />
			<FinancialSummarySection
				payments={payments}
				expenses={expenses}
				totalPayments={totalPayments}
				totalExpenses={totalExpenses}
				netIncome={netIncome}
				onAddPayment={onAddPayment}
				onAddExpense={onAddExpense}
			/>
		</div>
	);
}
