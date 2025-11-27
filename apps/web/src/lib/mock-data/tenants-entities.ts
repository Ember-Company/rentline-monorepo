// Tenant entities - separate from property relationships
export type TenantStatus = "active" | "inactive" | "pending";

export interface TenantEntity {
	id: string;
	name: string;
	email: string;
	phone: string;
	avatar?: string;
	status: TenantStatus;
	address?: string;
	city?: string;
	state?: string;
	postalCode?: string;
	country?: string;
	dateOfBirth?: string;
	emergencyContact?: {
		name: string;
		phone: string;
		relationship: string;
	};
	notes?: string;
	createdAt: string;
	updatedAt: string;
}

export const tenantEntities: TenantEntity[] = [
	{
		id: "tnt_1",
		name: "Bob Bobson",
		email: "danniell@pyxpayment.com",
		phone: "+1 (555) 123-4567",
		avatar: "BB",
		status: "active",
		address: "123 Main St",
		city: "San Francisco",
		state: "CA",
		postalCode: "94102",
		country: "USA",
		emergencyContact: {
			name: "Jane Bobson",
			phone: "+1 (555) 123-4568",
			relationship: "Spouse",
		},
		createdAt: "2024-01-15T00:00:00Z",
		updatedAt: "2024-01-15T00:00:00Z",
	},
	{
		id: "tnt_2",
		name: "John Smith",
		email: "john.smith@example.com",
		phone: "+1 (555) 234-5678",
		avatar: "JS",
		status: "active",
		address: "456 Oak Ave",
		city: "Los Angeles",
		state: "CA",
		postalCode: "90001",
		country: "USA",
		createdAt: "2024-02-01T00:00:00Z",
		updatedAt: "2024-02-01T00:00:00Z",
	},
	{
		id: "tnt_3",
		name: "Sarah Johnson",
		email: "sarah.j@example.com",
		phone: "+1 (555) 345-6789",
		avatar: "SJ",
		status: "active",
		address: "789 Pine Rd",
		city: "New York",
		state: "NY",
		postalCode: "10001",
		country: "USA",
		createdAt: "2024-02-15T00:00:00Z",
		updatedAt: "2024-02-15T00:00:00Z",
	},
	{
		id: "tnt_4",
		name: "Mike Davis",
		email: "mike.davis@example.com",
		phone: "+1 (555) 456-7890",
		avatar: "MD",
		status: "pending",
		address: "321 Elm St",
		city: "Chicago",
		state: "IL",
		postalCode: "60601",
		country: "USA",
		createdAt: "2024-03-01T00:00:00Z",
		updatedAt: "2024-03-01T00:00:00Z",
	},
	{
		id: "tnt_5",
		name: "Emily Brown",
		email: "emily.brown@example.com",
		phone: "+1 (555) 567-8901",
		avatar: "EB",
		status: "active",
		address: "654 Maple Dr",
		city: "Seattle",
		state: "WA",
		postalCode: "98101",
		country: "USA",
		createdAt: "2024-03-15T00:00:00Z",
		updatedAt: "2024-03-15T00:00:00Z",
	},
];
