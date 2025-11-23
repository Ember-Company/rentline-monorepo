export type Tenant = {
	id: number;
	name: string;
	email: string;
	phone: string;
	property: string;
	rent: number;
	leaseStart: string;
	leaseEnd: string;
	status: "active" | "inactive" | "pending";
};

export const tenants: Tenant[] = [
	{
		id: 1,
		name: "John Smith",
		email: "john.smith@email.com",
		phone: "+1 (555) 123-4567",
		property: "123 Main St, Apt 2B",
		rent: 2500,
		leaseStart: "2023-06-01",
		leaseEnd: "2024-05-31",
		status: "active",
	},
	{
		id: 2,
		name: "Sarah Johnson",
		email: "sarah.j@email.com",
		phone: "+1 (555) 234-5678",
		property: "456 Oak Ave, Unit 5",
		rent: 3200,
		leaseStart: "2023-03-15",
		leaseEnd: "2024-03-14",
		status: "active",
	},
	{
		id: 3,
		name: "Mike Davis",
		email: "mike.davis@email.com",
		phone: "+1 (555) 345-6789",
		property: "789 Pine Rd",
		rent: 2800,
		leaseStart: "2023-09-01",
		leaseEnd: "2024-08-31",
		status: "active",
	},
	{
		id: 4,
		name: "Emily Brown",
		email: "emily.brown@email.com",
		phone: "+1 (555) 456-7890",
		property: "321 Elm St, Apt 3A",
		rent: 2100,
		leaseStart: "2023-11-01",
		leaseEnd: "2024-10-31",
		status: "active",
	},
	{
		id: 5,
		name: "David Wilson",
		email: "david.w@email.com",
		phone: "+1 (555) 567-8901",
		property: "654 Maple Dr",
		rent: 3500,
		leaseStart: "2023-01-01",
		leaseEnd: "2023-12-31",
		status: "active",
	},
];

