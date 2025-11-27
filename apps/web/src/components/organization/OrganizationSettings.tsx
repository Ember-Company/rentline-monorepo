import {
	Button,
	Card,
	CardBody,
	CardHeader,
	Input,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
} from "@heroui/react";
import { useForm } from "@tanstack/react-form";
import { Building2, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { useOrganizations } from "@/hooks/use-organization-management";
import { authClient } from "@/lib/auth-client";

export function OrganizationSettings() {
	const { data: session } = authClient.useSession();
	const {
		organizations,
		isLoading,
		updateOrganization,
		deleteOrganization,
		isUpdating,
		isDeleting,
	} = useOrganizations();
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

	const currentOrgId = session?.user?.activeOrganizationId;
	const currentOrg = organizations.find((org) => org.id === currentOrgId);

	const form = useForm({
		defaultValues: {
			name: currentOrg?.name || "",
			slug: currentOrg?.slug || "",
			email: (currentOrg as { email?: string })?.email || "",
			phone: (currentOrg as { phone?: string })?.phone || "",
			address: (currentOrg as { address?: string })?.address || "",
			city: (currentOrg as { city?: string })?.city || "",
			state: (currentOrg as { state?: string })?.state || "",
			postalCode: (currentOrg as { postalCode?: string })?.postalCode || "",
			country: (currentOrg as { country?: string })?.country || "Brasil",
			website: (currentOrg as { website?: string })?.website || "",
			cnpj: (currentOrg as { cnpj?: string })?.cnpj || "",
		},
		onSubmit: async ({ value }) => {
			if (!currentOrgId) {
				toast.error("No organization selected");
				return;
			}

			try {
				await updateOrganization({
					id: currentOrgId,
					data: {
						name: value.name,
						slug: value.slug,
						email: value.email || undefined,
						phone: value.phone || undefined,
						address: value.address || undefined,
						city: value.city || undefined,
						state: value.state || undefined,
						postalCode: value.postalCode || undefined,
						country: value.country || undefined,
						website: value.website || undefined,
						cnpj: value.cnpj ? value.cnpj.replace(/\D/g, "") : undefined,
					},
				});
			} catch (error) {
				console.error("Failed to update organization:", error);
			}
		},
	});

	useEffect(() => {
		if (currentOrg) {
			form.setFieldValue("name", currentOrg.name);
			form.setFieldValue("slug", currentOrg.slug);
			form.setFieldValue(
				"email",
				(currentOrg as { email?: string })?.email || "",
			);
			form.setFieldValue(
				"phone",
				(currentOrg as { phone?: string })?.phone || "",
			);
			form.setFieldValue(
				"address",
				(currentOrg as { address?: string })?.address || "",
			);
			form.setFieldValue("city", (currentOrg as { city?: string })?.city || "");
			form.setFieldValue(
				"state",
				(currentOrg as { state?: string })?.state || "",
			);
			form.setFieldValue(
				"postalCode",
				(currentOrg as { postalCode?: string })?.postalCode || "",
			);
			form.setFieldValue(
				"country",
				(currentOrg as { country?: string })?.country || "Brasil",
			);
			form.setFieldValue(
				"website",
				(currentOrg as { website?: string })?.website || "",
			);
			form.setFieldValue("cnpj", (currentOrg as { cnpj?: string })?.cnpj || "");
		}
	}, [currentOrg, form]);

	const handleDelete = async () => {
		if (!currentOrgId) return;

		try {
			await deleteOrganization(currentOrgId);
			setIsDeleteModalOpen(false);
			// Redirect to dashboard after deletion
			window.location.href = "/dashboard";
		} catch (error) {
			console.error("Failed to delete organization:", error);
		}
	};

	if (isLoading) {
		return (
			<Card className="border border-gray-200 shadow-sm">
				<CardBody className="p-12 text-center">
					<Building2 className="mx-auto mb-4 h-16 w-16 animate-pulse text-gray-300" />
					<p className="text-gray-600">Loading organization...</p>
				</CardBody>
			</Card>
		);
	}

	if (!currentOrg && organizations.length === 0) {
		return (
			<Card className="border border-gray-200 shadow-sm">
				<CardBody className="p-12 text-center">
					<Building2 className="mx-auto mb-4 h-16 w-16 text-gray-300" />
					<p className="mb-2 text-gray-600">No organizations found</p>
					<p className="text-gray-500 text-sm">
						Create an organization to get started
					</p>
				</CardBody>
			</Card>
		);
	}

	if (!currentOrg && currentOrgId) {
		return (
			<Card className="border border-gray-200 shadow-sm">
				<CardBody className="p-12 text-center">
					<Building2 className="mx-auto mb-4 h-16 w-16 text-gray-300" />
					<p className="mb-2 text-gray-600">Organization not found</p>
					<p className="text-gray-500 text-sm">
						The active organization (ID: {currentOrgId}) could not be loaded.
					</p>
					<p className="mt-2 text-gray-400 text-xs">
						Available organizations: {organizations.length}
					</p>
				</CardBody>
			</Card>
		);
	}

	if (!currentOrg) {
		return (
			<Card className="border border-gray-200 shadow-sm">
				<CardBody className="p-12 text-center">
					<Building2 className="mx-auto mb-4 h-16 w-16 text-gray-300" />
					<p className="text-gray-600">No organization selected</p>
				</CardBody>
			</Card>
		);
	}

	return (
		<>
			<Card className="border border-gray-200 shadow-sm">
				<CardHeader className="flex items-center justify-between">
					<div>
						<h2 className="font-semibold text-xl">Organization Settings</h2>
						<p className="text-gray-600 text-sm">
							Manage your organization details and information
						</p>
					</div>
					<Button
						color="danger"
						variant="light"
						startContent={<Trash2 className="h-4 w-4" />}
						onPress={() => setIsDeleteModalOpen(true)}
					>
						Delete
					</Button>
				</CardHeader>
				<CardBody className="space-y-6">
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
									onValueChange={(value) => field.handleChange(value)}
									classNames={{ input: "text-sm" }}
									isRequired
								/>
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
									onValueChange={(value) =>
										field.handleChange(value.toLowerCase().replace(/\s+/g, "-"))
									}
									classNames={{ input: "text-sm" }}
									isRequired
								/>
								<p className="text-gray-500 text-xs">
									Used in your organization URL
								</p>
							</div>
						)}
					</form.Field>

					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

					<form.Field name="website">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Website</Label>
								<Input
									id={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onValueChange={(value) => field.handleChange(value)}
									placeholder="https://www.organization.com"
									classNames={{ input: "text-sm" }}
								/>
							</div>
						)}
					</form.Field>

					<form.Field name="cnpj">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>CNPJ</Label>
								<Input
									id={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onValueChange={(value) => {
										const cleaned = value.replace(/\D/g, "");
										const formatted = cleaned
											.replace(/^(\d{2})(\d)/, "$1.$2")
											.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
											.replace(/\.(\d{3})(\d)/, ".$1/$2")
											.replace(/(\d{4})(\d)/, "$1-$2");
										field.handleChange(formatted);
									}}
									placeholder="00.000.000/0000-00"
									classNames={{ input: "text-sm" }}
									maxLength={18}
								/>
							</div>
						)}
					</form.Field>

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
											const formatted = cleaned.replace(
												/^(\d{5})(\d)/,
												"$1-$2",
											);
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

			{/* Delete Confirmation Modal */}
			<Modal
				isOpen={isDeleteModalOpen}
				onClose={() => setIsDeleteModalOpen(false)}
				size="md"
			>
				<ModalContent>
					<ModalHeader>
						<h3 className="font-semibold text-lg">Delete Organization</h3>
					</ModalHeader>
					<ModalBody>
						<p className="text-gray-600">
							Are you sure you want to delete this organization? This action
							cannot be undone and will remove all associated data.
						</p>
					</ModalBody>
					<ModalFooter>
						<Button
							variant="light"
							onPress={() => setIsDeleteModalOpen(false)}
							isDisabled={isDeleting}
						>
							Cancel
						</Button>
						<Button
							color="danger"
							onPress={handleDelete}
							isLoading={isDeleting}
						>
							Delete Organization
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</>
	);
}
