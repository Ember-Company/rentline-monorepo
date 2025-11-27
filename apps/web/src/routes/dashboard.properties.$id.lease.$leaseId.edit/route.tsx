import {
	Avatar,
	Button,
	Card,
	CardBody,
	CardHeader,
	Chip,
	Divider,
	Input,
	Select,
	SelectItem,
	Spinner,
	Textarea,
} from "@heroui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	ArrowLeft,
	Calendar,
	DollarSign,
	FileText,
	Save,
	Trash2,
	Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { CrudModal } from "@/components/dashboard/crud-modal";
import { formatBRL } from "@/lib/constants/brazil";
import { trpc } from "@/utils/trpc";
import type { Route } from "./+types/route";

export function meta(_args: Route.MetaArgs) {
	return [
		{ title: "Editar Contrato - Rentline" },
		{ name: "description", content: "Editar contrato de locação" },
	];
}

export default function EditLeasePage({ params }: Route.ComponentProps) {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const propertyId = params.id;
	const leaseId = params.leaseId;

	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

	const { data: leaseData, isLoading: loadingLease } = useQuery({
		...trpc.leases.getById.queryOptions({ id: leaseId }),
		enabled: !!leaseId,
	});

	const { data: contactsData } = useQuery({
		...trpc.contacts.list.queryOptions({ type: "tenant" }),
	});

	const updateLeaseMutation = useMutation({
		...trpc.leases.update.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["leases"] });
			toast.success("Contrato atualizado com sucesso!");
			navigate(`/dashboard/properties/${propertyId}`);
		},
		onError: (error) => {
			toast.error(error.message || "Erro ao atualizar contrato");
		},
	});

	const deleteLeaseMutation = useMutation({
		...trpc.leases.delete.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["leases"] });
			toast.success("Contrato excluído com sucesso!");
			navigate(`/dashboard/properties/${propertyId}`);
		},
		onError: (error) => {
			toast.error(error.message || "Erro ao excluir contrato");
		},
	});

	const [formData, setFormData] = useState({
		tenantContactId: "",
		leaseType: "fixed",
		startDate: "",
		endDate: "",
		moveInDate: "",
		moveOutDate: "",
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

	// Initialize form with lease data
	useEffect(() => {
		if (leaseData?.lease) {
			const lease = leaseData.lease;
			setFormData({
				tenantContactId: lease.tenantContactId || "",
				leaseType: lease.leaseType || "fixed",
				startDate: lease.startDate
					? new Date(lease.startDate).toISOString().split("T")[0]
					: "",
				endDate: lease.endDate
					? new Date(lease.endDate).toISOString().split("T")[0]
					: "",
				moveInDate: lease.moveInDate
					? new Date(lease.moveInDate).toISOString().split("T")[0]
					: "",
				moveOutDate: lease.moveOutDate
					? new Date(lease.moveOutDate).toISOString().split("T")[0]
					: "",
				rentAmount: lease.rentAmount?.toString() || "",
				depositAmount: lease.depositAmount?.toString() || "",
				currencyId: lease.currencyId || "BRL",
				paymentDueDay: lease.paymentDueDay?.toString() || "1",
				lateFeeType: lease.lateFeeType || "",
				lateFeeAmount: lease.lateFeeAmount?.toString() || "",
				lateFeePercentage: lease.lateFeePercentage?.toString() || "",
				gracePeriodDays: lease.gracePeriodDays?.toString() || "5",
				autoRenew: lease.autoRenew || false,
				renewalNoticeDays: lease.renewalNoticeDays?.toString() || "30",
				status: lease.status || "draft",
				terms: lease.terms || "",
				notes: lease.notes || "",
			});
		}
	}, [leaseData]);

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

		updateLeaseMutation.mutate({
			id: leaseId,
			tenantContactId: formData.tenantContactId,
			leaseType: formData.leaseType as "fixed" | "month_to_month" | "annual",
			startDate: formData.startDate,
			endDate: formData.endDate || undefined,
			moveInDate: formData.moveInDate || undefined,
			moveOutDate: formData.moveOutDate || undefined,
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
			status: formData.status as
				| "draft"
				| "pending"
				| "active"
				| "expired"
				| "terminated",
			terms: formData.terms || undefined,
			notes: formData.notes || undefined,
		});
	};

	const handleDelete = () => {
		deleteLeaseMutation.mutate({ id: leaseId });
	};

	const lease = leaseData?.lease;
	const tenants = contactsData?.contacts || [];
	const selectedTenant = tenants.find((t) => t.id === formData.tenantContactId);

	if (loadingLease) {
		return (
			<div className="flex h-96 items-center justify-center">
				<Spinner size="lg" />
			</div>
		);
	}

	if (!lease) {
		return (
			<div className="flex h-96 flex-col items-center justify-center gap-4">
				<p className="text-gray-500">Contrato não encontrado</p>
				<Button onPress={() => navigate(`/dashboard/properties/${propertyId}`)}>
					Voltar
				</Button>
			</div>
		);
	}

	const getStatusColor = (status: string) => {
		switch (status) {
			case "active":
				return "success";
			case "pending":
				return "warning";
			case "expired":
				return "danger";
			case "terminated":
				return "default";
			default:
				return "default";
		}
	};

	return (
		<div className="mx-auto max-w-4xl space-y-6 pb-12">
			{/* Header */}
			<div className="flex items-center justify-between gap-4">
				<div className="flex items-center gap-4">
					<Button
						variant="light"
						isIconOnly
						onPress={() => navigate(`/dashboard/properties/${propertyId}`)}
					>
						<ArrowLeft className="h-5 w-5" />
					</Button>
					<div>
						<h1 className="font-bold text-2xl text-gray-900">
							Editar Contrato
						</h1>
						<div className="mt-1 flex items-center gap-2">
							<Chip
								size="sm"
								variant="flat"
								color={getStatusColor(formData.status)}
							>
								{formData.status === "active"
									? "Ativo"
									: formData.status === "pending"
										? "Pendente"
										: formData.status === "expired"
											? "Expirado"
											: formData.status === "terminated"
												? "Encerrado"
												: "Rascunho"}
							</Chip>
							{formData.rentAmount && (
								<span className="text-gray-500 text-sm">
									{formatBRL(Number(formData.rentAmount))}/mês
								</span>
							)}
						</div>
					</div>
				</div>
				<Button
					color="danger"
					variant="light"
					startContent={<Trash2 className="h-4 w-4" />}
					onPress={() => setIsDeleteModalOpen(true)}
				>
					Excluir
				</Button>
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
							<p className="text-gray-500 text-sm">Inquilino deste contrato</p>
						</div>
					</div>
				</CardHeader>
				<CardBody className="p-6">
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
							<p className="text-gray-500 text-sm">Datas e tipo do contrato</p>
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

					<div className="grid grid-cols-2 gap-4">
						<Input
							type="date"
							label="Data de Mudança (Entrada)"
							value={formData.moveInDate}
							onValueChange={(v) => handleChange("moveInDate", v)}
						/>
						<Input
							type="date"
							label="Data de Mudança (Saída)"
							value={formData.moveOutDate}
							onValueChange={(v) => handleChange("moveOutDate", v)}
						/>
					</div>
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
						<SelectItem key="expired">Expirado</SelectItem>
						<SelectItem key="terminated">Encerrado</SelectItem>
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
					isLoading={updateLeaseMutation.isPending}
				>
					Salvar Alterações
				</Button>
			</div>

			{/* Delete Modal */}
			<CrudModal
				isOpen={isDeleteModalOpen}
				onClose={() => setIsDeleteModalOpen(false)}
				title="Excluir Contrato"
				onDelete={handleDelete}
				deleteLabel="Excluir"
				size="md"
				isLoading={deleteLeaseMutation.isPending}
			>
				<p>
					Tem certeza que deseja excluir este contrato? Esta ação não pode ser
					desfeita e removerá todos os dados associados.
				</p>
			</CrudModal>
		</div>
	);
}
