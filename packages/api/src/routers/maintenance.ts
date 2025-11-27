import prisma from "@rentline/db";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../index";
import { getActiveOrganization } from "../utils/organization";

const maintenanceStatusEnum = z.enum(["open", "in_progress", "closed"]);
const maintenancePriorityEnum = z.enum(["low", "medium", "high", "urgent"]);

const maintenanceInputSchema = z.object({
	unitId: z.string(),
	leaseId: z.string().optional(),
	title: z.string().min(1, "Title is required"),
	description: z.string().optional(),
	priority: maintenancePriorityEnum.default("medium"),
	assignedTo: z.string().optional(),
});


export const maintenanceRouter = router({
	// List maintenance requests
	list: protectedProcedure
		.input(
			z
				.object({
					propertyId: z.string().optional(),
					unitId: z.string().optional(),
					status: maintenanceStatusEnum.optional(),
					priority: maintenancePriorityEnum.optional(),
					assignedTo: z.string().optional(),
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

			const where: Parameters<
				typeof prisma.maintenanceRequest.findMany
			>[0]["where"] = {
				unit: { property: { organizationId: member.organizationId } },
			};

			if (input?.propertyId) {
				where.unit = { ...where.unit, propertyId: input.propertyId };
			}
			if (input?.unitId) where.unitId = input.unitId;
			if (input?.status) where.status = input.status;
			if (input?.priority) where.priority = input.priority;
			if (input?.assignedTo) where.assignedTo = input.assignedTo;

			const [requests, total] = await Promise.all([
				prisma.maintenanceRequest.findMany({
					where,
					include: {
						unit: {
							select: {
								id: true,
								unitNumber: true,
								property: {
									select: { id: true, name: true, address: true },
								},
							},
						},
						lease: {
							select: {
								id: true,
								tenantContact: {
									select: { id: true, firstName: true, lastName: true },
								},
							},
						},
						requester: {
							select: { id: true, name: true, email: true },
						},
						assignee: {
							select: { id: true, name: true, email: true },
						},
					},
					orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
					take: input?.limit ?? 50,
					skip: input?.offset ?? 0,
				}),
				prisma.maintenanceRequest.count({ where }),
			]);

			return {
				requests,
				total,
				hasMore: (input?.offset ?? 0) + requests.length < total,
			};
		}),

	// Get single maintenance request
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

			const request = await prisma.maintenanceRequest.findFirst({
				where: {
					id: input.id,
					unit: { property: { organizationId: member.organizationId } },
				},
				include: {
					unit: {
						select: {
							id: true,
							unitNumber: true,
							name: true,
							property: {
								select: { id: true, name: true, address: true },
							},
						},
					},
					lease: {
						select: {
							id: true,
							tenantContact: true,
						},
					},
					requester: {
						select: { id: true, name: true, email: true, phone: true },
					},
					assignee: {
						select: { id: true, name: true, email: true, phone: true },
					},
				},
			});

			if (!request) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Maintenance request not found",
				});
			}

			return { request };
		}),

	// Create maintenance request
	create: protectedProcedure
		.input(maintenanceInputSchema)
		.mutation(async ({ ctx, input }) => {
			if (!ctx.session?.user?.id) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "User not authenticated",
				});
			}

			const member = await getActiveOrganization(ctx);

			// Verify unit belongs to organization
			const unit = await prisma.unit.findFirst({
				where: {
					id: input.unitId,
					property: { organizationId: member.organizationId },
				},
			});

			if (!unit) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Unit not found",
				});
			}

			const request = await prisma.maintenanceRequest.create({
				data: {
					unitId: input.unitId,
					leaseId: input.leaseId,
					requestedBy: ctx.session.user.id,
					title: input.title,
					description: input.description,
					priority: input.priority,
					assignedTo: input.assignedTo,
					status: "open",
				},
				include: {
					unit: {
						select: {
							id: true,
							unitNumber: true,
							property: { select: { id: true, name: true } },
						},
					},
					requester: { select: { id: true, name: true } },
					assignee: { select: { id: true, name: true } },
				},
			});

			return { request };
		}),

	// Update maintenance request
	update: protectedProcedure
		.input(
			maintenanceInputSchema.partial().extend({
				id: z.string(),
				status: maintenanceStatusEnum.optional(),
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

			const existing = await prisma.maintenanceRequest.findFirst({
				where: {
					id: input.id,
					unit: { property: { organizationId: member.organizationId } },
				},
			});

			if (!existing) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Maintenance request not found",
				});
			}

			const { id, unitId, ...rest } = input;

			const request = await prisma.maintenanceRequest.update({
				where: { id },
				data: rest,
				include: {
					unit: {
						select: {
							id: true,
							unitNumber: true,
							property: { select: { id: true, name: true } },
						},
					},
					requester: { select: { id: true, name: true } },
					assignee: { select: { id: true, name: true } },
				},
			});

			return { request };
		}),

	// Delete maintenance request
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

			const existing = await prisma.maintenanceRequest.findFirst({
				where: {
					id: input.id,
					unit: { property: { organizationId: member.organizationId } },
				},
			});

			if (!existing) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Maintenance request not found",
				});
			}

			await prisma.maintenanceRequest.delete({
				where: { id: input.id },
			});

			return { success: true };
		}),

	// Get maintenance stats
	getStats: protectedProcedure
		.input(
			z
				.object({
					propertyId: z.string().optional(),
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

			const baseWhere: Parameters<
				typeof prisma.maintenanceRequest.findMany
			>[0]["where"] = {
				unit: { property: { organizationId: member.organizationId } },
			};

			if (input?.propertyId) {
				baseWhere.unit = { ...baseWhere.unit, propertyId: input.propertyId };
			}

			const [open, inProgress, closed, urgent] = await Promise.all([
				prisma.maintenanceRequest.count({
					where: { ...baseWhere, status: "open" },
				}),
				prisma.maintenanceRequest.count({
					where: { ...baseWhere, status: "in_progress" },
				}),
				prisma.maintenanceRequest.count({
					where: { ...baseWhere, status: "closed" },
				}),
				prisma.maintenanceRequest.count({
					where: {
						...baseWhere,
						priority: "urgent",
						status: { not: "closed" },
					},
				}),
			]);

			return {
				stats: {
					open,
					inProgress,
					closed,
					urgent,
					total: open + inProgress + closed,
				},
			};
		}),

	// Assign maintenance request
	assign: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				assignedTo: z.string(),
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

			const existing = await prisma.maintenanceRequest.findFirst({
				where: {
					id: input.id,
					unit: { property: { organizationId: member.organizationId } },
				},
			});

			if (!existing) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Maintenance request not found",
				});
			}

			const request = await prisma.maintenanceRequest.update({
				where: { id: input.id },
				data: {
					assignedTo: input.assignedTo,
					status: "in_progress",
				},
				include: {
					assignee: { select: { id: true, name: true, email: true } },
				},
			});

			return { request };
		}),

	// Close maintenance request
	close: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				notes: z.string().optional(),
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

			const existing = await prisma.maintenanceRequest.findFirst({
				where: {
					id: input.id,
					unit: { property: { organizationId: member.organizationId } },
				},
			});

			if (!existing) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Maintenance request not found",
				});
			}

			const request = await prisma.maintenanceRequest.update({
				where: { id: input.id },
				data: {
					status: "closed",
					description: input.notes
						? `${existing.description || ""}\n\nResolution: ${input.notes}`.trim()
						: existing.description,
				},
			});

			return { request };
		}),
});
