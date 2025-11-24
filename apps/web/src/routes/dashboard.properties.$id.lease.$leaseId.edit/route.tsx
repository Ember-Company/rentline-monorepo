import type { Route } from "./+types/route";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Button, Card, CardBody, Input, Select, SelectItem } from "@heroui/react";
import { ArrowLeft, Save } from "lucide-react";
import { useForm } from "@tanstack/react-form";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { enhancedPropertyDetails } from "@/lib/mock-data/enhanced-property-details";
import { formatDate } from "@/lib/utils/format";
import z from "zod";

export function meta(_args: Route.MetaArgs) {
	return [
		{ title: "Edit Lease - Rentline" },
		{ name: "description", content: "Edit lease information" },
	];
}

export default function EditLeasePage({ params }: Route.ComponentProps) {
	const navigate = useNavigate();
	const propertyId = params.id ? Number.parseInt(params.id, 10) : null;
	const leaseId = params.leaseId;

	const property = propertyId ? enhancedPropertyDetails[propertyId] : null;
	const lease = property?.leases.find((l) => l.id === leaseId);

	if (!property || !lease) {
		return (
			<div className="flex items-center justify-center h-96">
				<div className="text-center">
					<h2 className="text-2xl font-bold text-gray-900 mb-2">Lease Not Found</h2>
					<p className="text-gray-600 mb-4">The lease you're looking for doesn't exist.</p>
					<Button onPress={() => navigate(`/dashboard/properties/${propertyId}`)}>
						Back to Property
					</Button>
				</div>
			</div>
		);
	}

	const form = useForm({
		defaultValues: {
			startDate: lease.startDate,
			endDate: lease.endDate,
			monthlyRent: lease.monthlyRent.toString(),
			deposit: lease.deposit.toString(),
			currency: lease.currency,
			paymentDay: lease.paymentDay.toString(),
			status: lease.status,
			notes: lease.notes || "",
		},
		onSubmit: async ({ value }) => {
			// In real app, this would update the lease
			toast.success("Lease updated successfully");
			navigate(`/dashboard/properties/${propertyId}`);
		},
		validators: {
			onSubmit: z.object({
				startDate: z.string().min(1, "Start date is required"),
				endDate: z.string().min(1, "End date is required"),
				monthlyRent: z.string().regex(/^\d+(\.\d{2})?$/, "Must be a valid amount"),
				deposit: z.string().regex(/^\d+(\.\d{2})?$/, "Must be a valid amount"),
				currency: z.string().min(1, "Currency is required"),
				paymentDay: z.string().regex(/^\d+$/, "Must be a valid day (1-31)"),
				status: z.enum(["active", "expired", "upcoming", "terminated"]),
			}),
		},
	});

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Button
						variant="light"
						onPress={() => navigate(`/dashboard/properties/${propertyId}`)}
						startContent={<ArrowLeft className="w-4 h-4" />}
					>
						Back
					</Button>
					<div>
						<h1 className="text-3xl font-bold text-gray-900">Edit Lease</h1>
						<p className="text-gray-600">{property.name}</p>
					</div>
				</div>
			</div>

			{/* Form */}
			<Card className="border border-gray-200 shadow-sm">
				<CardBody className="p-6">
					<form
						onSubmit={(e) => {
							e.preventDefault();
							form.handleSubmit();
						}}
						className="space-y-6"
					>
						{/* Lease Dates */}
						<div className="grid grid-cols-2 gap-4">
							<form.Field name="startDate">
								{(field) => (
									<div className="space-y-2">
										<Label htmlFor={field.name}>Start Date *</Label>
										<Input
											id={field.name}
											type="date"
											value={field.state.value}
											onBlur={field.handleBlur}
											onValueChange={(e) => field.handleChange(e)}
										/>
										{field.state.meta.errors.map((error) => (
											<p key={error?.message} className="text-sm text-danger">
												{error?.message}
											</p>
										))}
									</div>
								)}
							</form.Field>

							<form.Field name="endDate">
								{(field) => (
									<div className="space-y-2">
										<Label htmlFor={field.name}>End Date *</Label>
										<Input
											id={field.name}
											type="date"
											value={field.state.value}
											onBlur={field.handleBlur}
											onValueChange={(e) => field.handleChange(e)}
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

						{/* Financial Information */}
						<div className="grid grid-cols-3 gap-4">
							<form.Field name="monthlyRent">
								{(field) => (
									<div className="space-y-2">
										<Label htmlFor={field.name}>Monthly Rent *</Label>
										<Input
											id={field.name}
											type="number"
											value={field.state.value}
											onBlur={field.handleBlur}
											onValueChange={(e) => field.handleChange(e)}
											startContent={form.state.values.currency}
										/>
										{field.state.meta.errors.map((error) => (
											<p key={error?.message} className="text-sm text-danger">
												{error?.message}
											</p>
										))}
									</div>
								)}
							</form.Field>

							<form.Field name="deposit">
								{(field) => (
									<div className="space-y-2">
										<Label htmlFor={field.name}>Deposit *</Label>
										<Input
											id={field.name}
											type="number"
											value={field.state.value}
											onBlur={field.handleBlur}
											onValueChange={(e) => field.handleChange(e)}
											startContent={form.state.values.currency}
										/>
										{field.state.meta.errors.map((error) => (
											<p key={error?.message} className="text-sm text-danger">
												{error?.message}
											</p>
										))}
									</div>
								)}
							</form.Field>

							<form.Field name="currency">
								{(field) => (
									<div className="space-y-2">
										<Label htmlFor={field.name}>Currency *</Label>
										<Select
											selectedKeys={[field.state.value]}
											onSelectionChange={(keys) =>
												field.handleChange(Array.from(keys)[0] as string)
											}
										>
											<SelectItem key="USD">USD</SelectItem>
											<SelectItem key="GBP">GBP</SelectItem>
											<SelectItem key="EUR">EUR</SelectItem>
											<SelectItem key="BRL">BRL</SelectItem>
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

						{/* Payment Day and Status */}
						<div className="grid grid-cols-2 gap-4">
							<form.Field name="paymentDay">
								{(field) => (
									<div className="space-y-2">
										<Label htmlFor={field.name}>Payment Day (Day of Month) *</Label>
										<Input
											id={field.name}
											type="number"
											min="1"
											max="31"
											value={field.state.value}
											onBlur={field.handleBlur}
											onValueChange={(e) => field.handleChange(e)}
										/>
										{field.state.meta.errors.map((error) => (
											<p key={error?.message} className="text-sm text-danger">
												{error?.message}
											</p>
										))}
									</div>
								)}
							</form.Field>

							<form.Field name="status">
								{(field) => (
									<div className="space-y-2">
										<Label htmlFor={field.name}>Status *</Label>
										<Select
											selectedKeys={[field.state.value]}
											onSelectionChange={(keys) =>
												field.handleChange(Array.from(keys)[0] as string)
											}
										>
											<SelectItem key="active">Active</SelectItem>
											<SelectItem key="expired">Expired</SelectItem>
											<SelectItem key="upcoming">Upcoming</SelectItem>
											<SelectItem key="terminated">Terminated</SelectItem>
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

						{/* Notes */}
						<form.Field name="notes">
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>Notes</Label>
									<Input
										id={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onValueChange={(e) => field.handleChange(e)}
										placeholder="Additional notes about this lease..."
									/>
									{field.state.meta.errors.map((error) => (
										<p key={error?.message} className="text-sm text-danger">
											{error?.message}
										</p>
									))}
								</div>
							)}
						</form.Field>

						{/* Actions */}
						<div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
							<Button
								variant="light"
								onPress={() => navigate(`/dashboard/properties/${propertyId}`)}
							>
								Cancel
							</Button>
							<Button
								color="primary"
								type="submit"
								startContent={<Save className="w-4 h-4" />}
								isLoading={form.state.isSubmitting}
							>
								Save Changes
							</Button>
						</div>
					</form>
				</CardBody>
			</Card>
		</div>
	);
}

