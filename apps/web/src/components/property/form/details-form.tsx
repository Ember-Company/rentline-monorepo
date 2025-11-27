import { Card, CardBody, CardHeader, Chip, Input } from "@heroui/react";
import { Ruler } from "lucide-react";
import { PROPERTY_AMENITIES, PROPERTY_FEATURES } from "@/lib/constants/brazil";
import type { PropertyType } from "@/lib/types/api";

interface DetailsFormProps {
	propertyType: PropertyType;
	totalArea: string;
	usableArea: string;
	lotSize: string;
	floors: string;
	yearBuilt: string;
	parkingSpaces: string;
	bedrooms: string;
	bathrooms: string;
	selectedAmenities: string[];
	selectedFeatures: string[];
	onTotalAreaChange: (value: string) => void;
	onUsableAreaChange: (value: string) => void;
	onLotSizeChange: (value: string) => void;
	onFloorsChange: (value: string) => void;
	onYearBuiltChange: (value: string) => void;
	onParkingSpacesChange: (value: string) => void;
	onBedroomsChange: (value: string) => void;
	onBathroomsChange: (value: string) => void;
	onAmenitiesChange: (amenities: string[]) => void;
	onFeaturesChange: (features: string[]) => void;
	isDisabled?: boolean;
}

export function DetailsForm({
	propertyType,
	totalArea,
	usableArea,
	lotSize,
	floors,
	yearBuilt,
	parkingSpaces,
	bedrooms,
	bathrooms,
	selectedAmenities,
	selectedFeatures,
	onTotalAreaChange,
	onUsableAreaChange,
	onLotSizeChange,
	onFloorsChange,
	onYearBuiltChange,
	onParkingSpacesChange,
	onBedroomsChange,
	onBathroomsChange,
	onAmenitiesChange,
	onFeaturesChange,
	isDisabled,
}: DetailsFormProps) {
	const showRooms =
		propertyType === "house" || propertyType === "apartment_building";

	const toggleAmenity = (value: string) => {
		if (selectedAmenities.includes(value)) {
			onAmenitiesChange(selectedAmenities.filter((a) => a !== value));
		} else {
			onAmenitiesChange([...selectedAmenities, value]);
		}
	};

	const toggleFeature = (value: string) => {
		if (selectedFeatures.includes(value)) {
			onFeaturesChange(selectedFeatures.filter((f) => f !== value));
		} else {
			onFeaturesChange([...selectedFeatures, value]);
		}
	};

	return (
		<Card className="border border-gray-200 shadow-sm">
			<CardHeader className="border-gray-100 border-b bg-gray-50/50 px-6 py-4">
				<div className="flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
						<Ruler className="h-5 w-5 text-purple-600" />
					</div>
					<div>
						<h2 className="font-semibold text-gray-900 text-lg">
							Características do Imóvel
						</h2>
						<p className="text-gray-500 text-sm">
							Detalhes e medidas do imóvel
						</p>
					</div>
				</div>
			</CardHeader>
			<CardBody className="space-y-4 p-6">
				<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
					<Input
						type="number"
						label="Área Total (m²)"
						placeholder="0"
						value={totalArea}
						onValueChange={onTotalAreaChange}
						isDisabled={isDisabled}
						endContent={<span className="text-gray-400 text-sm">m²</span>}
						classNames={{
							inputWrapper: "border-gray-200 bg-white hover:border-gray-300",
						}}
					/>
					<Input
						type="number"
						label="Área Útil (m²)"
						placeholder="0"
						value={usableArea}
						onValueChange={onUsableAreaChange}
						isDisabled={isDisabled}
						endContent={<span className="text-gray-400 text-sm">m²</span>}
						classNames={{
							inputWrapper: "border-gray-200 bg-white hover:border-gray-300",
						}}
					/>
					{propertyType === "land" && (
						<Input
							type="number"
							label="Área do Lote (m²)"
							placeholder="0"
							value={lotSize}
							onValueChange={onLotSizeChange}
							isDisabled={isDisabled}
							endContent={<span className="text-gray-400 text-sm">m²</span>}
							classNames={{
								inputWrapper: "border-gray-200 bg-white hover:border-gray-300",
							}}
						/>
					)}
					<Input
						type="number"
						label="Ano de Construção"
						placeholder="2020"
						value={yearBuilt}
						onValueChange={onYearBuiltChange}
						isDisabled={isDisabled}
						classNames={{
							inputWrapper: "border-gray-200 bg-white hover:border-gray-300",
						}}
					/>
					{propertyType === "apartment_building" && (
						<Input
							type="number"
							label="Andares"
							placeholder="0"
							value={floors}
							onValueChange={onFloorsChange}
							isDisabled={isDisabled}
							classNames={{
								inputWrapper: "border-gray-200 bg-white hover:border-gray-300",
							}}
						/>
					)}
				</div>

				{showRooms && (
					<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
						<Input
							type="number"
							label="Quartos"
							placeholder="0"
							value={bedrooms}
							onValueChange={onBedroomsChange}
							isDisabled={isDisabled}
							classNames={{
								inputWrapper: "border-gray-200 bg-white hover:border-gray-300",
							}}
						/>
						<Input
							type="number"
							label="Banheiros"
							placeholder="0"
							value={bathrooms}
							onValueChange={onBathroomsChange}
							isDisabled={isDisabled}
							classNames={{
								inputWrapper: "border-gray-200 bg-white hover:border-gray-300",
							}}
						/>
						<Input
							type="number"
							label="Vagas de Garagem"
							placeholder="0"
							value={parkingSpaces}
							onValueChange={onParkingSpacesChange}
							isDisabled={isDisabled}
							classNames={{
								inputWrapper: "border-gray-200 bg-white hover:border-gray-300",
							}}
						/>
					</div>
				)}

				{/* Amenities */}
				<div>
					<label className="mb-3 block font-medium text-gray-700 text-sm">
						Comodidades
					</label>
					<div className="flex flex-wrap gap-2">
						{PROPERTY_AMENITIES.map((amenity) => (
							<Chip
								key={amenity.value}
								variant={
									selectedAmenities.includes(amenity.value)
										? "solid"
										: "bordered"
								}
								color={
									selectedAmenities.includes(amenity.value)
										? "primary"
										: "default"
								}
								className="cursor-pointer"
								onClick={() => toggleAmenity(amenity.value)}
							>
								{amenity.label}
							</Chip>
						))}
					</div>
				</div>

				{/* Features */}
				<div>
					<label className="mb-3 block font-medium text-gray-700 text-sm">
						Características
					</label>
					<div className="flex flex-wrap gap-2">
						{PROPERTY_FEATURES.map((feature) => (
							<Chip
								key={feature.value}
								variant={
									selectedFeatures.includes(feature.value)
										? "solid"
										: "bordered"
								}
								color={
									selectedFeatures.includes(feature.value)
										? "secondary"
										: "default"
								}
								className="cursor-pointer"
								onClick={() => toggleFeature(feature.value)}
							>
								{feature.label}
							</Chip>
						))}
					</div>
				</div>
			</CardBody>
		</Card>
	);
}
