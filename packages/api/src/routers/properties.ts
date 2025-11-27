import prisma from "@rentline/db";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../index";
import { getActiveOrganization } from "../utils/organization";

const propertyTypeEnum = z.enum([
	"apartment_building",
	"house",
	"office",
	"land",
]);
const propertyCategoryEnum = z.enum(["rent", "sale", "both"]);
const propertyStatusEnum = z.enum(["active", "inactive", "sold", "rented"]);

const propertyInputSchema = z.object({
	name: z.string().min(1, "Name is required"),
	type: propertyTypeEnum,
	category: propertyCategoryEnum.default("rent"),
	status: propertyStatusEnum.default("active"),
	// Location
	address: z.string().min(1, "Address is required"),
	city: z.string().optional(),
	state: z.string().optional(),
	postalCode: z.string().optional(),
	country: z.string().optional(),
	latitude: z.number().optional(),
	longitude: z.number().optional(),
	// Description
	description: z.string().optional(),
	features: z.array(z.string()).optional(),
	amenities: z.array(z.string()).optional(),
	// Physical
	totalArea: z.number().optional(),
	usableArea: z.number().optional(),
	lotSize: z.number().optional(),
	floors: z.number().int().optional(),
	yearBuilt: z.number().int().optional(),
	parkingSpaces: z.number().int().optional(),
	// For houses/single units
	bedrooms: z.number().int().optional(),
	bathrooms: z.number().optional(),
	// Financial
	purchasePrice: z.number().optional(),
	currentValue: z.number().optional(),
	askingPrice: z.number().optional(),
	monthlyRent: z.number().optional(),
	currencyId: z.string().optional(),
	// Images
	coverImage: z.string().optional(),
	images: z.array(z.string()).optional(),
});


