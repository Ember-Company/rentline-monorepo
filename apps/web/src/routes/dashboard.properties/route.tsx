import type { Route } from "./+types/route";
import {
	Card,
	CardBody,
	CardHeader,
	Button,
	Table,
	TableHeader,
	TableColumn,
	TableBody,
	TableRow,
	TableCell,
	Chip,
	Input,
	Select,
	SelectItem,
} from "@heroui/react";
import { Home, Plus, Search, Edit, Trash2, Eye } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { CrudModal } from "@/components/dashboard/crud-modal";
import { properties, type Property } from "@/lib/mock-data/properties";
import { formatCurrency } from "@/lib/utils/format";
import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import z from "zod";

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "Properties - Rentline" },
		{ name: "description", content: "Manage your properties" },
	];
}

export default function PropertiesPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [selectedProperty, setSelectedProperty] = useState<Property | null>(
		null,
	);
	const [propertiesList, setPropertiesList] = useState(properties);

	const filteredProperties = propertiesList.filter(
		(property) =>
			property.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
			property.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
			(property.tenant?.toLowerCase().includes(searchQuery.toLowerCase()) ??
				false),
	);

	const form = useForm({
		defaultValues: {
			address: "",
			type: "Apartment" as Property["type"],
			rent: "",
			bedrooms: "",
			bathrooms: "",
			squareFeet: "",
			status: "vacant" as Property["status"],
		},
		onSubmit: async ({ value }) => {
			if (selectedProperty) {
				// Update
				setPropertiesList(
					propertiesList.map((p) =>
						p.id === selectedProperty.id
							? {
									...p,
									address: value.address,
									type: value.type,
									rent: Number(value.rent),
									bedrooms: Number(value.bedrooms),
									bathrooms: Number(value.bathrooms),
									squareFeet: Number(value.squareFeet),
									status: value.status,
								}
							: p,
					),
				);
				toast.success("Property updated successfully");
			} else {
				// Create
				const newProperty: Property = {
					id: propertiesList.length + 1,
					address: value.address,
					type: value.type,
					tenant: null,
					rent: Number(value.rent),
					status: value.status,
					occupancy: value.status === "occupied" ? "100%" : "0%",
					bedrooms: Number(value.bedrooms),
					bathrooms: Number(value.bathrooms),
					squareFeet: Number(value.squareFeet),
				};
				setPropertiesList([...propertiesList, newProperty]);
				toast.success("Property created successfully");
			}
			setIsModalOpen(false);
			setSelectedProperty(null);
			form.reset();
		},
		validators: {
			onSubmit: z.object({
				address: z.string().min(5, "Address is required"),
				type: z.enum(["Apartment", "House", "Condo"]),
				rent: z.string().regex(/^\d+$/, "Must be a valid number"),
				bedrooms: z.string().regex(/^\d+$/, "Must be a valid number"),
				bathrooms: z.string().regex(/^\d+$/, "Must be a valid number"),
				squareFeet: z.string().regex(/^\d+$/, "Must be a valid number"),
				status: z.enum(["occupied", "vacant", "maintenance"]),
			}),
		},
	});

	const handleCreate = () => {
		setSelectedProperty(null);
		form.reset();
		setIsModalOpen(true);
	};

	const handleEdit = (property: Property) => {
		setSelectedProperty(property);
		form.setFieldValue("address", property.address);
		form.setFieldValue("type", property.type);
		form.setFieldValue("rent", property.rent.toString());
		form.setFieldValue("bedrooms", property.bedrooms?.toString() || "");
		form.setFieldValue("bathrooms", property.bathrooms?.toString() || "");
		form.setFieldValue("squareFeet", property.squareFeet?.toString() || "");
		form.setFieldValue("status", property.status);
		setIsModalOpen(true);
	};

	const handleDelete = (property: Property) => {
		setSelectedProperty(property);
		setIsDeleteModalOpen(true);
	};

	const confirmDelete = () => {
		if (selectedProperty) {
			setPropertiesList(
				propertiesList.filter((p) => p.id !== selectedProperty.id),
			);
			toast.success("Property deleted successfully");
			setIsDeleteModalOpen(false);
			setSelectedProperty(null);
		}
	};

	const handleView = (property: Property) => {
		setSelectedProperty(property);
		// In a real app, this would navigate to a detail page
		toast.info(`Viewing ${property.address}`);
	};

	return (
		<div className="space-y-6">
			<PageHeader
				title="Properties"
				subtitle="Manage and view all your properties"
				actions={
					<Button
						color="primary"
						startContent={<Plus className="w-4 h-4" />}
						onPress={handleCreate}
					>
						Add Property
					</Button>
				}
			/>

			<Card className="border border-gray-200 shadow-sm">
				<CardHeader className="flex justify-between items-center">
					<div>
						<h2 className="text-xl font-semibold">All Properties</h2>
						<p className="text-sm text-gray-600">
							{filteredProperties.length} properties found
						</p>
					</div>
					<Input
						placeholder="Search properties..."
						value={searchQuery}
						onValueChange={setSearchQuery}
						startContent={<Search className="w-4 h-4" />}
						classNames={{
							input: "text-sm",
							inputWrapper: "bg-gray-50 border-gray-200 max-w-xs",
						}}
					/>
				</CardHeader>
				<CardBody>
					<Table aria-label="Properties list" removeWrapper>
						<TableHeader>
							<TableColumn>ADDRESS</TableColumn>
							<TableColumn>TYPE</TableColumn>
							<TableColumn>TENANT</TableColumn>
							<TableColumn>MONTHLY RENT</TableColumn>
							<TableColumn>BEDROOMS</TableColumn>
							<TableColumn>BATHROOMS</TableColumn>
							<TableColumn>STATUS</TableColumn>
							<TableColumn>ACTIONS</TableColumn>
						</TableHeader>
						<TableBody>
							{filteredProperties.map((property) => (
								<TableRow key={property.id}>
									<TableCell>
										<span className="font-medium">{property.address}</span>
									</TableCell>
									<TableCell>{property.type}</TableCell>
									<TableCell>
										{property.tenant || (
											<span className="text-muted-foreground">Vacant</span>
										)}
									</TableCell>
									<TableCell>
										<span className="font-semibold">
											{formatCurrency(property.rent)}
										</span>
									</TableCell>
									<TableCell>{property.bedrooms || "-"}</TableCell>
									<TableCell>{property.bathrooms || "-"}</TableCell>
									<TableCell>
										<Chip
											size="sm"
											variant="flat"
											color={
												property.status === "occupied"
													? "success"
													: property.status === "vacant"
														? "default"
														: "warning"
											}
										>
											{property.status.charAt(0).toUpperCase() +
												property.status.slice(1)}
										</Chip>
									</TableCell>
									<TableCell>
										<div className="flex items-center gap-2">
											<Button
												size="sm"
												variant="light"
												isIconOnly
												onPress={() => handleView(property)}
											>
												<Eye className="w-4 h-4" />
											</Button>
											<Button
												size="sm"
												variant="light"
												isIconOnly
												onPress={() => handleEdit(property)}
											>
												<Edit className="w-4 h-4" />
											</Button>
											<Button
												size="sm"
												variant="light"
												color="danger"
												isIconOnly
												onPress={() => handleDelete(property)}
											>
												<Trash2 className="w-4 h-4" />
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
					setSelectedProperty(null);
					form.reset();
				}}
				title={selectedProperty ? "Edit Property" : "Add New Property"}
				onSave={() => form.handleSubmit()}
				saveLabel={selectedProperty ? "Update" : "Create"}
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
						<form.Field name="address">
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>Address *</Label>
									<Input
										id={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onValueChange={(e) => field.handleChange(e)}
										placeholder="123 Main St, Apt 2B"
									/>
									{field.state.meta.errors.map((error) => (
										<p key={error?.message} className="text-sm text-danger">
											{error?.message}
										</p>
									))}
								</div>
							)}
						</form.Field>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div>
							<form.Field name="type">
								{(field) => (
									<div className="space-y-2">
										<Label htmlFor={field.name}>Type *</Label>
										<Select
											selectedKeys={[field.state.value]}
											onSelectionChange={(keys) =>
												field.handleChange(
													Array.from(keys)[0] as Property["type"],
												)
											}
										>
											<SelectItem key="Apartment">Apartment</SelectItem>
											<SelectItem key="House">House</SelectItem>
											<SelectItem key="Condo">Condo</SelectItem>
										</Select>
										{field.state.meta.errors.map((error) => (
											<p key={error?.message} className="text-sm text-danger">
												{error?.message}
											</p>
										))}
									</div>
								)}
							</form.Field>
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
													Array.from(keys)[0] as Property["status"],
												)
											}
										>
											<SelectItem key="occupied">Occupied</SelectItem>
											<SelectItem key="vacant">Vacant</SelectItem>
											<SelectItem key="maintenance">Maintenance</SelectItem>
										</Select>
										{field.state.meta.errors.map((error) => (
											<p key={error?.message} className="text-sm text-danger">
												{error?.message}
											</p>
										))}
									</div>
								)}
							</form.Field>
						</div>
					</div>

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
										<p key={error?.message} className="text-sm text-danger">
											{error?.message}
										</p>
									))}
								</div>
							)}
						</form.Field>
					</div>

					<div className="grid grid-cols-3 gap-4">
						<div>
							<form.Field name="bedrooms">
								{(field) => (
									<div className="space-y-2">
										<Label htmlFor={field.name}>Bedrooms *</Label>
										<Input
											id={field.name}
											type="number"
											value={field.state.value}
											onBlur={field.handleBlur}
											onValueChange={(e) => field.handleChange(e)}
											placeholder="2"
										/>
										{field.state.meta.errors.map((error) => (
											<p key={error?.message} className="text-sm text-danger">
												{error?.message}
											</p>
										))}
									</div>
								)}
							</form.Field>
						</div>

						<div>
							<form.Field name="bathrooms">
								{(field) => (
									<div className="space-y-2">
										<Label htmlFor={field.name}>Bathrooms *</Label>
										<Input
											id={field.name}
											type="number"
											value={field.state.value}
											onBlur={field.handleBlur}
											onValueChange={(e) => field.handleChange(e)}
											placeholder="1"
										/>
										{field.state.meta.errors.map((error) => (
											<p key={error?.message} className="text-sm text-danger">
												{error?.message}
											</p>
										))}
									</div>
								)}
							</form.Field>
						</div>

						<div>
							<form.Field name="squareFeet">
								{(field) => (
									<div className="space-y-2">
										<Label htmlFor={field.name}>Square Feet *</Label>
										<Input
											id={field.name}
											type="number"
											value={field.state.value}
											onBlur={field.handleBlur}
											onValueChange={(e) => field.handleChange(e)}
											placeholder="850"
										/>
										{field.state.meta.errors.map((error) => (
											<p key={error?.message} className="text-sm text-danger">
												{error?.message}
											</p>
										))}
									</div>
								)}
							</form.Field>
						</div>
					</div>
				</form>
			</CrudModal>

			{/* Delete Confirmation Modal */}
			<CrudModal
				isOpen={isDeleteModalOpen}
				onClose={() => {
					setIsDeleteModalOpen(false);
					setSelectedProperty(null);
				}}
				title="Delete Property"
				onDelete={confirmDelete}
				deleteLabel="Delete"
				size="md"
			>
				<p>
					Are you sure you want to delete{" "}
					<strong>{selectedProperty?.address}</strong>? This action cannot be
					undone.
				</p>
			</CrudModal>
		</div>
	);
}
