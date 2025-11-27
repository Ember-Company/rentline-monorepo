import prisma from "@rentline/db";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../index";
import { getActiveOrganization } from "../utils/organization";

const invoiceStatusEnum = z.enum([
	"pending",
	"paid",
	"overdue",
	"cancelled",
	"partial",
]);

const invoiceInputSchema = z.object({
	leaseId: z.string(),
	dueDate: z.string(), // ISO date string
	amount: z.number().positive("Amount must be positive"),
	currencyId: z.string(),
	invoiceNumber: z.string().optional(),
	lineItems: z
		.array(
			z.object({
				description: z.string(),
				amount: z.number(),
				quantity: z.number().default(1),
			}),
		)
		.optional(),
	notes: z.string().optional(),
	status: invoiceStatusEnum.default("pending"),
});


// Generate next invoice number
async function generateInvoiceNumber(organizationId: string): Promise<string> {
	const year = new Date().getFullYear();
	const count = await prisma.invoice.count({
		where: {
			lease: {
				OR: [
					{ property: { organizationId } },
					{ unit: { property: { organizationId } } },
				],
			},
			issuedAt: {
				gte: new Date(year, 0, 1),
				lt: new Date(year + 1, 0, 1),
			},
		},
	});
	return `INV-${year}-${String(count + 1).padStart(5, "0")}`;
}

