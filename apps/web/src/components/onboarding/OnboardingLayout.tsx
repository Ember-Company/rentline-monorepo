import { ReactNode } from "react";
import { useLocation } from "react-router";

type OnboardingStep = {
	path: string;
	label: string;
	step: number;
};

const onboardingSteps: OnboardingStep[] = [
	{ path: "/onboarding/organization", label: "Organization", step: 1 },
	{ path: "/onboarding/branding", label: "Branding", step: 2 },
	{ path: "/onboarding/team", label: "Team", step: 3 },
	{ path: "/onboarding/properties", label: "Properties", step: 4 },
	{ path: "/onboarding/plan", label: "Plan", step: 5 },
	{ path: "/onboarding/payment", label: "Payment", step: 6 },
	{ path: "/onboarding/complete", label: "Complete", step: 7 },
];

type OnboardingLayoutProps = {
	children: ReactNode;
	title: string;
	description?: string;
	showProgress?: boolean;
};

export function OnboardingLayout({
	children,
	title,
	description,
	showProgress = true,
}: OnboardingLayoutProps) {
	const location = useLocation();
	
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

	return (
		<div className="min-h-screen bg-white flex">
			{/* Left Side - Form */}
			<div className="flex-1 flex flex-col lg:w-1/2 xl:w-2/5">
				<div className="flex-1 flex flex-col justify-center px-6 sm:px-8 lg:px-12 py-12">
					{/* Progress Indicator */}
					{showProgress && (
						<div className="mb-8">
							<div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
								{onboardingSteps.slice(0, 3).map((step, index) => (
									<div key={step.step} className="flex items-center">
										<div
											className={`flex items-center justify-center w-7 h-7 rounded-full font-semibold text-xs transition-all ${
												step.step === currentStep
													? "bg-gray-900 text-white scale-110"
													: step.step < currentStep
														? "bg-gray-900 text-white"
														: "bg-gray-200 text-gray-500"
											}`}
										>
											{step.step < currentStep ? (
												<svg
													className="w-3.5 h-3.5"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={3}
														d="M5 13l4 4L19 7"
													/>
												</svg>
											) : (
												step.step
											)}
										</div>
										{index < Math.min(2, onboardingSteps.length - 1) && (
											<div
												className={`h-0.5 w-6 mx-0.5 transition-colors ${
													step.step < currentStep ? "bg-gray-900" : "bg-gray-200"
												}`}
											/>
										)}
									</div>
								))}
								{onboardingSteps.length > 3 && (
									<span className="ml-2 text-xs text-gray-400">
										{onboardingSteps.length - 3} more
									</span>
								)}
							</div>
						</div>
					)}

					{/* Logo */}
					<div className="mb-8">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
								<div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
									<div className="w-3 h-3 rounded-full bg-white" />
								</div>
							</div>
							<span className="text-2xl font-bold text-gray-900">Rentline</span>
						</div>
					</div>

					{/* Heading */}
					<div className="mb-8">
						<h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
							{title}
						</h1>
						{description && (
							<p className="text-base text-gray-600 leading-relaxed max-w-lg">
								{description}
							</p>
						)}
					</div>

					{/* Form Content */}
					<div className="flex-1 max-w-lg">{children}</div>
				</div>
			</div>

			{/* Right Side - Dashboard Preview */}
			<div className="hidden lg:flex lg:w-1/2 xl:w-3/5 bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100 border-l border-gray-200">
				<div className="flex-1 flex items-center justify-center p-8 xl:p-12">
					<div className="w-full max-w-3xl">
						{/* Placeholder for dashboard screenshot */}
						<div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
							{/* Browser-like header */}
							<div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
								<div className="flex gap-1.5">
									<div className="w-3 h-3 rounded-full bg-red-400" />
									<div className="w-3 h-3 rounded-full bg-yellow-400" />
									<div className="w-3 h-3 rounded-full bg-green-400" />
								</div>
								<div className="flex-1 mx-4 bg-white rounded-md px-3 py-1.5 text-xs text-gray-500">
									rentline.com/dashboard
								</div>
							</div>
							{/* Dashboard content placeholder */}
							<div className="p-8 bg-white">
								<div className="aspect-[4/3] bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
									<div className="text-center">
										<div className="w-20 h-20 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center">
											<svg
												className="w-10 h-10 text-primary"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
												/>
											</svg>
										</div>
										<p className="text-sm font-semibold text-gray-700 mb-1">
											Dashboard Preview
										</p>
										<p className="text-xs text-gray-500">
											Replace with your dashboard screenshot
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

