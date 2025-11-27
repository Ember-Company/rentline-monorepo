import {
	Button,
	Input,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	Radio,
	RadioGroup,
	Textarea,
} from "@heroui/react";
import { useForm } from "@tanstack/react-form";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import z from "zod";
import { Label } from "@/components/ui/label";
import { type Contact, getContactById } from "@/lib/mock-data/contacts";

interface ContactFormModalProps {
	isOpen: boolean;
	onClose: () => void;
	contactType: "tenant" | "agent" | "owner";
	contactId?: string;
	propertyId?: string;
	onSave?: (contact: Contact) => void;
}

export function ContactFormModal({
	isOpen,
	onClose,
	contactType,
	contactId,
	propertyId,
	onSave,
}: ContactFormModalProps) {
	const isEdit = !!contactId;
	const [isLoading, setIsLoading] = useState(false);

	// Get existing contact if editing
	const existingContact = contactId ? getContactById(contactId) : null;

	const form = useForm({
		defaultValues: {
			tenantType: "person" as "person" | "company",
			firstName: "",
			lastName: "",
			email: "",
			phone: "",
			mobile: "",
			dateOfBirth: "",
			companyName: "",
			taxId: "",
			registrationNumber: "",
			address: "",
			city: "",
			state: "",
			postalCode: "",
			country: "",
			notes: "",
		},
		onSubmit: async ({ value }) => {
			setIsLoading(true);
			try {
				// Simulate API call
				await new Promise((resolve) => setTimeout(resolve, 500));

				const now = new Date().toISOString();
				const contact: Contact = {
					id: contactId || `cnt_${Date.now()}`,
					organizationId: "org_1",
					type: contactType,
					firstName:
						value.tenantType === "person" ? value.firstName || null : null,
					lastName:
						value.tenantType === "person" ? value.lastName || null : null,
					email: value.email || null,
					phone: value.phone || null,
					mobile: value.mobile || null,
					dateOfBirth: value.dateOfBirth || null,
					notes: value.notes || null,
					companyName:
						value.tenantType === "company" ? value.companyName || null : null,
					taxId: value.taxId || null,
					registrationNumber: value.registrationNumber || null,
					address: value.address || null,
					city: value.city || null,
					state: value.state || null,
					postalCode: value.postalCode || null,
					country: value.country || null,
					avatarUrl: null,
					status: "active",
					createdAt: existingContact?.createdAt || now,
					updatedAt: now,
				};

				onSave?.(contact);
				toast.success(
					isEdit
						? "Contact updated successfully"
						: "Contact created successfully",
				);
				form.reset();
				onClose();
			} catch (error) {
				console.error("Error saving contact:", error);
				toast.error("Failed to save contact");
			} finally {
				setIsLoading(false);
			}
		},
		validators: {
			onSubmit: z.object({
				tenantType: z.enum(["person", "company"]),
				firstName: z.string().optional(),
				lastName: z.string().optional(),
				email: z.string().email().optional().or(z.literal("")),
				phone: z.string().optional(),
				mobile: z.string().optional(),
				dateOfBirth: z.string().optional(),
				companyName: z.string().optional(),
			}),
		},
	});

	// Update form when contact data loads or modal opens/closes
	useEffect(() => {
		if (!isOpen) {
			form.reset();
			return;
		}

		if (existingContact && isEdit) {
			form.setFieldValue(
				"tenantType",
				existingContact.companyName ? "company" : "person",
			);
			form.setFieldValue("firstName", existingContact.firstName || "");
			form.setFieldValue("lastName", existingContact.lastName || "");
			form.setFieldValue("email", existingContact.email || "");
			form.setFieldValue("phone", existingContact.phone || "");
			form.setFieldValue("mobile", existingContact.mobile || "");
			form.setFieldValue(
				"dateOfBirth",
				existingContact.dateOfBirth
					? new Date(existingContact.dateOfBirth).toISOString().split("T")[0]
					: "",
			);
			form.setFieldValue("companyName", existingContact.companyName || "");
			form.setFieldValue("taxId", existingContact.taxId || "");
			form.setFieldValue(
				"registrationNumber",
				existingContact.registrationNumber || "",
			);
			form.setFieldValue("address", existingContact.address || "");
			form.setFieldValue("city", existingContact.city || "");
			form.setFieldValue("state", existingContact.state || "");
			form.setFieldValue("postalCode", existingContact.postalCode || "");
			form.setFieldValue("country", existingContact.country || "");
			form.setFieldValue("notes", existingContact.notes || "");
		} else if (!isEdit) {
			form.reset();
		}
	}, [existingContact, isEdit, isOpen, form]);

	const getTypeLabel = () => {
		switch (contactType) {
			case "tenant":
				return "Tenant";
			case "agent":
				return "Agent";
			case "owner":
				return "Owner";
		}
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			size="2xl"
			scrollBehavior="inside"
			classNames={{
				base: "max-h-[90vh]",
				body: "py-6",
				backdrop: "bg-black/50",
			}}
		>
			<ModalContent>
				<ModalHeader className="flex items-center justify-between border-gray-200 border-b pb-4">
					<div>
						<h2 className="font-bold text-gray-900 text-xl">
							{isEdit ? "Edit" : "Add New"} {getTypeLabel()}
						</h2>
						<p className="mt-1 text-gray-500 text-sm">
							{isEdit
								? "Update the contact information below"
								: "Fill in the details to create a new contact"}
						</p>
					</div>
					<Button
						isIconOnly
						variant="light"
						size="sm"
						onPress={onClose}
						className="min-w-0 text-gray-400 hover:text-gray-600"
					>
						<X className="h-5 w-5" />
					</Button>
				</ModalHeader>
				<ModalBody>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							form.handleSubmit();
						}}
						className="space-y-6"
					>
						{/* Contact Type Selection */}
						<form.Field name="tenantType">
							{(field) => (
								<div className="space-y-3">
									<Label className="font-semibold text-gray-700 text-sm">
										Contact Type
									</Label>
									<RadioGroup
										value={field.state.value}
										onValueChange={(value) =>
											field.handleChange(value as "person" | "company")
										}
										orientation="horizontal"
										classNames={{
											wrapper: "gap-6",
										}}
									>
										<Radio value="person" classNames={{ label: "text-sm" }}>
											Individual
										</Radio>
										<Radio value="company" classNames={{ label: "text-sm" }}>
											Company / Organization
										</Radio>
									</RadioGroup>
								</div>
							)}
						</form.Field>

						{/* Person Fields */}
						{form.state.values.tenantType === "person" && (
							<div className="grid grid-cols-2 gap-4">
								<form.Field name="firstName">
									{(field) => (
										<div className="space-y-2">
											<Label
												htmlFor={field.name}
												className="font-medium text-gray-700 text-sm"
											>
												First Name
											</Label>
											<Input
												id={field.name}
												value={field.state.value}
												onBlur={field.handleBlur}
												onValueChange={(e) => field.handleChange(e)}
												placeholder="John"
												classNames={{
													input: "text-sm",
													inputWrapper: "border-gray-200 hover:border-gray-300",
												}}
											/>
										</div>
									)}
								</form.Field>

								<form.Field name="lastName">
									{(field) => (
										<div className="space-y-2">
											<Label
												htmlFor={field.name}
												className="font-medium text-gray-700 text-sm"
											>
												Last Name
											</Label>
											<Input
												id={field.name}
												value={field.state.value}
												onBlur={field.handleBlur}
												onValueChange={(e) => field.handleChange(e)}
												placeholder="Doe"
												classNames={{
													input: "text-sm",
													inputWrapper: "border-gray-200 hover:border-gray-300",
												}}
											/>
										</div>
									)}
								</form.Field>
							</div>
						)}

						{/* Company Fields */}
						{form.state.values.tenantType === "company" && (
							<div className="space-y-4">
								<form.Field name="companyName">
									{(field) => (
										<div className="space-y-2">
											<Label
												htmlFor={field.name}
												className="font-medium text-gray-700 text-sm"
											>
												Company Name <span className="text-danger">*</span>
											</Label>
											<Input
												id={field.name}
												value={field.state.value}
												onBlur={field.handleBlur}
												onValueChange={(e) => field.handleChange(e)}
												placeholder="Acme Corporation"
												classNames={{
													input: "text-sm",
													inputWrapper: "border-gray-200 hover:border-gray-300",
												}}
											/>
										</div>
									)}
								</form.Field>

								<div className="grid grid-cols-2 gap-4">
									<form.Field name="taxId">
										{(field) => (
											<div className="space-y-2">
												<Label
													htmlFor={field.name}
													className="font-medium text-gray-700 text-sm"
												>
													Tax ID / EIN
												</Label>
												<Input
													id={field.name}
													value={field.state.value}
													onBlur={field.handleBlur}
													onValueChange={(e) => field.handleChange(e)}
													placeholder="12-3456789"
													classNames={{
														input: "text-sm",
														inputWrapper:
															"border-gray-200 hover:border-gray-300",
													}}
												/>
											</div>
										)}
									</form.Field>

									<form.Field name="registrationNumber">
										{(field) => (
											<div className="space-y-2">
												<Label
													htmlFor={field.name}
													className="font-medium text-gray-700 text-sm"
												>
													Registration Number
												</Label>
												<Input
													id={field.name}
													value={field.state.value}
													onBlur={field.handleBlur}
													onValueChange={(e) => field.handleChange(e)}
													placeholder="REG-2024-001"
													classNames={{
														input: "text-sm",
														inputWrapper:
															"border-gray-200 hover:border-gray-300",
													}}
												/>
											</div>
										)}
									</form.Field>
								</div>
							</div>
						)}

						{/* Contact Information */}
						<div className="space-y-4">
							<h3 className="border-gray-200 border-b pb-2 font-semibold text-gray-900 text-sm">
								Contact Information
							</h3>
							<div className="grid grid-cols-2 gap-4">
								<form.Field name="email">
									{(field) => (
										<div className="space-y-2">
											<Label
												htmlFor={field.name}
												className="font-medium text-gray-700 text-sm"
											>
												Email Address
											</Label>
											<Input
												id={field.name}
												type="email"
												value={field.state.value}
												onBlur={field.handleBlur}
												onValueChange={(e) => field.handleChange(e)}
												placeholder="email@example.com"
												classNames={{
													input: "text-sm",
													inputWrapper: "border-gray-200 hover:border-gray-300",
												}}
											/>
										</div>
									)}
								</form.Field>

								<form.Field name="phone">
									{(field) => (
										<div className="space-y-2">
											<Label
												htmlFor={field.name}
												className="font-medium text-gray-700 text-sm"
											>
												Phone Number
											</Label>
											<Input
												id={field.name}
												value={field.state.value}
												onBlur={field.handleBlur}
												onValueChange={(e) => field.handleChange(e)}
												placeholder="+1 (555) 123-4567"
												classNames={{
													input: "text-sm",
													inputWrapper: "border-gray-200 hover:border-gray-300",
												}}
											/>
										</div>
									)}
								</form.Field>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<form.Field name="mobile">
									{(field) => (
										<div className="space-y-2">
											<Label
												htmlFor={field.name}
												className="font-medium text-gray-700 text-sm"
											>
												Mobile Number
											</Label>
											<Input
												id={field.name}
												value={field.state.value}
												onBlur={field.handleBlur}
												onValueChange={(e) => field.handleChange(e)}
												placeholder="+1 (555) 987-6543"
												classNames={{
													input: "text-sm",
													inputWrapper: "border-gray-200 hover:border-gray-300",
												}}
											/>
										</div>
									)}
								</form.Field>

								{form.state.values.tenantType === "person" && (
									<form.Field name="dateOfBirth">
										{(field) => (
											<div className="space-y-2">
												<Label
													htmlFor={field.name}
													className="font-medium text-gray-700 text-sm"
												>
													Date of Birth
												</Label>
												<Input
													id={field.name}
													type="date"
													value={field.state.value}
													onBlur={field.handleBlur}
													onValueChange={(e) => field.handleChange(e)}
													classNames={{
														input: "text-sm",
														inputWrapper:
															"border-gray-200 hover:border-gray-300",
													}}
												/>
											</div>
										)}
									</form.Field>
								)}
							</div>
						</div>

						{/* Address Information */}
						<div className="space-y-4">
							<h3 className="border-gray-200 border-b pb-2 font-semibold text-gray-900 text-sm">
								Address
							</h3>
							<form.Field name="address">
								{(field) => (
									<div className="space-y-2">
										<Label
											htmlFor={field.name}
											className="font-medium text-gray-700 text-sm"
										>
											Street Address
										</Label>
										<Input
											id={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onValueChange={(e) => field.handleChange(e)}
											placeholder="123 Main Street, Suite 100"
											classNames={{
												input: "text-sm",
												inputWrapper: "border-gray-200 hover:border-gray-300",
											}}
										/>
									</div>
								)}
							</form.Field>

							<div className="grid grid-cols-2 gap-4">
								<form.Field name="city">
									{(field) => (
										<div className="space-y-2">
											<Label
												htmlFor={field.name}
												className="font-medium text-gray-700 text-sm"
											>
												City
											</Label>
											<Input
												id={field.name}
												value={field.state.value}
												onBlur={field.handleBlur}
												onValueChange={(e) => field.handleChange(e)}
												placeholder="San Francisco"
												classNames={{
													input: "text-sm",
													inputWrapper: "border-gray-200 hover:border-gray-300",
												}}
											/>
										</div>
									)}
								</form.Field>

								<form.Field name="state">
									{(field) => (
										<div className="space-y-2">
											<Label
												htmlFor={field.name}
												className="font-medium text-gray-700 text-sm"
											>
												State / Province
											</Label>
											<Input
												id={field.name}
												value={field.state.value}
												onBlur={field.handleBlur}
												onValueChange={(e) => field.handleChange(e)}
												placeholder="CA"
												classNames={{
													input: "text-sm",
													inputWrapper: "border-gray-200 hover:border-gray-300",
												}}
											/>
										</div>
									)}
								</form.Field>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<form.Field name="postalCode">
									{(field) => (
										<div className="space-y-2">
											<Label
												htmlFor={field.name}
												className="font-medium text-gray-700 text-sm"
											>
												Postal / ZIP Code
											</Label>
											<Input
												id={field.name}
												value={field.state.value}
												onBlur={field.handleBlur}
												onValueChange={(e) => field.handleChange(e)}
												placeholder="94102"
												classNames={{
													input: "text-sm",
													inputWrapper: "border-gray-200 hover:border-gray-300",
												}}
											/>
										</div>
									)}
								</form.Field>

								<form.Field name="country">
									{(field) => (
										<div className="space-y-2">
											<Label
												htmlFor={field.name}
												className="font-medium text-gray-700 text-sm"
											>
												Country
											</Label>
											<Input
												id={field.name}
												value={field.state.value}
												onBlur={field.handleBlur}
												onValueChange={(e) => field.handleChange(e)}
												placeholder="USA"
												classNames={{
													input: "text-sm",
													inputWrapper: "border-gray-200 hover:border-gray-300",
												}}
											/>
										</div>
									)}
								</form.Field>
							</div>
						</div>

						{/* Notes */}
						<form.Field name="notes">
							{(field) => (
								<div className="space-y-2">
									<Label
										htmlFor={field.name}
										className="font-medium text-gray-700 text-sm"
									>
										Notes
									</Label>
									<Textarea
										id={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onValueChange={(e) => field.handleChange(e)}
										placeholder="Add any additional notes about this contact..."
										minRows={3}
										classNames={{
											input: "text-sm",
											inputWrapper: "border-gray-200 hover:border-gray-300",
										}}
									/>
								</div>
							)}
						</form.Field>
					</form>
				</ModalBody>
				<ModalFooter className="border-gray-200 border-t pt-4">
					<Button
						variant="light"
						onPress={onClose}
						isDisabled={isLoading}
						className="font-medium"
					>
						Cancel
					</Button>
					<Button
						color="primary"
						onPress={() => form.handleSubmit()}
						isLoading={isLoading}
						className="font-medium"
					>
						{isEdit ? "Save Changes" : "Create Contact"}
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}
