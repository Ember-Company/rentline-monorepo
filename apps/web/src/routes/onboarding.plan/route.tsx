import { Button, Card, CardBody } from "@heroui/react";
import { ArrowLeft, Check, ChevronRight, Minus, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import type { Route } from "./+types/route";

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
				additionalProperties * (selectedPlanData.additionalUnitPrice || 0)
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
			sessionStorage.setItem("onboarding_data", JSON.stringify(onboardingData));

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
				<div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
					{plans.map((plan) => (
						<Card
							key={plan.id}
							className={`cursor-pointer border-2 transition-all ${
								selectedPlan === plan.id
									? "scale-105 border-primary shadow-lg"
									: "border-gray-200 hover:border-primary/50"
							}`}
							isPressable
							onPress={() => setSelectedPlan(plan.id)}
						>
							<CardBody className="p-6">
								<div className="mb-4 flex items-start justify-between">
									<div className="flex-1">
										<h3 className="mb-1 font-bold text-xl">{plan.name}</h3>
										{selectedPlan === plan.id && (
											<div className="mt-2 flex items-center gap-2 text-primary">
												<Check className="h-4 w-4" />
												<span className="font-medium text-sm">Selected</span>
											</div>
										)}
									</div>
									<div className="text-right">
										{plan.price === 0 ? (
											<span className="font-bold text-2xl">Free</span>
										) : (
											<>
												<span className="font-bold text-2xl">
													${plan.price}
												</span>
												<span className="text-gray-600 text-sm">
													{" "}
													/ {plan.priceUnit}
												</span>
											</>
										)}
									</div>
								</div>
								<p className="mb-4 text-gray-600 text-sm">{plan.description}</p>
								<ul className="mb-4 space-y-2">
									{plan.features.map((feature, index) => (
										<li key={index} className="flex items-start gap-2 text-sm">
											<Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
											<span className="text-gray-700">{feature}</span>
										</li>
									))}
								</ul>
							</CardBody>
						</Card>
					))}
				</div>

				{selectedPlan === "organization" && (
					<Card className="mb-6 border-primary/20 bg-primary/5">
						<CardBody className="p-4">
							<div className="flex items-center justify-between">
								<div>
									<p className="font-medium text-gray-900">
										Additional Properties
									</p>
									<p className="text-gray-600 text-sm">
										Add more properties beyond the included 10
									</p>
								</div>
								<div className="flex items-center gap-3">
									<Button
										isIconOnly
										variant="flat"
										size="sm"
										onPress={() =>
											setAdditionalProperties(
												Math.max(0, additionalProperties - 1),
											)
										}
										isDisabled={additionalProperties === 0}
									>
										<Minus className="h-4 w-4" />
									</Button>
									<span className="w-8 text-center font-semibold text-lg">
										{additionalProperties}
									</span>
									<Button
										isIconOnly
										variant="flat"
										size="sm"
										onPress={() =>
											setAdditionalProperties(additionalProperties + 1)
										}
									>
										<Plus className="h-4 w-4" />
									</Button>
								</div>
							</div>
							{additionalProperties > 0 && (
								<div className="mt-4 border-primary/20 border-t pt-4">
									<div className="flex items-center justify-between">
										<span className="text-gray-600 text-sm">
											Additional properties ({additionalProperties} × $5)
										</span>
										<span className="font-semibold">
											${additionalProperties * 5}/month
										</span>
									</div>
									<div className="mt-2 flex items-center justify-between border-t pt-2">
										<span className="font-medium">Total Monthly Cost</span>
										<span className="font-bold text-primary text-xl">
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
						startContent={<ArrowLeft className="h-4 w-4" />}
						onPress={() => navigate("/onboarding/properties")}
						size="lg"
					>
						Back
					</Button>
					<Button
						color="primary"
						endContent={<ChevronRight className="h-4 w-4" />}
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
