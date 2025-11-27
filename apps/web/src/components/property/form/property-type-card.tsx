import { Card, CardBody } from "@heroui/react";
import {
	Briefcase,
	Building2,
	Home,
	type LucideIcon,
	Mountain,
} from "lucide-react";

export interface PropertyTypeOption {
	value: string;
	label: string;
	description: string;
	icon: LucideIcon;
	categories: string[];
}

export const PROPERTY_TYPES: PropertyTypeOption[] = [
	{
		value: "apartment_building",
		label: "Edifício / Condomínio",
		description: "Prédio residencial com múltiplas unidades",
		icon: Building2,
		categories: ["rent", "sale", "both"],
	},
	{
		value: "house",
		label: "Casa",
		description: "Imóvel residencial individual",
		icon: Home,
		categories: ["rent", "sale", "both"],
	},
	{
		value: "office",
		label: "Sala Comercial",
		description: "Escritório ou sala comercial",
		icon: Briefcase,
		categories: ["rent", "sale", "both"],
	},
	{
		value: "land",
		label: "Terreno",
		description: "Lote ou área para construção",
		icon: Mountain,
		categories: ["sale"],
	},
];

interface PropertyTypeCardProps {
	option: PropertyTypeOption;
	isSelected: boolean;
	onSelect: () => void;
	disabled?: boolean;
}

export function PropertyTypeCard({
	option,
	isSelected,
	onSelect,
	disabled,
}: PropertyTypeCardProps) {
	const Icon = option.icon;

	return (
		<Card
			isPressable={!disabled}
			onPress={onSelect}
			className={`cursor-pointer border-2 transition-all ${
				isSelected
					? "border-primary bg-primary/5"
					: "border-gray-200 hover:border-gray-300"
			} ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
		>
			<CardBody className="p-4">
				<div className="flex items-start gap-3">
					<div
						className={`flex h-10 w-10 items-center justify-center rounded-lg ${
							isSelected
								? "bg-primary/10 text-primary"
								: "bg-gray-100 text-gray-600"
						}`}
					>
						<Icon className="h-5 w-5" />
					</div>
					<div className="flex-1">
						<p
							className={`font-semibold ${
								isSelected ? "text-primary" : "text-gray-900"
							}`}
						>
							{option.label}
						</p>
						<p className="text-gray-500 text-sm">{option.description}</p>
					</div>
					<div
						className={`h-5 w-5 rounded-full border-2 ${
							isSelected
								? "border-primary bg-primary"
								: "border-gray-300 bg-white"
						}`}
					>
						{isSelected && (
							<svg
								className="h-full w-full text-white"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									fillRule="evenodd"
									d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
									clipRule="evenodd"
								/>
							</svg>
						)}
					</div>
				</div>
			</CardBody>
		</Card>
	);
}
