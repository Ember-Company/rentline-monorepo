// API Types - these match the backend tRPC router types

export type PropertyType = "apartment_building" | "house" | "office" | "land";
export type PropertyCategory = "rent" | "sale" | "both";
export type PropertyStatus = "active" | "inactive" | "sold" | "rented";

export type UnitType =
	| "apartment"
	| "office"
	| "retail"
	| "storage"
	| "parking";
export type UnitStatus = "available" | "occupied" | "maintenance" | "reserved";

export type LeaseType = "fixed" | "month_to_month" | "annual";
export type LeaseStatus =
	| "draft"
	| "pending"
	| "active"
	| "expired"
	| "terminated";

export type PaymentType =
	| "rent"
	| "deposit"
	| "fee"
	| "refund"
	| "pet_deposit"
	| "security_deposit"
	| "late_fee"
	| "other";
export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";

export type ExpenseCategory =
	| "maintenance"
	| "utilities"
	| "tax"
	| "insurance"
	| "mortgage"
	| "management"
	| "repairs"
	| "supplies"
	| "advertising"
	| "legal"
	| "professional"
	| "travel"
	| "other";

export type MaintenanceStatus = "open" | "in_progress" | "closed";
export type MaintenancePriority = "low" | "medium" | "high" | "urgent";

export type ContactType = "tenant" | "agent" | "owner";

// Currency
export interface Currency {
	id: string;
	name: string;
	symbol: string;
}

// Contact
export interface Contact {
	id: string;
	organizationId: string;
	type: ContactType;
	firstName?: string | null;
	lastName?: string | null;
	email?: string | null;
	phone?: string | null;
	mobile?: string | null;
	dateOfBirth?: string | null;
	notes?: string | null;
	companyName?: string | null;
	taxId?: string | null;
	registrationNumber?: string | null;
	address?: string | null;
	city?: string | null;
	state?: string | null;
	postalCode?: string | null;
	country?: string | null;
	avatarUrl?: string | null;
	status: string;
	createdAt: string;
	updatedAt: string;
}

// Property
export interface Property {
	id: string;
	organizationId: string;
	landlordId: string;
	name: string;
	type: PropertyType;
	category: PropertyCategory;
	status: PropertyStatus;
	address: string;
	city?: string | null;
	state?: string | null;
	postalCode?: string | null;
	country?: string | null;
	latitude?: number | null;
	longitude?: number | null;
	description?: string | null;
	features: string[];
	amenities: string[];
	totalArea?: number | null;
	usableArea?: number | null;
	lotSize?: number | null;
	floors?: number | null;
	yearBuilt?: number | null;
	parkingSpaces?: number | null;
	bedrooms?: number | null;
	bathrooms?: number | null;
	purchasePrice?: number | null;
	currentValue?: number | null;
	askingPrice?: number | null;
	monthlyRent?: number | null;
	currencyId?: string | null;
	currency?: Currency | null;
	coverImage?: string | null;
	images: string[];
	createdAt: string;
	updatedAt: string;
	// Computed fields
	unitCount?: number;
	occupiedUnits?: number;
	vacantUnits?: number;
	activeLeases?: number;
}

// Property with relations
export interface PropertyWithRelations extends Property {
	landlord?: {
		id: string;
		name: string;
		email: string;
		image?: string | null;
	};
	units?: UnitWithRelations[];
	leases?: LeaseWithRelations[];
	expenses?: ExpenseWithRelations[];
	documents?: Document[];
	contacts?: PropertyContact[];
}

// Unit
export interface Unit {
	id: string;
	propertyId: string;
	unitNumber: string;
	name?: string | null;
	type: UnitType;
	floor?: number | null;
	bedrooms?: number | null;
	bathrooms?: number | null;
	area?: number | null;
	status: UnitStatus;
	rentAmount?: number | null;
	depositAmount?: number | null;
	currencyId?: string | null;
	currency?: Currency | null;
	features: string[];
	amenities: string[];
	description?: string | null;
	coverImage?: string | null;
	images: string[];
	createdAt: string;
	updatedAt: string;
}

// Unit with relations
export interface UnitWithRelations extends Unit {
	property?: {
		id: string;
		name: string;
		address: string;
		type: PropertyType;
	};
	leases?: LeaseWithRelations[];
	activeLease?: LeaseWithRelations | null;
	tenant?: Contact | null;
}

