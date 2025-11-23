import type { Route } from "./+types/route";
import { useNavigate } from "react-router";
import { useState } from "react";
import { Button } from "@heroui/react";
import { ChevronRight, ArrowLeft, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";

type Property = {
	name: string;
	address: string;
	type: string;
};

export function meta({}: Route.MetaArgs) {
	return [{ title: "Properties - Onboarding" }];
}

export default function PropertiesStep() {
	const navigate = useNavigate();
	const [properties, setProperties] = useState<Property[]>([]);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Load existing data
	const existingData = JSON.parse(
		sessionStorage.getItem("onboarding_data") || "{}"
	);
	if (existingData.properties && existingData.properties.length > 0 && properties.length === 0) {
		setProperties(existingData.properties);
	}

	const handleAddProperty = () => {
		const newProperty: Property = {
			name: `Property ${properties.length + 1}`,
			address: "",
			type: "building",
		};
		setProperties([...properties, newProperty]);
	};

	const handleRemoveProperty = (index: number) => {
		setProperties(properties.filter((_, i) => i !== index));
	};

	const handleNext = () => {
		setIsSubmitting(true);
		try {
			// Store in sessionStorage
			const onboardingData = JSON.parse(
				sessionStorage.getItem("onboarding_data") || "{}"
			);
			onboardingData.properties = properties;
			sessionStorage.setItem("onboarding_data", JSON.stringify(onboardingData));
			
			toast.success("Properties saved");
			navigate("/onboarding/plan");
		} catch (error) {
			toast.error("Failed to save properties");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<OnboardingLayout
			title="Initial Properties"
			description="Add your properties to get started. You can add more properties later from your dashboard."
			showProgress={true}
		>
					<div className="space-y-6">
						{properties.length > 0 && (
							<div className="space-y-2">
								{properties.map((property, index) => (
									<div
										key={index}
										className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
									>
										<div>
											<p className="font-medium">{property.name}</p>
											<p className="text-sm text-gray-600">{property.address || "No address"}</p>
										</div>
										<Button
											isIconOnly
											variant="light"
											size="sm"
											onPress={() => handleRemoveProperty(index)}
										>
											<X className="w-4 h-4" />
										</Button>
									</div>
								))}
							</div>
						)}

						<Button
							variant="bordered"
							startContent={<Plus className="w-4 h-4" />}
							onPress={handleAddProperty}
						>
							Add Property
						</Button>

						<div className="flex justify-between gap-3 pt-4">
							<Button
								variant="light"
								startContent={<ArrowLeft className="w-4 h-4" />}
								onPress={() => navigate("/onboarding/team")}
							>
								Back
							</Button>
							<Button
								color="primary"
								endContent={<ChevronRight className="w-4 h-4" />}
								onPress={handleNext}
								isLoading={isSubmitting}
							>
								{properties.length === 0 ? "Skip" : "Continue"}
							</Button>
						</div>

						<div className="flex justify-between gap-3 pt-6">
							<Button
								variant="light"
								startContent={<ArrowLeft className="w-4 h-4" />}
								onPress={() => navigate("/onboarding/team")}
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
								{properties.length === 0 ? "Skip" : "Continue"}
							</Button>
						</div>
					</div>
		</OnboardingLayout>
	);
}

