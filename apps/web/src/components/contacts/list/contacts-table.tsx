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
	Spinner,
	Table,
	TableBody,
	TableCell,
	TableColumn,
	TableHeader,
	TableRow,
} from "@heroui/react";
import {
	Download,
	Eye,
	Filter,
	Mail,
	MoreVertical,
	Pencil,
	Phone,
	Plus,
	Search,
	Trash2,
	User,
} from "lucide-react";
import type { Contact, ContactType } from "./types";
import { getContactInitials, getContactName, TAB_LABELS } from "./types";

interface ContactsTableProps {
	contacts: Contact[];
	activeTab: ContactType;
	searchQuery: string;
	currentPage: number;
	totalPages: number;
	totalCount: number;
	rowsPerPage: number;
	isLoading: boolean;
	onSearchChange: (value: string) => void;
	onPageChange: (page: number) => void;
	onView: (id: string) => void;
	onEdit: (id: string) => void;
	onDelete: (id: string) => void;
	onCreateNew: () => void;
}

export function ContactsTable({
	contacts,
	activeTab,
	searchQuery,
	currentPage,
	totalPages,
	totalCount,
	rowsPerPage,
	isLoading,
	onSearchChange,
	onPageChange,
	onView,
	onEdit,
	onDelete,
	onCreateNew,
}: ContactsTableProps) {
	return (
		<Card className="overflow-hidden border border-gray-200 shadow-sm">
			<CardBody className="p-0">
				{/* Search & Filters */}
				<div className="flex items-center justify-between border-gray-200 border-b bg-gray-50/50 px-6 py-4">
					<Input
						placeholder={`Buscar ${TAB_LABELS[activeTab].toLowerCase()}...`}
						value={searchQuery}
						onValueChange={onSearchChange}
						startContent={<Search className="h-4 w-4 text-gray-400" />}
						classNames={{
							input: "text-sm",
							inputWrapper:
								"bg-white border-gray-200 hover:border-gray-300 shadow-sm max-w-md",
						}}
					/>
					<div className="flex items-center gap-2">
						<Button
							variant="bordered"
							size="sm"
							startContent={<Filter className="h-4 w-4" />}
						>
							Filtros
						</Button>
						<Button
							variant="bordered"
							size="sm"
							startContent={<Download className="h-4 w-4" />}
						>
							Exportar
						</Button>
					</div>
				</div>

				{/* Content */}
				{isLoading ? (
					<div className="flex justify-center py-12">
						<Spinner size="lg" />
					</div>
				) : contacts.length === 0 ? (
					<EmptyState
						activeTab={activeTab}
						hasSearch={!!searchQuery}
						onCreateNew={onCreateNew}
					/>
				) : (
					<>
						<Table
							removeWrapper
							aria-label="Tabela de contatos"
							classNames={{
								th: "bg-gray-50 text-gray-600 font-semibold text-xs uppercase tracking-wider border-b border-gray-200 px-6 py-4",
								td: "border-b border-gray-100 px-6 py-4",
							}}
						>
							<TableHeader>
								<TableColumn>CONTATO</TableColumn>
								<TableColumn>EMAIL</TableColumn>
								<TableColumn>TELEFONE</TableColumn>
								<TableColumn>LOCALIZAÇÃO</TableColumn>
								<TableColumn>STATUS</TableColumn>
								<TableColumn width={60}>AÇÕES</TableColumn>
							</TableHeader>
							<TableBody>
								{contacts.map((contact) => (
									<TableRow
										key={contact.id}
										className="transition-colors hover:bg-gray-50"
									>
										<TableCell>
											<ContactCell contact={contact} />
										</TableCell>
										<TableCell>
											<EmailCell email={contact.email} />
										</TableCell>
										<TableCell>
											<PhoneCell
												phone={contact.phone}
												mobile={contact.mobile}
											/>
										</TableCell>
										<TableCell>
											<LocationCell city={contact.city} state={contact.state} />
										</TableCell>
										<TableCell>
											<Chip
												size="sm"
												color={
													contact.status === "active" ? "success" : "default"
												}
												variant="flat"
											>
												{contact.status === "active" ? "Ativo" : "Inativo"}
											</Chip>
										</TableCell>
										<TableCell>
											<ActionsMenu
												contactId={contact.id}
												onView={onView}
												onEdit={onEdit}
												onDelete={onDelete}
											/>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>

						{totalPages > 1 && (
							<div className="flex items-center justify-between border-gray-200 border-t px-6 py-4">
								<p className="text-gray-500 text-sm">
									Mostrando {(currentPage - 1) * rowsPerPage + 1} a{" "}
									{Math.min(currentPage * rowsPerPage, totalCount)} de{" "}
									{totalCount} resultados
								</p>
								<Pagination
									total={totalPages}
									page={currentPage}
									onChange={onPageChange}
									showControls
									size="sm"
									classNames={{ cursor: "bg-primary" }}
								/>
							</div>
						)}
					</>
				)}
			</CardBody>
		</Card>
	);
}

function ContactCell({ contact }: { contact: Contact }) {
	return (
		<div className="flex items-center gap-3">
			<Avatar
				name={getContactInitials(contact)}
				className="bg-primary/10 font-semibold text-primary"
				size="sm"
			/>
			<div>
				<p className="font-medium text-gray-900">{getContactName(contact)}</p>
				{contact.companyName && contact.firstName && (
					<p className="text-gray-500 text-xs">
						{contact.firstName} {contact.lastName}
					</p>
				)}
			</div>
		</div>
	);
}

function EmailCell({ email }: { email?: string | null }) {
	if (!email) return <span className="text-gray-400 text-sm">—</span>;
	return (
		<a
			href={`mailto:${email}`}
			className="flex items-center gap-2 text-gray-700 text-sm transition-colors hover:text-primary"
		>
			<Mail className="h-4 w-4 text-gray-400" />
			{email}
		</a>
	);
}

function PhoneCell({
	phone,
	mobile,
}: {
	phone?: string | null;
	mobile?: string | null;
}) {
	if (!phone && !mobile) {
		return <span className="text-gray-400 text-sm">—</span>;
	}
	return (
		<div className="space-y-1">
			{phone && (
				<a
					href={`tel:${phone}`}
					className="flex items-center gap-2 text-gray-700 text-sm transition-colors hover:text-primary"
				>
					<Phone className="h-4 w-4 text-gray-400" />
					{phone}
				</a>
			)}
			{mobile && mobile !== phone && (
				<p className="pl-6 text-gray-500 text-xs">{mobile}</p>
			)}
		</div>
	);
}

function LocationCell({
	city,
	state,
}: {
	city?: string | null;
	state?: string | null;
}) {
	if (!city && !state) {
		return <span className="text-gray-400 text-sm">—</span>;
	}
	return (
		<span className="text-gray-700 text-sm">
			{[city, state].filter(Boolean).join(", ")}
		</span>
	);
}

function ActionsMenu({
	contactId,
	onView,
	onEdit,
	onDelete,
}: {
	contactId: string;
	onView: (id: string) => void;
	onEdit: (id: string) => void;
	onDelete: (id: string) => void;
}) {
	return (
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
			<DropdownMenu aria-label="Ações do contato">
				<DropdownItem
					key="view"
					startContent={<Eye className="h-4 w-4" />}
					onPress={() => onView(contactId)}
				>
					Ver Detalhes
				</DropdownItem>
				<DropdownItem
					key="edit"
					startContent={<Pencil className="h-4 w-4" />}
					onPress={() => onEdit(contactId)}
				>
					Editar
				</DropdownItem>
				<DropdownItem
					key="delete"
					color="danger"
					className="text-danger"
					startContent={<Trash2 className="h-4 w-4" />}
					onPress={() => onDelete(contactId)}
				>
					Excluir
				</DropdownItem>
			</DropdownMenu>
		</Dropdown>
	);
}

function EmptyState({
	activeTab,
	hasSearch,
	onCreateNew,
}: {
	activeTab: ContactType;
	hasSearch: boolean;
	onCreateNew: () => void;
}) {
	const singular = TAB_LABELS[activeTab].toLowerCase().slice(0, -1);

	return (
		<div className="p-12 text-center">
			<div className="mx-auto max-w-md">
				<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
					<User className="h-8 w-8 text-gray-400" />
				</div>
				<p className="mb-2 font-medium text-gray-900">
					Nenhum {singular} encontrado
				</p>
				<p className="mb-6 text-gray-500 text-sm">
					{hasSearch
						? "Tente ajustar sua busca"
						: `Comece adicionando seu primeiro ${singular}`}
				</p>
				{!hasSearch && (
					<Button
						color="primary"
						startContent={<Plus className="h-4 w-4" />}
						onPress={onCreateNew}
					>
						Adicionar {TAB_LABELS[activeTab].slice(0, -1)}
					</Button>
				)}
			</div>
		</div>
	);
}
