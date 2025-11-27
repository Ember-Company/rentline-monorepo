import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";

// Types
interface InvoiceListParams {
	leaseId?: string;
	propertyId?: string;
	status?: "pending" | "paid" | "overdue" | "cancelled" | "partial";
	dueDateFrom?: string;
	dueDateTo?: string;
	includeOverdue?: boolean;
	limit?: number;
	offset?: number;
}

interface CreateInvoiceInput {
	leaseId: string;
	dueDate: string;
	amount: number;
	currencyId: string;
	invoiceNumber?: string;
	lineItems?: { description: string; amount: number; quantity: number }[];
	notes?: string;
	status?: "pending" | "paid" | "overdue" | "cancelled" | "partial";
}

interface GenerateRecurringInput {
	leaseId: string;
	startDate: string;
	endDate: string;
	amount: number;
	description?: string;
}

// Hooks
export function useInvoices(params?: InvoiceListParams) {
	return useQuery({
		...trpc.invoices.list.queryOptions(params),
	});
}

export function useInvoice(id: string) {
	return useQuery({
		...trpc.invoices.getById.queryOptions({ id }),
		enabled: !!id,
	});
}

export function useCreateInvoice() {
	const queryClient = useQueryClient();
	return useMutation({
		...trpc.invoices.create.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["invoices"] });
		},
	});
}

export function useGenerateRecurringInvoices() {
	const queryClient = useQueryClient();
	return useMutation({
		...trpc.invoices.generateRecurring.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["invoices"] });
		},
	});
}

export function useUpdateInvoice() {
	const queryClient = useQueryClient();
	return useMutation({
		...trpc.invoices.update.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["invoices"] });
		},
	});
}

export function useMarkInvoiceAsPaid() {
	const queryClient = useQueryClient();
	return useMutation({
		...trpc.invoices.markAsPaid.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["invoices"] });
			queryClient.invalidateQueries({ queryKey: ["payments"] });
		},
	});
}

export function useDeleteInvoice() {
	const queryClient = useQueryClient();
	return useMutation({
		...trpc.invoices.delete.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["invoices"] });
		},
	});
}

export function useUpdateOverdueInvoices() {
	const queryClient = useQueryClient();
	return useMutation({
		...trpc.invoices.updateOverdue.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["invoices"] });
		},
	});
}
