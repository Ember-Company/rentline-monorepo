import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";

type ProfileUpdateInput = {
	name?: string;
	phone?: string;
	dateOfBirth?: string;
	address?: string;
	city?: string;
	state?: string;
	postalCode?: string;
	country?: string;
	preferredLanguage?: string;
	userType?: string;
};

export function useProfile() {
	const queryClient = useQueryClient();
	const { data: session } = authClient.useSession();

	const updateProfileMutation = useMutation(
		trpc.user.updateProfile.mutationOptions(),
	);

	const updateProfile = async (data: ProfileUpdateInput) => {
		try {
			await updateProfileMutation.mutateAsync(data);
			queryClient.invalidateQueries({
				queryKey: authClient.useSession.queryKey(),
			});
			toast.success("Profile updated successfully");
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to update profile",
			);
			throw error;
		}
	};

	return {
		profile: session?.user,
		updateProfile,
		isUpdating: updateProfileMutation.isPending,
	};
}

