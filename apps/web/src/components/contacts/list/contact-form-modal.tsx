import {
	Button,
	Input,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	Select,
	SelectItem,
	Textarea,
} from "@heroui/react";
import { Building2, Mail, MapPin, Phone, User } from "lucide-react";
import { useState } from "react";
import { BRAZILIAN_STATES } from "@/lib/constants/brazil";
import type { Contact, ContactType } from "./types";
import { TAB_LABELS } from "./types";

interface ContactFormModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (data: ContactFormData) => void;
	isLoading: boolean;
	activeTab: ContactType;
	contact?: Contact | null;
	mode: "create" | "edit";
}

export interface ContactFormData {
	firstName: string;
	lastName: string;
	companyName: string;
	email: string;
	phone: string;
	mobile: string;
	address: string;
	city: string;
	state: string;
	postalCode: string;
	notes: string;
	status: string;
}

export function ContactFormModal({
	isOpen,
	onClose,
	onSubmit,
	isLoading,
	activeTab,
	contact,
	mode,
}: ContactFormModalProps) {
	return (
		<Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
			<ModalContent>
				{(onModalClose) => (
					<ContactFormContent
						onClose={onModalClose}
						onSubmit={onSubmit}
						isLoading={isLoading}
						activeTab={activeTab}
						contact={contact}
						mode={mode}
					/>
				)}
			</ModalContent>
		</Modal>
	);
}

interface ContactFormContentProps {
	onClose: () => void;
	onSubmit: (data: ContactFormData) => void;
	isLoading: boolean;
	activeTab: ContactType;
	contact?: Contact | null;
	mode: "create" | "edit";
}

function ContactFormContent({
	onClose,
	onSubmit,
	isLoading,
	activeTab,
	contact,
	mode,
}: ContactFormContentProps) {
	const [personType, setPersonType] = useState<"person" | "company">(
		contact?.companyName ? "company" : "person",
	);
	const [formData, setFormData] = useState<ContactFormData>({
		firstName: contact?.firstName || "",
		lastName: contact?.lastName || "",
		companyName: contact?.companyName || "",
		email: contact?.email || "",
		phone: contact?.phone || "",
		mobile: contact?.mobile || "",
		address: contact?.address || "",
		city: contact?.city || "",
		state: contact?.state || "",
		postalCode: contact?.postalCode || "",
		notes: contact?.notes || "",
		status: contact?.status || "active",
	});

	const handleChange = (field: keyof ContactFormData, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleSubmit = () => {
		onSubmit(formData);
	};

	return (
		<>
			<ModalHeader className="border-gray-100 border-b">
				<div>
					<h2 className="font-semibold text-lg">
						{mode === "create" ? "Novo" : "Editar"}{" "}
						{TAB_LABELS[activeTab].slice(0, -1)}
					</h2>
					<p className="font-normal text-gray-500 text-sm">
						{mode === "create"
							? "Preencha as informações do contato"
							: "Atualize as informações do contato"}
					</p>
				</div>
			</ModalHeader>
			<ModalBody className="py-6">
				<div className="space-y-6">
					{/* Person Type */}
					<div>
						<p className="mb-2 block font-medium text-gray-700 text-sm">Tipo</p>
						<div className="flex gap-3">
							<Button
								variant={personType === "person" ? "solid" : "bordered"}
								color={personType === "person" ? "primary" : "default"}
								startContent={<User className="h-4 w-4" />}
								onPress={() => setPersonType("person")}
							>
								Pessoa Física
							</Button>
							<Button
								variant={personType === "company" ? "solid" : "bordered"}
								color={personType === "company" ? "primary" : "default"}
								startContent={<Building2 className="h-4 w-4" />}
								onPress={() => setPersonType("company")}
							>
								Pessoa Jurídica
							</Button>
						</div>
					</div>

					{/* Name Fields */}
					{personType === "person" ? (
						<div className="grid grid-cols-2 gap-4">
							<Input
								label="Nome"
								placeholder="João"
								value={formData.firstName}
								onValueChange={(v) => handleChange("firstName", v)}
								isRequired
							/>
							<Input
								label="Sobrenome"
								placeholder="Silva"
								value={formData.lastName}
								onValueChange={(v) => handleChange("lastName", v)}
							/>
						</div>
					) : (
						<Input
							label="Nome da Empresa"
							placeholder="Empresa LTDA"
							value={formData.companyName}
							onValueChange={(v) => handleChange("companyName", v)}
							isRequired
						/>
					)}

					{/* Contact Info */}
					<div className="grid grid-cols-2 gap-4">
						<Input
							label="Email"
							type="email"
							placeholder="email@exemplo.com"
							value={formData.email}
							onValueChange={(v) => handleChange("email", v)}
							startContent={<Mail className="h-4 w-4 text-gray-400" />}
						/>
						<Input
							label="Telefone"
							placeholder="(11) 99999-9999"
							value={formData.phone}
							onValueChange={(v) => handleChange("phone", v)}
							startContent={<Phone className="h-4 w-4 text-gray-400" />}
						/>
					</div>

					<Input
						label="Celular"
						placeholder="(11) 99999-9999"
						value={formData.mobile}
						onValueChange={(v) => handleChange("mobile", v)}
					/>

					{/* Address */}
					<Input
						label="Endereço"
						placeholder="Rua, número, complemento"
						value={formData.address}
						onValueChange={(v) => handleChange("address", v)}
						startContent={<MapPin className="h-4 w-4 text-gray-400" />}
					/>

					<div className="grid grid-cols-3 gap-4">
						<Input
							label="Cidade"
							placeholder="São Paulo"
							value={formData.city}
							onValueChange={(v) => handleChange("city", v)}
						/>
						<Select
							label="Estado"
							placeholder="Selecione"
							selectedKeys={formData.state ? [formData.state] : []}
							onSelectionChange={(keys) =>
								handleChange("state", Array.from(keys)[0] as string)
							}
						>
							{BRAZILIAN_STATES.map((s) => (
								<SelectItem key={s.value}>{s.label}</SelectItem>
							))}
						</Select>
						<Input
							label="CEP"
							placeholder="00000-000"
							value={formData.postalCode}
							onValueChange={(v) => handleChange("postalCode", v)}
						/>
					</div>

					{mode === "edit" && (
						<Select
							label="Status"
							selectedKeys={[formData.status]}
							onSelectionChange={(keys) =>
								handleChange("status", Array.from(keys)[0] as string)
							}
						>
							<SelectItem key="active">Ativo</SelectItem>
							<SelectItem key="inactive">Inativo</SelectItem>
						</Select>
					)}

					<Textarea
						label="Observações"
						placeholder="Observações sobre o contato..."
						value={formData.notes}
						onValueChange={(v) => handleChange("notes", v)}
						minRows={2}
					/>
				</div>
			</ModalBody>
			<ModalFooter className="border-gray-100 border-t">
				<Button variant="light" onPress={onClose}>
					Cancelar
				</Button>
				<Button color="primary" isLoading={isLoading} onPress={handleSubmit}>
					{mode === "create" ? "Criar Contato" : "Salvar Alterações"}
				</Button>
			</ModalFooter>
		</>
	);
}
