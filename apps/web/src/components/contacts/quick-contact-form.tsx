import { Button, Input, Select, SelectItem } from "@heroui/react";
import { useState } from "react";

interface QuickContactFormProps {
	onSubmit: (data: {
		firstName: string;
		lastName: string;
		email: string;
		phone: string;
		type: string;
	}) => void;
	onCancel: () => void;
	isLoading?: boolean;
}

const contactTypes = [
	{ value: "tenant", label: "Inquilino" },
	{ value: "owner", label: "Proprietário" },
	{ value: "agent", label: "Agente" },
	{ value: "vendor", label: "Fornecedor" },
	{ value: "contractor", label: "Empreiteiro" },
	{ value: "other", label: "Outro" },
];

export function QuickContactForm({
	onSubmit,
	onCancel,
	isLoading,
}: QuickContactFormProps) {
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [email, setEmail] = useState("");
	const [phone, setPhone] = useState("");
	const [type, setType] = useState("tenant");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSubmit({ firstName, lastName, email, phone, type });
	};

	const isValid = firstName.trim() && lastName.trim() && type;

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div className="grid grid-cols-2 gap-4">
				<Input
					label="Nome"
					value={firstName}
					onValueChange={setFirstName}
					isRequired
					autoFocus
					placeholder="João"
				/>
				<Input
					label="Sobrenome"
					value={lastName}
					onValueChange={setLastName}
					isRequired
					placeholder="Silva"
				/>
			</div>

			<Select
				label="Tipo"
				selectedKeys={[type]}
				onSelectionChange={(keys) => setType(Array.from(keys)[0] as string)}
				isRequired
			>
				{contactTypes.map((t) => (
					<SelectItem key={t.value}>{t.label}</SelectItem>
				))}
			</Select>

			<Input
				label="Email"
				type="email"
				value={email}
				onValueChange={setEmail}
				placeholder="joao@example.com"
			/>

			<Input
				label="Telefone"
				type="tel"
				value={phone}
				onValueChange={setPhone}
				placeholder="(11) 98765-4321"
			/>

			<div className="flex justify-end gap-2 pt-2">
				<Button
					variant="light"
					onPress={onCancel}
					isDisabled={isLoading}
				>
					Cancelar
				</Button>
				<Button
					color="primary"
					type="submit"
					isLoading={isLoading}
					isDisabled={!isValid}
				>
					Criar Contato
				</Button>
			</div>
		</form>
	);
}
