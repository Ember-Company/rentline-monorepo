import { Card, CardBody, CardHeader, Input, Textarea } from "@heroui/react";
import { Home } from "lucide-react";

interface BasicInfoFormProps {
	name: string;
	description: string;
	onNameChange: (value: string) => void;
	onDescriptionChange: (value: string) => void;
	isDisabled?: boolean;
}

export function BasicInfoForm({
	name,
	description,
	onNameChange,
	onDescriptionChange,
	isDisabled,
}: BasicInfoFormProps) {
	return (
		<Card className="border border-gray-200 shadow-sm">
			<CardHeader className="border-gray-100 border-b bg-gray-50/50 px-6 py-4">
				<div className="flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
						<Home className="h-5 w-5 text-blue-600" />
					</div>
					<div>
						<h2 className="font-semibold text-gray-900 text-lg">
							Informações Básicas
						</h2>
						<p className="text-gray-500 text-sm">Nome e descrição do imóvel</p>
					</div>
				</div>
			</CardHeader>
			<CardBody className="space-y-4 p-6">
				<Input
					label="Nome do Imóvel"
					placeholder="Ex: Edifício Solar, Casa na Praia, etc."
					value={name}
					onValueChange={onNameChange}
					isRequired
					isDisabled={isDisabled}
					classNames={{
						inputWrapper: "border-gray-200 bg-white hover:border-gray-300",
					}}
				/>
				<Textarea
					label="Descrição"
					placeholder="Descreva as características e diferenciais do imóvel..."
					value={description}
					onValueChange={onDescriptionChange}
					minRows={3}
					isDisabled={isDisabled}
					classNames={{
						inputWrapper: "border-gray-200 bg-white hover:border-gray-300",
					}}
				/>
			</CardBody>
		</Card>
	);
}
