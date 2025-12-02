import {
	Button,
	Card,
	CardBody,
	CardHeader,
	Chip,
	Table,
	TableBody,
	TableCell,
	TableColumn,
	TableHeader,
	TableRow,
} from "@heroui/react";
import { Plus } from "lucide-react";
import { formatBRL } from "@/lib/constants/brazil";
import type { Expense, Payment } from "../types";

interface FinancialSummarySectionProps {
	payments: Payment[];
	expenses: Expense[];
	totalPayments: number;
	totalExpenses: number;
	netIncome: number;
	onAddPayment: () => void;
	onAddExpense: () => void;
}

export function FinancialSummarySection({
	payments,
	expenses,
	totalPayments,
	totalExpenses,
	netIncome,
	onAddPayment,
	onAddExpense,
}: FinancialSummarySectionProps) {
	const transactions = [
		...payments.map((p) => ({
			id: p.id,
			transactionType: "income" as const,
			date: new Date(p.date),
			amount: p.amount,
			category: p.type === "rent" ? "Aluguel" : p.type,
			description: p.notes || "-",
		})),
		...expenses.map((e) => ({
			id: e.id,
			transactionType: "expense" as const,
			date: new Date(e.date),
			amount: e.amount,
			category: getCategoryLabel(e.category),
			description: e.description || "-",
		})),
	]
		.sort((a, b) => b.date.getTime() - a.date.getTime())
		.slice(0, 10);

	return (
		<Card className="border border-gray-200 shadow-sm">
			<CardHeader className="flex items-center justify-between border-gray-100 border-b bg-gray-50/50 px-6 py-4">
				<h3 className="font-semibold text-gray-900 text-lg">
					Receitas e Despesas
				</h3>
				<div className="flex gap-2">
					<Button
						size="sm"
						variant="bordered"
						startContent={<Plus className="h-4 w-4" />}
						onPress={onAddPayment}
					>
						Receita
					</Button>
					<Button
						size="sm"
						variant="bordered"
						color="danger"
						startContent={<Plus className="h-4 w-4" />}
						onPress={onAddExpense}
					>
						Despesa
					</Button>
				</div>
			</CardHeader>
			<CardBody className="p-0">
				<div className="grid grid-cols-3 gap-4 border-gray-100 border-b p-6">
					<SummaryCard
						label="Total Recebido"
						value={formatBRL(totalPayments)}
						variant="success"
					/>
					<SummaryCard
						label="Total Despesas"
						value={formatBRL(totalExpenses)}
						variant="danger"
					/>
					<SummaryCard
						label="Resultado"
						value={formatBRL(netIncome)}
						variant={netIncome >= 0 ? "info" : "warning"}
					/>
				</div>

				<div className="max-h-96 overflow-auto">
					<Table removeWrapper aria-label="Transações">
						<TableHeader>
							<TableColumn>DATA</TableColumn>
							<TableColumn>TIPO</TableColumn>
							<TableColumn>CATEGORIA</TableColumn>
							<TableColumn>DESCRIÇÃO</TableColumn>
							<TableColumn>VALOR</TableColumn>
						</TableHeader>
						<TableBody>
							{transactions.map((item) => (
								<TableRow key={item.id} className="hover:bg-gray-50">
									<TableCell className="text-gray-600 text-sm">
										{item.date.toLocaleDateString("pt-BR")}
									</TableCell>
									<TableCell>
										<Chip
											size="sm"
											variant="flat"
											color={
												item.transactionType === "income" ? "success" : "danger"
											}
										>
											{item.transactionType === "income"
												? "Receita"
												: "Despesa"}
										</Chip>
									</TableCell>
									<TableCell className="text-gray-600 text-sm">
										{item.category}
									</TableCell>
									<TableCell className="text-gray-600 text-sm">
										{item.description}
									</TableCell>
									<TableCell
										className={`font-semibold ${item.transactionType === "income" ? "text-green-600" : "text-red-600"}`}
									>
										{item.transactionType === "income" ? "+" : "-"}
										{formatBRL(Number(item.amount))}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</CardBody>
		</Card>
	);
}

function getCategoryLabel(category: string) {
	const labels: Record<string, string> = {
		maintenance: "Manutenção",
		utilities: "Utilidades",
		tax: "Impostos",
		insurance: "Seguro",
		repairs: "Reparos",
		supplies: "Suprimentos",
	};
	return labels[category] || category;
}

function SummaryCard({
	label,
	value,
	variant,
}: {
	label: string;
	value: string;
	variant: "success" | "danger" | "info" | "warning";
}) {
	const colors = {
		success: "bg-green-50 text-green-700",
		danger: "bg-red-50 text-red-700",
		info: "bg-blue-50 text-blue-700",
		warning: "bg-yellow-50 text-yellow-700",
	};

	return (
		<div className={`rounded-lg p-4 ${colors[variant]}`}>
			<p className="text-sm">{label}</p>
			<p className="font-bold text-xl">{value}</p>
		</div>
	);
}
