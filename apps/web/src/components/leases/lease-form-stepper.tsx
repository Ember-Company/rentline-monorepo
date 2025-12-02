import { Check } from "lucide-react";
import type { FormStep } from "./types";

interface LeaseFormStepperProps {
	currentStep: FormStep;
	onStepClick: (step: FormStep) => void;
}

const steps = [
	"Property & Tenant",
	"Financial Terms",
	"Charges & Fees",
	"Contacts",
	"Settings",
	"Review",
];

export function LeaseFormStepper({
	currentStep,
	onStepClick,
}: LeaseFormStepperProps) {
	return (
		<div className="flex flex-col gap-3">
			<div className="flex items-center justify-between">
				{steps.map((step, index) => {
					const stepNum = (index + 1) as FormStep;
					const isActive = currentStep === stepNum;
					const isCompleted = currentStep > stepNum;

					return (
						<div key={step} className="flex flex-1 items-center">
							<button
								type="button"
								onClick={() => onStepClick(stepNum)}
								className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all ${
									isActive
										? "border-primary bg-primary text-white"
										: isCompleted
											? "border-primary bg-primary/10 text-primary"
											: "border-gray-300 bg-white text-gray-400"
								}`}
							>
								{isCompleted ? <Check className="h-5 w-5" /> : stepNum}
							</button>
							{index < steps.length - 1 && (
								<div
									className={`h-0.5 flex-1 ${
										currentStep > stepNum ? "bg-primary" : "bg-gray-300"
									}`}
								/>
							)}
						</div>
					);
				})}
			</div>
			<p className="text-center text-sm text-gray-500">
				Step {currentStep} of 6: {steps[currentStep - 1]}
			</p>
		</div>
	);
}
