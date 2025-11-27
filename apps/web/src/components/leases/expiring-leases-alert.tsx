import {
	Avatar,
	Button,
	Card,
	CardBody,
	CardHeader,
	Chip,
} from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Calendar, ChevronRight, RefreshCw } from "lucide-react";
import { Link } from "react-router";
import { trpc } from "@/utils/trpc";
import {
	formatTenantName,
	getDaysUntilExpiration,
	getPropertyName,
	type LeaseData,
} from "./types";

interface ExpiringLeasesAlertProps {
	days?: number;
	limit?: number;
	onRenew?: (lease: LeaseData) => void;
}

export function ExpiringLeasesAlert({
	days = 30,
	limit = 5,
	onRenew,
}: ExpiringLeasesAlertProps) {
	const { data, isLoading } = useQuery({
		...trpc.leases.getExpiringSoon.queryOptions({ days }),
	});

	const leases = (data?.leases || []).slice(0, limit) as unknown as LeaseData[];

	if (isLoading) {
		return (
			<Card className="border border-gray-200 shadow-sm">
				<CardBody className="p-6">
					<div className="h-32 animate-pulse rounded bg-gray-200" />
				</CardBody>
			</Card>
		);
	}

	if (leases.length === 0) {
		return null;
	}

	return (
		<Card className="border border-amber-200 bg-amber-50 shadow-sm">
			<CardHeader className="border-amber-200 border-b px-6 py-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
							<AlertTriangle className="h-5 w-5 text-amber-600" />
						</div>
						<div>
							<h3 className="font-semibold text-amber-900 text-lg">
								Contratos Vencendo em Breve
							</h3>
							<p className="text-amber-700 text-sm">
								{leases.length} contrato(s) vencendo nos próximos {days} dias
							</p>
						</div>
					</div>
					<Button
						as={Link}
						to="/dashboard/leases?filter=expiring"
						variant="light"
						size="sm"
						endContent={<ChevronRight className="h-4 w-4" />}
					>
						Ver Todos
					</Button>
				</div>
			</CardHeader>
			<CardBody className="p-0">
				<div className="divide-y divide-amber-200">
					{leases.map((lease) => {
						const daysLeft = getDaysUntilExpiration(lease.endDate);
						const isUrgent = daysLeft !== null && daysLeft <= 7;

						return (
							<div
								key={lease.id}
								className={`flex items-center justify-between p-4 ${isUrgent ? "bg-red-50" : ""}`}
							>
								<div className="flex items-center gap-4">
									<Avatar
										name={formatTenantName(lease.tenantContact)[0]}
										size="sm"
										className="bg-amber-100 text-amber-700"
									/>
									<div>
										<Link
											to={`/dashboard/leases/${lease.id}`}
											className="font-medium text-gray-900 hover:text-primary hover:underline"
										>
											{getPropertyName(lease)}
										</Link>
										<p className="text-gray-500 text-sm">
											{formatTenantName(lease.tenantContact)}
										</p>
									</div>
								</div>
								<div className="flex items-center gap-3">
									<div className="text-right">
										<Chip
											size="sm"
											color={isUrgent ? "danger" : "warning"}
											variant="flat"
											startContent={<Calendar className="h-3 w-3" />}
										>
											{daysLeft} dias
										</Chip>
										<p className="mt-1 text-gray-500 text-xs">
											{lease.endDate &&
												new Date(lease.endDate).toLocaleDateString("pt-BR")}
										</p>
									</div>
									{onRenew && (
										<Button
											size="sm"
											color="primary"
											variant="flat"
											startContent={<RefreshCw className="h-4 w-4" />}
											onPress={() => onRenew(lease)}
										>
											Renovar
										</Button>
									)}
								</div>
							</div>
						);
					})}
				</div>
			</CardBody>
		</Card>
	);
}
