import { Button, Radio, RadioGroup } from "@heroui/react";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import type { Route } from "./+types/route";

export function meta({}: Route.MetaArgs) {
	return [{ title: "Payment Method - Onboarding" }];
}

export default function PaymentStep() {
	const navigate = useNavigate();
	const [selectedMethod, setSelectedMethod] = useState<string>("stripe");
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Load existing data
	const existingData = JSON.parse(
		sessionStorage.getItem("onboarding_data") || "{}",
	);
	if (existingData.paymentMethod && !selectedMethod) {
		setSelectedMethod(existingData.paymentMethod);
	}

	const handleNext = () => {
		setIsSubmitting(true);
		try {
			// Store in sessionStorage
			const onboardingData = JSON.parse(
				sessionStorage.getItem("onboarding_data") || "{}",
			);
			onboardingData.paymentMethod = selectedMethod;
			sessionStorage.setItem("onboarding_data", JSON.stringify(onboardingData));

			toast.success("Payment method saved");
			navigate("/onboarding/properties");
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
			<div className="space-y-6 max-w-2xl mx-auto">
				<RadioGroup 
					value={selectedMethod} 
					onValueChange={setSelectedMethod}
					classNames={{
						wrapper: "gap-4"
					}}
				>
					<Radio 
						value="stripe"
						classNames={{
							base: "m-0 bg-white hover:bg-gray-50 border-2 border-gray-200 data-[selected=true]:border-primary p-4 rounded-xl cursor-pointer transition-all w-full max-w-full",
							wrapper: "group-data-[selected=true]:border-primary",
							labelWrapper: "ml-2",
							label: "font-semibold text-gray-900"
						}}
					>
						<div className="flex flex-col">
							<span>Credit Card (Stripe)</span>
							<span className="text-xs text-gray-500 font-normal">Secure payment via Stripe</span>
						</div>
					</Radio>
					<Radio 
						value="pix"
						classNames={{
							base: "m-0 bg-white hover:bg-gray-50 border-2 border-gray-200 data-[selected=true]:border-primary p-4 rounded-xl cursor-pointer transition-all w-full max-w-full",
							wrapper: "group-data-[selected=true]:border-primary",
							labelWrapper: "ml-2",
							label: "font-semibold text-gray-900"
						}}
					>
						<div className="flex flex-col">
							<span>Pix (Brazil)</span>
							<span className="text-xs text-gray-500 font-normal">Instant payment via QR Code</span>
						</div>
					</Radio>
					<Radio 
						value="bank_transfer"
						classNames={{
							base: "m-0 bg-white hover:bg-gray-50 border-2 border-gray-200 data-[selected=true]:border-primary p-4 rounded-xl cursor-pointer transition-all w-full max-w-full",
							wrapper: "group-data-[selected=true]:border-primary",
							labelWrapper: "ml-2",
							label: "font-semibold text-gray-900"
						}}
					>
						<div className="flex flex-col">
							<span>Bank Transfer</span>
							<span className="text-xs text-gray-500 font-normal">Manual transfer instructions</span>
						</div>
					</Radio>
				</RadioGroup>

				<div className="flex justify-between gap-3 pt-6 border-t border-gray-100">
					<Button
						variant="light"
						startContent={<ArrowLeft className="h-4 w-4" />}
						onPress={() => navigate("/onboarding/plan")}
						size="lg"
						className="font-medium text-gray-500 hover:text-gray-900"
					>
						Back
					</Button>
					<Button
						color="primary"
						endContent={<ChevronRight className="h-4 w-4" />}
						onPress={handleNext}
						isLoading={isSubmitting}
						size="lg"
						className="font-bold px-8 shadow-lg shadow-primary/20"
					>
						Continue
					</Button>
				</div>
			</div>
		</OnboardingLayout>
	);
}
