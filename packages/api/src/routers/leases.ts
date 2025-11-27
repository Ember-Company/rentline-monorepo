import prisma from "@rentline/db";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../index";

const leaseStatusEnum = z.enum([
	"draft",
	"pending",
	"active",
	"expired",
	"terminated",
]);
const leaseTypeEnum = z.enum(["fixed", "month_to_month", "annual"]);

const leaseInputSchema = z.object({
	// Property/Unit - one is required
	propertyId: z.string().optional(),
	unitId: z.string().optional(),
	// Tenant
	tenantContactId: z.string(),
	// Lease terms
	leaseType: leaseTypeEnum.default("fixed"),
	startDate: z.string(), // ISO date string
	endDate: z.string().optional(),
	moveInDate: z.string().optional(),
	moveOutDate: z.string().optional(),
	// Financial
	rentAmount: z.number().positive("Rent amount must be positive"),
	depositAmount: z.number().optional(),
	currencyId: z.string(),
	paymentDueDay: z.number().int().min(1).max(28).default(1),
	// Late fees
	lateFeeType: z.enum(["percentage", "fixed"]).optional(),
	lateFeeAmount: z.number().optional(),
	lateFeePercentage: z.number().optional(),
	gracePeriodDays: z.number().int().optional(),
	// Additional fees
	petDeposit: z.number().optional(),
	securityDeposit: z.number().optional(),
	lastMonthRent: z.number().optional(),
	// Status
	status: leaseStatusEnum.default("draft"),
	terms: z.string().optional(),
	notes: z.string().optional(),
	// Renewal
	autoRenew: z.boolean().default(false),
	renewalNoticeDays: z.number().int().optional(),
	// Notification
	notificationChannel: z.enum(["email", "sms", "both"]).optional(),
});

// Helper to get user's organization
async function getUserOrganization(userId: string) {
	return await prisma.member.findFirst({
		where: { userId },
	});
}

