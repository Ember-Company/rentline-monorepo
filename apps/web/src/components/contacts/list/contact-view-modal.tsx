import {
	Avatar,
	Button,
	Chip,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	Spinner,
} from "@heroui/react";
import { Mail, MapPin, Phone } from "lucide-react";
import type { Contact, ContactType } from "./types";
import {
	getContactInitials,
	getContactName,
	TAB_LABELS,
	TYPE_COLORS,
} from "./types";

interface ContactViewModalProps {
	isOpen: boolean;
	onClose: () => void;
	contact?: Contact | null;
	isLoading?: boolean;
	onEdit: (id: string) => void;
}

export function ContactViewModal({
	isOpen,
	onClose,
	contact,
	isLoading,
	onEdit,
}: ContactViewModalProps) {
	return (
		<Modal isOpen={isOpen} onClose={onClose} size="lg">
			<ModalContent>
				{(onModalClose) => (
					<>
						{isLoading || !contact ? (
							<ModalBody className="flex justify-center py-12">
								<Spinner />
							</ModalBody>
						) : (
							<ContactViewContent
								contact={contact}
								onClose={onModalClose}
								onEdit={onEdit}
							/>
						)}
					</>
				)}
			</ModalContent>
		</Modal>
	);
}

function ContactViewContent({
	contact,
	onClose,
	onEdit,
}: {
	contact: Contact;
	onClose: () => void;
	onEdit: (id: string) => void;
}) {
	return (
		<>
			<ModalHeader className="border-gray-100 border-b">
				<div className="flex items-center gap-4">
					<Avatar
						name={getContactInitials(contact)}
						size="lg"
						className="bg-primary/10 text-primary"
					/>
					<div>
						<h2 className="font-semibold text-lg">{getContactName(contact)}</h2>
						<Chip
							size="sm"
							color={TYPE_COLORS[contact.type as ContactType]}
							variant="flat"
						>
							{TAB_LABELS[contact.type as ContactType]?.slice(0, -1)}
						</Chip>
					</div>
				</div>
			</ModalHeader>
			<ModalBody className="py-6">
				<div className="space-y-4">
					{contact.email && (
						<InfoRow
							icon={Mail}
							label="Email"
							value={
								<a
									href={`mailto:${contact.email}`}
									className="font-medium text-primary text-sm hover:underline"
								>
									{contact.email}
								</a>
							}
						/>
					)}
					{(contact.phone || contact.mobile) && (
						<InfoRow
							icon={Phone}
							label="Telefone"
							value={
								<div>
									<p className="font-medium text-gray-900 text-sm">
										{contact.phone || contact.mobile}
									</p>
									{contact.mobile && contact.mobile !== contact.phone && (
										<p className="text-gray-500 text-xs">{contact.mobile}</p>
									)}
								</div>
							}
						/>
					)}
					{(contact.address || contact.city) && (
						<InfoRow
							icon={MapPin}
							label="Endereço"
							value={
								<p className="font-medium text-gray-900 text-sm">
									{contact.address}
									{contact.city && (
										<>
											<br />
											{contact.city}
											{contact.state && ` - ${contact.state}`}
										</>
									)}
									{contact.postalCode && (
										<>
											<br />
											CEP: {contact.postalCode}
										</>
									)}
								</p>
							}
						/>
					)}
					{contact.notes && (
						<div className="rounded-lg bg-gray-50 p-4">
							<p className="font-medium text-gray-500 text-xs">Observações</p>
							<p className="mt-1 text-gray-700 text-sm">{contact.notes}</p>
						</div>
					)}
				</div>
			</ModalBody>
			<ModalFooter className="border-gray-100 border-t">
				<Button variant="light" onPress={onClose}>
					Fechar
				</Button>
				<Button
					color="primary"
					onPress={() => {
						onClose();
						onEdit(contact.id);
					}}
				>
					Editar
				</Button>
			</ModalFooter>
		</>
	);
}

function InfoRow({
	icon: Icon,
	label,
	value,
}: {
	icon: typeof Mail;
	label: string;
	value: React.ReactNode;
}) {
	return (
		<div className="flex items-start gap-3">
			<Icon className="h-5 w-5 text-gray-400" />
			<div>
				<p className="text-gray-500 text-xs">{label}</p>
				{value}
			</div>
		</div>
	);
}
