import {
	Button,
	Card,
	CardBody,
	Input,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	Radio,
	RadioGroup,
	Select,
	SelectItem,
	Spinner,
	Switch,
	Textarea,
} from "@heroui/react";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	Calendar,
	Check,
	ChevronLeft,
	ChevronRight,
	Info,
	Plus,
	Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { formatBRL } from "@/lib/constants/brazil";
import { useContacts, useProperties, useUnits } from "@/lib/hooks";
import { trpc } from "@/utils/trpc";

interface FullFeaturedLeaseFormProps {
	isOpen: boolean;
	onClose: () => void;
	propertyId?: string;
	unitId?: string;
}

type Step = 1 | 2 | 3 | 4 | 5 | 6;

interface AdditionalCharge {
	description: string;
	amount: number;
}

interface LateFeeTier {
	daysLate: number;
	amount: number;
}

interface LeaseContact {
	contactId: string;
	role: "owner" | "agent" | "guarantor" | "emergency_contact";
}

const paymentFrequencyOptions = [
	{ value: "standalone", label: "Standalone Payments / Airbnb" },
	{ value: "one_time", label: "One-Time" },
	{ value: "weekly", label: "Weekly" },
	{ value: "biweekly", label: "Biweekly" },
	{ value: "four_weeks", label: "4 Weeks" },
	{ value: "monthly", label: "Monthly (Calendar Month)" },
	{ value: "two_months", label: "2 Months" },
	{ value: "quarterly", label: "Quarterly" },
	{ value: "four_months", label: "4 Months" },
	{ value: "five_months", label: "5 Months" },
	{ value: "bi_annually", label: "Bi-Annually (6 Months)" },
	{ value: "eighteen_months", label: "18 Months" },
	{ value: "twenty_four_months", label: "24 Months" },
	{ value: "yearly", label: "Yearly" },
];

const furnishingOptions = [
	{ value: "furnished", label: "Furnished" },
	{ value: "unfurnished", label: "Unfurnished" },
	{ value: "partially_furnished", label: "Partially Furnished" },
];

const contactRoleOptions = [
	{ value: "owner", label: "Owner" },
	{ value: "agent", label: "Agent" },
	{ value: "guarantor", label: "Guarantor" },
	{ value: "emergency_contact", label: "Emergency Contact" },
];