export const propertiesRouter = router({
	// List properties with filtering
	list: protectedProcedure
		.input(
			z
				.object({
					type: propertyTypeEnum.optional(),
					category: propertyCategoryEnum.optional(),
					status: propertyStatusEnum.optional(),
					search: z.string().optional(),
					limit: z.number().int().min(1).max(100).default(50),
					offset: z.number().int().min(0).default(0),
				})
				.optional(),
		)
		.query(async ({ ctx, input }) => {
			const member = await getActiveOrganization(ctx);

			const where: {
				organizationId: string;
				type?: string;
				category?: string;
				status?: string;
				OR?: Array<{
					name?: { contains: string; mode: "insensitive" };
					address?: { contains: string; mode: "insensitive" };
					city?: { contains: string; mode: "insensitive" };
				}>;
			} = {
				organizationId: member.organizationId,
			};

			if (input?.type) where.type = input.type;
			if (input?.category) where.category = input.category;
			if (input?.status) where.status = input.status;

			if (input?.search) {
				where.OR = [
					{ name: { contains: input.search, mode: "insensitive" } },
					{ address: { contains: input.search, mode: "insensitive" } },
					{ city: { contains: input.search, mode: "insensitive" } },
				];
			}

			const [properties, total] = await Promise.all([
				prisma.property.findMany({
					where,
					include: {
						currency: true,
						units: {
							select: {
								id: true,
								unitNumber: true,
								status: true,
								rentAmount: true,
							},
						},
						leases: {
							where: { status: "active" },
							select: {
								id: true,
								status: true,
								rentAmount: true,
								tenantContact: {
									select: {
										id: true,
										firstName: true,
										lastName: true,
									},
								},
							},
						},
						_count: {
							select: {
								units: true,
								expenses: true,
								documents: true,
							},
						},
					},
					orderBy: { createdAt: "desc" },
					take: input?.limit ?? 50,
					skip: input?.offset ?? 0,
				}),
				prisma.property.count({ where }),
			]);

			// Transform properties to include computed fields
			const transformedProperties = properties.map((p) => ({
				...p,
				features: p.features ? JSON.parse(p.features) : [],
				amenities: p.amenities ? JSON.parse(p.amenities) : [],
				images: p.images ? JSON.parse(p.images) : [],
				unitCount: p._count.units,
				occupiedUnits: p.units.filter((u) => u.status === "occupied").length,
				vacantUnits: p.units.filter((u) => u.status === "available").length,
				activeLeases: p.leases.length,
			}));

			return {
				properties: transformedProperties,
				total,
				hasMore: (input?.offset ?? 0) + properties.length < total,
			};
		}),

	// Get single property with full details
	getById: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			const member = await getActiveOrganization(ctx);

			const property = await prisma.property.findFirst({
				where: {
					id: input.id,
					organizationId: member.organizationId,
				},
				include: {
					currency: true,
					landlord: {
						select: {
							id: true,
							name: true,
							email: true,
							image: true,
						},
					},
					units: {
						include: {
							currency: true,
							leases: {
								where: { status: "active" },
								include: {
									tenantContact: true,
								},
							},
							_count: {
								select: {
									maintenanceRequests: true,
								},
							},
						},
						orderBy: { unitNumber: "asc" },
					},
					leases: {
						include: {
							currency: true,
							tenantContact: true,
							payments: {
								orderBy: { date: "desc" },
								take: 10,
							},
						},
						orderBy: { startDate: "desc" },
					},
					expenses: {
						orderBy: { date: "desc" },
						take: 20,
						include: {
							currency: true,
						},
					},
					documents: {
						orderBy: { uploadedAt: "desc" },
					},
					contacts: {
						include: {
							contact: true,
						},
					},
				},
			});

			if (!property) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Property not found",
				});
			}

			return {
				property: {
					...property,
					features: property.features ? JSON.parse(property.features) : [],
					amenities: property.amenities ? JSON.parse(property.amenities) : [],
					images: property.images ? JSON.parse(property.images) : [],
				},
			};
		}),

	// Create property
	create: protectedProcedure
		.input(propertyInputSchema)
		.mutation(async ({ ctx, input }) => {
			const member = await getActiveOrganization(ctx);

			// Validate: land can only be for sale
			if (input.type === "land" && input.category === "rent") {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Land properties can only be for sale",
				});
			}

			const property = await prisma.property.create({
				data: {
					organizationId: member.organizationId,
					landlordId: ctx.session.user.id,
					name: input.name,
					type: input.type,
					category: input.category,
					status: input.status,
					address: input.address,
					city: input.city,
					state: input.state,
					postalCode: input.postalCode,
					country: input.country,
					latitude: input.latitude,
					longitude: input.longitude,
					description: input.description,
					features: input.features ? JSON.stringify(input.features) : null,
					amenities: input.amenities ? JSON.stringify(input.amenities) : null,
					totalArea: input.totalArea,
					usableArea: input.usableArea,
					lotSize: input.lotSize,
					floors: input.floors,
					yearBuilt: input.yearBuilt,
					parkingSpaces: input.parkingSpaces,
					bedrooms: input.bedrooms,
					bathrooms: input.bathrooms,
					purchasePrice: input.purchasePrice,
					currentValue: input.currentValue,
					askingPrice: input.askingPrice,
					monthlyRent: input.monthlyRent,
					currencyId: input.currencyId,
					coverImage: input.coverImage,
					images: input.images ? JSON.stringify(input.images) : null,
				},
				include: {
					currency: true,
				},
			});

			return { property };
		}),

	// Update property
	update: protectedProcedure
		.input(
			propertyInputSchema.partial().extend({
				id: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const member = await getActiveOrganization(ctx);

			// Verify property exists and belongs to organization
			const existing = await prisma.property.findFirst({
				where: {
					id: input.id,
					organizationId: member.organizationId,
				},
			});

			if (!existing) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Property not found",
				});
			}

			// Validate: land can only be for sale
			const finalType = input.type ?? existing.type;
			const finalCategory = input.category ?? existing.category;
			if (finalType === "land" && finalCategory === "rent") {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Land properties can only be for sale",
				});
			}

			const { id, features, amenities, images, ...rest } = input;

			const property = await prisma.property.update({
				where: { id },
				data: {
					...rest,
					features: features ? JSON.stringify(features) : undefined,
					amenities: amenities ? JSON.stringify(amenities) : undefined,
					images: images ? JSON.stringify(images) : undefined,
				},
				include: {
					currency: true,
				},
			});

			return { property };
		}),

	// Delete property
	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const member = await getActiveOrganization(ctx);

			const existing = await prisma.property.findFirst({
				where: {
					id: input.id,
					organizationId: member.organizationId,
				},
			});

			if (!existing) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Property not found",
				});
			}

			await prisma.property.delete({
				where: { id: input.id },
			});

			return { success: true };
		}),

	// Get property stats
	getStats: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			const member = await getActiveOrganization(ctx);

			const property = await prisma.property.findFirst({
				where: {
					id: input.id,
					organizationId: member.organizationId,
				},
				include: {
					units: true,
					leases: {
						where: { status: "active" },
						include: {
							payments: {
								where: { status: "completed" },
							},
						},
					},
					expenses: true,
				},
			});

			if (!property) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Property not found",
				});
			}

			const totalUnits = property.units.length;
			const occupiedUnits = property.units.filter(
				(u) => u.status === "occupied",
			).length;
			const totalRevenue = property.leases.reduce(
				(acc, l) =>
					acc + l.payments.reduce((pAcc, p) => pAcc + Number(p.amount), 0),
				0,
			);
			const totalExpenses = property.expenses.reduce(
				(acc, e) => acc + Number(e.amount),
				0,
			);

			return {
				stats: {
					totalUnits,
					occupiedUnits,
					vacantUnits: totalUnits - occupiedUnits,
					occupancyRate:
						totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0,
					activeLeases: property.leases.length,
					totalRevenue,
					totalExpenses,
					netIncome: totalRevenue - totalExpenses,
				},
			};
		}),
});
