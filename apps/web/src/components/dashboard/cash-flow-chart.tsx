import { Button, Card, CardBody, CardHeader } from "@heroui/react";
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
			<CardHeader className="flex items-center justify-between">
				<div>
					<h2 className="font-semibold text-xl">{title}</h2>
					<p className="text-muted-foreground text-sm">{subtitle}</p>
				</div>
				<Button variant="light" size="sm">
					View Details
				</Button>
			</CardHeader>
			<CardBody>
				<div className="space-y-4">
					<div className="flex h-64 items-end justify-between gap-2">
						{data.map((item, index) => (
							<div
								key={index}
								className="flex flex-1 flex-col items-center gap-2"
							>
								<div className="relative flex h-full w-full flex-col justify-end">
									<div
										className="w-full cursor-pointer rounded-t bg-primary transition-all hover:opacity-80"
										style={{
											height: `${(item.net / maxNetFlow) * 100}%`,
										}}
										title={`${item.month}: ${formatCurrency(item.net)}`}
									/>
								</div>
								<span className="text-muted-foreground text-xs">
									{item.month}
								</span>
							</div>
						))}
					</div>
					<div className="flex items-center justify-center gap-6 border-t pt-4">
						<div className="flex items-center gap-2">
							<div className="h-3 w-3 rounded bg-primary" />
							<span className="text-muted-foreground text-sm">
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
