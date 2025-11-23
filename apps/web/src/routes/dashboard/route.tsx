import { Outlet } from "react-router";
import { authClient } from "@/lib/auth-client";
import { Navigate } from "react-router";
import { Sidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";

export default function DashboardLayout() {
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

	if (!session) {
		return <Navigate to="/auth/login" replace />;
	}

	// Check if user has completed onboarding from database
	const hasCompletedOnboarding = session.user?.hasOnboarded ?? false;

	if (!hasCompletedOnboarding) {
		return <Navigate to="/onboarding" replace />;
	}

	return (
		<div className="min-h-screen bg-gray-50 flex">
			<Sidebar />
			<div className="flex-1 lg:ml-64 flex flex-col">
				<DashboardHeader />
				<main className="flex-1 p-6">
					<Outlet />
				</main>
			</div>
		</div>
	);
}
