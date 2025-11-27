import { Button, Card, CardBody, CardHeader } from "@heroui/react";
import {
	CheckCircle,
	Clock,
	DollarSign,
	Plus,
	TrendingDown,
	TrendingUp,
	XCircle,
} from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { formatBRL } from "@/lib/constants/brazil";
import type { Expense, Payment } from "../types";
import { getCategoryLabel } from "../utils";

interface FinancesTabProps {
	payments: Payment[];
	expenses: Expense[];
	totalPayments: number;
	totalExpenses: number;
	netIncome: number;
	pendingPayments: number;
	onAddPayment: () => void;
	onAddExpense: () => void;
}

export function FinancesTab({
	payments,
	expenses,
	totalPayments,
	totalExpenses,
	netIncome,
	pendingPayments,
	onAddPayment,
	onAddExpense,
}: FinancesTabProps) {
	return (
		<div className="space-y-6">
			<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
				<StatCard
					title="Receita Total"
					value={formatBRL(totalPayments)}
					icon={TrendingUp}
					color="green"
				/>
				<StatCard
					title="Despesas Total"
					value={formatBRL(totalExpenses)}
					icon={TrendingDown}
					color="red"
				/>
				<StatCard
					title="Resultado Líquido"
					value={formatBRL(netIncome)}
					icon={DollarSign}
					color={netIncome >= 0 ? "blue" : "yellow"}
				/>
				<StatCard
					title="Pagamentos Pendentes"
					value={pendingPayments}
					icon={Clock}
					color="yellow"
				/>
			</div>

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
				<PaymentsList payments={payments} onAddPayment={onAddPayment} />
				<ExpensesList expenses={expenses} onAddExpense={onAddExpense} />
			</div>
		</div>
	);
}

function PaymentsList({
	payments,
	onAddPayment,
}: {
	payments: Payment[];
	onAddPayment: () => void;
}) {
	return (
		<Card className="border border-gray-200 shadow-sm">
			<CardHeader className="flex items-center justify-between border-gray-100 border-b bg-gray-50/50 px-6 py-4">
				<h3 className="font-semibold text-gray-900 text-lg">Pagamentos</h3>
				<Button
					size="sm"
					color="primary"
					startContent={<Plus className="h-4 w-4" />}
					onPress={onAddPayment}
				>
					Novo
				</Button>
			</CardHeader>
			<CardBody className="p-0">
				{payments.length === 0 ? (
					<div className="py-12 text-center">
						<p className="text-gray-500">Nenhum pagamento registrado</p>
					</div>
				) : (
					<div className="divide-y divide-gray-100">
						{payments.slice(0, 8).map((payment) => (
							<PaymentItem key={payment.id} payment={payment} />
						))}
					</div>
				)}
			</CardBody>
		</Card>
	);
}

function PaymentItem({ payment }: { payment: Payment }) {
	const statusConfig = {
		completed: {
			bg: "bg-green-100",
			icon: CheckCircle,
			iconColor: "text-green-600",
		},
		pending: {
			bg: "bg-yellow-100",
			icon: Clock,
			iconColor: "text-yellow-600",
		},
		failed: {
			bg: "bg-red-100",
			icon: XCircle,
			iconColor: "text-red-600",
		},
	};

	const config =
		statusConfig[payment.status as keyof typeof statusConfig] ||
		statusConfig.pending;
	const Icon = config.icon;

	return (
		<div className="flex items-center justify-between p-4 hover:bg-gray-50">
			<div className="flex items-center gap-3">
				<div
					className={`flex h-10 w-10 items-center justify-center rounded-full ${config.bg}`}
				>
					<Icon className={`h-5 w-5 ${config.iconColor}`} />
				</div>
				<div>
					<p className="font-medium text-gray-900">
						{payment.type === "rent" ? "Aluguel" : payment.type}
					</p>
					<p className="text-gray-500 text-xs">
						{new Date(payment.date).toLocaleDateString("pt-BR")}
					</p>
				</div>
			</div>
			<span
				className={`font-semibold ${payment.status === "completed" ? "text-green-600" : "text-gray-900"}`}
			>
				{formatBRL(Number(payment.amount))}
			</span>
		</div>
	);
}

function ExpensesList({
	expenses,
	onAddExpense,
}: {
	expenses: Expense[];
	onAddExpense: () => void;
}) {
	return (
		<Card className="border border-gray-200 shadow-sm">
			<CardHeader className="flex items-center justify-between border-gray-100 border-b bg-gray-50/50 px-6 py-4">
				<h3 className="font-semibold text-gray-900 text-lg">Despesas</h3>
				<Button
					size="sm"
					color="danger"
					variant="flat"
					startContent={<Plus className="h-4 w-4" />}
					onPress={onAddExpense}
				>
					Nova
				</Button>
			</CardHeader>
			<CardBody className="p-0">
				{expenses.length === 0 ? (
					<div className="py-12 text-center">
						<p className="text-gray-500">Nenhuma despesa registrada</p>
					</div>
				) : (
					<div className="divide-y divide-gray-100">
						{expenses.slice(0, 8).map((expense) => (
							<ExpenseItem key={expense.id} expense={expense} />
						))}
					</div>
				)}
			</CardBody>
		</Card>
	);
}

function ExpenseItem({ expense }: { expense: Expense }) {
	return (
		<div className="flex items-center justify-between p-4 hover:bg-gray-50">
			<div className="flex items-center gap-3">
				<div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
					<DollarSign className="h-5 w-5 text-red-600" />
				</div>
				<div>
					<p className="font-medium text-gray-900">
						{getCategoryLabel(expense.category)}
					</p>
					<p className="text-gray-500 text-xs">
						{expense.vendor ||
							new Date(expense.date).toLocaleDateString("pt-BR")}
					</p>
				</div>
			</div>
			<span className="font-semibold text-red-600">
				-{formatBRL(Number(expense.amount))}
			</span>
		</div>
	);
}
