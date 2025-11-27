import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { LeaseStatus } from "@/lib/types/api";
import { trpc } from "@/utils/trpc";

interface ListLeasesInput {
	propertyId?: string;
	unitId?: string;
	tenantContactId?: string;
	status?: LeaseStatus;
	search?: string;
	includeExpired?: boolean;
	limit?: number;
	offset?: number;
}

export function useLeases(input?: ListLeasesInput) {
	return useQuery({
		...trpc.leases.list.queryOptions(input),
	});
}

export function useLease(id: string) {
	return useQuery({
		...trpc.leases.getById.queryOptions({ id }),
		enabled: !!id,
	});
}

export function useExpiringSoonLeases(days?: number) {
	return useQuery({
		...trpc.leases.getExpiringSoon.queryOptions(days ? { days } : undefined),
	});
}

export function useCreateLease() {
	const queryClient = useQueryClient();
	return useMutation({
		...trpc.leases.create.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["leases"] });
			queryClient.invalidateQueries({ queryKey: ["units"] });
			queryClient.invalidateQueries({ queryKey: ["properties"] });
		},
	});
}

export function useUpdateLease() {
	const queryClient = useQueryClient();
	return useMutation({
		...trpc.leases.update.mutationOptions(),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["leases"] });
			queryClient.invalidateQueries({
				queryKey: ["leases", "getById", { id: data.lease.id }],
			});
			queryClient.invalidateQueries({ queryKey: ["units"] });
			queryClient.invalidateQueries({ queryKey: ["properties"] });
		},
	});
}

export function useDeleteLease() {
	const queryClient = useQueryClient();
	return useMutation({
		...trpc.leases.delete.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["leases"] });
			queryClient.invalidateQueries({ queryKey: ["units"] });
			queryClient.invalidateQueries({ queryKey: ["properties"] });
		},
	});
}

export function useTerminateLease() {
	const queryClient = useQueryClient();
	return useMutation({
		...trpc.leases.terminate.mutationOptions(),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["leases"] });
			queryClient.invalidateQueries({
				queryKey: ["leases", "getById", { id: data.lease.id }],
			});
			queryClient.invalidateQueries({ queryKey: ["units"] });
			queryClient.invalidateQueries({ queryKey: ["properties"] });
		},
	});
}

export function useRenewLease() {
	const queryClient = useQueryClient();
	return useMutation({
		...trpc.leases.renew.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["leases"] });
			queryClient.invalidateQueries({ queryKey: ["units"] });
			queryClient.invalidateQueries({ queryKey: ["properties"] });
		},
	});
}
