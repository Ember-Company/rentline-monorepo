import type { Route } from "./+types/route";
import { useNavigate } from "react-router";
import { useState } from "react";
import { Button, Switch } from "@heroui/react";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";

export function meta(_args: Route.MetaArgs) {
	return [{ title: "Notification Preferences - Onboarding" }];
}

export default function NotificationsStep() {
	const navigate = useNavigate();
	const [notifications, setNotifications] = useState({
		email: true,
		sms: false,
		inApp: true,
		maintenance: true,
		payments: true,
		leases: true,
	});
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleNext = () => {
		setIsSubmitting(true);
		try {
			// Store notification preferences (will be saved to organization settings)
			const onboardingData = JSON.parse(
				sessionStorage.getItem("onboarding_data") || "{}",
			);
			onboardingData.notifications = notifications;
			sessionStorage.setItem("onboarding_data", JSON.stringify(onboardingData));

			toast.success("Notification preferences saved");
			navigate("/onboarding/tutorial");
		} catch {
			toast.error("Failed to save preferences");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<OnboardingLayout
			title="Notification Preferences"
			description="Configure how you want to receive notifications. You can always change these settings later."
			showProgress={true}
		>
					<div className="space-y-6">
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<div>
									<p className="font-medium">Email Notifications</p>
									<p className="text-sm text-gray-600">
										Receive notifications via email
									</p>
								</div>
								<Switch
									isSelected={notifications.email}
									onValueChange={(value) =>
										setNotifications({ ...notifications, email: value })
									}
								/>
							</div>

							<div className="flex items-center justify-between">
								<div>
									<p className="font-medium">SMS Notifications</p>
									<p className="text-sm text-gray-600">
										Receive notifications via SMS
									</p>
								</div>
								<Switch
									isSelected={notifications.sms}
									onValueChange={(value) =>
										setNotifications({ ...notifications, sms: value })
									}
								/>
							</div>

							<div className="flex items-center justify-between">
								<div>
									<p className="font-medium">In-App Notifications</p>
									<p className="text-sm text-gray-600">
										Receive notifications in the app
									</p>
								</div>
								<Switch
									isSelected={notifications.inApp}
									onValueChange={(value) =>
										setNotifications({ ...notifications, inApp: value })
									}
								/>
							</div>

							<div className="border-t pt-4 space-y-4">
								<p className="font-medium text-sm text-gray-700">
									Notification Types
								</p>

								<div className="flex items-center justify-between">
									<div>
										<p className="font-medium">Maintenance Requests</p>
										<p className="text-sm text-gray-600">
											Get notified about maintenance requests
										</p>
									</div>
									<Switch
										isSelected={notifications.maintenance}
										onValueChange={(value) =>
											setNotifications({ ...notifications, maintenance: value })
										}
									/>
								</div>

								<div className="flex items-center justify-between">
									<div>
										<p className="font-medium">Payments</p>
										<p className="text-sm text-gray-600">
											Get notified about payments
										</p>
									</div>
									<Switch
										isSelected={notifications.payments}
										onValueChange={(value) =>
											setNotifications({ ...notifications, payments: value })
										}
									/>
								</div>

								<div className="flex items-center justify-between">
									<div>
										<p className="font-medium">Leases</p>
										<p className="text-sm text-gray-600">
											Get notified about lease updates
										</p>
									</div>
									<Switch
										isSelected={notifications.leases}
										onValueChange={(value) =>
											setNotifications({ ...notifications, leases: value })
										}
									/>
								</div>
							</div>
						</div>

						<div className="flex justify-between gap-3 pt-4">
							<Button
								variant="light"
								startContent={<ArrowLeft className="w-4 h-4" />}
								onPress={() => navigate("/onboarding/complete")}
							>
								Back
							</Button>
							<Button
								color="primary"
								endContent={<ChevronRight className="w-4 h-4" />}
								onPress={handleNext}
								isLoading={isSubmitting}
							>
								Continue
							</Button>
						</div>

						<div className="flex justify-between gap-3 pt-6">
							<Button
								variant="light"
								startContent={<ArrowLeft className="w-4 h-4" />}
								onPress={() => navigate("/onboarding/complete")}
								size="lg"
							>
								Back
							</Button>
							<Button
								color="primary"
								endContent={<ChevronRight className="w-4 h-4" />}
								onPress={handleNext}
								isLoading={isSubmitting}
								size="lg"
								className="min-w-[140px]"
							>
								Continue
							</Button>
						</div>
					</div>
		</OnboardingLayout>
	);
}
