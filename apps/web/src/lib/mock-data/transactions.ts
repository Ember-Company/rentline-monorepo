export type Transaction = {
	id: number;
	property: string;
	tenant: string;
	amount: number;
	type: "rent" | "expense" | "deposit";
	status: "completed" | "pending" | "overdue";
	date: string;
};

export const recentTransactions: Transaction[] = [
	{
		id: 1,
		property: "123 Main St, Apt 2B",
		tenant: "John Smith",
		amount: 2500,
		type: "rent",
		status: "completed",
		date: "2024-01-15",
	},
	{
		id: 2,
		property: "456 Oak Ave, Unit 5",
		tenant: "Sarah Johnson",
		amount: 3200,
		type: "rent",
		status: "completed",
		date: "2024-01-14",
	},
	{
		id: 3,
		property: "789 Pine Rd",
		tenant: "Mike Davis",
		amount: 2800,
		type: "rent",
		status: "pending",
		date: "2024-01-16",
	},
	{
		id: 4,
		property: "321 Elm St, Apt 3A",
		tenant: "Emily Brown",
		amount: 2100,
		type: "rent",
		status: "overdue",
		date: "2024-01-10",
	},
	{
		id: 5,
		property: "654 Maple Dr",
		tenant: "David Wilson",
		amount: 3500,
		type: "rent",
		status: "completed",
		date: "2024-01-13",
	},
];

