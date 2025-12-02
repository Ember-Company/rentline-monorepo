import { Button, Select, SelectItem } from "@heroui/react";
import type { FormApi } from "@tanstack/react-form";
import { Plus, Trash2 } from "lucide-react";
import { contactRoleOptions, type LeaseContact } from "../types";

interface Contact {
	id: string;
	firstName?: string;
	lastName?: string;
	type: string;
}

interface StepFourProps {
	form: FormApi<any, any>;
	contacts: Contact[];
	onAddContact: () => void;
	onRemoveContact: (index: number) => void;
}

export function StepFourContacts({
	form,
	contacts,
	onAddContact,
	onRemoveContact,
}: StepFourProps) {
	return (
		<div className="space-y-4">
			<h3 className="font-semibold text-lg">Lease Contacts</h3>
			<p className="text-sm text-gray-500">
				Add owners, agents, guarantors, or emergency contacts
			</p>

			<div>
				<div className="mb-2 flex items-center justify-between">
					<label className="font-medium">Contacts</label>
					<Button
						size="sm"
						variant="light"
						startContent={<Plus className="h-4 w-4" />}
						onPress={onAddContact}
					>
						Add Contact
					</Button>
				</div>

				{form.getFieldValue("contacts")?.map(
					(contact: LeaseContact, index: number) => (
						<div key={index} className="mb-3 flex gap-2">
							<Select
								placeholder="Select contact"
								selectedKeys={contact.contactId ? [contact.contactId] : []}
								onSelectionChange={(keys) => {
									const current = form.getFieldValue("contacts") || [];
									const updated = [...current];
									updated[index] = {
										...updated[index],
										contactId: Array.from(keys)[0] as string,
									};
									form.setFieldValue("contacts", updated);
								}}
								className="flex-1"
							>
								{contacts.map((c) => (
									<SelectItem key={c.id}>
										{c.firstName} {c.lastName} ({c.type})
									</SelectItem>
								))}
							</Select>

							<Select
								placeholder="Role"
								selectedKeys={[contact.role]}
								onSelectionChange={(keys) => {
									const current = form.getFieldValue("contacts") || [];
									const updated = [...current];
									updated[index] = {
										...updated[index],
										role: Array.from(keys)[0] as any,
									};
									form.setFieldValue("contacts", updated);
								}}
								className="w-48"
							>
								{contactRoleOptions.map((role) => (
									<SelectItem key={role.value}>{role.label}</SelectItem>
								))}
							</Select>

							<Button
								isIconOnly
								variant="light"
								color="danger"
								onPress={() => onRemoveContact(index)}
							>
								<Trash2 className="h-4 w-4" />
							</Button>
						</div>
					),
				)}
			</div>
		</div>
	);
}
