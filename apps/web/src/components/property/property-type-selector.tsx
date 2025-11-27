import { Briefcase, Building2, Home, Mountain } from "lucide-react";
import type { PropertyType } from "@/lib/types/api";

interface PropertyTypeOption {
	value: PropertyType;
	title: string;
	description: string;
	icon: React.ReactNode;
	availableCategories: Array<"rent" | "sale" | "both">;
}

const propertyTypes: PropertyTypeOption[] = [
	{
		value: "apartment_building",
		title: "Prédio de Apartamentos",
		description:
			"Edifício com múltiplas unidades residenciais para locação ou venda",
		icon: <Building2 className="h-6 w-6" />,
		availableCategories: ["rent", "sale", "both"],
	},
	{
		value: "house",
		title: "Casa",
		description: "Imóvel residencial individual, casa térrea ou sobrado",
		icon: <Home className="h-6 w-6" />,
		availableCategories: ["rent", "sale", "both"],
	},
	{
		value: "office",
		title: "Sala Comercial",
		description: "Espaço comercial ou escritório para empresas",
		icon: <Briefcase className="h-6 w-6" />,
		availableCategories: ["rent", "sale", "both"],
	},
	{
		value: "land",
		title: "Terreno",
		description: "Lote ou área de terra para construção ou investimento",
		icon: <Mountain className="h-6 w-6" />,
		availableCategories: ["sale"],
	},
];

interface PropertyTypeSelectorProps {
	value: PropertyType;
	onChange: (value: PropertyType) => void;
	disabled?: boolean;
}

export function PropertyTypeSelector({
	value,
	onChange,
	disabled,
}: PropertyTypeSelectorProps) {
	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
			{propertyTypes.map((type) => {
				const isSelected = value === type.value;
				return (
					<button
						key={type.value}
						type="button"
						disabled={disabled}
						onClick={() => onChange(type.value)}
						className={`relative flex items-start gap-4 rounded-xl border-2 p-4 text-left transition-all ${
							isSelected
								? "border-primary bg-primary/5 ring-2 ring-primary/20"
								: "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
						} ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
					>
						<div
							className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 transition-colors ${
								isSelected
									? "border-primary bg-primary"
									: "border-gray-300 bg-white"
							}`}
						>
							{isSelected && (
								<svg
									className="h-3 w-3 text-white"
									fill="currentColor"
									viewBox="0 0 12 12"
								>
									<path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
								</svg>
							)}
						</div>
						<div
							className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg ${
								isSelected
									? "bg-primary/10 text-primary"
									: "bg-gray-100 text-gray-500"
							}`}
						>
							{type.icon}
						</div>
						<div className="min-w-0 flex-1">
							<p
								className={`font-semibold text-sm ${isSelected ? "text-primary" : "text-gray-900"}`}
							>
								{type.title}
							</p>
							<p className="mt-1 text-gray-500 text-xs">{type.description}</p>
							{type.value === "land" && (
								<span className="mt-2 inline-block rounded bg-amber-100 px-2 py-0.5 font-medium text-amber-700 text-xs">
									Apenas venda
								</span>
							)}
						</div>
					</button>
				);
			})}
		</div>
	);
}

export function getPropertyTypeLabel(type: PropertyType): string {
	return propertyTypes.find((t) => t.value === type)?.title || type;
}

export function getAvailableCategories(
	type: PropertyType,
): Array<"rent" | "sale" | "both"> {
	return (
		propertyTypes.find((t) => t.value === type)?.availableCategories || [
			"rent",
			"sale",
			"both",
		]
	);
}
