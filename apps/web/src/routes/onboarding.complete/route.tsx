import type { Route } from "./+types/route";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { Button } from "@heroui/react";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { useCompleteOnboarding } from "@/hooks/use-onboarding";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";

export function meta(_args: Route.MetaArgs) {
	return [{ title: "Complete Setup - Onboarding" }];
}

export default function CompleteStep() {
	const navigate = useNavigate();
	const { completeOnboarding, error, isSubmitting } = useCompleteOnboarding();
	const [hasAttempted, setHasAttempted] = useState(false);

	useEffect(() => {
		// Only attempt once on mount
		if (hasAttempted) return;

		// Check if we have onboarding data before attempting to complete
		const storedData = sessionStorage.getItem("onboarding_data");
		if (storedData) {
			try {
				const data = JSON.parse(storedData);
				// Validate that we have organization data
				if (data?.organization?.name && data?.organization?.slug) {
					setHasAttempted(true);
					completeOnboarding();
				} else {
					// Invalid data, redirect to organization step
					setHasAttempted(true);
					navigate("/onboarding/organization", { replace: true });
				}
			} catch {
				// Invalid JSON, redirect to organization step
				setHasAttempted(true);
				navigate("/onboarding/organization", { replace: true });
			}
		} else {
			// No data found, redirect to organization step
			setHasAttempted(true);
			navigate("/onboarding/organization", { replace: true });
		}
	}, [completeOnboarding, navigate, hasAttempted]);

	return (
		<OnboardingLayout
			title="Completing Setup"
			description="We're setting up your account and organization. This will only take a moment."
			showProgress={true}
		>
			<div className="flex flex-col items-center justify-center py-8">
				{isSubmitting ? (
					<>
						<Loader2 className="w-16 h-16 text-primary animate-spin mb-4" />
						<h2 className="text-2xl font-bold mb-2">Completing Setup...</h2>
						<p className="text-gray-600">
							Please wait while we set up your account
						</p>
					</>
				) : error ? (
					<>
						<XCircle className="w-16 h-16 text-red-500 mb-4" />
						<h2 className="text-2xl font-bold mb-2">Setup Failed</h2>
						<p className="text-gray-600 mb-4 text-center max-w-md">{error}</p>
						<div className="flex gap-3">
							<Button
								variant="light"
								onPress={() => navigate("/onboarding/organization")}
							>
								Go Back
							</Button>
							<Button color="primary" onPress={completeOnboarding}>
								Retry
							</Button>
						</div>
					</>
				) : (
					<>
						<CheckCircle className="w-16 h-16 text-green-500 mb-4" />
						<h2 className="text-2xl font-bold mb-2">Setup Complete!</h2>
						<p className="text-gray-600 mb-6">
							Your organization has been created successfully
						</p>
						<Button
							color="primary"
							onPress={() => navigate("/onboarding/notifications")}
						>
							Continue
						</Button>
					</>
				)}
			</div>
		</OnboardingLayout>
	);
}
