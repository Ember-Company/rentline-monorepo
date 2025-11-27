import {
	Button,
	Dropdown,
	DropdownItem,
	DropdownMenu,
	DropdownTrigger,
} from "@heroui/react";
import { ChevronDown, Home, MoreVertical, Pencil } from "lucide-react";
import { Link, useNavigate } from "react-router";
import type { PropertyDetail } from "@/lib/mock-data/property-types";
import { formatDate } from "@/lib/utils/format";

interface EnhancedPropertyHeaderProps {
	property: PropertyDetail;
	activeLeaseId?: string;
	onLeaseChange?: (leaseId: string) => void;
	onAddClick?: () => void;
	onDeleteClick?: () => void;
}

export function EnhancedPropertyHeader({
	property,
	activeLeaseId,
	onLeaseChange,
	onAddClick,
	onDeleteClick,
}: EnhancedPropertyHeaderProps) {
	const navigate = useNavigate();
	const activeLease =
		property.leases.find((l) => l.id === activeLeaseId) || property.leases[0];

	const handleAction = (key: string) => {
		switch (key) {
			case "edit":
				navigate(`/dashboard/properties/${property.id}/edit`);
				break;
			case "delete":
				onDeleteClick?.();
				break;
		}
	};

	return (
		<div className="space-y-4 pb-4">
			{/* Breadcrumbs */}
			<div className="flex items-center gap-2 text-gray-600 text-sm">
				<Link
					to="/dashboard/properties"
					className="transition-colors hover:text-primary"
				>
					Imóveis
				</Link>
				<span>/</span>
				<span className="font-medium text-gray-900">{property.name}</span>
			</div>

			{/* Property Name and Address */}
			<div className="flex items-start justify-between gap-4">
				<div className="flex min-w-0 flex-1 items-start gap-3">
					<div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary-100 to-primary-200">
						<Home className="h-6 w-6 text-primary-600" />
					</div>
					<div className="min-w-0 flex-1">
						<div className="mb-1 flex items-center gap-2">
							<h1 className="truncate font-bold text-2xl text-gray-900">
								{property.name}
							</h1>
							<Button
								isIconOnly
								variant="light"
								size="sm"
								className="min-w-0 flex-shrink-0"
								onPress={() =>
									navigate(`/dashboard/properties/${property.id}/edit`)
								}
							>
								<Pencil className="h-4 w-4" />
							</Button>
							<Dropdown>
								<DropdownTrigger>
									<Button
										isIconOnly
										variant="light"
										size="sm"
										className="min-w-0 flex-shrink-0"
									>
										<MoreVertical className="h-4 w-4" />
									</Button>
								</DropdownTrigger>
								<DropdownMenu
									aria-label="Property actions"
									onAction={(key) => handleAction(key as string)}
								>
									<DropdownItem key="edit">Editar Imóvel</DropdownItem>
									<DropdownItem key="duplicate">Duplicar</DropdownItem>
									<DropdownItem key="delete" color="danger">
										Excluir
									</DropdownItem>
								</DropdownMenu>
							</Dropdown>
						</div>
						<p className="truncate text-gray-600 text-sm">
							{property.address}, {property.city}, {property.state},{" "}
							{property.postalCode}
						</p>
					</div>
				</div>

				{/* Lease Info and Add Button */}
				<div className="flex flex-shrink-0 items-center gap-3">
					{activeLease && (
						<Dropdown>
							<DropdownTrigger>
								<Button
									variant="bordered"
									endContent={<ChevronDown className="h-4 w-4" />}
									className="h-auto border-gray-300 py-2 text-left"
								>
									<div className="flex flex-col items-start">
										<span className="font-medium text-gray-700 text-xs">
											Lease
										</span>
										<span className="font-normal text-gray-600 text-xs">
											{formatDate(activeLease.startDate)} -{" "}
											{formatDate(activeLease.endDate)}
										</span>
									</div>
								</Button>
							</DropdownTrigger>
							<DropdownMenu
								aria-label="Lease selection"
								selectedKeys={activeLeaseId ? [activeLeaseId] : []}
								selectionMode="single"
								onSelectionChange={(keys) => {
									const selected = Array.from(keys)[0] as string;
									onLeaseChange?.(selected);
								}}
							>
								{property.leases.map((lease) => (
									<DropdownItem key={lease.id}>
										{formatDate(lease.startDate)} - {formatDate(lease.endDate)}
									</DropdownItem>
								))}
							</DropdownMenu>
						</Dropdown>
					)}
					<Button
						color="primary"
						onPress={onAddClick}
						className="bg-primary text-white hover:bg-primary-600"
					>
						+ Adicionar
					</Button>
				</div>
			</div>
		</div>
	);
}
