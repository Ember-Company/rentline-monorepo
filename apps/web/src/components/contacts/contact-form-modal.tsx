import {
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Button,
	Input,
	Textarea,
	RadioGroup,
	Radio,
} from "@heroui/react";
import { X } from "lucide-react";
import { useForm } from "@tanstack/react-form";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { trpc } from "@/utils/trpc";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import z from "zod";

interface ContactFormModalProps {
	isOpen: boolean;
	onClose: () => void;
	contactType: "tenant" | "agent" | "owner";
	contactId?: string;
	propertyId?: string;
}

export function ContactFormModal({
	isOpen,
	onClose,
	contactType,
	contactId,
	propertyId,
}: ContactFormModalProps) {
	const queryClient = useQueryClient();
	const isEdit = !!contactId;

	const contactQuery = useQuery({
		...trpc.contacts.getById.queryOptions({ id: contactId! }),
		enabled: isEdit && !!contactId,
	});

	const createMutation = useMutation(trpc.contacts.create.mutationOptions());
	const updateMutation = useMutation(trpc.contacts.update.mutationOptions());
	const linkMutation = useMutation(trpc.contacts.linkToProperty.mutationOptions());

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
			try {
				const contactData: {
					type: string;
					firstName?: string;
					lastName?: string;
					email?: string;
					phone?: string;
					mobile?: string;
					dateOfBirth?: string;
					companyName?: string;
					taxId?: string;
					registrationNumber?: string;
					address?: string;
					city?: string;
					state?: string;
					postalCode?: string;
					country?: string;
					notes?: string;
				} = {
					type: contactType,
				};

				if (value.tenantType === "person") {
					if (value.firstName) contactData.firstName = value.firstName;
					if (value.lastName) contactData.lastName = value.lastName;
				} else {
					if (value.companyName) contactData.companyName = value.companyName;
				}

				if (value.email) contactData.email = value.email;
				if (value.phone) contactData.phone = value.phone;
				if (value.mobile) contactData.mobile = value.mobile;
				if (value.dateOfBirth) contactData.dateOfBirth = value.dateOfBirth;
				if (value.taxId) contactData.taxId = value.taxId;
				if (value.registrationNumber) contactData.registrationNumber = value.registrationNumber;
				if (value.address) contactData.address = value.address;
				if (value.city) contactData.city = value.city;
				if (value.state) contactData.state = value.state;
				if (value.postalCode) contactData.postalCode = value.postalCode;
				if (value.country) contactData.country = value.country;
				if (value.notes) contactData.notes = value.notes;

				if (isEdit) {
					await updateMutation.mutateAsync({
						id: contactId!,
						...contactData,
					});
					toast.success("Contact updated successfully");
				} else {
					const result = await createMutation.mutateAsync(contactData);
					
					// Link to property if propertyId is provided
					if (propertyId && result.contact) {
						await linkMutation.mutateAsync({
							contactId: result.contact.id,
							propertyId,
						});
					}
					
					toast.success("Contact created successfully");
				}

				// Invalidate queries
				queryClient.invalidateQueries({ queryKey: [["contacts", "list"]] });
				if (propertyId) {
					queryClient.invalidateQueries({ queryKey: [["contacts", "getByProperty"]] });
				}

				// Reset form
				form.reset();
				setTimeout(() => {
					onClose();
				}, 100);
			} catch (error) {
				console.error("Error saving contact:", error);
				toast.error(error instanceof Error ? error.message : "Failed to save contact");
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

	const contact = contactQuery.data?.contact;

	const isLoading =
		createMutation.isPending ||
		updateMutation.isPending ||
		linkMutation.isPending ||
		contactQuery.isLoading;

	// Update form when contact data loads or modal opens/closes
	useEffect(() => {
		if (!isOpen) {
			// Reset form when modal closes
			form.reset();
			return;
		}

		if (contact && isEdit && contactQuery.isSuccess) {
			form.setFieldValue("tenantType", contact.companyName ? "company" : "person");
			form.setFieldValue("firstName", contact.firstName || "");
			form.setFieldValue("lastName", contact.lastName || "");
			form.setFieldValue("email", contact.email || "");
			form.setFieldValue("phone", contact.phone || "");
			form.setFieldValue("mobile", contact.mobile || "");
			form.setFieldValue(
				"dateOfBirth",
				contact.dateOfBirth
					? new Date(contact.dateOfBirth).toISOString().split("T")[0]
					: "",
			);
			form.setFieldValue("companyName", contact.companyName || "");
			form.setFieldValue("taxId", contact.taxId || "");
			form.setFieldValue("registrationNumber", contact.registrationNumber || "");
			form.setFieldValue("address", contact.address || "");
			form.setFieldValue("city", contact.city || "");
			form.setFieldValue("state", contact.state || "");
			form.setFieldValue("postalCode", contact.postalCode || "");
			form.setFieldValue("country", contact.country || "");
			form.setFieldValue("notes", contact.notes || "");
		} else if (!isEdit) {
			// Reset to defaults for new contact
			form.reset();
		}
	}, [contact, isEdit, isOpen, contactQuery.isSuccess, form]);

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			size="2xl"
			scrollBehavior="inside"
			classNames={{
				base: "max-h-[90vh]",
				body: "py-6",
			}}
		>
			<ModalContent>
				<ModalHeader className="flex items-center justify-between border-b border-gray-200 pb-4">
					<h2 className="text-xl font-bold text-gray-900">
						{isEdit ? "Edit" : "Add new"} {contactType}
					</h2>
					<Button
						isIconOnly
						variant="light"
						size="sm"
						onPress={onClose}
						className="min-w-0"
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
						{/* Tenant Type Selection */}
						<form.Field name="tenantType">
							{(field) => (
								<div className="space-y-3">
									<Label className="text-sm font-semibold text-gray-700">
										{contactType === "tenant" ? "Tenant type" : "Contact type"}
									</Label>
									<RadioGroup
										value={field.state.value}
										onValueChange={(value) => field.handleChange(value as "person" | "company")}
										orientation="horizontal"
										classNames={{
											wrapper: "gap-6",
										}}
									>
										<Radio value="person" classNames={{ label: "text-sm" }}>
											Person
										</Radio>
										<Radio value="company" classNames={{ label: "text-sm" }}>
											Company
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
											<Label htmlFor={field.name} className="text-sm font-medium text-gray-700">
												First name
											</Label>
											<Input
												id={field.name}
												value={field.state.value}
												onBlur={field.handleBlur}
												onValueChange={(e) => field.handleChange(e)}
												placeholder="John"
												classNames={{
													input: "text-sm",
													inputWrapper: "border-gray-200",
												}}
											/>
										</div>
									)}
								</form.Field>

								<form.Field name="lastName">
									{(field) => (
										<div className="space-y-2">
											<Label htmlFor={field.name} className="text-sm font-medium text-gray-700">
												Last name
											</Label>
											<Input
												id={field.name}
												value={field.state.value}
												onBlur={field.handleBlur}
												onValueChange={(e) => field.handleChange(e)}
												placeholder="Doe"
												classNames={{
													input: "text-sm",
													inputWrapper: "border-gray-200",
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
											<Label htmlFor={field.name} className="text-sm font-medium text-gray-700">
												Company name
											</Label>
											<Input
												id={field.name}
												value={field.state.value}
												onBlur={field.handleBlur}
												onValueChange={(e) => field.handleChange(e)}
												placeholder="Company Name"
												classNames={{
													input: "text-sm",
													inputWrapper: "border-gray-200",
												}}
											/>
										</div>
									)}
								</form.Field>

								<div className="grid grid-cols-2 gap-4">
									<form.Field name="taxId">
										{(field) => (
											<div className="space-y-2">
												<Label htmlFor={field.name} className="text-sm font-medium text-gray-700">
													Tax ID
												</Label>
												<Input
													id={field.name}
													value={field.state.value}
													onBlur={field.handleBlur}
													onValueChange={(e) => field.handleChange(e)}
													placeholder="Tax ID"
													classNames={{
														input: "text-sm",
														inputWrapper: "border-gray-200",
													}}
												/>
											</div>
										)}
									</form.Field>

									<form.Field name="registrationNumber">
										{(field) => (
											<div className="space-y-2">
												<Label htmlFor={field.name} className="text-sm font-medium text-gray-700">
													Registration number
												</Label>
												<Input
													id={field.name}
													value={field.state.value}
													onBlur={field.handleBlur}
													onValueChange={(e) => field.handleChange(e)}
													placeholder="Registration Number"
													classNames={{
														input: "text-sm",
														inputWrapper: "border-gray-200",
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
							<h3 className="text-sm font-semibold text-gray-700">Contact Information</h3>
							<div className="grid grid-cols-2 gap-4">
								<form.Field name="email">
									{(field) => (
										<div className="space-y-2">
											<Label htmlFor={field.name} className="text-sm font-medium text-gray-700">
												Email address
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
													inputWrapper: "border-gray-200",
												}}
											/>
										</div>
									)}
								</form.Field>

								<form.Field name="phone">
									{(field) => (
										<div className="space-y-2">
											<Label htmlFor={field.name} className="text-sm font-medium text-gray-700">
												Phone number
											</Label>
											<Input
												id={field.name}
												value={field.state.value}
												onBlur={field.handleBlur}
												onValueChange={(e) => field.handleChange(e)}
												placeholder="+1 (555) 123-4567"
												classNames={{
													input: "text-sm",
													inputWrapper: "border-gray-200",
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
											<Label htmlFor={field.name} className="text-sm font-medium text-gray-700">
												Mobile number
											</Label>
											<Input
												id={field.name}
												value={field.state.value}
												onBlur={field.handleBlur}
												onValueChange={(e) => field.handleChange(e)}
												placeholder="+1 (555) 123-4567"
												classNames={{
													input: "text-sm",
													inputWrapper: "border-gray-200",
												}}
											/>
										</div>
									)}
								</form.Field>

								{form.state.values.tenantType === "person" && (
									<form.Field name="dateOfBirth">
										{(field) => (
											<div className="space-y-2">
												<Label htmlFor={field.name} className="text-sm font-medium text-gray-700">
													Date of birth
												</Label>
												<Input
													id={field.name}
													type="date"
													value={field.state.value}
													onBlur={field.handleBlur}
													onValueChange={(e) => field.handleChange(e)}
													placeholder="DD / MM / YYYY"
													classNames={{
														input: "text-sm",
														inputWrapper: "border-gray-200",
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
							<h3 className="text-sm font-semibold text-gray-700">Address</h3>
							<form.Field name="address">
								{(field) => (
									<div className="space-y-2">
										<Label htmlFor={field.name} className="text-sm font-medium text-gray-700">
											Address
										</Label>
										<Input
											id={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onValueChange={(e) => field.handleChange(e)}
											placeholder="Street address"
											classNames={{
												input: "text-sm",
												inputWrapper: "border-gray-200",
											}}
										/>
									</div>
								)}
							</form.Field>

							<div className="grid grid-cols-2 gap-4">
								<form.Field name="city">
									{(field) => (
										<div className="space-y-2">
											<Label htmlFor={field.name} className="text-sm font-medium text-gray-700">
												City
											</Label>
											<Input
												id={field.name}
												value={field.state.value}
												onBlur={field.handleBlur}
												onValueChange={(e) => field.handleChange(e)}
												placeholder="City"
												classNames={{
													input: "text-sm",
													inputWrapper: "border-gray-200",
												}}
											/>
										</div>
									)}
								</form.Field>

								<form.Field name="state">
									{(field) => (
										<div className="space-y-2">
											<Label htmlFor={field.name} className="text-sm font-medium text-gray-700">
												State
											</Label>
											<Input
												id={field.name}
												value={field.state.value}
												onBlur={field.handleBlur}
												onValueChange={(e) => field.handleChange(e)}
												placeholder="State"
												classNames={{
													input: "text-sm",
													inputWrapper: "border-gray-200",
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
											<Label htmlFor={field.name} className="text-sm font-medium text-gray-700">
												Postal code
											</Label>
											<Input
												id={field.name}
												value={field.state.value}
												onBlur={field.handleBlur}
												onValueChange={(e) => field.handleChange(e)}
												placeholder="Postal Code"
												classNames={{
													input: "text-sm",
													inputWrapper: "border-gray-200",
												}}
											/>
										</div>
									)}
								</form.Field>

								<form.Field name="country">
									{(field) => (
										<div className="space-y-2">
											<Label htmlFor={field.name} className="text-sm font-medium text-gray-700">
												Country
											</Label>
											<Input
												id={field.name}
												value={field.state.value}
												onBlur={field.handleBlur}
												onValueChange={(e) => field.handleChange(e)}
												placeholder="Country"
												classNames={{
													input: "text-sm",
													inputWrapper: "border-gray-200",
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
									<Label htmlFor={field.name} className="text-sm font-medium text-gray-700">
										Notes
									</Label>
									<Textarea
										id={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onValueChange={(e) => field.handleChange(e)}
										placeholder="Additional notes..."
										rows={4}
										classNames={{
											input: "text-sm",
											inputWrapper: "border-gray-200",
										}}
									/>
								</div>
							)}
						</form.Field>
					</form>
				</ModalBody>
				<ModalFooter className="border-t border-gray-200 pt-4">
					<Button variant="light" onPress={onClose} isDisabled={isLoading}>
						Cancel
					</Button>
					<Button
						color="primary"
						onPress={() => form.handleSubmit()}
						isLoading={isLoading}
					>
						Save
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}

