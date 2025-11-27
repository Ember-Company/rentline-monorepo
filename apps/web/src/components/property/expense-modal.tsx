import {
	Button,
	Checkbox,
	Input,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	Select,
	SelectItem,
	Textarea,
} from "@heroui/react";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";
import { Label } from "@/components/ui/label";

interface ExpenseModalProps {
	isOpen: boolean;
	onClose: () => void;
	propertyId: number;
	currency?: string;
}

const expenseCategories = [
	{ key: "maintenance", label: "Maintenance & Repairs" },
	{ key: "utilities", label: "Utilities" },
	{ key: "insurance", label: "Insurance" },
	{ key: "taxes", label: "Property Taxes" },
	{ key: "management", label: "Property Management" },
	{ key: "cleaning", label: "Cleaning" },
	{ key: "landscaping", label: "Landscaping" },
	{ key: "supplies", label: "Supplies" },
	{ key: "advertising", label: "Advertising" },
	{ key: "legal", label: "Legal & Professional" },
	{ key: "mortgage", label: "Mortgage Interest" },
	{ key: "hoa", label: "HOA Fees" },
	{ key: "other", label: "Other" },
];

export function ExpenseModal({
	isOpen,
	onClose,
	propertyId,
	currency = "USD",
}: ExpenseModalProps) {
	const [isLoading, setIsLoading] = useState(false);

	const form = useForm({
		defaultValues: {
			category: "maintenance",
			description: "",
			amount: "",
			date: new Date().toISOString().split("T")[0],
			vendor: "",
			isRecurring: false,
			receiptUrl: "",
			notes: "",
		},
		onSubmit: async ({ value }) => {
			setIsLoading(true);
			try {
				// Simulate API call
				await new Promise((resolve) => setTimeout(resolve, 500));
				toast.success("Expense recorded successfully");
				form.reset();
				onClose();
			} catch (error) {
				toast.error("Failed to record expense");
			} finally {
				setIsLoading(false);
			}
		},
		validators: {
			onSubmit: z.object({
				category: z.string().min(1, "Category is required"),
				description: z.string().min(1, "Description is required"),
				amount: z.string().regex(/^\d+(\.\d{2})?$/, "Enter a valid amount"),
				date: z.string().min(1, "Date is required"),
			}),
		},
	});

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			size="lg"
			classNames={{
				backdrop: "bg-black/50",
			}}
		>
			<ModalContent>
				<ModalHeader className="border-gray-200 border-b pb-4">
					<div>
						<h2 className="font-bold text-gray-900 text-xl">Record Expense</h2>
						<p className="mt-1 text-gray-500 text-sm">
							Track a new property expense
						</p>
					</div>
				</ModalHeader>
				<ModalBody className="py-6">
					<form
						onSubmit={(e) => {
							e.preventDefault();
							form.handleSubmit();
						}}
						className="space-y-4"
					>
						<form.Field name="category">
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>Category *</Label>
									<Select
										selectedKeys={[field.state.value]}
										onSelectionChange={(keys) =>
											field.handleChange(Array.from(keys)[0] as string)
										}
										classNames={{
											trigger: "border-gray-200",
										}}
									>
										{expenseCategories.map((cat) => (
											<SelectItem key={cat.key}>{cat.label}</SelectItem>
										))}
									</Select>
								</div>
							)}
						</form.Field>

						<form.Field name="description">
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>Description *</Label>
									<Input
										id={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onValueChange={(e) => field.handleChange(e)}
										placeholder="e.g., HVAC repair, plumbing fix"
										classNames={{
											inputWrapper: "border-gray-200",
										}}
									/>
									{field.state.meta.errors.map((error) => (
										<p key={error?.message} className="text-danger text-sm">
											{error?.message}
										</p>
									))}
								</div>
							)}
						</form.Field>

						<div className="grid grid-cols-2 gap-4">
							<form.Field name="amount">
								{(field) => (
									<div className="space-y-2">
										<Label htmlFor={field.name}>Amount *</Label>
										<Input
											id={field.name}
											type="number"
											value={field.state.value}
											onBlur={field.handleBlur}
											onValueChange={(e) => field.handleChange(e)}
											startContent={
												<span className="text-gray-500 text-sm">
													{currency}
												</span>
											}
											placeholder="0.00"
											classNames={{
												inputWrapper: "border-gray-200",
											}}
										/>
										{field.state.meta.errors.map((error) => (
											<p key={error?.message} className="text-danger text-sm">
												{error?.message}
											</p>
										))}
									</div>
								)}
							</form.Field>

							<form.Field name="date">
								{(field) => (
									<div className="space-y-2">
										<Label htmlFor={field.name}>Date *</Label>
										<Input
											id={field.name}
											type="date"
											value={field.state.value}
											onBlur={field.handleBlur}
											onValueChange={(e) => field.handleChange(e)}
											classNames={{
												inputWrapper: "border-gray-200",
											}}
										/>
									</div>
								)}
							</form.Field>
						</div>

						<form.Field name="vendor">
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>Vendor / Payee</Label>
									<Input
										id={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onValueChange={(e) => field.handleChange(e)}
										placeholder="e.g., ABC Plumbing Co."
										classNames={{
											inputWrapper: "border-gray-200",
										}}
									/>
								</div>
							)}
						</form.Field>

						<form.Field name="isRecurring">
							{(field) => (
								<div className="flex items-center gap-2">
									<Checkbox
										isSelected={field.state.value}
										onValueChange={(value) => field.handleChange(value)}
									>
										<span className="text-gray-700 text-sm">
											This is a recurring expense
										</span>
									</Checkbox>
								</div>
							)}
						</form.Field>

						<form.Field name="notes">
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>Notes</Label>
									<Textarea
										id={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onValueChange={(e) => field.handleChange(e)}
										placeholder="Add any notes about this expense..."
										minRows={2}
										classNames={{
											inputWrapper: "border-gray-200",
										}}
									/>
								</div>
							)}
						</form.Field>
					</form>
				</ModalBody>
				<ModalFooter className="border-gray-200 border-t pt-4">
					<Button variant="light" onPress={onClose} isDisabled={isLoading}>
						Cancel
					</Button>
					<Button
						color="primary"
						onPress={() => form.handleSubmit()}
						isLoading={isLoading}
					>
						Record Expense
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}
