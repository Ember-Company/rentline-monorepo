import { protectedProcedure, router } from "../index";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import prisma from "@rentline/db";

export const userRouter = router({
	privateData: protectedProcedure.query(({ ctx }) => {
		return {
			message: "This is private",
			user: ctx.session.user,
		};
	}),
	updateUserOnboarding: protectedProcedure
		.input(
			z.object({
				hasOnboarded: z.boolean(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			if (!ctx.session?.user?.id) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "User not authenticated",
				});
			}

			const user = await prisma.user.update({
				where: { id: ctx.session.user.id },
				data: { hasOnboarded: input.hasOnboarded },
			});

			return { success: true, user };
		}),
	updateProfile: protectedProcedure
		.input(
			z.object({
				name: z.string().optional(),
				phone: z.string().optional(),
				dateOfBirth: z.string().optional(),
				address: z.string().optional(),
				city: z.string().optional(),
				state: z.string().optional(),
				postalCode: z.string().optional(),
				country: z.string().optional(),
				preferredLanguage: z.string().optional(),
				userType: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			if (!ctx.session?.user?.id) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "User not authenticated",
				});
			}

			const updateData: {
				name?: string;
				phone?: string;
				dateOfBirth?: Date;
				address?: string;
				city?: string;
				state?: string;
				postalCode?: string;
				country?: string;
				preferredLanguage?: string;
				userType?: string;
			} = {};

			if (input.name) updateData.name = input.name;
			if (input.phone) updateData.phone = input.phone;
			if (input.dateOfBirth) {
				updateData.dateOfBirth = new Date(input.dateOfBirth);
			}
			if (input.address) updateData.address = input.address;
			if (input.city) updateData.city = input.city;
			if (input.state) updateData.state = input.state;
			if (input.postalCode) updateData.postalCode = input.postalCode;
			if (input.country) updateData.country = input.country;
			if (input.preferredLanguage) updateData.preferredLanguage = input.preferredLanguage;
			if (input.userType) updateData.userType = input.userType;

			const user = await prisma.user.update({
				where: { id: ctx.session.user.id },
				data: updateData,
			});

			return { success: true, user };
		}),
});

