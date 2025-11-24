import type { Route } from "./+types/route";
import {
	Card,
	CardBody,
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
import { Home, Plus, Search, Building2 } from "lucide-react";
import { CrudModal } from "@/components/dashboard/crud-modal";
import { properties, type Property } from "@/lib/mock-data/properties";
import { formatCurrency } from "@/lib/utils/format";
import { useState, useMemo } from "react";
import { useForm } from "@tanstack/react-form";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Link } from "react-router";
import z from "zod";

export function meta(_args: Route.MetaArgs) {
	return [
		{ title: "Properties - Rentline" },
		{ name: "description", content: "Manage your properties" },
	];
}

type FilterType =
	| "all"
	| "overdue"
	| "due-soon"
	| "due-later"
	| "vacant"
	| "multi-unit";

export default function PropertiesPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [activeFilter, setActiveFilter] = useState<FilterType>("all");
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [selectedProperty, setSelectedProperty] = useState<Property | null>(
		null,
	);
	const [propertiesList, setPropertiesList] = useState(properties);
	const [currentPage, setCurrentPage] = useState(1);
	const [rowsPerPage, setRowsPerPage] = useState(10);

	// Calculate filter counts
	const filterCounts = useMemo(() => {
		const now = new Date();
		const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		const sevenDaysFromNow = new Date(today);
		sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

		return {
			all: propertiesList.length,
			overdue: propertiesList.filter((p) => {
				if (!p.dueDate || !p.tenant) return false;
				const due = new Date(p.dueDate);
				return due < today && p.status === "occupied";
			}).length,
			"due-soon": propertiesList.filter((p) => {
				if (!p.dueDate || !p.tenant) return false;
				const due = new Date(p.dueDate);
				return (
					due >= today && due <= sevenDaysFromNow && p.status === "occupied"
				);
			}).length,
			"due-later": propertiesList.filter((p) => {
				if (!p.dueDate || !p.tenant) return false;
				const due = new Date(p.dueDate);
				return due > sevenDaysFromNow && p.status === "occupied";
			}).length,
			vacant: propertiesList.filter((p) => p.status === "vacant").length,
			"multi-unit": propertiesList.filter((p) => p.isMultiUnit).length,
		};
	}, [propertiesList]);

	// Filter properties based on active filter and search
	const filteredProperties = useMemo(() => {
		let filtered = propertiesList;

		// Apply search filter
		if (searchQuery) {
			filtered = filtered.filter(
				(property) =>
					property.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
					property.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
					(property.tenant?.toLowerCase().includes(searchQuery.toLowerCase()) ??
						false),
			);
		}

		// Apply status filter
		if (activeFilter !== "all") {
			const now = new Date();
			const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
			const sevenDaysFromNow = new Date(today);
			sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

			switch (activeFilter) {
				case "overdue":
					filtered = filtered.filter((p) => {
						if (!p.dueDate || !p.tenant) return false;
						const due = new Date(p.dueDate);
						return due < today && p.status === "occupied";
					});
					break;
				case "due-soon":
					filtered = filtered.filter((p) => {
						if (!p.dueDate || !p.tenant) return false;
						const due = new Date(p.dueDate);
						return (
							due >= today && due <= sevenDaysFromNow && p.status === "occupied"
						);
					});
					break;
				case "due-later":
					filtered = filtered.filter((p) => {
						if (!p.dueDate || !p.tenant) return false;
						const due = new Date(p.dueDate);
						return due > sevenDaysFromNow && p.status === "occupied";
					});
					break;
				case "vacant":
					filtered = filtered.filter((p) => p.status === "vacant");
					break;
				case "multi-unit":
					filtered = filtered.filter((p) => p.isMultiUnit);
					break;
			}
		}

		return filtered;
	}, [propertiesList, searchQuery, activeFilter]);

	// Pagination
	const paginatedProperties = useMemo(() => {
		const start = (currentPage - 1) * rowsPerPage;
		const end = start + rowsPerPage;
		return filteredProperties.slice(start, end);
	}, [filteredProperties, currentPage, rowsPerPage]);

	const totalPages = Math.ceil(filteredProperties.length / rowsPerPage);

	// Get rent status
	const getRentStatus = (
		property: Property,
	): "overdue" | "due-soon" | "due-later" | null => {
		if (
			!property.dueDate ||
			!property.tenant ||
			property.status !== "occupied"
		) {
			return null;
		}

		const now = new Date();
		const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		const sevenDaysFromNow = new Date(today);
		sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
		const due = new Date(property.dueDate);

		if (due < today) return "overdue";
		if (due >= today && due <= sevenDaysFromNow) return "due-soon";
		if (due > sevenDaysFromNow) return "due-later";
		return null;
	};

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

	const formatDueDate = (dateString?: string): string => {
		if (!dateString) return "-";
		const date = new Date(dateString);
		return date
			.toLocaleDateString("en-US", {
				day: "numeric",
				month: "short",
				year: "numeric",
			})
			.toUpperCase();
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Properties</h1>
				</div>
				<Button
					color="primary"
					startContent={<Plus className="w-4 h-4" />}
					onPress={handleCreate}
					size="lg"
					className="bg-primary hover:bg-primary-600 text-white"
				>
					Add property
				</Button>
			</div>

			{/* Filters */}
			<div className="flex items-center gap-1 border-b border-gray-200 pb-0">
				<button
					type="button"
					onClick={() => setActiveFilter("all")}
					className={`px-4 py-2 text-sm font-medium transition-colors relative ${
						activeFilter === "all"
							? "text-primary border-b-2 border-primary"
							: "text-gray-600 hover:text-gray-900"
					}`}
				>
					All
				</button>
				<button
					type="button"
					onClick={() => setActiveFilter("overdue")}
					className={`px-4 py-2 text-sm font-medium transition-colors relative flex items-center gap-2 ${
						activeFilter === "overdue"
							? "text-primary border-b-2 border-primary"
							: "text-gray-600 hover:text-gray-900"
					}`}
				>
					Rent overdue
					{filterCounts.overdue > 0 && (
						<span className="bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
							{filterCounts.overdue}
						</span>
					)}
				</button>
				<button
					type="button"
					onClick={() => setActiveFilter("due-soon")}
					className={`px-4 py-2 text-sm font-medium transition-colors relative flex items-center gap-2 ${
						activeFilter === "due-soon"
							? "text-primary border-b-2 border-primary"
							: "text-gray-600 hover:text-gray-900"
					}`}
				>
					Rent due soon
					{filterCounts["due-soon"] > 0 && (
						<span className="bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
							{filterCounts["due-soon"]}
						</span>
					)}
				</button>
				<button
					type="button"
					onClick={() => setActiveFilter("due-later")}
					className={`px-4 py-2 text-sm font-medium transition-colors relative flex items-center gap-2 ${
						activeFilter === "due-later"
							? "text-primary border-b-2 border-primary"
							: "text-gray-600 hover:text-gray-900"
					}`}
				>
					Rent due later
					{filterCounts["due-later"] > 0 && (
						<span className="bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
							{filterCounts["due-later"]}
						</span>
					)}
				</button>
				<button
					type="button"
					onClick={() => setActiveFilter("vacant")}
					className={`px-4 py-2 text-sm font-medium transition-colors relative flex items-center gap-2 ${
						activeFilter === "vacant"
							? "text-primary border-b-2 border-primary"
							: "text-gray-600 hover:text-gray-900"
					}`}
				>
					Vacant
					{filterCounts.vacant > 0 && (
						<span className="bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
							{filterCounts.vacant}
						</span>
					)}
				</button>
				<button
					type="button"
					onClick={() => setActiveFilter("multi-unit")}
					className={`px-4 py-2 text-sm font-medium transition-colors relative flex items-center gap-2 ${
						activeFilter === "multi-unit"
							? "text-primary border-b-2 border-primary"
							: "text-gray-600 hover:text-gray-900"
					}`}
				>
					Multi-Unit
					{filterCounts["multi-unit"] > 0 && (
						<span className="bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
							{filterCounts["multi-unit"]}
						</span>
					)}
				</button>
			</div>

			{/* Search Bar */}
			<Input
				placeholder="Search address or tenants"
				value={searchQuery}
				onValueChange={setSearchQuery}
				startContent={<Search className="w-4 h-4 text-gray-400" />}
				classNames={{
					input: "text-sm",
					inputWrapper: "bg-white border-gray-200 hover:border-gray-300",
				}}
				className="max-w-md"
			/>

			{/* Properties Table */}
			<Card className="border border-gray-200 shadow-sm">
				<CardBody className="p-0">
					<Table
						aria-label="Properties table"
						removeWrapper
						classNames={{
							base: "min-h-[400px]",
							table: "min-h-[400px]",
							thead: "[&>tr]:first:shadow-none",
							th: "bg-gray-50 text-gray-700 font-semibold text-xs uppercase tracking-wider border-b border-gray-200",
							td: "border-b border-gray-100",
						}}
					>
						<TableHeader>
							<TableColumn>PROPERTY</TableColumn>
							<TableColumn>TENANTS</TableColumn>
							<TableColumn>DUE DATE</TableColumn>
							<TableColumn>RENT DUE</TableColumn>
							<TableColumn>STATUS</TableColumn>
						</TableHeader>
						<TableBody emptyContent="No properties found">
							{paginatedProperties.map((property) => {
								const rentStatus = getRentStatus(property);
								const isOverdue = rentStatus === "overdue";

								return (
									<TableRow
										key={property.id}
										className="hover:bg-gray-50 transition-colors"
									>
										<TableCell>
											<Link
												to={`/dashboard/properties/${property.id}`}
												className="flex items-center gap-4 no-underline text-inherit hover:text-inherit"
											>
												{/* Property Image */}
												<div className="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 flex-shrink-0">
													{property.image ? (
														<img
															src={property.image}
															alt={property.address}
															className="w-full h-full object-cover"
														/>
													) : (
														<div className="w-full h-full flex items-center justify-center">
															{property.isMultiUnit ? (
																<Building2 className="w-6 h-6 text-gray-400" />
															) : (
																<Home className="w-6 h-6 text-gray-400" />
															)}
														</div>
													)}
												</div>
												{/* Property Info */}
												<div className="flex-1 min-w-0">
													<p className="font-semibold text-gray-900 truncate">
														{property.address.split(",")[0]}
													</p>
													<p className="text-sm text-gray-500 truncate">
														{property.address
															.split(",")
															.slice(1)
															.join(",")
															.trim() || property.type}
													</p>
												</div>
											</Link>
										</TableCell>
										<TableCell>
											<Link
												to={`/dashboard/properties/${property.id}`}
												className="no-underline text-inherit hover:text-inherit block"
											>
												{property.tenant ? (
													<span className="text-gray-900">
														{property.tenant}
													</span>
												) : (
													<span className="text-gray-400">-</span>
												)}
											</Link>
										</TableCell>
										<TableCell>
											<Link
												to={`/dashboard/properties/${property.id}`}
												className="no-underline text-inherit hover:text-inherit block"
											>
												{property.dueDate && property.tenant ? (
													<span className="text-gray-900">
														{formatDueDate(property.dueDate)}
													</span>
												) : (
													<span className="text-gray-400">-</span>
												)}
											</Link>
										</TableCell>
										<TableCell>
											<Link
												to={`/dashboard/properties/${property.id}`}
												className="no-underline text-inherit hover:text-inherit block"
											>
												{property.tenant ? (
													<span className="font-semibold text-gray-900">
														{formatCurrency(property.rent)}
													</span>
												) : (
													<span className="text-gray-400">-</span>
												)}
											</Link>
										</TableCell>
										<TableCell>
											<Link
												to={`/dashboard/properties/${property.id}`}
												className="no-underline text-inherit hover:text-inherit block"
											>
												{isOverdue ? (
													<Chip
														size="sm"
														color="danger"
														variant="flat"
														className="font-semibold"
													>
														OVERDUE
													</Chip>
												) : property.status === "vacant" ? (
													<Chip
														size="sm"
														color="default"
														variant="flat"
														className="font-semibold"
													>
														VACANT
													</Chip>
												) : (
													<Chip
														size="sm"
														color="success"
														variant="flat"
														className="font-semibold"
													>
														OCCUPIED
													</Chip>
												)}
											</Link>
										</TableCell>
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
				</CardBody>
			</Card>

			{/* Pagination */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2 text-sm text-gray-600">
					<span>Rows per page:</span>
					<Select
						selectedKeys={[rowsPerPage.toString()]}
						onSelectionChange={(keys) => {
							const value = Array.from(keys)[0] as string;
							setRowsPerPage(Number(value));
							setCurrentPage(1);
						}}
						className="w-20"
						size="sm"
					>
						<SelectItem key="10">10</SelectItem>
						<SelectItem key="25">25</SelectItem>
						<SelectItem key="50">50</SelectItem>
						<SelectItem key="100">100</SelectItem>
					</Select>
				</div>
				<div className="flex items-center gap-4">
					<span className="text-sm text-gray-600">
						{(currentPage - 1) * rowsPerPage + 1}-
						{Math.min(currentPage * rowsPerPage, filteredProperties.length)} of{" "}
						{filteredProperties.length}
					</span>
					<div className="flex gap-1">
						<Button
							size="sm"
							variant="light"
							isDisabled={currentPage === 1}
							onPress={() => setCurrentPage((p) => Math.max(1, p - 1))}
						>
							←
						</Button>
						<Button
							size="sm"
							variant="light"
							isDisabled={currentPage === totalPages || totalPages === 0}
							onPress={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
						>
							→
						</Button>
					</div>
				</div>
			</div>

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

