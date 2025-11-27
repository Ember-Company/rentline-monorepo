import prisma from "@rentline/db";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../index";

export const organizationsRouter = router({
	// Get current user's organizations
	list: protectedProcedure.query(async ({ ctx }) => {
		if (!ctx.session?.user?.id) {
			throw new TRPCError({
				code: "UNAUTHORIZED",
				message: "User not authenticated",
			});
		}

		const members = await prisma.member.findMany({
			where: { userId: ctx.session.user.id },
			include: {
				organization: {
					include: {
						settings: true,
						_count: {
							select: {
								members: true,
								properties: true,
								contacts: true,
							},
						},
					},
				},
			},
		});

		return {
			organizations: members.map((m) => ({
				...m.organization,
				role: m.role,
				memberCount: m.organization._count.members,
				propertyCount: m.organization._count.properties,
				contactCount: m.organization._count.contacts,
			})),
		};
	}),

	// Get current/active organization
	getCurrent: protectedProcedure.query(async ({ ctx }) => {
		if (!ctx.session?.user?.id) {
			throw new TRPCError({
				code: "UNAUTHORIZED",
				message: "User not authenticated",
			});
		}

		// Get active organization from session or first organization
		const activeOrgId = ctx.session.session?.activeOrganizationId;

		if (activeOrgId) {
			const member = await prisma.member.findFirst({
				where: {
					userId: ctx.session.user.id,
					organizationId: activeOrgId,
				},
				include: {
					organization: {
						include: {
							settings: {
								include: {
									currency: true,
								},
							},
							_count: {
								select: {
									members: true,
									properties: true,
									contacts: true,
								},
							},
						},
					},
				},
			});

			if (member) {
				return {
					organization: {
						...member.organization,
						role: member.role,
					},
				};
			}
		}

		// Fallback to first organization
		const member = await prisma.member.findFirst({
			where: { userId: ctx.session.user.id },
			include: {
				organization: {
					include: {
						settings: {
							include: {
								currency: true,
							},
						},
					},
				},
			},
			orderBy: { createdAt: "asc" },
		});

		if (!member) {
			return { organization: null };
		}

		return {
			organization: {
				...member.organization,
				role: member.role,
			},
		};
	}),

	// Get organization by ID
	getById: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			if (!ctx.session?.user?.id) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "User not authenticated",
				});
			}

			// Verify user is member of organization
			const member = await prisma.member.findFirst({
				where: {
					userId: ctx.session.user.id,
					organizationId: input.id,
				},
			});

			if (!member) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You are not a member of this organization",
				});
			}

			const organization = await prisma.organization.findUnique({
				where: { id: input.id },
				include: {
					settings: {
						include: {
							currency: true,
						},
					},
					members: {
						include: {
							user: {
								select: {
									id: true,
									name: true,
									email: true,
									image: true,
								},
							},
						},
					},
					agencyDetails: true,
					_count: {
						select: {
							properties: true,
							contacts: true,
						},
					},
				},
			});

			return {
				organization: {
					...organization,
					role: member.role,
				},
			};
		}),

	// Update organization
	update: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				name: z.string().optional(),
				logo: z.string().optional(),
				address: z.string().optional(),
				city: z.string().optional(),
				state: z.string().optional(),
				postalCode: z.string().optional(),
				country: z.string().optional(),
				phone: z.string().optional(),
				email: z.string().email().optional(),
				website: z.string().optional(),
				taxId: z.string().optional(),
				licenseNumber: z.string().optional(),
				type: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			if (!ctx.session?.user?.id) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "User not authenticated",
				});
			}

			// Verify user is admin/owner of organization
			const member = await prisma.member.findFirst({
				where: {
					userId: ctx.session.user.id,
					organizationId: input.id,
					role: { in: ["owner", "admin"] },
				},
			});

			if (!member) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You do not have permission to update this organization",
				});
			}

			const { id, ...data } = input;

			const organization = await prisma.organization.update({
				where: { id },
				data,
			});

			return { organization };
		}),

	// Update organization settings
	updateSettings: protectedProcedure
		.input(
			z.object({
				organizationId: z.string(),
				timezone: z.string().optional(),
				locale: z.string().optional(),
				currencyId: z.string().optional(),
				notificationsEnabled: z.boolean().optional(),
				maintenanceAutoAssign: z.boolean().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			if (!ctx.session?.user?.id) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "User not authenticated",
				});
			}

			const member = await prisma.member.findFirst({
				where: {
					userId: ctx.session.user.id,
					organizationId: input.organizationId,
					role: { in: ["owner", "admin"] },
				},
			});

			if (!member) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You do not have permission to update organization settings",
				});
			}

			const { organizationId, ...data } = input;

			const settings = await prisma.organizationSettings.upsert({
				where: { organizationId },
				update: data,
				create: {
					organizationId,
					...data,
				},
			});

			return { settings };
		}),

	// Get organization stats/dashboard
	getStats: protectedProcedure
		.input(z.object({ organizationId: z.string().optional() }))
		.query(async ({ ctx, input }) => {
			if (!ctx.session?.user?.id) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "User not authenticated",
				});
			}

			let organizationId = input.organizationId;

			if (!organizationId) {
				const member = await prisma.member.findFirst({
					where: { userId: ctx.session.user.id },
				});
				if (!member) {
					throw new TRPCError({
						code: "FORBIDDEN",
						message: "User is not a member of any organization",
					});
				}
				organizationId = member.organizationId;
			}

			// Get property stats
			const properties = await prisma.property.findMany({
				where: { organizationId },
				include: {
					units: true,
					leases: {
						where: { status: "active" },
						include: {
							payments: {
								where: {
									status: "completed",
									date: {
										gte: new Date(
											new Date().getFullYear(),
											new Date().getMonth(),
											1,
										),
									},
								},
							},
						},
					},
				},
			});

			const totalProperties = properties.length;
			const totalUnits = properties.reduce((acc, p) => acc + p.units.length, 0);
			const occupiedUnits = properties.reduce(
				(acc, p) => acc + p.units.filter((u) => u.status === "occupied").length,
				0,
			);
			const activeLeases = properties.reduce(
				(acc, p) => acc + p.leases.length,
				0,
			);
			const monthlyRevenue = properties.reduce(
				(acc, p) =>
					acc +
					p.leases.reduce(
						(lAcc, l) =>
							lAcc +
							l.payments.reduce((pAcc, pay) => pAcc + Number(pay.amount), 0),
						0,
					),
				0,
			);

			// Get expenses for the month
			const monthStart = new Date(
				new Date().getFullYear(),
				new Date().getMonth(),
				1,
			);
			const expenses = await prisma.expense.aggregate({
				where: {
					property: { organizationId },
					date: { gte: monthStart },
				},
				_sum: { amount: true },
			});

			// Get pending maintenance
			const pendingMaintenance = await prisma.maintenanceRequest.count({
				where: {
					unit: { property: { organizationId } },
					status: { in: ["open", "in_progress"] },
				},
			});

			// Get leases expiring soon (within 30 days)
			const thirtyDaysFromNow = new Date();
			thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
			const expiringSoonLeases = await prisma.lease.count({
				where: {
					OR: [
						{ property: { organizationId } },
						{ unit: { property: { organizationId } } },
					],
					status: "active",
					endDate: {
						lte: thirtyDaysFromNow,
						gte: new Date(),
					},
				},
			});

			return {
				stats: {
					totalProperties,
					totalUnits,
					occupiedUnits,
					vacantUnits: totalUnits - occupiedUnits,
					occupancyRate:
						totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0,
					activeLeases,
					monthlyRevenue,
					monthlyExpenses: Number(expenses._sum.amount || 0),
					netIncome: monthlyRevenue - Number(expenses._sum.amount || 0),
					pendingMaintenance,
					expiringSoonLeases,
				},
			};
		}),

	// Get organization members
	getMembers: protectedProcedure
		.input(z.object({ organizationId: z.string() }))
		.query(async ({ ctx, input }) => {
			if (!ctx.session?.user?.id) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "User not authenticated",
				});
			}

			const member = await prisma.member.findFirst({
				where: {
					userId: ctx.session.user.id,
					organizationId: input.organizationId,
				},
			});

			if (!member) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You are not a member of this organization",
				});
			}

			const members = await prisma.member.findMany({
				where: { organizationId: input.organizationId },
				include: {
					user: {
						select: {
							id: true,
							name: true,
							email: true,
							image: true,
						},
					},
				},
			});

			return { members };
		}),

	// Get available currencies
	getCurrencies: protectedProcedure.query(async () => {
		const currencies = await prisma.currency.findMany({
			orderBy: { name: "asc" },
		});
		return { currencies };
	}),
});
