import { Button, Card, CardBody, Chip, Input } from "@heroui/react";
import { useForm } from "@tanstack/react-form";
import { ArrowLeft, ChevronRight, Plus, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import z from "zod";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { Label } from "@/components/ui/label";
import type { Route } from "./+types/route";

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
		sessionStorage.getItem("onboarding_data") || "{}",
	);
	if (
		existingData.team &&
		existingData.team.length > 0 &&
		teamMembers.length === 0
	) {
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
				sessionStorage.getItem("onboarding_data") || "{}",
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
								className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
							>
								<div>
									<p className="font-medium">{member.name}</p>
									<p className="text-gray-600 text-sm">{member.email}</p>
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
									<X className="h-4 w-4" />
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
												className="w-full rounded-md border border-gray-300 px-3 py-2"
											>
												<option value="member">Member</option>
												<option value="admin">Admin</option>
												<option value="manager">Manager</option>
											</select>
										</div>
									)}
								</memberForm.Field>

								<div className="flex gap-2">
									<Button type="submit" color="primary" size="sm">
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
						startContent={<Plus className="h-4 w-4" />}
						onPress={() => setShowAddForm(true)}
					>
						Add Team Member
					</Button>
				)}

				<div className="flex justify-between gap-3 pt-4">
					<Button
						variant="light"
						startContent={<ArrowLeft className="h-4 w-4" />}
						onPress={() => navigate("/onboarding/organization")}
					>
						Back
					</Button>
					<Button
						color="primary"
						endContent={<ChevronRight className="h-4 w-4" />}
						onPress={handleNext}
						isLoading={isSubmitting}
					>
						{teamMembers.length === 0 ? "Skip" : "Continue"}
					</Button>
				</div>

				<div className="flex justify-between gap-3 pt-6">
					<Button
						variant="light"
						startContent={<ArrowLeft className="h-4 w-4" />}
						onPress={() => navigate("/onboarding/organization")}
						size="lg"
					>
						Back
					</Button>
					<Button
						color="primary"
						endContent={<ChevronRight className="h-4 w-4" />}
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
