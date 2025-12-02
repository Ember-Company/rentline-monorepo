// Lease status types
export type LeaseStatus =
	| "draft"
	| "pending"
	| "active"
	| "expired"
	| "terminated";
export type LeaseType = "fixed" | "month_to_month" | "annual";
export type InvoiceStatus =
	| "pending"
	| "paid"
	| "overdue"
	| "cancelled"
	| "partial";
export type PaymentType =
	| "rent"
	| "deposit"
	| "fee"
	| "refund"
	| "pet_deposit"
	| "security_deposit"
	| "late_fee"
	| "other";

// Status labels and colors
export const leaseStatusConfig: Record<
	LeaseStatus,
	{
		label: string;
		color: "default" | "primary" | "success" | "warning" | "danger";
	}
> = {
	draft: { label: "Rascunho", color: "default" },
	pending: { label: "Pendente", color: "warning" },
	active: { label: "Ativo", color: "success" },
	expired: { label: "Expirado", color: "danger" },
	terminated: { label: "Encerrado", color: "default" },
};

export const leaseTypeConfig: Record<
	LeaseType,
	{ label: string; description: string }
> = {
	fixed: {
		label: "Prazo Determinado",
		description: "Contrato com data de início e término definidas",
	},
	month_to_month: {
		label: "Mensal",
		description: "Contrato renovado automaticamente a cada mês",
	},
	annual: { label: "Anual", description: "Contrato com duração de 12 meses" },
};

export const invoiceStatusConfig: Record<
	InvoiceStatus,
	{
		label: string;
		color: "default" | "primary" | "success" | "warning" | "danger";
	}
> = {
	pending: { label: "Pendente", color: "warning" },
	paid: { label: "Pago", color: "success" },
	overdue: { label: "Vencido", color: "danger" },
	cancelled: { label: "Cancelado", color: "default" },
	partial: { label: "Parcial", color: "primary" },
};

export const paymentTypeConfig: Record<
	PaymentType,
	{ label: string; icon: string }
> = {
	rent: { label: "Aluguel", icon: "Home" },
	deposit: { label: "Depósito", icon: "Wallet" },
	fee: { label: "Taxa", icon: "Receipt" },
	refund: { label: "Reembolso", icon: "ArrowLeftRight" },
	pet_deposit: { label: "Depósito Pet", icon: "PawPrint" },
	security_deposit: { label: "Caução", icon: "Shield" },
	late_fee: { label: "Multa Atraso", icon: "AlertTriangle" },
	other: { label: "Outro", icon: "MoreHorizontal" },
};

// Lease data type (from API)
export interface LeaseData {
	id: string;
	propertyId?: string;
	unitId?: string;
	tenantContactId?: string;
	leaseType: LeaseType;
	startDate: string;
	endDate?: string;
	moveInDate?: string;
	moveOutDate?: string;
	rentAmount: number;
	depositAmount?: number;
	currencyId: string;
	paymentDueDay: number;
	lateFeeType?: "percentage" | "fixed";
	lateFeeAmount?: number;
	lateFeePercentage?: number;
	gracePeriodDays?: number;
	status: LeaseStatus;
	terms?: string;
	notes?: string;
	autoRenew: boolean;
	renewalNoticeDays?: number;
	createdAt: string;
	updatedAt: string;
	property?: {
		id: string;
		name: string;
		address?: string;
		type?: string;
	};
	unit?: {
		id: string;
		unitNumber: string;
		name?: string;
		property?: {
			id: string;
			name: string;
			address?: string;
		};
	};
	tenantContact?: {
		id: string;
		firstName?: string;
		lastName?: string;
		email?: string;
		phone?: string;
	};
	currency?: {
		id: string;
		name: string;
		symbol: string;
	};
	totalPaid?: number;
	paymentCount?: number;
	_count?: {
		payments: number;
		maintenanceRequests: number;
	};
}

// Invoice data type
export interface InvoiceData {
	id: string;
	leaseId: string;
	invoiceNumber?: string;
	dueDate: string;
	amount: number;
	currencyId: string;
	status: InvoiceStatus;
	paidAmount?: number;
	issuedAt: string;
	paidAt?: string;
	notes?: string;
	lease?: {
		id: string;
		property?: { id: string; name: string };
		unit?: {
			id: string;
			unitNumber: string;
			property?: { id: string; name: string };
		};
		tenantContact?: {
			id: string;
			firstName?: string;
			lastName?: string;
			email?: string;
		};
	};
	currency?: {
		id: string;
		name: string;
		symbol: string;
	};
	payments?: PaymentData[];
}

// Payment data type
export interface PaymentData {
	id: string;
	leaseId: string;
	amount: number;
	currencyId: string;
	type: PaymentType;
	status: "pending" | "completed" | "failed" | "refunded";
	date: string;
	periodStart?: string;
	periodEnd?: string;
	reference?: string;
	notes?: string;
	lease?: {
		id: string;
		property?: { id: string; name: string };
		unit?: { id: string; unitNumber: string };
		tenantContact?: { id: string; firstName?: string; lastName?: string };
	};
	currency?: {
		id: string;
		name: string;
		symbol: string;
	};
	paymentMethod?: {
		id: string;
		name: string;
	};
}

// Helper functions
export function getDaysUntilExpiration(
	endDate: string | undefined,
): number | null {
	if (!endDate) return null;
	const end = new Date(endDate);
	const now = new Date();
	const diff = end.getTime() - now.getTime();
	return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getLeaseStatusFromDates(
	startDate: string,
	endDate: string | undefined,
	status: LeaseStatus,
): LeaseStatus {
	if (status === "terminated") return status;

	const now = new Date();
	const start = new Date(startDate);

	if (now < start) return "pending";
	if (endDate && new Date(endDate) < now) return "expired";

	return status;
}

export function formatTenantName(
	tenant: { firstName?: string; lastName?: string } | undefined | null,
): string {
	if (!tenant) return "Sem inquilino";
	return (
		[tenant.firstName, tenant.lastName].filter(Boolean).join(" ") || "Sem nome"
	);
}

export function getPropertyName(lease: LeaseData): string {
	if (lease.unit?.property?.name) {
		return `${lease.unit.property.name} - ${lease.unit.name || `Unidade ${lease.unit.unitNumber}`}`;
	}
	return lease.property?.name || "Imóvel não definido";
}

// Form wizard types
export type FormStep = 1 | 2 | 3 | 4 | 5 | 6;

export interface AdditionalCharge {
	description: string;
	amount: number;
}

export interface LateFeeTier {
	daysLate: number;
	amount: number;
}

export interface LeaseContact {
	contactId: string;
	role: "owner" | "agent" | "guarantor" | "emergency_contact";
}

// Form option constants
export const paymentFrequencyOptions = [
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

export const furnishingOptions = [
	{ value: "furnished", label: "Furnished" },
	{ value: "unfurnished", label: "Unfurnished" },
	{ value: "partially_furnished", label: "Partially Furnished" },
];

export const contactRoleOptions = [
	{ value: "owner", label: "Owner" },
	{ value: "agent", label: "Agent" },
	{ value: "guarantor", label: "Guarantor" },
	{ value: "emergency_contact", label: "Emergency Contact" },
];
