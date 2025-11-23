import type { Route } from "./+types/route";
import { useNavigate } from "react-router";
import { useState } from "react";
import { Button } from "@heroui/react";
import { ChevronRight, ArrowLeft, Upload } from "lucide-react";
import { toast } from "sonner";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";

export function meta({}: Route.MetaArgs) {
	return [{ title: "Branding - Onboarding" }];
}

export default function BrandingStep() {
	const navigate = useNavigate();
	const [logo, setLogo] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				const base64String = reader.result as string;
				setLogo(base64String);
				// Store in sessionStorage
				const onboardingData = JSON.parse(
					sessionStorage.getItem("onboarding_data") || "{}"
				);
				onboardingData.branding = { logo: base64String };
				sessionStorage.setItem("onboarding_data", JSON.stringify(onboardingData));
			};
			reader.readAsDataURL(file);
		}
	};

	const handleNext = () => {
		setIsSubmitting(true);
		try {
			toast.success("Branding saved");
			navigate("/onboarding/team");
		} catch (error) {
			toast.error("Failed to save branding");
		} finally {
			setIsSubmitting(false);
		}
	};

	// Load existing data
	const existingData = JSON.parse(
		sessionStorage.getItem("onboarding_data") || "{}"
	);
	if (existingData.branding?.logo && !logo) {
		setLogo(existingData.branding.logo);
	}

	return (
		<OnboardingLayout
			title="Upload Branding"
			description="Add your organization logo to personalize your account. This is optional and can be changed later."
			showProgress={true}
		>
			<div className="space-y-6">
				<div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-12 bg-gray-50/50 hover:border-primary/50 transition-colors">
							{logo ? (
								<div className="space-y-4">
									<img
										src={logo}
										alt="Organization logo"
										className="max-w-xs max-h-48 object-contain"
									/>
									<Button
										variant="light"
										onPress={() => {
											setLogo(null);
											const onboardingData = JSON.parse(
												sessionStorage.getItem("onboarding_data") || "{}"
											);
											delete onboardingData.branding;
											sessionStorage.setItem("onboarding_data", JSON.stringify(onboardingData));
										}}
									>
										Remove Logo
									</Button>
								</div>
							) : (
								<div className="text-center space-y-4">
									<Upload className="w-12 h-12 text-gray-400 mx-auto" />
									<div>
										<label htmlFor="logo-upload" className="cursor-pointer">
											<span className="text-primary font-medium">
												Click to upload
											</span>{" "}
											or drag and drop
										</label>
										<input
											id="logo-upload"
											type="file"
											accept="image/*"
											className="hidden"
											onChange={handleFileUpload}
										/>
									</div>
									<p className="text-sm text-gray-500">
										PNG, JPG, GIF up to 10MB
									</p>
								</div>
							)}
				</div>

				<div className="flex justify-between gap-3 pt-6">
					<Button
						variant="light"
						startContent={<ArrowLeft className="w-4 h-4" />}
						onPress={() => navigate("/onboarding/organization")}
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

