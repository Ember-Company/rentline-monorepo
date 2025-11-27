import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { MaintenancePriority, MaintenanceStatus } from "@/lib/types/api";
import { trpc } from "@/utils/trpc";

interface ListMaintenanceInput {
	propertyId?: string;
	unitId?: string;
	status?: MaintenanceStatus;
	priority?: MaintenancePriority;
	assignedTo?: string;
	limit?: number;
	offset?: number;
}

interface MaintenanceStatsInput {
	propertyId?: string;
}

export function useMaintenanceRequests(input?: ListMaintenanceInput) {
	return useQuery({
		...trpc.maintenance.list.queryOptions(input),
	});
}

export function useMaintenanceRequest(id: string) {
	return useQuery({
		...trpc.maintenance.getById.queryOptions({ id }),
		enabled: !!id,
	});
}

export function useMaintenanceStats(input?: MaintenanceStatsInput) {
	return useQuery({
		...trpc.maintenance.getStats.queryOptions(input),
	});
}

export function useCreateMaintenanceRequest() {
	const queryClient = useQueryClient();
	return useMutation({
		...trpc.maintenance.create.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["maintenance"] });
		},
	});
}

export function useUpdateMaintenanceRequest() {
	const queryClient = useQueryClient();
	return useMutation({
		...trpc.maintenance.update.mutationOptions(),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["maintenance"] });
			queryClient.invalidateQueries({
				queryKey: ["maintenance", "getById", { id: data.request.id }],
			});
		},
	});
}

export function useDeleteMaintenanceRequest() {
	const queryClient = useQueryClient();
	return useMutation({
		...trpc.maintenance.delete.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["maintenance"] });
		},
	});
}

export function useAssignMaintenanceRequest() {
	const queryClient = useQueryClient();
	return useMutation({
		...trpc.maintenance.assign.mutationOptions(),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["maintenance"] });
			queryClient.invalidateQueries({
				queryKey: ["maintenance", "getById", { id: data.request.id }],
			});
		},
	});
}

export function useCloseMaintenanceRequest() {
	const queryClient = useQueryClient();
	return useMutation({
		...trpc.maintenance.close.mutationOptions(),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["maintenance"] });
			queryClient.invalidateQueries({
				queryKey: ["maintenance", "getById", { id: data.request.id }],
			});
		},
	});
}
