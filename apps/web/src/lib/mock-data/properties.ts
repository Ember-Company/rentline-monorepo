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
	},
];

