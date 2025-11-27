import { Card, CardBody, CardHeader } from "@heroui/react";

type PropertyMapProps = {
	propertyName: string;
	address: string;
	coordinates: { lat: number; lng: number };
};

export function PropertyMap({
	propertyName,
	address,
	coordinates,
}: PropertyMapProps) {
	// Using Google Maps embed API - you can replace with actual map component
	const mapUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6d-s6U4ZcZ9Jp5s&q=${coordinates.lat},${coordinates.lng}&zoom=15`;

	return (
		<Card className="border border-gray-200 shadow-sm">
			<CardHeader>
				<h3 className="font-semibold text-gray-900 text-lg">Location</h3>
			</CardHeader>
			<CardBody>
				<div className="relative h-64 w-full overflow-hidden rounded-lg bg-gray-100">
					{/* Placeholder for map - replace with actual map component */}
					<div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
						<div className="text-center">
							<div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-red-500">
								<span className="font-bold text-white text-xs">📍</span>
							</div>
							<p className="font-medium text-gray-700 text-sm">
								{propertyName}
							</p>
							<p className="text-gray-600 text-xs">{address}</p>
							<p className="mt-1 text-gray-500 text-xs">
								{coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
							</p>
						</div>
					</div>
					{/* Uncomment when you have Google Maps API key */}
					{/* <iframe
						width="100%"
						height="100%"
						style={{ border: 0 }}
						src={mapUrl}
						allowFullScreen
					/> */}
				</div>
			</CardBody>
		</Card>
	);
}
