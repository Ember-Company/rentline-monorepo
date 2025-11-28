import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { trpc } from "@/utils/trpc";

export function useSales(input?: {
	propertyId?: string;
	unitId?: string;
	buyerContactId?: string;
	status?: string;
	search?: string;
	includeClosed?: boolean;
	limit?: number;
	offset?: number;
}) {
	return useQuery({
		...trpc.sales.list.queryOptions(input),
		enabled: true,
	});
}

export function useSale(id: string) {
	return useQuery({
		...trpc.sales.getById.queryOptions({ id }),
		enabled: !!id,
	});
}

export function useCreateSale() {
	const queryClient = useQueryClient();

	return useMutation({
		...trpc.sales.create.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["sales"] });
			queryClient.invalidateQueries({ queryKey: ["units"] });
			queryClient.invalidateQueries({ queryKey: ["properties"] });
			toast.success("Venda criada com sucesso!");
		},
		onError: (error) => {
			toast.error(error.message || "Erro ao criar venda");
		},
	});
}

export function useUpdateSale() {
	const queryClient = useQueryClient();

	return useMutation({
		...trpc.sales.update.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["sales"] });
			queryClient.invalidateQueries({ queryKey: ["units"] });
			queryClient.invalidateQueries({ queryKey: ["properties"] });
			toast.success("Venda atualizada com sucesso!");
		},
		onError: (error) => {
			toast.error(error.message || "Erro ao atualizar venda");
		},
	});
}

export function useDeleteSale() {
	const queryClient = useQueryClient();

	return useMutation({
		...trpc.sales.delete.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["sales"] });
			queryClient.invalidateQueries({ queryKey: ["units"] });
			queryClient.invalidateQueries({ queryKey: ["properties"] });
			toast.success("Venda excluída com sucesso!");
		},
		onError: (error) => {
			toast.error(error.message || "Erro ao excluir venda");
		},
	});
}

export function useCloseSale() {
	const queryClient = useQueryClient();

	return useMutation({
		...trpc.sales.close.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["sales"] });
			queryClient.invalidateQueries({ queryKey: ["units"] });
			queryClient.invalidateQueries({ queryKey: ["properties"] });
			toast.success("Venda finalizada com sucesso!");
		},
		onError: (error) => {
			toast.error(error.message || "Erro ao finalizar venda");
		},
	});
}

