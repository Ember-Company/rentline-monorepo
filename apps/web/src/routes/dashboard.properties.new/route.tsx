import { Button, Select, SelectItem } from "@heroui/react";
import { ArrowLeft, Save } from "lucide-react";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import {
	AddressForm,
	BasicInfoForm,
	createEmptyUnit,
	DetailsForm,
	FinancialForm,
	PropertyTypeSection,
	type UnitFormData,
	UnitsForm,
} from "@/components/property/form";
import { PROPERTY_TYPES } from "@/components/property/form/property-type-card";
import { useBulkCreateUnits, useCreateProperty } from "@/lib/hooks";
import type { PropertyCategory, PropertyType } from "@/lib/types/api";
import type { Route } from "./+types/route";

export function meta(_args: Route.MetaArgs) {
	return [
		{ title: "Novo Imóvel - Rentline" },
		{ name: "description", content: "Cadastrar novo imóvel" },
	];
}

export default function NewPropertyPage() {
	const navigate = useNavigate();
	const createProperty = useCreateProperty();
	const bulkCreateUnits = useBulkCreateUnits();

	// Form state
	const [propertyType, setPropertyType] = useState<PropertyType>("house");
	const [category, setCategory] = useState<PropertyCategory>("rent");
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [address, setAddress] = useState("");
	const [neighborhood, setNeighborhood] = useState("");
	const [city, setCity] = useState("");
	const [state, setState] = useState("");
	const [cep, setCep] = useState("");
	const [totalArea, setTotalArea] = useState("");
	const [usableArea, setUsableArea] = useState("");
	const [lotSize, setLotSize] = useState("");
	const [floors, setFloors] = useState("");
	const [yearBuilt, setYearBuilt] = useState("");
	const [parkingSpaces, setParkingSpaces] = useState("");
	const [bedrooms, setBedrooms] = useState("");
	const [bathrooms, setBathrooms] = useState("");
	const [monthlyRent, setMonthlyRent] = useState("");
	const [askingPrice, setAskingPrice] = useState("");
	const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
	const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
	const [units, setUnits] = useState<UnitFormData[]>([createEmptyUnit()]);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleTypeChange = useCallback(
		(newType: PropertyType) => {
			setPropertyType(newType);
			const typeData = PROPERTY_TYPES.find((t) => t.value === newType);
			if (typeData && !typeData.categories.includes(category)) {
				setCategory(typeData.categories[0] as PropertyCategory);
			}
			if (newType !== "apartment_building") {
				setUnits([createEmptyUnit()]);
			}
		},
		[category],
	);

	const handleAddUnit = useCallback(() => {
		setUnits((prev) => [...prev, createEmptyUnit()]);
	}, []);

	const handleRemoveUnit = useCallback((id: string) => {
		setUnits((prev) =>
			prev.length > 1 ? prev.filter((u) => u.id !== id) : prev,
		);
	}, []);

	const handleUpdateUnit = useCallback(
		(id: string, field: keyof UnitFormData, value: string) => {
			setUnits((prev) =>
				prev.map((u) => (u.id === id ? { ...u, [field]: value } : u)),
			);
		},
		[],
	);

	const autoGenerateUnits = (count: number) => {
		const newUnits: UnitFormData[] = [];
		for (let i = 1; i <= count; i++) {
			newUnits.push({
				...createEmptyUnit(),
				unitNumber: String(i).padStart(2, "0"),
				name: `Apartamento ${String(i).padStart(2, "0")}`,
			});
		}
		setUnits(newUnits);
	};

	const handleSubmit = async () => {
		if (!name.trim()) return toast.error("Nome do imóvel é obrigatório");
		if (!address.trim()) return toast.error("Endereço é obrigatório");
		if (!city.trim()) return toast.error("Cidade é obrigatória");
		if (!state) return toast.error("Estado é obrigatório");

		if (propertyType === "apartment_building") {
			const validUnits = units.filter((u) => u.unitNumber.trim());
			if (validUnits.length === 0) {
				return toast.error("Adicione pelo menos uma unidade para o prédio");
			}
		}

		setIsSubmitting(true);
		try {
			const result = await createProperty.mutateAsync({
				name: name.trim(),
				type: propertyType,
				category,
				address: `${address.trim()}${neighborhood ? `, ${neighborhood}` : ""}`,
				city: city.trim(),
				state,
				postalCode: cep.replace(/\D/g, ""),
				country: "Brasil",
				description: description.trim() || undefined,
				totalArea: totalArea ? Number(totalArea) : undefined,
				usableArea: usableArea ? Number(usableArea) : undefined,
				lotSize: lotSize ? Number(lotSize) : undefined,
				floors: floors ? Number(floors) : undefined,
				yearBuilt: yearBuilt ? Number(yearBuilt) : undefined,
				parkingSpaces: parkingSpaces ? Number(parkingSpaces) : undefined,
				bedrooms:
					propertyType !== "apartment_building" && bedrooms
						? Number(bedrooms)
						: undefined,
				bathrooms:
					propertyType !== "apartment_building" && bathrooms
						? Number(bathrooms)
						: undefined,
				// For apartments: prices go on units, not property
				// For houses/offices/land: prices go on property
				monthlyRent:
					propertyType !== "apartment_building" && monthlyRent
						? Number(monthlyRent)
						: undefined,
				askingPrice:
					propertyType !== "apartment_building" && askingPrice
						? Number(askingPrice)
						: undefined,
				amenities: selectedAmenities,
				features: selectedFeatures,
				currencyId: "BRL",
			});

			if (propertyType === "apartment_building" && result.property.id) {
				const validUnits = units.filter((u) => u.unitNumber.trim());
				if (validUnits.length > 0) {
					await bulkCreateUnits.mutateAsync({
						propertyId: result.property.id,
						units: validUnits.map((u) => ({
							unitNumber: u.unitNumber,
							name: u.name || undefined,
							type: u.type,
							floor: u.floor ? Number(u.floor) : undefined,
							bedrooms: u.bedrooms ? Number(u.bedrooms) : undefined,
							bathrooms: u.bathrooms ? Number(u.bathrooms) : undefined,
							area: u.area ? Number(u.area) : undefined,
							category: u.category || "rent",
							// Financial - Rent (only if category allows rent)
							rentAmount:
								(u.category === "rent" || u.category === "both") && u.rentAmount
									? Number(u.rentAmount)
									: undefined,
							depositAmount:
								(u.category === "rent" || u.category === "both") &&
								u.depositAmount
									? Number(u.depositAmount)
									: undefined,
							// Financial - Sale (only if category allows sale)
							salePrice:
								(u.category === "sale" || u.category === "both") && u.salePrice
									? Number(u.salePrice)
									: undefined,
							currencyId: "BRL",
						})),
					});
				}
			}

			toast.success("Imóvel cadastrado com sucesso!");
			navigate(`/dashboard/properties/${result.property.id}`);
		} catch (error) {
			console.error("Error creating property:", error);
			toast.error("Erro ao cadastrar imóvel. Tente novamente.");
		} finally {
			setIsSubmitting(false);
		}
	};

	const showBuildingDetails = propertyType !== "land";
	const showUnitsSection = propertyType === "apartment_building";

	return (
		<div className="mx-auto max-w-5xl space-y-6 pb-12">
			{/* Header */}
			<div className="flex items-center gap-4">
				<Button
					variant="light"
					isIconOnly
					onPress={() => navigate("/dashboard/properties")}
				>
					<ArrowLeft className="h-5 w-5" />
				</Button>
				<div>
					<h1 className="font-bold text-2xl text-gray-900">Novo Imóvel</h1>
					<p className="text-gray-500 text-sm">
						Cadastre um novo imóvel para gerenciar
					</p>
				</div>
			</div>

			<PropertyTypeSection
				propertyType={propertyType}
				category={category}
				onTypeChange={handleTypeChange}
				onCategoryChange={setCategory}
				isDisabled={isSubmitting}
			/>

			<BasicInfoForm
				name={name}
				description={description}
				onNameChange={setName}
				onDescriptionChange={setDescription}
				isDisabled={isSubmitting}
			/>

			<AddressForm
				address={address}
				neighborhood={neighborhood}
				city={city}
				state={state}
				cep={cep}
				onAddressChange={setAddress}
				onNeighborhoodChange={setNeighborhood}
				onCityChange={setCity}
				onStateChange={setState}
				onCepChange={setCep}
				isDisabled={isSubmitting}
			/>

			{showBuildingDetails && (
				<DetailsForm
					propertyType={propertyType}
					totalArea={totalArea}
					usableArea={usableArea}
					lotSize={lotSize}
					floors={floors}
					yearBuilt={yearBuilt}
					parkingSpaces={parkingSpaces}
					bedrooms={bedrooms}
					bathrooms={bathrooms}
					selectedAmenities={selectedAmenities}
					selectedFeatures={selectedFeatures}
					onTotalAreaChange={setTotalArea}
					onUsableAreaChange={setUsableArea}
					onLotSizeChange={setLotSize}
					onFloorsChange={setFloors}
					onYearBuiltChange={setYearBuilt}
					onParkingSpacesChange={setParkingSpaces}
					onBedroomsChange={setBedrooms}
					onBathroomsChange={setBathrooms}
					onAmenitiesChange={setSelectedAmenities}
					onFeaturesChange={setSelectedFeatures}
					isDisabled={isSubmitting}
				/>
			)}

			{propertyType !== "apartment_building" && (
				<FinancialForm
					category={category}
					propertyType={propertyType}
					monthlyRent={monthlyRent}
					askingPrice={askingPrice}
					onMonthlyRentChange={setMonthlyRent}
					onAskingPriceChange={setAskingPrice}
					isDisabled={isSubmitting}
				/>
			)}

			{showUnitsSection && (
				<UnitsFormWithGenerator
					units={units}
					isDisabled={isSubmitting}
					onAddUnit={handleAddUnit}
					onRemoveUnit={handleRemoveUnit}
					onUpdateUnit={handleUpdateUnit}
					onAutoGenerate={autoGenerateUnits}
				/>
			)}

			{/* Action Buttons */}
			<div className="flex items-center justify-end gap-3 border-gray-200 border-t pt-6">
				<Button
					variant="light"
					onPress={() => navigate("/dashboard/properties")}
					isDisabled={isSubmitting}
				>
					Cancelar
				</Button>
				<Button
					color="primary"
					startContent={<Save className="h-4 w-4" />}
					onPress={handleSubmit}
					isLoading={isSubmitting}
				>
					Salvar Imóvel
				</Button>
			</div>
		</div>
	);
}

