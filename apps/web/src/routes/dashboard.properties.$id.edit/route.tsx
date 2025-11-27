import { Button, Spinner } from "@heroui/react";
import { ArrowLeft, Save } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
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
import { formatCEP } from "@/lib/constants/brazil";
import {
	useCreateUnit,
	useDeleteUnit,
	useProperty,
	useUnits,
	useUpdateProperty,
	useUpdateUnit,
} from "@/lib/hooks";
import type { PropertyCategory, PropertyType, UnitType } from "@/lib/types/api";
import type { Route } from "./+types/route";

export function meta(_args: Route.MetaArgs) {
	return [
		{ title: "Editar Imóvel - Rentline" },
		{ name: "description", content: "Editar informações do imóvel" },
	];
}

export default function EditPropertyPage({ params }: Route.ComponentProps) {
	const navigate = useNavigate();
	const propertyId = params.id;

	// API hooks
	const { data: propertyData, isLoading: isLoadingProperty } =
		useProperty(propertyId);
	const { data: unitsData, isLoading: isLoadingUnits } = useUnits({
		propertyId,
	});
	const updateProperty = useUpdateProperty();
	const createUnit = useCreateUnit();
	const updateUnit = useUpdateUnit();
	const deleteUnit = useDeleteUnit();

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
	const [units, setUnits] = useState<UnitFormData[]>([]);
	const [deletedUnitIds, setDeletedUnitIds] = useState<string[]>([]);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isInitialized, setIsInitialized] = useState(false);

	// Initialize form with property data
	useEffect(() => {
		if (propertyData?.property && !isInitialized) {
			const property = propertyData.property;
			setPropertyType(property.type as PropertyType);
			setCategory(property.category as PropertyCategory);
			setName(property.name || "");
			setDescription(property.description || "");
			const addressParts = property.address?.split(",") || [];
			setAddress(addressParts[0]?.trim() || "");
			setNeighborhood(addressParts[1]?.trim() || "");
			setCity(property.city || "");
			setState(property.state || "");
			setCep(property.postalCode ? formatCEP(property.postalCode) : "");
			setTotalArea(property.totalArea?.toString() || "");
			setUsableArea(property.usableArea?.toString() || "");
			setLotSize(property.lotSize?.toString() || "");
			setFloors(property.floors?.toString() || "");
			setYearBuilt(property.yearBuilt?.toString() || "");
			setParkingSpaces(property.parkingSpaces?.toString() || "");
			setBedrooms(property.bedrooms?.toString() || "");
			setBathrooms(property.bathrooms?.toString() || "");
			setMonthlyRent(property.monthlyRent?.toString() || "");
			setAskingPrice(property.askingPrice?.toString() || "");
			setSelectedAmenities(property.amenities || []);
			setSelectedFeatures(property.features || []);
			setIsInitialized(true);
		}
	}, [propertyData, isInitialized]);

	// Initialize units
	useEffect(() => {
		if (
			unitsData?.units &&
			isInitialized &&
			propertyType === "apartment_building"
		) {
			const existingUnits: UnitFormData[] = unitsData.units.map((u) => ({
				id: u.id,
				isNew: false,
				unitNumber: u.unitNumber || "",
				name: u.name || "",
				type: u.type as UnitType,
				floor: u.floor?.toString() || "",
				bedrooms: u.bedrooms?.toString() || "",
				bathrooms: u.bathrooms?.toString() || "",
				area: u.area?.toString() || "",
				rentAmount: u.rentAmount?.toString() || "",
				depositAmount: u.depositAmount?.toString() || "",
			}));
			setUnits(existingUnits.length > 0 ? existingUnits : [createEmptyUnit()]);
		}
	}, [unitsData, isInitialized, propertyType]);

	const handleTypeChange = useCallback((newType: PropertyType) => {
		setPropertyType(newType);
	}, []);

	const handleAddUnit = useCallback(() => {
		setUnits((prev) => [...prev, createEmptyUnit()]);
	}, []);

	const handleRemoveUnit = useCallback((id: string, isNew: boolean) => {
		setUnits((prev) =>
			prev.length > 1 ? prev.filter((u) => u.id !== id) : prev,
		);
		if (!isNew) {
			setDeletedUnitIds((prev) => [...prev, id]);
		}
	}, []);

	const handleUpdateUnit = useCallback(
		(id: string, field: keyof UnitFormData, value: string) => {
			setUnits((prev) =>
				prev.map((u) => (u.id === id ? { ...u, [field]: value } : u)),
			);
		},
		[],
	);

	const handleSubmit = async () => {
		if (!name.trim()) return toast.error("Nome do imóvel é obrigatório");
		if (!address.trim()) return toast.error("Endereço é obrigatório");
		if (!city.trim()) return toast.error("Cidade é obrigatória");
		if (!state) return toast.error("Estado é obrigatório");

		setIsSubmitting(true);
		try {
			await updateProperty.mutateAsync({
				id: propertyId,
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
				bedrooms: bedrooms ? Number(bedrooms) : undefined,
				bathrooms: bathrooms ? Number(bathrooms) : undefined,
				monthlyRent: monthlyRent ? Number(monthlyRent) : undefined,
				askingPrice: askingPrice ? Number(askingPrice) : undefined,
				amenities: selectedAmenities,
				features: selectedFeatures,
				currencyId: "BRL",
			});

			if (propertyType === "apartment_building") {
				for (const unitId of deletedUnitIds) {
					await deleteUnit.mutateAsync({ id: unitId }).catch(console.error);
				}
				for (const unit of units) {
					if (!unit.unitNumber.trim()) continue;
					const unitData = {
						unitNumber: unit.unitNumber,
						name: unit.name || undefined,
						type: unit.type,
						floor: unit.floor ? Number(unit.floor) : undefined,
						bedrooms: unit.bedrooms ? Number(unit.bedrooms) : undefined,
						bathrooms: unit.bathrooms ? Number(unit.bathrooms) : undefined,
						area: unit.area ? Number(unit.area) : undefined,
						rentAmount: unit.rentAmount ? Number(unit.rentAmount) : undefined,
						depositAmount: unit.depositAmount
							? Number(unit.depositAmount)
							: undefined,
						currencyId: "BRL",
					};
					if (unit.isNew) {
						await createUnit.mutateAsync({ propertyId, ...unitData });
					} else {
						await updateUnit.mutateAsync({ id: unit.id, ...unitData });
					}
				}
			}

			toast.success("Imóvel atualizado com sucesso!");
			navigate(`/dashboard/properties/${propertyId}`);
		} catch (error) {
			console.error("Error updating property:", error);
			toast.error("Erro ao atualizar imóvel. Tente novamente.");
		} finally {
			setIsSubmitting(false);
		}
	};

	if (isLoadingProperty) {
		return (
			<div className="flex h-96 items-center justify-center">
				<Spinner size="lg" />
			</div>
		);
	}

	if (!propertyData?.property) {
		return (
			<div className="flex h-96 flex-col items-center justify-center gap-4">
				<p className="text-gray-500">Imóvel não encontrado</p>
				<Button onPress={() => navigate("/dashboard/properties")}>
					Voltar para lista
				</Button>
			</div>
		);
	}

	const showBuildingDetails = propertyType !== "land";
	const showUnitsSection = propertyType === "apartment_building";

	return (
		<div className="mx-auto max-w-5xl space-y-6 pb-12">
			{/* Header */}
			<div className="flex items-center gap-4">
				<Button
					variant="light"
					isIconOnly
					onPress={() => navigate(`/dashboard/properties/${propertyId}`)}
				>
					<ArrowLeft className="h-5 w-5" />
				</Button>
				<div>
					<h1 className="font-bold text-2xl text-gray-900">Editar Imóvel</h1>
					<p className="text-gray-500 text-sm">
						Atualize as informações do imóvel
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

			<FinancialForm
				category={category}
				monthlyRent={monthlyRent}
				askingPrice={askingPrice}
				onMonthlyRentChange={setMonthlyRent}
				onAskingPriceChange={setAskingPrice}
				isDisabled={isSubmitting}
			/>

			{showUnitsSection && (
				<UnitsForm
					units={units}
					deletedUnitIds={deletedUnitIds}
					isLoading={isLoadingUnits}
					isDisabled={isSubmitting}
					onAddUnit={handleAddUnit}
					onRemoveUnit={handleRemoveUnit}
					onUpdateUnit={handleUpdateUnit}
				/>
			)}

			{/* Action Buttons */}
			<div className="flex items-center justify-end gap-3 border-gray-200 border-t pt-6">
				<Button
					variant="light"
					onPress={() => navigate(`/dashboard/properties/${propertyId}`)}
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
					Salvar Alterações
				</Button>
			</div>
		</div>
	);
}
