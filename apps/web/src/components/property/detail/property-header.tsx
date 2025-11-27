import {
	Button,
	Chip,
	Dropdown,
	DropdownItem,
	DropdownMenu,
	DropdownTrigger,
} from "@heroui/react";
import { ArrowLeft, MapPin, MoreVertical, Pencil } from "lucide-react";
import { useNavigate } from "react-router";
import {
	PROPERTY_CATEGORY_LABELS,
	PROPERTY_STATUS_LABELS,
	PROPERTY_TYPE_LABELS,
} from "@/lib/constants/brazil";
import type {
	PropertyCategory,
	PropertyStatus,
	PropertyType,
} from "@/lib/types/api";
import { getPropertyIcon, getStatusColor } from "./utils";

interface PropertyHeaderProps {
	property: {
		id: string;
		name: string;
		type: string;
		category: string;
		status: string;
		address?: string | null;
		city?: string | null;
		state?: string | null;
	};
	onDelete: () => void;
}

export function PropertyHeader({ property, onDelete }: PropertyHeaderProps) {
	const navigate = useNavigate();
	const Icon = getPropertyIcon(property.type as PropertyType);

	return (
		<div className="flex items-start justify-between gap-4">
			<div className="flex items-start gap-4">
				<Button
					variant="light"
					isIconOnly
					onPress={() => navigate("/dashboard/properties")}
				>
					<ArrowLeft className="h-5 w-5" />
				</Button>
				<div className="flex items-start gap-4">
					<div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 text-primary-600">
						<Icon className="h-8 w-8" />
					</div>
					<div>
						<div className="flex items-center gap-3">
							<h1 className="font-bold text-2xl text-gray-900">
								{property.name}
							</h1>
							<Chip
								size="sm"
								variant="flat"
								color={getStatusColor(property.status as PropertyStatus)}
							>
								{PROPERTY_STATUS_LABELS[property.status as PropertyStatus]}
							</Chip>
							<Chip size="sm" variant="bordered">
								{
									PROPERTY_CATEGORY_LABELS[
										property.category as PropertyCategory
									]
								}
							</Chip>
						</div>
						<div className="mt-1 flex items-center gap-2 text-gray-500">
							<MapPin className="h-4 w-4" />
							<span className="text-sm">
								{property.address}
								{property.city && `, ${property.city}`}
								{property.state && ` - ${property.state}`}
							</span>
						</div>
						<p className="mt-1 text-gray-500 text-sm">
							{PROPERTY_TYPE_LABELS[property.type as PropertyType]}
						</p>
					</div>
				</div>
			</div>
			<div className="flex items-center gap-2">
				<Button
					variant="bordered"
					startContent={<Pencil className="h-4 w-4" />}
					onPress={() => navigate(`/dashboard/properties/${property.id}/edit`)}
				>
					Editar
				</Button>
				<Dropdown>
					<DropdownTrigger>
						<Button isIconOnly variant="light">
							<MoreVertical className="h-5 w-5" />
						</Button>
					</DropdownTrigger>
					<DropdownMenu
						aria-label="Ações"
						onAction={(key) => {
							if (key === "delete") onDelete();
						}}
					>
						<DropdownItem key="duplicate">Duplicar</DropdownItem>
						<DropdownItem key="archive">Arquivar</DropdownItem>
						<DropdownItem key="delete" className="text-danger" color="danger">
							Excluir
						</DropdownItem>
					</DropdownMenu>
				</Dropdown>
			</div>
		</div>
	);
}
