import type { PropertyDetail } from "./property-types";
import { tenantEntities } from "./tenants-entities";

// Enhanced property details with all property types
export const enhancedPropertyDetails: Record<number, PropertyDetail> = {
	1: {
		id: 1,
		name: "ergargae",
		type: "apartments",
		category: "rent",
		address: "Foz do Iguaçu",
		city: "Foz do Iguaçu",
		state: "Paraná",
		postalCode: "85856738",
		country: "Brazil",
		description: "Modern apartment building in the heart of the city",
		squareFeet: 5000,
		bedrooms: undefined,
		bathrooms: undefined,
		floors: 5,
		monthlyRent: 4200,
		currency: "GBP",
		status: "occupied",
		leases: [
			{
				id: "lease_1",
				startDate: "2025-03-14",
				endDate: "2026-03-15",
				monthlyRent: 4200,
				deposit: 8400,
				currency: "GBP",
				paymentDay: 15,
				status: "active",
			},
		],
		tenants: [
			{
				id: "pt_1",
				tenantId: "tnt_1",
				unitId: "unit_1",
				status: "accepted",
				leaseId: "lease_1",
				moveInDate: "2025-03-14",
			},
		],
		units: [
			{
				id: "unit_1",
				unitNumber: "2B",
				type: "2 Bedroom",
				squareFeet: 850,
				bedrooms: 2,
				bathrooms: 1,
				rent: 600,
				status: "occupied",
				tenantId: "tnt_1",
				leaseId: "lease_1",
			},
			{
				id: "unit_2",
				unitNumber: "3A",
				type: "3 Bedroom",
				squareFeet: 1200,
				bedrooms: 3,
				bathrooms: 2,
				rent: 800,
				status: "vacant",
			},
			{
				id: "unit_3",
				unitNumber: "1C",
				type: "1 Bedroom",
				squareFeet: 650,
				bedrooms: 1,
				bathrooms: 1,
				rent: 500,
				status: "occupied",
			},
		],
		images: [
			"https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
		],
		documents: [],
		contacts: [
			{
				id: "contact_1",
				name: "Property Manager",
				role: "Manager",
				email: "manager@example.com",
				phone: "+1 (555) 000-0000",
			},
		],
		mileage: [],
		reminders: [
			{
				id: "rem_1",
				title: "Renew lease",
				date: "2026-02-15",
				notes: "Contact tenant 30 days before lease end",
				completed: false,
			},
		],
		payments: [
			{
				id: "pay_1",
				date: "2025-04-14",
				category: "Rent",
				period: "15 Apr 2025",
				tenant: "Bob Bobson",
				notes: "",
				status: "paid",
				amount: 600,
			},
			{
				id: "pay_2",
				date: "2025-03-14",
				category: "Rent",
				period: "15 Mar 2025",
				tenant: "Bob Bobson",
				notes: "",
				status: "paid",
				amount: 600,
			},
		],
		expenses: [],
		listedOn: "2024-01-15",
		lastUpdate: "2025-04-14",
	},
	2: {
		id: 2,
		name: "Downtown Office Space",
		type: "offices",
		category: "rent",
		address: "123 Business Ave",
		city: "San Francisco",
		state: "CA",
		postalCode: "94102",
		country: "USA",
		description: "Modern office space in downtown area",
		squareFeet: 5000,
		floors: 3,
		monthlyRent: 15000,
		currency: "USD",
		status: "occupied",
		leases: [
			{
				id: "lease_2",
				startDate: "2024-01-01",
				endDate: "2025-12-31",
				monthlyRent: 15000,
				deposit: 30000,
				currency: "USD",
				paymentDay: 1,
				status: "active",
			},
		],
		tenants: [
			{
				id: "pt_2",
				tenantId: "tnt_2",
				status: "accepted",
				leaseId: "lease_2",
				moveInDate: "2024-01-01",
			},
		],
		images: [
			"https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop",
		],
		documents: [],
		contacts: [],
		mileage: [],
		reminders: [],
		listedOn: "2023-12-01",
		lastUpdate: "2024-01-01",
	},
	3: {
		id: 3,
		name: "Riverside House",
		type: "houses",
		category: "both",
		address: "456 Riverside Dr",
		city: "Portland",
		state: "OR",
		postalCode: "97201",
		country: "USA",
		description: "Beautiful family home with river view",
		squareFeet: 2500,
		bedrooms: 4,
		bathrooms: 3,
		lotSize: 0.5,
		price: 650000,
		monthlyRent: 3500,
		currency: "USD",
		status: "occupied",
		leases: [
			{
				id: "lease_3",
				startDate: "2024-06-01",
				endDate: "2025-05-31",
				monthlyRent: 3500,
				deposit: 7000,
				currency: "USD",
				paymentDay: 1,
				status: "active",
			},
		],
		tenants: [
			{
				id: "pt_3",
				tenantId: "tnt_3",
				status: "accepted",
				leaseId: "lease_3",
				moveInDate: "2024-06-01",
			},
		],
		payments: [],
		expenses: [],
		images: [
			"https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop",
		],
		documents: [],
		contacts: [],
		mileage: [],
		reminders: [],
		listedOn: "2024-05-01",
		lastUpdate: "2024-06-01",
	},
	4: {
		id: 4,
		name: "Commercial Land Plot",
		type: "land",
		category: "sale",
		address: "789 Industrial Blvd",
		city: "Houston",
		state: "TX",
		postalCode: "77001",
		country: "USA",
		description: "Prime commercial land for development",
		lotSize: 2.5,
		price: 500000,
		currency: "USD",
		status: "for-sale",
		leases: [],
		tenants: [],
		payments: [],
		expenses: [],
		images: [
			"https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop",
		],
		documents: [],
		contacts: [],
		mileage: [],
		reminders: [],
		listedOn: "2024-03-01",
		lastUpdate: "2024-03-01",
	},
};

// Helper function to get property with tenant details
export function getPropertyWithTenants(propertyId: number): (PropertyDetail & {
	tenantDetails: Array<{
		propertyTenant: PropertyDetail["tenants"][0];
		tenant: typeof tenantEntities[0];
	}>;
}) | null {
	const property = enhancedPropertyDetails[propertyId];
	if (!property) return null;

	const tenantDetails = property.tenants.map((pt) => {
		const tenant = tenantEntities.find((t) => t.id === pt.tenantId);
		if (!tenant) {
			// Return a placeholder if tenant not found
			return {
				propertyTenant: pt,
				tenant: {
					id: pt.tenantId,
					name: "Unknown",
					email: "",
					phone: "",
					status: "inactive" as const,
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
				},
			};
		}
		return {
			propertyTenant: pt,
			tenant: tenant,
		};
	});

	return {
		...property,
		tenantDetails,
	};
}

