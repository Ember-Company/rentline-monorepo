import type { Route } from "./+types/route";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import {
	enhancedPropertyDetails,
	getPropertyWithTenants,
} from "@/lib/mock-data/enhanced-property-details";
import { properties } from "@/lib/mock-data/properties";
import type { PropertyDetail } from "@/lib/mock-data/property-types";
import { EnhancedPropertyHeader } from "@/components/property/enhanced-property-header";
import { EnhancedPropertyTabs } from "@/components/property/enhanced-property-tabs";
import { RentOverviewCardEnhanced } from "@/components/property/rent-overview-card-enhanced";
import { TenantsCardEnhanced } from "@/components/property/tenants-card-enhanced";
import { PaymentsTableEnhanced } from "@/components/property/payments-table-enhanced";
import { TenantSelectionModal } from "@/components/property/tenant-selection-modal";
import { UnitsSection } from "@/components/property/units-section";
import { PropertyInfoCard } from "@/components/property/property-info-card";
import { ContactsTabs } from "@/components/contacts/contacts-tabs";
import { Card, CardBody, Button } from "@heroui/react";
import { Plus, MoreVertical } from "lucide-react";

export function meta(_args: Route.MetaArgs) {
	return [
		{ title: "Property Details - Rentline" },
		{ name: "description", content: "View detailed property information" },
	];
}

// Mock payments data
interface Payment {
	id: string;
	date: string;
	category: string;
	period: string;
	tenant?: string;
	notes?: string;
	status: "paid" | "pending" | "overdue";
	amount: number;
}

