import {
	Avatar,
	Button,
	Card,
	CardBody,
	CardHeader,
	Chip,
	Table,
	TableBody,
	TableCell,
	TableColumn,
	TableHeader,
	TableRow,
} from "@heroui/react";
import { Unlink, UserPlus, Users } from "lucide-react";
import type { Contact } from "../types";
import { getContactTypeLabel } from "../utils";

interface ContactsTabProps {
	propertyContacts: Contact[];
	onLinkContact: () => void;
	onUnlinkContact: (contactId: string) => void;
}

export function ContactsTab({
	propertyContacts,
	onLinkContact,
	onUnlinkContact,
}: ContactsTabProps) {
	return (
		<Card className="border border-gray-200 shadow-sm">
			<CardHeader className="flex items-center justify-between border-gray-100 border-b bg-gray-50/50 px-6 py-4">
				<h3 className="font-semibold text-gray-900 text-lg">
					Contatos Vinculados
				</h3>
				<Button
					color="primary"
					size="sm"
					startContent={<UserPlus className="h-4 w-4" />}
					onPress={onLinkContact}
				>
					Vincular Contato
				</Button>
			</CardHeader>
			<CardBody className="p-0">
				{propertyContacts.length === 0 ? (
					<EmptyState onAction={onLinkContact} />
				) : (
					<ContactsTable
						contacts={propertyContacts}
						onUnlink={onUnlinkContact}
					/>
				)}
			</CardBody>
		</Card>
	);
}

function ContactsTable({
	contacts,
	onUnlink,
}: {
	contacts: Contact[];
	onUnlink: (contactId: string) => void;
}) {
	return (
		<Table removeWrapper aria-label="Contatos">
			<TableHeader>
				<TableColumn>CONTATO</TableColumn>
				<TableColumn>TIPO</TableColumn>
				<TableColumn>EMAIL</TableColumn>
				<TableColumn>TELEFONE</TableColumn>
				<TableColumn width={50}>AÇÕES</TableColumn>
			</TableHeader>
			<TableBody>
				{contacts.map((contact) => (
					<TableRow key={contact.id} className="hover:bg-gray-50">
						<TableCell>
							<div className="flex items-center gap-3">
								<Avatar name={contact.firstName || "?"} size="sm" />
								<div>
									<p className="font-medium text-gray-900">
										{contact.firstName} {contact.lastName}
									</p>
									{contact.companyName && (
										<p className="text-gray-500 text-xs">
											{contact.companyName}
										</p>
									)}
								</div>
							</div>
						</TableCell>
						<TableCell>
							<Chip size="sm" variant="flat">
								{getContactTypeLabel(contact.type)}
							</Chip>
						</TableCell>
						<TableCell className="text-gray-600 text-sm">
							{contact.email || "-"}
						</TableCell>
						<TableCell className="text-gray-600 text-sm">
							{contact.phone || contact.mobile || "-"}
						</TableCell>
						<TableCell>
							<Button
								isIconOnly
								size="sm"
								variant="light"
								color="danger"
								onPress={() => onUnlink(contact.id)}
							>
								<Unlink className="h-4 w-4" />
							</Button>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}

function EmptyState({ onAction }: { onAction: () => void }) {
	return (
		<div className="py-12 text-center">
			<Users className="mx-auto mb-3 h-10 w-10 text-gray-300" />
			<p className="text-gray-500">Nenhum contato vinculado a este imóvel</p>
			<Button className="mt-4" variant="light" onPress={onAction}>
				Vincular primeiro contato
			</Button>
		</div>
	);
}
