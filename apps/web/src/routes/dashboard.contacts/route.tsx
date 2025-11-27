import { Button } from "@heroui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { toast } from "sonner";
import {
	type Contact,
	type ContactFormData,
	ContactFormModal,
	ContactsStats,
	ContactsTable,
	type ContactType,
	ContactViewModal,
	TAB_LABELS,
} from "@/components/contacts/list";
import { CrudModal } from "@/components/dashboard/crud-modal";
import { trpc } from "@/utils/trpc";
import type { Route } from "./+types/route";

export function meta(_args: Route.MetaArgs) {
	return [
		{ title: "Contatos - Rentline" },
		{
			name: "description",
			content: "Gerencie todos os contatos da sua organização",
		},
	];
}

export default function ContactsPage() {
	const queryClient = useQueryClient();
	const [searchParams, setSearchParams] = useSearchParams();
	const typeParam = searchParams.get("type") as ContactType | null;

	// UI State
	const [activeTab, setActiveTab] = useState<ContactType>(
		typeParam || "tenant",
	);
	const [searchQuery, setSearchQuery] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [isViewModalOpen, setIsViewModalOpen] = useState(false);
	const [selectedContactId, setSelectedContactId] = useState<string | null>(
		null,
	);

	const rowsPerPage = 10;

	// Fetch contacts
	const { data: contactsData, isLoading } = useQuery({
		...trpc.contacts.list.queryOptions({ type: activeTab }),
	});

	// Fetch single contact for view/edit
	const { data: selectedContactData, isLoading: isLoadingContact } = useQuery({
		...trpc.contacts.getById.queryOptions({ id: selectedContactId || "" }),
		enabled: !!selectedContactId,
	});

	// Mutations
	const createMutation = useMutation({
		...trpc.contacts.create.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["contacts"] });
			toast.success("Contato criado com sucesso");
			setIsCreateModalOpen(false);
		},
		onError: () => toast.error("Erro ao criar contato"),
	});

	const updateMutation = useMutation({
		...trpc.contacts.update.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["contacts"] });
			toast.success("Contato atualizado com sucesso");
			setIsEditModalOpen(false);
			setSelectedContactId(null);
		},
		onError: () => toast.error("Erro ao atualizar contato"),
	});

	const deleteMutation = useMutation({
		...trpc.contacts.delete.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["contacts"] });
			toast.success("Contato excluído com sucesso");
			setIsDeleteModalOpen(false);
			setSelectedContactId(null);
		},
		onError: () => toast.error("Erro ao excluir contato"),
	});

	const contacts: Contact[] = contactsData?.contacts || [];

	// Filter contacts by search
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
		return filteredContacts.slice(start, start + rowsPerPage);
	}, [filteredContacts, currentPage]);

	const handleTabChange = (tab: ContactType) => {
		setActiveTab(tab);
		setCurrentPage(1);
		setSearchParams({ type: tab });
	};

	const handleView = (id: string) => {
		setSelectedContactId(id);
		setIsViewModalOpen(true);
	};

	const handleEdit = (id: string) => {
		setSelectedContactId(id);
		setIsEditModalOpen(true);
	};

	const handleDelete = (id: string) => {
		setSelectedContactId(id);
		setIsDeleteModalOpen(true);
	};

	const handleCreate = (data: ContactFormData) => {
		createMutation.mutate({
			type: activeTab,
			...data,
			status: "active",
		});
	};

	const handleUpdate = (data: ContactFormData) => {
		if (!selectedContactId) return;
		updateMutation.mutate({
			id: selectedContactId,
			type: activeTab,
			...data,
		});
	};

	const confirmDelete = () => {
		if (selectedContactId) {
			deleteMutation.mutate({ id: selectedContactId });
		}
	};

	const selectedContact = selectedContactData?.contact as Contact | undefined;

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-bold text-2xl text-gray-900">Contatos</h1>
					<p className="mt-1 text-gray-600 text-sm">
						Gerencie inquilinos, corretores e proprietários
					</p>
				</div>
				<Button
					color="primary"
					startContent={<Plus className="h-4 w-4" />}
					onPress={() => setIsCreateModalOpen(true)}
				>
					Novo Contato
				</Button>
			</div>

			<ContactsStats
				contacts={contacts}
				activeTab={activeTab}
				onTabChange={handleTabChange}
			/>

			{/* Tabs */}
			<div className="flex gap-1 border-gray-200 border-b">
				{(["tenant", "agent", "owner"] as const).map((tab) => (
					<button
						key={tab}
						type="button"
						onClick={() => handleTabChange(tab)}
						className={`px-4 py-2 font-medium text-sm transition-colors ${
							activeTab === tab
								? "border-primary border-b-2 text-primary"
								: "text-gray-600 hover:text-gray-900"
						}`}
					>
						{TAB_LABELS[tab]}
					</button>
				))}
			</div>

			<ContactsTable
				contacts={paginatedContacts}
				activeTab={activeTab}
				searchQuery={searchQuery}
				currentPage={currentPage}
				totalPages={totalPages}
				totalCount={filteredContacts.length}
				rowsPerPage={rowsPerPage}
				isLoading={isLoading}
				onSearchChange={setSearchQuery}
				onPageChange={setCurrentPage}
				onView={handleView}
				onEdit={handleEdit}
				onDelete={handleDelete}
				onCreateNew={() => setIsCreateModalOpen(true)}
			/>

			{/* Modals */}
			<ContactFormModal
				isOpen={isCreateModalOpen}
				onClose={() => setIsCreateModalOpen(false)}
				onSubmit={handleCreate}
				isLoading={createMutation.isPending}
				activeTab={activeTab}
				mode="create"
			/>

			<ContactFormModal
				isOpen={isEditModalOpen}
				onClose={() => {
					setIsEditModalOpen(false);
					setSelectedContactId(null);
				}}
				onSubmit={handleUpdate}
				isLoading={updateMutation.isPending}
				activeTab={activeTab}
				contact={selectedContact}
				mode="edit"
			/>

			<ContactViewModal
				isOpen={isViewModalOpen}
				onClose={() => {
					setIsViewModalOpen(false);
					setSelectedContactId(null);
				}}
				contact={selectedContact}
				isLoading={isLoadingContact}
				onEdit={handleEdit}
			/>

			<CrudModal
				isOpen={isDeleteModalOpen}
				onClose={() => {
					setIsDeleteModalOpen(false);
					setSelectedContactId(null);
				}}
				title="Excluir Contato"
				onDelete={confirmDelete}
				deleteLabel="Excluir"
				size="md"
				isLoading={deleteMutation.isPending}
			>
				<p className="text-gray-600">
					Tem certeza que deseja excluir este contato? Esta ação não pode ser
					desfeita.
				</p>
			</CrudModal>
		</div>
	);
}