export const leasesRouter = router({
	// List leases with filtering
	list: protectedProcedure
		.input(
			z
				.object({
					propertyId: z.string().optional(),
					unitId: z.string().optional(),
					tenantContactId: z.string().optional(),
					status: leaseStatusEnum.optional(),
					search: z.string().optional(),
					includeExpired: z.boolean().default(false),
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

			const member = await getUserOrganization(ctx.session.user.id);
			if (!member) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "User is not a member of any organization",
				});
			}

			// Build complex where clause
			const where: Parameters<typeof prisma.lease.findMany>[0]["where"] = {
				OR: [
					{ property: { organizationId: member.organizationId } },
					{ unit: { property: { organizationId: member.organizationId } } },
				],
			};

			if (input?.propertyId) {
				where.propertyId = input.propertyId;
			}

			if (input?.unitId) {
				where.unitId = input.unitId;
			}

			if (input?.tenantContactId) {
				where.tenantContactId = input.tenantContactId;
			}

			if (input?.status) {
				where.status = input.status;
			} else if (!input?.includeExpired) {
				where.status = { notIn: ["expired", "terminated"] };
			}

			const [leases, total] = await Promise.all([
				prisma.lease.findMany({
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
						unit: {
							select: {
								id: true,
								unitNumber: true,
								name: true,
								property: {
									select: {
										id: true,
										name: true,
										address: true,
									},
								},
							},
						},
						tenantContact: {
							select: {
								id: true,
								firstName: true,
								lastName: true,
								email: true,
								phone: true,
							},
						},
						currency: true,
						_count: {
							select: {
								payments: true,
								maintenanceRequests: true,
							},
						},
					},
					orderBy: { startDate: "desc" },
					take: input?.limit ?? 50,
					skip: input?.offset ?? 0,
				}),
				prisma.lease.count({ where }),
			]);

			// Calculate payment stats for each lease
			const leasesWithStats = await Promise.all(
				leases.map(async (lease) => {
					const payments = await prisma.payment.aggregate({
						where: { leaseId: lease.id, status: "completed" },
						_sum: { amount: true },
						_count: true,
					});

					return {
						...lease,
						totalPaid: Number(payments._sum.amount || 0),
						paymentCount: payments._count,
					};
				}),
			);

			return {
				leases: leasesWithStats,
				total,
				hasMore: (input?.offset ?? 0) + leases.length < total,
			};
		}),

	// Get single lease with full details
	getById: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			if (!ctx.session?.user?.id) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "User not authenticated",
				});
			}

			const member = await getUserOrganization(ctx.session.user.id);
			if (!member) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "User is not a member of any organization",
				});
			}

			const lease = await prisma.lease.findFirst({
				where: {
					id: input.id,
					OR: [
						{ property: { organizationId: member.organizationId } },
						{ unit: { property: { organizationId: member.organizationId } } },
					],
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
					unit: {
						select: {
							id: true,
							unitNumber: true,
							name: true,
							bedrooms: true,
							bathrooms: true,
							area: true,
							property: {
								select: {
									id: true,
									name: true,
									address: true,
								},
							},
						},
					},
					tenantContact: true,
					currency: true,
					preferredPaymentMethod: true,
					payments: {
						orderBy: { date: "desc" },
						include: {
							currency: true,
							paymentMethod: true,
						},
					},
					invoices: {
						orderBy: { dueDate: "desc" },
						include: {
							currency: true,
						},
					},
					maintenanceRequests: {
						orderBy: { createdAt: "desc" },
						take: 10,
					},
					documents: {
						orderBy: { uploadedAt: "desc" },
					},
				},
			});

			if (!lease) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Lease not found",
				});
			}

			// Calculate payment stats
			const totalPaid = lease.payments
				.filter((p) => p.status === "completed")
				.reduce((sum, p) => sum + Number(p.amount), 0);

			const totalDue = lease.invoices
				.filter((i) => i.status === "pending" || i.status === "overdue")
				.reduce((sum, i) => sum + Number(i.amount), 0);

			return {
				lease: {
					...lease,
					totalPaid,
					totalDue,
					balance: totalDue - totalPaid,
				},
			};
		}),

	// Create lease
	create: protectedProcedure
		.input(leaseInputSchema)
		.mutation(async ({ ctx, input }) => {
			if (!ctx.session?.user?.id) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "User not authenticated",
				});
			}

			const member = await getUserOrganization(ctx.session.user.id);
			if (!member) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "User is not a member of any organization",
				});
			}

			// Validate that either propertyId or unitId is provided
			if (!input.propertyId && !input.unitId) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Either propertyId or unitId is required",
				});
			}

			// Verify property/unit belongs to organization
			if (input.unitId) {
				const unit = await prisma.unit.findFirst({
					where: {
						id: input.unitId,
						property: { organizationId: member.organizationId },
					},
					include: {
						leases: {
							where: { status: "active" },
						},
					},
				});

				if (!unit) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Unit not found",
					});
				}

				// Check for existing active lease on unit
				if (unit.leases.length > 0 && input.status === "active") {
					throw new TRPCError({
						code: "CONFLICT",
						message: "This unit already has an active lease",
					});
				}
			} else if (input.propertyId) {
				const property = await prisma.property.findFirst({
					where: {
						id: input.propertyId,
						organizationId: member.organizationId,
					},
					include: {
						leases: {
							where: { status: "active", unitId: null },
						},
					},
				});

				if (!property) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Property not found",
					});
				}

				// Check for existing active lease on property (whole property)
				if (property.leases.length > 0 && input.status === "active") {
					throw new TRPCError({
						code: "CONFLICT",
						message: "This property already has an active lease",
					});
				}
			}

			// Verify tenant contact exists and belongs to organization
			const contact = await prisma.contact.findFirst({
				where: {
					id: input.tenantContactId,
					organizationId: member.organizationId,
				},
			});

			if (!contact) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Tenant contact not found",
				});
			}

			const lease = await prisma.lease.create({
				data: {
					propertyId: input.propertyId,
					unitId: input.unitId,
					tenantContactId: input.tenantContactId,
					leaseType: input.leaseType,
					startDate: new Date(input.startDate),
					endDate: input.endDate ? new Date(input.endDate) : null,
					moveInDate: input.moveInDate ? new Date(input.moveInDate) : null,
					moveOutDate: input.moveOutDate ? new Date(input.moveOutDate) : null,
					rentAmount: input.rentAmount,
					depositAmount: input.depositAmount,
					currencyId: input.currencyId,
					paymentDueDay: input.paymentDueDay,
					lateFeeType: input.lateFeeType,
					lateFeeAmount: input.lateFeeAmount,
					lateFeePercentage: input.lateFeePercentage,
					gracePeriodDays: input.gracePeriodDays,
					petDeposit: input.petDeposit,
					securityDeposit: input.securityDeposit,
					lastMonthRent: input.lastMonthRent,
					status: input.status,
					terms: input.terms,
					notes: input.notes,
					autoRenew: input.autoRenew,
					renewalNoticeDays: input.renewalNoticeDays,
					notificationChannel: input.notificationChannel,
				},
				include: {
					property: { select: { id: true, name: true } },
					unit: { select: { id: true, unitNumber: true } },
					tenantContact: true,
					currency: true,
				},
			});

			// Update unit status if applicable
			if (input.unitId && input.status === "active") {
				await prisma.unit.update({
					where: { id: input.unitId },
					data: { status: "occupied" },
				});
			}

			return { lease };
		}),

	// Update lease
	update: protectedProcedure
		.input(
			leaseInputSchema.partial().extend({
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

			const member = await getUserOrganization(ctx.session.user.id);
			if (!member) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "User is not a member of any organization",
				});
			}

			const existing = await prisma.lease.findFirst({
				where: {
					id: input.id,
					OR: [
						{ property: { organizationId: member.organizationId } },
						{ unit: { property: { organizationId: member.organizationId } } },
					],
				},
			});

			if (!existing) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Lease not found",
				});
			}

			const { id, startDate, endDate, moveInDate, moveOutDate, ...rest } =
				input;

			const lease = await prisma.lease.update({
				where: { id },
				data: {
					...rest,
					startDate: startDate ? new Date(startDate) : undefined,
					endDate: endDate ? new Date(endDate) : undefined,
					moveInDate: moveInDate ? new Date(moveInDate) : undefined,
					moveOutDate: moveOutDate ? new Date(moveOutDate) : undefined,
				},
				include: {
					property: { select: { id: true, name: true } },
					unit: { select: { id: true, unitNumber: true } },
					tenantContact: true,
					currency: true,
				},
			});

			// Update unit status if status changed
			if (input.status && existing.unitId) {
				if (input.status === "active") {
					await prisma.unit.update({
						where: { id: existing.unitId },
						data: { status: "occupied" },
					});
				} else if (
					input.status === "terminated" ||
					input.status === "expired"
				) {
					// Check if there are other active leases
					const otherActiveLeases = await prisma.lease.count({
						where: {
							unitId: existing.unitId,
							status: "active",
							id: { not: id },
						},
					});
					if (otherActiveLeases === 0) {
						await prisma.unit.update({
							where: { id: existing.unitId },
							data: { status: "available" },
						});
					}
				}
			}

			return { lease };
		}),

	// Delete lease
	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			if (!ctx.session?.user?.id) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "User not authenticated",
				});
			}

			const member = await getUserOrganization(ctx.session.user.id);
			if (!member) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "User is not a member of any organization",
				});
			}

			const existing = await prisma.lease.findFirst({
				where: {
					id: input.id,
					OR: [
						{ property: { organizationId: member.organizationId } },
						{ unit: { property: { organizationId: member.organizationId } } },
					],
				},
				include: {
					payments: true,
				},
			});

			if (!existing) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Lease not found",
				});
			}

			if (existing.status === "active" && existing.payments.length > 0) {
				throw new TRPCError({
					code: "CONFLICT",
					message:
						"Cannot delete active lease with payment history. Terminate it instead.",
				});
			}

			await prisma.lease.delete({
				where: { id: input.id },
			});

			// Update unit status if applicable
			if (existing.unitId && existing.status === "active") {
				await prisma.unit.update({
					where: { id: existing.unitId },
					data: { status: "available" },
				});
			}

			return { success: true };
		}),

	// Terminate lease
	terminate: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				moveOutDate: z.string().optional(),
				reason: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			if (!ctx.session?.user?.id) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "User not authenticated",
				});
			}

			const member = await getUserOrganization(ctx.session.user.id);
			if (!member) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "User is not a member of any organization",
				});
			}

			const existing = await prisma.lease.findFirst({
				where: {
					id: input.id,
					OR: [
						{ property: { organizationId: member.organizationId } },
						{ unit: { property: { organizationId: member.organizationId } } },
					],
				},
			});

			if (!existing) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Lease not found",
				});
			}

			const lease = await prisma.lease.update({
				where: { id: input.id },
				data: {
					status: "terminated",
					moveOutDate: input.moveOutDate
						? new Date(input.moveOutDate)
						: new Date(),
					notes: input.reason
						? `${existing.notes || ""}\n\nTermination reason: ${input.reason}`.trim()
						: existing.notes,
				},
			});

			// Update unit status
			if (existing.unitId) {
				await prisma.unit.update({
					where: { id: existing.unitId },
					data: { status: "available" },
				});
			}

			return { lease };
		}),

	// Renew lease
	renew: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				newEndDate: z.string(),
				newRentAmount: z.number().positive().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			if (!ctx.session?.user?.id) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "User not authenticated",
				});
			}

			const member = await getUserOrganization(ctx.session.user.id);
			if (!member) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "User is not a member of any organization",
				});
			}

			const existing = await prisma.lease.findFirst({
				where: {
					id: input.id,
					OR: [
						{ property: { organizationId: member.organizationId } },
						{ unit: { property: { organizationId: member.organizationId } } },
					],
				},
			});

			if (!existing) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Lease not found",
				});
			}

			// Create new lease starting from old end date
			const newStartDate = existing.endDate || new Date();
			const lease = await prisma.lease.create({
				data: {
					propertyId: existing.propertyId,
					unitId: existing.unitId,
					tenantContactId: existing.tenantContactId,
					leaseType: existing.leaseType,
					startDate: newStartDate,
					endDate: new Date(input.newEndDate),
					rentAmount: input.newRentAmount || existing.rentAmount,
					depositAmount: existing.depositAmount,
					currencyId: existing.currencyId,
					paymentDueDay: existing.paymentDueDay,
					lateFeeType: existing.lateFeeType,
					lateFeeAmount: existing.lateFeeAmount,
					lateFeePercentage: existing.lateFeePercentage,
					gracePeriodDays: existing.gracePeriodDays,
					autoRenew: existing.autoRenew,
					renewalNoticeDays: existing.renewalNoticeDays,
					notificationChannel: existing.notificationChannel,
					status: "active",
					terms: existing.terms,
					notes: `Renewed from lease ${existing.id}`,
				},
				include: {
					property: { select: { id: true, name: true } },
					unit: { select: { id: true, unitNumber: true } },
					tenantContact: true,
					currency: true,
				},
			});

			// Mark old lease as expired
			await prisma.lease.update({
				where: { id: input.id },
				data: { status: "expired" },
			});

			return { lease, previousLeaseId: input.id };
		}),

	// Get leases expiring soon
	getExpiringSoon: protectedProcedure
		.input(
			z
				.object({
					days: z.number().int().min(1).max(365).default(30),
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

			const member = await getUserOrganization(ctx.session.user.id);
			if (!member) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "User is not a member of any organization",
				});
			}

			const futureDate = new Date();
			futureDate.setDate(futureDate.getDate() + (input?.days ?? 30));

			const leases = await prisma.lease.findMany({
				where: {
					OR: [
						{ property: { organizationId: member.organizationId } },
						{ unit: { property: { organizationId: member.organizationId } } },
					],
					status: "active",
					endDate: {
						lte: futureDate,
						gte: new Date(),
					},
				},
				include: {
					property: { select: { id: true, name: true, address: true } },
					unit: { select: { id: true, unitNumber: true } },
					tenantContact: {
						select: { id: true, firstName: true, lastName: true, email: true },
					},
					currency: true,
				},
				orderBy: { endDate: "asc" },
			});

			return { leases };
		}),
});