// Extended UnitsForm with auto-generate option for new properties
function UnitsFormWithGenerator({
	units,
	isDisabled,
	onAddUnit,
	onRemoveUnit,
	onUpdateUnit,
	onAutoGenerate,
}: {
	units: UnitFormData[];
	isDisabled?: boolean;
	onAddUnit: () => void;
	onRemoveUnit: (id: string, isNew: boolean) => void;
	onUpdateUnit: (id: string, field: keyof UnitFormData, value: string) => void;
	onAutoGenerate: (count: number) => void;
}) {
	return (
		<div className="space-y-4">
			{/* Auto-generate selector */}
			<div className="flex justify-end">
				<Select
					placeholder="Gerar unidades automaticamente"
					size="sm"
					className="w-60"
					onSelectionChange={(keys) => {
						const count = Number(Array.from(keys)[0]);
						if (count > 0) onAutoGenerate(count);
					}}
				>
					<SelectItem key="5">Gerar 5 unidades</SelectItem>
					<SelectItem key="10">Gerar 10 unidades</SelectItem>
					<SelectItem key="20">Gerar 20 unidades</SelectItem>
					<SelectItem key="50">Gerar 50 unidades</SelectItem>
				</Select>
			</div>
			<UnitsForm
				units={units}
				deletedUnitIds={[]}
				isDisabled={isDisabled}
				onAddUnit={onAddUnit}
				onRemoveUnit={onRemoveUnit}
				onUpdateUnit={onUpdateUnit}
			/>
		</div>
	);
}
