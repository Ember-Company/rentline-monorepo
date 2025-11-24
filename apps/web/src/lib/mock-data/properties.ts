export type Property = {
	id: number;
	address: string;
	type: "Apartment" | "House" | "Condo";
	tenant: string | null;
	rent: number;
	status: "occupied" | "vacant" | "maintenance";
	occupancy: string;
	bedrooms?: number;
	bathrooms?: number;
	squareFeet?: number;
	dueDate?: string; // ISO date string
	isMultiUnit?: boolean;
	image?: string; // Property image URL
};

export const properties: Property[] = [
	{
		id: 1,
		address: "123 Main St, Apt 2B",
		type: "Apartment",
		tenant: "John Smith",
		rent: 2500,
		status: "occupied",
		occupancy: "100%",
		bedrooms: 2,
		bathrooms: 1,
		squareFeet: 850,
		dueDate: "2025-05-15",
		isMultiUnit: false,
		image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop",
	},
	{
		id: 2,
		address: "456 Oak Ave, Unit 5",
		type: "Condo",
		tenant: "Sarah Johnson",
		rent: 3200,
		status: "occupied",
		occupancy: "100%",
		bedrooms: 3,
		bathrooms: 2,
		squareFeet: 1200,
		dueDate: "2025-06-01",
		isMultiUnit: false,
		image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&h=300&fit=crop",
	},
	{
		id: 3,
		address: "789 Pine Rd",
		type: "House",
		tenant: "Mike Davis",
		rent: 2800,
		status: "occupied",
		occupancy: "100%",
		bedrooms: 3,
		bathrooms: 2,
		squareFeet: 1500,
		dueDate: "2025-05-20",
		isMultiUnit: false,
		image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop",
	},
	{
		id: 4,
		address: "321 Elm St, Apt 3A",
		type: "Apartment",
		tenant: "Emily Brown",
		rent: 2100,
		status: "occupied",
		occupancy: "100%",
		bedrooms: 1,
		bathrooms: 1,
		squareFeet: 650,
		dueDate: "2025-05-10",
		isMultiUnit: false,
		image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop",
	},
	{
		id: 5,
		address: "654 Maple Dr",
		type: "House",
		tenant: "David Wilson",
		rent: 3500,
		status: "occupied",
		occupancy: "100%",
		bedrooms: 4,
		bathrooms: 3,
		squareFeet: 2200,
		dueDate: "2025-06-15",
		isMultiUnit: true,
		image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=300&fit=crop",
	},
	{
		id: 6,
		address: "987 Cedar Ln, Unit 2",
		type: "Condo",
		tenant: null,
		rent: 2400,
		status: "vacant",
		occupancy: "0%",
		bedrooms: 2,
		bathrooms: 2,
		squareFeet: 950,
		isMultiUnit: false,
		image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop",
	},
];
