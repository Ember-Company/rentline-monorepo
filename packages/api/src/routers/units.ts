import prisma from "@rentline/db";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../index";
import { getActiveOrganization } from "../utils/organization";

const unitTypeEnum = z.enum([
	"apartment",
	"office",
	"retail",
	"storage",
	"parking",
]);
const unitStatusEnum = z.enum([
	"available",
	"occupied",
	"maintenance",
	"reserved",
]);

const unitInputSchema = z.object({
	propertyId: z.string(),
	unitNumber: z.string().min(1, "Unit number is required"),
	name: z.string().optional(),
	type: unitTypeEnum.default("apartment"),
	floor: z.number().int().optional(),
	// Physical
	bedrooms: z.number().int().optional(),
	bathrooms: z.number().optional(),
	area: z.number().optional(),
	// Financial
	rentAmount: z.number().optional(),
	depositAmount: z.number().optional(),
	currencyId: z.string().optional(),
	// Features
	features: z.array(z.string()).optional(),
	amenities: z.array(z.string()).optional(),
	description: z.string().optional(),
	// Images
	coverImage: z.string().optional(),
	images: z.array(z.string()).optional(),
	// Status
	status: unitStatusEnum.default("available"),
});


export const unitsRouter = router({
	// List units (optionally by property)
	list: protectedProcedure
		.input(
			z
				.object({
					propertyId: z.string().optional(),
					type: unitTypeEnum.optional(),
					status: unitStatusEnum.optional(),
					search: z.string().optional(),
					limit: z.number().int().min(1).max(100).default(50),
					offset: z.number().int().min(0).default(0),
				})
				.optional(),
		)
		.query(async ({ ctx, input }) => {
			if (!ctx.session?.user?.id) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "User not authenticated",
				});
			}

			const member = await getActiveOrganization(ctx);

			const where: {
				property: { organizationId: string };
				propertyId?: string;
				type?: string;
				status?: string;
				OR?: Array<{
					unitNumber?: { contains: string; mode: "insensitive" };
					name?: { contains: string; mode: "insensitive" };
				}>;
			} = {
				property: { organizationId: member.organizationId },
			};

			if (input?.propertyId) where.propertyId = input.propertyId;
			if (input?.type) where.type = input.type;
			if (input?.status) where.status = input.status;

			if (input?.search) {
				where.OR = [
					{ unitNumber: { contains: input.search, mode: "insensitive" } },
					{ name: { contains: input.search, mode: "insensitive" } },
				];
			}

			const [units, total] = await Promise.all([
				prisma.unit.findMany({
					where,
					include: {
						property: {
							select: {
								id: true,
								name: true,
								address: true,
								type: true,
							},
						},
						currency: true,
						leases: {
							where: { status: "active" },
							include: {
								tenantContact: {
									select: {
										id: true,
										firstName: true,
										lastName: true,
										email: true,
									},
								},
							},
						},
						_count: {
							select: {
								maintenanceRequests: true,
								expenses: true,
							},
						},
					},
					orderBy: [{ property: { name: "asc" } }, { unitNumber: "asc" }],
					take: input?.limit ?? 50,
					skip: input?.offset ?? 0,
				}),
				prisma.unit.count({ where }),
			]);

			const transformedUnits = units.map((u) => ({
				...u,
				features: u.features ? JSON.parse(u.features) : [],
				amenities: u.amenities ? JSON.parse(u.amenities) : [],
				images: u.images ? JSON.parse(u.images) : [],
				activeLease: u.leases[0] || null,
				tenant: u.leases[0]?.tenantContact || null,
			}));

			return {
				units: transformedUnits,
				total,
				hasMore: (input?.offset ?? 0) + units.length < total,
			};
		}),

	// Get single unit with full details
	getById: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			if (!ctx.session?.user?.id) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "User not authenticated",
				});
			}

			const member = await getActiveOrganization(ctx);

			const unit = await prisma.unit.findFirst({
				where: {
					id: input.id,
					property: { organizationId: member.organizationId },
				},
				include: {
					property: {
						select: {
							id: true,
							name: true,
							address: true,
							type: true,
							category: true,
						},
					},
					currency: true,
					leases: {
						include: {
							currency: true,
							tenantContact: true,
							payments: {
								orderBy: { date: "desc" },
								take: 20,
							},
						},
						orderBy: { startDate: "desc" },
					},
					maintenanceRequests: {
						orderBy: { createdAt: "desc" },
						take: 10,
					},
					expenses: {
						orderBy: { date: "desc" },
						take: 10,
						include: {
							currency: true,
						},
					},
					documents: {
						orderBy: { uploadedAt: "desc" },
					},
				},
			});

			if (!unit) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Unit not found",
				});
			}

			return {
				unit: {
					...unit,
					features: unit.features ? JSON.parse(unit.features) : [],
					amenities: unit.amenities ? JSON.parse(unit.amenities) : [],
					images: unit.images ? JSON.parse(unit.images) : [],
					activeLease: unit.leases.find((l) => l.status === "active") || null,
				},
			};
		}),

	// Create unit
	create: protectedProcedure
		.input(unitInputSchema)
		.mutation(async ({ ctx, input }) => {
			if (!ctx.session?.user?.id) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "User not authenticated",
				});
			}

			const member = await getActiveOrganization(ctx);

			// Verify property belongs to organization
			const property = await prisma.property.findFirst({
				where: {
					id: input.propertyId,
					organizationId: member.organizationId,
				},
			});

			if (!property) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Property not found",
				});
			}

			// Check for duplicate unit number
			const existingUnit = await prisma.unit.findFirst({
				where: {
					propertyId: input.propertyId,
					unitNumber: input.unitNumber,
				},
			});

			if (existingUnit) {
				throw new TRPCError({
					code: "CONFLICT",
					message: "A unit with this number already exists in this property",
				});
			}

			const unit = await prisma.unit.create({
				data: {
					propertyId: input.propertyId,
					unitNumber: input.unitNumber,
					name: input.name,
					type: input.type,
					floor: input.floor,
					bedrooms: input.bedrooms,
					bathrooms: input.bathrooms,
					area: input.area,
					rentAmount: input.rentAmount,
					depositAmount: input.depositAmount,
					currencyId: input.currencyId,
					features: input.features ? JSON.stringify(input.features) : null,
					amenities: input.amenities ? JSON.stringify(input.amenities) : null,
					description: input.description,
					coverImage: input.coverImage,
					images: input.images ? JSON.stringify(input.images) : null,
					status: input.status,
				},
				include: {
					property: {
						select: { id: true, name: true },
					},
					currency: true,
				},
			});

			return { unit };
		}),

	// Update unit
	update: protectedProcedure
		.input(
			unitInputSchema.partial().omit({ propertyId: true }).extend({
				id: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			if (!ctx.session?.user?.id) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "User not authenticated",
				});
			}

			const member = await getActiveOrganization(ctx);

			const existing = await prisma.unit.findFirst({
				where: {
					id: input.id,
					property: { organizationId: member.organizationId },
				},
			});

			if (!existing) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Unit not found",
				});
			}

			// Check for duplicate unit number if changing
			if (input.unitNumber && input.unitNumber !== existing.unitNumber) {
				const duplicate = await prisma.unit.findFirst({
					where: {
						propertyId: existing.propertyId,
						unitNumber: input.unitNumber,
						id: { not: input.id },
					},
				});

				if (duplicate) {
					throw new TRPCError({
						code: "CONFLICT",
						message: "A unit with this number already exists in this property",
					});
				}
			}

			const { id, features, amenities, images, ...rest } = input;

			const unit = await prisma.unit.update({
				where: { id },
				data: {
					...rest,
					features: features ? JSON.stringify(features) : undefined,
					amenities: amenities ? JSON.stringify(amenities) : undefined,
					images: images ? JSON.stringify(images) : undefined,
				},
				include: {
					property: {
						select: { id: true, name: true },
					},
					currency: true,
				},
			});

			return { unit };
		}),

	// Delete unit
	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			if (!ctx.session?.user?.id) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "User not authenticated",
				});
			}

			const member = await getActiveOrganization(ctx);

			const existing = await prisma.unit.findFirst({
				where: {
					id: input.id,
					property: { organizationId: member.organizationId },
				},
				include: {
					leases: { where: { status: "active" } },
				},
			});

			if (!existing) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Unit not found",
				});
			}

			if (existing.leases.length > 0) {
				throw new TRPCError({
					code: "CONFLICT",
					message: "Cannot delete unit with active leases",
				});
			}

			await prisma.unit.delete({
				where: { id: input.id },
			});

			return { success: true };
		}),

	// Bulk create units (useful for apartment buildings)
	bulkCreate: protectedProcedure
		.input(
			z.object({
				propertyId: z.string(),
				units: z.array(
					z.object({
						unitNumber: z.string(),
						name: z.string().optional(),
						type: unitTypeEnum.default("apartment"),
						floor: z.number().int().optional(),
						bedrooms: z.number().int().optional(),
						bathrooms: z.number().optional(),
						area: z.number().optional(),
						rentAmount: z.number().optional(),
						depositAmount: z.number().optional(),
					}),
				),
				currencyId: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			if (!ctx.session?.user?.id) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "User not authenticated",
				});
			}

			const member = await getActiveOrganization(ctx);

			const property = await prisma.property.findFirst({
				where: {
					id: input.propertyId,
					organizationId: member.organizationId,
				},
			});

			if (!property) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Property not found",
				});
			}

			const units = await prisma.unit.createMany({
				data: input.units.map((u) => ({
					propertyId: input.propertyId,
					currencyId: input.currencyId,
					...u,
				})),
				skipDuplicates: true,
			});

			return { count: units.count };
		}),

	// Update unit status
	updateStatus: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				status: unitStatusEnum,
			}),
		)
		.mutation(async ({ ctx, input }) => {
			if (!ctx.session?.user?.id) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "User not authenticated",
				});
			}

			const member = await getActiveOrganization(ctx);

			const existing = await prisma.unit.findFirst({
				where: {
					id: input.id,
					property: { organizationId: member.organizationId },
				},
			});

			if (!existing) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Unit not found",
				});
			}

			const unit = await prisma.unit.update({
				where: { id: input.id },
				data: { status: input.status },
			});

			return { unit };
		}),
});
