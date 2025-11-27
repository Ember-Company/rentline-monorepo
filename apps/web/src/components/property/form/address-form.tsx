import {
	Card,
	CardBody,
	CardHeader,
	Input,
	Select,
	SelectItem,
} from "@heroui/react";
import { MapPin } from "lucide-react";
import { BRAZILIAN_STATES, formatCEP } from "@/lib/constants/brazil";

interface AddressFormProps {
	address: string;
	neighborhood: string;
	city: string;
	state: string;
	cep: string;
	onAddressChange: (value: string) => void;
	onNeighborhoodChange: (value: string) => void;
	onCityChange: (value: string) => void;
	onStateChange: (value: string) => void;
	onCepChange: (value: string) => void;
	isDisabled?: boolean;
}

export function AddressForm({
	address,
	neighborhood,
	city,
	state,
	cep,
	onAddressChange,
	onNeighborhoodChange,
	onCityChange,
	onStateChange,
	onCepChange,
	isDisabled,
}: AddressFormProps) {
	const handleCepChange = (value: string) => {
		onCepChange(formatCEP(value));
	};

	return (
		<Card className="border border-gray-200 shadow-sm">
			<CardHeader className="border-gray-100 border-b bg-gray-50/50 px-6 py-4">
				<div className="flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
						<MapPin className="h-5 w-5 text-green-600" />
					</div>
					<div>
						<h2 className="font-semibold text-gray-900 text-lg">Endereço</h2>
						<p className="text-gray-500 text-sm">Localização do imóvel</p>
					</div>
				</div>
			</CardHeader>
			<CardBody className="space-y-4 p-6">
				<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
					<div className="md:col-span-2">
						<Input
							label="Endereço"
							placeholder="Rua, número e complemento"
							value={address}
							onValueChange={onAddressChange}
							isRequired
							isDisabled={isDisabled}
							classNames={{
								inputWrapper: "border-gray-200 bg-white hover:border-gray-300",
							}}
						/>
					</div>
					<Input
						label="Bairro"
						placeholder="Nome do bairro"
						value={neighborhood}
						onValueChange={onNeighborhoodChange}
						isDisabled={isDisabled}
						classNames={{
							inputWrapper: "border-gray-200 bg-white hover:border-gray-300",
						}}
					/>
				</div>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
					<Input
						label="Cidade"
						placeholder="Ex: São Paulo"
						value={city}
						onValueChange={onCityChange}
						isRequired
						isDisabled={isDisabled}
						classNames={{
							inputWrapper: "border-gray-200 bg-white hover:border-gray-300",
						}}
					/>
					<Select
						label="Estado"
						placeholder="Selecione"
						selectedKeys={state ? [state] : []}
						onSelectionChange={(keys) =>
							onStateChange(Array.from(keys)[0] as string)
						}
						isRequired
						isDisabled={isDisabled}
						classNames={{
							trigger: "border-gray-200 bg-white hover:border-gray-300",
						}}
					>
						{BRAZILIAN_STATES.map((s) => (
							<SelectItem key={s.value}>{s.label}</SelectItem>
						))}
					</Select>
					<Input
						label="CEP"
						placeholder="00000-000"
						value={cep}
						onValueChange={handleCepChange}
						maxLength={9}
						isDisabled={isDisabled}
						classNames={{
							inputWrapper: "border-gray-200 bg-white hover:border-gray-300",
						}}
					/>
				</div>
			</CardBody>
		</Card>
	);
}
