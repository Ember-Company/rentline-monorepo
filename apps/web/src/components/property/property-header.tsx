import { Button } from "@heroui/react";
import { ArrowLeft, Edit, Download, Share2, Plus } from "lucide-react";
import { useNavigate } from "react-router";
import { formatDate } from "@/lib/utils/format";
import { Chip } from "@heroui/react";
import type { PropertyDetail } from "@/lib/mock-data/property-details";

type PropertyHeaderProps = {
	property: PropertyDetail;
	onEdit?: () => void;
	onDownload?: () => void;
	onShare?: () => void;
	onAddProperty?: () => void;
};

export function PropertyHeader({
	property,
	onEdit,
	onDownload,
	onShare,
	onAddProperty,
}: PropertyHeaderProps) {
	const navigate = useNavigate();

	const getStatusColor = (status: PropertyDetail["status"]) => {
		switch (status) {
			case "on-rent":
			case "occupied":
				return "success";
			case "vacant":
				return "default";
			case "maintenance":
				return "warning";
			default:
				return "default";
		}
	};

	const getStatusLabel = (status: PropertyDetail["status"]) => {
		switch (status) {
			case "on-rent":
				return "On rent";
			case "occupied":
				return "Occupied";
			case "vacant":
				return "Vacant";
			case "maintenance":
				return "Maintenance";
			default:
				return status;
		}
	};

	return (
		<div className="mb-6">
			{/* Back button and actions */}
			<div className="flex items-center justify-between mb-4">
				<Button
					variant="light"
					startContent={<ArrowLeft className="w-4 h-4" />}
					onPress={() => navigate("/dashboard/properties")}
				>
					Back to properties
				</Button>
				<div className="flex items-center gap-2">
					<Button
						isIconOnly
						variant="light"
						onPress={onEdit}
						aria-label="Edit property"
					>
						<Edit className="w-4 h-4" />
					</Button>
					<Button
						isIconOnly
						variant="light"
						onPress={onDownload}
						aria-label="Download"
					>
						<Download className="w-4 h-4" />
					</Button>
					<Button
						isIconOnly
						variant="light"
						onPress={onShare}
						aria-label="Share"
					>
						<Share2 className="w-4 h-4" />
					</Button>
					<Button
						color="primary"
						startContent={<Plus className="w-4 h-4" />}
						onPress={onAddProperty}
					>
						Add new property
					</Button>
				</div>
			</div>

			{/* Property title and status */}
			<div className="flex items-start justify-between mb-2">
				<div>
					<div className="flex items-center gap-3 mb-2">
						<h1 className="text-3xl font-bold text-gray-900">{property.name}</h1>
						<Chip
							color={getStatusColor(property.status)}
							variant="flat"
							size="lg"
						>
							{getStatusLabel(property.status)}
						</Chip>
					</div>
					<p className="text-gray-600 text-lg">
						{property.address}, {property.city}, {property.state} {property.postalCode}
					</p>
					<p className="text-gray-500 text-sm mt-1">
						Last Update: {formatDate(property.lastUpdate)}
					</p>
				</div>
			</div>
		</div>
	);
}

