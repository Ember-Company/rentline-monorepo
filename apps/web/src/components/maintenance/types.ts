export type MaintenanceRequest = {
	id: number;
	property: string;
	propertyId: number;
	unit: string;
	issue: string;
	description: string;
	priority: "low" | "medium" | "high" | "urgent";
	status: "pending" | "in-progress" | "completed" | "cancelled";
	requestedDate: string;
	completedDate?: string;
	assignedTo?: string;
	estimatedCost?: number;
	actualCost?: number;
	tenantName?: string;
};

export type MaintenanceStats = {
	total: number;
	pending: number;
	inProgress: number;
	completed: number;
	urgent: number;
};

export const priorityColors = {
	urgent: "danger",
	high: "warning",
	medium: "default",
	low: "success",
} as const;

export const statusColors = {
	completed: "success",
	"in-progress": "primary",
	pending: "warning",
	cancelled: "default",
} as const;

export const INITIAL_REQUESTS: MaintenanceRequest[] = [
	{
		id: 1,
		property: "Av. Paulista, 1500",
		propertyId: 1,
		unit: "Apto 101",
		issue: "Vazamento na torneira da cozinha",
		description: "A torneira da cozinha está pingando há alguns dias.",
		priority: "medium",
		status: "pending",
		requestedDate: "2025-01-15",
		tenantName: "João Silva",
	},
	{
		id: 2,
		property: "Rua Augusta, 2500",
		propertyId: 2,
		unit: "Apto 205",
		issue: "Ar condicionado não funciona",
		description: "O sistema de ar condicionado parou de funcionar.",
		priority: "urgent",
		status: "in-progress",
		requestedDate: "2025-01-14",
		assignedTo: "Clima Frio Ar",
		estimatedCost: 500,
		tenantName: "Maria Santos",
	},
	{
		id: 3,
		property: "Rua Oscar Freire, 800",
		propertyId: 3,
		unit: "Principal",
		issue: "Janela quebrada",
		description: "Vidro da janela da sala trincou durante a tempestade.",
		priority: "high",
		status: "completed",
		requestedDate: "2025-01-10",
		completedDate: "2025-01-12",
		assignedTo: "Vidraçaria Express",
		estimatedCost: 300,
		actualCost: 280,
		tenantName: "Carlos Oliveira",
	},
	{
		id: 4,
		property: "Av. Brigadeiro Faria Lima, 3500",
		propertyId: 4,
		unit: "Sala 1001",
		issue: "Problema no encanamento",
		description: "Vaso sanitário funcionando constantemente.",
		priority: "high",
		status: "in-progress",
		requestedDate: "2025-01-16",
		assignedTo: "Encanador 24h",
		estimatedCost: 200,
		tenantName: "Ana Costa",
	},
	{
		id: 5,
		property: "Rua Harmonia, 350",
		propertyId: 5,
		unit: "Casa",
		issue: "Portão automático com defeito",
		description: "Motor do portão automático parou de funcionar.",
		priority: "low",
		status: "pending",
		requestedDate: "2025-01-17",
		tenantName: "Pedro Ferreira",
	},
];
