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
import { useQuery } from "@tanstack/react-query";
import {
	AlertCircle,
	Calendar,
	ChevronDown,
	ChevronUp,
	Info,
	Lock,
	Plus,
	Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import z from "zod";
import { formatBRL } from "@/lib/constants/brazil";
import { useProperties, useUnits } from "@/lib/hooks";
import { useContacts } from "@/lib/hooks/use-contacts";
import { useCreateLease } from "@/lib/hooks/use-leases";
import { trpc } from "@/utils/trpc";

interface MultiStepLeaseFormProps {
	isOpen: boolean;
	onClose: () => void;
	propertyId?: string;
	unitId?: string;
}

type Step = 1 | 2 | 3;

interface AdditionalCharge {
	description: string;
	amount: number;
}

interface LateFeeTier {
	daysLate: number;
	amount: number;
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

export function MultiStepLeaseForm({
	isOpen,
	onClose,
	propertyId: initialPropertyId,
	unitId: initialUnitId,
}: MultiStepLeaseFormProps) {
	const navigate = useNavigate();
	const createLease = useCreateLease();
	const [currentStep, setCurrentStep] = useState<Step>(1);
	const [selectedPropertyId, setSelectedPropertyId] = useState<string>(
		initialPropertyId || "",
	);
	const [expandedSections, setExpandedSections] = useState<Set<Step>>(
		new Set([1]),
	);

	// Fetch data
	const { data: propertiesData, isLoading: loadingProperties } =
		useProperties();
	const { data: unitsData, isLoading: loadingUnits } = useUnits({
		propertyId: selectedPropertyId || undefined,
	});
	const { data: contactsData, isLoading: loadingContacts } = useContacts({
		type: "tenant",
	});
	const { data: currenciesData } = useQuery({
		...trpc.organizations.getCurrencies.queryOptions(),
	});

	const properties = propertiesData?.properties || [];
	const units = unitsData?.units || [];
	const tenants = contactsData?.contacts || [];
	const currencies = currenciesData?.currencies || [];
	const defaultCurrency = currencies.find((c) => c.symbol === "R$")?.id || "";

	const form = useForm({
		defaultValues: {
			// Step 1: Lease Details
			propertyId: initialPropertyId || "",
			unitId: initialUnitId || "",
			tenantContactId: "",
			startDate: new Date().toISOString().split("T")[0],
			endDate: "",
			rentAmount: "",
			paymentFrequency: "monthly",
			paymentDueDay: "1",
			additionalCharges: [] as AdditionalCharge[],
			// Step 2: Reminders
			leaseExpiryReminderEnabled: false,
			leaseExpiryReminderDays: 60,
			rentReminderEnabled: false,
			rentOverdueReminderEnabled: false,
			// Step 3: Additional Information
			proRataEnabled: false,
			proRataAmount: "",
			depositAmount: "",
			lateFees: [] as LateFeeTier[],
			furnishing: "",
			notes: "",
			requireRentersInsurance: false,
		},
		onSubmit: async ({ value }) => {
			try {
				// Validate required fields
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
					leaseType: "fixed",
					startDate: value.startDate,
					endDate: value.endDate || undefined,
					rentAmount: Number(value.rentAmount),
					currencyId: defaultCurrency,
					paymentDueDay: Number(value.paymentDueDay),
					paymentFrequency: value.paymentFrequency as any,
					depositAmount: value.depositAmount
						? Number(value.depositAmount)
						: undefined,
					proRataEnabled: value.proRataEnabled,
					proRataAmount: value.proRataAmount
						? Number(value.proRataAmount)
						: undefined,
					additionalCharges:
						value.additionalCharges.length > 0
							? value.additionalCharges.map((c) => ({
									description: c.description,
									amount: c.amount,
								}))
							: undefined,
					lateFees:
						value.lateFees.length > 0
							? value.lateFees.map((f) => ({
									daysLate: f.daysLate,
									amount: f.amount,
								}))
							: undefined,
					furnishing: value.furnishing || undefined,
					notes: value.notes || undefined,
					leaseExpiryReminderEnabled: value.leaseExpiryReminderEnabled,
					leaseExpiryReminderDays: value.leaseExpiryReminderEnabled
						? value.leaseExpiryReminderDays
						: undefined,
					rentReminderEnabled: value.rentReminderEnabled,
					rentOverdueReminderEnabled: value.rentOverdueReminderEnabled,
					requireRentersInsurance: value.requireRentersInsurance,
					status: "draft",
				});

				toast.success("Contrato criado com sucesso!");
				onClose();
				form.reset();
				setCurrentStep(1);
			} catch (error) {
				toast.error(
					error instanceof Error
						? error.message
						: "Erro ao criar contrato",
				);
			}
		},
	});

	const toggleSection = (step: Step) => {
		setExpandedSections((prev) => {
			const next = new Set(prev);
			if (next.has(step)) {
				next.delete(step);
			} else {
				next.add(step);
			}
			return next;
		});
	};

	const handleNext = () => {
		if (currentStep < 3) {
			setCurrentStep((prev) => (prev + 1) as Step);
			setExpandedSections((prev) => new Set([...prev, (currentStep + 1) as Step]));
		}
	};

	const handleBack = () => {
		if (currentStep > 1) {
			setCurrentStep((prev) => (prev - 1) as Step);
		}
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
		form.setFieldValue("lateFees", [
			...current,
			{ daysLate: 5, amount: 0 },
		]);
	};

	const removeLateFee = (index: number) => {
		const current = form.getFieldValue("lateFees") || [];
		form.setFieldValue("lateFees", current.filter((_, i) => i !== index));
	};

	if (loadingProperties || loadingContacts) {
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
		<Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside">
			<ModalContent className="max-h-[90vh]">
				<ModalHeader className="flex flex-col gap-1">
					<h2 className="text-2xl font-bold">Criar Contrato</h2>
					<p className="text-sm text-default-foreground">
						Preencha as informações do contrato em etapas
					</p>
				</ModalHeader>
				<ModalBody>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							form.handleSubmit();
						}}
						className="space-y-4"
					>
						{/* Step 1: Lease Details */}
						<Card className="border border-default-200">
							<CardBody className="p-0">
								<button
									type="button"
									onClick={() => toggleSection(1)}
									className="flex w-full items-center justify-between p-4 text-left"
								>
									<div className="flex items-center gap-3">
										<div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
											1
										</div>
										<span className="font-semibold">Detalhes do Contrato</span>
									</div>
									{expandedSections.has(1) ? (
										<ChevronUp className="h-5 w-5" />
									) : (
										<ChevronDown className="h-5 w-5" />
									)}
								</button>
								{expandedSections.has(1) && (
									<div className="space-y-4 border-t border-default-200 p-4">
										{/* Property/Unit Selection */}
										<div className="grid gap-4 sm:grid-cols-2">
											<form.Field name="propertyId">
												{(field) => (
													<Select
														label="Imóvel"
														placeholder="Selecione um imóvel"
														selectedKeys={
															field.state.value ? [field.state.value] : []
														}
														onSelectionChange={(keys) => {
															const value = Array.from(keys)[0] as string;
															field.handleChange(value);
															setSelectedPropertyId(value);
															form.setFieldValue("unitId", "");
														}}
														isDisabled={!!initialPropertyId}
													>
														{properties.map((property) => (
															<SelectItem key={property.id}>
																{property.name}
															</SelectItem>
														))}
													</Select>
												)}
											</form.Field>

											{selectedPropertyId && units.length > 0 && (
												<form.Field name="unitId">
													{(field) => (
														<Select
															label="Unidade (Opcional)"
															placeholder="Selecione uma unidade"
															selectedKeys={
																field.state.value ? [field.state.value] : []
															}
															onSelectionChange={(keys) =>
																field.handleChange(
																	Array.from(keys)[0] as string,
																)
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

										{/* Tenant Selection */}
										<form.Field name="tenantContactId">
											{(field) => (
												<Select
													label="Inquilino"
													placeholder="Selecione um inquilino"
													selectedKeys={
														field.state.value ? [field.state.value] : []
													}
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

										{/* Dates */}
										<div className="grid gap-4 sm:grid-cols-2">
											<form.Field name="startDate">
												{(field) => (
													<Input
														label="Data de Início"
														type="date"
														value={field.state.value}
														onValueChange={field.handleChange}
														onBlur={field.handleBlur}
														isRequired
														startContent={<Calendar className="h-4 w-4" />}
													/>
												)}
											</form.Field>

											<form.Field name="endDate">
												{(field) => (
													<Input
														label="Data de Término (Opcional)"
														type="date"
														value={field.state.value}
														onValueChange={field.handleChange}
														onBlur={field.handleBlur}
														startContent={<Calendar className="h-4 w-4" />}
													/>
												)}
											</form.Field>
										</div>

										{/* Rent Amount */}
										<form.Field name="rentAmount">
											{(field) => (
												<Input
													label="Valor do Aluguel"
													type="number"
													value={field.state.value}
													onValueChange={field.handleChange}
													onBlur={field.handleBlur}
													isRequired
													startContent={<span className="text-default-foreground">R$</span>}
													placeholder="0.00"
												/>
											)}
										</form.Field>

										{/* Payment Frequency */}
										<form.Field name="paymentFrequency">
											{(field) => (
												<Select
													label="Frequência de Pagamento"
													selectedKeys={[field.state.value]}
													onSelectionChange={(keys) =>
														field.handleChange(Array.from(keys)[0] as string)
													}
												>
													{paymentFrequencyOptions.map((option) => (
														<SelectItem key={option.value}>
															{option.label}
														</SelectItem>
													))}
												</Select>
											)}
										</form.Field>

										{/* Payment Day */}
										<form.Field name="paymentDueDay">
											{(field) => (
												<Select
													label="Dia de Vencimento"
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

										{/* Additional Charges */}
										<div>
											<div className="mb-2 flex items-center justify-between">
												<label className="text-sm font-medium">
													Cobranças Adicionais
												</label>
												<Button
													size="sm"
													variant="light"
													startContent={<Plus className="h-4 w-4" />}
													onPress={addAdditionalCharge}
												>
													Adicionar
												</Button>
											</div>
											{form.getFieldValue("additionalCharges")?.map(
												(charge: AdditionalCharge, index: number) => (
													<div
														key={index}
														className="mb-2 flex gap-2"
													>
														<Input
															placeholder="Descrição"
															value={charge.description}
															onValueChange={(value) => {
																const current =
																	form.getFieldValue("additionalCharges") || [];
																const updated = [...current];
																updated[index] = {
																	...updated[index],
																	description: value,
																};
																form.setFieldValue("additionalCharges", updated);
															}}
															className="flex-1"
														/>
														<Input
															type="number"
															placeholder="Valor"
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
									</div>
								)}
							</CardBody>
						</Card>

						{/* Step 2: Reminders */}
						<Card className="border border-default-200">
							<CardBody className="p-0">
								<button
									type="button"
									onClick={() => toggleSection(2)}
									className="flex w-full items-center justify-between p-4 text-left"
								>
									<div className="flex items-center gap-3">
										<div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
											2
										</div>
										<span className="font-semibold">Configurar Lembretes</span>
									</div>
									{expandedSections.has(2) ? (
										<ChevronUp className="h-5 w-5" />
									) : (
										<ChevronDown className="h-5 w-5" />
									)}
								</button>
								{expandedSections.has(2) && (
									<div className="space-y-4 border-t border-default-200 p-4">
										<div>
											<div className="mb-2 flex items-center gap-2">
												<h4 className="font-medium">
													Ativar lembretes para eventos importantes
												</h4>
												<span className="rounded bg-success px-2 py-0.5 text-xs text-white">
													RECOMENDADO
												</span>
											</div>

											{/* Lease Expiry Reminder */}
											<div className="mb-4 space-y-2">
												<RadioGroup
													value={
														form.getFieldValue("leaseExpiryReminderEnabled")
															? "yes"
															: "no"
													}
													onValueChange={(value) =>
														form.setFieldValue(
															"leaseExpiryReminderEnabled",
															value === "yes",
														)
													}
												>
													<Radio value="yes">Sim</Radio>
													<Radio value="no">Não</Radio>
												</RadioGroup>
												{form.getFieldValue("leaseExpiryReminderEnabled") && (
													<div className="ml-6 flex items-center gap-2">
														<Input
															type="number"
															value={form
																.getFieldValue("leaseExpiryReminderDays")
																.toString()}
															onValueChange={(value) =>
																form.setFieldValue(
																	"leaseExpiryReminderDays",
																	Number(value) || 60,
																)
															}
															className="w-20"
														/>
														<span className="text-sm">dias antes do vencimento</span>
													</div>
												)}
											</div>

											{/* Rent Reminder */}
											<div className="mb-4 space-y-2">
												<div className="flex items-center gap-2">
													<span className="font-medium">
														Enviar lembretes de aluguel aos inquilinos
													</span>
													<Lock className="h-4 w-4 text-warning" />
													<span className="text-xs text-warning">PRO</span>
												</div>
												<RadioGroup
													value={
														form.getFieldValue("rentReminderEnabled") ? "yes" : "no"
													}
													onValueChange={(value) =>
														form.setFieldValue(
															"rentReminderEnabled",
															value === "yes",
														)
													}
												>
													<Radio value="yes" isDisabled>
														Sim
													</Radio>
													<Radio value="no">Não</Radio>
												</RadioGroup>
											</div>

											{/* Overdue Reminder */}
											<div className="space-y-2">
												<div className="flex items-center gap-2">
													<span className="font-medium">
														Enviar lembretes de aluguel em atraso aos inquilinos
													</span>
													<Lock className="h-4 w-4 text-warning" />
													<span className="text-xs text-warning">PRO</span>
												</div>
												<RadioGroup
													value={
														form.getFieldValue("rentOverdueReminderEnabled")
															? "yes"
															: "no"
													}
													onValueChange={(value) =>
														form.setFieldValue(
															"rentOverdueReminderEnabled",
															value === "yes",
														)
													}
												>
													<Radio value="yes" isDisabled>
														Sim
													</Radio>
													<Radio value="no">Não</Radio>
												</RadioGroup>
											</div>
										</div>
									</div>
								)}
							</CardBody>
						</Card>

						{/* Step 3: Additional Information */}
						<Card className="border border-default-200">
							<CardBody className="p-0">
								<button
									type="button"
									onClick={() => toggleSection(3)}
									className="flex w-full items-center justify-between p-4 text-left"
								>
									<div className="flex items-center gap-3">
										<div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
											3
										</div>
										<span className="font-semibold">Informações Adicionais</span>
									</div>
									{expandedSections.has(3) ? (
										<ChevronUp className="h-5 w-5" />
									) : (
										<ChevronDown className="h-5 w-5" />
									)}
								</button>
								{expandedSections.has(3) && (
									<div className="space-y-4 border-t border-default-200 p-4">
										{/* Pro-rata Payment */}
										<div>
											<div className="mb-2 flex items-center gap-2">
												<label className="font-medium">
													Adicionar pagamento pro-rata:
												</label>
												<Info className="h-4 w-4 text-default-foreground/50" />
											</div>
											<RadioGroup
												value={form.getFieldValue("proRataEnabled") ? "yes" : "no"}
												onValueChange={(value) =>
													form.setFieldValue("proRataEnabled", value === "yes")
												}
											>
												<Radio value="yes">Sim</Radio>
												<Radio value="no">Não</Radio>
											</RadioGroup>
											{form.getFieldValue("proRataEnabled") && (
												<div className="mt-2">
													<Input
														label="Valor Pro-rata"
														type="number"
														value={form.getFieldValue("proRataAmount")}
														onValueChange={(value) =>
															form.setFieldValue("proRataAmount", value)
														}
														startContent={<span>R$</span>}
														placeholder="0.00"
													/>
												</div>
											)}
										</div>

										{/* Deposit */}
										<form.Field name="depositAmount">
											{(field) => (
												<Input
													label="Valor do Depósito"
													type="number"
													value={field.state.value}
													onValueChange={field.handleChange}
													onBlur={field.handleBlur}
													startContent={<span>R$</span>}
													placeholder="0.00"
												/>
											)}
										</form.Field>

										{/* Late Fees */}
										<div>
											<div className="mb-2 flex items-center justify-between">
												<div className="flex items-center gap-2">
													<label className="font-medium">Cobrar multa por atraso?</label>
													<Info className="h-4 w-4 text-default-foreground/50" />
												</div>
												<Button
													size="sm"
													variant="light"
													startContent={<Plus className="h-4 w-4" />}
													onPress={addLateFee}
												>
													Adicionar Multa
												</Button>
											</div>
											{form.getFieldValue("lateFees")?.map(
												(fee: LateFeeTier, index: number) => (
													<div key={index} className="mb-2 flex gap-2">
														<Input
															type="number"
															placeholder="Dias de atraso"
															value={fee.daysLate.toString()}
															onValueChange={(value) => {
																const current =
																	form.getFieldValue("lateFees") || [];
																const updated = [...current];
																updated[index] = {
																	...updated[index],
																	daysLate: Number(value) || 0,
																};
																form.setFieldValue("lateFees", updated);
															}}
															className="w-32"
														/>
														<span className="flex items-center">dia(s)</span>
														<Input
															type="number"
															placeholder="Valor"
															value={fee.amount.toString()}
															onValueChange={(value) => {
																const current =
																	form.getFieldValue("lateFees") || [];
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
										</div>

										{/* Furnishing */}
										<form.Field name="furnishing">
											{(field) => (
												<Select
													label="Mobília"
													placeholder="Selecione"
													selectedKeys={field.state.value ? [field.state.value] : []}
													onSelectionChange={(keys) =>
														field.handleChange(Array.from(keys)[0] as string)
													}
												>
													{furnishingOptions.map((option) => (
														<SelectItem key={option.value}>
															{option.label}
														</SelectItem>
													))}
												</Select>
											)}
										</form.Field>

										{/* Renter's Insurance */}
										<Card className="border border-primary/20 bg-primary/5">
											<CardBody className="p-4">
												<div className="mb-3">
													<h4 className="font-semibold">
														Seguro do Inquilino oferece tranquilidade para proprietários
													</h4>
													<p className="mt-1 text-sm text-default-foreground">
														O seguro do inquilino pode economizar tempo e dinheiro para você
														e seus inquilinos. A maioria dos proprietários exige isso.{" "}
														<a
															href="#"
															className="text-primary underline"
															onClick={(e) => e.preventDefault()}
														>
															Saiba por que todo proprietário precisa saber sobre seguro
															de inquilino
														</a>
													</p>
												</div>
												<div className="space-y-2">
													<label className="font-medium">
														Exigir que os inquilinos forneçam seguro de inquilino?
													</label>
													<RadioGroup
														value={
															form.getFieldValue("requireRentersInsurance")
																? "yes"
																: "no"
														}
														onValueChange={(value) =>
															form.setFieldValue(
																"requireRentersInsurance",
																value === "yes",
															)
														}
													>
														<Radio value="yes">Sim</Radio>
														<Radio value="no">Não</Radio>
													</RadioGroup>
													{form.getFieldValue("requireRentersInsurance") && (
														<p className="text-sm text-default-foreground">
															Um email será enviado aos seus inquilinos solicitando
															comprovante de seguro.
														</p>
													)}
												</div>
											</CardBody>
										</Card>

										{/* Notes */}
										<form.Field name="notes">
											{(field) => (
												<Textarea
													label="Observações"
													placeholder="Adicione observações adicionais sobre o contrato..."
													value={field.state.value}
													onValueChange={field.handleChange}
													onBlur={field.handleBlur}
													minRows={3}
												/>
											)}
										</form.Field>
									</div>
								)}
							</CardBody>
						</Card>
					</form>
				</ModalBody>
				<ModalFooter className="flex justify-between">
					<Button variant="light" onPress={onClose}>
						Cancelar
					</Button>
					<div className="flex gap-2">
						{currentStep > 1 && (
							<Button variant="light" onPress={handleBack}>
								Voltar
							</Button>
						)}
						{currentStep < 3 ? (
							<Button color="primary" onPress={handleNext}>
								Próxima Etapa
							</Button>
						) : (
							<Button
								color="primary"
								onPress={() => form.handleSubmit()}
								isLoading={createLease.isPending}
							>
								Criar Contrato
							</Button>
						)}
					</div>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}

