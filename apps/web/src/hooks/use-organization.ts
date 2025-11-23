import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

type OrganizationData = {
	name: string;
	slug: string;
	address?: string;
	city?: string;
	state?: string;
	postalCode?: string;
	country?: string;
	phone?: string;
	email?: string;
	website?: string;
	cnpj?: string;
	type?: string;
	logo?: string;
	metadata?: Record<string, unknown>;
	keepCurrentActiveOrganization?: boolean;
};

export function useCreateOrganization() {
	const createOrganization = async (data: OrganizationData) => {
		const { data: organization, error } = await authClient.organization.create({
			name: data.name,
			slug: data.slug,
			logo: data.logo,
			metadata: data.metadata,
			keepCurrentActiveOrganization: data.keepCurrentActiveOrganization ?? false,
			// Additional fields
			...(data.address && { address: data.address }),
			...(data.city && { city: data.city }),
			...(data.state && { state: data.state }),
			...(data.postalCode && { postalCode: data.postalCode }),
			...(data.country && { country: data.country }),
			...(data.phone && { phone: data.phone }),
			...(data.email && { email: data.email }),
			...(data.website && { website: data.website }),
			...(data.cnpj && { cnpj: data.cnpj }),
			...(data.type && { type: data.type }),
		});

		if (error) {
			throw new Error(
				typeof error === "string" ? error : error.message || "Failed to create organization",
			);
		}

		if (!organization) {
			throw new Error("No organization data returned");
		}

		return organization;
	};

	return { createOrganization };
}

export function useInviteTeamMember() {
	const inviteMember = async (email: string, role: string) => {
		const { error } = await authClient.organization.inviteMember({
			email,
			role,
		});

		if (error) {
			throw new Error(
				typeof error === "string" ? error : error.message || "Failed to invite member",
			);
		}
	};

	return { inviteMember };
}

