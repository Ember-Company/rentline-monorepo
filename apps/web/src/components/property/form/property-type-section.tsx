import { Card, CardBody, CardHeader } from "@heroui/react";
import { Building2 } from "lucide-react";
import { PROPERTY_CATEGORY_LABELS } from "@/lib/constants/brazil";
import type { PropertyCategory, PropertyType } from "@/lib/types/api";
import { PROPERTY_TYPES, PropertyTypeCard } from "./property-type-card";

interface PropertyTypeSectionProps {
	propertyType: PropertyType;
	category: PropertyCategory;
	onTypeChange: (type: PropertyType) => void;
	onCategoryChange: (category: PropertyCategory) => void;
	isDisabled?: boolean;
}

export function PropertyTypeSection({
	propertyType,
	category,
	onTypeChange,
	onCategoryChange,
	isDisabled,
}: PropertyTypeSectionProps) {
	const selectedTypeData = PROPERTY_TYPES.find((t) => t.value === propertyType);
	const availableCategories = selectedTypeData?.categories || [
		"rent",
		"sale",
		"both",
	];

	return (
		<Card className="border border-gray-200 shadow-sm">
			<CardHeader className="border-gray-100 border-b bg-gray-50/50 px-6 py-4">
				<div className="flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
						<Building2 className="h-5 w-5 text-primary" />
					</div>
					<div>
						<h2 className="font-semibold text-gray-900 text-lg">
							Tipo de Imóvel
						</h2>
						<p className="text-gray-500 text-sm">Selecione o tipo de imóvel</p>
					</div>
				</div>
			</CardHeader>
			<CardBody className="p-6">
				{/* Property Type Selection */}
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					{PROPERTY_TYPES.map((option) => (
						<PropertyTypeCard
							key={option.value}
							option={option}
							isSelected={propertyType === option.value}
							onSelect={() => {
								onTypeChange(option.value as PropertyType);
								// Reset category if not available for new type
								if (!option.categories.includes(category)) {
									onCategoryChange(option.categories[0] as PropertyCategory);
								}
							}}
							disabled={isDisabled}
						/>
					))}
				</div>

				{/* Category Selection */}
				<div className="mt-6">
					<label className="mb-2 block font-medium text-gray-700 text-sm">
						Finalidade
					</label>
					<div className="flex flex-wrap gap-3">
						{(["rent", "sale", "both"] as const).map((cat) => (
							<button
								key={cat}
								type="button"
								disabled={isDisabled || !availableCategories.includes(cat)}
								onClick={() => onCategoryChange(cat)}
								className={`rounded-lg border-2 px-4 py-2 font-medium text-sm transition-all ${
									category === cat
										? "border-primary bg-primary/10 text-primary"
										: "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
								} ${
									!availableCategories.includes(cat)
										? "cursor-not-allowed opacity-50"
										: ""
								}`}
							>
								{PROPERTY_CATEGORY_LABELS[cat]}
							</button>
						))}
					</div>
				</div>
			</CardBody>
		</Card>
	);
}
