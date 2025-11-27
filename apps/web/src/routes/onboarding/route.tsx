import { Spinner } from "@heroui/react";
import { Navigate, Outlet } from "react-router";
import { authClient } from "@/lib/auth-client";
import type { Route } from "./+types/route";

export function meta(_args: Route.MetaArgs) {
	return [
		{ title: "Configuração - Rentline" },
		{ name: "description", content: "Complete a configuração da sua conta" },
	];
}

export default function OnboardingLayout() {
	const { data: session, isPending } = authClient.useSession();

	if (isPending) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gray-50">
				<div className="text-center">
					<Spinner size="lg" color="primary" />
					<p className="mt-4 text-gray-600">Carregando...</p>
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

	return <Outlet />;
}
