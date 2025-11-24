import type { Route } from "./+types/route";
import { useMemo } from "react";
import { useNavigate } from "react-router";
import { Button, Card, CardBody } from "@heroui/react";
import { ArrowLeft } from "lucide-react";
import { enhancedPropertyDetails, getPropertyWithTenants } from "@/lib/mock-data/enhanced-property-details";
import { EnhancedPropertyHeader } from "@/components/property/enhanced-property-header";
import { EnhancedPropertyTabs } from "@/components/property/enhanced-property-tabs";
import { RentOverviewCardEnhanced } from "@/components/property/rent-overview-card-enhanced";
import { TenantsCardEnhanced } from "@/components/property/tenants-card-enhanced";
import { PaymentsTableEnhanced } from "@/components/property/payments-table-enhanced";
import { PropertyInfoCard } from "@/components/property/property-info-card";
import { useState } from "react";
import { toast } from "sonner";

export function meta(_args: Route.MetaArgs) {
	return [
		{ title: "Unit Details - Rentline" },
		{ name: "description", content: "View detailed unit information" },
	];
}

export default function UnitDetailPage({ params }: Route.ComponentProps) {
	const navigate = useNavigate();
	const [activeTab, setActiveTab] = useState("overview");
	const [activeLeaseId, setActiveLeaseId] = useState<string | undefined>(undefined);

	const propertyId = params.id ? Number.parseInt(params.id, 10) : null;
	const unitId = params.unitId;

	const property = useMemo(() => {
		if (propertyId) {
			return getPropertyWithTenants(propertyId);
		}
		return null;
	}, [propertyId]);

	const unit = useMemo(() => {
		if (!property || !unitId) return null;
		return property.units?.find((u) => u.id === unitId);
	}, [property, unitId]);

	// Create a unit-specific property detail object
	const unitProperty = useMemo(() => {
		if (!property || !unit) return null;

		// Find unit-specific lease and tenant
		const unitLease = property.leases.find((l) => l.id === unit.leaseId);
		const unitTenant = property.tenantDetails?.find(
			(td) => td.propertyTenant.unitId === unit.id,
		);

		return {
			...property,
			name: `Unit ${unit.unitNumber}`,
			address: `${property.address}, Unit ${unit.unitNumber}`,
			squareFeet: unit.squareFeet,
			bedrooms: unit.bedrooms,
			bathrooms: unit.bathrooms,
			monthlyRent: unit.rent,
			status: unit.status,
			leases: unitLease ? [unitLease] : [],
			tenantDetails: unitTenant ? [unitTenant] : [],
			units: undefined, // Don't show nested units
		};
	}, [property, unit]);

	// Set default lease if not set
	useMemo(() => {
		if (unitProperty && !activeLeaseId && unitProperty.leases.length > 0) {
			setActiveLeaseId(unitProperty.leases[0].id);
		}
	}, [unitProperty, activeLeaseId]);

	const activeLease = unitProperty?.leases.find((l) => l.id === activeLeaseId) || unitProperty?.leases[0];

	const payments = useMemo(() => {
		if (!unitProperty) return [];
		if (unitProperty.payments && unitProperty.payments.length > 0) {
			return unitProperty.payments;
		}
		return [];
	}, [unitProperty]);

	const expenses = unitProperty?.expenses || [];

	if (!property || !unit || !unitProperty) {
		return (
			<div className="flex items-center justify-center h-96">
				<div className="text-center">
					<h2 className="text-2xl font-bold text-gray-900 mb-2">Unit Not Found</h2>
					<p className="text-gray-600 mb-4">The unit you're looking for doesn't exist.</p>
					<Button onPress={() => navigate(`/dashboard/properties/${propertyId}`)}>
						Back to Property
					</Button>
				</div>
			</div>
		);
	}

	const handleEditLease = () => {
		if (activeLease) {
			navigate(`/dashboard/properties/${propertyId}/lease/${activeLease.id}/edit`);
		} else {
			navigate(`/dashboard/properties/${propertyId}/lease/new`);
		}
	};

	const handleAddTenant = () => {
		toast.info("Add tenant functionality coming soon");
	};

	const handleAddPayment = () => {
		toast.info("Add payment functionality coming soon");
	};

	const handleAddExpense = () => {
		toast.info("Add expense functionality coming soon");
	};

	const renderTabContent = () => {
		switch (activeTab) {
			case "overview":
				return (
					<div className="space-y-6">
						<PropertyInfoCard property={unitProperty} />

						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<RentOverviewCardEnhanced
								property={unitProperty}
								lease={activeLease}
								onEditLease={handleEditLease}
							/>
							<TenantsCardEnhanced
								property={unitProperty}
								tenantDetails={unitProperty.tenantDetails || []}
								onAddTenant={handleAddTenant}
								hasActiveLease={!!activeLease}
							/>
						</div>

						<PaymentsTableEnhanced
							property={unitProperty}
							payments={payments}
							expenses={expenses}
							onAddPayment={handleAddPayment}
							onAddExpense={handleAddExpense}
						/>
					</div>
				);

			default:
				return null;
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-4">
				<Button
					variant="light"
					onPress={() => navigate(`/dashboard/properties/${propertyId}`)}
					startContent={<ArrowLeft className="w-4 h-4" />}
				>
					Back to {property.name}
				</Button>
			</div>

			<EnhancedPropertyHeader
				property={unitProperty}
				activeLeaseId={activeLeaseId}
				onLeaseChange={setActiveLeaseId}
				onAddClick={() => toast.info("Add functionality coming soon")}
			/>

			<EnhancedPropertyTabs activeTab={activeTab} onTabChange={setActiveTab} />

			{renderTabContent()}
		</div>
	);
}

