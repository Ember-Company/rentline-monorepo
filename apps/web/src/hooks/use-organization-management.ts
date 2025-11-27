import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

type OrganizationInput = {
	name: string;
	slug: string;
	logo?: string;
	metadata?: Record<string, unknown>;
	address?: string;
	city?: string;
	state?: string;
	postalCode?: string;
	country?: string;
	phone?: string;
	email?: string;
	website?: string;
	cnpj?: string;
	type?: string;
};

type Organization = {
	id: string;
	name: string;
	slug: string;
	logo?: string | null;
	createdAt?: Date | string;
	metadata?: string | null | Record<string, unknown>;
	address?: string | null;
	city?: string | null;
	state?: string | null;
	postalCode?: string | null;
	country?: string | null;
	phone?: string | null;
	email?: string | null;
	website?: string | null;
	cnpj?: string | null;
	type?: string | null;
};

// Query key for organizations
const ORGANIZATIONS_QUERY_KEY = ["organizations", "list"];

export function useOrganizations() {
	const queryClient = useQueryClient();
	const { data: session, refetch: refetchSession } = authClient.useSession();
	const hasAttemptedAutoSelect = useRef(false);

	// Use React Query to cache organizations - prevents duplicate requests
	// All components using this hook will share the same cached data
	const {
		data: organizations = [],
		isLoading,
		error: queryError,
		refetch: refetchOrganizations,
	} = useQuery({
		queryKey: ORGANIZATIONS_QUERY_KEY,
		queryFn: async () => {
			const response = (await authClient.organization.list()) as {
				data?: Organization[];
				error?: { message?: string } | string | null;
			};

			// Handle the response - better-auth returns { data } or { error }
			if (response.error) {
				const errorMsg =
					typeof response.error === "string"
						? response.error
						: response.error.message || "Failed to fetch organizations";
				throw new Error(errorMsg);
			}

			// Extract organizations from response
			const orgs =
				response.data && Array.isArray(response.data) ? response.data : [];

			return orgs;
		},
		staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
		gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
		retry: 1,
		refetchOnMount: false, // Don't refetch if data is fresh
		refetchOnWindowFocus: false, // Don't refetch on window focus
		refetchOnReconnect: true, // Only refetch on reconnect
	});

	// Update ref for auto-select logic
	const organizationsRef = useRef<Organization[]>(organizations);
	useEffect(() => {
		organizationsRef.current = organizations;
	}, [organizations]);

	// Helper to refetch organizations
	const fetchOrganizations = useCallback(async () => {
		await refetchOrganizations();
	}, [refetchOrganizations]);

	// Auto-select first organization if none is active
	const autoSelectFirstOrg = useCallback(async () => {
		// Prevent multiple attempts
		if (hasAttemptedAutoSelect.current) {
			return;
		}

		const { data: currentSession } = await authClient.getSession();
		const currentOrgId =
			(currentSession?.user as { activeOrganizationId?: string })
				?.activeOrganizationId ||
			(currentSession?.session as { activeOrganizationId?: string })
				?.activeOrganizationId;

		// Use ref to get current organizations without causing re-renders
		const currentOrgs = organizationsRef.current;

		// If no active org and we have organizations, select the first one
		if (!currentOrgId && currentOrgs.length > 0) {
			const firstOrg = currentOrgs[0];
			if (firstOrg?.id) {
				// Mark as attempted before making the call
				hasAttemptedAutoSelect.current = true;
				try {
					const { error } = await authClient.organization.setActive({
						organizationId: firstOrg.id,
					});

					if (error) {
						console.error("Failed to auto-select organization:", error);
						hasAttemptedAutoSelect.current = false; // Reset on error so we can retry
					} else {
						// Wait for session to update
						await new Promise((resolve) => setTimeout(resolve, 200));
						await authClient.getSession();
						queryClient.invalidateQueries();
					}
				} catch (err) {
					console.error("Error auto-selecting organization:", err);
					hasAttemptedAutoSelect.current = false; // Reset on error so we can retry
				}
			}
		} else if (currentOrgId) {
			// If there's already an active org, mark as attempted
			hasAttemptedAutoSelect.current = true;
		}
	}, [queryClient]); // No longer depends on organizations array

	// No need for initial fetch - React Query handles it automatically

	// Auto-select first org when organizations are loaded and no active org
	// This effect runs only once globally (shared ref prevents multiple executions across components)
	useEffect(() => {
		// Only run once when organizations are first loaded and we have a session
		if (
			!isLoading &&
			organizations.length > 0 &&
			!hasAttemptedAutoSelect.current &&
			session // Ensure we have a session before checking
		) {
			const currentOrgId =
				(session.user as { activeOrganizationId?: string })
					?.activeOrganizationId ||
				(session.session as { activeOrganizationId?: string })
					?.activeOrganizationId;

			if (!currentOrgId) {
				autoSelectFirstOrg();
			} else {
				// If there's already an active org, mark as attempted to prevent future attempts
				hasAttemptedAutoSelect.current = true;
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isLoading, organizations.length, session?.user?.id]); // Include session user ID to track session changes

	// Create organization mutation
	const createMutation = useMutation({
		mutationFn: async (data: OrganizationInput) => {
			const { data: organization, error } =
				await authClient.organization.create({
					name: data.name,
					slug: data.slug,
					...(data.logo && { logo: data.logo }),
					...(data.metadata && { metadata: data.metadata }),
					...(data.address && { address: data.address }),
					...(data.city && { city: data.city }),
					...(data.state && { state: data.state }),
					...(data.postalCode && { postalCode: data.postalCode }),
					...(data.country && { country: data.country }),
					...(data.phone && { phone: data.phone }),
					...(data.email && { email: data.email }),
					...(data.website && { website: data.website }),
					...(data.cnpj && { cnpj: data.cnpj }),
					...(data.type && { type: data.type }),
				});

			if (error) {
				throw new Error(
					typeof error === "string"
						? error
						: (error as { message?: string }).message ||
								"Failed to create organization",
				);
			}

			if (!organization) {
				throw new Error("No organization data returned");
			}

			return organization;
		},
		onSuccess: async (organization) => {
			// Auto-select the newly created organization first
			if (organization?.id) {
				try {
					await authClient.organization.setActive({
						organizationId: organization.id,
					});
					hasAttemptedAutoSelect.current = true; // Mark as attempted

					// Wait for session to update
					await new Promise((resolve) => setTimeout(resolve, 200));
					await authClient.getSession();

					// Invalidate organizations query to refetch
					queryClient.invalidateQueries({ queryKey: ORGANIZATIONS_QUERY_KEY });

					// Invalidate queries to refetch with new organization
					queryClient.invalidateQueries();
				} catch (err) {
					console.error("Failed to set new org as active:", err);
					// Still invalidate organizations query even if setting active failed
					queryClient.invalidateQueries({ queryKey: ORGANIZATIONS_QUERY_KEY });
				}
			} else {
				// Invalidate organizations query even if no org ID
				queryClient.invalidateQueries({ queryKey: ORGANIZATIONS_QUERY_KEY });
			}

			toast.success("Organização criada com sucesso");
		},
		onError: (error) => {
			toast.error(error.message || "Falha ao criar organização");
		},
	});

	// Update organization mutation
	const updateMutation = useMutation({
		mutationFn: async ({
			id,
			data,
		}: {
			id: string;
			data: Partial<OrganizationInput>;
		}) => {
			// Build update data with all fields
			const updateData: Record<string, unknown> = {};

			if (data.name) updateData.name = data.name;
			if (data.slug) updateData.slug = data.slug;
			if (data.logo !== undefined) updateData.logo = data.logo;
			if (data.metadata) updateData.metadata = data.metadata;
			if (data.address !== undefined) updateData.address = data.address;
			if (data.city !== undefined) updateData.city = data.city;
			if (data.state !== undefined) updateData.state = data.state;
			if (data.postalCode !== undefined)
				updateData.postalCode = data.postalCode;
			if (data.country !== undefined) updateData.country = data.country;
			if (data.phone !== undefined) updateData.phone = data.phone;
			if (data.email !== undefined) updateData.email = data.email;
			if (data.website !== undefined) updateData.website = data.website;
			if (data.cnpj !== undefined) updateData.cnpj = data.cnpj;
			if (data.type !== undefined) updateData.type = data.type;

			const { data: organization, error } =
				await authClient.organization.update({
					organizationId: id,
					data: updateData,
				});

			if (error) {
				throw new Error(
					typeof error === "string"
						? error
						: (error as { message?: string }).message ||
								"Failed to update organization",
				);
			}

			return organization;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ORGANIZATIONS_QUERY_KEY });
			toast.success("Organização atualizada com sucesso");
		},
		onError: (error) => {
			toast.error(error.message || "Falha ao atualizar organização");
		},
	});

	// Delete organization mutation
	const deleteMutation = useMutation({
		mutationFn: async (id: string) => {
			const { error } = await authClient.organization.delete({
				organizationId: id,
			});

			if (error) {
				throw new Error(
					typeof error === "string"
						? error
						: (error as { message?: string }).message ||
								"Failed to delete organization",
				);
			}
		},
		onSuccess: async () => {
			// Reset auto-select flag when deleting
			hasAttemptedAutoSelect.current = false;

			// Invalidate organizations query
			queryClient.invalidateQueries({ queryKey: ORGANIZATIONS_QUERY_KEY });

			// If we deleted the active org, select the first remaining one
			// Use ref to get updated organizations after fetch
			const remainingOrgs = organizationsRef.current;
			const { data: currentSession } = await authClient.getSession();
			const currentOrgId = (
				currentSession?.user as { activeOrganizationId?: string }
			)?.activeOrganizationId;
			if (!currentOrgId && remainingOrgs.length > 0) {
				hasAttemptedAutoSelect.current = true; // Prevent loop
				await autoSelectFirstOrg();
			}

			toast.success("Organização excluída com sucesso");
		},
		onError: (error) => {
			toast.error(error.message || "Falha ao excluir organização");
		},
	});

	// Track if a switch is in progress to prevent duplicates
	const isSwitchingRef = useRef(false);

	// Switch organization mutation
	const switchMutation = useMutation({
		mutationFn: async (organizationId: string) => {
			// Prevent duplicate requests
			if (isSwitchingRef.current) {
				throw new Error("Organization switch already in progress");
			}

			isSwitchingRef.current = true;

			try {
				const { error } = await authClient.organization.setActive({
					organizationId,
				});

				if (error) {
					throw new Error(
						typeof error === "string"
							? error
							: (error as { message?: string }).message ||
									"Failed to switch organization",
					);
				}

				// Wait for session to update on server
				await new Promise((resolve) => setTimeout(resolve, 400));

				// Refresh session multiple times to ensure it's updated
				let updatedSession = await authClient.getSession();
				let attempts = 0;
				const maxAttempts = 3;

				// Verify the session actually updated
				while (attempts < maxAttempts) {
					const sessionOrgId =
						(updatedSession?.data?.user as { activeOrganizationId?: string })
							?.activeOrganizationId ||
						(updatedSession?.data?.session as { activeOrganizationId?: string })
							?.activeOrganizationId;

					if (sessionOrgId === organizationId) {
						break; // Session is updated correctly
					}

					// Wait and try again
					await new Promise((resolve) => setTimeout(resolve, 200));
					updatedSession = await authClient.getSession();
					attempts++;
				}
			} finally {
				// Reset flag after a delay to allow the mutation to complete
				setTimeout(() => {
					isSwitchingRef.current = false;
				}, 1500);
			}
		},
		onSuccess: async () => {
			// Prevent auto-select from interfering
			hasAttemptedAutoSelect.current = true;

			// Wait a bit more to ensure session is fully propagated
			await new Promise((resolve) => setTimeout(resolve, 200));

			// Force refetch the session hook to update all components
			await refetchSession();

			// Invalidate all queries to refetch with new organization context
			// This will cause all data queries to refetch with the new organization
			queryClient.invalidateQueries();

			// Invalidate organizations query
			queryClient.invalidateQueries({ queryKey: ORGANIZATIONS_QUERY_KEY });

			toast.success("Organização alterada com sucesso");
		},
		onError: (error) => {
			isSwitchingRef.current = false;
			toast.error(error.message || "Falha ao trocar de organização");
		},
	});

	return {
		organizations,
		isLoading,
		error: queryError as Error | null,
		refetch: fetchOrganizations,
		createOrganization: createMutation.mutateAsync,
		updateOrganization: updateMutation.mutateAsync,
		deleteOrganization: deleteMutation.mutateAsync,
		switchOrganization: switchMutation.mutateAsync,
		isCreating: createMutation.isPending,
		isUpdating: updateMutation.isPending,
		isDeleting: deleteMutation.isPending,
		isSwitching: switchMutation.isPending,
	};
}
