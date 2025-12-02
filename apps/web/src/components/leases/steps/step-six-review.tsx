import { Card, CardBody } from "@heroui/react";
import type { FormApi } from "@tanstack/react-form";
import type { LeaseContact } from "../types";

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

interface Contact {
	id: string;
	firstName?: string;
	lastName?: string;
}

interface StepSixProps {
	form: FormApi<any, any>;
	properties: Property[];
	units: Unit[];
	tenants: Tenant[];
	allContacts: Contact[];
}

export function StepSixReview({
	form,
	properties,
	units,
	tenants,
	allContacts,
}: StepSixProps) {
	return (
		<div className="space-y-4">
			<h3 className="font-semibold text-lg">Review Lease Details</h3>

			<Card className="border border-gray-200">
				<CardBody className="space-y-4">
					<div>
						<h4 className="mb-2 font-medium">Property & Tenant</h4>
						<div className="space-y-1 text-sm">
							<p>
								<span className="text-gray-500">Property:</span>{" "}
								{properties.find((p) => p.id === form.getFieldValue("propertyId"))
									?.name}
							</p>
							{form.getFieldValue("unitId") && (
								<p>
									<span className="text-gray-500">Unit:</span>{" "}
									{units.find((u) => u.id === form.getFieldValue("unitId"))
										?.unitNumber}
								</p>
							)}
							<p>
								<span className="text-gray-500">Tenant:</span>{" "}
								{(() => {
									const tenant = tenants.find(
										(t) => t.id === form.getFieldValue("tenantContactId"),
									);
									return tenant ? `${tenant.firstName} ${tenant.lastName}` : "";
								})()}
							</p>
							<p>
								<span className="text-gray-500">Period:</span>{" "}
								{form.getFieldValue("startDate")} →{" "}
								{form.getFieldValue("endDate") || "Indefinite"}
							</p>
						</div>
					</div>

					<div>
						<h4 className="mb-2 font-medium">Financial</h4>
						<div className="space-y-1 text-sm">
							<p>
								<span className="text-gray-500">Rent:</span> R${" "}
								{form.getFieldValue("rentAmount")} /{" "}
								{form.getFieldValue("paymentFrequency")}
							</p>
							<p>
								<span className="text-gray-500">Due Day:</span>{" "}
								{form.getFieldValue("paymentDueDay")}º
							</p>
							{form.getFieldValue("depositAmount") && (
								<p>
									<span className="text-gray-500">Deposit:</span> R${" "}
									{form.getFieldValue("depositAmount")}
								</p>
							)}
						</div>
					</div>

					{form.getFieldValue("contacts").length > 0 && (
						<div>
							<h4 className="mb-2 font-medium">Contacts</h4>
							<div className="space-y-1 text-sm">
								{form
									.getFieldValue("contacts")
									.map((contact: LeaseContact, i: number) => {
										const c = allContacts.find(
											(ac) => ac.id === contact.contactId,
										);
										return (
											<p key={i}>
												<span className="text-gray-500">{contact.role}:</span>{" "}
												{c ? `${c.firstName} ${c.lastName}` : ""}
											</p>
										);
									})}
							</div>
						</div>
					)}
				</CardBody>
			</Card>
		</div>
	);
}
