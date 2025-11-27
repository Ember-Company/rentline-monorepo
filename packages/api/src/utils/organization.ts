import prisma from "@rentline/db";
import { TRPCError } from "@trpc/server";
import type { Context } from "../context";

/**
 * Gets the active organization for the current user session.
 * Uses the activeOrganizationId from the session if available,
 * otherwise falls back to the user's first organization membership.
 */
export async function getActiveOrganization(ctx: Context) {
	if (!ctx.session?.user?.id) {
		throw new TRPCError({
			code: "UNAUTHORIZED",
			message: "User not authenticated",
		});
	}

	const userId = ctx.session.user.id;
	
	// Try to get the active organization from the session
	const activeOrganizationId =
		(ctx.session.session as { activeOrganizationId?: string })?.activeOrganizationId ||
		(ctx.session.user as { activeOrganizationId?: string })?.activeOrganizationId;

	if (activeOrganizationId) {
		// Verify the user is a member of this organization
		const member = await prisma.member.findFirst({
			where: {
				userId,
				organizationId: activeOrganizationId,
			},
			include: {
				organization: true,
			},
		});

		if (member) {
			return member;
		}
	}

	// Fallback to the first organization the user is a member of
	const member = await prisma.member.findFirst({
		where: { userId },
		include: {
			organization: true,
		},
		orderBy: { createdAt: "asc" },
	});

	if (!member) {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: "User is not a member of any organization",
		});
	}

	return member;
}

