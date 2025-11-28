import prisma from "@rentline/db";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../index";
import { getActiveOrganization } from "../utils/organization";

const saleStatusEnum = z.enum([
	"pending",
	"under_contract",
	"closed",
	"cancelled",
	"failed",
]);

const saleTypeEnum = z.enum(["purchase", "installment", "rent_to_own"]);

const saleInputSchema = z.object({
	// Property/Unit - one is required
	propertyId: z.string().optional(),
	unitId: z.string().optional(),
	// Buyer
	buyerContactId: z.string(),
	// Sale terms
	saleType: saleTypeEnum.default("purchase"),
	contractDate: z.string(), // ISO date string
	closingDate: z.string().optional(),
	possessionDate: z.string().optional(),
	// Financial
	askingPrice: z.number().positive("Asking price must be positive"),
	salePrice: z.number().positive("Sale price must be positive"),
	downPayment: z.number().optional(),
	downPaymentDate: z.string().optional(),
	financingAmount: z.number().optional(),
	financingTerm: z.number().int().optional(),
	interestRate: z.number().optional(),
	monthlyPayment: z.number().optional(),
	currencyId: z.string(),
	// Additional costs
	closingCosts: z.number().optional(),
	taxes: z.number().optional(),
	transferFees: z.number().optional(),
	otherFees: z.array(z.object({ description: z.string(), amount: z.number() })).optional(),
	// Status
	status: saleStatusEnum.default("pending"),
	contractStatus: z.enum(["draft", "signed", "executed"]).optional(),
	// Conditions and contingencies
	inspectionContingency: z.boolean().default(true),
	financingContingency: z.boolean().default(true),
	appraisalContingency: z.boolean().default(false),
	homeSaleContingency: z.boolean().default(false),
	contingencyDeadline: z.string().optional(),
	// Important dates
	offerDate: z.string().optional(),
	acceptanceDate: z.string().optional(),
	inspectionDate: z.string().optional(),
	appraisalDate: z.string().optional(),
	finalWalkthroughDate: z.string().optional(),
	// Documents and notes
	contractDocumentUrl: z.string().optional(),
	notes: z.string().optional(),
	terms: z.string().optional(),
	// Commission
	agentCommission: z.number().optional(),
	agentCommissionPercent: z.number().optional(),
});

