import type { Route } from "./+types/route";
import { useNavigate } from "react-router";
import { useState } from "react";
import { Button, RadioGroup, Radio } from "@heroui/react";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";

export function meta({}: Route.MetaArgs) {
	return [{ title: "Payment Method - Onboarding" }];
}

export default function PaymentStep() {
	const navigate = useNavigate();
	const [selectedMethod, setSelectedMethod] = useState<string>("stripe");
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Load existing data
	const existingData = JSON.parse(
		sessionStorage.getItem("onboarding_data") || "{}"
	);
	if (existingData.paymentMethod && !selectedMethod) {
		setSelectedMethod(existingData.paymentMethod);
	}

	const handleNext = () => {
		setIsSubmitting(true);
		try {
			// Store in sessionStorage
			const onboardingData = JSON.parse(
				sessionStorage.getItem("onboarding_data") || "{}"
			);
			onboardingData.paymentMethod = selectedMethod;
			sessionStorage.setItem("onboarding_data", JSON.stringify(onboardingData));
			
			toast.success("Payment method saved");
			navigate("/onboarding/complete");
		} catch (error) {
			toast.error("Failed to save payment method");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<OnboardingLayout
			title="Configure Payment Method"
			description="Select your preferred payment method for subscription billing. You can update this anytime in settings."
			showProgress={true}
		>
					<div className="space-y-6">
						<RadioGroup
							value={selectedMethod}
							onValueChange={setSelectedMethod}
						>
							<Radio value="stripe">Stripe (Credit Card)</Radio>
							<Radio value="pix">Pix (Brazil)</Radio>
							<Radio value="bank_transfer">Bank Transfer</Radio>
						</RadioGroup>

						<div className="flex justify-between gap-3 pt-4">
							<Button
								variant="light"
								startContent={<ArrowLeft className="w-4 h-4" />}
								onPress={() => navigate("/onboarding/plan")}
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
								onPress={() => navigate("/onboarding/plan")}
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

