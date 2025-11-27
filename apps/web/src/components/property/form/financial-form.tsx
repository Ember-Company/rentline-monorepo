import { Card, CardBody, CardHeader, Input } from "@heroui/react";
import { DollarSign } from "lucide-react";
import type { PropertyCategory } from "@/lib/types/api";

interface FinancialFormProps {
	category: PropertyCategory;
	monthlyRent: string;
	askingPrice: string;
	onMonthlyRentChange: (value: string) => void;
	onAskingPriceChange: (value: string) => void;
	isDisabled?: boolean;
}

export function FinancialForm({
	category,
	monthlyRent,
	askingPrice,
	onMonthlyRentChange,
	onAskingPriceChange,
	isDisabled,
}: FinancialFormProps) {
	const showRentFields = category === "rent" || category === "both";
	const showSaleFields = category === "sale" || category === "both";

	return (
		<Card className="border border-gray-200 shadow-sm">
			<CardHeader className="border-gray-100 border-b bg-gray-50/50 px-6 py-4">
				<div className="flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
						<DollarSign className="h-5 w-5 text-amber-600" />
					</div>
					<div>
						<h2 className="font-semibold text-gray-900 text-lg">Valores</h2>
						<p className="text-gray-500 text-sm">
							Informações financeiras do imóvel
						</p>
					</div>
				</div>
			</CardHeader>
			<CardBody className="space-y-4 p-6">
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					{showRentFields && (
						<Input
							type="number"
							label="Valor do Aluguel Mensal"
							placeholder="0,00"
							value={monthlyRent}
							onValueChange={onMonthlyRentChange}
							isDisabled={isDisabled}
							startContent={<span className="text-gray-400 text-sm">R$</span>}
							classNames={{
								inputWrapper: "border-gray-200 bg-white hover:border-gray-300",
							}}
						/>
					)}
					{showSaleFields && (
						<Input
							type="number"
							label="Valor de Venda"
							placeholder="0,00"
							value={askingPrice}
							onValueChange={onAskingPriceChange}
							isDisabled={isDisabled}
							startContent={<span className="text-gray-400 text-sm">R$</span>}
							classNames={{
								inputWrapper: "border-gray-200 bg-white hover:border-gray-300",
							}}
						/>
					)}
				</div>
			</CardBody>
		</Card>
	);
}