export const salesRouter = router({
	// List sales with filtering
	list: protectedProcedure
		.input(
			z
				.object({
					propertyId: z.string().optional(),
					unitId: z.string().optional(),
					buyerContactId: z.string().optional(),
					status: saleStatusEnum.optional(),
					search: z.string().optional(),
					includeClosed: z.boolean().default(false),
					limit: z.number().int().min(1).max(100).default(50),
					offset: z.number().int().min(0).default(0),
				})
				.optional(),
		)
		.query(async ({ ctx, input }) => {
			const member = await getActiveOrganization(ctx);

			// Build complex where clause
			const where: Parameters<typeof prisma.sale.findMany>[0]["where"] = {
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

			if (input?.buyerContactId) {
				where.buyerContactId = input.buyerContactId;
			}

			if (input?.status) {
				where.status = input.status;
			} else if (!input?.includeClosed) {
				where.status = { notIn: ["closed", "cancelled", "failed"] };
			}

			const [sales, total] = await Promise.all([
				prisma.sale.findMany({
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
						buyerContact: {
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
								documents: true,
							},
						},
					},
					orderBy: { contractDate: "desc" },
					take: input?.limit ?? 50,
					skip: input?.offset ?? 0,
				}),
				prisma.sale.count({ where }),
			]);

			return {
				sales: sales.map((sale) => ({
					...sale,
					otherFees: sale.otherFees ? JSON.parse(sale.otherFees) : [],
				})),
				total,
				hasMore: (input?.offset ?? 0) + sales.length < total,
			};
		}),

	// Get single sale with full details
	getById: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			const member = await getActiveOrganization(ctx);

			const sale = await prisma.sale.findFirst({
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
					buyerContact: true,
					currency: true,
					payments: {
						orderBy: { date: "desc" },
						include: {
							currency: true,
							paymentMethod: true,
						},
					},
					documents: {
						orderBy: { uploadedAt: "desc" },
					},
				},
			});

			if (!sale) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Sale not found",
				});
			}

			// Calculate payment stats
			const totalPaid = sale.payments
				.filter((p) => p.status === "completed")
				.reduce((sum, p) => sum + Number(p.amount), 0);

			return {
				sale: {
					...sale,
					otherFees: sale.otherFees ? JSON.parse(sale.otherFees) : [],
					totalPaid,
					remainingBalance: Number(sale.salePrice) - totalPaid,
				},
			};
		}),

	// Create sale
	create: protectedProcedure
		.input(saleInputSchema)
		.mutation(async ({ ctx, input }) => {
			const member = await getActiveOrganization(ctx);

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
						sales: {
							where: { status: { in: ["pending", "under_contract"] } },
						},
					},
				});

				if (!unit) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Unit not found",
					});
				}

				// Check for existing active sale on unit
				if (unit.sales.length > 0 && input.status === "pending") {
					throw new TRPCError({
						code: "CONFLICT",
						message: "This unit already has an active sale",
					});
				}

				// Check if unit is available for sale
				if (unit.category === "rent") {
					throw new TRPCError({
						code: "BAD_REQUEST",
						message: "This unit is only available for rent, not sale",
					});
				}
			} else if (input.propertyId) {
				const property = await prisma.property.findFirst({
					where: {
						id: input.propertyId,
						organizationId: member.organizationId,
					},
					include: {
						sales: {
							where: { status: { in: ["pending", "under_contract"] }, unitId: null },
						},
					},
				});

				if (!property) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Property not found",
					});
				}

				// Check for existing active sale on property (whole property)
				if (property.sales.length > 0 && input.status === "pending") {
					throw new TRPCError({
						code: "CONFLICT",
						message: "This property already has an active sale",
					});
				}

				// Check if property is available for sale
				if (property.category === "rent") {
					throw new TRPCError({
						code: "BAD_REQUEST",
						message: "This property is only available for rent, not sale",
					});
				}
			}

			// Verify buyer contact exists and belongs to organization
			const contact = await prisma.contact.findFirst({
				where: {
					id: input.buyerContactId,
					organizationId: member.organizationId,
				},
			});

			if (!contact) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Buyer contact not found",
				});
			}

			// Get or ensure default currency exists
			let currencyId = input.currencyId;
			if (!currencyId) {
				const orgSettings = await prisma.organizationSettings.findFirst({
					where: { organizationId: member.organizationId },
					include: { currency: true },
				});
				currencyId = orgSettings?.currencyId || "BRL";
			}

			// Ensure currency exists
			const currency = await prisma.currency.findUnique({
				where: { id: currencyId },
			});

			if (!currency) {
				if (currencyId === "BRL") {
					await prisma.currency.upsert({
						where: { id: "BRL" },
						update: {},
						create: {
							id: "BRL",
							name: "Real Brasileiro",
							symbol: "R$",
						},
					});
				} else {
					throw new TRPCError({
						code: "BAD_REQUEST",
						message: `Currency ${currencyId} does not exist`,
					});
				}
			}

			const sale = await prisma.sale.create({
				data: {
					propertyId: input.propertyId,
					unitId: input.unitId,
					buyerContactId: input.buyerContactId,
					saleType: input.saleType,
					contractDate: new Date(input.contractDate),
					closingDate: input.closingDate ? new Date(input.closingDate) : null,
					possessionDate: input.possessionDate ? new Date(input.possessionDate) : null,
					// Financial
					askingPrice: input.askingPrice,
					salePrice: input.salePrice,
					downPayment: input.downPayment,
					downPaymentDate: input.downPaymentDate ? new Date(input.downPaymentDate) : null,
					financingAmount: input.financingAmount,
					financingTerm: input.financingTerm,
					interestRate: input.interestRate,
					monthlyPayment: input.monthlyPayment,
					currencyId,
					// Additional costs
					closingCosts: input.closingCosts,
					taxes: input.taxes,
					transferFees: input.transferFees,
					otherFees: input.otherFees ? JSON.stringify(input.otherFees) : null,
					// Status
					status: input.status,
					contractStatus: input.contractStatus,
					// Conditions
					inspectionContingency: input.inspectionContingency,
					financingContingency: input.financingContingency,
					appraisalContingency: input.appraisalContingency,
					homeSaleContingency: input.homeSaleContingency,
					contingencyDeadline: input.contingencyDeadline ? new Date(input.contingencyDeadline) : null,
					// Dates
					offerDate: input.offerDate ? new Date(input.offerDate) : null,
					acceptanceDate: input.acceptanceDate ? new Date(input.acceptanceDate) : null,
					inspectionDate: input.inspectionDate ? new Date(input.inspectionDate) : null,
					appraisalDate: input.appraisalDate ? new Date(input.appraisalDate) : null,
					finalWalkthroughDate: input.finalWalkthroughDate ? new Date(input.finalWalkthroughDate) : null,
					// Documents and notes
					contractDocumentUrl: input.contractDocumentUrl,
					notes: input.notes,
					terms: input.terms,
					// Commission
					agentCommission: input.agentCommission,
					agentCommissionPercent: input.agentCommissionPercent,
				},
				include: {
					property: { select: { id: true, name: true } },
					unit: { select: { id: true, unitNumber: true } },
					buyerContact: true,
					currency: true,
				},
			});

			// Update unit status if applicable
			if (input.unitId && input.status === "under_contract") {
				await prisma.unit.update({
					where: { id: input.unitId },
					data: { status: "reserved" },
				});
			}

			// Update unit purchase price if sale is closed
			if (input.unitId && input.status === "closed") {
				await prisma.unit.update({
					where: { id: input.unitId },
					data: {
						status: "sold",
						purchasePrice: input.salePrice,
					},
				});
			}

			return { sale };
		}),

	// Update sale
	update: protectedProcedure
		.input(
			saleInputSchema.partial().extend({
				id: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const member = await getActiveOrganization(ctx);

			const existing = await prisma.sale.findFirst({
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
					message: "Sale not found",
				});
			}

			const {
				id,
				contractDate,
				closingDate,
				possessionDate,
				downPaymentDate,
				contingencyDeadline,
				offerDate,
				acceptanceDate,
				inspectionDate,
				appraisalDate,
				finalWalkthroughDate,
				otherFees,
				...rest
			} = input;

			const updateData: Parameters<typeof prisma.sale.update>[0]["data"] = {
				...rest,
				contractDate: contractDate ? new Date(contractDate) : undefined,
				closingDate: closingDate ? new Date(closingDate) : undefined,
				possessionDate: possessionDate ? new Date(possessionDate) : undefined,
				downPaymentDate: downPaymentDate ? new Date(downPaymentDate) : undefined,
				contingencyDeadline: contingencyDeadline ? new Date(contingencyDeadline) : undefined,
				offerDate: offerDate ? new Date(offerDate) : undefined,
				acceptanceDate: acceptanceDate ? new Date(acceptanceDate) : undefined,
				inspectionDate: inspectionDate ? new Date(inspectionDate) : undefined,
				appraisalDate: appraisalDate ? new Date(appraisalDate) : undefined,
				finalWalkthroughDate: finalWalkthroughDate ? new Date(finalWalkthroughDate) : undefined,
				otherFees: otherFees ? JSON.stringify(otherFees) : undefined,
			};

			// Remove undefined values
			Object.keys(updateData).forEach((key) => {
				if (updateData[key as keyof typeof updateData] === undefined) {
					delete updateData[key as keyof typeof updateData];
				}
			});

			const sale = await prisma.sale.update({
				where: { id },
				data: updateData,
				include: {
					property: { select: { id: true, name: true } },
					unit: { select: { id: true, unitNumber: true } },
					buyerContact: true,
					currency: true,
				},
			});

			// Update unit status based on sale status
			if (existing.unitId) {
				if (input.status === "under_contract") {
					await prisma.unit.update({
						where: { id: existing.unitId },
						data: { status: "reserved" },
					});
				} else if (input.status === "closed") {
					await prisma.unit.update({
						where: { id: existing.unitId },
						data: {
							status: "sold",
							purchasePrice: input.salePrice ?? existing.salePrice,
						},
					});
				} else if (input.status === "cancelled" || input.status === "failed") {
					// Check if there are other active sales
					const otherActiveSales = await prisma.sale.count({
						where: {
							unitId: existing.unitId,
							status: { in: ["pending", "under_contract"] },
							id: { not: id },
						},
					});
					if (otherActiveSales === 0) {
						await prisma.unit.update({
							where: { id: existing.unitId },
							data: { status: "available" },
						});
					}
				}
			}

			return { sale };
		}),

	// Delete sale
	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const member = await getActiveOrganization(ctx);

			const existing = await prisma.sale.findFirst({
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
					message: "Sale not found",
				});
			}

			// Don't allow deletion of closed sales
			if (existing.status === "closed") {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Cannot delete a closed sale",
				});
			}

			await prisma.sale.delete({
				where: { id: input.id },
			});

			// Reset unit status if it was reserved
			if (existing.unitId && existing.status === "under_contract") {
				const otherActiveSales = await prisma.sale.count({
					where: {
						unitId: existing.unitId,
						status: { in: ["pending", "under_contract"] },
						id: { not: input.id },
					},
				});
				if (otherActiveSales === 0) {
					await prisma.unit.update({
						where: { id: existing.unitId },
						data: { status: "available" },
					});
				}
			}

			return { success: true };
		}),

	// Close sale (mark as closed)
	close: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				closingDate: z.string().optional(),
				finalSalePrice: z.number().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const member = await getActiveOrganization(ctx);

			const existing = await prisma.sale.findFirst({
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
					message: "Sale not found",
				});
			}

			const sale = await prisma.sale.update({
				where: { id: input.id },
				data: {
					status: "closed",
					closingDate: input.closingDate ? new Date(input.closingDate) : new Date(),
					salePrice: input.finalSalePrice ?? existing.salePrice,
				},
				include: {
					property: { select: { id: true, name: true } },
					unit: { select: { id: true, unitNumber: true } },
					buyerContact: true,
					currency: true,
				},
			});

			// Update unit status to sold
			if (existing.unitId) {
				await prisma.unit.update({
					where: { id: existing.unitId },
					data: {
						status: "sold",
						purchasePrice: input.finalSalePrice ?? existing.salePrice,
					},
				});
			}

			// Update property status if entire property was sold
			if (existing.propertyId && !existing.unitId) {
				await prisma.property.update({
					where: { id: existing.propertyId },
					data: { status: "sold" },
				});
			}

			return { sale };
		}),
});

