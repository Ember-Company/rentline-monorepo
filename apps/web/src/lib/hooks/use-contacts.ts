import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ContactType } from "@/lib/types/api";
import { trpc } from "@/utils/trpc";

interface ListContactsInput {
	type?: ContactType;
	search?: string;
}

export function useContacts(input?: ListContactsInput) {
	return useQuery({
		...trpc.contacts.list.queryOptions(input ?? {}),
	});
}

export function useContact(id: string) {
	return useQuery({
		...trpc.contacts.getById.queryOptions({ id }),
		enabled: !!id,
	});
}

export function usePropertyContacts(propertyId: string, type?: ContactType) {
	return useQuery({
		...trpc.contacts.getByProperty.queryOptions({ propertyId, type }),
		enabled: !!propertyId,
	});
}

export function useCreateContact() {
	const queryClient = useQueryClient();
	return useMutation({
		...trpc.contacts.create.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["contacts"] });
		},
	});
}

export function useUpdateContact() {
	const queryClient = useQueryClient();
	return useMutation({
		...trpc.contacts.update.mutationOptions(),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["contacts"] });
			queryClient.invalidateQueries({
				queryKey: ["contacts", "getById", { id: data.contact.id }],
			});
		},
	});
}

export function useDeleteContact() {
	const queryClient = useQueryClient();
	return useMutation({
		...trpc.contacts.delete.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["contacts"] });
		},
	});
}

export function useLinkContactToProperty() {
	const queryClient = useQueryClient();
	return useMutation({
		...trpc.contacts.linkToProperty.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["contacts"] });
			queryClient.invalidateQueries({ queryKey: ["properties"] });
		},
	});
}

export function useUnlinkContactFromProperty() {
	const queryClient = useQueryClient();
	return useMutation({
		...trpc.contacts.unlinkFromProperty.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["contacts"] });
			queryClient.invalidateQueries({ queryKey: ["properties"] });
		},
	});
}
