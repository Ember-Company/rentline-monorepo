import { Card, CardBody, CardHeader, Button } from "@heroui/react";
import { formatCurrency } from "@/lib/utils/format";

type CashFlowData = {
	month: string;
	income: number;
	expenses: number;
	net: number;
};

type CashFlowChartProps = {
	data: CashFlowData[];
	title?: string;
	subtitle?: string;
};

export function CashFlowChart({
	data,
	title = "Cash Flow (12 Months)",
	subtitle = "Income vs Expenses",
}: CashFlowChartProps) {
	const maxNetFlow = Math.max(...data.map((d) => d.net));
	const total = data.reduce((sum, d) => sum + d.net, 0);

	return (
		<Card>
			<CardHeader className="flex justify-between items-center">
				<div>
					<h2 className="text-xl font-semibold">{title}</h2>
					<p className="text-sm text-muted-foreground">{subtitle}</p>
				</div>
				<Button variant="light" size="sm">
					View Details
				</Button>
			</CardHeader>
			<CardBody>
				<div className="space-y-4">
					<div className="flex items-end justify-between gap-2 h-64">
						{data.map((item, index) => (
							<div
								key={index}
								className="flex flex-col items-center gap-2 flex-1"
							>
								<div className="relative w-full h-full flex flex-col justify-end">
									<div
										className="w-full bg-primary rounded-t transition-all hover:opacity-80 cursor-pointer"
										style={{
											height: `${(item.net / maxNetFlow) * 100}%`,
										}}
										title={`${item.month}: ${formatCurrency(item.net)}`}
									/>
								</div>
								<span className="text-xs text-muted-foreground">
									{item.month}
								</span>
							</div>
						))}
					</div>
					<div className="flex items-center justify-center gap-6 pt-4 border-t">
						<div className="flex items-center gap-2">
							<div className="w-3 h-3 rounded bg-primary" />
							<span className="text-sm text-muted-foreground">
								Net Cash Flow
							</span>
						</div>
						<div className="text-sm">
							<span className="text-muted-foreground">Total: </span>
							<span className="font-semibold">{formatCurrency(total)}</span>
						</div>
					</div>
				</div>
			</CardBody>
		</Card>
	);
}

