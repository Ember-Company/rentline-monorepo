import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UnitStatus, UnitType } from "@/lib/types/api";
import { trpc } from "@/utils/trpc";

interface ListUnitsInput {
	propertyId?: string;
	type?: UnitType;
	status?: UnitStatus;
	search?: string;
	limit?: number;
	offset?: number;
}

export function useUnits(input?: ListUnitsInput) {
	return useQuery({
		...trpc.units.list.queryOptions(input),
	});
}

export function useUnit(id: string) {
	return useQuery({
		...trpc.units.getById.queryOptions({ id }),
		enabled: !!id,
	});
}

export function useCreateUnit() {
	const queryClient = useQueryClient();
	return useMutation({
		...trpc.units.create.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["units"] });
			queryClient.invalidateQueries({ queryKey: ["properties"] });
		},
	});
}

export function useUpdateUnit() {
	const queryClient = useQueryClient();
	return useMutation({
		...trpc.units.update.mutationOptions(),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["units"] });
			queryClient.invalidateQueries({
				queryKey: ["units", "getById", { id: data.unit.id }],
			});
			queryClient.invalidateQueries({ queryKey: ["properties"] });
		},
	});
}

export function useDeleteUnit() {
	const queryClient = useQueryClient();
	return useMutation({
		...trpc.units.delete.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["units"] });
			queryClient.invalidateQueries({ queryKey: ["properties"] });
		},
	});
}

export function useBulkCreateUnits() {
	const queryClient = useQueryClient();
	return useMutation({
		...trpc.units.bulkCreate.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["units"] });
			queryClient.invalidateQueries({ queryKey: ["properties"] });
		},
	});
}

export function useUpdateUnitStatus() {
	const queryClient = useQueryClient();
	return useMutation({
		...trpc.units.updateStatus.mutationOptions(),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["units"] });
			queryClient.invalidateQueries({
				queryKey: ["units", "getById", { id: data.unit.id }],
			});
		},
	});
}
