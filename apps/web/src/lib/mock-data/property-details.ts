export type PropertyDetail = {
	id: number;
	name: string;
	address: string;
	city: string;
	state: string;
	postalCode: string;
	country: string;
	status: "occupied" | "vacant" | "maintenance" | "on-rent";
	type: "Apartment" | "House" | "Condo";
	rent: number;
	squareFeet: number;
	price: number;
	bedrooms?: number;
	bathrooms?: number;
	listedOn: string;
	lastUpdate: string;
	description?: string;
	amenities: string[];
	images: string[];
	coordinates: {
		lat: number;
		lng: number;
	};
	rating: {
		overall: number;
		totalReviews: number;
		breakdown: {
			comfortness: number;
			cleanliness: number;
			facilities: number;
			complains: number;
		};
	};
	agent: {
		name: string;
		title: string;
		email: string;
		phone: string;
		avatar?: string;
	};
	schedules: Array<{
		type: "site-visit" | "payment" | "maintenance";
		date: string;
		time: string;
		location?: string;
		tenant?: string;
		tenantAvatar?: string;
	}>;
	revenue: {
		period: string;
		data: Array<{
			month: string;
			income: number;
			expense: number;
			revenue: number;
		}>;
	};
	payments: Array<{
		id: string;
		date: string;
		category: string;
		period: string;
		tenant: string;
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
	tenants: Array<{
		id: string;
		name: string;
		email: string;
		phone: string;
		avatar?: string;
		status: "accepted" | "pending" | "rejected";
		leaseStart: string;
		leaseEnd: string;
		unit?: string;
	}>;
	units: Array<{
		id: string;
		number: string;
		type: string;
		squareFeet: number;
		bedrooms: number;
		bathrooms: number;
		rent: number;
		status: "occupied" | "vacant" | "maintenance";
		tenant?: string;
	}>;
	tickets: Array<{
		id: string;
		title: string;
		description: string;
		status: "open" | "in-progress" | "resolved" | "closed";
		priority: "low" | "medium" | "high" | "urgent";
		createdAt: string;
		updatedAt: string;
		tenant?: string;
	}>;
};

export const propertyDetails: Record<number, PropertyDetail> = {
	1: {
		id: 1,
		name: "Peaceful Retreat Space",
		address: "1234 Baker Street",
		city: "San Francisco",
		state: "CA",
		postalCode: "94102",
		country: "USA",
		status: "on-rent",
		type: "Apartment",
		rent: 1200,
		squareFeet: 105000,
		price: 690000,
		bedrooms: 2,
		bathrooms: 1,
		listedOn: "2022-01-11",
		lastUpdate: "2024-05-24",
		description:
			"A beautiful apartment complex in the heart of San Francisco with modern amenities and excellent location.",
		amenities: [
			"Free street parking",
			"24h electricity",
			"Fire extinguisher",
			"Home security",
			"Quiet surrounding",
			"Garden",
			"Free swimmingpool",
			"Kids playzone",
			"Party center",
			"See facing apartments",
		],
		images: [],
		coordinates: {
			lat: 37.7749,
			lng: -122.4194,
		},
		rating: {
			overall: 4.0,
			totalReviews: 500,
			breakdown: {
				comfortness: 4.5,
				cleanliness: 4.8,
				facilities: 4.0,
				complains: 4.7,
			},
		},
		agent: {
			name: "David Zain",
			title: "Real-estate Agent",
			email: "david.zain@example.com",
			phone: "+1 (555) 123-4567",
		},
		schedules: [
			{
				type: "site-visit",
				date: "2024-05-05",
				time: "12:00 PM - 1:00 PM",
				location: "Happy Lagoon Farm, 1234 Baker Street, San Francisco",
			},
			{
				type: "payment",
				date: "2024-05-05",
				time: "12:00 PM - 1:00 PM",
				tenant: "Regina Denin",
			},
		],
		revenue: {
			period: "This year",
			data: [
				{ month: "Jan", income: 25000, expense: 15000, revenue: 10000 },
				{ month: "Feb", income: 28000, expense: 16000, revenue: 12000 },
				{ month: "Mar", income: 30000, expense: 17000, revenue: 13000 },
				{ month: "Apr", income: 32000, expense: 18000, revenue: 14000 },
				{ month: "May", income: 35000, expense: 20000, revenue: 15000 },
				{ month: "Jun", income: 33000, expense: 19000, revenue: 14000 },
				{ month: "Jul", income: 36000, expense: 21000, revenue: 15000 },
			],
		},
		payments: [
			{
				id: "1",
				date: "2025-04-14",
				category: "Rent",
				period: "15 Apr 2025",
				tenant: "John Smith",
				status: "paid",
				amount: 600,
			},
			{
				id: "2",
				date: "2025-03-14",
				category: "Rent",
				period: "15 Mar 2025",
				tenant: "John Smith",
				status: "paid",
				amount: 600,
			},
			{
				id: "3",
				date: "2025-05-15",
				category: "Rent",
				period: "15 May 2025",
				tenant: "John Smith",
				notes: "Overdue",
				status: "overdue",
				amount: 600,
			},
		],
		expenses: [
			{
				id: "1",
				date: "2025-04-20",
				category: "Maintenance",
				description: "HVAC repair",
				vendor: "ABC Services",
				amount: 450,
				status: "paid",
			},
			{
				id: "2",
				date: "2025-04-15",
				category: "Utilities",
				description: "Water bill",
				amount: 120,
				status: "paid",
			},
		],
		tenants: [
			{
				id: "1",
				name: "John Smith",
				email: "john.smith@example.com",
				phone: "+1 (555) 234-5678",
				status: "accepted",
				leaseStart: "2024-03-15",
				leaseEnd: "2025-03-15",
				unit: "2B",
			},
		],
		units: [
			{
				id: "1",
				number: "2B",
				type: "2 Bedroom",
				squareFeet: 850,
				bedrooms: 2,
				bathrooms: 1,
				rent: 2500,
				status: "occupied",
				tenant: "John Smith",
			},
			{
				id: "2",
				number: "3A",
				type: "3 Bedroom",
				squareFeet: 1200,
				bedrooms: 3,
				bathrooms: 2,
				rent: 3200,
				status: "occupied",
				tenant: "Sarah Johnson",
			},
			{
				id: "3",
				number: "1C",
				type: "1 Bedroom",
				squareFeet: 650,
				bedrooms: 1,
				bathrooms: 1,
				rent: 2100,
				status: "vacant",
			},
		],
		tickets: [
			{
				id: "1",
				title: "Leaky faucet in unit 2B",
				description: "Kitchen faucet is leaking and needs repair",
				status: "open",
				priority: "medium",
				createdAt: "2025-04-25",
				updatedAt: "2025-04-25",
				tenant: "John Smith",
			},
			{
				id: "2",
				title: "AC not working",
				description: "Air conditioning unit in unit 3A is not cooling properly",
				status: "in-progress",
				priority: "high",
				createdAt: "2025-04-20",
				updatedAt: "2025-04-22",
				tenant: "Sarah Johnson",
			},
		],
	},
	2: {
		id: 2,
		name: "Modern Downtown Loft",
		address: "456 Oak Avenue, Unit 5",
		city: "San Francisco",
		state: "CA",
		postalCode: "94103",
		country: "USA",
		status: "occupied",
		type: "Condo",
		rent: 3200,
		squareFeet: 1200,
		price: 850000,
		bedrooms: 3,
		bathrooms: 2,
		listedOn: "2022-02-15",
		lastUpdate: "2024-05-20",
		description: "Spacious modern condo in downtown with stunning city views.",
		amenities: [
			"Parking garage",
			"24h security",
			"Gym",
			"Rooftop terrace",
			"Concierge",
		],
		images: [],
		coordinates: {
			lat: 37.7849,
			lng: -122.4094,
		},
		rating: {
			overall: 4.5,
			totalReviews: 320,
			breakdown: {
				comfortness: 4.7,
				cleanliness: 4.9,
				facilities: 4.6,
				complains: 4.8,
			},
		},
		agent: {
			name: "Sarah Johnson",
			title: "Property Manager",
			email: "sarah.johnson@example.com",
			phone: "+1 (555) 234-5678",
		},
		schedules: [],
		revenue: {
			period: "This year",
			data: [
				{ month: "Jan", income: 3200, expense: 800, revenue: 2400 },
				{ month: "Feb", income: 3200, expense: 850, revenue: 2350 },
				{ month: "Mar", income: 3200, expense: 900, revenue: 2300 },
				{ month: "Apr", income: 3200, expense: 750, revenue: 2450 },
				{ month: "May", income: 3200, expense: 820, revenue: 2380 },
				{ month: "Jun", income: 3200, expense: 880, revenue: 2320 },
				{ month: "Jul", income: 3200, expense: 900, revenue: 2300 },
			],
		},
		payments: [
			{
				id: "1",
				date: "2025-04-15",
				category: "Rent",
				period: "15 Apr 2025",
				tenant: "Sarah Johnson",
				status: "paid",
				amount: 3200,
			},
		],
		expenses: [],
		tenants: [
			{
				id: "1",
				name: "Sarah Johnson",
				email: "sarah.johnson@example.com",
				phone: "+1 (555) 345-6789",
				status: "accepted",
				leaseStart: "2024-01-01",
				leaseEnd: "2025-01-01",
			},
		],
		units: [
			{
				id: "1",
				number: "Unit 5",
				type: "3 Bedroom",
				squareFeet: 1200,
				bedrooms: 3,
				bathrooms: 2,
				rent: 3200,
				status: "occupied",
				tenant: "Sarah Johnson",
			},
		],
		tickets: [],
	},
};
