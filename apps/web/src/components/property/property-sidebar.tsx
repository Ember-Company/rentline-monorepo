import { Card, CardBody, CardHeader, Button, Avatar, Chip } from "@heroui/react";
import { Star, ArrowRight, Mail, Phone } from "lucide-react";
import { formatDate } from "@/lib/utils/format";
import type { PropertyDetail } from "@/lib/mock-data/property-details";

type PropertySidebarProps = {
	property: PropertyDetail;
	onContactAgent?: () => void;
	onEmailAgent?: () => void;
};

export function PropertySidebar({
	property,
	onContactAgent,
	onEmailAgent,
}: PropertySidebarProps) {
	const renderStars = (rating: number) => {
		return Array.from({ length: 5 }).map((_, i) => (
			<Star
				key={i}
				className={`w-4 h-4 ${
					i < Math.floor(rating)
						? "fill-yellow-400 text-yellow-400"
						: "fill-gray-300 text-gray-300"
				}`}
			/>
		));
	};

	return (
		<div className="space-y-6">
			{/* Reviews Section */}
			<Card className="border border-gray-200 shadow-sm">
				<CardHeader>
					<h3 className="text-lg font-semibold text-gray-900">Reviews</h3>
				</CardHeader>
				<CardBody>
					<div className="text-center mb-4">
						<div className="text-4xl font-bold text-gray-900 mb-1">
							{property.rating.overall}
						</div>
						<div className="flex items-center justify-center gap-1 mb-2">
							{renderStars(property.rating.overall)}
						</div>
						<p className="text-sm text-gray-600">
							Based on {property.rating.totalReviews} reviews
						</p>
					</div>
					<div className="space-y-3">
						<RatingBar
							label="Comfortness"
							value={property.rating.breakdown.comfortness}
							color="green"
						/>
						<RatingBar
							label="Cleanliness"
							value={property.rating.breakdown.cleanliness}
							color="green"
						/>
						<RatingBar
							label="Facilities"
							value={property.rating.breakdown.facilities}
							color="green"
						/>
						<RatingBar
							label="Complains"
							value={property.rating.breakdown.complains}
							color="red"
						/>
					</div>
				</CardBody>
			</Card>

			{/* Schedules Section */}
			{property.schedules.length > 0 && (
				<Card className="border border-gray-200 shadow-sm">
					<CardHeader>
						<h3 className="text-lg font-semibold text-gray-900">Schedules</h3>
					</CardHeader>
					<CardBody>
						<div className="space-y-4">
							{property.schedules.map((schedule, index) => (
								<div
									key={index}
									className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
								>
									<div className="flex items-start justify-between">
										<div className="flex-1">
											<p className="font-semibold text-gray-900 mb-1">
												{schedule.type === "site-visit"
													? "Site Visit"
													: schedule.type === "payment"
														? "Make Payment"
														: "Maintenance"}
											</p>
											<p className="text-sm text-gray-600">
												{formatDate(schedule.date)}
											</p>
											<p className="text-sm text-gray-600">
												{schedule.time}
											</p>
											{schedule.location && (
												<p className="text-sm text-gray-500 mt-1">
													{schedule.location}
												</p>
											)}
											{schedule.tenant && (
												<div className="flex items-center gap-2 mt-2">
													<Avatar
														size="sm"
														name={schedule.tenant}
														className="w-6 h-6"
													/>
													<span className="text-sm text-gray-600">
														{schedule.tenant}
													</span>
												</div>
											)}
										</div>
										<ArrowRight className="w-4 h-4 text-gray-400" />
									</div>
								</div>
							))}
						</div>
					</CardBody>
				</Card>
			)}

			{/* Agent Details */}
			<Card className="border border-gray-200 shadow-sm">
				<CardHeader>
					<h3 className="text-lg font-semibold text-gray-900">Agent Details</h3>
				</CardHeader>
				<CardBody>
					<div className="flex flex-col items-center text-center mb-4">
						<Avatar
							size="lg"
							name={property.agent.name}
							className="w-16 h-16 mb-3"
						/>
						<p className="font-semibold text-gray-900">{property.agent.name}</p>
						<p className="text-sm text-gray-600">{property.agent.title}</p>
					</div>
					<div className="flex gap-2">
						<Button
							variant="bordered"
							className="flex-1"
							onPress={onContactAgent}
						>
							Contact
						</Button>
						<Button
							variant="bordered"
							className="flex-1"
							startContent={<Mail className="w-4 h-4" />}
							onPress={onEmailAgent}
						>
							Send Email
						</Button>
					</div>
				</CardBody>
			</Card>

			{/* Images Section */}
			<Card className="border border-gray-200 shadow-sm">
				<CardHeader>
					<h3 className="text-lg font-semibold text-gray-900">Images</h3>
				</CardHeader>
				<CardBody>
					<div className="grid grid-cols-2 gap-2">
						{property.images.length > 0 ? (
							property.images.map((image, index) => (
								<div
									key={index}
									className="aspect-square bg-gray-100 rounded-lg overflow-hidden"
								>
									<img
										src={image}
										alt={`Property image ${index + 1}`}
										className="w-full h-full object-cover"
									/>
								</div>
							))
						) : (
							<div className="col-span-2 aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
								<p className="text-sm text-gray-500">No images available</p>
							</div>
						)}
					</div>
				</CardBody>
			</Card>
		</div>
	);
}

function RatingBar({
	label,
	value,
	color,
}: {
	label: string;
	value: number;
	color: "green" | "red";
}) {
	const percentage = (value / 5) * 100;
	const bgColor = color === "green" ? "bg-green-500" : "bg-red-500";

	return (
		<div>
			<div className="flex items-center justify-between mb-1">
				<span className="text-sm text-gray-700">{label}</span>
				<span className="text-sm font-semibold text-gray-900">{value}</span>
			</div>
			<div className="w-full bg-gray-200 rounded-full h-2">
				<div
					className={`${bgColor} h-2 rounded-full transition-all`}
					style={{ width: `${percentage}%` }}
				/>
			</div>
		</div>
	);
}

