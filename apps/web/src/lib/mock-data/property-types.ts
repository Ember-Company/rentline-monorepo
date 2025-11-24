// Property types and their configurations
export type PropertyType = "land" | "offices" | "houses" | "apartments";

export type PropertyCategory = "rent" | "sale" | "both";

export interface Lease {
	id: string;
	startDate: string;
	endDate: string;
	monthlyRent: number;
	deposit: number;
	currency: string;
	paymentDay: number; // Day of month when rent is due
	status: "active" | "expired" | "upcoming" | "terminated";
	notes?: string;
}

export interface PropertyUnit {
	id: string;
	unitNumber: string;
	type: string;
	squareFeet: number;
	bedrooms?: number;
	bathrooms?: number;
	rent: number;
	status: "occupied" | "vacant" | "maintenance";
	tenantId?: string;
	leaseId?: string;
}

export interface PropertyTenant {
	id: string;
	tenantId: string; // Reference to tenant entity
	unitId?: string; // For apartments
	status: "accepted" | "pending" | "rejected";
	leaseId: string;
	moveInDate?: string;
	moveOutDate?: string;
}

export interface PropertyDetail {
	id: number;
	name: string;
	type: PropertyType;
	category: PropertyCategory;
	address: string;
	city: string;
	state: string;
	postalCode: string;
	country: string;
	description?: string;
	
	// Property-specific fields
	squareFeet?: number;
	bedrooms?: number;
	bathrooms?: number;
	lotSize?: number; // For land
	floors?: number; // For offices/houses
	
	// Financial
	price?: number; // For sale
	monthlyRent?: number; // For rent
	currency: string;
	
	// Status
	status: "occupied" | "vacant" | "maintenance" | "for-sale" | "sold";
	
	// Relationships
	leases: Lease[];
	tenants: PropertyTenant[];
	units?: PropertyUnit[]; // For apartments
	
	// Financial records
	payments: Array<{
		id: string;
		date: string;
		category: string;
		period: string;
		tenant?: string;
		notes?: string;
		status: "paid" | "pending" | "overdue";
		amount: number;
	}>;
	expenses: Array<{
		id: string;
		date: string;
		category: string;
		description: string;
		vendor?: string;
		amount: number;
		status: "paid" | "pending";
	}>;
	
	// Metadata
	images: string[];
	documents: Array<{
		id: string;
		name: string;
		type: string;
		url: string;
		uploadedAt: string;
	}>;
	contacts: Array<{
		id: string;
		name: string;
		role: string;
		email: string;
		phone: string;
	}>;
	mileage?: Array<{
		id: string;
		date: string;
		mileage: number;
		notes?: string;
	}>;
	reminders: Array<{
		id: string;
		title: string;
		date: string;
		notes?: string;
		completed: boolean;
	}>;
	
	// Dates
	listedOn: string;
	lastUpdate: string;
}

