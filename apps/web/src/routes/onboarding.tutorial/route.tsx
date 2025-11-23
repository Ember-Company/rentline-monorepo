import type { Route } from "./+types/route";
import { useNavigate } from "react-router";
import { Button } from "@heroui/react";
import { CheckCircle, Play } from "lucide-react";
import { toast } from "sonner";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";

export function meta({}: Route.MetaArgs) {
	return [{ title: "Welcome Tutorial - Onboarding" }];
}

export default function TutorialStep() {
	const navigate = useNavigate();

	const handleComplete = () => {
		toast.success("Welcome to Rentline!");
		navigate("/dashboard");
	};

	return (
		<OnboardingLayout
			title="Welcome to Rentline"
			description="Learn how to get the most out of your property management platform. Watch the tutorial or explore on your own."
			showProgress={true}
		>
			<div className="space-y-6">
				<div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center border border-gray-200">
							<div className="text-center">
								<Play className="w-16 h-16 text-gray-400 mx-auto mb-4" />
								<p className="text-gray-600">Welcome Tutorial Video</p>
								<p className="text-sm text-gray-500 mt-2">
									(Placeholder for tutorial video)
								</p>
							</div>
						</div>

						<div className="space-y-3">
							<h3 className="font-semibold">What you can do:</h3>
							<ul className="space-y-2">
								<li className="flex items-center gap-2">
									<CheckCircle className="w-5 h-5 text-green-500" />
									<span>Manage your properties and units</span>
								</li>
								<li className="flex items-center gap-2">
									<CheckCircle className="w-5 h-5 text-green-500" />
									<span>Track tenants and leases</span>
								</li>
								<li className="flex items-center gap-2">
									<CheckCircle className="w-5 h-5 text-green-500" />
									<span>Process payments and invoices</span>
								</li>
								<li className="flex items-center gap-2">
									<CheckCircle className="w-5 h-5 text-green-500" />
									<span>Handle maintenance requests</span>
								</li>
								<li className="flex items-center gap-2">
									<CheckCircle className="w-5 h-5 text-green-500" />
									<span>Generate reports and analytics</span>
								</li>
							</ul>
				</div>

				<div className="flex justify-end gap-3 pt-6">
					<Button
						color="primary"
						startContent={<CheckCircle className="w-4 h-4" />}
						onPress={handleComplete}
						size="lg"
						className="min-w-[140px]"
					>
						Get Started
					</Button>
				</div>
			</div>
		</OnboardingLayout>
	);
}

