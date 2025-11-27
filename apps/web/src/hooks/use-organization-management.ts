import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

type OrganizationInput = {
	name: string;
	slug: string;
	logo?: string;
	metadata?: Record<string, unknown>;
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
};

export function useOrganizations() {
	const queryClient = useQueryClient();

	const { data: organizationsData, isLoading } =
		authClient.organization.list.useQuery();

	// Handle different response formats from better-auth
	const organizations = Array.isArray(organizationsData)
		? organizationsData
		: organizationsData?.data || organizationsData?.organizations || [];

	const createMutation = useMutation({
		mutationFn: async (data: OrganizationInput) => {
			const { data: organization, error } =
				await authClient.organization.create({
					name: data.name,
					slug: data.slug,
					logo: data.logo,
					metadata: data.metadata,
					keepCurrentActiveOrganization: false,
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
					typeof error === "string"
						? error
						: error.message || "Failed to create organization",
				);
			}

			if (!organization) {
				throw new Error("No organization data returned");
			}

			return organization;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: authClient.organization.list.queryKey(),
			});
			toast.success("Organization created successfully");
		},
		onError: (error) => {
			toast.error(error.message || "Failed to create organization");
		},
	});

	const updateMutation = useMutation({
		mutationFn: async ({
			id,
			data,
		}: {
			id: string;
			data: Partial<OrganizationInput>;
		}) => {
			const { data: organization, error } =
				await authClient.organization.update({
					organizationId: id,
					name: data.name,
					slug: data.slug,
					logo: data.logo,
					metadata: data.metadata,
					...(data.address !== undefined && { address: data.address }),
					...(data.city !== undefined && { city: data.city }),
					...(data.state !== undefined && { state: data.state }),
					...(data.postalCode !== undefined && { postalCode: data.postalCode }),
					...(data.country !== undefined && { country: data.country }),
					...(data.phone !== undefined && { phone: data.phone }),
					...(data.email !== undefined && { email: data.email }),
					...(data.website !== undefined && { website: data.website }),
					...(data.cnpj !== undefined && { cnpj: data.cnpj }),
					...(data.type !== undefined && { type: data.type }),
				});

			if (error) {
				throw new Error(
					typeof error === "string"
						? error
						: error.message || "Failed to update organization",
				);
			}

			return organization;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: authClient.organization.list.queryKey(),
			});
			toast.success("Organization updated successfully");
		},
		onError: (error) => {
			toast.error(error.message || "Failed to update organization");
		},
	});

	const deleteMutation = useMutation({
		mutationFn: async (id: string) => {
			const { error } = await authClient.organization.delete({
				organizationId: id,
			});

			if (error) {
				throw new Error(
					typeof error === "string"
						? error
						: error.message || "Failed to delete organization",
				);
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: authClient.organization.list.queryKey(),
			});
			toast.success("Organization deleted successfully");
		},
		onError: (error) => {
			toast.error(error.message || "Failed to delete organization");
		},
	});

	const switchMutation = useMutation({
		mutationFn: async (organizationId: string) => {
			const { error } = await authClient.organization.switch({
				organizationId,
			});

			if (error) {
				throw new Error(
					typeof error === "string"
						? error
						: error.message || "Failed to switch organization",
				);
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries();
			toast.success("Switched organization successfully");
			// Reload to get updated session
			setTimeout(() => {
				window.location.reload();
			}, 300);
		},
		onError: (error) => {
			toast.error(error.message || "Failed to switch organization");
		},
	});

	return {
		organizations: organizations || [],
		isLoading,
		createOrganization: createMutation.mutateAsync,
		updateOrganization: updateMutation.mutateAsync,
		deleteOrganization: deleteMutation.mutateAsync,
		switchOrganization: switchMutation.mutateAsync,
		isCreating: createMutation.isPending,
		isUpdating: updateMutation.isPending,
		isDeleting: deleteMutation.isPending,
		isSwitching: switchMutation.isPending,
	};
}
