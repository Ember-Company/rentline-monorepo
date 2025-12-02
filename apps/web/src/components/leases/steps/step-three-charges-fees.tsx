import { Button, Input } from "@heroui/react";
import type { FormApi } from "@tanstack/react-form";
import { Plus, Trash2 } from "lucide-react";
import type { AdditionalCharge, LateFeeTier } from "../types";

interface StepThreeProps {
	form: FormApi<any, any>;
	onAddCharge: () => void;
	onRemoveCharge: (index: number) => void;
	onAddLateFee: () => void;
	onRemoveLateFee: (index: number) => void;
}

export function StepThreeChargesFees({
	form,
	onAddCharge,
	onRemoveCharge,
	onAddLateFee,
	onRemoveLateFee,
}: StepThreeProps) {
	return (
		<div className="space-y-4">
			<h3 className="font-semibold text-lg">Additional Charges & Fees</h3>

			<div>
				<div className="mb-2 flex items-center justify-between">
					<label className="font-medium">Additional Charges</label>
					<Button
						size="sm"
						variant="light"
						startContent={<Plus className="h-4 w-4" />}
						onPress={onAddCharge}
					>
						Add Charge
					</Button>
				</div>
				{form.getFieldValue("additionalCharges")?.map(
					(charge: AdditionalCharge, index: number) => (
						<div key={index} className="mb-2 flex gap-2">
							<Input
								placeholder="Description"
								value={charge.description}
								onValueChange={(value) => {
									const current =
										form.getFieldValue("additionalCharges") || [];
									const updated = [...current];
									updated[index] = { ...updated[index], description: value };
									form.setFieldValue("additionalCharges", updated);
								}}
								className="flex-1"
							/>
							<Input
								type="number"
								placeholder="Amount"
								value={charge.amount.toString()}
								onValueChange={(value) => {
									const current =
										form.getFieldValue("additionalCharges") || [];
									const updated = [...current];
									updated[index] = {
										...updated[index],
										amount: Number(value) || 0,
									};
									form.setFieldValue("additionalCharges", updated);
								}}
								startContent={<span>R$</span>}
								className="w-32"
							/>
							<Button
								isIconOnly
								variant="light"
								color="danger"
								onPress={() => onRemoveCharge(index)}
							>
								<Trash2 className="h-4 w-4" />
							</Button>
						</div>
					),
				)}
			</div>

			<div className="rounded-lg border border-gray-200 p-4">
				<div className="mb-3 flex items-center justify-between">
					<label className="font-medium">Late Fees</label>
					<Button
						size="sm"
						variant="light"
						startContent={<Plus className="h-4 w-4" />}
						onPress={onAddLateFee}
					>
						Add Tier
					</Button>
				</div>
				{form.getFieldValue("lateFees")?.map(
					(fee: LateFeeTier, index: number) => (
						<div key={index} className="mb-2 flex items-center gap-2">
							<Input
								type="number"
								placeholder="Days late"
								value={fee.daysLate.toString()}
								onValueChange={(value) => {
									const current = form.getFieldValue("lateFees") || [];
									const updated = [...current];
									updated[index] = {
										...updated[index],
										daysLate: Number(value) || 0,
									};
									form.setFieldValue("lateFees", updated);
								}}
								className="w-24"
							/>
							<span className="text-sm">days →</span>
							<Input
								type="number"
								placeholder="Amount"
								value={fee.amount.toString()}
								onValueChange={(value) => {
									const current = form.getFieldValue("lateFees") || [];
									const updated = [...current];
									updated[index] = {
										...updated[index],
										amount: Number(value) || 0,
									};
									form.setFieldValue("lateFees", updated);
								}}
								startContent={<span>R$</span>}
								className="flex-1"
							/>
							<Button
								isIconOnly
								variant="light"
								color="danger"
								onPress={() => onRemoveLateFee(index)}
							>
								<Trash2 className="h-4 w-4" />
							</Button>
						</div>
					),
				)}

				<div className="mt-4">
					<form.Field name="gracePeriodDays">
						{(field) => (
							<Input
								label="Grace Period (Days)"
								type="number"
								value={field.state.value}
								onValueChange={field.handleChange}
								description="Number of days before late fees apply"
							/>
						)}
					</form.Field>
				</div>
			</div>
		</div>
	);
}