export function FullFeaturedLeaseForm({
	isOpen,
	onClose,
	propertyId: initialPropertyId,
	unitId: initialUnitId,
}: FullFeaturedLeaseFormProps) {
	const queryClient = useQueryClient();
	const [currentStep, setCurrentStep] = useState<Step>(1);
	const [selectedPropertyId, setSelectedPropertyId] = useState<string>(
		initialPropertyId || "",
	);

	// Fetch data
	const { data: propertiesData, isLoading: loadingProperties } =
		useProperties();
	const { data: unitsData, isLoading: loadingUnits } = useUnits({
		propertyId: selectedPropertyId || undefined,
	});
	const { data: tenantsData, isLoading: loadingTenants } = useContacts({
		type: "tenant",
	});
	const { data: allContactsData, isLoading: loadingContacts } = useContacts({});
	const { data: currenciesData } = useQuery({
		...trpc.organizations.getCurrencies.queryOptions(),
	});

	const properties = propertiesData?.properties || [];
	const units = unitsData?.units || [];
	const tenants = tenantsData?.contacts || [];
	const allContacts = allContactsData?.contacts || [];
	const currencies = currenciesData?.currencies || [];
	const defaultCurrency = currencies.find((c) => c.symbol === "R$")?.id || "";

	// Mutation
	const createLease = useMutation({
		...trpc.leases.create.mutationOptions(),

	});

	const form = useForm({
		defaultValues: {
			// Step 1: Property & Tenant
			propertyId: initialPropertyId || "",
			unitId: initialUnitId || "",
			tenantContactId: "",
			leaseType: "fixed" as const,
			startDate: new Date().toISOString().split("T")[0],
			endDate: "",
			moveInDate: "",
			// Step 2: Financial Terms
			rentAmount: "",
			paymentFrequency: "monthly",
			paymentDueDay: "1",
			depositAmount: "",
			petDeposit: "",
			securityDeposit: "",
			lastMonthRent: "",
			proRataEnabled: false,
			proRataAmount: "",
			// Step 3: Additional Charges & Fees
			additionalCharges: [] as AdditionalCharge[],
			lateFees: [] as LateFeeTier[],
			gracePeriodDays: "5",
			// Step 4: Contacts
			contacts: [] as LeaseContact[],
			// Step 5: Additional Settings
			furnishing: "",
			autoRenew: false,
			renewalNoticeDays: "30",
			leaseExpiryReminderEnabled: false,
			leaseExpiryReminderDays: 60,
			rentReminderEnabled: false,
			rentOverdueReminderEnabled: false,
			requireRentersInsurance: false,
			terms: "",
			notes: "",
			// Meta
			status: "draft" as const,
		},
		onSubmit: async ({ value }) => {
			try {
				// Validation
				if (!value.propertyId && !value.unitId) {
					toast.error("Selecione um imóvel ou unidade");
					return;
				}

				if (!value.tenantContactId) {
					toast.error("Selecione um inquilino");
					return;
				}

				if (!value.rentAmount || Number(value.rentAmount) <= 0) {
					toast.error("Informe o valor do aluguel");
					return;
				}

				await createLease.mutateAsync({
					propertyId: value.propertyId || undefined,
					unitId: value.unitId || undefined,
					tenantContactId: value.tenantContactId,
					leaseType: value.leaseType,
					startDate: value.startDate,
					endDate: value.endDate || undefined,
					moveInDate: value.moveInDate || undefined,
					rentAmount: Number(value.rentAmount),
					currencyId: defaultCurrency,
					paymentDueDay: Number(value.paymentDueDay),
					paymentFrequency: value.paymentFrequency as any,
					depositAmount: value.depositAmount
						? Number(value.depositAmount)
						: undefined,
					petDeposit: value.petDeposit ? Number(value.petDeposit) : undefined,
					securityDeposit: value.securityDeposit
						? Number(value.securityDeposit)
						: undefined,
					lastMonthRent: value.lastMonthRent
						? Number(value.lastMonthRent)
						: undefined,
					proRataEnabled: value.proRataEnabled,
					proRataAmount: value.proRataAmount
						? Number(value.proRataAmount)
						: undefined,
					additionalCharges:
						value.additionalCharges.length > 0
							? value.additionalCharges
							: undefined,
					lateFees: value.lateFees.length > 0 ? value.lateFees : undefined,
					gracePeriodDays: Number(value.gracePeriodDays) || undefined,
					furnishing: value.furnishing as 'furnished' | 'unfurnished' | 'partially_furnished' || undefined,
					autoRenew: value.autoRenew,
					renewalNoticeDays: value.autoRenew
						? Number(value.renewalNoticeDays)
						: undefined,
					leaseExpiryReminderEnabled: value.leaseExpiryReminderEnabled,
					leaseExpiryReminderDays: value.leaseExpiryReminderEnabled
						? value.leaseExpiryReminderDays
						: undefined,
					rentReminderEnabled: value.rentReminderEnabled,
					rentOverdueReminderEnabled: value.rentOverdueReminderEnabled,
					requireRentersInsurance: value.requireRentersInsurance,
					terms: value.terms || undefined,
					notes: value.notes || undefined,
					status: value.status,
					contacts: value.contacts.length > 0 ? value.contacts : undefined,
				}, {
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["leases"] });
			toast.success("Contrato criado com sucesso!");
			onClose();
			form.reset();
			setCurrentStep(1);
		},
		onError: (error) => {
			toast.error(error.message || "Erro ao criar contrato");
		},
	});
			} catch (error) {
				console.error("Error creating lease:", error);
			}
		},
	});

	const handleNext = () => {
		if (currentStep < 6) {
			setCurrentStep((prev) => (prev + 1) as Step);
		}
	};

	const handleBack = () => {
		if (currentStep > 1) {
			setCurrentStep((prev) => (prev - 1) as Step);
		}
	};

	const handleSubmit = () => {
		form.handleSubmit();
	};

	const addAdditionalCharge = () => {
		const current = form.getFieldValue("additionalCharges") || [];
		form.setFieldValue("additionalCharges", [
			...current,
			{ description: "", amount: 0 },
		]);
	};

	const removeAdditionalCharge = (index: number) => {
		const current = form.getFieldValue("additionalCharges") || [];
		form.setFieldValue(
			"additionalCharges",
			current.filter((_, i) => i !== index),
		);
	};

	const addLateFee = () => {
		const current = form.getFieldValue("lateFees") || [];
		form.setFieldValue("lateFees", [...current, { daysLate: 5, amount: 0 }]);
	};

	const removeLateFee = (index: number) => {
		const current = form.getFieldValue("lateFees") || [];
		form.setFieldValue("lateFees", current.filter((_, i) => i !== index));
	};

	const addContact = () => {
		const current = form.getFieldValue("contacts") || [];
		form.setFieldValue("contacts", [
			...current,
			{ contactId: "", role: "owner" as const },
		]);
	};

	const removeContact = (index: number) => {
		const current = form.getFieldValue("contacts") || [];
		form.setFieldValue("contacts", current.filter((_, i) => i !== index));
	};

	if (loadingProperties || loadingTenants || loadingContacts) {
		return (
			<Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
				<ModalContent>
					<ModalBody className="flex items-center justify-center py-12">
						<Spinner size="lg" />
					</ModalBody>
				</ModalContent>
			</Modal>
		);
	}

	const steps = [
		"Property & Tenant",
		"Financial Terms",
		"Charges & Fees",
		"Contacts",
		"Settings",
		"Review",
	];

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			size="4xl"
			scrollBehavior="inside"
			isDismissable={false}
		>
			<ModalContent className="max-h-[90vh]">
				<ModalHeader className="flex flex-col gap-3 border-b border-gray-200">
					<h2 className="text-2xl font-bold">Create New Lease</h2>
					
					{/* Stepper */}
					<div className="flex items-center justify-between">
						{steps.map((step, index) => {
							const stepNum = (index + 1) as Step;
							const isActive = currentStep === stepNum;
							const isCompleted = currentStep > stepNum;

							return (
								<div key={step} className="flex flex-1 items-center">
									<button
										type="button"
										onClick={() => setCurrentStep(stepNum)}
										className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all ${
											isActive
												? "border-primary bg-primary text-white"
												: isCompleted
													? "border-primary bg-primary/10 text-primary"
													: "border-gray-300 bg-white text-gray-400"
										}`}
									>
										{isCompleted ? <Check className="h-5 w-5" /> : stepNum}
									</button>
									{index < steps.length - 1 && (
										<div
											className={`h-0.5 flex-1 ${
												currentStep > stepNum ? "bg-primary" : "bg-gray-300"
											}`}
										/>
									)}
								</div>
							);
						})}
					</div>
					<p className="text-center text-sm text-gray-500">
						Step {currentStep} of 6: {steps[currentStep - 1]}
					</p>
				</ModalHeader>

				<ModalBody className="py-6">
					<form
						onSubmit={(e) => {
							e.preventDefault();
							if (currentStep === 6) {
								handleSubmit();
							} else {
								handleNext();
							}
						}}
						className="space-y-6"
					>
						{/* Step 1: Property & Tenant */}
						{currentStep === 1 && (
							<div className="space-y-4">
								<h3 className="font-semibold text-lg">Property & Tenant Selection</h3>
								
								<div className="grid gap-4 sm:grid-cols-2">
									<form.Field name="propertyId">
										{(field) => (
											<Select
												label="Property"
												placeholder="Select a property"
												selectedKeys={field.state.value ? [field.state.value] : []}
												onSelectionChange={(keys) => {
													const value = Array.from(keys)[0] as string;
													field.handleChange(value);
													setSelectedPropertyId(value);
													form.setFieldValue("unitId", "");
												}}
												isDisabled={!!initialPropertyId}
												isRequired
											>
												{properties.map((property) => (
													<SelectItem key={property.id}>{property.name}</SelectItem>
												))}
											</Select>
										)}
									</form.Field>

									{selectedPropertyId && units.length > 0 && (
										<form.Field name="unitId">
											{(field) => (
												<Select
													label="Unit (Optional)"
													placeholder="Select a unit"
													selectedKeys={
														field.state.value ? [field.state.value] : []
													}
													onSelectionChange={(keys) =>
														field.handleChange(Array.from(keys)[0] as string)
													}
													isDisabled={!!initialUnitId}
												>
													{units.map((unit) => (
														<SelectItem key={unit.id}>
															{unit.unitNumber || unit.name}
														</SelectItem>
													))}
												</Select>
											)}
										</form.Field>
									)}
								</div>

								<form.Field name="tenantContactId">
									{(field) => (
										<Select
											label="Tenant"
											placeholder="Select a tenant"
											selectedKeys={field.state.value ? [field.state.value] : []}
											onSelectionChange={(keys) =>
												field.handleChange(Array.from(keys)[0] as string)
											}
											isRequired
										>
											{tenants.map((tenant) => (
												<SelectItem key={tenant.id}>
													{tenant.firstName} {tenant.lastName}
												</SelectItem>
											))}
										</Select>
									)}
								</form.Field>

								<div className="grid gap-4 sm:grid-cols-3">
									<form.Field name="startDate">
										{(field) => (
											<Input
												label="Start Date"
												type="date"
												value={field.state.value}
												onValueChange={field.handleChange}
												isRequired
												startContent={<Calendar className="h-4 w-4" />}
											/>
										)}
									</form.Field>

									<form.Field name="endDate">
										{(field) => (
											<Input
												label="End Date (Optional)"
												type="date"
												value={field.state.value}
												onValueChange={field.handleChange}
												startContent={<Calendar className="h-4 w-4" />}
											/>
										)}
									</form.Field>

									<form.Field name="moveInDate">
										{(field) => (
											<Input
												label="Move-In Date (Optional)"
												type="date"
												value={field.state.value}
												onValueChange={field.handleChange}
												startContent={<Calendar className="h-4 w-4" />}
											/>
										)}
									</form.Field>
								</div>
							</div>
						)}

						{/* Step 2: Financial Terms */}
						{currentStep === 2 && (
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
													<SelectItem key={day.toString()}>
														{day}º dia
													</SelectItem>
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
						)}

						{/* Step 3: Additional Charges & Fees */}
						{currentStep === 3 && (
							<div className="space-y-4">
								<h3 className="font-semibold text-lg">Additional Charges & Fees</h3>

								<div>
									<div className="mb-2 flex items-center justify-between">
										<label className="font-medium">Additional Charges</label>
										<Button
											size="sm"
											variant="light"
											startContent={<Plus className="h-4 w-4" />}
											onPress={addAdditionalCharge}
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
													onPress={() => removeAdditionalCharge(index)}
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
											onPress={addLateFee}
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
													onPress={() => removeLateFee(index)}
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
						)}

						{/* Step 4: Contacts */}
						{currentStep === 4 && (
							<div className="space-y-4">
								<h3 className="font-semibold text-lg">Lease Contacts</h3>
								<p className="text-sm text-gray-500">
									Add owners, agents, guarantors, or emergency contacts
								</p>

								<div>
									<div className="mb-2 flex items-center justify-between">
										<label className="font-medium">Contacts</label>
										<Button
											size="sm"
											variant="light"
											startContent={<Plus className="h-4 w-4" />}
											onPress={addContact}
										>
											Add Contact
										</Button>
									</div>

									{form.getFieldValue("contacts")?.map(
										(contact: LeaseContact, index: number) => (
											<div key={index} className="mb-3 flex gap-2">
												<Select
													placeholder="Select contact"
													selectedKeys={contact.contactId ? [contact.contactId] : []}
													onSelectionChange={(keys) => {
														const current = form.getFieldValue("contacts") || [];
														const updated = [...current];
														updated[index] = {
															...updated[index],
															contactId: Array.from(keys)[0] as string,
														};
														form.setFieldValue("contacts", updated);
													}}
													className="flex-1"
												>
													{allContacts.map((c) => (
														<SelectItem key={c.id}>
															{c.firstName} {c.lastName} ({c.type})
														</SelectItem>
													))}
												</Select>

												<Select
													placeholder="Role"
													selectedKeys={[contact.role]}
													onSelectionChange={(keys) => {
														const current = form.getFieldValue("contacts") || [];
														const updated = [...current];
														updated[index] = {
															...updated[index],
															role: Array.from(keys)[0] as any,
														};
														form.setFieldValue("contacts", updated);
													}}
													className="w-48"
												>
													{contactRoleOptions.map((role) => (
														<SelectItem key={role.value}>{role.label}</SelectItem>
													))}
												</Select>

												<Button
													isIconOnly
													variant="light"
													color="danger"
													onPress={() => removeContact(index)}
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</div>
										),
									)}
								</div>
							</div>
						)}

						{/* Step 5: Additional Settings */}
						{currentStep === 5 && (
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
						)}

						{/* Step 6: Review */}
						{currentStep === 6 && (
							<div className="space-y-4">
								<h3 className="font-semibold text-lg">Review Lease Details</h3>
								
								<Card className="border border-gray-200">
									<CardBody className="space-y-4">
										<div>
											<h4 className="mb-2 font-medium">Property & Tenant</h4>
											<div className="space-y-1 text-sm">
												<p>
													<span className="text-gray-500">Property:</span>{" "}
													{properties.find((p) => p.id === form.getFieldValue("propertyId"))?.name}
												</p>
												{form.getFieldValue("unitId") && (
													<p>
														<span className="text-gray-500">Unit:</span>{" "}
														{units.find((u) => u.id === form.getFieldValue("unitId"))?.unitNumber}
													</p>
												)}
												<p>
													<span className="text-gray-500">Tenant:</span>{" "}
													{(() => {
														const tenant = tenants.find(
															(t) => t.id === form.getFieldValue("tenantContactId"),
														);
														return tenant ? `${tenant.firstName} ${tenant.lastName}` : "";
													})()}
												</p>
												<p>
													<span className="text-gray-500">Period:</span>{" "}
													{form.getFieldValue("startDate")} →{" "}
													{form.getFieldValue("endDate") || "Indefinite"}
												</p>
											</div>
										</div>

										<div>
											<h4 className="mb-2 font-medium">Financial</h4>
											<div className="space-y-1 text-sm">
												<p>
													<span className="text-gray-500">Rent:</span> R${" "}
													{form.getFieldValue("rentAmount")} /{" "}
													{form.getFieldValue("paymentFrequency")}
												</p>
												<p>
													<span className="text-gray-500">Due Day:</span>{" "}
													{form.getFieldValue("paymentDueDay")}º
												</p>
												{form.getFieldValue("depositAmount") && (
													<p>
														<span className="text-gray-500">Deposit:</span> R${" "}
														{form.getFieldValue("depositAmount")}
													</p>
												)}
											</div>
										</div>

										{form.getFieldValue("contacts").length > 0 && (
											<div>
												<h4 className="mb-2 font-medium">Contacts</h4>
												<div className="space-y-1 text-sm">
													{form.getFieldValue("contacts").map((contact: LeaseContact, i: number) => {
														const c = allContacts.find((ac) => ac.id === contact.contactId);
														return (
															<p key={i}>
																<span className="text-gray-500">{contact.role}:</span>{" "}
																{c ? `${c.firstName} ${c.lastName}` : ""}
															</p>
														);
													})}
												</div>
											</div>
										)}
									</CardBody>
								</Card>
							</div>
						)}
					</form>
				</ModalBody>

				<ModalFooter className="border-t border-gray-200">
					<div className="flex w-full items-center justify-between">
						<Button
							variant="light"
							onPress={handleBack}
							isDisabled={currentStep === 1}
							startContent={<ChevronLeft className="h-4 w-4" />}
						>
							Back
						</Button>

						<div className="flex gap-2">
							<Button variant="light" onPress={() => {
								onClose();
								form.reset();
								setCurrentStep(1);
							}}>
								Cancel
							</Button>

							{currentStep < 6 ? (
								<Button
									color="primary"
									onPress={handleNext}
									endContent={<ChevronRight className="h-4 w-4" />}
								>
									Next
								</Button>
							) : (
								<Button
									color="primary"
									onPress={handleSubmit}
									isLoading={createLease.isPending}
								>
									Create Lease
								</Button>
							)}
						</div>
					</div>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}
