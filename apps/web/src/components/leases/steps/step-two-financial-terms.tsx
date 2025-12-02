import { Input, Select, SelectItem, Switch } from "@heroui/react";
import type { FormApi } from "@tanstack/react-form";
import { Info } from "lucide-react";
import { paymentFrequencyOptions } from "../types";

interface StepTwoProps {
	form: FormApi<any, any>;
}

export function StepTwoFinancialTerms({ form }: StepTwoProps) {
	return (
		<div className="space-y-4">
			<h3 className="font-semibold text-lg">Financial Terms</h3>

			<form.Field name="rentAmount">
				{(field) => (
					<Input
						label="Monthly Rent Amount"
						type="number"
						value={field.state.value}
						onValueChange={field.handleChange}
						isRequired
						startContent={<span className="text-default-500">R$</span>}
						placeholder="0.00"
					/>
				)}
			</form.Field>

			<div className="grid gap-4 sm:grid-cols-2">
				<form.Field name="paymentFrequency">
					{(field) => (
						<Select
							label="Payment Frequency"
							selectedKeys={[field.state.value]}
							onSelectionChange={(keys) =>
								field.handleChange(Array.from(keys)[0] as string)
							}
						>
							{paymentFrequencyOptions.map((option) => (
								<SelectItem key={option.value}>{option.label}</SelectItem>
							))}
						</Select>
					)}
				</form.Field>

				<form.Field name="paymentDueDay">
					{(field) => (
						<Select
							label="Payment Due Day"
							selectedKeys={[field.state.value]}
							onSelectionChange={(keys) =>
								field.handleChange(Array.from(keys)[0] as string)
							}
						>
							{Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
								<SelectItem key={day.toString()}>{day}º dia</SelectItem>
							))}
						</Select>
					)}
				</form.Field>
			</div>

			<div className="grid gap-4 sm:grid-cols-2">
				<form.Field name="depositAmount">
					{(field) => (
						<Input
							label="Security Deposit"
							type="number"
							value={field.state.value}
							onValueChange={field.handleChange}
							startContent={<span>R$</span>}
							placeholder="0.00"
						/>
					)}
				</form.Field>

				<form.Field name="petDeposit">
					{(field) => (
						<Input
							label="Pet Deposit"
							type="number"
							value={field.state.value}
							onValueChange={field.handleChange}
							startContent={<span>R$</span>}
							placeholder="0.00"
						/>
					)}
				</form.Field>
			</div>

			<div className="grid gap-4 sm:grid-cols-2">
				<form.Field name="securityDeposit">
					{(field) => (
						<Input
							label="Additional Security Deposit"
							type="number"
							value={field.state.value}
							onValueChange={field.handleChange}
							startContent={<span>R$</span>}
							placeholder="0.00"
						/>
					)}
				</form.Field>

				<form.Field name="lastMonthRent">
					{(field) => (
						<Input
							label="Last Month Rent"
							type="number"
							value={field.state.value}
							onValueChange={field.handleChange}
							startContent={<span>R$</span>}
							placeholder="0.00"
						/>
					)}
				</form.Field>
			</div>

			<div className="rounded-lg border border-gray-200 p-4">
				<div className="mb-2 flex items-center gap-2">
					<label className="font-medium">Add Pro-Rata Payment</label>
					<Info className="h-4 w-4 text-default-500" />
				</div>
				<form.Field name="proRataEnabled">
					{(field) => (
						<Switch
							isSelected={field.state.value}
							onValueChange={field.handleChange}
						>
							Enable pro-rata payment
						</Switch>
					)}
				</form.Field>
				{form.getFieldValue("proRataEnabled") && (
					<div className="mt-3">
						<form.Field name="proRataAmount">
							{(field) => (
								<Input
									label="Pro-Rata Amount"
									type="number"
									value={field.state.value}
									onValueChange={field.handleChange}
									startContent={<span>R$</span>}
									placeholder="0.00"
								/>
							)}
						</form.Field>
					</div>
				)}
			</div>
		</div>
	);
}
