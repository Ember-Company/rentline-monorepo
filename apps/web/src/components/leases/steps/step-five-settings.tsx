import { Input, Select, SelectItem, Switch, Textarea } from "@heroui/react";
import type { FormApi } from "@tanstack/react-form";
import { furnishingOptions } from "../types";

interface StepFiveProps {
	form: FormApi<any, any>;
}

export function StepFiveSettings({ form }: StepFiveProps) {
	return (
		<div className="space-y-4">
			<h3 className="font-semibold text-lg">Additional Settings</h3>

			<form.Field name="furnishing">
				{(field) => (
					<Select
						label="Furnishing"
						placeholder="Select furnishing status"
						selectedKeys={field.state.value ? [field.state.value] : []}
						onSelectionChange={(keys) =>
							field.handleChange(Array.from(keys)[0] as string)
						}
					>
						{furnishingOptions.map((option) => (
							<SelectItem key={option.value}>{option.label}</SelectItem>
						))}
					</Select>
				)}
			</form.Field>

			<div className="rounded-lg border border-gray-200 p-4">
				<h4 className="mb-3 font-medium">Auto-Renewal</h4>
				<form.Field name="autoRenew">
					{(field) => (
						<Switch
							isSelected={field.state.value}
							onValueChange={field.handleChange}
						>
							Enable auto-renewal
						</Switch>
					)}
				</form.Field>
				{form.getFieldValue("autoRenew") && (
					<div className="mt-3">
						<form.Field name="renewalNoticeDays">
							{(field) => (
								<Input
									label="Renewal Notice Days"
									type="number"
									value={field.state.value}
									onValueChange={field.handleChange}
									description="Days before renewal to notify"
								/>
							)}
						</form.Field>
					</div>
				)}
			</div>

			<div className="rounded-lg border border-gray-200 p-4">
				<h4 className="mb-3 font-medium">Reminders</h4>
				<div className="space-y-3">
					<div>
						<form.Field name="leaseExpiryReminderEnabled">
							{(field) => (
								<Switch
									isSelected={field.state.value}
									onValueChange={field.handleChange}
								>
									Lease expiry reminder
								</Switch>
							)}
						</form.Field>
						{form.getFieldValue("leaseExpiryReminderEnabled") && (
							<div className="mt-2 ml-6">
								<form.Field name="leaseExpiryReminderDays">
									{(field) => (
										<Input
											type="number"
											value={field.state.value.toString()}
											onValueChange={(value) =>
												field.handleChange(Number(value) || 60)
											}
											endContent={<span className="text-sm">days before</span>}
											className="max-w-xs"
										/>
									)}
								</form.Field>
							</div>
						)}
					</div>

					<form.Field name="rentReminderEnabled">
						{(field) => (
							<Switch
								isSelected={field.state.value}
								onValueChange={field.handleChange}
							>
								Rent payment reminder
							</Switch>
						)}
					</form.Field>

					<form.Field name="rentOverdueReminderEnabled">
						{(field) => (
							<Switch
								isSelected={field.state.value}
								onValueChange={field.handleChange}
							>
								Overdue rent reminder
							</Switch>
						)}
					</form.Field>
				</div>
			</div>

			<form.Field name="requireRentersInsurance">
				{(field) => (
					<Switch
						isSelected={field.state.value}
						onValueChange={field.handleChange}
					>
						Require renter's insurance
					</Switch>
				)}
			</form.Field>

			<form.Field name="terms">
				{(field) => (
					<Textarea
						label="Additional Terms"
						placeholder="Enter any additional terms and conditions..."
						value={field.state.value}
						onValueChange={field.handleChange}
						rows={4}
					/>
				)}
			</form.Field>

			<form.Field name="notes">
				{(field) => (
					<Textarea
						label="Internal Notes"
						placeholder="Enter any internal notes about this lease..."
						value={field.state.value}
						onValueChange={field.handleChange}
						rows={3}
					/>
				)}
			</form.Field>
		</div>
	);
}
