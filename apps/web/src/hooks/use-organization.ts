import { authClient } from "@/lib/auth-client";

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
};

export function useCreateOrganization() {
	const createOrganization = async (data: OrganizationData) => {
		console.log("Creating organization with data:", data);

		// Pass all fields directly - they are configured in the schema with input: true
		const { data: organization, error } = await authClient.organization.create({
			name: data.name,
			slug: data.slug,
			...(data.logo && { logo: data.logo }),
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
			...(data.metadata && { metadata: data.metadata }),
		});

		if (error) {
			console.error("Organization creation error:", error);
			throw new Error(
				typeof error === "string"
					? error
					: (error as { message?: string }).message ||
							"Failed to create organization",
			);
		}

		if (!organization) {
			throw new Error("No organization data returned");
		}

		console.log("Organization created successfully:", organization);
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
				typeof error === "string"
					? error
					: (error as { message?: string }).message ||
							"Failed to invite member",
			);
		}
	};

	return { inviteMember };
}
