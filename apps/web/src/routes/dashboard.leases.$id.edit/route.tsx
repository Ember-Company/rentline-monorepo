import {
	Button,
	Card,
	CardBody,
	CardHeader,
	Divider,
	Input,
	Select,
	SelectItem,
	Spinner,
	Switch,
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
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
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
	const leaseId = params.id;

	// Fetch lease data
	const { data: leaseData, isLoading: loadingLease } = useQuery({
		...trpc.leases.getById.queryOptions({ id: leaseId }),
	});

	// Update mutation
	const updateMutation = useMutation({
		...trpc.leases.update.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["leases"] });
			toast.success("Contrato atualizado com sucesso!");
			navigate(`/dashboard/leases/${leaseId}`);
		},
		onError: (error) => {
			toast.error(error.message || "Erro ao atualizar contrato");
		},
	});

	// Form state
	const [formData, setFormData] = useState({
		leaseType: "fixed",
		startDate: "",
		endDate: "",
		moveInDate: "",
		moveOutDate: "",
		rentAmount: "",
		depositAmount: "",
		paymentDueDay: "1",
		lateFeeType: "",
		lateFeeAmount: "",
		lateFeePercentage: "",
		gracePeriodDays: "5",
		autoRenew: false,
		renewalNoticeDays: "30",
		status: "active",
		terms: "",
		notes: "",
	});

	// Initialize form with lease data
	useEffect(() => {
		if (leaseData?.lease) {
			const lease = leaseData.lease;
			setFormData({
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
				rentAmount: lease.rentAmount ? String(lease.rentAmount) : "",
				depositAmount: lease.depositAmount ? String(lease.depositAmount) : "",
				paymentDueDay: lease.paymentDueDay ? String(lease.paymentDueDay) : "1",
				lateFeeType: lease.lateFeeType || "",
				lateFeeAmount: lease.lateFeeAmount ? String(lease.lateFeeAmount) : "",
				lateFeePercentage: lease.lateFeePercentage
					? String(lease.lateFeePercentage)
					: "",
				gracePeriodDays: lease.gracePeriodDays
					? String(lease.gracePeriodDays)
					: "5",
				autoRenew: lease.autoRenew || false,
				renewalNoticeDays: lease.renewalNoticeDays
					? String(lease.renewalNoticeDays)
					: "30",
				status: lease.status || "active",
				terms: lease.terms || "",
				notes: lease.notes || "",
			});
		}
	}, [leaseData]);

	const handleChange = (field: string, value: string | boolean) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleSubmit = () => {
		if (!formData.startDate) {
			toast.error("Data de início é obrigatória");
			return;
		}
		if (!formData.rentAmount) {
			toast.error("Valor do aluguel é obrigatório");
			return;
		}

		updateMutation.mutate({
			id: leaseId,
			leaseType: formData.leaseType as "fixed" | "month_to_month" | "annual",
			startDate: formData.startDate,
			endDate: formData.endDate || undefined,
			moveInDate: formData.moveInDate || undefined,
			moveOutDate: formData.moveOutDate || undefined,
			rentAmount: Number(formData.rentAmount),
			depositAmount: formData.depositAmount
				? Number(formData.depositAmount)
				: undefined,
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

	if (loadingLease) {
		return (
			<div className="flex h-96 items-center justify-center">
				<Spinner size="lg" />
			</div>
		);
	}

	if (!leaseData?.lease) {
		return (
			<div className="flex h-96 flex-col items-center justify-center gap-4">
				<p className="text-gray-500">Contrato não encontrado</p>
				<Button onPress={() => navigate("/dashboard/leases")}>Voltar</Button>
			</div>
		);
	}

	const lease = leaseData.lease;
	const propertyName =
		lease.unit?.property?.name || lease.property?.name || "Imóvel";

	return (
		<div className="mx-auto max-w-4xl space-y-6 pb-12">
			{/* Header */}
			<div className="flex items-center gap-4">
				<Button
					variant="light"
					isIconOnly
					onPress={() => navigate(`/dashboard/leases/${leaseId}`)}
				>
					<ArrowLeft className="h-5 w-5" />
				</Button>
				<div>
					<h1 className="font-bold text-2xl text-gray-900">Editar Contrato</h1>
					<p className="text-gray-500 text-sm">{propertyName}</p>
				</div>
			</div>

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
							label="Data de Desocupação (Saída)"
							value={formData.moveOutDate}
							onValueChange={(v) => handleChange("moveOutDate", v)}
						/>
					</div>

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
							<SelectItem key="">Nenhuma</SelectItem>
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

			{/* Renewal Settings */}
			<Card className="border border-gray-200 shadow-sm">
				<CardHeader className="border-gray-100 border-b bg-gray-50/50 px-6 py-4">
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
							<FileText className="h-5 w-5 text-blue-600" />
						</div>
						<div>
							<h2 className="font-semibold text-gray-900 text-lg">Renovação</h2>
							<p className="text-gray-500 text-sm">
								Configurações de renovação automática
							</p>
						</div>
					</div>
				</CardHeader>
				<CardBody className="space-y-4 p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="font-medium text-gray-900">Renovação Automática</p>
							<p className="text-gray-500 text-sm">
								O contrato será renovado automaticamente ao final do período
							</p>
						</div>
						<Switch
							isSelected={formData.autoRenew}
							onValueChange={(v) => handleChange("autoRenew", v)}
						/>
					</div>

					{formData.autoRenew && (
						<Input
							type="number"
							label="Dias de Aviso Prévio para Renovação"
							placeholder="30"
							value={formData.renewalNoticeDays}
							onValueChange={(v) => handleChange("renewalNoticeDays", v)}
							description="Quantos dias antes do vencimento o inquilino deve ser notificado"
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
					onPress={() => navigate(`/dashboard/leases/${leaseId}`)}
				>
					Cancelar
				</Button>
				<Button
					color="primary"
					startContent={<Save className="h-4 w-4" />}
					onPress={handleSubmit}
					isLoading={updateMutation.isPending}
				>
					Salvar Alterações
				</Button>
			</div>
		</div>
	);
}
