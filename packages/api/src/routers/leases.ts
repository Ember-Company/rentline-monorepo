import prisma from "@rentline/db";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../index";
import { getActiveOrganization } from "../utils/organization";

const leaseStatusEnum = z.enum([
	"draft",
	"pending",
	"active",
	"expired",
	"terminated",
]);
const leaseTypeEnum = z.enum(["fixed", "month_to_month", "annual"]);

const additionalChargeSchema = z.object({
	description: z.string(),
	amount: z.number().positive(),
});

const lateFeeTierSchema = z.object({
	daysLate: z.number().int().positive(),
	amount: z.number().positive(),
});

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
	paymentFrequency: z.enum([
		"standalone",
		"one_time",
		"weekly",
		"biweekly",
		"four_weeks",
		"monthly",
		"two_months",
		"quarterly",
		"four_months",
		"five_months",
		"bi_annually",
		"eighteen_months",
		"twenty_four_months",
		"yearly",
	]).default("monthly"),
	// Pro-rata
	proRataEnabled: z.boolean().default(false),
	proRataAmount: z.number().optional(),
	// Additional charges
	additionalCharges: z.array(additionalChargeSchema).optional(),
	// Late fees - now supports multiple tiers
	lateFees: z.array(lateFeeTierSchema).optional(),
	gracePeriodDays: z.number().int().optional(),
	// Additional fees
	petDeposit: z.number().optional(),
	securityDeposit: z.number().optional(),
	lastMonthRent: z.number().optional(),
	// Furnishing
	furnishing: z.enum(["furnished", "unfurnished", "partially_furnished"]).optional(),
	// Status
	status: leaseStatusEnum.default("draft"),
	terms: z.string().optional(),
	notes: z.string().optional(),
	// Renewal
	autoRenew: z.boolean().default(false),
	renewalNoticeDays: z.number().int().optional(),
	// Notification
	notificationChannel: z.enum(["email", "sms", "both"]).optional(),
	// Reminder settings
	leaseExpiryReminderEnabled: z.boolean().default(false),
	leaseExpiryReminderDays: z.number().int().optional(),
	rentReminderEnabled: z.boolean().default(false),
	rentOverdueReminderEnabled: z.boolean().default(false),
	// Renter's insurance
	requireRentersInsurance: z.boolean().default(false),
	// Contacts (owners, agents, etc.)
	contacts: z.array(z.object({
		contactId: z.string(),
		role: z.enum(["owner", "agent", "guarantor", "emergency_contact"]),
	})).optional(),
});


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
			const member = await getActiveOrganization(ctx);

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
						contacts: {
							include: {
								contact: {
									select: {
										id: true,
										firstName: true,
										lastName: true,
										email: true,
										phone: true,
										type: true,
									},
								},
							},
						},
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
			const member = await getActiveOrganization(ctx);

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
					contacts: {
						include: {
							contact: true,
						},
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
					// Financial
					rentAmount: input.rentAmount,
					depositAmount: input.depositAmount,
					currencyId: input.currencyId,
					paymentDueDay: input.paymentDueDay,
					paymentFrequency: input.paymentFrequency,
					// Pro-rata
					proRataEnabled: input.proRataEnabled,
					proRataAmount: input.proRataAmount,
					// Additional charges (JSON)
					additionalCharges: input.additionalCharges
						? JSON.stringify(input.additionalCharges)
						: null,
					// Late fees (JSON array)
					lateFees: input.lateFees ? JSON.stringify(input.lateFees) : null,
					gracePeriodDays: input.gracePeriodDays,
					// Additional fees
					petDeposit: input.petDeposit,
					securityDeposit: input.securityDeposit,
					lastMonthRent: input.lastMonthRent,
					// Furnishing
					furnishing: input.furnishing,
					// Status and notes
					status: input.status,
					terms: input.terms,
					notes: input.notes,
					// Renewal
					autoRenew: input.autoRenew,
					renewalNoticeDays: input.renewalNoticeDays,
					// Notification
					notificationChannel: input.notificationChannel,
					// Reminder settings
					leaseExpiryReminderEnabled: input.leaseExpiryReminderEnabled,
					leaseExpiryReminderDays: input.leaseExpiryReminderDays,
					rentReminderEnabled: input.rentReminderEnabled,
					rentOverdueReminderEnabled: input.rentOverdueReminderEnabled,
					// Renter's insurance
					requireRentersInsurance: input.requireRentersInsurance,
				},
				include: {
					property: { select: { id: true, name: true } },
					unit: { select: { id: true, unitNumber: true } },
					tenantContact: true,
					currency: true,
					contacts: {
						include: {
							contact: true,
						},
					},
				},
			});

			// Create lease contacts if provided
			if (input.contacts && input.contacts.length > 0) {
				await prisma.leaseContact.createMany({
					data: input.contacts.map((c) => ({
						leaseId: lease.id,
						contactId: c.contactId,
						role: c.role,
					})),
				});
			}

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
			const member = await getActiveOrganization(ctx);

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

			const {
				id,
				startDate,
				endDate,
				moveInDate,
				moveOutDate,
				additionalCharges,
				lateFees,
				...rest
			} = input;

			const updateData: Parameters<typeof prisma.lease.update>[0]["data"] = {
				...rest,
				startDate: startDate ? new Date(startDate) : undefined,
				endDate: endDate ? new Date(endDate) : undefined,
				moveInDate: moveInDate ? new Date(moveInDate) : undefined,
				moveOutDate: moveOutDate ? new Date(moveOutDate) : undefined,
				// Handle JSON fields
				additionalCharges: additionalCharges
					? JSON.stringify(additionalCharges)
					: undefined,
				lateFees: lateFees ? JSON.stringify(lateFees) : undefined,
			};

			// Remove undefined values
			Object.keys(updateData).forEach((key) => {
				if (updateData[key as keyof typeof updateData] === undefined) {
					delete updateData[key as keyof typeof updateData];
				}
			});

			const lease = await prisma.lease.update({
				where: { id },
				data: updateData,
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
			const member = await getActiveOrganization(ctx);

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
			const member = await getActiveOrganization(ctx);

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
			const member = await getActiveOrganization(ctx);

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
					lateFees: existing.lateFees,
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
			const member = await getActiveOrganization(ctx);

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

	// Lease Contact Management
	addContactToLease: protectedProcedure
		.input(
			z.object({
				leaseId: z.string(),
				contactId: z.string(),
				role: z.enum(["owner", "agent", "guarantor", "emergency_contact"]),
			}),
		)
		.mutation(async ({ ctx, input }) => {
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

			// Verify contact belongs to organization
			const contact = await prisma.contact.findFirst({
				where: {
					id: input.contactId,
					organizationId: member.organizationId,
				},
			});

			if (!contact) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Contact not found",
				});
			}

			// Create lease contact
			const leaseContact = await prisma.leaseContact.create({
				data: {
					leaseId: input.leaseId,
					contactId: input.contactId,
					role: input.role,
				},
				include: {
					contact: true,
				},
			});

			return { leaseContact };
		}),

	removeContactFromLease: protectedProcedure
		.input(
			z.object({
				leaseContactId: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const member = await getActiveOrganization(ctx);

			// Verify lease contact belongs to organization
			const leaseContact = await prisma.leaseContact.findFirst({
				where: {
					id: input.leaseContactId,
				},
				include: {
					lease: {
						include: {
							property: true,
							unit: {
								include: {
									property: true,
								},
							},
						},
					},
				},
			});

			if (!leaseContact) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Lease contact not found",
				});
			}

			// Check organization access
			const propertyOrgId =
				leaseContact.lease.property?.organizationId ||
				leaseContact.lease.unit?.property.organizationId;

			if (propertyOrgId !== member.organizationId) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Access denied",
				});
			}

			await prisma.leaseContact.delete({
				where: { id: input.leaseContactId },
			});

			return { success: true };
		}),

	updateLeaseContact: protectedProcedure
		.input(
			z.object({
				leaseContactId: z.string(),
				role: z.enum(["owner", "agent", "guarantor", "emergency_contact"]),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const member = await getActiveOrganization(ctx);

			// Verify lease contact belongs to organization
			const existing = await prisma.leaseContact.findFirst({
				where: {
					id: input.leaseContactId,
				},
				include: {
					lease: {
						include: {
							property: true,
							unit: {
								include: {
									property: true,
								},
							},
						},
					},
				},
			});

			if (!existing) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Lease contact not found",
				});
			}

			// Check organization access
			const propertyOrgId =
				existing.lease.property?.organizationId ||
				existing.lease.unit?.property.organizationId;

			if (propertyOrgId !== member.organizationId) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Access denied",
				});
			}

			const leaseContact = await prisma.leaseContact.update({
				where: { id: input.leaseContactId },
				data: { role: input.role },
				include: {
					contact: true,
				},
			});

			return { leaseContact };
		}),

	getLeaseContacts: protectedProcedure
		.input(
			z.object({
				leaseId: z.string(),
			}),
		)
		.query(async ({ ctx, input }) => {
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

			const contacts = await prisma.leaseContact.findMany({
				where: {
					leaseId: input.leaseId,
				},
				include: {
					contact: true,
				},
				orderBy: {
					createdAt: "desc",
				},
			});

			return { contacts };
		}),
});
