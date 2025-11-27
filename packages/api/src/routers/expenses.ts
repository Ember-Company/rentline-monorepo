import prisma from "@rentline/db";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../index";

const expenseCategoryEnum = z.enum([
	"maintenance",
	"utilities",
	"tax",
	"insurance",
	"mortgage",
	"management",
	"repairs",
	"supplies",
	"advertising",
	"legal",
	"professional",
	"travel",
	"other",
]);

const expenseInputSchema = z.object({
	propertyId: z.string(),
	unitId: z.string().optional(),
	category: expenseCategoryEnum,
	subcategory: z.string().optional(),
	vendor: z.string().optional(),
	amount: z.number().positive("Amount must be positive"),
	currencyId: z.string(),
	date: z.string(), // ISO date string
	description: z.string().optional(),
	isRecurring: z.boolean().default(false),
	recurringFrequency: z.enum(["monthly", "quarterly", "annually"]).optional(),
	isTaxDeductible: z.boolean().default(false),
});

// Helper to get user's organization
async function getUserOrganization(userId: string) {
	return await prisma.member.findFirst({
		where: { userId },
	});
}

export const expensesRouter = router({
	// List expenses with filtering
	list: protectedProcedure
		.input(
			z
				.object({
					propertyId: z.string().optional(),
					unitId: z.string().optional(),
					category: expenseCategoryEnum.optional(),
					dateFrom: z.string().optional(),
					dateTo: z.string().optional(),
					isTaxDeductible: z.boolean().optional(),
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

			const where: Parameters<typeof prisma.expense.findMany>[0]["where"] = {
				property: { organizationId: member.organizationId },
			};

			if (input?.propertyId) where.propertyId = input.propertyId;
			if (input?.unitId) where.unitId = input.unitId;
			if (input?.category) where.category = input.category;
			if (input?.isTaxDeductible !== undefined)
				where.isTaxDeductible = input.isTaxDeductible;

			if (input?.dateFrom || input?.dateTo) {
				where.date = {};
				if (input?.dateFrom) where.date.gte = new Date(input.dateFrom);
				if (input?.dateTo) where.date.lte = new Date(input.dateTo);
			}

			const [expenses, total, aggregates] = await Promise.all([
				prisma.expense.findMany({
					where,
					include: {
						property: {
							select: { id: true, name: true, address: true },
						},
						unit: {
							select: { id: true, unitNumber: true },
						},
						currency: true,
						paidByUser: {
							select: { id: true, name: true },
						},
					},
					orderBy: { date: "desc" },
					take: input?.limit ?? 50,
					skip: input?.offset ?? 0,
				}),
				prisma.expense.count({ where }),
				prisma.expense.aggregate({
					where,
					_sum: { amount: true },
				}),
			]);

			return {
				expenses,
				total,
				totalAmount: Number(aggregates._sum.amount || 0),
				hasMore: (input?.offset ?? 0) + expenses.length < total,
			};
		}),

	// Get single expense
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

			const expense = await prisma.expense.findFirst({
				where: {
					id: input.id,
					property: { organizationId: member.organizationId },
				},
				include: {
					property: {
						select: { id: true, name: true, address: true },
					},
					unit: {
						select: { id: true, unitNumber: true },
					},
					currency: true,
					paidByUser: {
						select: { id: true, name: true, email: true },
					},
					receiptDocument: true,
				},
			});

			if (!expense) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Expense not found",
				});
			}

			return { expense };
		}),

	// Create expense
	create: protectedProcedure
		.input(expenseInputSchema)
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

			// Verify unit if provided
			if (input.unitId) {
				const unit = await prisma.unit.findFirst({
					where: {
						id: input.unitId,
						propertyId: input.propertyId,
					},
				});

				if (!unit) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Unit not found",
					});
				}
			}

			const expense = await prisma.expense.create({
				data: {
					propertyId: input.propertyId,
					unitId: input.unitId,
					paidBy: ctx.session.user.id,
					category: input.category,
					subcategory: input.subcategory,
					vendor: input.vendor,
					amount: input.amount,
					currencyId: input.currencyId,
					date: new Date(input.date),
					description: input.description,
					isRecurring: input.isRecurring,
					recurringFrequency: input.recurringFrequency,
					isTaxDeductible: input.isTaxDeductible,
				},
				include: {
					property: { select: { id: true, name: true } },
					unit: { select: { id: true, unitNumber: true } },
					currency: true,
				},
			});

			return { expense };
		}),

	// Update expense
	update: protectedProcedure
		.input(
			expenseInputSchema.partial().extend({
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

			const existing = await prisma.expense.findFirst({
				where: {
					id: input.id,
					property: { organizationId: member.organizationId },
				},
			});

			if (!existing) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Expense not found",
				});
			}

			const { id, date, propertyId, ...rest } = input;

			const expense = await prisma.expense.update({
				where: { id },
				data: {
					...rest,
					date: date ? new Date(date) : undefined,
				},
				include: {
					property: { select: { id: true, name: true } },
					unit: { select: { id: true, unitNumber: true } },
					currency: true,
				},
			});

			return { expense };
		}),

	// Delete expense
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

			const existing = await prisma.expense.findFirst({
				where: {
					id: input.id,
					property: { organizationId: member.organizationId },
				},
			});

			if (!existing) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Expense not found",
				});
			}

			await prisma.expense.delete({
				where: { id: input.id },
			});

			return { success: true };
		}),

	// Get expense summary/stats
	getSummary: protectedProcedure
		.input(
			z
				.object({
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

			const member = await getUserOrganization(ctx.session.user.id);
			if (!member) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "User is not a member of any organization",
				});
			}

			const baseWhere: Parameters<typeof prisma.expense.findMany>[0]["where"] =
				{
					property: { organizationId: member.organizationId },
				};

			if (input?.propertyId) baseWhere.propertyId = input.propertyId;

			// Date filters
			let dateFilter: { gte?: Date; lte?: Date } | undefined;
			if (input?.year) {
				const startDate = new Date(input.year, (input.month ?? 1) - 1, 1);
				const endDate = input.month
					? new Date(input.year, input.month, 0)
					: new Date(input.year, 11, 31);
				dateFilter = { gte: startDate, lte: endDate };
			}

			// Get totals by category
			const expensesByCategory = await prisma.expense.groupBy({
				by: ["category"],
				where: { ...baseWhere, date: dateFilter },
				_sum: { amount: true },
				_count: true,
			});

			const taxDeductibleTotal = await prisma.expense.aggregate({
				where: { ...baseWhere, date: dateFilter, isTaxDeductible: true },
				_sum: { amount: true },
			});

			const totalExpenses = await prisma.expense.aggregate({
				where: { ...baseWhere, date: dateFilter },
				_sum: { amount: true },
				_count: true,
			});

			const recentExpenses = await prisma.expense.findMany({
				where: baseWhere,
				orderBy: { date: "desc" },
				take: 5,
				include: {
					property: { select: { name: true } },
					unit: { select: { unitNumber: true } },
					currency: true,
				},
			});

			return {
				summary: {
					totalAmount: Number(totalExpenses._sum.amount || 0),
					expenseCount: totalExpenses._count,
					taxDeductibleAmount: Number(taxDeductibleTotal._sum.amount || 0),
					byCategory: expensesByCategory.map((c) => ({
						category: c.category,
						amount: Number(c._sum.amount || 0),
						count: c._count,
					})),
				},
				recentExpenses,
			};
		}),

	// Get expense categories (for dropdown)
	getCategories: protectedProcedure.query(async () => {
		return {
			categories: [
				{ value: "maintenance", label: "Maintenance" },
				{ value: "utilities", label: "Utilities" },
				{ value: "tax", label: "Property Tax" },
				{ value: "insurance", label: "Insurance" },
				{ value: "mortgage", label: "Mortgage/Loan" },
				{ value: "management", label: "Property Management" },
				{ value: "repairs", label: "Repairs" },
				{ value: "supplies", label: "Supplies" },
				{ value: "advertising", label: "Advertising" },
				{ value: "legal", label: "Legal Fees" },
				{ value: "professional", label: "Professional Services" },
				{ value: "travel", label: "Travel" },
				{ value: "other", label: "Other" },
			],
		};
	}),
});
