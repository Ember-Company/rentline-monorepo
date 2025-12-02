import {
	Button,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	Spinner,
} from "@heroui/react";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useContacts, useProperties, useUnits } from "@/lib/hooks";
import { trpc } from "@/utils/trpc";
import { LeaseFormStepper } from "./lease-form-stepper";
import { StepOnePropertyTenant } from "./steps/step-one-property-tenant";
import { StepTwoFinancialTerms } from "./steps/step-two-financial-terms";
import { StepThreeChargesFees } from "./steps/step-three-charges-fees";
import { StepFourContacts } from "./steps/step-four-contacts";
import { StepFiveSettings } from "./steps/step-five-settings";
import { StepSixReview } from "./steps/step-six-review";
import type {
	AdditionalCharge,
	FormStep,
	LateFeeTier,
	LeaseContact,
} from "./types";

interface FullFeaturedLeaseFormProps {
	isOpen: boolean;
	onClose: () => void;
	propertyId?: string;
	unitId?: string;
}

export function FullFeaturedLeaseForm({
	isOpen,
	onClose,
	propertyId: initialPropertyId,
	unitId: initialUnitId,
}: FullFeaturedLeaseFormProps) {
	const queryClient = useQueryClient();
	const [currentStep, setCurrentStep] = useState<FormStep>(1);
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

				await createLease.mutateAsync(
					{
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
						furnishing:
							(value.furnishing as
								| "furnished"
								| "unfurnished"
								| "partially_furnished") || undefined,
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
					},
					{
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
					},
				);
			} catch (error) {
				console.error("Error creating lease:", error);
			}
		},
	});

	const handleNext = () => {
		if (currentStep < 6) {
			setCurrentStep((prev) => (prev + 1) as FormStep);
		}
	};

	const handleBack = () => {
		if (currentStep > 1) {
			setCurrentStep((prev) => (prev - 1) as FormStep);
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
					<LeaseFormStepper
						currentStep={currentStep}
						onStepClick={setCurrentStep}
					/>
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
						{currentStep === 1 && (
							<StepOnePropertyTenant
								form={form}
								properties={properties}
								units={units}
								tenants={tenants}
								selectedPropertyId={selectedPropertyId}
								onPropertyChange={(propertyId) => {
									setSelectedPropertyId(propertyId);
									form.setFieldValue("unitId", "");
								}}
								initialPropertyId={initialPropertyId}
								initialUnitId={initialUnitId}
							/>
						)}

						{currentStep === 2 && <StepTwoFinancialTerms form={form} />}

						{currentStep === 3 && (
							<StepThreeChargesFees
								form={form}
								onAddCharge={addAdditionalCharge}
								onRemoveCharge={removeAdditionalCharge}
								onAddLateFee={addLateFee}
								onRemoveLateFee={removeLateFee}
							/>
						)}

						{currentStep === 4 && (
							<StepFourContacts
								form={form}
								contacts={allContacts}
								onAddContact={addContact}
								onRemoveContact={removeContact}
							/>
						)}

						{currentStep === 5 && <StepFiveSettings form={form} />}

						{currentStep === 6 && (
							<StepSixReview
								form={form}
								properties={properties}
								units={units}
								tenants={tenants}
								allContacts={allContacts}
							/>
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
							<Button
								variant="light"
								onPress={() => {
									onClose();
									form.reset();
									setCurrentStep(1);
								}}
							>
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
