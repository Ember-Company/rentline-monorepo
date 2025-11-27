import {
	Button,
	Card,
	CardBody,
	CardHeader,
	Chip,
	Input,
	Select,
	SelectItem,
	Table,
	TableBody,
	TableCell,
	TableColumn,
	TableHeader,
	TableRow,
} from "@heroui/react";
import { useForm } from "@tanstack/react-form";
import {
	Edit,
	Eye,
	Mail,
	Phone,
	Plus,
	Search,
	Trash2,
	Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";
import { CrudModal } from "@/components/dashboard/crud-modal";
import { PageHeader } from "@/components/dashboard/page-header";
import { Label } from "@/components/ui/label";
import { type Tenant, tenants } from "@/lib/mock-data/tenants";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import type { Route } from "./+types/route";

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "Tenants - Rentline" },
		{ name: "description", content: "Manage your tenants" },
	];
}

export default function TenantsPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
	const [tenantsList, setTenantsList] = useState(tenants);

	const filteredTenants = tenantsList.filter(
		(tenant) =>
			tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			tenant.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
			tenant.property.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	const form = useForm({
		defaultValues: {
			name: "",
			email: "",
			phone: "",
			property: "",
			rent: "",
			leaseStart: "",
			leaseEnd: "",
			status: "active" as Tenant["status"],
		},
		onSubmit: async ({ value }) => {
			if (selectedTenant) {
				// Update
				setTenantsList(
					tenantsList.map((t) =>
						t.id === selectedTenant.id
							? {
									...t,
									name: value.name,
									email: value.email,
									phone: value.phone,
									property: value.property,
									rent: Number(value.rent),
									leaseStart: value.leaseStart,
									leaseEnd: value.leaseEnd,
									status: value.status,
								}
							: t,
					),
				);
				toast.success("Tenant updated successfully");
			} else {
				// Create
				const newTenant: Tenant = {
					id: tenantsList.length + 1,
					name: value.name,
					email: value.email,
					phone: value.phone,
					property: value.property,
					rent: Number(value.rent),
					leaseStart: value.leaseStart,
					leaseEnd: value.leaseEnd,
					status: value.status,
				};
				setTenantsList([...tenantsList, newTenant]);
				toast.success("Tenant created successfully");
			}
			setIsModalOpen(false);
			setSelectedTenant(null);
			form.reset();
		},
		validators: {
			onSubmit: z.object({
				name: z.string().min(2, "Name is required"),
				email: z.email("Invalid email address"),
				phone: z.string().min(10, "Phone number is required"),
				property: z.string().min(5, "Property address is required"),
				rent: z.string().regex(/^\d+$/, "Must be a valid number"),
				leaseStart: z.string().min(1, "Lease start date is required"),
				leaseEnd: z.string().min(1, "Lease end date is required"),
				status: z.enum(["active", "inactive", "pending"]),
			}),
		},
	});

	const handleCreate = () => {
		setSelectedTenant(null);
		form.reset();
		setIsModalOpen(true);
	};

	const handleEdit = (tenant: Tenant) => {
		setSelectedTenant(tenant);
		form.setFieldValue("name", tenant.name);
		form.setFieldValue("email", tenant.email);
		form.setFieldValue("phone", tenant.phone);
		form.setFieldValue("property", tenant.property);
		form.setFieldValue("rent", tenant.rent.toString());
		form.setFieldValue("leaseStart", tenant.leaseStart);
		form.setFieldValue("leaseEnd", tenant.leaseEnd);
		form.setFieldValue("status", tenant.status);
		setIsModalOpen(true);
	};

	const handleDelete = (tenant: Tenant) => {
		setSelectedTenant(tenant);
		setIsDeleteModalOpen(true);
	};

	const confirmDelete = () => {
		if (selectedTenant) {
			setTenantsList(tenantsList.filter((t) => t.id !== selectedTenant.id));
			toast.success("Tenant deleted successfully");
			setIsDeleteModalOpen(false);
			setSelectedTenant(null);
		}
	};

	const handleView = (tenant: Tenant) => {
		setSelectedTenant(tenant);
		toast.info(`Viewing ${tenant.name}`);
	};

	return (
		<div className="space-y-6">
			<PageHeader
				title="Tenants"
				subtitle="Manage and view all your tenants"
				actions={
					<Button
						color="primary"
						startContent={<Plus className="h-4 w-4" />}
						onPress={handleCreate}
					>
						Add Tenant
					</Button>
				}
			/>

			<Card className="border border-gray-200 shadow-sm">
				<CardHeader className="flex items-center justify-between">
					<div>
						<h2 className="font-semibold text-xl">All Tenants</h2>
						<p className="text-gray-600 text-sm">
							{filteredTenants.length} tenants found
						</p>
					</div>
					<Input
						placeholder="Search tenants..."
						value={searchQuery}
						onValueChange={setSearchQuery}
						startContent={<Search className="h-4 w-4" />}
						classNames={{
							input: "text-sm",
							inputWrapper: "bg-gray-50 border-gray-200 max-w-xs",
						}}
					/>
				</CardHeader>
				<CardBody>
					<Table aria-label="Tenants list" removeWrapper>
						<TableHeader>
							<TableColumn>NAME</TableColumn>
							<TableColumn>CONTACT</TableColumn>
							<TableColumn>PROPERTY</TableColumn>
							<TableColumn>MONTHLY RENT</TableColumn>
							<TableColumn>LEASE START</TableColumn>
							<TableColumn>LEASE END</TableColumn>
							<TableColumn>STATUS</TableColumn>
							<TableColumn>ACTIONS</TableColumn>
						</TableHeader>
						<TableBody>
							{filteredTenants.map((tenant) => (
								<TableRow key={tenant.id}>
									<TableCell>
										<span className="font-medium">{tenant.name}</span>
									</TableCell>
									<TableCell>
										<div className="flex flex-col gap-1">
											<div className="flex items-center gap-1 text-sm">
												<Mail className="h-3 w-3" />
												{tenant.email}
											</div>
											<div className="flex items-center gap-1 text-muted-foreground text-sm">
												<Phone className="h-3 w-3" />
												{tenant.phone}
											</div>
										</div>
									</TableCell>
									<TableCell>
										<span className="text-sm">{tenant.property}</span>
									</TableCell>
									<TableCell>
										<span className="font-semibold">
											{formatCurrency(tenant.rent)}
										</span>
									</TableCell>
									<TableCell>
										<span className="text-sm">
											{formatDate(tenant.leaseStart)}
										</span>
									</TableCell>
									<TableCell>
										<span className="text-sm">
											{formatDate(tenant.leaseEnd)}
										</span>
									</TableCell>
									<TableCell>
										<Chip
											size="sm"
											variant="flat"
											color={
												tenant.status === "active"
													? "success"
													: tenant.status === "pending"
														? "warning"
														: "default"
											}
										>
											{tenant.status.charAt(0).toUpperCase() +
												tenant.status.slice(1)}
										</Chip>
									</TableCell>
									<TableCell>
										<div className="flex items-center gap-2">
											<Button
												size="sm"
												variant="light"
												isIconOnly
												onPress={() => handleView(tenant)}
											>
												<Eye className="h-4 w-4" />
											</Button>
											<Button
												size="sm"
												variant="light"
												isIconOnly
												onPress={() => handleEdit(tenant)}
											>
												<Edit className="h-4 w-4" />
											</Button>
											<Button
												size="sm"
												variant="light"
												color="danger"
												isIconOnly
												onPress={() => handleDelete(tenant)}
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardBody>
			</Card>

			{/* Create/Edit Modal */}
			<CrudModal
				isOpen={isModalOpen}
				onClose={() => {
					setIsModalOpen(false);
					setSelectedTenant(null);
					form.reset();
				}}
				title={selectedTenant ? "Edit Tenant" : "Add New Tenant"}
				onSave={() => form.handleSubmit()}
				saveLabel={selectedTenant ? "Update" : "Create"}
				isLoading={form.state.isSubmitting}
			>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
					className="space-y-4"
				>
					<div>
						<form.Field name="name">
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>Full Name *</Label>
									<Input
										id={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onValueChange={(e) => field.handleChange(e)}
										placeholder="John Doe"
									/>
									{field.state.meta.errors.map((error) => (
										<p key={error?.message} className="text-danger text-sm">
											{error?.message}
										</p>
									))}
								</div>
							)}
						</form.Field>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div>
							<form.Field name="email">
								{(field) => (
									<div className="space-y-2">
										<Label htmlFor={field.name}>Email *</Label>
										<Input
											id={field.name}
											type="email"
											value={field.state.value}
											onBlur={field.handleBlur}
											onValueChange={(e) => field.handleChange(e)}
											placeholder="john@example.com"
										/>
										{field.state.meta.errors.map((error) => (
											<p key={error?.message} className="text-danger text-sm">
												{error?.message}
											</p>
										))}
									</div>
								)}
							</form.Field>
						</div>

						<div>
							<form.Field name="phone">
								{(field) => (
									<div className="space-y-2">
										<Label htmlFor={field.name}>Phone *</Label>
										<Input
											id={field.name}
											type="tel"
											value={field.state.value}
											onBlur={field.handleBlur}
											onValueChange={(e) => field.handleChange(e)}
											placeholder="+1 (555) 123-4567"
										/>
										{field.state.meta.errors.map((error) => (
											<p key={error?.message} className="text-danger text-sm">
												{error?.message}
											</p>
										))}
									</div>
								)}
							</form.Field>
						</div>
					</div>

					<div>
						<form.Field name="property">
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>Property Address *</Label>
									<Input
										id={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onValueChange={(e) => field.handleChange(e)}
										placeholder="123 Main St, Apt 2B"
									/>
									{field.state.meta.errors.map((error) => (
										<p key={error?.message} className="text-danger text-sm">
											{error?.message}
										</p>
									))}
								</div>
							)}
						</form.Field>
					</div>

					<div className="grid grid-cols-3 gap-4">
						<div>
							<form.Field name="rent">
								{(field) => (
									<div className="space-y-2">
										<Label htmlFor={field.name}>Monthly Rent *</Label>
										<Input
											id={field.name}
											type="number"
											value={field.state.value}
											onBlur={field.handleBlur}
											onValueChange={(e) => field.handleChange(e)}
											placeholder="2500"
											startContent="$"
										/>
										{field.state.meta.errors.map((error) => (
											<p key={error?.message} className="text-danger text-sm">
												{error?.message}
											</p>
										))}
									</div>
								)}
							</form.Field>
						</div>

						<div>
							<form.Field name="leaseStart">
								{(field) => (
									<div className="space-y-2">
										<Label htmlFor={field.name}>Lease Start *</Label>
										<Input
											id={field.name}
											type="date"
											value={field.state.value}
											onBlur={field.handleBlur}
											onValueChange={(e) => field.handleChange(e)}
										/>
										{field.state.meta.errors.map((error) => (
											<p key={error?.message} className="text-danger text-sm">
												{error?.message}
											</p>
										))}
									</div>
								)}
							</form.Field>
						</div>

						<div>
							<form.Field name="leaseEnd">
								{(field) => (
									<div className="space-y-2">
										<Label htmlFor={field.name}>Lease End *</Label>
										<Input
											id={field.name}
											type="date"
											value={field.state.value}
											onBlur={field.handleBlur}
											onValueChange={(e) => field.handleChange(e)}
										/>
										{field.state.meta.errors.map((error) => (
											<p key={error?.message} className="text-danger text-sm">
												{error?.message}
											</p>
										))}
									</div>
								)}
							</form.Field>
						</div>
					</div>

					<div>
						<form.Field name="status">
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>Status *</Label>
									<Select
										selectedKeys={[field.state.value]}
										onSelectionChange={(keys) =>
											field.handleChange(
												Array.from(keys)[0] as Tenant["status"],
											)
										}
									>
										<SelectItem key="active">Active</SelectItem>
										<SelectItem key="inactive">Inactive</SelectItem>
										<SelectItem key="pending">Pending</SelectItem>
									</Select>
									{field.state.meta.errors.map((error) => (
										<p key={error?.message} className="text-danger text-sm">
											{error?.message}
										</p>
									))}
								</div>
							)}
						</form.Field>
					</div>
				</form>
			</CrudModal>

			{/* Delete Confirmation Modal */}
			<CrudModal
				isOpen={isDeleteModalOpen}
				onClose={() => {
					setIsDeleteModalOpen(false);
					setSelectedTenant(null);
				}}
				title="Delete Tenant"
				onDelete={confirmDelete}
				deleteLabel="Delete"
				size="md"
			>
				<p>
					Are you sure you want to delete{" "}
					<strong>{selectedTenant?.name}</strong>? This action cannot be undone.
				</p>
			</CrudModal>
		</div>
	);
}
