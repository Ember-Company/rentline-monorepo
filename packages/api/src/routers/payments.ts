import prisma from "@rentline/db";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../index";
import { getActiveOrganization } from "../utils/organization";

const paymentTypeEnum = z.enum([
	"rent",
	"deposit",
	"fee",
	"refund",
	"pet_deposit",
	"security_deposit",
	"late_fee",
	"other",
]);
const paymentStatusEnum = z.enum([
	"pending",
	"completed",
	"failed",
	"refunded",
]);

const paymentInputSchema = z.object({
	leaseId: z.string(),
	amount: z.number().positive("Amount must be positive"),
	currencyId: z.string(),
	paymentMethodId: z.string().optional(),
	type: paymentTypeEnum,
	date: z.string().optional(), // ISO date string
	periodStart: z.string().optional(),
	periodEnd: z.string().optional(),
	reference: z.string().optional(),
	notes: z.string().optional(),
	status: paymentStatusEnum.default("completed"),
});


export const paymentsRouter = router({
	// List payments with filtering
	list: protectedProcedure
		.input(
			z
				.object({
					leaseId: z.string().optional(),
					propertyId: z.string().optional(),
					unitId: z.string().optional(),
					type: paymentTypeEnum.optional(),
					status: paymentStatusEnum.optional(),
					dateFrom: z.string().optional(),
					dateTo: z.string().optional(),
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

			const where: Parameters<typeof prisma.payment.findMany>[0]["where"] = {
				lease: {
					OR: [
						{ property: { organizationId: member.organizationId } },
						{ unit: { property: { organizationId: member.organizationId } } },
					],
				},
			};

			if (input?.leaseId) where.leaseId = input.leaseId;
			if (input?.type) where.type = input.type;
			if (input?.status) where.status = input.status;

			if (input?.propertyId) {
				where.lease = {
					...where.lease,
					OR: [
						{ propertyId: input.propertyId },
						{ unit: { propertyId: input.propertyId } },
					],
				};
			}

			if (input?.unitId) {
				where.lease = { ...where.lease, unitId: input.unitId };
			}

			if (input?.dateFrom || input?.dateTo) {
				where.date = {};
				if (input?.dateFrom) where.date.gte = new Date(input.dateFrom);
				if (input?.dateTo) where.date.lte = new Date(input.dateTo);
			}

			const [payments, total, aggregates] = await Promise.all([
				prisma.payment.findMany({
					where,
					include: {
						lease: {
							select: {
								id: true,
								property: { select: { id: true, name: true } },
								unit: {
									select: {
										id: true,
										unitNumber: true,
										property: { select: { id: true, name: true } },
									},
								},
								tenantContact: {
									select: { id: true, firstName: true, lastName: true },
								},
							},
						},
						currency: true,
						paymentMethod: true,
					},
					orderBy: { date: "desc" },
					take: input?.limit ?? 50,
					skip: input?.offset ?? 0,
				}),
				prisma.payment.count({ where }),
				prisma.payment.aggregate({
					where: { ...where, status: "completed" },
					_sum: { amount: true },
				}),
			]);

			return {
				payments,
				total,
				totalAmount: Number(aggregates._sum.amount || 0),
				hasMore: (input?.offset ?? 0) + payments.length < total,
			};
		}),

	// Get single payment
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

			const payment = await prisma.payment.findFirst({
				where: {
					id: input.id,
					lease: {
						OR: [
							{ property: { organizationId: member.organizationId } },
							{ unit: { property: { organizationId: member.organizationId } } },
						],
					},
				},
				include: {
					lease: {
						include: {
							property: { select: { id: true, name: true, address: true } },
							unit: {
								select: {
									id: true,
									unitNumber: true,
									property: { select: { id: true, name: true } },
								},
							},
							tenantContact: true,
						},
					},
					currency: true,
					paymentMethod: true,
					invoice: true,
				},
			});

			if (!payment) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Payment not found",
				});
			}

			return { payment };
		}),

	// Record payment
	create: protectedProcedure
		.input(paymentInputSchema)
		.mutation(async ({ ctx, input }) => {
			if (!ctx.session?.user?.id) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "User not authenticated",
				});
			}

			const member = await getActiveOrganization(ctx);

			// Verify lease belongs to organization
			const lease = await prisma.lease.findFirst({
				where: {
					id: input.leaseId,
					OR: [
						{ property: { organizationId: member.organizationId } },
						{ unit: { property: { organizationId: member.organizationId } } },
					],
				},
			});

			if (!lease) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Lease not found",
				});
			}

			const payment = await prisma.payment.create({
				data: {
					leaseId: input.leaseId,
					amount: input.amount,
					currencyId: input.currencyId,
					paymentMethodId: input.paymentMethodId,
					type: input.type,
					status: input.status,
					date: input.date ? new Date(input.date) : new Date(),
					periodStart: input.periodStart ? new Date(input.periodStart) : null,
					periodEnd: input.periodEnd ? new Date(input.periodEnd) : null,
					reference: input.reference,
					notes: input.notes,
				},
				include: {
					lease: {
						select: {
							id: true,
							property: { select: { id: true, name: true } },
							unit: { select: { id: true, unitNumber: true } },
							tenantContact: {
								select: { id: true, firstName: true, lastName: true },
							},
						},
					},
					currency: true,
					paymentMethod: true,
				},
			});

			return { payment };
		}),

	// Update payment
	update: protectedProcedure
		.input(
			paymentInputSchema.partial().extend({
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

			const existing = await prisma.payment.findFirst({
				where: {
					id: input.id,
					lease: {
						OR: [
							{ property: { organizationId: member.organizationId } },
							{ unit: { property: { organizationId: member.organizationId } } },
						],
					},
				},
			});

			if (!existing) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Payment not found",
				});
			}

			const { id, date, periodStart, periodEnd, leaseId, ...rest } = input;

			const payment = await prisma.payment.update({
				where: { id },
				data: {
					...rest,
					date: date ? new Date(date) : undefined,
					periodStart: periodStart ? new Date(periodStart) : undefined,
					periodEnd: periodEnd ? new Date(periodEnd) : undefined,
				},
				include: {
					lease: {
						select: {
							id: true,
							property: { select: { id: true, name: true } },
							unit: { select: { id: true, unitNumber: true } },
						},
					},
					currency: true,
					paymentMethod: true,
				},
			});

			return { payment };
		}),

	// Delete payment
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

			const existing = await prisma.payment.findFirst({
				where: {
					id: input.id,
					lease: {
						OR: [
							{ property: { organizationId: member.organizationId } },
							{ unit: { property: { organizationId: member.organizationId } } },
						],
					},
				},
			});

			if (!existing) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Payment not found",
				});
			}

			await prisma.payment.delete({
				where: { id: input.id },
			});

			return { success: true };
		}),

	// Get payment summary/stats
	getSummary: protectedProcedure
		.input(
			z
				.object({
					leaseId: z.string().optional(),
					propertyId: z.string().optional(),
					year: z.number().int().optional(),
					month: z.number().int().min(1).max(12).optional(),
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

			const baseWhere: Parameters<typeof prisma.payment.findMany>[0]["where"] =
				{
					status: "completed",
					lease: {
						OR: [
							{ property: { organizationId: member.organizationId } },
							{ unit: { property: { organizationId: member.organizationId } } },
						],
					},
				};

			if (input?.leaseId) baseWhere.leaseId = input.leaseId;
			if (input?.propertyId) {
				baseWhere.lease = {
					...baseWhere.lease,
					OR: [
						{ propertyId: input.propertyId },
						{ unit: { propertyId: input.propertyId } },
					],
				};
			}

			// Date filters
			let dateFilter: { gte?: Date; lte?: Date } | undefined;
			if (input?.year) {
				const startDate = new Date(input.year, (input.month ?? 1) - 1, 1);
				const endDate = input.month
					? new Date(input.year, input.month, 0)
					: new Date(input.year, 11, 31);
				dateFilter = { gte: startDate, lte: endDate };
			}

			// Get totals by type
			const [
				totalRent,
				totalDeposits,
				totalFees,
				totalRefunds,
				recentPayments,
			] = await Promise.all([
				prisma.payment.aggregate({
					where: { ...baseWhere, type: "rent", date: dateFilter },
					_sum: { amount: true },
					_count: true,
				}),
				prisma.payment.aggregate({
					where: {
						...baseWhere,
						type: { in: ["deposit", "security_deposit", "pet_deposit"] },
						date: dateFilter,
					},
					_sum: { amount: true },
					_count: true,
				}),
				prisma.payment.aggregate({
					where: {
						...baseWhere,
						type: { in: ["fee", "late_fee"] },
						date: dateFilter,
					},
					_sum: { amount: true },
					_count: true,
				}),
				prisma.payment.aggregate({
					where: { ...baseWhere, type: "refund", date: dateFilter },
					_sum: { amount: true },
					_count: true,
				}),
				prisma.payment.findMany({
					where: baseWhere,
					orderBy: { date: "desc" },
					take: 5,
					include: {
						lease: {
							select: {
								tenantContact: { select: { firstName: true, lastName: true } },
								property: { select: { name: true } },
								unit: { select: { unitNumber: true } },
							},
						},
						currency: true,
					},
				}),
			]);

			return {
				summary: {
					totalRent: Number(totalRent._sum.amount || 0),
					rentPayments: totalRent._count,
					totalDeposits: Number(totalDeposits._sum.amount || 0),
					depositPayments: totalDeposits._count,
					totalFees: Number(totalFees._sum.amount || 0),
					feePayments: totalFees._count,
					totalRefunds: Number(totalRefunds._sum.amount || 0),
					refundPayments: totalRefunds._count,
					netTotal:
						Number(totalRent._sum.amount || 0) +
						Number(totalDeposits._sum.amount || 0) +
						Number(totalFees._sum.amount || 0) -
						Number(totalRefunds._sum.amount || 0),
				},
				recentPayments,
			};
		}),

	// Get payment methods
	getPaymentMethods: protectedProcedure.query(async () => {
		const methods = await prisma.paymentMethod.findMany({
			orderBy: { name: "asc" },
		});
		return { methods };
	}),
});
