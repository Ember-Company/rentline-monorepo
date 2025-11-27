import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";

// Query key for organization details
const ORGANIZATION_DETAILS_QUERY_KEY = (organizationId: string) => [
	"organization",
	"details",
	organizationId,
];

interface OrganizationDetails {
	id: string;
	name: string;
	slug: string;
	logo?: string | null;
	email?: string | null;
	phone?: string | null;
	website?: string | null;
	cnpj?: string | null;
	address?: string | null;
	city?: string | null;
	state?: string | null;
	postalCode?: string | null;
	country?: string | null;
	type?: string | null;
	members?: Array<{
		id: string;
		userId: string;
		role: string;
		createdAt: string;
		user: {
			id: string;
			name?: string;
			email: string;
			image?: string;
		};
	}>;
	invitations?: Array<{
		id: string;
		email: string;
		role: string;
		status: string;
		expiresAt: string;
	}>;
}

export function useOrganizationDetails(organizationId: string | null | undefined) {
	return useQuery({
		queryKey: ORGANIZATION_DETAILS_QUERY_KEY(organizationId || ""),
		queryFn: async () => {
			if (!organizationId) {
				throw new Error("Organization ID is required");
			}

			const result = await authClient.organization.getFullOrganization({
				organizationId,
			});

			if (result.error) {
				const errorMsg =
					typeof result.error === "string"
						? result.error
						: result.error.message || "Failed to fetch organization";
				throw new Error(errorMsg);
			}

			return result.data as unknown as OrganizationDetails;
		},
		enabled: !!organizationId, // Only run query if organizationId is provided
		staleTime: 2 * 60 * 1000, // Consider data fresh for 2 minutes
		gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
		retry: 1,
		refetchOnMount: false, // Don't refetch if data is fresh
		refetchOnWindowFocus: false, // Don't refetch on window focus
		refetchOnReconnect: true, // Only refetch on reconnect
	});
}

// Export query key factory for invalidation
export { ORGANIZATION_DETAILS_QUERY_KEY };

