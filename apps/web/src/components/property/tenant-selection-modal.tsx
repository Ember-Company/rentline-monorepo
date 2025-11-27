import {
	Avatar,
	Button,
	Chip,
	Input,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	Select,
	SelectItem,
	Tab,
	Table,
	TableBody,
	TableCell,
	TableColumn,
	TableHeader,
	TableRow,
	Tabs,
} from "@heroui/react";
import { useForm } from "@tanstack/react-form";
import { Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import z from "zod";
import { Label } from "@/components/ui/label";
import type { PropertyDetail } from "@/lib/mock-data/property-types";
import {
	type TenantEntity,
	tenantEntities,
} from "@/lib/mock-data/tenants-entities";

interface TenantSelectionModalProps {
	isOpen: boolean;
	onClose: () => void;
	property: PropertyDetail;
	onSelectTenant: (tenantId: string, unitId?: string) => void;
}

export function TenantSelectionModal({
	isOpen,
	onClose,
	property,
	onSelectTenant,
}: TenantSelectionModalProps) {
	const [activeTab, setActiveTab] = useState<"select" | "create">("select");
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
	const [selectedUnitId, setSelectedUnitId] = useState<string | undefined>(
		undefined,
	);

	const filteredTenants = useMemo(() => {
		if (!searchQuery) return tenantEntities;
		const query = searchQuery.toLowerCase();
		return tenantEntities.filter(
			(t) =>
				t.name.toLowerCase().includes(query) ||
				t.email.toLowerCase().includes(query) ||
				t.phone.includes(query),
		);
	}, [searchQuery]);

	const availableUnits = useMemo(() => {
		if (property.type !== "apartments" || !property.units) return [];
		return property.units.filter((u) => u.status === "vacant");
	}, [property]);

	const createForm = useForm({
		defaultValues: {
			name: "",
			email: "",
			phone: "",
			address: "",
			city: "",
			state: "",
			postalCode: "",
			country: "",
		},
		onSubmit: async ({ value }) => {
			// In real app, this would create a tenant
			const newTenantId = `tnt_${Date.now()}`;
			toast.success("Tenant created successfully");
			onSelectTenant(newTenantId, selectedUnitId);
			onClose();
			createForm.reset();
		},
		validators: {
			onSubmit: z.object({
				name: z.string().min(2, "Name is required"),
				email: z.string().email("Invalid email"),
				phone: z.string().min(10, "Phone is required"),
			}),
		},
	});

	const handleSelect = () => {
		if (!selectedTenantId) {
			toast.error("Please select a tenant");
			return;
		}
		onSelectTenant(selectedTenantId, selectedUnitId);
		onClose();
		setSelectedTenantId(null);
		setSelectedUnitId(undefined);
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
			<ModalContent>
				<ModalHeader className="flex flex-col gap-1">
					Add Tenant to {property.name}
				</ModalHeader>
				<ModalBody>
					<Tabs
						selectedKey={activeTab}
						onSelectionChange={(key) =>
							setActiveTab(key as "select" | "create")
						}
						aria-label="Tenant selection tabs"
					>
						<Tab key="select" title="Select Existing">
							<div className="space-y-4 pt-4">
								<Input
									placeholder="Search tenants..."
									value={searchQuery}
									onValueChange={setSearchQuery}
									startContent={<Search className="h-4 w-4" />}
									classNames={{
										input: "text-sm",
										inputWrapper: "bg-white border-gray-200",
									}}
								/>

								{property.type === "apartments" &&
									availableUnits.length > 0 && (
										<div>
											<Label>Select Unit (Optional)</Label>
											<Select
												selectedKeys={selectedUnitId ? [selectedUnitId] : []}
												onSelectionChange={(keys) => {
													const unitId = Array.from(keys)[0] as string;
													setSelectedUnitId(unitId || undefined);
												}}
												placeholder="Select unit"
											>
												{availableUnits.map((unit) => (
													<SelectItem key={unit.id}>
														{unit.unitNumber} - {unit.type}
													</SelectItem>
												))}
											</Select>
										</div>
									)}

								<div className="max-h-96 overflow-y-auto rounded-lg border border-gray-200">
									<Table aria-label="Tenants table" removeWrapper>
										<TableHeader>
											<TableColumn width={50} />
											<TableColumn>NAME</TableColumn>
											<TableColumn>EMAIL</TableColumn>
											<TableColumn>PHONE</TableColumn>
											<TableColumn>STATUS</TableColumn>
										</TableHeader>
										<TableBody emptyContent="No tenants found">
											{filteredTenants.map((tenant) => (
												<TableRow
													key={tenant.id}
													className={
														selectedTenantId === tenant.id
															? "bg-primary-50"
															: ""
													}
													onClick={() => setSelectedTenantId(tenant.id)}
												>
													<TableCell>
														<input
															type="radio"
															checked={selectedTenantId === tenant.id}
															onChange={() => setSelectedTenantId(tenant.id)}
															className="cursor-pointer"
														/>
													</TableCell>
													<TableCell>
														<div className="flex items-center gap-2">
															<Avatar
																name={tenant.avatar || tenant.name}
																size="sm"
																className="bg-orange-100 text-orange-600"
															/>
															<span className="font-medium text-sm">
																{tenant.name}
															</span>
														</div>
													</TableCell>
													<TableCell>
														<span className="text-gray-600 text-sm">
															{tenant.email}
														</span>
													</TableCell>
													<TableCell>
														<span className="text-gray-600 text-sm">
															{tenant.phone}
														</span>
													</TableCell>
													<TableCell>
														<Chip
															size="sm"
															color={
																tenant.status === "active"
																	? "success"
																	: "default"
															}
															variant="flat"
														>
															{tenant.status}
														</Chip>
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</div>
							</div>
						</Tab>
						<Tab key="create" title="Create New">
							<form
								onSubmit={(e) => {
									e.preventDefault();
									createForm.handleSubmit();
								}}
								className="space-y-4 pt-4"
							>
								<div className="grid grid-cols-2 gap-4">
									<createForm.Field name="name">
										{(field) => (
											<div className="space-y-2">
												<Label htmlFor={field.name}>Name *</Label>
												<Input
													id={field.name}
													value={field.state.value}
													onBlur={field.handleBlur}
													onValueChange={(e) => field.handleChange(e)}
													placeholder="John Doe"
												/>
												{field.state.meta.errors.map((error) => (
													<p
														key={error?.message}
														className="text-danger text-sm"
													>
														{error?.message}
													</p>
												))}
											</div>
										)}
									</createForm.Field>

									<createForm.Field name="email">
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
													<p
														key={error?.message}
														className="text-danger text-sm"
													>
														{error?.message}
													</p>
												))}
											</div>
										)}
									</createForm.Field>
								</div>

								<createForm.Field name="phone">
									{(field) => (
										<div className="space-y-2">
											<Label htmlFor={field.name}>Phone *</Label>
											<Input
												id={field.name}
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
								</createForm.Field>

								{property.type === "apartments" &&
									availableUnits.length > 0 && (
										<div>
											<Label>Select Unit (Optional)</Label>
											<Select
												selectedKeys={selectedUnitId ? [selectedUnitId] : []}
												onSelectionChange={(keys) => {
													const unitId = Array.from(keys)[0] as string;
													setSelectedUnitId(unitId || undefined);
												}}
												placeholder="Select unit"
											>
												{availableUnits.map((unit) => (
													<SelectItem key={unit.id}>
														{unit.unitNumber} - {unit.type}
													</SelectItem>
												))}
											</Select>
										</div>
									)}
							</form>
						</Tab>
					</Tabs>
				</ModalBody>
				<ModalFooter>
					<Button variant="light" onPress={onClose}>
						Cancel
					</Button>
					{activeTab === "select" ? (
						<Button color="primary" onPress={handleSelect}>
							Add Tenant
						</Button>
					) : (
						<Button
							color="primary"
							onPress={() => createForm.handleSubmit()}
							isLoading={createForm.state.isSubmitting}
						>
							Create & Add
						</Button>
					)}
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}
