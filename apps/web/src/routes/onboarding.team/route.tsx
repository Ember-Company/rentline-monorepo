import type { Route } from "./+types/route";
import { useNavigate } from "react-router";
import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { Button, Input, Card, CardBody, Chip } from "@heroui/react";
import { Label } from "@/components/ui/label";
import { ChevronRight, ArrowLeft, Plus, X } from "lucide-react";
import { toast } from "sonner";
import z from "zod";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";

type TeamMember = {
	name: string;
	email: string;
	role: string;
};

export function meta({}: Route.MetaArgs) {
	return [{ title: "Team Members - Onboarding" }];
}

export default function TeamStep() {
	const navigate = useNavigate();
	const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
	const [showAddForm, setShowAddForm] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Load existing data
	const existingData = JSON.parse(
		sessionStorage.getItem("onboarding_data") || "{}"
	);
	if (existingData.team && existingData.team.length > 0 && teamMembers.length === 0) {
		setTeamMembers(existingData.team);
	}

	const memberForm = useForm({
		defaultValues: {
			name: "",
			email: "",
			role: "member",
		},
		onSubmit: async ({ value }) => {
			setTeamMembers([...teamMembers, value]);
			memberForm.reset();
			setShowAddForm(false);
			toast.success("Team member added");
		},
		validators: {
			onSubmit: z.object({
				name: z.string().min(2, "Name is required"),
				email: z.email("Valid email is required"),
				role: z.string(),
			}),
		},
	});

	const handleRemoveMember = (index: number) => {
		const updated = teamMembers.filter((_, i) => i !== index);
		setTeamMembers(updated);
	};

	const handleNext = () => {
		setIsSubmitting(true);
		try {
			// Store in sessionStorage
			const onboardingData = JSON.parse(
				sessionStorage.getItem("onboarding_data") || "{}"
			);
			onboardingData.team = teamMembers;
			sessionStorage.setItem("onboarding_data", JSON.stringify(onboardingData));
			
			toast.success("Team members saved");
			navigate("/onboarding/properties");
		} catch (error) {
			toast.error("Failed to save team members");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<OnboardingLayout
			title="Team Members"
			description="Invite team members to collaborate on your property management. You can add members later if you prefer."
			showProgress={true}
		>
					<div className="space-y-6">
						{teamMembers.length > 0 && (
							<div className="space-y-2">
								{teamMembers.map((member, index) => (
									<div
										key={index}
										className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
									>
										<div>
											<p className="font-medium">{member.name}</p>
											<p className="text-sm text-gray-600">{member.email}</p>
											<Chip size="sm" className="mt-1">
												{member.role}
											</Chip>
										</div>
										<Button
											isIconOnly
											variant="light"
											size="sm"
											onPress={() => handleRemoveMember(index)}
										>
											<X className="w-4 h-4" />
										</Button>
									</div>
								))}
							</div>
						)}

						{showAddForm ? (
							<Card>
								<CardBody>
									<form
										onSubmit={(e) => {
											e.preventDefault();
											memberForm.handleSubmit();
										}}
										className="space-y-4"
									>
										<memberForm.Field name="name">
											{(field) => (
												<div className="space-y-2">
													<Label htmlFor={field.name}>Name</Label>
													<Input
														id={field.name}
														value={field.state.value}
														onBlur={field.handleBlur}
														onValueChange={(value) => field.handleChange(value)}
													/>
												</div>
											)}
										</memberForm.Field>

										<memberForm.Field name="email">
											{(field) => (
												<div className="space-y-2">
													<Label htmlFor={field.name}>Email</Label>
													<Input
														id={field.name}
														type="email"
														value={field.state.value}
														onBlur={field.handleBlur}
														onValueChange={(value) => field.handleChange(value)}
													/>
												</div>
											)}
										</memberForm.Field>

										<memberForm.Field name="role">
											{(field) => (
												<div className="space-y-2">
													<Label htmlFor={field.name}>Role</Label>
													<select
														id={field.name}
														value={field.state.value}
														onChange={(e) => field.handleChange(e.target.value)}
														className="w-full px-3 py-2 border border-gray-300 rounded-md"
													>
														<option value="member">Member</option>
														<option value="admin">Admin</option>
														<option value="manager">Manager</option>
													</select>
												</div>
											)}
										</memberForm.Field>

										<div className="flex gap-2">
											<Button
												type="submit"
												color="primary"
												size="sm"
											>
												Add Member
											</Button>
											<Button
												variant="light"
												size="sm"
												onPress={() => {
													setShowAddForm(false);
													memberForm.reset();
												}}
											>
												Cancel
											</Button>
										</div>
									</form>
								</CardBody>
							</Card>
						) : (
							<Button
								variant="bordered"
								startContent={<Plus className="w-4 h-4" />}
								onPress={() => setShowAddForm(true)}
							>
								Add Team Member
							</Button>
						)}

						<div className="flex justify-between gap-3 pt-4">
							<Button
								variant="light"
								startContent={<ArrowLeft className="w-4 h-4" />}
								onPress={() => navigate("/onboarding/branding")}
							>
								Back
							</Button>
							<Button
								color="primary"
								endContent={<ChevronRight className="w-4 h-4" />}
								onPress={handleNext}
								isLoading={isSubmitting}
							>
								{teamMembers.length === 0 ? "Skip" : "Continue"}
							</Button>
						</div>

						<div className="flex justify-between gap-3 pt-6">
							<Button
								variant="light"
								startContent={<ArrowLeft className="w-4 h-4" />}
								onPress={() => navigate("/onboarding/branding")}
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
								{teamMembers.length === 0 ? "Skip" : "Continue"}
							</Button>
						</div>
					</div>
		</OnboardingLayout>
	);
}

