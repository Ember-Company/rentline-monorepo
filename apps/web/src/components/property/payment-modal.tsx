import {
	Button,
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

interface PaymentModalProps {
	isOpen: boolean;
	onClose: () => void;
	propertyId: number;
	tenants?: Array<{ id: string; name: string }>;
	currency?: string;
	defaultAmount?: number;
}

const paymentCategories = [
	{ key: "rent", label: "Rent" },
	{ key: "deposit", label: "Security Deposit" },
	{ key: "late-fee", label: "Late Fee" },
	{ key: "utility", label: "Utility Payment" },
	{ key: "parking", label: "Parking" },
	{ key: "pet-fee", label: "Pet Fee" },
	{ key: "other", label: "Other" },
];

const paymentMethods = [
	{ key: "bank-transfer", label: "Bank Transfer" },
	{ key: "cash", label: "Cash" },
	{ key: "check", label: "Check" },
	{ key: "credit-card", label: "Credit Card" },
	{ key: "online", label: "Online Payment" },
	{ key: "other", label: "Other" },
];

export function PaymentModal({
	isOpen,
	onClose,
	propertyId,
	tenants = [],
	currency = "USD",
	defaultAmount = 0,
}: PaymentModalProps) {
	const [isLoading, setIsLoading] = useState(false);

	const form = useForm({
		defaultValues: {
			tenantId: tenants[0]?.id || "",
			category: "rent",
			amount: defaultAmount.toString(),
			date: new Date().toISOString().split("T")[0],
			method: "bank-transfer",
			reference: "",
			notes: "",
		},
		onSubmit: async ({ value }) => {
			setIsLoading(true);
			try {
				// Simulate API call
				await new Promise((resolve) => setTimeout(resolve, 500));
				toast.success("Payment recorded successfully");
				form.reset();
				onClose();
			} catch (error) {
				toast.error("Failed to record payment");
			} finally {
				setIsLoading(false);
			}
		},
		validators: {
			onSubmit: z.object({
				category: z.string().min(1, "Category is required"),
				amount: z.string().regex(/^\d+(\.\d{2})?$/, "Enter a valid amount"),
				date: z.string().min(1, "Date is required"),
				method: z.string().min(1, "Payment method is required"),
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
						<h2 className="font-bold text-gray-900 text-xl">Record Payment</h2>
						<p className="mt-1 text-gray-500 text-sm">
							Record a new payment from a tenant
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
						{tenants.length > 0 && (
							<form.Field name="tenantId">
								{(field) => (
									<div className="space-y-2">
										<Label htmlFor={field.name}>Tenant</Label>
										<Select
											selectedKeys={
												field.state.value ? [field.state.value] : []
											}
											onSelectionChange={(keys) =>
												field.handleChange(Array.from(keys)[0] as string)
											}
											placeholder="Select tenant"
											classNames={{
												trigger: "border-gray-200",
											}}
										>
											{tenants.map((tenant) => (
												<SelectItem key={tenant.id}>{tenant.name}</SelectItem>
											))}
										</Select>
									</div>
								)}
							</form.Field>
						)}

						<div className="grid grid-cols-2 gap-4">
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
											{paymentCategories.map((cat) => (
												<SelectItem key={cat.key}>{cat.label}</SelectItem>
											))}
										</Select>
									</div>
								)}
							</form.Field>

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
						</div>

						<div className="grid grid-cols-2 gap-4">
							<form.Field name="date">
								{(field) => (
									<div className="space-y-2">
										<Label htmlFor={field.name}>Payment Date *</Label>
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

							<form.Field name="method">
								{(field) => (
									<div className="space-y-2">
										<Label htmlFor={field.name}>Payment Method *</Label>
										<Select
											selectedKeys={[field.state.value]}
											onSelectionChange={(keys) =>
												field.handleChange(Array.from(keys)[0] as string)
											}
											classNames={{
												trigger: "border-gray-200",
											}}
										>
											{paymentMethods.map((method) => (
												<SelectItem key={method.key}>{method.label}</SelectItem>
											))}
										</Select>
									</div>
								)}
							</form.Field>
						</div>

						<form.Field name="reference">
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>Reference / Transaction ID</Label>
									<Input
										id={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onValueChange={(e) => field.handleChange(e)}
										placeholder="e.g., TXN-123456"
										classNames={{
											inputWrapper: "border-gray-200",
										}}
									/>
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
										placeholder="Add any notes about this payment..."
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
						Record Payment
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}
