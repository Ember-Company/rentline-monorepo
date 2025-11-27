import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ExpenseCategory } from "@/lib/types/api";
import { trpc } from "@/utils/trpc";

interface ListExpensesInput {
	propertyId?: string;
	unitId?: string;
	category?: ExpenseCategory;
	dateFrom?: string;
	dateTo?: string;
	isTaxDeductible?: boolean;
	limit?: number;
	offset?: number;
}

interface ExpenseSummaryInput {
	propertyId?: string;
	year?: number;
	month?: number;
}

export function useExpenses(input?: ListExpensesInput) {
	return useQuery({
		...trpc.expenses.list.queryOptions(input),
	});
}

export function useExpense(id: string) {
	return useQuery({
		...trpc.expenses.getById.queryOptions({ id }),
		enabled: !!id,
	});
}

export function useExpenseSummary(input?: ExpenseSummaryInput) {
	return useQuery({
		...trpc.expenses.getSummary.queryOptions(input),
	});
}

export function useExpenseCategories() {
	return useQuery({
		...trpc.expenses.getCategories.queryOptions(),
	});
}

export function useCreateExpense() {
	const queryClient = useQueryClient();
	return useMutation({
		...trpc.expenses.create.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["expenses"] });
			queryClient.invalidateQueries({ queryKey: ["properties"] });
		},
	});
}

export function useUpdateExpense() {
	const queryClient = useQueryClient();
	return useMutation({
		...trpc.expenses.update.mutationOptions(),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["expenses"] });
			queryClient.invalidateQueries({
				queryKey: ["expenses", "getById", { id: data.expense.id }],
			});
			queryClient.invalidateQueries({ queryKey: ["properties"] });
		},
	});
}

export function useDeleteExpense() {
	const queryClient = useQueryClient();
	return useMutation({
		...trpc.expenses.delete.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["expenses"] });
			queryClient.invalidateQueries({ queryKey: ["properties"] });
		},
	});
}
