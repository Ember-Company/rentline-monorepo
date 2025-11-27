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
	Spinner,
	Textarea,
} from "@heroui/react";
import { useForm } from "@tanstack/react-form";
import {
	AlertCircle,
	Building2,
	Calendar,
	DollarSign,
	FileText,
	Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import z from "zod";
import { formatBRL } from "@/lib/constants/brazil";
import { useProperties, useUnits } from "@/lib/hooks";
import { useContacts } from "@/lib/hooks/use-contacts";
import { useCreateLease } from "@/lib/hooks/use-leases";
import type { LeaseStatus, LeaseType } from "./types";

interface CreateLeaseModalProps {
	isOpen: boolean;
	onClose: () => void;
	propertyId?: string; // Pre-select a property if provided
	unitId?: string; // Pre-select a unit if provided
}

const leaseSchema = z.object({
	propertyId: z.string().min(1, "Selecione um imóvel"),
	unitId: z.string().optional(),
	tenantContactId: z.string().min(1, "Selecione um inquilino"),
	leaseType: z.enum(["fixed", "month_to_month", "annual"]),
	startDate: z.string().min(1, "Data de início é obrigatória"),
	endDate: z.string().optional(),
	moveInDate: z.string().optional(),
	rentAmount: z.string().min(1, "Valor do aluguel é obrigatório"),
	depositAmount: z.string().optional(),
	paymentDueDay: z.string().optional(),
	lateFeeType: z.string().optional(),
	lateFeeAmount: z.string().optional(),
	lateFeePercentage: z.string().optional(),
	gracePeriodDays: z.string().optional(),
	autoRenew: z.boolean().optional(),
	renewalNoticeDays: z.string().optional(),
	status: z.enum(["draft", "pending", "active"]),
	terms: z.string().optional(),
	notes: z.string().optional(),
});

export function CreateLeaseModal({
	isOpen,
	onClose,
	propertyId: initialPropertyId,
	unitId: initialUnitId,
}: CreateLeaseModalProps) {
	const createLease = useCreateLease();
	const [selectedPropertyId, setSelectedPropertyId] = useState<string>(
		initialPropertyId || "",
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

	const properties = propertiesData?.properties || [];
	const units = unitsData?.units || [];
	const tenants = contactsData?.contacts || [];

	const form = useForm({
		defaultValues: {
			propertyId: initialPropertyId || "",
			unitId: initialUnitId || "",
			tenantContactId: "",
			leaseType: "fixed" as LeaseType,
			startDate: new Date().toISOString().split("T")[0],
			endDate: "",
			moveInDate: "",
			rentAmount: "",
			depositAmount: "",
			paymentDueDay: "1",
			lateFeeType: "",
			lateFeeAmount: "",
			lateFeePercentage: "",
			gracePeriodDays: "5",
			autoRenew: false,
			renewalNoticeDays: "30",
			status: "draft" as LeaseStatus,
			terms: "",
			notes: "",
		},
		onSubmit: async ({ value }) => {
			try {
				await createLease.mutateAsync({
					propertyId: value.unitId ? undefined : value.propertyId,
					unitId: value.unitId || undefined,
					tenantContactId: value.tenantContactId,
					leaseType: value.leaseType,
					startDate: value.startDate,
					endDate: value.endDate || undefined,
					moveInDate: value.moveInDate || undefined,
					rentAmount: Number(value.rentAmount),
					depositAmount: value.depositAmount
						? Number(value.depositAmount)
						: undefined,
					currencyId: "BRL",
					paymentDueDay: Number(value.paymentDueDay),
					lateFeeType: value.lateFeeType as "percentage" | "fixed" | undefined,
					lateFeeAmount: value.lateFeeAmount
						? Number(value.lateFeeAmount)
						: undefined,
					lateFeePercentage: value.lateFeePercentage
						? Number(value.lateFeePercentage)
						: undefined,
					gracePeriodDays: value.gracePeriodDays
						? Number(value.gracePeriodDays)
						: undefined,
					autoRenew: value.autoRenew,
					renewalNoticeDays: value.renewalNoticeDays
						? Number(value.renewalNoticeDays)
						: undefined,
					status: value.status,
					terms: value.terms || undefined,
					notes: value.notes || undefined,
				});

				toast.success("Contrato criado com sucesso!");
				form.reset();
				onClose();
			} catch (error) {
				toast.error(
					error instanceof Error ? error.message : "Erro ao criar contrato",
				);
			}
		},
		validators: {
			onSubmit: leaseSchema,
		},
	});

	// Update selected property when form changes
	const handlePropertyChange = (propertyId: string) => {
		setSelectedPropertyId(propertyId);
		form.setFieldValue("propertyId", propertyId);
		form.setFieldValue("unitId", ""); // Reset unit when property changes
		setSelectedUnitId("");
	};

	const selectedProperty = useMemo(
		() => properties.find((p) => p.id === selectedPropertyId),
		[properties, selectedPropertyId],
	);
	const selectedTenant = useMemo(
		() => tenants.find((t) => t.id === form.state.values.tenantContactId),
		[tenants, form.state.values.tenantContactId],
	);

	const isLoading = loadingProperties || loadingUnits || loadingContacts;

	const handleClose = () => {
		form.reset();
		setSelectedPropertyId(initialPropertyId || "");
		setSelectedUnitId(initialUnitId || "");
		onClose();
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleClose}
			size="3xl"
			scrollBehavior="inside"
			classNames={{
				body: "py-6",
			}}
		>
			<ModalContent>
				<ModalHeader className="flex items-center gap-2">
					<FileText className="h-5 w-5 text-primary" />
					Novo Contrato de Locação
				</ModalHeader>
				<ModalBody>
					{isLoading ? (
						<div className="flex items-center justify-center py-12">
							<Spinner size="lg" />
						</div>
					) : (
						<form
							onSubmit={(e) => {
								e.preventDefault();
								form.handleSubmit();
							}}
							className="space-y-6"
						>
							{/* Property Selection */}
							<div className="space-y-4">
								<div className="flex items-center gap-2">
									<Building2 className="h-5 w-5 text-primary" />
									<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
										Imóvel e Unidade
									</h3>
								</div>

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
												handlePropertyChange(value);
											}}
											isRequired
											isDisabled={!!initialPropertyId}
											labelPlacement="outside"
										>
											{properties.map((property) => (
												<SelectItem key={property.id} textValue={property.name}>
													<div className="flex flex-col">
														<span className="font-medium">{property.name}</span>
														{property.address && (
															<span className="text-xs text-gray-500">
																{property.address}
															</span>
														)}
													</div>
												</SelectItem>
											))}
										</Select>
									)}
								</form.Field>

								{selectedProperty &&
									(selectedProperty.type === "apartment_building" ||
										selectedProperty.type === "office") && (
										<form.Field name="unitId">
											{(field) => (
												<Select
													label="Unidade (opcional)"
													placeholder="Deixe vazio para o imóvel todo"
													selectedKeys={
														field.state.value ? [field.state.value] : []
													}
													onSelectionChange={(keys) => {
														const value = Array.from(keys)[0] as string;
														field.handleChange(value);
													}}
													labelPlacement="outside"
												>
													{units.map((unit) => (
														<SelectItem
															key={unit.id}
															textValue={
																unit.name || `Unidade ${unit.unitNumber}`
															}
														>
															<div className="flex items-center justify-between">
																<span>
																	{unit.name || `Unidade ${unit.unitNumber}`}
																</span>
																{unit.rentAmount && (
																	<span className="text-sm text-gray-500">
																		{formatBRL(Number(unit.rentAmount))}/mês
																	</span>
																)}
															</div>
														</SelectItem>
													))}
												</Select>
											)}
										</form.Field>
									)}
							</div>

							{/* Tenant Selection */}
							<div className="space-y-4">
								<div className="flex items-center gap-2">
									<Users className="h-5 w-5 text-primary" />
									<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
										Inquilino
									</h3>
								</div>

								{tenants.length === 0 ? (
									<div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
										<div className="flex items-center gap-3">
											<AlertCircle className="h-5 w-5 text-amber-600" />
											<div>
												<p className="font-medium text-amber-800 dark:text-amber-200">
													Nenhum inquilino cadastrado
												</p>
												<p className="text-sm text-amber-700 dark:text-amber-300">
													Cadastre um inquilino primeiro em Contatos.
												</p>
											</div>
										</div>
									</div>
								) : (
									<form.Field name="tenantContactId">
										{(field) => (
											<Select
												label="Inquilino"
												placeholder="Selecione um inquilino"
												selectedKeys={
													field.state.value ? [field.state.value] : []
												}
												onSelectionChange={(keys) => {
													const value = Array.from(keys)[0] as string;
													field.handleChange(value);
												}}
												isRequired
												labelPlacement="outside"
											>
												{tenants.map((tenant) => (
													<SelectItem
														key={tenant.id}
														textValue={`${tenant.firstName || ""} ${tenant.lastName || ""}`}
													>
														<div className="flex items-center gap-3">
															<div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
																{tenant.firstName?.[0] || "?"}
															</div>
															<div>
																<p className="font-medium">
																	{tenant.firstName} {tenant.lastName}
																</p>
																<p className="text-xs text-gray-500">
																	{tenant.email}
																</p>
															</div>
														</div>
													</SelectItem>
												))}
											</Select>
										)}
									</form.Field>
								)}

								{selectedTenant && (
									<div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
										<div className="flex items-center gap-4">
											<div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-medium text-primary">
												{selectedTenant.firstName?.[0] || "?"}
											</div>
											<div>
												<p className="font-semibold text-gray-900 dark:text-white">
													{selectedTenant.firstName} {selectedTenant.lastName}
												</p>
												<p className="text-sm text-gray-500">
													{selectedTenant.email}
												</p>
												{selectedTenant.phone && (
													<p className="text-sm text-gray-500">
														{selectedTenant.phone}
													</p>
												)}
											</div>
										</div>
									</div>
								)}
							</div>

							{/* Lease Terms */}
							<div className="space-y-4">
								<div className="flex items-center gap-2">
									<Calendar className="h-5 w-5 text-primary" />
									<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
										Período do Contrato
									</h3>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<form.Field name="leaseType">
										{(field) => (
											<Select
												label="Tipo de Contrato"
												selectedKeys={[field.state.value]}
												onSelectionChange={(keys) => {
													field.handleChange(Array.from(keys)[0] as LeaseType);
												}}
												labelPlacement="outside"
											>
												<SelectItem key="fixed">Prazo Determinado</SelectItem>
												<SelectItem key="month_to_month">Mensal</SelectItem>
												<SelectItem key="annual">Anual</SelectItem>
											</Select>
										)}
									</form.Field>

									<form.Field name="status">
										{(field) => (
											<Select
												label="Status"
												selectedKeys={[field.state.value]}
												onSelectionChange={(keys) => {
													field.handleChange(
														Array.from(keys)[0] as LeaseStatus,
													);
												}}
												labelPlacement="outside"
											>
												<SelectItem key="draft">Rascunho</SelectItem>
												<SelectItem key="pending">Pendente</SelectItem>
												<SelectItem key="active">Ativo</SelectItem>
											</Select>
										)}
									</form.Field>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<form.Field name="startDate">
										{(field) => (
											<Input
												type="date"
												label="Data de Início"
												value={field.state.value}
												onValueChange={field.handleChange}
												isRequired
												labelPlacement="outside"
											/>
										)}
									</form.Field>

									<form.Field name="endDate">
										{(field) => (
											<Input
												type="date"
												label="Data de Término"
												value={field.state.value}
												onValueChange={field.handleChange}
												labelPlacement="outside"
											/>
										)}
									</form.Field>
								</div>

								<form.Field name="moveInDate">
									{(field) => (
										<Input
											type="date"
											label="Data de Mudança (opcional)"
											value={field.state.value}
											onValueChange={field.handleChange}
											labelPlacement="outside"
										/>
									)}
								</form.Field>
							</div>

							{/* Financial */}
							<div className="space-y-4">
								<div className="flex items-center gap-2">
									<DollarSign className="h-5 w-5 text-primary" />
									<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
										Valores
									</h3>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<form.Field name="rentAmount">
										{(field) => (
											<Input
												type="number"
												label="Valor do Aluguel Mensal"
												placeholder="0,00"
												value={field.state.value}
												onValueChange={field.handleChange}
												startContent={
													<span className="text-sm text-gray-400">R$</span>
												}
												isRequired
												isInvalid={field.state.meta.errors.length > 0}
												errorMessage={
													field.state.meta.errors[0]?.message || undefined
												}
												labelPlacement="outside"
											/>
										)}
									</form.Field>

									<form.Field name="depositAmount">
										{(field) => (
											<Input
												type="number"
												label="Depósito/Caução"
												placeholder="0,00"
												value={field.state.value}
												onValueChange={field.handleChange}
												startContent={
													<span className="text-sm text-gray-400">R$</span>
												}
												labelPlacement="outside"
											/>
										)}
									</form.Field>
								</div>

								<div className="grid grid-cols-3 gap-4">
									<form.Field name="paymentDueDay">
										{(field) => (
											<Select
												label="Dia do Vencimento"
												selectedKeys={[field.state.value]}
												onSelectionChange={(keys) => {
													field.handleChange(Array.from(keys)[0] as string);
												}}
												labelPlacement="outside"
											>
												{Array.from({ length: 28 }, (_, i) => (
													<SelectItem key={String(i + 1)}>{i + 1}</SelectItem>
												))}
											</Select>
										)}
									</form.Field>

									<form.Field name="gracePeriodDays">
										{(field) => (
											<Input
												type="number"
												label="Dias de Carência"
												placeholder="5"
												value={field.state.value}
												onValueChange={field.handleChange}
												labelPlacement="outside"
											/>
										)}
									</form.Field>

									<form.Field name="lateFeeType">
										{(field) => (
											<Select
												label="Tipo de Multa"
												selectedKeys={
													field.state.value ? [field.state.value] : []
												}
												onSelectionChange={(keys) => {
													field.handleChange(Array.from(keys)[0] as string);
												}}
												labelPlacement="outside"
											>
												<SelectItem key="">Nenhuma</SelectItem>
												<SelectItem key="percentage">Porcentagem</SelectItem>
												<SelectItem key="fixed">Valor Fixo</SelectItem>
											</Select>
										)}
									</form.Field>
								</div>

								{form.state.values.lateFeeType === "percentage" && (
									<form.Field name="lateFeePercentage">
										{(field) => (
											<Input
												type="number"
												label="Porcentagem de Multa (%)"
												placeholder="2"
												value={field.state.value}
												onValueChange={field.handleChange}
												endContent={
													<span className="text-sm text-gray-400">%</span>
												}
												labelPlacement="outside"
											/>
										)}
									</form.Field>
								)}

								{form.state.values.lateFeeType === "fixed" && (
									<form.Field name="lateFeeAmount">
										{(field) => (
											<Input
												type="number"
												label="Valor da Multa"
												placeholder="0,00"
												value={field.state.value}
												onValueChange={field.handleChange}
												startContent={
													<span className="text-sm text-gray-400">R$</span>
												}
												labelPlacement="outside"
											/>
										)}
									</form.Field>
								)}
							</div>

							{/* Additional Info */}
							<div className="space-y-4">
								<form.Field name="terms">
									{(field) => (
										<Textarea
											label="Termos e Condições"
											placeholder="Condições especiais do contrato..."
											value={field.state.value}
											onValueChange={field.handleChange}
											minRows={3}
											labelPlacement="outside"
										/>
									)}
								</form.Field>

								<form.Field name="notes">
									{(field) => (
										<Textarea
											label="Observações"
											placeholder="Notas internas sobre o contrato..."
											value={field.state.value}
											onValueChange={field.handleChange}
											minRows={2}
											labelPlacement="outside"
										/>
									)}
								</form.Field>
							</div>
						</form>
					)}
				</ModalBody>
				<ModalFooter>
					<Button variant="light" onPress={handleClose}>
						Cancelar
					</Button>
					<form.Subscribe>
						{(state) => (
							<Button
								color="primary"
								onPress={() => form.handleSubmit()}
								isDisabled={!state.canSubmit}
								isLoading={createLease.isPending}
							>
								Criar Contrato
							</Button>
						)}
					</form.Subscribe>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}
