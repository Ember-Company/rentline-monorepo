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
		// Build metadata to store additional fields that better-auth might not accept directly
		const metadata: Record<string, unknown> = {
			...(data.metadata || {}),
		};

		// Add custom fields to metadata
		if (data.address) metadata.address = data.address;
		if (data.city) metadata.city = data.city;
		if (data.state) metadata.state = data.state;
		if (data.postalCode) metadata.postalCode = data.postalCode;
		if (data.country) metadata.country = data.country;
		if (data.phone) metadata.phone = data.phone;
		if (data.email) metadata.email = data.email;
		if (data.website) metadata.website = data.website;
		if (data.cnpj) metadata.cnpj = data.cnpj;
		if (data.type) metadata.type = data.type;

		// Create payload with only the fields that better-auth definitely accepts
		const payload = {
			name: data.name,
			slug: data.slug,
			...(data.logo && { logo: data.logo }),
			...(Object.keys(metadata).length > 0 && { metadata }),
		};

		console.log(
			"Creating organization with payload:",
			JSON.stringify(payload, null, 2),
		);

		const { data: organization, error } =
			await authClient.organization.create(payload);

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
