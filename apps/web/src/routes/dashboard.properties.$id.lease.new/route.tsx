import {
	Avatar,
	Button,
	Card,
	CardBody,
	CardHeader,
	Divider,
	Input,
	Select,
	SelectItem,
	Spinner,
	Textarea,
} from "@heroui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	AlertCircle,
	ArrowLeft,
	Calendar,
	DollarSign,
	FileText,
	Save,
	Users,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { formatBRL } from "@/lib/constants/brazil";
import { useProperty, useUnits } from "@/lib/hooks";
import { trpc } from "@/utils/trpc";
import type { Route } from "./+types/route";

export function meta(_args: Route.MetaArgs) {
	return [
		{ title: "Novo Contrato - Rentline" },
		{ name: "description", content: "Criar um novo contrato de locação" },
	];
}

export default function NewLeasePage({ params }: Route.ComponentProps) {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const propertyId = params.id;

	const { data: propertyData, isLoading: loadingProperty } =
		useProperty(propertyId);
	const { data: unitsData, isLoading: loadingUnits } = useUnits({ propertyId });
	const { data: contactsData, isLoading: loadingContacts } = useQuery({
		...trpc.contacts.list.queryOptions({ type: "tenant" }),
	});

	const createLeaseMutation = useMutation({
		...trpc.leases.create.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["leases"] });
			toast.success("Contrato criado com sucesso!");
			navigate(`/dashboard/properties/${propertyId}`);
		},
		onError: (error) => {
			toast.error(error.message || "Erro ao criar contrato");
		},
	});

	const [formData, setFormData] = useState({
		tenantContactId: "",
		unitId: "",
		leaseType: "fixed",
		startDate: new Date().toISOString().split("T")[0],
		endDate: "",
		moveInDate: "",
		rentAmount: "",
		depositAmount: "",
		currencyId: "BRL",
		paymentDueDay: "1",
		lateFeeType: "",
		lateFeeAmount: "",
		lateFeePercentage: "",
		gracePeriodDays: "5",
		autoRenew: false,
		renewalNoticeDays: "30",
		status: "draft",
		terms: "",
		notes: "",
	});

	const handleChange = (field: string, value: string | boolean) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleSubmit = () => {
		if (!formData.tenantContactId) {
			toast.error("Selecione um inquilino");
			return;
		}
		if (!formData.startDate) {
			toast.error("Data de início é obrigatória");
			return;
		}
		if (!formData.rentAmount) {
			toast.error("Valor do aluguel é obrigatório");
			return;
		}

		createLeaseMutation.mutate({
			propertyId: formData.unitId ? undefined : propertyId,
			unitId: formData.unitId || undefined,
			tenantContactId: formData.tenantContactId,
			leaseType: formData.leaseType as "fixed" | "month_to_month" | "annual",
			startDate: formData.startDate,
			endDate: formData.endDate || undefined,
			moveInDate: formData.moveInDate || undefined,
			rentAmount: Number(formData.rentAmount),
			depositAmount: formData.depositAmount
				? Number(formData.depositAmount)
				: undefined,
			currencyId: formData.currencyId,
			paymentDueDay: Number(formData.paymentDueDay),
			lateFeeType: formData.lateFeeType as "percentage" | "fixed" | undefined,
			lateFeeAmount: formData.lateFeeAmount
				? Number(formData.lateFeeAmount)
				: undefined,
			lateFeePercentage: formData.lateFeePercentage
				? Number(formData.lateFeePercentage)
				: undefined,
			gracePeriodDays: formData.gracePeriodDays
				? Number(formData.gracePeriodDays)
				: undefined,
			autoRenew: formData.autoRenew,
			renewalNoticeDays: formData.renewalNoticeDays
				? Number(formData.renewalNoticeDays)
				: undefined,
			status: formData.status as "draft" | "pending" | "active",
			terms: formData.terms || undefined,
			notes: formData.notes || undefined,
		});
	};

	const property = propertyData?.property;
	const units = unitsData?.units || [];
	const tenants = contactsData?.contacts || [];
	const isLoading = loadingProperty || loadingUnits || loadingContacts;

	if (isLoading) {
		return (
			<div className="flex h-96 items-center justify-center">
				<Spinner size="lg" />
			</div>
		);
	}

	if (!property) {
		return (
			<div className="flex h-96 flex-col items-center justify-center gap-4">
				<p className="text-gray-500">Imóvel não encontrado</p>
				<Button onPress={() => navigate("/dashboard/properties")}>
					Voltar
				</Button>
			</div>
		);
	}

	const selectedTenant = tenants.find((t) => t.id === formData.tenantContactId);

	return (
		<div className="mx-auto max-w-4xl space-y-6 pb-12">
			{/* Header */}
			<div className="flex items-center gap-4">
				<Button
					variant="light"
					isIconOnly
					onPress={() => navigate(`/dashboard/properties/${propertyId}`)}
				>
					<ArrowLeft className="h-5 w-5" />
				</Button>
				<div>
					<h1 className="font-bold text-2xl text-gray-900">Novo Contrato</h1>
					<p className="text-gray-500 text-sm">{property.name}</p>
				</div>
			</div>

			{/* Tenant Selection */}
			<Card className="border border-gray-200 shadow-sm">
				<CardHeader className="border-gray-100 border-b bg-gray-50/50 px-6 py-4">
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100">
							<Users className="h-5 w-5 text-primary" />
						</div>
						<div>
							<h2 className="font-semibold text-gray-900 text-lg">Inquilino</h2>
							<p className="text-gray-500 text-sm">
								Selecione o inquilino para este contrato
							</p>
						</div>
					</div>
				</CardHeader>
				<CardBody className="p-6">
					{tenants.length === 0 ? (
						<div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
							<div className="flex items-center gap-3">
								<AlertCircle className="h-5 w-5 text-yellow-600" />
								<div>
									<p className="font-medium text-yellow-800">
										Nenhum inquilino cadastrado
									</p>
									<p className="text-sm text-yellow-700">
										Cadastre um inquilino primeiro em Contatos.
									</p>
								</div>
							</div>
						</div>
					) : (
						<Select
							label="Inquilino"
							placeholder="Selecione um inquilino"
							selectedKeys={
								formData.tenantContactId ? [formData.tenantContactId] : []
							}
							onSelectionChange={(keys) =>
								handleChange("tenantContactId", Array.from(keys)[0] as string)
							}
							isRequired
						>
							{tenants.map((tenant) => (
								<SelectItem
									key={tenant.id}
									textValue={`${tenant.firstName} ${tenant.lastName}`}
								>
									<div className="flex items-center gap-3">
										<Avatar size="sm" name={tenant.firstName || "?"} />
										<div>
											<p className="font-medium">
												{tenant.firstName} {tenant.lastName}
											</p>
											<p className="text-gray-500 text-xs">{tenant.email}</p>
										</div>
									</div>
								</SelectItem>
							))}
						</Select>
					)}

					{selectedTenant && (
						<div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
							<div className="flex items-center gap-4">
								<Avatar size="lg" name={selectedTenant.firstName || "?"} />
								<div>
									<p className="font-semibold text-gray-900">
										{selectedTenant.firstName} {selectedTenant.lastName}
									</p>
									<p className="text-gray-500 text-sm">
										{selectedTenant.email}
									</p>
									{selectedTenant.phone && (
										<p className="text-gray-500 text-sm">
											{selectedTenant.phone}
										</p>
									)}
								</div>
							</div>
						</div>
					)}
				</CardBody>
			</Card>

			{/* Unit Selection (for multi-unit properties) */}
			{units.length > 0 && (
				<Card className="border border-gray-200 shadow-sm">
					<CardHeader className="border-gray-100 border-b bg-gray-50/50 px-6 py-4">
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
								<FileText className="h-5 w-5 text-blue-600" />
							</div>
							<div>
								<h2 className="font-semibold text-gray-900 text-lg">Unidade</h2>
								<p className="text-gray-500 text-sm">
									Selecione a unidade para este contrato
								</p>
							</div>
						</div>
					</CardHeader>
					<CardBody className="p-6">
						<Select
							label="Unidade"
							placeholder="Selecione uma unidade (ou deixe vazio para o imóvel todo)"
							selectedKeys={formData.unitId ? [formData.unitId] : []}
							onSelectionChange={(keys) =>
								handleChange("unitId", Array.from(keys)[0] as string)
							}
						>
							{units.map((unit) => (
								<SelectItem
									key={unit.id}
									textValue={unit.name || `Unidade ${unit.unitNumber}`}
								>
									<div className="flex items-center justify-between">
										<span>{unit.name || `Unidade ${unit.unitNumber}`}</span>
										{unit.rentAmount && (
											<span className="text-gray-500 text-sm">
												{formatBRL(Number(unit.rentAmount))}/mês
											</span>
										)}
									</div>
								</SelectItem>
							))}
						</Select>
					</CardBody>
				</Card>
			)}

			{/* Lease Terms */}
			<Card className="border border-gray-200 shadow-sm">
				<CardHeader className="border-gray-100 border-b bg-gray-50/50 px-6 py-4">
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
							<Calendar className="h-5 w-5 text-green-600" />
						</div>
						<div>
							<h2 className="font-semibold text-gray-900 text-lg">
								Período do Contrato
							</h2>
							<p className="text-gray-500 text-sm">
								Defina as datas e tipo do contrato
							</p>
						</div>
					</div>
				</CardHeader>
				<CardBody className="space-y-4 p-6">
					<Select
						label="Tipo de Contrato"
						selectedKeys={[formData.leaseType]}
						onSelectionChange={(keys) =>
							handleChange("leaseType", Array.from(keys)[0] as string)
						}
					>
						<SelectItem key="fixed">Prazo Determinado</SelectItem>
						<SelectItem key="month_to_month">Mensal</SelectItem>
						<SelectItem key="annual">Anual</SelectItem>
					</Select>

					<div className="grid grid-cols-2 gap-4">
						<Input
							type="date"
							label="Data de Início"
							value={formData.startDate}
							onValueChange={(v) => handleChange("startDate", v)}
							isRequired
						/>
						<Input
							type="date"
							label="Data de Término"
							value={formData.endDate}
							onValueChange={(v) => handleChange("endDate", v)}
						/>
					</div>

					<Input
						type="date"
						label="Data de Mudança"
						value={formData.moveInDate}
						onValueChange={(v) => handleChange("moveInDate", v)}
					/>
				</CardBody>
			</Card>

			{/* Financial */}
			<Card className="border border-gray-200 shadow-sm">
				<CardHeader className="border-gray-100 border-b bg-gray-50/50 px-6 py-4">
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
							<DollarSign className="h-5 w-5 text-amber-600" />
						</div>
						<div>
							<h2 className="font-semibold text-gray-900 text-lg">Valores</h2>
							<p className="text-gray-500 text-sm">Aluguel, depósito e taxas</p>
						</div>
					</div>
				</CardHeader>
				<CardBody className="space-y-4 p-6">
					<div className="grid grid-cols-2 gap-4">
						<Input
							type="number"
							label="Valor do Aluguel Mensal"
							placeholder="0,00"
							value={formData.rentAmount}
							onValueChange={(v) => handleChange("rentAmount", v)}
							startContent={<span className="text-gray-400 text-sm">R$</span>}
							isRequired
						/>
						<Input
							type="number"
							label="Depósito/Caução"
							placeholder="0,00"
							value={formData.depositAmount}
							onValueChange={(v) => handleChange("depositAmount", v)}
							startContent={<span className="text-gray-400 text-sm">R$</span>}
						/>
					</div>

					<Divider className="my-4" />

					<div className="grid grid-cols-3 gap-4">
						<Select
							label="Dia do Vencimento"
							selectedKeys={[formData.paymentDueDay]}
							onSelectionChange={(keys) =>
								handleChange("paymentDueDay", Array.from(keys)[0] as string)
							}
						>
							{Array.from({ length: 28 }, (_, i) => (
								<SelectItem key={String(i + 1)}>{i + 1}</SelectItem>
							))}
						</Select>
						<Input
							type="number"
							label="Dias de Carência"
							placeholder="5"
							value={formData.gracePeriodDays}
							onValueChange={(v) => handleChange("gracePeriodDays", v)}
						/>
						<Select
							label="Tipo de Multa por Atraso"
							selectedKeys={formData.lateFeeType ? [formData.lateFeeType] : []}
							onSelectionChange={(keys) =>
								handleChange("lateFeeType", Array.from(keys)[0] as string)
							}
						>
							<SelectItem key="percentage">Porcentagem</SelectItem>
							<SelectItem key="fixed">Valor Fixo</SelectItem>
						</Select>
					</div>

					{formData.lateFeeType === "percentage" && (
						<Input
							type="number"
							label="Porcentagem de Multa (%)"
							placeholder="2"
							value={formData.lateFeePercentage}
							onValueChange={(v) => handleChange("lateFeePercentage", v)}
							endContent={<span className="text-gray-400 text-sm">%</span>}
						/>
					)}

					{formData.lateFeeType === "fixed" && (
						<Input
							type="number"
							label="Valor da Multa"
							placeholder="0,00"
							value={formData.lateFeeAmount}
							onValueChange={(v) => handleChange("lateFeeAmount", v)}
							startContent={<span className="text-gray-400 text-sm">R$</span>}
						/>
					)}
				</CardBody>
			</Card>

			{/* Additional Info */}
			<Card className="border border-gray-200 shadow-sm">
				<CardHeader className="border-gray-100 border-b bg-gray-50/50 px-6 py-4">
					<h2 className="font-semibold text-gray-900 text-lg">
						Informações Adicionais
					</h2>
				</CardHeader>
				<CardBody className="space-y-4 p-6">
					<Select
						label="Status do Contrato"
						selectedKeys={[formData.status]}
						onSelectionChange={(keys) =>
							handleChange("status", Array.from(keys)[0] as string)
						}
					>
						<SelectItem key="draft">Rascunho</SelectItem>
						<SelectItem key="pending">Pendente de Assinatura</SelectItem>
						<SelectItem key="active">Ativo</SelectItem>
					</Select>

					<Textarea
						label="Termos e Condições"
						placeholder="Condições especiais do contrato..."
						value={formData.terms}
						onValueChange={(v) => handleChange("terms", v)}
						minRows={3}
					/>

					<Textarea
						label="Observações"
						placeholder="Notas internas sobre o contrato..."
						value={formData.notes}
						onValueChange={(v) => handleChange("notes", v)}
						minRows={2}
					/>
				</CardBody>
			</Card>

			{/* Actions */}
			<div className="flex items-center justify-end gap-3 border-gray-200 border-t pt-6">
				<Button
					variant="light"
					onPress={() => navigate(`/dashboard/properties/${propertyId}`)}
				>
					Cancelar
				</Button>
				<Button
					color="primary"
					startContent={<Save className="h-4 w-4" />}
					onPress={handleSubmit}
					isLoading={createLeaseMutation.isPending}
				>
					Criar Contrato
				</Button>
			</div>
		</div>
	);
}
