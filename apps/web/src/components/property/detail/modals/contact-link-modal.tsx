import {
	Avatar,
	Button,
	Modal,
	ModalBody,
	ModalContent,
	ModalHeader,
	Divider,
} from "@heroui/react";
import { Link2, Plus, X } from "lucide-react";
import { useState } from "react";
import { QuickContactForm } from "@/components/contacts";
import type { Contact } from "../types";
import { getContactTypeLabel } from "../utils";

interface ContactLinkModalProps {
	isOpen: boolean;
	onClose: () => void;
	availableContacts: Contact[];
	onLinkContact: (contactId: string, role: string) => void;
	onCreateContact?: (data: {
		firstName: string;
		lastName: string;
		email: string;
		phone: string;
		type: string;
	}) => Promise<string>; // Returns new contact ID
	isCreatingContact?: boolean;
}

export function ContactLinkModal({
	isOpen,
	onClose,
	availableContacts,
	onLinkContact,
	onCreateContact,
	isCreatingContact,
}: ContactLinkModalProps) {
	const [isCreatingNew, setIsCreatingNew] = useState(false);

	const handleCreateAndLink = async (data: {
		firstName: string;
		lastName: string;
		email: string;
		phone: string;
		type: string;
	}) => {
		if (onCreateContact) {
			const newContactId = await onCreateContact(data);
			onLinkContact(newContactId, data.type);
			setIsCreatingNew(false);
			onClose();
		}
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose} size="lg" scrollBehavior="inside">
			<ModalContent>
				<ModalHeader className="flex items-center justify-between">
					<span>Vincular Contato</span>
					{!isCreatingNew && onCreateContact && (
						<Button
							size="sm"
							color="primary"
							variant="flat"
							startContent={<Plus className="h-4 w-4" />}
							onPress={() => setIsCreatingNew(true)}
						>
							Criar Novo
						</Button>
					)}
				</ModalHeader>
				<ModalBody className="pb-6">
					{isCreatingNew ? (
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<h3 className="font-semibold text-gray-900">Criar Novo Contato</h3>
								<Button
									isIconOnly
									size="sm"
									variant="light"
									onPress={() => setIsCreatingNew(false)}
								>
									<X className="h-4 w-4" />
								</Button>
							</div>
							<QuickContactForm
								onSubmit={handleCreateAndLink}
								onCancel={() => setIsCreatingNew(false)}
								isLoading={isCreatingContact}
							/>
						</div>
					) : (
						<>
							{availableContacts.length === 0 ? (
								<EmptyState onCreateNew={() => setIsCreatingNew(true)} />
							) : (
								<>
									<p className="text-gray-600 text-sm">
										Selecione um contato existente para vincular ao imóvel
									</p>
									<ContactList
										contacts={availableContacts}
										onLinkContact={(contact) => {
											onLinkContact(contact.id, contact.type);
											onClose();
										}}
									/>
								</>
							)}
						</>
					)}
				</ModalBody>
			</ModalContent>
		</Modal>
	);
}

function EmptyState({ onCreateNew }: { onCreateNew: () => void }) {
	return (
		<div className="py-8 text-center">
			<p className="text-gray-500">Todos os contatos já estão vinculados</p>
			<p className="mt-2 text-gray-400 text-sm">
				Crie um novo contato para vincular a este imóvel
			</p>
			<Button
				className="mt-4"
				color="primary"
				startContent={<Plus className="h-4 w-4" />}
				onPress={onCreateNew}
			>
				Criar Novo Contato
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
