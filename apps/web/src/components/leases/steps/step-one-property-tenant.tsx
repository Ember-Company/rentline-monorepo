import { Input, Select, SelectItem } from "@heroui/react";
import type { FormApi } from "@tanstack/react-form";
import { Calendar } from "lucide-react";

interface Property {
	id: string;
	name: string;
}

interface Unit {
	id: string;
	unitNumber: string;
	name?: string;
}

interface Tenant {
	id: string;
	firstName?: string;
	lastName?: string;
}

interface StepOneProps {
	form: FormApi<any, any>;
	properties: Property[];
	units: Unit[];
	tenants: Tenant[];
	selectedPropertyId: string;
	onPropertyChange: (propertyId: string) => void;
	initialPropertyId?: string;
	initialUnitId?: string;
}

export function StepOnePropertyTenant({
	form,
	properties,
	units,
	tenants,
	selectedPropertyId,
	onPropertyChange,
	initialPropertyId,
	initialUnitId,
}: StepOneProps) {
	return (
		<div className="space-y-4">
			<h3 className="font-semibold text-lg">Property & Tenant Selection</h3>

			<div className="grid gap-4 sm:grid-cols-2">
				<form.Field name="propertyId">
					{(field) => (
						<Select
							label="Property"
							placeholder="Select a property"
							selectedKeys={field.state.value ? [field.state.value] : []}
							onSelectionChange={(keys) => {
								const value = Array.from(keys)[0] as string;
								field.handleChange(value);
								onPropertyChange(value);
							}}
							isDisabled={!!initialPropertyId}
							isRequired
						>
							{properties.map((property) => (
								<SelectItem key={property.id}>{property.name}</SelectItem>
							))}
						</Select>
					)}
				</form.Field>

				{selectedPropertyId && units.length > 0 && (
					<form.Field name="unitId">
						{(field) => (
							<Select
								label="Unit (Optional)"
								placeholder="Select a unit"
								selectedKeys={field.state.value ? [field.state.value] : []}
								onSelectionChange={(keys) =>
									field.handleChange(Array.from(keys)[0] as string)
								}
								isDisabled={!!initialUnitId}
							>
								{units.map((unit) => (
									<SelectItem key={unit.id}>
										{unit.unitNumber || unit.name}
									</SelectItem>
								))}
							</Select>
						)}
					</form.Field>
				)}
			</div>

			<form.Field name="tenantContactId">
				{(field) => (
					<Select
						label="Tenant"
						placeholder="Select a tenant"
						selectedKeys={field.state.value ? [field.state.value] : []}
						onSelectionChange={(keys) =>
							field.handleChange(Array.from(keys)[0] as string)
						}
						isRequired
					>
						{tenants.map((tenant) => (
							<SelectItem key={tenant.id}>
								{tenant.firstName} {tenant.lastName}
							</SelectItem>
						))}
					</Select>
				)}
			</form.Field>

			<div className="grid gap-4 sm:grid-cols-3">
				<form.Field name="startDate">
					{(field) => (
						<Input
							label="Start Date"
							type="date"
							value={field.state.value}
							onValueChange={field.handleChange}
							isRequired
							startContent={<Calendar className="h-4 w-4" />}
						/>
					)}
				</form.Field>

				<form.Field name="endDate">
					{(field) => (
						<Input
							label="End Date (Optional)"
							type="date"
							value={field.state.value}
							onValueChange={field.handleChange}
							startContent={<Calendar className="h-4 w-4" />}
						/>
					)}
				</form.Field>

				<form.Field name="moveInDate">
					{(field) => (
						<Input
							label="Move-In Date (Optional)"
							type="date"
							value={field.state.value}
							onValueChange={field.handleChange}
							startContent={<Calendar className="h-4 w-4" />}
						/>
					)}
				</form.Field>
			</div>
		</div>
	);
}
