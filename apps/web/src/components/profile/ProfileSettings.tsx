import { Button, Card, CardBody, CardHeader, Input } from "@heroui/react";
import { useForm } from "@tanstack/react-form";
import { Save, User } from "lucide-react";
import { useEffect } from "react";
import { Label } from "@/components/ui/label";
import { useProfile } from "@/hooks/use-profile";

export function ProfileSettings() {
	const { profile, updateProfile, isUpdating } = useProfile();

	const form = useForm({
		defaultValues: {
			name: profile?.name || "",
			phone: profile?.phone || "",
			dateOfBirth: profile?.dateOfBirth
				? new Date(profile.dateOfBirth).toISOString().split("T")[0]
				: "",
			address: profile?.address || "",
			city: profile?.city || "",
			state: profile?.state || "",
			postalCode: profile?.postalCode || "",
			country: profile?.country || "",
			preferredLanguage: profile?.preferredLanguage || "",
			userType: profile?.userType || "",
		},
		onSubmit: async ({ value }) => {
			try {
				await updateProfile({
					name: value.name || undefined,
					phone: value.phone || undefined,
					dateOfBirth: value.dateOfBirth || undefined,
					address: value.address || undefined,
					city: value.city || undefined,
					state: value.state || undefined,
					postalCode: value.postalCode || undefined,
					country: value.country || undefined,
					preferredLanguage: value.preferredLanguage || undefined,
					userType: value.userType || undefined,
				});
			} catch (error) {
				console.error("Failed to update profile:", error);
			}
		},
	});

	useEffect(() => {
		if (profile) {
			form.setFieldValue("name", profile.name || "");
			form.setFieldValue("phone", profile.phone || "");
			form.setFieldValue(
				"dateOfBirth",
				profile.dateOfBirth
					? new Date(profile.dateOfBirth).toISOString().split("T")[0]
					: "",
			);
			form.setFieldValue("address", profile.address || "");
			form.setFieldValue("city", profile.city || "");
			form.setFieldValue("state", profile.state || "");
			form.setFieldValue("postalCode", profile.postalCode || "");
			form.setFieldValue("country", profile.country || "");
			form.setFieldValue("preferredLanguage", profile.preferredLanguage || "");
			form.setFieldValue("userType", profile.userType || "");
		}
	}, [profile, form]);

	return (
		<Card className="border border-gray-200 shadow-sm">
			<CardHeader>
				<div>
					<h2 className="font-semibold text-xl">Profile Information</h2>
					<p className="text-gray-600 text-sm">
						Update your personal information and preferences
					</p>
				</div>
			</CardHeader>
			<CardBody className="space-y-6">
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<form.Field name="name">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>
									Full Name <span className="text-red-500">*</span>
								</Label>
								<Input
									id={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onValueChange={(value) => field.handleChange(value)}
									classNames={{ input: "text-sm" }}
									isRequired
								/>
							</div>
						)}
					</form.Field>

					<form.Field name="phone">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Phone Number</Label>
								<Input
									id={field.name}
									type="tel"
									value={field.state.value}
									onBlur={field.handleBlur}
									onValueChange={(value) => {
										const cleaned = value.replace(/\D/g, "");
										const formatted = cleaned
											.replace(/^(\d{2})(\d)/, "($1) $2")
											.replace(/(\d{5})(\d)/, "$1-$2")
											.replace(/(-\d{4})\d+?$/, "$1");
										field.handleChange(formatted);
									}}
									placeholder="(00) 00000-0000"
									classNames={{ input: "text-sm" }}
									maxLength={15}
								/>
							</div>
						)}
					</form.Field>
				</div>

				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<form.Field name="dateOfBirth">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Date of Birth</Label>
								<Input
									id={field.name}
									type="date"
									value={field.state.value}
									onBlur={field.handleBlur}
									onValueChange={(value) => field.handleChange(value)}
									classNames={{ input: "text-sm" }}
								/>
							</div>
						)}
					</form.Field>

					<form.Field name="userType">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>User Type</Label>
								<Input
									id={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onValueChange={(value) => field.handleChange(value)}
									placeholder="landlord, tenant, admin, accountant"
									classNames={{ input: "text-sm" }}
								/>
							</div>
						)}
					</form.Field>
				</div>

				<form.Field name="address">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor={field.name}>Address</Label>
							<Input
								id={field.name}
								value={field.state.value}
								onBlur={field.handleBlur}
								onValueChange={(value) => field.handleChange(value)}
								placeholder="Street address"
								classNames={{ input: "text-sm" }}
							/>
						</div>
					)}
				</form.Field>

				<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
					<form.Field name="city">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>City</Label>
								<Input
									id={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onValueChange={(value) => field.handleChange(value)}
									placeholder="São Paulo"
									classNames={{ input: "text-sm" }}
								/>
							</div>
						)}
					</form.Field>

					<form.Field name="state">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>State</Label>
								<Input
									id={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onValueChange={(value) =>
										field.handleChange(value.toUpperCase())
									}
									placeholder="SP"
									classNames={{ input: "text-sm" }}
									maxLength={2}
								/>
							</div>
						)}
					</form.Field>

					<form.Field name="postalCode">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Postal Code</Label>
								<Input
									id={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onValueChange={(value) => {
										const cleaned = value.replace(/\D/g, "");
										const formatted = cleaned.replace(/^(\d{5})(\d)/, "$1-$2");
										field.handleChange(formatted);
									}}
									placeholder="00000-000"
									classNames={{ input: "text-sm" }}
									maxLength={9}
								/>
							</div>
						)}
					</form.Field>
				</div>

				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<form.Field name="country">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Country</Label>
								<Input
									id={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onValueChange={(value) => field.handleChange(value)}
									placeholder="Brasil"
									classNames={{ input: "text-sm" }}
								/>
							</div>
						)}
					</form.Field>

					<form.Field name="preferredLanguage">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Preferred Language</Label>
								<Input
									id={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onValueChange={(value) => field.handleChange(value)}
									placeholder="pt-BR, en-US, es-ES"
									classNames={{ input: "text-sm" }}
								/>
							</div>
						)}
					</form.Field>
				</div>

				<div className="flex justify-end border-t pt-4">
					<Button
						color="primary"
						startContent={<Save className="h-4 w-4" />}
						onPress={() => form.handleSubmit()}
						isLoading={isUpdating}
					>
						Save Changes
					</Button>
				</div>
			</CardBody>
		</Card>
	);
}
