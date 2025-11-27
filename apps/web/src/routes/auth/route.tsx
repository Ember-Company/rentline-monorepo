import { Spinner } from "@heroui/react";
import { BarChart3, Building2, Clock, Shield } from "lucide-react";
import { Navigate, Outlet } from "react-router";
import { authClient } from "@/lib/auth-client";

const features = [
	{
		icon: Building2,
		title: "Gestão de Imóveis",
		description:
			"Gerencie apartamentos, casas, salas comerciais e terrenos em um só lugar",
	},
	{
		icon: Shield,
		title: "Contratos Seguros",
		description:
			"Crie e gerencie contratos de locação com facilidade e segurança",
	},
	{
		icon: BarChart3,
		title: "Relatórios Financeiros",
		description: "Acompanhe pagamentos, despesas e receitas em tempo real",
	},
	{
		icon: Clock,
		title: "Automação",
		description:
			"Lembretes automáticos de vencimentos e notificações inteligentes",
	},
];

export default function AuthLayout() {
	const { data: session, isPending } = authClient.useSession();

	// Show loading spinner while checking session
	if (isPending) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gray-50">
				<Spinner size="lg" color="primary" />
			</div>
		);
	}

	// Redirect authenticated users based on onboarding status
	if (session) {
		const hasOnboarded = session.user?.hasOnboarded ?? false;
		if (hasOnboarded) {
			return <Navigate to="/dashboard" replace />;
		}
		return <Navigate to="/onboarding" replace />;
	}

	return (
		<div className="flex min-h-screen">
			{/* Left Panel - Branding */}
			<div className="relative hidden w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 lg:block">
				{/* Background Pattern */}
				<div className="absolute inset-0 opacity-10">
					<svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
						<defs>
							<pattern
								id="grid"
								width="40"
								height="40"
								patternUnits="userSpaceOnUse"
							>
								<path
									d="M 40 0 L 0 0 0 40"
									fill="none"
									stroke="white"
									strokeWidth="1"
								/>
							</pattern>
						</defs>
						<rect width="100%" height="100%" fill="url(#grid)" />
					</svg>
				</div>

				{/* Content */}
				<div className="relative flex h-full flex-col justify-between p-12">
					{/* Logo */}
					<div className="flex items-center gap-3">
						<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
							<Building2 className="h-7 w-7 text-white" />
						</div>
						<span className="font-bold text-2xl text-white">Rentline</span>
					</div>

					{/* Main Content */}
					<div className="space-y-8">
						<div>
							<h1 className="font-bold text-4xl text-white leading-tight">
								Gestão de Imóveis
								<br />
								<span className="text-primary-200">Simplificada</span>
							</h1>
							<p className="mt-4 max-w-md text-lg text-primary-100">
								A plataforma completa para administrar seus imóveis, contratos e
								inquilinos com eficiência.
							</p>
						</div>

						{/* Features */}
						<div className="grid grid-cols-2 gap-4">
							{features.map((feature, index) => (
								<div
									key={index}
									className="rounded-xl bg-white/10 p-4 backdrop-blur-sm transition-all hover:bg-white/15"
								>
									<feature.icon className="mb-3 h-6 w-6 text-primary-200" />
									<h3 className="font-semibold text-white">{feature.title}</h3>
									<p className="mt-1 text-primary-200 text-sm">
										{feature.description}
									</p>
								</div>
							))}
						</div>
					</div>

					{/* Footer */}
					<div className="text-primary-200 text-sm">
						© 2024 Rentline. Todos os direitos reservados.
					</div>
				</div>
			</div>

			{/* Right Panel - Auth Forms */}
			<div className="flex w-full items-center justify-center bg-gray-50 px-4 lg:w-1/2">
				<div className="w-full max-w-md">
					{/* Mobile Logo */}
					<div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
						<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
							<Building2 className="h-6 w-6 text-white" />
						</div>
						<span className="font-bold text-gray-900 text-xl">Rentline</span>
					</div>

					<Outlet />
				</div>
			</div>
		</div>
	);
}
