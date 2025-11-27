import { Button, Chip } from "@heroui/react";
import { ArrowLeft, Download, Edit, Plus, Share2 } from "lucide-react";
import { useNavigate } from "react-router";
import type { PropertyDetail } from "@/lib/mock-data/property-details";
import { formatDate } from "@/lib/utils/format";

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
			<div className="mb-4 flex items-center justify-between">
				<Button
					variant="light"
					startContent={<ArrowLeft className="h-4 w-4" />}
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
						<Edit className="h-4 w-4" />
					</Button>
					<Button
						isIconOnly
						variant="light"
						onPress={onDownload}
						aria-label="Download"
					>
						<Download className="h-4 w-4" />
					</Button>
					<Button
						isIconOnly
						variant="light"
						onPress={onShare}
						aria-label="Share"
					>
						<Share2 className="h-4 w-4" />
					</Button>
					<Button
						color="primary"
						startContent={<Plus className="h-4 w-4" />}
						onPress={onAddProperty}
					>
						Add new property
					</Button>
				</div>
			</div>

			{/* Property title and status */}
			<div className="mb-2 flex items-start justify-between">
				<div>
					<div className="mb-2 flex items-center gap-3">
						<h1 className="font-bold text-3xl text-gray-900">
							{property.name}
						</h1>
						<Chip
							color={getStatusColor(property.status)}
							variant="flat"
							size="lg"
						>
							{getStatusLabel(property.status)}
						</Chip>
					</div>
					<p className="text-gray-600 text-lg">
						{property.address}, {property.city}, {property.state}{" "}
						{property.postalCode}
					</p>
					<p className="mt-1 text-gray-500 text-sm">
						Last Update: {formatDate(property.lastUpdate)}
					</p>
				</div>
			</div>
		</div>
	);
}
