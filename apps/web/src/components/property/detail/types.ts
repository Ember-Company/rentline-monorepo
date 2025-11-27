import type { PropertyStatus, PropertyType, UnitStatus } from "@/lib/types/api";

// Re-export types for convenience
export type { PropertyType, PropertyStatus, UnitStatus };

// Property from API response
export interface Property {
	id: string;
	name: string;
	type: string;
	category: string;
	status: string;
	address?: string | null;
	city?: string | null;
	state?: string | null;
	postalCode?: string | null;
	description?: string | null;
	totalArea?: number | null;
	usableArea?: number | null;
	lotSize?: number | null;
	floors?: number | null;
	yearBuilt?: number | null;
	parkingSpaces?: number | null;
	bedrooms?: number | null;
	bathrooms?: number | null;
	monthlyRent?: number | null;
	askingPrice?: number | null;
	currentValue?: number | null;
	amenities?: string[] | null;
	features?: string[] | null;
}

export interface Unit {
	id: string;
	unitNumber: string;
	name?: string | null;
	type: string;
	floor?: number | null;
	bedrooms?: number | null;
	bathrooms?: number | null;
	area?: number | null;
	rentAmount?: number | null;
	depositAmount?: number | null;
	status: string;
}

export interface Lease {
	id: string;
	startDate: string | Date;
	endDate?: string | Date | null;
	rentAmount: number | string;
	status: string;
	tenantContact?: {
		firstName?: string | null;
		lastName?: string | null;
		email?: string | null;
	} | null;
	unit?: {
		unitNumber?: string | null;
	} | null;
}

export interface Payment {
	id: string;
	amount: number | string;
	date: string | Date;
	type: string;
	status: string;
	notes?: string | null;
}

export interface Expense {
	id: string;
	amount: number | string;
	date: string | Date;
	category: string;
	description?: string | null;
	vendor?: string | null;
}

export interface MaintenanceRequest {
	id: string;
	title: string;
	description?: string | null;
	status: string;
	priority: string;
	createdAt: string | Date;
	unit?: {
		unitNumber?: string | null;
	} | null;
}

export interface Contact {
	id: string;
	type: string;
	firstName?: string | null;
	lastName?: string | null;
	email?: string | null;
	phone?: string | null;
	mobile?: string | null;
	companyName?: string | null;
}

export interface TabItem {
	key: string;
	label: string;
}
