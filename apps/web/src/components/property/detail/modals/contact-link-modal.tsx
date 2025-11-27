import {
	Avatar,
	Button,
	Modal,
	ModalBody,
	ModalContent,
	ModalHeader,
} from "@heroui/react";
import { Link2 } from "lucide-react";
import { useNavigate } from "react-router";
import type { Contact } from "../types";
import { getContactTypeLabel } from "../utils";

interface ContactLinkModalProps {
	isOpen: boolean;
	onClose: () => void;
	availableContacts: Contact[];
	onLinkContact: (contactId: string, role: string) => void;
}

export function ContactLinkModal({
	isOpen,
	onClose,
	availableContacts,
	onLinkContact,
}: ContactLinkModalProps) {
	const navigate = useNavigate();

	return (
		<Modal isOpen={isOpen} onClose={onClose} size="lg">
			<ModalContent>
				<ModalHeader>Vincular Contato</ModalHeader>
				<ModalBody>
					{availableContacts.length === 0 ? (
						<EmptyState onNavigate={() => navigate("/dashboard/contacts")} />
					) : (
						<ContactList
							contacts={availableContacts}
							onLinkContact={(contact) => {
								onLinkContact(contact.id, contact.type);
								onClose();
							}}
						/>
					)}
				</ModalBody>
			</ModalContent>
		</Modal>
	);
}

function EmptyState({ onNavigate }: { onNavigate: () => void }) {
	return (
		<div className="py-8 text-center">
			<p className="text-gray-500">Todos os contatos já estão vinculados</p>
			<Button className="mt-4" onPress={onNavigate}>
				Gerenciar Contatos
			</Button>
		</div>
	);
}

function ContactList({
	contacts,
	onLinkContact,
}: {
	contacts: Contact[];
	onLinkContact: (contact: Contact) => void;
}) {
	return (
		<div className="max-h-96 space-y-2 overflow-auto">
			{contacts.map((contact) => (
				<ContactItem
					key={contact.id}
					contact={contact}
					onLink={() => onLinkContact(contact)}
				/>
			))}
		</div>
	);
}

function ContactItem({
	contact,
	onLink,
}: {
	contact: Contact;
	onLink: () => void;
}) {
	return (
		<div className="flex items-center justify-between rounded-lg border border-gray-200 p-3 hover:bg-gray-50">
			<div className="flex items-center gap-3">
				<Avatar name={contact.firstName || "?"} size="sm" />
				<div>
					<p className="font-medium text-gray-900">
						{contact.firstName} {contact.lastName}
					</p>
					<p className="text-gray-500 text-xs">
						{getContactTypeLabel(contact.type)}
					</p>
				</div>
			</div>
			<Button
				size="sm"
				color="primary"
				variant="flat"
				startContent={<Link2 className="h-4 w-4" />}
				onPress={onLink}
			>
				Vincular
			</Button>
		</div>
	);
}
