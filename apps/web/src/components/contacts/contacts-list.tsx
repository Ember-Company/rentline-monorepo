import {
	Avatar,
	Button,
	Card,
	CardBody,
	Chip,
	Dropdown,
	DropdownItem,
	DropdownMenu,
	DropdownTrigger,
	Input,
	Pagination,
	Table,
	TableBody,
	TableCell,
	TableColumn,
	TableHeader,
	TableRow,
} from "@heroui/react";
import {
	Building2,
	Mail,
	MoreVertical,
	Phone,
	Plus,
	Search,
	User,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { CrudModal } from "@/components/dashboard/crud-modal";
import { type Contact, mockContacts } from "@/lib/mock-data/contacts";
import { ContactFormModal } from "./contact-form-modal";

interface ContactsListProps {
	contactType: "tenant" | "agent" | "owner";
	propertyId?: string;
}

export function ContactsList({ contactType, propertyId }: ContactsListProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [selectedContact, setSelectedContact] = useState<{
		id: string;
		name: string;
	} | null>(null);
	const [editingContactId, setEditingContactId] = useState<string | undefined>(
		undefined,
	);
	const [currentPage, setCurrentPage] = useState(1);
	const [contactsState, setContactsState] = useState<Contact[]>(mockContacts);
	const rowsPerPage = 10;

	// Filter contacts by type
	const contacts = useMemo(() => {
		return contactsState.filter((c) => c.type === contactType);
	}, [contactsState, contactType]);

	// Apply search filter
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

	// Pagination
	const totalPages = Math.ceil(filteredContacts.length / rowsPerPage);
	const paginatedContacts = useMemo(() => {
		const start = (currentPage - 1) * rowsPerPage;
		const end = start + rowsPerPage;
		return filteredContacts.slice(start, end);
	}, [filteredContacts, currentPage]);

	const handleCreate = () => {
		setEditingContactId(undefined);
		setIsModalOpen(true);
	};

	const handleEdit = (contact: Contact) => {
		setEditingContactId(contact.id);
		setIsModalOpen(true);
	};

	const handleDelete = (contact: Contact) => {
		const name =
			contact.companyName || `${contact.firstName} ${contact.lastName}`.trim();
		setSelectedContact({ id: contact.id, name });
		setIsDeleteModalOpen(true);
	};

	const confirmDelete = () => {
		if (!selectedContact) return;

		setContactsState((prev) => prev.filter((c) => c.id !== selectedContact.id));
		toast.success("Contact deleted successfully");
		setIsDeleteModalOpen(false);
		setSelectedContact(null);
	};

	const handleSaveContact = (contact: Contact) => {
		setContactsState((prev) => {
			const exists = prev.find((c) => c.id === contact.id);
			if (exists) {
				return prev.map((c) => (c.id === contact.id ? contact : c));
			}
			return [...prev, contact];
		});
	};

	const getContactName = (contact: Contact) => {
		if (contact.companyName) return contact.companyName;
		return (
			`${contact.firstName || ""} ${contact.lastName || ""}`.trim() || "Unnamed"
		);
	};

	const getContactInitials = (contact: Contact) => {
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

	const getTypeLabel = () => {
		switch (contactType) {
			case "tenant":
				return "Tenants";
			case "agent":
				return "Agents";
			case "owner":
				return "Owners";
		}
	};

	return (
		<>
			<Card className="overflow-hidden border border-gray-200 shadow-sm">
				<CardBody className="p-0">
					{/* Header */}
					<div className="flex items-center justify-between border-gray-200 border-b p-6">
						<div>
							<h3 className="font-semibold text-gray-900 text-lg">
								{getTypeLabel()}
							</h3>
							<p className="mt-1 text-gray-500 text-sm">
								{filteredContacts.length}{" "}
								{filteredContacts.length === 1 ? "contact" : "contacts"}
							</p>
						</div>
						<Button
							color="primary"
							startContent={<Plus className="h-4 w-4" />}
							onPress={handleCreate}
							className="font-medium"
						>
							Add {contactType.charAt(0).toUpperCase() + contactType.slice(1)}
						</Button>
					</div>

					{/* Search */}
					<div className="border-gray-200 border-b bg-gray-50/50 px-6 py-4">
						<Input
							placeholder={`Search ${contactType}s by name, email, or phone...`}
							value={searchQuery}
							onValueChange={setSearchQuery}
							startContent={<Search className="h-4 w-4 text-gray-400" />}
							classNames={{
								input: "text-sm",
								inputWrapper:
									"bg-white border-gray-200 hover:border-gray-300 shadow-sm",
							}}
							className="max-w-md"
						/>
					</div>

					{/* Table */}
					{filteredContacts.length === 0 ? (
						<div className="p-12 text-center">
							<div className="mx-auto max-w-md">
								<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
									{contactType === "owner" ? (
										<Building2 className="h-8 w-8 text-gray-400" />
									) : (
										<User className="h-8 w-8 text-gray-400" />
									)}
								</div>
								<p className="mb-2 font-medium text-gray-900">
									No {contactType}s found
								</p>
								<p className="mb-6 text-gray-500 text-sm">
									{searchQuery
										? "Try adjusting your search terms"
										: `Get started by adding your first ${contactType}`}
								</p>
								{!searchQuery && (
									<Button
										color="primary"
										startContent={<Plus className="h-4 w-4" />}
										onPress={handleCreate}
									>
										Add{" "}
										{contactType.charAt(0).toUpperCase() + contactType.slice(1)}
									</Button>
								)}
							</div>
						</div>
					) : (
						<>
							<div className="overflow-x-auto">
								<Table
									aria-label={`${contactType}s table`}
									removeWrapper
									classNames={{
										base: "min-h-[200px]",
										table: "min-h-[200px]",
										thead: "[&>tr]:first:shadow-none",
										th: "bg-gray-50 text-gray-600 font-semibold text-xs uppercase tracking-wider border-b border-gray-200 px-6 py-4",
										td: "border-b border-gray-100 px-6 py-4",
									}}
								>
									<TableHeader>
										<TableColumn>CONTACT</TableColumn>
										<TableColumn>EMAIL</TableColumn>
										<TableColumn>PHONE</TableColumn>
										<TableColumn>LOCATION</TableColumn>
										<TableColumn>STATUS</TableColumn>
										<TableColumn width={60}>ACTIONS</TableColumn>
									</TableHeader>
									<TableBody>
										{paginatedContacts.map((contact) => (
											<TableRow
												key={contact.id}
												className="transition-colors hover:bg-gray-50"
											>
												<TableCell>
													<div className="flex items-center gap-3">
														<Avatar
															name={getContactInitials(contact)}
															className="bg-primary/10 font-semibold text-primary"
															size="sm"
														/>
														<div>
															<p className="font-medium text-gray-900">
																{getContactName(contact)}
															</p>
															{contact.companyName && contact.firstName && (
																<p className="text-gray-500 text-xs">
																	{contact.firstName} {contact.lastName}
																</p>
															)}
														</div>
													</div>
												</TableCell>
												<TableCell>
													{contact.email ? (
														<a
															href={`mailto:${contact.email}`}
															className="flex items-center gap-2 text-gray-700 text-sm transition-colors hover:text-primary"
														>
															<Mail className="h-4 w-4 text-gray-400" />
															{contact.email}
														</a>
													) : (
														<span className="text-gray-400 text-sm">—</span>
													)}
												</TableCell>
												<TableCell>
													{contact.phone || contact.mobile ? (
														<div className="space-y-1">
															{contact.phone && (
																<a
																	href={`tel:${contact.phone}`}
																	className="flex items-center gap-2 text-gray-700 text-sm transition-colors hover:text-primary"
																>
																	<Phone className="h-4 w-4 text-gray-400" />
																	{contact.phone}
																</a>
															)}
															{contact.mobile &&
																contact.mobile !== contact.phone && (
																	<p className="pl-6 text-gray-500 text-xs">
																		{contact.mobile}
																	</p>
																)}
														</div>
													) : (
														<span className="text-gray-400 text-sm">—</span>
													)}
												</TableCell>
												<TableCell>
													{contact.city || contact.state ? (
														<span className="text-gray-700 text-sm">
															{[contact.city, contact.state]
																.filter(Boolean)
																.join(", ")}
														</span>
													) : (
														<span className="text-gray-400 text-sm">—</span>
													)}
												</TableCell>
												<TableCell>
													<Chip
														size="sm"
														color={
															contact.status === "active"
																? "success"
																: "default"
														}
														variant="flat"
														classNames={{
															content: "font-medium text-xs",
														}}
													>
														{contact.status.toUpperCase()}
													</Chip>
												</TableCell>
												<TableCell>
													<Dropdown>
														<DropdownTrigger>
															<Button
																isIconOnly
																variant="light"
																size="sm"
																className="min-w-0 text-gray-400 hover:text-gray-600"
															>
																<MoreVertical className="h-4 w-4" />
															</Button>
														</DropdownTrigger>
														<DropdownMenu aria-label="Contact actions">
															<DropdownItem
																key="view"
																onPress={() =>
																	toast.info("View contact details coming soon")
																}
															>
																View Details
															</DropdownItem>
															<DropdownItem
																key="edit"
																onPress={() => handleEdit(contact)}
															>
																Edit
															</DropdownItem>
															<DropdownItem
																key="delete"
																color="danger"
																className="text-danger"
																onPress={() => handleDelete(contact)}
															>
																Delete
															</DropdownItem>
														</DropdownMenu>
													</Dropdown>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>

							{/* Pagination */}
							{totalPages > 1 && (
								<div className="flex items-center justify-between border-gray-200 border-t px-6 py-4">
									<p className="text-gray-500 text-sm">
										Showing {(currentPage - 1) * rowsPerPage + 1} to{" "}
										{Math.min(
											currentPage * rowsPerPage,
											filteredContacts.length,
										)}{" "}
										of {filteredContacts.length} results
									</p>
									<Pagination
										total={totalPages}
										page={currentPage}
										onChange={setCurrentPage}
										showControls
										size="sm"
										classNames={{
											cursor: "bg-primary",
										}}
									/>
								</div>
							)}
						</>
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
				onSave={handleSaveContact}
			/>

			{/* Delete Confirmation Modal */}
			<CrudModal
				isOpen={isDeleteModalOpen}
				onClose={() => {
					setIsDeleteModalOpen(false);
					setSelectedContact(null);
				}}
				title="Delete Contact"
				onDelete={confirmDelete}
				deleteLabel="Delete"
				size="md"
			>
				<p className="text-gray-600">
					Are you sure you want to delete{" "}
					<strong className="text-gray-900">
						{selectedContact?.name || "this contact"}
					</strong>
					? This action cannot be undone.
				</p>
			</CrudModal>
		</>
	);
}