// Lease
export interface Lease {
	id: string;
	propertyId?: string | null;
	unitId?: string | null;
	tenantId?: string | null;
	tenantContactId?: string | null;
	leaseType: LeaseType;
	startDate: string;
	endDate?: string | null;
	moveInDate?: string | null;
	moveOutDate?: string | null;
	rentAmount: number;
	depositAmount?: number | null;
	currencyId: string;
	currency?: Currency;
	paymentDueDay: number;
	lateFeeType?: string | null;
	lateFeeAmount?: number | null;
	lateFeePercentage?: number | null;
	gracePeriodDays?: number | null;
	petDeposit?: number | null;
	securityDeposit?: number | null;
	lastMonthRent?: number | null;
	status: LeaseStatus;
	terms?: string | null;
	notes?: string | null;
	autoRenew: boolean;
	renewalNoticeDays?: number | null;
	notificationChannel?: string | null;
	createdAt: string;
	updatedAt: string;
}

// Lease with relations
export interface LeaseWithRelations extends Lease {
	property?: {
		id: string;
		name: string;
		address: string;
		type: PropertyType;
	} | null;
	unit?: {
		id: string;
		unitNumber: string;
		name?: string | null;
		property?: {
			id: string;
			name: string;
			address: string;
		};
	} | null;
	tenantContact?: Contact | null;
	payments?: Payment[];
	invoices?: Invoice[];
	totalPaid?: number;
	totalDue?: number;
}

// Payment
export interface Payment {
	id: string;
	leaseId: string;
	amount: number;
	currencyId: string;
	currency?: Currency;
	paymentMethodId?: string | null;
	paymentMethod?: PaymentMethod | null;
	transactionId?: string | null;
	reference?: string | null;
	type: PaymentType;
	status: PaymentStatus;
	invoiceId?: string | null;
	date: string;
	periodStart?: string | null;
	periodEnd?: string | null;
	notes?: string | null;
	createdAt: string;
}

// Payment with relations
export interface PaymentWithRelations extends Payment {
	lease?: {
		id: string;
		property?: { id: string; name: string } | null;
		unit?: { id: string; unitNumber: string } | null;
		tenantContact?: { id: string; firstName: string; lastName: string } | null;
	};
}

// Invoice
export interface Invoice {
	id: string;
	leaseId: string;
	invoiceNumber?: string | null;
	dueDate: string;
	amount: number;
	currencyId: string;
	currency?: Currency;
	lineItems?: string | null;
	status: string;
	paidAmount?: number | null;
	issuedAt: string;
	paidAt?: string | null;
	reminderSentAt?: string | null;
	pixQrCodeUrl?: string | null;
	notes?: string | null;
}

// Expense
export interface Expense {
	id: string;
	propertyId: string;
	unitId?: string | null;
	paidBy: string;
	category: ExpenseCategory;
	subcategory?: string | null;
	vendor?: string | null;
	amount: number;
	currencyId: string;
	currency?: Currency;
	date: string;
	description?: string | null;
	receiptDocumentId?: string | null;
	isRecurring: boolean;
	recurringFrequency?: string | null;
	isTaxDeductible: boolean;
	createdAt: string;
	updatedAt: string;
}

// Expense with relations
export interface ExpenseWithRelations extends Expense {
	property?: {
		id: string;
		name: string;
		address: string;
	};
	unit?: {
		id: string;
		unitNumber: string;
	} | null;
	paidByUser?: {
		id: string;
		name: string;
	};
}

// Maintenance Request
export interface MaintenanceRequest {
	id: string;
	unitId: string;
	leaseId?: string | null;
	requestedBy: string;
	assignedTo?: string | null;
	title: string;
	description?: string | null;
	status: MaintenanceStatus;
	priority: MaintenancePriority;
	createdAt: string;
	updatedAt: string;
}

// Maintenance Request with relations
export interface MaintenanceRequestWithRelations extends MaintenanceRequest {
	unit?: {
		id: string;
		unitNumber: string;
		property: {
			id: string;
			name: string;
			address: string;
		};
	};
	lease?: {
		id: string;
		tenantContact?: Contact | null;
	} | null;
	requester?: {
		id: string;
		name: string;
		email: string;
	};
	assignee?: {
		id: string;
		name: string;
		email: string;
	} | null;
}

// Document
export interface Document {
	id: string;
	userId?: string | null;
	leaseId?: string | null;
	expenseId?: string | null;
	propertyId?: string | null;
	unitId?: string | null;
	type: string;
	url: string;
	uploadedBy: string;
	uploadedAt: string;
}

// Property Contact (join table)
export interface PropertyContact {
	id: string;
	propertyId: string;
	contactId: string;
	role?: string | null;
	contact?: Contact;
	createdAt: string;
	updatedAt: string;
}

