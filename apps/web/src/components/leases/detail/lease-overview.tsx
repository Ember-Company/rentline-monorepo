import { Avatar, Card, CardBody, Divider } from "@heroui/react";
import {
	Bell,
	Calendar,
	Clock,
	CreditCard,
	DollarSign,
	Home,
	User,
} from "lucide-react";
import { Link } from "react-router";
import type { LeaseData } from "../types";
import { formatTenantName, leaseTypeConfig } from "../types";

interface LeaseOverviewProps {
	lease: LeaseData;
}

export function LeaseOverview({ lease }: LeaseOverviewProps) {
	const formatCurrency = (value: number) =>
		new Intl.NumberFormat("pt-BR", {
			style: "currency",
			currency: "BRL",
		}).format(value);

	const formatDate = (date: string) =>
		new Date(date).toLocaleDateString("pt-BR", {
			day: "2-digit",
			month: "long",
			year: "numeric",
		});

	const typeConfig = leaseTypeConfig[lease.leaseType];

	// Calculate lease duration
	const calculateDuration = () => {
		if (!lease.endDate) return "Indeterminado";
		const start = new Date(lease.startDate);
		const end = new Date(lease.endDate);
		const months =
			(end.getFullYear() - start.getFullYear()) * 12 +
			(end.getMonth() - start.getMonth());
		if (months >= 12) {
			const years = Math.floor(months / 12);
			const remainingMonths = months % 12;
			return remainingMonths > 0
				? `${years} ano(s) e ${remainingMonths} mês(es)`
				: `${years} ano(s)`;
		}
		return `${months} mês(es)`;
	};

	return (
		<div className="grid gap-6 lg:grid-cols-3">
			{/* Main Info */}
			<Card className="border border-gray-200 shadow-sm lg:col-span-2">
				<CardBody className="p-6">
					<h3 className="mb-4 font-semibold text-gray-900 text-lg">
						Informações do Contrato
					</h3>

					<div className="grid gap-6 sm:grid-cols-2">
						{/* Property Info */}
						<div className="space-y-4">
							<div className="flex items-start gap-3">
								<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
									<Home className="h-5 w-5 text-blue-600" />
								</div>
								<div>
									<p className="text-gray-500 text-sm">Imóvel</p>
									<Link
										to={`/dashboard/properties/${lease.property?.id || lease.unit?.property?.id}`}
										className="font-medium text-primary hover:underline"
									>
										{lease.unit?.property?.name ||
											lease.property?.name ||
											"N/A"}
									</Link>
									{lease.unit && (
										<p className="text-gray-500 text-sm">
											{lease.unit.name || `Unidade ${lease.unit.unitNumber}`}
										</p>
									)}
								</div>
							</div>

							<div className="flex items-start gap-3">
								<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
									<Calendar className="h-5 w-5 text-green-600" />
								</div>
								<div>
									<p className="text-gray-500 text-sm">Período</p>
									<p className="font-medium text-gray-900">
										{formatDate(lease.startDate)}
									</p>
									{lease.endDate && (
										<p className="text-gray-500 text-sm">
											até {formatDate(lease.endDate)}
										</p>
									)}
									<p className="text-gray-400 text-xs">
										Duração: {calculateDuration()}
									</p>
								</div>
							</div>

							<div className="flex items-start gap-3">
								<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
									<Clock className="h-5 w-5 text-purple-600" />
								</div>
								<div>
									<p className="text-gray-500 text-sm">Tipo de Contrato</p>
									<p className="font-medium text-gray-900">
										{typeConfig?.label || lease.leaseType}
									</p>
									{lease.autoRenew && (
										<p className="text-green-600 text-xs">
											Renovação automática ativada
										</p>
									)}
								</div>
							</div>
						</div>

						{/* Financial Info */}
						<div className="space-y-4">
							<div className="flex items-start gap-3">
								<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
									<DollarSign className="h-5 w-5 text-amber-600" />
								</div>
								<div>
									<p className="text-gray-500 text-sm">Aluguel Mensal</p>
									<p className="font-bold text-gray-900 text-xl">
										{formatCurrency(Number(lease.rentAmount))}
									</p>
									<p className="text-gray-400 text-xs">
										Vencimento: dia {lease.paymentDueDay}
									</p>
								</div>
							</div>

							{lease.depositAmount && (
								<div className="flex items-start gap-3">
									<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
										<CreditCard className="h-5 w-5 text-gray-600" />
									</div>
									<div>
										<p className="text-gray-500 text-sm">Depósito/Caução</p>
										<p className="font-medium text-gray-900">
											{formatCurrency(Number(lease.depositAmount))}
										</p>
									</div>
								</div>
							)}

							{lease.lateFeeType && (
								<div className="flex items-start gap-3">
									<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
										<Bell className="h-5 w-5 text-red-600" />
									</div>
									<div>
										<p className="text-gray-500 text-sm">Multa por Atraso</p>
										<p className="font-medium text-gray-900">
											{lease.lateFeeType === "percentage"
												? `${lease.lateFeePercentage}%`
												: formatCurrency(Number(lease.lateFeeAmount))}
										</p>
										{lease.gracePeriodDays && (
											<p className="text-gray-400 text-xs">
												Após {lease.gracePeriodDays} dias de carência
											</p>
										)}
									</div>
								</div>
							)}
						</div>
					</div>

					{/* Notes */}
					{(lease.terms || lease.notes) && (
						<>
							<Divider className="my-6" />
							<div className="space-y-4">
								{lease.terms && (
									<div>
										<p className="font-medium text-gray-700 text-sm">
											Termos e Condições
										</p>
										<p className="mt-1 whitespace-pre-wrap text-gray-600 text-sm">
											{lease.terms}
										</p>
									</div>
								)}
								{lease.notes && (
									<div>
										<p className="font-medium text-gray-700 text-sm">
											Observações
										</p>
										<p className="mt-1 whitespace-pre-wrap text-gray-600 text-sm">
											{lease.notes}
										</p>
									</div>
								)}
							</div>
						</>
					)}
				</CardBody>
			</Card>

			{/* Tenant Card */}
			<Card className="h-fit border border-gray-200 shadow-sm">
				<CardBody className="p-6">
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100">
							<User className="h-5 w-5 text-primary" />
						</div>
						<h3 className="font-semibold text-gray-900 text-lg">Inquilino</h3>
					</div>

					<div className="mt-6 flex flex-col items-center text-center">
						<Avatar
							name={formatTenantName(lease.tenantContact)}
							size="lg"
							className="mb-3 h-20 w-20 text-2xl"
						/>
						<p className="font-semibold text-gray-900 text-lg">
							{formatTenantName(lease.tenantContact)}
						</p>
						{lease.tenantContact?.email && (
							<a
								href={`mailto:${lease.tenantContact.email}`}
								className="text-primary text-sm hover:underline"
							>
								{lease.tenantContact.email}
							</a>
						)}
						{lease.tenantContact?.phone && (
							<a
								href={`tel:${lease.tenantContact.phone}`}
								className="text-gray-500 text-sm hover:text-gray-700"
							>
								{lease.tenantContact.phone}
							</a>
						)}
					</div>

					{lease.tenantContact?.id && (
						<Link
							to={`/dashboard/contacts?id=${lease.tenantContact.id}`}
							className="mt-4 block w-full rounded-lg border border-gray-200 py-2 text-center font-medium text-gray-700 text-sm hover:bg-gray-50"
						>
							Ver Perfil Completo
						</Link>
					)}
				</CardBody>
			</Card>
		</div>
	);
}
