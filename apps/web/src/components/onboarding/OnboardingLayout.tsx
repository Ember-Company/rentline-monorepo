import { Button, Progress } from "@heroui/react";
import {
	ArrowLeft,
	Building2,
	Check,
	CheckCircle,
	Home,
	Palette,
	Sparkles,
} from "lucide-react";
import type { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router";

type OnboardingStep = {
	path: string;
	label: string;
	step: number;
	icon: typeof Building2;
	description: string;
};

const onboardingSteps: OnboardingStep[] = [
	{
		path: "/onboarding/organization",
		label: "Empresa",
		step: 1,
		icon: Building2,
		description: "Dados básicos",
	},
	{
		path: "/onboarding/branding",
		label: "Identidade",
		step: 2,
		icon: Palette,
		description: "Logo e marca",
	},
	{
		path: "/onboarding/properties",
		label: "Imóveis",
		step: 3,
		icon: Home,
		description: "Primeiros cadastros",
	},
	{
		path: "/onboarding/complete",
		label: "Pronto!",
		step: 4,
		icon: CheckCircle,
		description: "Finalizar",
	},
];

type OnboardingLayoutProps = {
	children: ReactNode;
	title: string;
	description?: string;
	showProgress?: boolean;
	showBack?: boolean;
	backTo?: string;
};

export function OnboardingLayout({
	children,
	title,
	description,
	showProgress = true,
	showBack = true,
	backTo,
}: OnboardingLayoutProps) {
	const location = useLocation();
	const navigate = useNavigate();

	// Find current step based on pathname
	const getCurrentStep = () => {
		const path = location.pathname;
		for (const step of onboardingSteps) {
			if (path.includes(step.path.split("/").pop() || "")) {
				return step.step;
			}
		}
		return 1;
	};

	const currentStep = getCurrentStep();
	const totalSteps = onboardingSteps.length;
	const progress = (currentStep / totalSteps) * 100;

	// Get previous step path
	const getPreviousPath = () => {
		if (backTo) return backTo;
		const currentIndex = onboardingSteps.findIndex(
			(s) => s.step === currentStep,
		);
		if (currentIndex > 0) {
			return onboardingSteps[currentIndex - 1].path;
		}
		return null;
	};

	const previousPath = getPreviousPath();

	return (
		<div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 via-white to-primary-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-primary-950/20">
			{/* Top Bar */}
			<header className="sticky top-0 z-50 border-b border-gray-200/50 bg-white/80 backdrop-blur-xl dark:border-gray-800/50 dark:bg-gray-900/80">
				<div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
					{/* Logo & Back */}
					<div className="flex items-center gap-4">
						{showBack && previousPath && currentStep > 1 && (
							<Button
								isIconOnly
								variant="light"
								size="sm"
								onPress={() => navigate(previousPath)}
								className="text-gray-500"
							>
								<ArrowLeft className="h-4 w-4" />
							</Button>
						)}
						<Link to="/" className="flex items-center gap-2">
							<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
								<Building2 className="h-4 w-4 text-white" />
							</div>
							<span className="hidden font-bold text-gray-900 sm:inline dark:text-white">
								Rentline
							</span>
						</Link>
					</div>

					{/* Progress indicator */}
					{showProgress && (
						<div className="flex items-center gap-3">
							<div className="hidden items-center gap-2 sm:flex">
								{onboardingSteps.map((step, index) => {
									const isCompleted = step.step < currentStep;
									const isActive = step.step === currentStep;

									return (
										<div key={step.step} className="flex items-center">
											<div
												className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-all ${
													isCompleted
														? "bg-green-500 text-white"
														: isActive
															? "bg-primary text-white"
															: "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
												}`}
											>
												{isCompleted ? (
													<Check className="h-3.5 w-3.5" />
												) : (
													step.step
												)}
											</div>
											{index < onboardingSteps.length - 1 && (
												<div
													className={`mx-1 h-0.5 w-6 rounded ${
														isCompleted
															? "bg-green-500"
															: "bg-gray-200 dark:bg-gray-700"
													}`}
												/>
											)}
										</div>
									);
								})}
							</div>

							{/* Mobile progress */}
							<div className="flex items-center gap-2 sm:hidden">
								<span className="text-xs font-medium text-gray-600 dark:text-gray-400">
									{currentStep}/{totalSteps}
								</span>
								<Progress
									value={progress}
									size="sm"
									color="primary"
									className="w-16"
								/>
							</div>
						</div>
					)}

					{/* Help link */}
					<a
						href="mailto:suporte@rentline.com.br"
						className="text-xs text-gray-500 hover:text-primary dark:text-gray-400"
					>
						Precisa de ajuda?
					</a>
				</div>
			</header>

			{/* Main Content */}
			<main className="flex flex-1 flex-col">
				<div className="mx-auto flex w-full max-w-5/6 flex-1 flex-col px-4 py-8 lg:flex-row lg:gap-12 lg:py-12">
					{/* Left side - Form */}
					<div className="flex flex-1 flex-col lg:max-w-5xl">
						{/* Step indicator for desktop */}
						<div className="mb-6 hidden lg:block">
							<div className="flex items-center gap-2">
								{onboardingSteps[currentStep - 1] && (
									<>
										<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
											{(() => {
												const Icon = onboardingSteps[currentStep - 1].icon;
												return <Icon className="h-5 w-5 text-primary" />;
											})()}
										</div>
										<div>
											<p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
												Passo {currentStep} de {totalSteps}
											</p>
											<p className="text-sm font-medium text-gray-700 dark:text-gray-300">
												{onboardingSteps[currentStep - 1].description}
											</p>
										</div>
									</>
								)}
							</div>
						</div>

						{/* Header */}
						<div className="mb-6">
							<h1 className="text-2xl font-bold text-gray-900 dark:text-white lg:text-3xl">
								{title}
							</h1>
							{description && (
								<p className="mt-2 text-gray-600 dark:text-gray-400">
									{description}
								</p>
							)}
						</div>

						{/* Form Content */}
						<div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 lg:p-8">
							{children}
						</div>
					</div>

					{/* Right side - Preview/Benefits */}
					<div className="mt-8 hidden flex-1 lg:mt-0 lg:flex lg:flex-col lg:justify-center">
						<div className="rounded-2xl border border-gray-200/50 bg-gradient-to-br from-primary-50 to-primary-100/50 p-8 dark:border-gray-800 dark:from-primary-950/30 dark:to-primary-900/20">
							{/* Feature highlights */}
							<div className="mb-6 flex items-center gap-3">
								<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
									<Sparkles className="h-6 w-6 text-white" />
								</div>
								<div>
									<h3 className="font-semibold text-gray-900 dark:text-white">
										Configure em minutos
									</h3>
									<p className="text-sm text-gray-600 dark:text-gray-400">
										Processo simples e rápido
									</p>
								</div>
							</div>

							{/* Benefits list */}
							<div className="space-y-4">
								{[
									"Gestão completa de imóveis e contratos",
									"Controle financeiro automatizado",
									"Relatórios e métricas em tempo real",
									"Comunicação direta com inquilinos",
									"Lembretes automáticos de vencimento",
								].map((benefit, i) => (
									<div key={i} className="flex items-start gap-3">
										<div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/20">
											<Check className="h-3 w-3 text-primary" />
										</div>
										<p className="text-sm text-gray-700 dark:text-gray-300">
											{benefit}
										</p>
									</div>
								))}
							</div>

							{/* Stats preview */}
							<div className="mt-8 grid grid-cols-3 gap-4">
								{[
									{ label: "Imóveis", value: "∞" },
									{ label: "Contratos", value: "∞" },
									{ label: "Usuários", value: "5+" },
								].map((stat) => (
									<div
										key={stat.label}
										className="rounded-xl bg-white/60 p-3 text-center dark:bg-gray-900/40"
									>
										<p className="text-xl font-bold text-primary">
											{stat.value}
										</p>
										<p className="text-xs text-gray-600 dark:text-gray-400">
											{stat.label}
										</p>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</main>

			{/* Footer */}
			<footer className="border-t border-gray-200/50 bg-white/50 py-4 dark:border-gray-800/50 dark:bg-gray-900/50">
				<div className="mx-auto max-w-5xl px-4 text-center">
					<p className="text-xs text-gray-500 dark:text-gray-400">
						© {new Date().getFullYear()} Rentline. Todos os direitos reservados.
					</p>
				</div>
			</footer>
		</div>
	);
}
