import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
	CreatePropertyInput,
	PropertyCategory,
	PropertyStatus,
	PropertyType,
} from "@/lib/types/api";
import { trpc } from "@/utils/trpc";

interface ListPropertiesInput {
	type?: PropertyType;
	category?: PropertyCategory;
	status?: PropertyStatus;
	search?: string;
	limit?: number;
	offset?: number;
}

export function useProperties(input?: ListPropertiesInput) {
	return useQuery({
		...trpc.properties.list.queryOptions(input),
	});
}

export function useProperty(id: string) {
	return useQuery({
		...trpc.properties.getById.queryOptions({ id }),
		enabled: !!id,
	});
}

export function usePropertyStats(id: string) {
	return useQuery({
		...trpc.properties.getStats.queryOptions({ id }),
		enabled: !!id,
	});
}

export function useCreateProperty() {
	const queryClient = useQueryClient();
	return useMutation({
		...trpc.properties.create.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["properties"] });
		},
	});
}

export function useUpdateProperty() {
	const queryClient = useQueryClient();
	return useMutation({
		...trpc.properties.update.mutationOptions(),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["properties"] });
			queryClient.invalidateQueries({
				queryKey: ["properties", "getById", { id: data.property.id }],
			});
		},
	});
}

export function useDeleteProperty() {
	const queryClient = useQueryClient();
	return useMutation({
		...trpc.properties.delete.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["properties"] });
		},
	});
}
