import {
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Button,
	Input,
} from "@heroui/react";
import { Building2, X } from "lucide-react";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { useOrganizations } from "@/hooks/use-organization-management";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";

type Props = {
	isOpen: boolean;
	onClose: () => void;
};

export function CreateOrganizationModal({ isOpen, onClose }: Props) {
	const { createOrganization, isCreating } = useOrganizations();
	const [slugValue, setSlugValue] = useState("");

	const form = useForm({
		defaultValues: {
			name: "",
			slug: "",
			email: "",
			phone: "",
			address: "",
			city: "",
			state: "",
			postalCode: "",
			country: "Brasil",
		},
		onSubmit: async ({ value }) => {
			try {
				await createOrganization({
					name: value.name,
					slug: value.slug || generateSlug(value.name),
					email: value.email || undefined,
					phone: value.phone || undefined,
					address: value.address || undefined,
					city: value.city || undefined,
					state: value.state || undefined,
					postalCode: value.postalCode || undefined,
					country: value.country || undefined,
				});
				form.reset();
				onClose();
			} catch (error) {
				console.error("Failed to create organization:", error);
			}
		},
	});

	const generateSlug = (name: string): string => {
		return name
			.toLowerCase()
			.trim()
			.replace(/\s+/g, "-")
			.replace(/[^a-z0-9-]/g, "");
	};

	const handleNameChange = (name: string) => {
		form.setFieldValue("name", name);
		if (!slugValue) {
			const autoSlug = generateSlug(name);
			form.setFieldValue("slug", autoSlug);
			setSlugValue(autoSlug);
		}
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
			<ModalContent>
				<ModalHeader className="flex flex-col gap-1">
					<div className="flex items-center gap-3">
						<div className="p-2 bg-primary/10 rounded-lg">
							<Building2 className="w-5 h-5 text-primary" />
						</div>
						<div>
							<h2 className="text-xl font-bold">Create New Organization</h2>
							<p className="text-sm text-gray-600 font-normal">
								Set up a new organization to manage
							</p>
						</div>
					</div>
				</ModalHeader>
				<ModalBody>
					<form.Field name="name">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>
									Organization Name <span className="text-red-500">*</span>
								</Label>
								<Input
									id={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onValueChange={(value) => {
										field.handleChange(value);
										handleNameChange(value);
									}}
									placeholder="My Organization"
									classNames={{ input: "text-sm" }}
									isRequired
								/>
								{field.state.meta.errors && field.state.meta.errors.length > 0 && (
									<p className="text-sm text-red-500">
										{String(field.state.meta.errors[0])}
									</p>
								)}
							</div>
						)}
					</form.Field>

					<form.Field name="slug">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>
									Slug <span className="text-red-500">*</span>
								</Label>
								<Input
									id={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onValueChange={(value) => {
										const slug = value.toLowerCase().replace(/\s+/g, "-");
										field.handleChange(slug);
										setSlugValue(slug);
									}}
									placeholder="my-organization"
									classNames={{ input: "text-sm" }}
									isRequired
								/>
								<p className="text-xs text-gray-500">
									Used in your organization URL
								</p>
								{field.state.meta.errors && field.state.meta.errors.length > 0 && (
									<p className="text-sm text-red-500">
										{String(field.state.meta.errors[0])}
									</p>
								)}
							</div>
						)}
					</form.Field>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<form.Field name="email">
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>Email</Label>
									<Input
										id={field.name}
										type="email"
										value={field.state.value}
										onBlur={field.handleBlur}
										onValueChange={(value) => field.handleChange(value)}
										placeholder="contact@organization.com"
										classNames={{ input: "text-sm" }}
									/>
								</div>
							)}
						</form.Field>

						<form.Field name="phone">
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>Phone</Label>
									<Input
										id={field.name}
										type="tel"
										value={field.state.value}
										onBlur={field.handleBlur}
										onValueChange={(value) => field.handleChange(value)}
										placeholder="+55 (11) 99999-9999"
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

					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
				</ModalBody>
				<ModalFooter>
					<Button variant="light" onPress={onClose} isDisabled={isCreating}>
						Cancel
					</Button>
					<Button
						color="primary"
						onPress={() => form.handleSubmit()}
						isLoading={isCreating}
					>
						Create Organization
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}

