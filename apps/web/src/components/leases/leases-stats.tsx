import { Card, CardBody } from "@heroui/react";
import {
	AlertTriangle,
	CheckCircle,
	Clock,
	FileText,
	XCircle,
} from "lucide-react";
import type { LeaseData } from "./types";

interface LeasesStatsProps {
	leases: LeaseData[];
	isLoading?: boolean;
}

export function LeasesStats({ leases, isLoading }: LeasesStatsProps) {
	const stats = {
		total: leases.length,
		active: leases.filter((l) => l.status === "active").length,
		pending: leases.filter(
			(l) => l.status === "pending" || l.status === "draft",
		).length,
		expiringSoon: leases.filter((l) => {
			if (!l.endDate || l.status !== "active") return false;
			const daysLeft = Math.ceil(
				(new Date(l.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
			);
			return daysLeft > 0 && daysLeft <= 30;
		}).length,
		expired: leases.filter(
			(l) => l.status === "expired" || l.status === "terminated",
		).length,
	};

	const totalMonthlyRent = leases
		.filter((l) => l.status === "active")
		.reduce((sum, l) => sum + Number(l.rentAmount), 0);

	const statsConfig = [
		{
			label: "Total de Contratos",
			value: stats.total,
			icon: FileText,
			color: "bg-blue-500",
			bgColor: "bg-blue-50",
		},
		{
			label: "Ativos",
			value: stats.active,
			icon: CheckCircle,
			color: "bg-green-500",
			bgColor: "bg-green-50",
		},
		{
			label: "Pendentes",
			value: stats.pending,
			icon: Clock,
			color: "bg-yellow-500",
			bgColor: "bg-yellow-50",
		},
		{
			label: "Vencendo em 30 dias",
			value: stats.expiringSoon,
			icon: AlertTriangle,
			color: "bg-orange-500",
			bgColor: "bg-orange-50",
		},
		{
			label: "Encerrados",
			value: stats.expired,
			icon: XCircle,
			color: "bg-gray-500",
			bgColor: "bg-gray-50",
		},
	];

	if (isLoading) {
		return (
			<div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
				{Array.from({ length: 5 }).map((_, i) => (
					<Card key={i} className="border border-gray-200">
						<CardBody className="p-4">
							<div className="h-20 animate-pulse rounded bg-gray-200" />
						</CardBody>
					</Card>
				))}
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
				{statsConfig.map((stat) => {
					const Icon = stat.icon;
					return (
						<Card key={stat.label} className="border border-gray-200 shadow-sm">
							<CardBody className="p-4">
								<div className="flex items-center gap-3">
									<div
										className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bgColor}`}
									>
										<Icon
											className={`h-5 w-5 ${stat.color.replace("bg-", "text-")}`}
										/>
									</div>
									<div>
										<p className="font-bold text-2xl text-gray-900">
											{stat.value}
										</p>
										<p className="text-gray-500 text-xs">{stat.label}</p>
									</div>
								</div>
							</CardBody>
						</Card>
					);
				})}
			</div>

			{/* Monthly rent summary */}
			<Card className="border border-gray-200 bg-gradient-to-r from-primary-50 to-primary-100 shadow-sm">
				<CardBody className="p-4">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-primary-700 text-sm">
								Receita Mensal de Aluguel (Contratos Ativos)
							</p>
							<p className="font-bold text-2xl text-primary-900">
								{new Intl.NumberFormat("pt-BR", {
									style: "currency",
									currency: "BRL",
								}).format(totalMonthlyRent)}
							</p>
						</div>
						<div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-200">
							<FileText className="h-6 w-6 text-primary-700" />
						</div>
					</div>
				</CardBody>
			</Card>
		</div>
	);
}
