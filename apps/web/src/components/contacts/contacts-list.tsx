import {
	Card,
	CardBody,
	Table,
	TableHeader,
	TableColumn,
	TableBody,
	TableRow,
	TableCell,
	Button,
	Input,
	Avatar,
	Chip,
	Dropdown,
	DropdownTrigger,
	DropdownMenu,
	DropdownItem,
} from "@heroui/react";
import { Search, Plus, MoreVertical, Mail, Phone, Building2, User } from "lucide-react";
import { useState, useMemo } from "react";
import { formatDate } from "@/lib/utils/format";
import { ContactFormModal } from "./contact-form-modal";
import { CrudModal } from "@/components/dashboard/crud-modal";
import { toast } from "sonner";
import { trpc } from "@/utils/trpc";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface ContactsListProps {
	contactType: "tenant" | "agent" | "owner";
	propertyId?: string;
}

export function ContactsList({ contactType, propertyId }: ContactsListProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [selectedContact, setSelectedContact] = useState<{ id: string; name: string } | null>(null);
	const [editingContactId, setEditingContactId] = useState<string | undefined>(undefined);

	const queryClient = useQueryClient();

	// Use property-specific query if propertyId is provided
	const contactsQuery = propertyId
		? useQuery({
				...trpc.contacts.getByProperty.queryOptions({ propertyId, type: contactType }),
			})
		: useQuery({
				...trpc.contacts.list.queryOptions({ type: contactType }),
			});

	const deleteMutation = useMutation(trpc.contacts.delete.mutationOptions());
	const unlinkMutation = useMutation(trpc.contacts.unlinkFromProperty.mutationOptions());

	const contacts = contactsQuery.data?.contacts || [];

	const filteredContacts = useMemo(() => {
		if (!searchQuery) return contacts;
		const query = searchQuery.toLowerCase();
		return contacts.filter(
			(contact) =>
				contact.firstName?.toLowerCase().includes(query) ||
				contact.lastName?.toLowerCase().includes(query) ||
				contact.email?.toLowerCase().includes(query) ||
				contact.companyName?.toLowerCase().includes(query) ||
				contact.phone?.includes(query) ||
				contact.mobile?.includes(query),
		);
	}, [contacts, searchQuery]);

	const handleCreate = () => {
		setEditingContactId(undefined);
		setIsModalOpen(true);
	};

	const handleEdit = (contact: (typeof contacts)[0]) => {
		setEditingContactId(contact.id);
		setIsModalOpen(true);
	};

	const handleDelete = (contact: (typeof contacts)[0]) => {
		const name = contact.companyName || `${contact.firstName} ${contact.lastName}`.trim();
		setSelectedContact({ id: contact.id, name });
		setIsDeleteModalOpen(true);
	};

	const confirmDelete = async () => {
		if (!selectedContact) return;

		try {
			// If linked to property, unlink first
			if (propertyId) {
				await unlinkMutation.mutateAsync({
					contactId: selectedContact.id,
					propertyId,
				});
			} else {
				await deleteMutation.mutateAsync({ id: selectedContact.id });
			}

			toast.success("Contact removed successfully");
			queryClient.invalidateQueries({ queryKey: [["contacts"]] });
			setIsDeleteModalOpen(false);
			setSelectedContact(null);
		} catch (error) {
			console.error("Error deleting contact:", error);
			toast.error(error instanceof Error ? error.message : "Failed to remove contact");
		}
	};

	const getContactName = (contact: (typeof contacts)[0]) => {
		if (contact.companyName) return contact.companyName;
		return `${contact.firstName || ""} ${contact.lastName || ""}`.trim() || "Unnamed";
	};

	const getContactInitials = (contact: (typeof contacts)[0]) => {
		if (contact.companyName) {
			return contact.companyName
				.split(" ")
				.map((w) => w[0])
				.join("")
				.toUpperCase()
				.slice(0, 2);
		}
		const first = contact.firstName?.[0] || "";
		const last = contact.lastName?.[0] || "";
		return `${first}${last}`.toUpperCase() || "?";
	};

	const getContactIcon = (contact: (typeof contacts)[0]) => {
		if (contact.companyName) {
			return <Building2 className="h-5 w-5" />;
		}
		return <User className="h-5 w-5" />;
	};

	if (contactsQuery.isLoading) {
		return (
			<Card className="border border-gray-200 shadow-sm">
				<CardBody className="p-6">
					<div className="text-center py-12">
						<p className="text-gray-500">Loading contacts...</p>
					</div>
				</CardBody>
			</Card>
		);
	}

	return (
		<>
			<Card className="border border-gray-200 shadow-sm">
				<CardBody className="p-0">
					{/* Header */}
					<div className="flex items-center justify-between p-6 border-b border-gray-200">
						<h3 className="text-lg font-semibold text-gray-900 capitalize">
							{contactType}s ({filteredContacts.length})
						</h3>
						<Button
							color="primary"
							startContent={<Plus className="h-4 w-4" />}
							onPress={handleCreate}
						>
							New
						</Button>
					</div>

					{/* Search */}
					<div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
						<Input
							placeholder="Search contacts..."
							value={searchQuery}
							onValueChange={setSearchQuery}
							startContent={<Search className="h-4 w-4 text-gray-400" />}
							classNames={{
								input: "text-sm",
								inputWrapper: "bg-white border-gray-200 hover:border-gray-300",
							}}
						/>
					</div>

					{/* Table */}
					{filteredContacts.length === 0 ? (
						<div className="p-12 text-center">
							<div className="max-w-md mx-auto">
								<div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
									{contactType === "tenant" && <User className="w-8 h-8 text-gray-400" />}
									{contactType === "agent" && <User className="w-8 h-8 text-gray-400" />}
									{contactType === "owner" && <Building2 className="w-8 h-8 text-gray-400" />}
								</div>
								<p className="text-gray-600 font-medium mb-2">
									No {contactType}s found
								</p>
								<p className="text-sm text-gray-500 mb-4">
									{searchQuery
										? "Try adjusting your search"
										: `Start by adding your first ${contactType}`}
								</p>
								{!searchQuery && (
									<Button
										size="sm"
										color="primary"
										startContent={<Plus className="h-4 w-4" />}
										onPress={handleCreate}
									>
										Add {contactType}
									</Button>
								)}
							</div>
						</div>
					) : (
						<div className="overflow-x-auto">
							<Table
								aria-label={`${contactType}s table`}
								removeWrapper
								classNames={{
									base: "min-h-[200px]",
									table: "min-h-[200px]",
									thead: "[&>tr]:first:shadow-none",
									th: "bg-gray-50 text-gray-700 font-semibold text-xs uppercase tracking-wider border-b border-gray-200 px-4",
									td: "border-b border-gray-100 px-4 py-3",
								}}
							>
								<TableHeader>
									<TableColumn>CONTACT</TableColumn>
									<TableColumn>EMAIL</TableColumn>
									<TableColumn>PHONE</TableColumn>
									<TableColumn>MOBILE</TableColumn>
									<TableColumn>STATUS</TableColumn>
									<TableColumn width={50}></TableColumn>
								</TableHeader>
								<TableBody>
									{filteredContacts.map((contact) => (
										<TableRow key={contact.id}>
											<TableCell>
												<div className="flex items-center gap-3">
													<Avatar
														name={getContactInitials(contact)}
														className="bg-primary-100 text-primary-600 font-semibold"
														size="sm"
													/>
													<div>
														<p className="text-sm font-medium text-gray-900">
															{getContactName(contact)}
														</p>
														{contact.companyName && (
															<p className="text-xs text-gray-500">
																{contact.firstName} {contact.lastName}
															</p>
														)}
													</div>
												</div>
											</TableCell>
											<TableCell>
												{contact.email ? (
													<div className="flex items-center gap-2">
														<Mail className="h-4 w-4 text-gray-400" />
														<span className="text-sm text-gray-900">{contact.email}</span>
													</div>
												) : (
													<span className="text-sm text-gray-400">-</span>
												)}
											</TableCell>
											<TableCell>
												{contact.phone ? (
													<div className="flex items-center gap-2">
														<Phone className="h-4 w-4 text-gray-400" />
														<span className="text-sm text-gray-900">{contact.phone}</span>
													</div>
												) : (
													<span className="text-sm text-gray-400">-</span>
												)}
											</TableCell>
											<TableCell>
												{contact.mobile ? (
													<span className="text-sm text-gray-900">{contact.mobile}</span>
												) : (
													<span className="text-sm text-gray-400">-</span>
												)}
											</TableCell>
											<TableCell>
												<Chip
													size="sm"
													color={contact.status === "active" ? "success" : "default"}
													variant="flat"
												>
													{contact.status?.toUpperCase() || "ACTIVE"}
												</Chip>
											</TableCell>
											<TableCell>
												<Dropdown>
													<DropdownTrigger>
														<Button
															isIconOnly
															variant="light"
															size="sm"
															className="min-w-0"
														>
															<MoreVertical className="h-4 w-4" />
														</Button>
													</DropdownTrigger>
													<DropdownMenu aria-label="Contact actions">
														<DropdownItem key="edit" onPress={() => handleEdit(contact)}>
															Edit
														</DropdownItem>
														<DropdownItem
															key="delete"
															color="danger"
															onPress={() => handleDelete(contact)}
														>
															{propertyId ? "Remove from Property" : "Delete"}
														</DropdownItem>
													</DropdownMenu>
												</Dropdown>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					)}
				</CardBody>
			</Card>

			{/* Create/Edit Modal */}
			<ContactFormModal
				isOpen={isModalOpen}
				onClose={() => {
					setIsModalOpen(false);
					setEditingContactId(undefined);
				}}
				contactType={contactType}
				contactId={editingContactId}
				propertyId={propertyId}
			/>

			{/* Delete Confirmation Modal */}
			<CrudModal
				isOpen={isDeleteModalOpen}
				onClose={() => {
					setIsDeleteModalOpen(false);
					setSelectedContact(null);
				}}
				title={propertyId ? "Remove Contact" : "Delete Contact"}
				onDelete={confirmDelete}
				deleteLabel={propertyId ? "Remove" : "Delete"}
				size="md"
			>
				<p className="text-gray-600">
					Are you sure you want to {propertyId ? "remove" : "delete"}{" "}
					<strong>{selectedContact?.name || "this contact"}</strong>?
					{!propertyId && " This action cannot be undone."}
				</p>
			</CrudModal>
		</>
	);
}

