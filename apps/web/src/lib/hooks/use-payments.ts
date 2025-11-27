import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PaymentStatus, PaymentType } from "@/lib/types/api";
import { trpc } from "@/utils/trpc";

interface ListPaymentsInput {
	leaseId?: string;
	propertyId?: string;
	unitId?: string;
	type?: PaymentType;
	status?: PaymentStatus;
	dateFrom?: string;
	dateTo?: string;
	limit?: number;
	offset?: number;
}

interface PaymentSummaryInput {
	leaseId?: string;
	propertyId?: string;
	year?: number;
	month?: number;
}

export function usePayments(input?: ListPaymentsInput) {
	return useQuery({
		...trpc.payments.list.queryOptions(input),
	});
}

export function usePayment(id: string) {
	return useQuery({
		...trpc.payments.getById.queryOptions({ id }),
		enabled: !!id,
	});
}

export function usePaymentSummary(input?: PaymentSummaryInput) {
	return useQuery({
		...trpc.payments.getSummary.queryOptions(input),
	});
}

export function usePaymentMethods() {
	return useQuery({
		...trpc.payments.getPaymentMethods.queryOptions(),
	});
}

export function useCreatePayment() {
	const queryClient = useQueryClient();
	return useMutation({
		...trpc.payments.create.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["payments"] });
			queryClient.invalidateQueries({ queryKey: ["leases"] });
		},
	});
}

export function useUpdatePayment() {
	const queryClient = useQueryClient();
	return useMutation({
		...trpc.payments.update.mutationOptions(),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["payments"] });
			queryClient.invalidateQueries({
				queryKey: ["payments", "getById", { id: data.payment.id }],
			});
			queryClient.invalidateQueries({ queryKey: ["leases"] });
		},
	});
}

export function useDeletePayment() {
	const queryClient = useQueryClient();
	return useMutation({
		...trpc.payments.delete.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["payments"] });
			queryClient.invalidateQueries({ queryKey: ["leases"] });
		},
	});
}
