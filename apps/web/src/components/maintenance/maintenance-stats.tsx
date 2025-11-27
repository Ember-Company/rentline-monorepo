import { Card, CardBody } from "@heroui/react";
import {
	AlertTriangle,
	CheckCircle,
	Clock,
	LayoutGrid,
	Wrench,
} from "lucide-react";
import type { MaintenanceStats as StatsType } from "./types";

interface MaintenanceStatsProps {
	stats: StatsType;
}

export function MaintenanceStats({ stats }: MaintenanceStatsProps) {
	const items = [
		{
			label: "Total",
			value: stats.total,
			icon: LayoutGrid,
			color: "text-gray-900",
			bgColor: "bg-gray-100",
		},
		{
			label: "Pendente",
			value: stats.pending,
			icon: Clock,
			color: "text-amber-600",
			bgColor: "bg-amber-100",
		},
		{
			label: "Em Andamento",
			value: stats.inProgress,
			icon: Wrench,
			color: "text-blue-600",
			bgColor: "bg-blue-100",
		},
		{
			label: "Concluído",
			value: stats.completed,
			icon: CheckCircle,
			color: "text-emerald-600",
			bgColor: "bg-emerald-100",
		},
		{
			label: "Urgente",
			value: stats.urgent,
			icon: AlertTriangle,
			color: "text-red-600",
			bgColor: "bg-red-100",
		},
	];

	return (
		<div className="grid grid-cols-2 gap-4 md:grid-cols-5">
			{items.map((item) => (
				<Card key={item.label} className="border border-gray-200 shadow-sm">
					<CardBody className="p-4">
						<div className="flex items-center gap-3">
							<div
								className={`flex h-10 w-10 items-center justify-center rounded-lg ${item.bgColor}`}
							>
								<item.icon className={`h-5 w-5 ${item.color}`} />
							</div>
							<div>
								<p className={`font-bold text-2xl ${item.color}`}>
									{item.value}
								</p>
								<p className="text-gray-500 text-xs">{item.label}</p>
							</div>
						</div>
					</CardBody>
				</Card>
			))}
		</div>
	);
}
