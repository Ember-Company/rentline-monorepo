import {
	Button,
	Card,
	CardBody,
	Input,
	Select,
	SelectItem,
} from "@heroui/react";
import {
	ArrowLeft,
	ArrowRight,
	Briefcase,
	Building2,
	Home,
	Mountain,
	Plus,
	Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import type { Route } from "./+types/route";

type PropertyDraft = {
	id: string;
	name: string;
	address: string;
	city: string;
	type: "apartment_building" | "house" | "office" | "land";
};

const propertyTypes = [
	{
		key: "apartment_building",
		label: "Prédio de Apartamentos",
		icon: Building2,
	},
	{ key: "house", label: "Casa", icon: Home },
	{ key: "office", label: "Sala Comercial", icon: Briefcase },
	{ key: "land", label: "Terreno", icon: Mountain },
];

export function meta(_args: Route.MetaArgs) {
	return [{ title: "Imóveis - Rentline" }];
}

export default function PropertiesStep() {
	const navigate = useNavigate();
	const [properties, setProperties] = useState<PropertyDraft[]>([]);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Load existing data
	useEffect(() => {
		const existingData = JSON.parse(
			sessionStorage.getItem("onboarding_data") || "{}",
		);
		if (existingData.properties && existingData.properties.length > 0) {
			setProperties(existingData.properties);
		}
	}, []);

	const handleAddProperty = () => {
		const newProperty: PropertyDraft = {
			id: crypto.randomUUID(),
			name: "",
			address: "",
			city: "",
			type: "apartment_building",
		};
		setProperties([...properties, newProperty]);
	};

	const handleUpdateProperty = (
		id: string,
		field: keyof PropertyDraft,
		value: string,
	) => {
		setProperties(
			properties.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
		);
	};

	const handleRemoveProperty = (id: string) => {
		setProperties(properties.filter((p) => p.id !== id));
	};

	const handleBack = () => {
		const existingData = JSON.parse(
			sessionStorage.getItem("onboarding_data") || "{}",
		);
		// If free plan, go back to plans. If paid, go back to payment.
		if (existingData.plan === "free") {
			navigate("/onboarding/plan");
		} else {
			navigate("/onboarding/payment");
		}
	};

	const handleNext = () => {
		// Validate properties if any exist
		if (properties.length > 0) {
			const invalidProperty = properties.find((p) => !p.name || !p.type);
			if (invalidProperty) {
				toast.error("Preencha o nome de todos os imóveis");
				return;
			}
		}

		setIsSubmitting(true);
		try {
			// Store in sessionStorage
			const onboardingData = JSON.parse(
				sessionStorage.getItem("onboarding_data") || "{}",
			);
			onboardingData.properties = properties;
			sessionStorage.setItem("onboarding_data", JSON.stringify(onboardingData));

			toast.success("Dados salvos!");
			navigate("/onboarding/complete");
		} catch {
			toast.error("Erro ao salvar dados");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<OnboardingLayout
			title="Seus Imóveis"
			description="Adicione os imóveis que você administra. Você pode adicionar mais imóveis depois no painel."
		>
			<div className="space-y-6 max-w-2xl mx-auto">
				{/* Properties List */}
				{properties.length > 0 && (
					<div className="space-y-4">
						{properties.map((property, index) => (
							<Card
								key={property.id}
								className="border border-gray-200 shadow-sm"
							>
								<CardBody className="p-4">
									<div className="mb-4 flex items-center justify-between">
										<span className="font-medium text-gray-500 text-sm">
											Imóvel {index + 1}
										</span>
										<Button
											isIconOnly
											variant="light"
											size="sm"
											color="danger"
											onPress={() => handleRemoveProperty(property.id)}
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									</div>
									<div className="space-y-4">
										<Input
											label="Nome do imóvel"
											placeholder="Ex: Edifício Aurora"
											value={property.name}
											onValueChange={(value) =>
												handleUpdateProperty(property.id, "name", value)
											}
											isRequired
											classNames={{
												inputWrapper: "border-gray-300 bg-white",
											}}
										/>
										<Select
											label="Tipo de imóvel"
											selectedKeys={[property.type]}
											onSelectionChange={(keys) => {
												const value = Array.from(
													keys,
												)[0] as PropertyDraft["type"];
												handleUpdateProperty(property.id, "type", value);
											}}
											classNames={{
												trigger: "border-gray-300 bg-white",
											}}
										>
											{propertyTypes.map((type) => (
												<SelectItem
													key={type.key}
													startContent={<type.icon className="h-4 w-4" />}
												>
													{type.label}
												</SelectItem>
											))}
										</Select>
										<Input
											label="Endereço"
											placeholder="Rua, número, bairro"
											value={property.address}
											onValueChange={(value) =>
												handleUpdateProperty(property.id, "address", value)
											}
											classNames={{
												inputWrapper: "border-gray-300 bg-white",
											}}
										/>
										<Input
											label="Cidade"
											placeholder="São Paulo"
											value={property.city}
											onValueChange={(value) =>
												handleUpdateProperty(property.id, "city", value)
											}
											classNames={{
												inputWrapper: "border-gray-300 bg-white",
											}}
										/>
									</div>
								</CardBody>
							</Card>
						))}
					</div>
				)}

				{/* Add Property Button */}
				<Button
					variant="bordered"
					className="w-full border-dashed border-2 h-16"
					startContent={<Plus className="h-5 w-5" />}
					onPress={handleAddProperty}
				>
					Adicionar imóvel
				</Button>

				{/* Empty State */}
				{properties.length === 0 && (
					<div className="rounded-xl border border-gray-200 bg-gray-50/50 py-8 text-center">
						<Building2 className="mx-auto mb-3 h-10 w-10 text-gray-300" />
						<p className="text-gray-500 text-sm">
							Você pode pular este passo e adicionar imóveis depois
						</p>
					</div>
				)}

				{/* Actions */}
				<div className="flex items-center justify-between gap-3 border-gray-100 border-t pt-6">
					<Button
						variant="light"
						startContent={<ArrowLeft className="h-4 w-4" />}
						onPress={handleBack}
						size="lg"
						className="font-medium text-gray-500 hover:text-gray-900"
					>
						Voltar
					</Button>
					<Button
						color="primary"
						endContent={<ArrowRight className="h-4 w-4" />}
						onPress={handleNext}
						isLoading={isSubmitting}
						size="lg"
						className="font-bold px-8 shadow-lg shadow-primary/20"
					>
						{properties.length === 0 ? "Pular" : "Continuar"}
					</Button>
				</div>
			</div>
		</OnboardingLayout>
	);
}