export const invoicesRouter = router({
	// List invoices with filtering
	list: protectedProcedure
		.input(
			z
				.object({
					leaseId: z.string().optional(),
					propertyId: z.string().optional(),
					status: invoiceStatusEnum.optional(),
					dueDateFrom: z.string().optional(),
					dueDateTo: z.string().optional(),
					includeOverdue: z.boolean().default(true),
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

			const where: Parameters<typeof prisma.invoice.findMany>[0]["where"] = {
				lease: {
					OR: [
						{ property: { organizationId: member.organizationId } },
						{ unit: { property: { organizationId: member.organizationId } } },
					],
				},
			};

			if (input?.leaseId) where.leaseId = input.leaseId;
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

			if (input?.dueDateFrom || input?.dueDateTo) {
				where.dueDate = {};
				if (input?.dueDateFrom) where.dueDate.gte = new Date(input.dueDateFrom);
				if (input?.dueDateTo) where.dueDate.lte = new Date(input.dueDateTo);
			}

			const [invoices, total, overdueCount, pendingTotal] = await Promise.all([
				prisma.invoice.findMany({
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
									select: {
										id: true,
										firstName: true,
										lastName: true,
										email: true,
									},
								},
							},
						},
						currency: true,
						payments: {
							select: { id: true, amount: true, status: true },
						},
					},
					orderBy: { dueDate: "asc" },
					take: input?.limit ?? 50,
					skip: input?.offset ?? 0,
				}),
				prisma.invoice.count({ where }),
				prisma.invoice.count({
					where: {
						...where,
						status: "overdue",
					},
				}),
				prisma.invoice.aggregate({
					where: {
						...where,
						status: { in: ["pending", "overdue"] },
					},
					_sum: { amount: true },
				}),
			]);

			return {
				invoices,
				total,
				overdueCount,
				pendingTotal: Number(pendingTotal._sum.amount || 0),
				hasMore: (input?.offset ?? 0) + invoices.length < total,
			};
		}),

	// Get single invoice
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

			const invoice = await prisma.invoice.findFirst({
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
					payments: {
						include: {
							currency: true,
							paymentMethod: true,
						},
						orderBy: { date: "desc" },
					},
				},
			});

			if (!invoice) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Invoice not found",
				});
			}

			return { invoice };
		}),

	// Create invoice
	create: protectedProcedure
		.input(invoiceInputSchema)
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

			const invoiceNumber =
				input.invoiceNumber ||
				(await generateInvoiceNumber(member.organizationId));

			const invoice = await prisma.invoice.create({
				data: {
					leaseId: input.leaseId,
					invoiceNumber,
					dueDate: new Date(input.dueDate),
					amount: input.amount,
					currencyId: input.currencyId,
					lineItems: input.lineItems ? JSON.stringify(input.lineItems) : null,
					notes: input.notes,
					status: input.status,
				},
				include: {
					lease: {
						select: {
							property: { select: { id: true, name: true } },
							unit: { select: { id: true, unitNumber: true } },
							tenantContact: { select: { firstName: true, lastName: true } },
						},
					},
					currency: true,
				},
			});

			return { invoice };
		}),

	// Generate recurring invoices for a lease
	generateRecurring: protectedProcedure
		.input(
			z.object({
				leaseId: z.string(),
				startDate: z.string(),
				endDate: z.string(),
				amount: z.number().positive(),
				description: z.string().default("Monthly Rent"),
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

			// Verify lease
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

			// Generate invoices for each month
			const start = new Date(input.startDate);
			const end = new Date(input.endDate);
			const invoices = [];

			const currentDate = new Date(start);
			currentDate.setDate(lease.paymentDueDay);

			while (currentDate <= end) {
				const invoiceNumber = await generateInvoiceNumber(
					member.organizationId,
				);
				const invoice = await prisma.invoice.create({
					data: {
						leaseId: input.leaseId,
						invoiceNumber,
						dueDate: new Date(currentDate),
						amount: input.amount,
						currencyId: lease.currencyId,
						lineItems: JSON.stringify([
							{
								description: input.description,
								amount: input.amount,
								quantity: 1,
							},
						]),
						status: "pending",
					},
				});
				invoices.push(invoice);

				// Move to next month
				currentDate.setMonth(currentDate.getMonth() + 1);
			}

			return { invoices, count: invoices.length };
		}),

	// Update invoice
	update: protectedProcedure
		.input(
			invoiceInputSchema.partial().extend({
				id: z.string(),
				paidAmount: z.number().optional(),
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

			const existing = await prisma.invoice.findFirst({
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
					message: "Invoice not found",
				});
			}

			const { id, dueDate, lineItems, leaseId, ...rest } = input;

			const invoice = await prisma.invoice.update({
				where: { id },
				data: {
					...rest,
					dueDate: dueDate ? new Date(dueDate) : undefined,
					lineItems: lineItems ? JSON.stringify(lineItems) : undefined,
				},
				include: {
					lease: {
						select: {
							property: { select: { id: true, name: true } },
							unit: { select: { id: true, unitNumber: true } },
						},
					},
					currency: true,
				},
			});

			return { invoice };
		}),

	// Mark invoice as paid
	markAsPaid: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				paymentMethodId: z.string().optional(),
				reference: z.string().optional(),
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

			const existing = await prisma.invoice.findFirst({
				where: {
					id: input.id,
					lease: {
						OR: [
							{ property: { organizationId: member.organizationId } },
							{ unit: { property: { organizationId: member.organizationId } } },
						],
					},
				},
				include: { lease: true },
			});

			if (!existing) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Invoice not found",
				});
			}

			// Create payment and update invoice in transaction
			const result = await prisma.$transaction(async (tx) => {
				const payment = await tx.payment.create({
					data: {
						leaseId: existing.leaseId,
						invoiceId: existing.id,
						amount: existing.amount,
						currencyId: existing.currencyId,
						paymentMethodId: input.paymentMethodId,
						type: "rent",
						status: "completed",
						date: new Date(),
						reference: input.reference,
					},
				});

				const invoice = await tx.invoice.update({
					where: { id: input.id },
					data: {
						status: "paid",
						paidAmount: existing.amount,
						paidAt: new Date(),
					},
				});

				return { invoice, payment };
			});

			return result;
		}),

	// Delete invoice
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

			const existing = await prisma.invoice.findFirst({
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
					message: "Invoice not found",
				});
			}

			if (existing.status === "paid") {
				throw new TRPCError({
					code: "CONFLICT",
					message: "Cannot delete paid invoice",
				});
			}

			await prisma.invoice.delete({
				where: { id: input.id },
			});

			return { success: true };
		}),

	// Update overdue invoices
	updateOverdue: protectedProcedure.mutation(async ({ ctx }) => {
		if (!ctx.session?.user?.id) {
			throw new TRPCError({
				code: "UNAUTHORIZED",
				message: "User not authenticated",
			});
		}

		const member = await getActiveOrganization(ctx);
		if (!member) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "User is not a member of any organization",
			});
		}

		const result = await prisma.invoice.updateMany({
			where: {
				lease: {
					OR: [
						{ property: { organizationId: member.organizationId } },
						{ unit: { property: { organizationId: member.organizationId } } },
					],
				},
				status: "pending",
				dueDate: { lt: new Date() },
			},
			data: {
				status: "overdue",
			},
		});

		return { updatedCount: result.count };
	}),
});
