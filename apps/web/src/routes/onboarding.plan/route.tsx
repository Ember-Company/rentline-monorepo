import type { Route } from "./+types/route";
import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { Button, Card, CardBody } from "@heroui/react";
import { ChevronRight, ArrowLeft, Check, Plus, Minus } from "lucide-react";
import { toast } from "sonner";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";

type Plan = {
	id: string;
	name: string;
	price: number;
	priceUnit: string;
	description: string;
	features: string[];
	maxProperties: number;
	additionalUnitPrice?: number;
};

const plans: Plan[] = [
	{
		id: "free",
		name: "Free",
		price: 0,
		priceUnit: "forever",
		description: "Perfect for getting started with small portfolios",
		features: [
			"Up to 3 properties",
			"Basic property management",
			"Email support",
			"Mobile app access",
		],
		maxProperties: 3,
	},
	{
		id: "organization",
		name: "Organization",
		price: 29,
		priceUnit: "per month",
		description: "For growing property portfolios",
		features: [
			"Up to 10 properties included",
			"Additional properties: $5 per unit/month",
			"Advanced reporting",
			"Priority email support",
			"Mobile app access",
			"Tenant portal",
		],
		maxProperties: 10,
		additionalUnitPrice: 5,
	},
];

export function meta(_args: Route.MetaArgs) {
	return [{ title: "Choose Plan - Onboarding" }];
}

export default function PlanStep() {
	const navigate = useNavigate();
	const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
	const [additionalProperties, setAdditionalProperties] = useState(0);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Load existing data
	useEffect(() => {
		const existingData = JSON.parse(
			sessionStorage.getItem("onboarding_data") || "{}",
		);
		if (existingData.plan) {
			setSelectedPlan(existingData.plan);
			setAdditionalProperties(existingData.additionalProperties || 0);
		}
	}, []);

	const selectedPlanData = plans.find((p) => p.id === selectedPlan);
	const totalPrice =
		selectedPlanData?.id === "organization"
			? selectedPlanData.price +
				(additionalProperties * (selectedPlanData.additionalUnitPrice || 0))
			: 0;

	const handleNext = () => {
		if (!selectedPlan) {
			toast.error("Please select a plan");
			return;
		}

		setIsSubmitting(true);
		try {
			// Store in sessionStorage
			const onboardingData = JSON.parse(
				sessionStorage.getItem("onboarding_data") || "{}",
			);
			onboardingData.plan = selectedPlan;
			onboardingData.additionalProperties = additionalProperties;
			onboardingData.planPrice = totalPrice;
			sessionStorage.setItem(
				"onboarding_data",
				JSON.stringify(onboardingData),
			);

			// If free plan, skip payment step
			if (selectedPlan === "free") {
				navigate("/onboarding/complete");
			} else {
				navigate("/onboarding/payment");
			}
		} catch (error) {
			toast.error("Failed to save plan selection");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<OnboardingLayout
			title="Choose Your Plan"
			description="Select the plan that best fits your property management needs and scale your business efficiently."
			showProgress={true}
		>
			<div className="space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
						{plans.map((plan) => (
							<Card
								key={plan.id}
								className={`cursor-pointer transition-all border-2 ${
									selectedPlan === plan.id
										? "border-primary shadow-lg scale-105"
										: "border-gray-200 hover:border-primary/50"
								}`}
								isPressable
								onPress={() => setSelectedPlan(plan.id)}
							>
								<CardBody className="p-6">
									<div className="flex items-start justify-between mb-4">
										<div className="flex-1">
											<h3 className="text-xl font-bold mb-1">{plan.name}</h3>
											{selectedPlan === plan.id && (
												<div className="flex items-center gap-2 mt-2 text-primary">
													<Check className="w-4 h-4" />
													<span className="text-sm font-medium">Selected</span>
												</div>
											)}
										</div>
										<div className="text-right">
											{plan.price === 0 ? (
												<span className="text-2xl font-bold">Free</span>
											) : (
												<>
													<span className="text-2xl font-bold">${plan.price}</span>
													<span className="text-sm text-gray-600">
														{" "}/ {plan.priceUnit}
													</span>
												</>
											)}
										</div>
									</div>
									<p className="text-sm text-gray-600 mb-4">
										{plan.description}
									</p>
									<ul className="space-y-2 mb-4">
										{plan.features.map((feature, index) => (
											<li
												key={index}
												className="flex items-start gap-2 text-sm"
											>
												<Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
												<span className="text-gray-700">{feature}</span>
											</li>
										))}
									</ul>
								</CardBody>
							</Card>
						))}
					</div>

					{selectedPlan === "organization" && (
						<Card className="mb-6 bg-primary/5 border-primary/20">
							<CardBody className="p-4">
								<div className="flex items-center justify-between">
									<div>
										<p className="font-medium text-gray-900">
											Additional Properties
										</p>
										<p className="text-sm text-gray-600">
											Add more properties beyond the included 10
										</p>
									</div>
									<div className="flex items-center gap-3">
										<Button
											isIconOnly
											variant="flat"
											size="sm"
											onPress={() =>
												setAdditionalProperties(Math.max(0, additionalProperties - 1))
											}
											isDisabled={additionalProperties === 0}
										>
											<Minus className="w-4 h-4" />
										</Button>
										<span className="text-lg font-semibold w-8 text-center">
											{additionalProperties}
										</span>
										<Button
											isIconOnly
											variant="flat"
											size="sm"
											onPress={() => setAdditionalProperties(additionalProperties + 1)}
										>
											<Plus className="w-4 h-4" />
										</Button>
									</div>
								</div>
								{additionalProperties > 0 && (
									<div className="mt-4 pt-4 border-t border-primary/20">
										<div className="flex items-center justify-between">
											<span className="text-sm text-gray-600">
												Additional properties ({additionalProperties} × $5)
											</span>
											<span className="font-semibold">
												${additionalProperties * 5}/month
											</span>
										</div>
										<div className="flex items-center justify-between mt-2 pt-2 border-t">
											<span className="font-medium">Total Monthly Cost</span>
											<span className="text-xl font-bold text-primary">
												${totalPrice}/month
											</span>
										</div>
									</div>
								)}
							</CardBody>
						</Card>
					)}

				<div className="flex justify-between gap-3 pt-6">
					<Button
						variant="light"
						startContent={<ArrowLeft className="w-4 h-4" />}
						onPress={() => navigate("/onboarding/properties")}
						size="lg"
					>
						Back
					</Button>
					<Button
						color="primary"
						endContent={<ChevronRight className="w-4 h-4" />}
						onPress={handleNext}
						isLoading={isSubmitting}
						isDisabled={!selectedPlan}
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