// Payment Method
export interface PaymentMethod {
	id: string;
	name: string;
	type: string;
}

// Organization
export interface Organization {
	id: string;
	name: string;
	slug: string;
	logo?: string | null;
	createdAt: string;
	metadata?: string | null;
	address?: string | null;
	city?: string | null;
	state?: string | null;
	postalCode?: string | null;
	country?: string | null;
	phone?: string | null;
	email?: string | null;
	website?: string | null;
	taxId?: string | null;
	licenseNumber?: string | null;
	type?: string | null;
	role?: string;
}

// Organization Settings
export interface OrganizationSettings {
	id: string;
	organizationId: string;
	timezone?: string | null;
	locale?: string | null;
	currencyId?: string | null;
	currency?: Currency | null;
	notificationsEnabled: boolean;
	maintenanceAutoAssign: boolean;
}

// Organization Stats
export interface OrganizationStats {
	totalProperties: number;
	totalUnits: number;
	occupiedUnits: number;
	vacantUnits: number;
	occupancyRate: number;
	activeLeases: number;
	monthlyRevenue: number;
	monthlyExpenses: number;
	netIncome: number;
	pendingMaintenance: number;
	expiringSoonLeases: number;
}

// Input types for mutations
export interface CreatePropertyInput {
	name: string;
	type: PropertyType;
	category?: PropertyCategory;
	status?: PropertyStatus;
	address: string;
	city?: string;
	state?: string;
	postalCode?: string;
	country?: string;
	latitude?: number;
	longitude?: number;
	description?: string;
	features?: string[];
	amenities?: string[];
	totalArea?: number;
	usableArea?: number;
	lotSize?: number;
	floors?: number;
	yearBuilt?: number;
	parkingSpaces?: number;
	bedrooms?: number;
	bathrooms?: number;
	purchasePrice?: number;
	currentValue?: number;
	askingPrice?: number;
	monthlyRent?: number;
	currencyId?: string;
	coverImage?: string;
	images?: string[];
}

export interface CreateUnitInput {
	propertyId: string;
	unitNumber: string;
	name?: string;
	type?: UnitType;
	floor?: number;
	bedrooms?: number;
	bathrooms?: number;
	area?: number;
	rentAmount?: number;
	depositAmount?: number;
	currencyId?: string;
	features?: string[];
	amenities?: string[];
	description?: string;
	coverImage?: string;
	images?: string[];
	status?: UnitStatus;
}

export interface CreateLeaseInput {
	propertyId?: string;
	unitId?: string;
	tenantContactId: string;
	leaseType?: LeaseType;
	startDate: string;
	endDate?: string;
	moveInDate?: string;
	moveOutDate?: string;
	rentAmount: number;
	depositAmount?: number;
	currencyId: string;
	paymentDueDay?: number;
	lateFeeType?: "percentage" | "fixed";
	lateFeeAmount?: number;
	lateFeePercentage?: number;
	gracePeriodDays?: number;
	petDeposit?: number;
	securityDeposit?: number;
	lastMonthRent?: number;
	status?: LeaseStatus;
	terms?: string;
	notes?: string;
	autoRenew?: boolean;
	renewalNoticeDays?: number;
	notificationChannel?: "email" | "sms" | "both";
}

export interface CreatePaymentInput {
	leaseId: string;
	amount: number;
	currencyId: string;
	paymentMethodId?: string;
	type: PaymentType;
	date?: string;
	periodStart?: string;
	periodEnd?: string;
	reference?: string;
	notes?: string;
	status?: PaymentStatus;
}

export interface CreateExpenseInput {
	propertyId: string;
	unitId?: string;
	category: ExpenseCategory;
	subcategory?: string;
	vendor?: string;
	amount: number;
	currencyId: string;
	date: string;
	description?: string;
	isRecurring?: boolean;
	recurringFrequency?: "monthly" | "quarterly" | "annually";
	isTaxDeductible?: boolean;
}

export interface CreateMaintenanceInput {
	unitId: string;
	leaseId?: string;
	title: string;
	description?: string;
	priority?: MaintenancePriority;
	assignedTo?: string;
}

export interface CreateContactInput {
	type: ContactType;
	firstName?: string;
	lastName?: string;
	email?: string;
	phone?: string;
	mobile?: string;
	dateOfBirth?: string;
	notes?: string;
	companyName?: string;
	taxId?: string;
	registrationNumber?: string;
	address?: string;
	city?: string;
	state?: string;
	postalCode?: string;
	country?: string;
	avatarUrl?: string;
	status?: "active" | "inactive";
}
