import {
	Avatar,
	Button,
	Card,
	CardBody,
	CardHeader,
	Chip,
} from "@heroui/react";
import { ArrowRight, Mail, Phone, Star } from "lucide-react";
import type { PropertyDetail } from "@/lib/mock-data/property-details";
import { formatDate } from "@/lib/utils/format";

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
				className={`h-4 w-4 ${
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
					<h3 className="font-semibold text-gray-900 text-lg">Reviews</h3>
				</CardHeader>
				<CardBody>
					<div className="mb-4 text-center">
						<div className="mb-1 font-bold text-4xl text-gray-900">
							{property.rating.overall}
						</div>
						<div className="mb-2 flex items-center justify-center gap-1">
							{renderStars(property.rating.overall)}
						</div>
						<p className="text-gray-600 text-sm">
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
						<h3 className="font-semibold text-gray-900 text-lg">Schedules</h3>
					</CardHeader>
					<CardBody>
						<div className="space-y-4">
							{property.schedules.map((schedule, index) => (
								<div
									key={index}
									className="cursor-pointer rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50"
								>
									<div className="flex items-start justify-between">
										<div className="flex-1">
											<p className="mb-1 font-semibold text-gray-900">
												{schedule.type === "site-visit"
													? "Site Visit"
													: schedule.type === "payment"
														? "Make Payment"
														: "Maintenance"}
											</p>
											<p className="text-gray-600 text-sm">
												{formatDate(schedule.date)}
											</p>
											<p className="text-gray-600 text-sm">{schedule.time}</p>
											{schedule.location && (
												<p className="mt-1 text-gray-500 text-sm">
													{schedule.location}
												</p>
											)}
											{schedule.tenant && (
												<div className="mt-2 flex items-center gap-2">
													<Avatar
														size="sm"
														name={schedule.tenant}
														className="h-6 w-6"
													/>
													<span className="text-gray-600 text-sm">
														{schedule.tenant}
													</span>
												</div>
											)}
										</div>
										<ArrowRight className="h-4 w-4 text-gray-400" />
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
					<h3 className="font-semibold text-gray-900 text-lg">Agent Details</h3>
				</CardHeader>
				<CardBody>
					<div className="mb-4 flex flex-col items-center text-center">
						<Avatar
							size="lg"
							name={property.agent.name}
							className="mb-3 h-16 w-16"
						/>
						<p className="font-semibold text-gray-900">{property.agent.name}</p>
						<p className="text-gray-600 text-sm">{property.agent.title}</p>
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
							startContent={<Mail className="h-4 w-4" />}
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
					<h3 className="font-semibold text-gray-900 text-lg">Images</h3>
				</CardHeader>
				<CardBody>
					<div className="grid grid-cols-2 gap-2">
						{property.images.length > 0 ? (
							property.images.map((image, index) => (
								<div
									key={index}
									className="aspect-square overflow-hidden rounded-lg bg-gray-100"
								>
									<img
										src={image}
										alt={`Property image ${index + 1}`}
										className="h-full w-full object-cover"
									/>
								</div>
							))
						) : (
							<div className="col-span-2 flex aspect-video items-center justify-center rounded-lg bg-gray-100">
								<p className="text-gray-500 text-sm">No images available</p>
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
			<div className="mb-1 flex items-center justify-between">
				<span className="text-gray-700 text-sm">{label}</span>
				<span className="font-semibold text-gray-900 text-sm">{value}</span>
			</div>
			<div className="h-2 w-full rounded-full bg-gray-200">
				<div
					className={`${bgColor} h-2 rounded-full transition-all`}
					style={{ width: `${percentage}%` }}
				/>
			</div>
		</div>
	);
}
