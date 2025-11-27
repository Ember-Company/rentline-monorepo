import { Button } from "@heroui/react";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { CrudModal } from "@/components/dashboard/crud-modal";
import {
	type FormData,
	INITIAL_REQUESTS,
	MaintenanceFilters,
	MaintenanceFormModal,
	type MaintenanceRequest,
	MaintenanceStats,
	MaintenanceTable,
} from "@/components/maintenance";
import { properties } from "@/lib/mock-data/properties";
import type { Route } from "./+types/route";

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "Manutenção - Rentline" },
		{ name: "description", content: "Gerenciar solicitações de manutenção" },
	];
}

export default function MaintenancePage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [priorityFilter, setPriorityFilter] = useState("all");
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [selectedRequest, setSelectedRequest] =
		useState<MaintenanceRequest | null>(null);
	const [requests, setRequests] =
		useState<MaintenanceRequest[]>(INITIAL_REQUESTS);
	const [currentPage, setCurrentPage] = useState(1);
	const rowsPerPage = 10;

	const filteredRequests = useMemo(() => {
		return requests.filter((request) => {
			const matchesSearch =
				request.property.toLowerCase().includes(searchQuery.toLowerCase()) ||
				request.issue.toLowerCase().includes(searchQuery.toLowerCase()) ||
				request.tenantName?.toLowerCase().includes(searchQuery.toLowerCase());
			const matchesStatus =
				statusFilter === "all" || request.status === statusFilter;
			const matchesPriority =
				priorityFilter === "all" || request.priority === priorityFilter;
			return matchesSearch && matchesStatus && matchesPriority;
		});
	}, [requests, searchQuery, statusFilter, priorityFilter]);

	const totalPages = Math.ceil(filteredRequests.length / rowsPerPage);
	const paginatedRequests = useMemo(() => {
		const start = (currentPage - 1) * rowsPerPage;
		return filteredRequests.slice(start, start + rowsPerPage);
	}, [filteredRequests, currentPage]);

	const stats = useMemo(
		() => ({
			total: requests.length,
			pending: requests.filter((r) => r.status === "pending").length,
			inProgress: requests.filter((r) => r.status === "in-progress").length,
			completed: requests.filter((r) => r.status === "completed").length,
			urgent: requests.filter(
				(r) => r.priority === "urgent" && r.status !== "completed",
			).length,
		}),
		[requests],
	);

	const handleCreate = () => {
		setSelectedRequest(null);
		setIsModalOpen(true);
	};

	const handleEdit = (request: MaintenanceRequest) => {
		setSelectedRequest(request);
		setIsModalOpen(true);
	};

	const handleDelete = (request: MaintenanceRequest) => {
		setSelectedRequest(request);
		setIsDeleteModalOpen(true);
	};

	const handleFormSubmit = (data: FormData) => {
		const property = properties.find((p) => p.id === Number(data.propertyId));

		if (selectedRequest) {
			setRequests((prev) =>
				prev.map((r) =>
					r.id === selectedRequest.id
						? {
								...r,
								property: property?.address.split(",")[0] || r.property,
								propertyId: Number(data.propertyId) || r.propertyId,
								unit: data.unit || r.unit,
								issue: data.issue,
								description: data.description,
								priority: data.priority,
								status: data.status,
								assignedTo: data.assignedTo || undefined,
								estimatedCost: data.estimatedCost
									? Number(data.estimatedCost)
									: undefined,
								completedDate:
									data.status === "completed"
										? new Date().toISOString().split("T")[0]
										: undefined,
							}
						: r,
				),
			);
			toast.success("Solicitação atualizada com sucesso");
		} else {
			const newRequest: MaintenanceRequest = {
				id: Math.max(...requests.map((r) => r.id)) + 1,
				property: property?.address.split(",")[0] || "Desconhecido",
				propertyId: Number(data.propertyId),
				unit: data.unit || "Principal",
				issue: data.issue,
				description: data.description,
				priority: data.priority,
				status: data.status,
				requestedDate: new Date().toISOString().split("T")[0],
				assignedTo: data.assignedTo || undefined,
				estimatedCost: data.estimatedCost
					? Number(data.estimatedCost)
					: undefined,
			};
			setRequests((prev) => [newRequest, ...prev]);
			toast.success("Solicitação criada com sucesso");
		}
		setIsModalOpen(false);
		setSelectedRequest(null);
	};

	const confirmDelete = () => {
		if (selectedRequest) {
			setRequests((prev) => prev.filter((r) => r.id !== selectedRequest.id));
			toast.success("Solicitação excluída com sucesso");
			setIsDeleteModalOpen(false);
			setSelectedRequest(null);
		}
	};

	const handleStatusChange = (
		request: MaintenanceRequest,
		newStatus: MaintenanceRequest["status"],
	) => {
		setRequests((prev) =>
			prev.map((r) =>
				r.id === request.id
					? {
							...r,
							status: newStatus,
							completedDate:
								newStatus === "completed"
									? new Date().toISOString().split("T")[0]
									: undefined,
						}
					: r,
			),
		);
		toast.success(`Status atualizado para ${newStatus}`);
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div>
					<h1 className="font-bold text-3xl text-gray-900">Manutenção</h1>
					<p className="mt-1 text-gray-600">
						Gerencie solicitações de manutenção e ordens de serviço
					</p>
				</div>
				<Button
					color="primary"
					startContent={<Plus className="h-4 w-4" />}
					onPress={handleCreate}
					className="font-medium"
				>
					Nova Solicitação
				</Button>
			</div>

			<MaintenanceStats stats={stats} />

			<MaintenanceFilters
				searchQuery={searchQuery}
				statusFilter={statusFilter}
				priorityFilter={priorityFilter}
				onSearchChange={setSearchQuery}
				onStatusChange={setStatusFilter}
				onPriorityChange={setPriorityFilter}
			/>

			<MaintenanceTable
				requests={paginatedRequests}
				totalPages={totalPages}
				currentPage={currentPage}
				totalCount={filteredRequests.length}
				rowsPerPage={rowsPerPage}
				onPageChange={setCurrentPage}
				onEdit={handleEdit}
				onDelete={handleDelete}
				onStatusChange={handleStatusChange}
			/>

			<MaintenanceFormModal
				isOpen={isModalOpen}
				onClose={() => {
					setIsModalOpen(false);
					setSelectedRequest(null);
				}}
				onSubmit={handleFormSubmit}
				selectedRequest={selectedRequest}
			/>

			<CrudModal
				isOpen={isDeleteModalOpen}
				onClose={() => {
					setIsDeleteModalOpen(false);
					setSelectedRequest(null);
				}}
				title="Excluir Solicitação"
				onDelete={confirmDelete}
				deleteLabel="Excluir"
				size="md"
			>
				<p className="text-gray-600">
					Tem certeza que deseja excluir a solicitação{" "}
					<strong className="text-gray-900">"{selectedRequest?.issue}"</strong>?
					Esta ação não pode ser desfeita.
				</p>
			</CrudModal>
		</div>
	);
}
