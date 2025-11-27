import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";

export function useOrganizations() {
	return useQuery({
		...trpc.organizations.list.queryOptions(),
	});
}

export function useCurrentOrganization() {
	return useQuery({
		...trpc.organizations.getCurrent.queryOptions(),
	});
}

export function useOrganization(id: string) {
	return useQuery({
		...trpc.organizations.getById.queryOptions({ id }),
		enabled: !!id,
	});
}

export function useOrganizationStats(organizationId?: string) {
	return useQuery({
		...trpc.organizations.getStats.queryOptions({ organizationId }),
	});
}

export function useOrganizationMembers(organizationId: string) {
	return useQuery({
		...trpc.organizations.getMembers.queryOptions({ organizationId }),
		enabled: !!organizationId,
	});
}

export function useCurrencies() {
	return useQuery({
		...trpc.organizations.getCurrencies.queryOptions(),
	});
}

export function useUpdateOrganization() {
	const queryClient = useQueryClient();
	return useMutation({
		...trpc.organizations.update.mutationOptions(),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["organizations"] });
			queryClient.invalidateQueries({
				queryKey: ["organizations", "getById", { id: data.organization.id }],
			});
			queryClient.invalidateQueries({
				queryKey: ["organizations", "getCurrent"],
			});
		},
	});
}

export function useUpdateOrganizationSettings() {
	const queryClient = useQueryClient();
	return useMutation({
		...trpc.organizations.updateSettings.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["organizations"] });
		},
	});
}
