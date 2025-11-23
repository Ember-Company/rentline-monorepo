import { Outlet, Navigate } from "react-router";
import { authClient } from "@/lib/auth-client";

export default function AuthLayout() {
	const { data: session, isPending } = authClient.useSession();

	// Redirect authenticated users based on onboarding status
	if (!isPending && session) {
		const hasOnboarded = session.user?.hasOnboarded ?? false;
		if (hasOnboarded) {
			return <Navigate to="/dashboard" replace />;
		} else {
			return <Navigate to="/onboarding" replace />;
		}
	}

	return (
		<div className="flex items-center justify-center min-h-screen bg-gray-50">
			<Outlet />
		</div>
	);
}
