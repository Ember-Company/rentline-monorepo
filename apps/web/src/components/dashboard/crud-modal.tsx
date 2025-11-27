import {
	Button,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
} from "@heroui/react";
import type { ReactNode } from "react";

type CrudModalProps = {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	children: ReactNode;
	onSave?: () => void;
	onDelete?: () => void;
	saveLabel?: string;
	deleteLabel?: string;
	isLoading?: boolean;
	size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
};

export function CrudModal({
	isOpen,
	onClose,
	title,
	children,
	onSave,
	onDelete,
	saveLabel = "Save",
	deleteLabel = "Delete",
	isLoading = false,
	size = "2xl",
}: CrudModalProps) {
	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			size={size}
			scrollBehavior="inside"
		>
			<ModalContent>
				<ModalHeader className="flex flex-col gap-1">{title}</ModalHeader>
				<ModalBody>{children}</ModalBody>
				<ModalFooter>
					<Button variant="light" onPress={onClose}>
						Cancel
					</Button>
					{onDelete && (
						<Button color="danger" variant="flat" onPress={onDelete}>
							{deleteLabel}
						</Button>
					)}
					{onSave && (
						<Button color="primary" onPress={onSave} isLoading={isLoading}>
							{saveLabel}
						</Button>
					)}
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}
