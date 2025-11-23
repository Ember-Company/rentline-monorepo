import type { Route } from "./+types/route";
import { Outlet, Navigate } from "react-router";
import { authClient } from "@/lib/auth-client";

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "Onboarding - Rentline" },
		{ name: "description", content: "Complete your onboarding setup" },
	];
}

export default function OnboardingLayout() {
	const { data: session, isPending } = authClient.useSession();

	if (isPending) {
		return (
			<div className="flex items-center justify-center h-screen">
				<div className="text-center">
					<p>Loading...</p>
				</div>
			</div>
		);
	}

	// Redirect unauthenticated users to login
	if (!session) {
		return <Navigate to="/auth/login" replace />;
	}

	// Check if user has already onboarded
	const hasOnboarded = session.user?.hasOnboarded ?? false;
	if (hasOnboarded) {
		return <Navigate to="/dashboard" replace />;
	}

	return (
		<div className="min-h-screen bg-white">
			<Outlet />
		</div>
	);
}
