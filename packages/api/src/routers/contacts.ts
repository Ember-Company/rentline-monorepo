import prisma from "@rentline/db";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../index";

const contactInputSchema = z.object({
	type: z.enum(["tenant", "agent", "owner"]),
	// Person fields
	firstName: z.string().optional(),
	lastName: z.string().optional(),
	email: z.string().email().optional().or(z.literal("")),
	phone: z.string().optional(),
	mobile: z.string().optional(),
	dateOfBirth: z.string().optional(),
	notes: z.string().optional(),
	// Company fields
	companyName: z.string().optional(),
	taxId: z.string().optional(),
	registrationNumber: z.string().optional(),
	// Address fields
	address: z.string().optional(),
	city: z.string().optional(),
	state: z.string().optional(),
	postalCode: z.string().optional(),
	country: z.string().optional(),
	// Additional
	avatarUrl: z.string().optional(),
	status: z.enum(["active", "inactive"]).optional(),
});

export const contactsRouter = router({
	list: protectedProcedure
		.input(
			z.object({
				type: z.enum(["tenant", "agent", "owner"]).optional(),
				search: z.string().optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			if (!ctx.session?.user?.id) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "User not authenticated",
				});
			}

			// Get user's organization
			const member = await prisma.member.findFirst({
				where: { userId: ctx.session.user.id },
				include: { organization: true },
			});

			if (!member) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "User is not a member of any organization",
				});
			}

			const where: {
				organizationId: string;
				type?: string;
				OR?: Array<{
					firstName?: { contains: string; mode: "insensitive" };
					lastName?: { contains: string; mode: "insensitive" };
					email?: { contains: string; mode: "insensitive" };
					companyName?: { contains: string; mode: "insensitive" };
				}>;
			} = {
				organizationId: member.organizationId,
			};

			if (input.type) {
				where.type = input.type;
			}

			if (input.search) {
				where.OR = [
					{ firstName: { contains: input.search, mode: "insensitive" } },
					{ lastName: { contains: input.search, mode: "insensitive" } },
					{ email: { contains: input.search, mode: "insensitive" } },
					{ companyName: { contains: input.search, mode: "insensitive" } },
				];
			}

			const contacts = await prisma.contact.findMany({
				where,
				orderBy: { createdAt: "desc" },
			});

			return { contacts };
		}),

	getById: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			if (!ctx.session?.user?.id) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "User not authenticated",
				});
			}

			const member = await prisma.member.findFirst({
				where: { userId: ctx.session.user.id },
			});

			if (!member) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "User is not a member of any organization",
				});
			}

			const contact = await prisma.contact.findFirst({
				where: {
					id: input.id,
					organizationId: member.organizationId,
				},
			});

			if (!contact) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Contact not found",
				});
			}

			return { contact };
		}),

	create: protectedProcedure
		.input(contactInputSchema)
		.mutation(async ({ ctx, input }) => {
			if (!ctx.session?.user?.id) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "User not authenticated",
				});
			}

			const member = await prisma.member.findFirst({
				where: { userId: ctx.session.user.id },
			});

			if (!member) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "User is not a member of any organization",
				});
			}

			const data: {
				organizationId: string;
				type: string;
				firstName?: string;
				lastName?: string;
				email?: string | null;
				phone?: string;
				mobile?: string;
				dateOfBirth?: Date | null;
				notes?: string;
				companyName?: string;
				taxId?: string;
				registrationNumber?: string;
				address?: string;
				city?: string;
				state?: string;
				postalCode?: string;
				country?: string;
				avatarUrl?: string;
				status?: string;
			} = {
				organizationId: member.organizationId,
				type: input.type,
			};

			if (input.firstName) data.firstName = input.firstName;
			if (input.lastName) data.lastName = input.lastName;
			if (input.email) data.email = input.email;
			if (input.phone) data.phone = input.phone;
			if (input.mobile) data.mobile = input.mobile;
			if (input.dateOfBirth) {
				data.dateOfBirth = new Date(input.dateOfBirth);
			}
			if (input.notes) data.notes = input.notes;
			if (input.companyName) data.companyName = input.companyName;
			if (input.taxId) data.taxId = input.taxId;
			if (input.registrationNumber)
				data.registrationNumber = input.registrationNumber;
			if (input.address) data.address = input.address;
			if (input.city) data.city = input.city;
			if (input.state) data.state = input.state;
			if (input.postalCode) data.postalCode = input.postalCode;
			if (input.country) data.country = input.country;
			if (input.avatarUrl) data.avatarUrl = input.avatarUrl;
			if (input.status) data.status = input.status;

			const contact = await prisma.contact.create({
				data,
			});

			return { contact };
		}),

	update: protectedProcedure
		.input(
			contactInputSchema.extend({
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

			const member = await prisma.member.findFirst({
				where: { userId: ctx.session.user.id },
			});

			if (!member) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "User is not a member of any organization",
				});
			}

			// Verify contact belongs to user's organization
			const existing = await prisma.contact.findFirst({
				where: {
					id: input.id,
					organizationId: member.organizationId,
				},
			});

			if (!existing) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Contact not found",
				});
			}

			const data: {
				type?: string;
				firstName?: string;
				lastName?: string;
				email?: string | null;
				phone?: string;
				mobile?: string;
				dateOfBirth?: Date | null;
				notes?: string;
				companyName?: string;
				taxId?: string;
				registrationNumber?: string;
				address?: string;
				city?: string;
				state?: string;
				postalCode?: string;
				country?: string;
				avatarUrl?: string;
				status?: string;
			} = {};

			if (input.type) data.type = input.type;
			if (input.firstName !== undefined)
				data.firstName = input.firstName || null;
			if (input.lastName !== undefined) data.lastName = input.lastName || null;
			if (input.email !== undefined) data.email = input.email || null;
			if (input.phone !== undefined) data.phone = input.phone || null;
			if (input.mobile !== undefined) data.mobile = input.mobile || null;
			if (input.dateOfBirth) {
				data.dateOfBirth = new Date(input.dateOfBirth);
			} else if (input.dateOfBirth === "") {
				data.dateOfBirth = null;
			}
			if (input.notes !== undefined) data.notes = input.notes || null;
			if (input.companyName !== undefined)
				data.companyName = input.companyName || null;
			if (input.taxId !== undefined) data.taxId = input.taxId || null;
			if (input.registrationNumber !== undefined)
				data.registrationNumber = input.registrationNumber || null;
			if (input.address !== undefined) data.address = input.address || null;
			if (input.city !== undefined) data.city = input.city || null;
			if (input.state !== undefined) data.state = input.state || null;
			if (input.postalCode !== undefined)
				data.postalCode = input.postalCode || null;
			if (input.country !== undefined) data.country = input.country || null;
			if (input.avatarUrl !== undefined)
				data.avatarUrl = input.avatarUrl || null;
			if (input.status) data.status = input.status;

			const contact = await prisma.contact.update({
				where: { id: input.id },
				data,
			});

			return { contact };
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			if (!ctx.session?.user?.id) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "User not authenticated",
				});
			}

			const member = await prisma.member.findFirst({
				where: { userId: ctx.session.user.id },
			});

			if (!member) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "User is not a member of any organization",
				});
			}

			// Verify contact belongs to user's organization
			const existing = await prisma.contact.findFirst({
				where: {
					id: input.id,
					organizationId: member.organizationId,
				},
			});

			if (!existing) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Contact not found",
				});
			}

			await prisma.contact.delete({
				where: { id: input.id },
			});

			return { success: true };
		}),

	// Property contact associations
	linkToProperty: protectedProcedure
		.input(
			z.object({
				contactId: z.string(),
				propertyId: z.string(),
				role: z.string().optional(),
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
				where: { userId: ctx.session.user.id },
			});

			if (!member) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "User is not a member of any organization",
				});
			}

			// Verify property belongs to user's organization
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

			const propertyContact = await prisma.propertyContact.upsert({
				where: {
					propertyId_contactId: {
						propertyId: input.propertyId,
						contactId: input.contactId,
					},
				},
				update: {
					role: input.role,
				},
				create: {
					propertyId: input.propertyId,
					contactId: input.contactId,
					role: input.role,
				},
			});

			return { propertyContact };
		}),

	unlinkFromProperty: protectedProcedure
		.input(
			z.object({
				contactId: z.string(),
				propertyId: z.string(),
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
				where: { userId: ctx.session.user.id },
			});

			if (!member) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "User is not a member of any organization",
				});
			}

			await prisma.propertyContact.deleteMany({
				where: {
					propertyId: input.propertyId,
					contactId: input.contactId,
				},
			});

			return { success: true };
		}),

	getByProperty: protectedProcedure
		.input(
			z.object({
				propertyId: z.string(),
				type: z.enum(["tenant", "agent", "owner"]).optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			if (!ctx.session?.user?.id) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "User not authenticated",
				});
			}

			const member = await prisma.member.findFirst({
				where: { userId: ctx.session.user.id },
			});

			if (!member) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "User is not a member of any organization",
				});
			}

			const where: {
				propertyId: string;
				contact?: { type?: string };
			} = {
				propertyId: input.propertyId,
			};

			if (input.type) {
				where.contact = { type: input.type };
			}

			const propertyContacts = await prisma.propertyContact.findMany({
				where,
				include: {
					contact: true,
				},
				orderBy: { createdAt: "desc" },
			});

			return { contacts: propertyContacts.map((pc) => pc.contact) };
		}),
});
