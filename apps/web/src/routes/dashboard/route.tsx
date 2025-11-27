import { Spinner } from "@heroui/react";
import { Navigate, Outlet } from "react-router";
import { DashboardHeader } from "@/components/dashboard/header";
import { Sidebar } from "@/components/dashboard/sidebar";
import { authClient } from "@/lib/auth-client";
import { useCustomTheme } from "@/components/theme-provider";

export default function DashboardLayout() {
	const { data: session, isPending } = authClient.useSession();
	const { sidebarCollapsed, compactMode } = useCustomTheme();

	if (isPending) {
		return (
			<div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
				<div className="text-center">
					<Spinner size="lg" color="primary" />
					<p className="mt-4 text-gray-600 dark:text-gray-400">Carregando...</p>
				</div>
			</div>
		);
	}

	if (!session) {
		return <Navigate to="/auth/login" replace />;
	}

	const hasCompletedOnboarding = session.user?.hasOnboarded ?? false;

	if (!hasCompletedOnboarding) {
		return <Navigate to="/onboarding" replace />;
	}

	const sidebarWidth = sidebarCollapsed ? "lg:pl-16" : "lg:pl-56";
	const padding = compactMode ? "p-4" : "p-6";

	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900">
			<Sidebar />
			<div className={`flex flex-col transition-all duration-200 ${sidebarWidth}`}>
				<DashboardHeader />
				<main className={`flex-1 ${padding}`}>
					<Outlet />
				</main>
			</div>
		</div>
	);
}
