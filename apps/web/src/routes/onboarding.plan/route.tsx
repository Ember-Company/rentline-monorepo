import { Button, Card, CardBody, Chip } from "@heroui/react";
import { 
	ArrowLeft, 
	Check, 
	ChevronRight, 
	Minus, 
	Plus, 
	Zap, 
	Crown, 
	Building2
} from "lucide-react";
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
	icon: React.ReactNode;
	popular?: boolean;
	color: string;
};

const plans: Plan[] = [
	{
		id: "free",
		name: "Starter",
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
		icon: <Zap className="h-6 w-6" />,
		color: "bg-blue-500",
	},
	{
		id: "organization",
		name: "Professional",
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
		icon: <Crown className="h-6 w-6" />,
		popular: true,
		color: "bg-primary",
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
		} else {
			// Default to popular plan
			const popularPlan = plans.find(p => p.popular);
			if (popularPlan) {
				setSelectedPlan(popularPlan.id);
			}
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
				navigate("/onboarding/properties"); // Skip payment for free plan
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
			description="Select the plan that best fits your property management needs."
			showProgress={true}
		>
			<div className="space-y-8 max-w-5xl mx-auto px-4">
				<div className="grid grid-cols-2  gap-8 items-start">
					{plans.map((plan) => (
						<div key={plan.id} className="relative group h-full">
							{plan.popular && (
								<div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
									<Chip 
										color="primary" 
										variant="shadow"
										classNames={{ 
											base: "font-semibold px-4 h-8 shadow-lg shadow-primary/30",
											content: "text-xs uppercase tracking-wider"
										}}
									>
										Most Popular
									</Chip>
								</div>
							)}
							<Card
								isPressable
								disableRipple
								onPress={() => setSelectedPlan(plan.id)}
								className={`
									h-full border-2 transition-all duration-300 overflow-visible relative
									${selectedPlan === plan.id 
										? "border-primary shadow-2xl shadow-primary/10 scale-[1.02] z-10" 
										: "border-transparent shadow-lg hover:shadow-xl hover:-translate-y-1 bg-white/50"
									}
								`}
							>
								<CardBody className="p-8 flex flex-col h-full">
									<div className="flex justify-between items-start mb-6">
										<div className={`
											p-3 rounded-2xl transition-colors
											${selectedPlan === plan.id ? "bg-primary text-white shadow-lg shadow-primary/30" : "bg-gray-100 text-gray-600"}
										`}>
											{plan.icon}
										</div>
										{selectedPlan === plan.id && (
											<div className="bg-primary/10 text-primary p-1.5 rounded-full">
												<Check className="h-5 w-5" />
											</div>
										)}
									</div>

									<div className="mb-8">
										<h3 className="text-2xl font-bold mb-2 text-gray-900">{plan.name}</h3>
										<p className="text-gray-500 text-sm leading-relaxed min-h-[40px]">
											{plan.description}
										</p>
									</div>

									<div className="mb-8 pb-8 border-b border-gray-100">
										<div className="flex items-baseline gap-1">
											{plan.price === 0 ? (
												<span className="text-5xl font-bold text-gray-900">Free</span>
											) : (
												<>
													<span className="text-5xl font-bold text-gray-900">${plan.price}</span>
													<span className="text-gray-500 font-medium">/{plan.priceUnit.replace("per ", "")}</span>
												</>
											)}
										</div>
									</div>

									<div className="space-y-4 flex-grow">
										{plan.features.map((feature, index) => (
											<div key={index} className="flex items-start gap-3">
												<div className={`
													mt-0.5 p-0.5 rounded-full flex-shrink-0
													${selectedPlan === plan.id ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-400"}
												`}>
													<Check className="h-3 w-3" />
												</div>
												<span className="text-gray-600 text-sm font-medium">{feature}</span>
											</div>
										))}
									</div>
								</CardBody>
							</Card>
						</div>
					))}
				</div>

				{selectedPlan === "organization" && (
					<div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
						<Card className="border-none bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-xl overflow-hidden relative">
							<div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
							
							<CardBody className="p-8 relative z-10">
								<div className="flex flex-col md:flex-row items-center justify-between gap-8">
									<div className="flex items-start gap-5">
										<div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm hidden md:block">
											<Building2 className="h-8 w-8 text-white" />
										</div>
										<div>
											<h4 className="font-bold text-xl text-white mb-2">Need more properties?</h4>
											<p className="text-gray-300 text-sm max-w-md">
												Scale your portfolio effortlessly. Add as many units as you need for a small monthly fee per unit.
											</p>
										</div>
									</div>

									<div className="flex flex-col items-end gap-4">
										<div className="flex items-center gap-4 bg-white/10 p-2 rounded-xl backdrop-blur-sm border border-white/10">
											<Button
												isIconOnly
												variant="light"
												onPress={() => setAdditionalProperties(Math.max(0, additionalProperties - 1))}
												isDisabled={additionalProperties === 0}
												className="text-white hover:bg-white/10"
											>
												<Minus className="h-4 w-4" />
											</Button>
											<div className="text-center min-w-[4rem]">
												<span className="block text-2xl font-bold text-white leading-none">{additionalProperties}</span>
												<span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Units</span>
											</div>
											<Button
												isIconOnly
												variant="light"
												onPress={() => setAdditionalProperties(additionalProperties + 1)}
												className="text-white hover:bg-white/10"
											>
												<Plus className="h-4 w-4" />
											</Button>
										</div>
										
										{additionalProperties > 0 && (
											<div className="text-right">
												<p className="text-sm text-gray-400">Additional cost</p>
												<p className="text-lg font-bold text-white">+${additionalProperties * 5}/mo</p>
											</div>
										)}
									</div>
								</div>
							</CardBody>
						</Card>
					</div>
				)}

				<div className="flex justify-between items-center pt-8 border-t border-gray-100">
					<Button
						variant="light"
						startContent={<ArrowLeft className="h-4 w-4" />}
						onPress={() => navigate("/onboarding/organization")}
						size="lg"
						className="font-medium text-gray-500 hover:text-gray-900"
					>
						Back
					</Button>
					<div className="flex items-center gap-6">
						{selectedPlan === "organization" && additionalProperties > 0 && (
							<div className="text-right hidden sm:block">
								<p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Total Monthly</p>
								<p className="text-2xl font-bold text-primary">${totalPrice}</p>
							</div>
						)}
						<Button
							color="primary"
							endContent={<ChevronRight className="h-4 w-4" />}
							onPress={handleNext}
							isLoading={isSubmitting}
							isDisabled={!selectedPlan}
							size="lg"
							className="font-bold px-8 shadow-lg shadow-primary/20"
						>
							Continue
						</Button>
					</div>
				</div>
			</div>
		</OnboardingLayout>
	);
}