const generatePayments = (
	property: PropertyDetail & {
		tenantDetails?: Array<{ tenant: { name: string } }>;
	},
): Payment[] => {
	if (!property.leases.length) return [];

	const lease = property.leases[0];
	const payments: Payment[] = [];
	const startDate = new Date(lease.startDate);
	const endDate = new Date(lease.endDate);
	const today = new Date();

	// Generate payments for each month
	for (
		let d = new Date(startDate);
		d <= endDate;
		d.setMonth(d.getMonth() + 1)
	) {
		const paymentDate = new Date(d);
		paymentDate.setDate(lease.paymentDay);

		if (paymentDate <= endDate) {
			let status: "paid" | "pending" | "overdue" = "pending";
			if (paymentDate < today) {
				status = "paid";
			} else if (
				paymentDate < new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
			) {
				status = "overdue";
			}

			payments.push({
				id: `pay_${paymentDate.toISOString()}`,
				date: paymentDate.toISOString().split("T")[0],
				category: "Rent",
				period: paymentDate.toLocaleDateString("en-US", {
					day: "numeric",
					month: "short",
					year: "numeric",
				}),
				tenant:
					property.tenantDetails && property.tenantDetails.length > 0
						? property.tenantDetails[0].tenant.name
						: undefined,
				notes: "",
				status,
				amount: lease.monthlyRent,
			});
		}
	}

	return payments.sort(
		(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
	);
};

export default function PropertyDetailPage({ params }: Route.ComponentProps) {
	const navigate = useNavigate();
	const [activeTab, setActiveTab] = useState("overview");
	const [activeLeaseId, setActiveLeaseId] = useState<string | undefined>(
		undefined,
	);
	const [isTenantModalOpen, setIsTenantModalOpen] = useState(false);
	// const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

	const propertyId = params.id ? Number.parseInt(params.id, 10) : null;
	const basicProperty = propertyId
		? properties.find((p) => p.id === propertyId)
		: null;
	const detailedProperty = propertyId
		? enhancedPropertyDetails[propertyId]
		: null;

	const property = useMemo(() => {
		if (detailedProperty) {
			return getPropertyWithTenants(detailedProperty.id);
		}
		return null;
	}, [detailedProperty]);

	// Set default lease if not set
	useMemo(() => {
		if (property && !activeLeaseId && property.leases.length > 0) {
			setActiveLeaseId(property.leases[0].id);
		}
	}, [property, activeLeaseId]);

	const activeLease =
		property?.leases.find((l) => l.id === activeLeaseId) || property?.leases[0];

	const payments = useMemo(() => {
		if (!property) return [];
		// Use property payments if available, otherwise generate from lease
		if (property.payments && property.payments.length > 0) {
			return property.payments as Payment[];
		}
		return generatePayments(property) as Payment[];
	}, [property]);

	const expenses = property?.expenses || [];

	if (!property) {
		return (
			<div className="flex items-center justify-center h-96">
				<div className="text-center">
					<h2 className="text-2xl font-bold text-gray-900 mb-2">
						Property Not Found
					</h2>
					<p className="text-gray-600 mb-4">
						The property you're looking for doesn't exist.
					</p>
					<button
						type="button"
						onClick={() => navigate("/dashboard/properties")}
						className="text-primary hover:underline"
					>
						Back to Properties
					</button>
				</div>
			</div>
		);
	}

	const handleAddTenant = () => {
		setIsTenantModalOpen(true);
	};

	const handleSelectTenant = (_tenantId: string, _unitId?: string) => {
		// In real app, this would create a property-tenant relationship
		toast.success("Tenant added to property successfully");
		// Refresh property data would happen here
	};

	const handleEditLease = () => {
		if (activeLease) {
			navigate(
				`/dashboard/properties/${property.id}/lease/${activeLease.id}/edit`,
			);
		}
	};

	const handleAddPayment = () => {
		toast.info("Add payment functionality coming soon");
	};

	const handleAddExpense = () => {
		toast.info("Add expense functionality coming soon");
	};

	const handleAddUnit = () => {
		toast.info("Add unit functionality coming soon");
	};

	const handleAddLease = () => {
		navigate(`/dashboard/properties/${property.id}/lease/new`);
	};

	const renderTabContent = () => {
		switch (activeTab) {
			case "overview":
				return (
					<div className="space-y-6">
						{/* Property Information Card - Show for all property types */}
						<PropertyInfoCard property={property} />

						{/* Units Section - Show for apartments/condominiums */}
						{(property.type === "apartments" || property.type === "houses") && property.units && (
							<UnitsSection property={property} onAddUnit={handleAddUnit} />
						)}

						{/* Rent Overview and Tenants */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<RentOverviewCardEnhanced
								property={property}
								lease={activeLease}
								onEditLease={handleAddLease}
							/>
							<TenantsCardEnhanced
								property={property}
								tenantDetails={property.tenantDetails || []}
								onAddTenant={handleAddTenant}
								hasActiveLease={!!activeLease}
							/>
						</div>

						{/* Payments Table */}
						<PaymentsTableEnhanced
							property={property}
							payments={payments}
							expenses={expenses}
							onAddPayment={handleAddPayment}
							onAddExpense={handleAddExpense}
						/>
					</div>
				);

			case "contacts":
				return (
					<div className="space-y-6">
						<ContactsTabs propertyId={property.id.toString()} />
					</div>
				);

			case "documents":
				return (
					<Card className="border border-gray-200 shadow-sm">
						<CardBody className="p-6">
							<div className="flex items-center justify-between mb-6">
								<h3 className="text-lg font-semibold text-gray-900">Documents</h3>
								<Button
									size="sm"
									color="primary"
									startContent={<Plus className="h-4 w-4" />}
									onPress={() => toast.info("Upload document functionality coming soon")}
								>
									Upload Document
								</Button>
							</div>
							{property.documents.length === 0 ? (
								<div className="text-center py-12">
									<p className="text-gray-500 mb-2">No documents uploaded</p>
									<Button
										size="sm"
										variant="light"
										onPress={() => toast.info("Upload document functionality coming soon")}
									>
										Upload your first document
									</Button>
								</div>
							) : (
								<div className="space-y-2">
									{property.documents.map((doc) => (
										<div
											key={doc.id}
											className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary-50/50 transition-colors cursor-pointer"
										>
											<div className="flex items-center gap-3 flex-1">
												<div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
													<span className="text-gray-600 text-lg">📄</span>
												</div>
												<div className="flex-1">
													<p className="text-sm font-medium text-gray-900">{doc.name}</p>
													<p className="text-xs text-gray-500">{doc.type} • {formatDate(doc.uploadedAt)}</p>
												</div>
											</div>
											<Button
												isIconOnly
												variant="light"
												size="sm"
												onPress={() => toast.info("Document actions coming soon")}
											>
												<MoreVertical className="h-4 w-4" />
											</Button>
										</div>
									))}
								</div>
							)}
						</CardBody>
					</Card>
				);

			case "mileage-reminders":
				return (
					<div className="space-y-6">
						{property.type === "land" && (
							<Card className="border border-gray-200 shadow-sm">
								<CardBody className="p-6">
									<div className="flex items-center justify-between mb-6">
										<h3 className="text-lg font-semibold text-gray-900">Mileage</h3>
										<Button
											size="sm"
											color="primary"
											startContent={<Plus className="h-4 w-4" />}
											onPress={() => toast.info("Add mileage functionality coming soon")}
										>
											Add Mileage
										</Button>
									</div>
									{property.mileage && property.mileage.length > 0 ? (
										<div className="space-y-3">
											{property.mileage.map((m) => (
												<div
													key={m.id}
													className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary-50/50 transition-colors"
												>
													<div className="flex-1">
														<p className="font-semibold text-gray-900">{m.mileage} miles</p>
														<p className="text-sm text-gray-500">{formatDate(m.date)}</p>
														{m.notes && (
															<p className="text-sm text-gray-600 mt-1">{m.notes}</p>
														)}
													</div>
													<Button
														isIconOnly
														variant="light"
														size="sm"
														onPress={() => toast.info("Mileage actions coming soon")}
													>
														<MoreVertical className="h-4 w-4" />
													</Button>
												</div>
											))}
										</div>
									) : (
										<div className="text-center py-12">
											<p className="text-gray-500 mb-2">No mileage records</p>
											<Button
												size="sm"
												variant="light"
												onPress={() => toast.info("Add mileage functionality coming soon")}
											>
												Add your first record
											</Button>
										</div>
									)}
								</CardBody>
							</Card>
						)}
						<Card className="border border-gray-200 shadow-sm">
							<CardBody className="p-6">
								<div className="flex items-center justify-between mb-6">
									<h3 className="text-lg font-semibold text-gray-900">Reminders</h3>
									<Button
										size="sm"
										color="primary"
										startContent={<Plus className="h-4 w-4" />}
										onPress={() => toast.info("Add reminder functionality coming soon")}
									>
										Add Reminder
									</Button>
								</div>
								{property.reminders.length === 0 ? (
									<div className="text-center py-12">
										<p className="text-gray-500 mb-2">No reminders set</p>
										<Button
											size="sm"
											variant="light"
											onPress={() => toast.info("Add reminder functionality coming soon")}
										>
											Create your first reminder
										</Button>
									</div>
								) : (
									<div className="space-y-3">
										{property.reminders.map((reminder) => (
											<div
												key={reminder.id}
												className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary-50/50 transition-colors"
											>
												<div className="flex items-center gap-3 flex-1">
													<input
														type="checkbox"
														checked={reminder.completed}
														onChange={() => toast.info("Toggle reminder functionality coming soon")}
														className="w-4 h-4 cursor-pointer rounded border-gray-300 text-primary focus:ring-primary"
													/>
													<div className="flex-1">
														<p className={`font-medium ${reminder.completed ? "text-gray-400 line-through" : "text-gray-900"}`}>
															{reminder.title}
														</p>
														<p className="text-sm text-gray-500">
															{formatDate(reminder.date)}
														</p>
														{reminder.notes && (
															<p className="text-sm text-gray-600 mt-1">
																{reminder.notes}
															</p>
														)}
													</div>
												</div>
												<Button
													isIconOnly
													variant="light"
													size="sm"
													onPress={() => toast.info("Reminder actions coming soon")}
												>
													<MoreVertical className="h-4 w-4" />
												</Button>
											</div>
										))}
									</div>
								)}
							</CardBody>
						</Card>
					</div>
				);

			case "other":
				return (
					<div className="space-y-6">
						<PropertyInfoCard property={property} />
					</div>
				);

			default:
				return null;
		}
	};

	return (
		<div className="space-y-6">
			<EnhancedPropertyHeader
				property={property}
				activeLeaseId={activeLeaseId}
				onLeaseChange={setActiveLeaseId}
				onAddClick={() => toast.info("Add functionality coming soon")}
			/>

			<EnhancedPropertyTabs activeTab={activeTab} onTabChange={setActiveTab} />

			{renderTabContent()}

			{/* Tenant Selection Modal */}
			<TenantSelectionModal
				isOpen={isTenantModalOpen}
				onClose={() => setIsTenantModalOpen(false)}
				property={property}
				onSelectTenant={handleSelectTenant}
			/>
		</div>
	);
}
