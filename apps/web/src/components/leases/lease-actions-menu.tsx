import {
	Button,
	Dropdown,
	DropdownItem,
	DropdownMenu,
	DropdownTrigger,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
} from "@heroui/react";
import {
	Edit,
	MoreVertical,
	Trash2,
	FileText,
	DollarSign,
	X,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useDeleteLease } from "@/lib/hooks/use-leases";
import type { LeaseData } from "./types";

interface LeaseActionsMenuProps {
	lease: LeaseData;
	onEdit?: () => void;
	onRecordPayment?: () => void;
	showViewDetails?: boolean;
}

export function LeaseActionsMenu({
	lease,
	onEdit,
	onRecordPayment,
	showViewDetails = true,
}: LeaseActionsMenuProps) {
	const navigate = useNavigate();
	const deleteLease = useDeleteLease();
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

	const handleEdit = () => {
		if (onEdit) {
			onEdit();
		} else {
			navigate(`/dashboard/leases/${lease.id}/edit`);
		}
	};

	const handleViewDetails = () => {
		navigate(`/dashboard/leases/${lease.id}`);
	};

	const handleDelete = async () => {
		try {
			await deleteLease.mutateAsync({ id: lease.id });
			toast.success("Contrato excluído com sucesso!");
			setIsDeleteModalOpen(false);
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Erro ao excluir contrato",
			);
		}
	};

	return (
		<>
			<Dropdown placement="bottom-end">
				<DropdownTrigger>
					<Button isIconOnly variant="light" size="sm">
						<MoreVertical className="h-4 w-4" />
					</Button>
				</DropdownTrigger>
				<DropdownMenu aria-label="Ações do contrato">
					{showViewDetails ? (
						<DropdownItem
							key="view"
							startContent={<FileText className="h-4 w-4" />}
							onPress={handleViewDetails}
						>
							Ver Detalhes
						</DropdownItem>
					) : null}
					<DropdownItem
						key="edit"
						startContent={<Edit className="h-4 w-4" />}
						onPress={handleEdit}
					>
						Editar
					</DropdownItem>
					{onRecordPayment ? (
						<DropdownItem
							key="payment"
							startContent={<DollarSign className="h-4 w-4" />}
							onPress={onRecordPayment}
						>
							Registrar Pagamento
						</DropdownItem>
					) : null}
					<DropdownItem
						key="delete"
						className="text-danger"
						color="danger"
						startContent={<Trash2 className="h-4 w-4" />}
						onPress={() => setIsDeleteModalOpen(true)}
					>
						Excluir
					</DropdownItem>
				</DropdownMenu>
			</Dropdown>

			<Modal
				isOpen={isDeleteModalOpen}
				onClose={() => setIsDeleteModalOpen(false)}
			>
				<ModalContent>
					<ModalHeader className="flex items-center gap-2">
						<Trash2 className="h-5 w-5 text-danger" />
						Excluir Contrato
					</ModalHeader>
					<ModalBody>
						<p className="text-gray-600 dark:text-gray-400">
							Tem certeza que deseja excluir este contrato? Esta ação não pode
							ser desfeita e todos os dados relacionados serão removidos.
						</p>
					</ModalBody>
					<ModalFooter>
						<Button
							variant="light"
							onPress={() => setIsDeleteModalOpen(false)}
							startContent={<X className="h-4 w-4" />}
						>
							Cancelar
						</Button>
						<Button
							color="danger"
							onPress={handleDelete}
							isLoading={deleteLease.isPending}
							startContent={<Trash2 className="h-4 w-4" />}
						>
							Excluir
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</>
	);
}
