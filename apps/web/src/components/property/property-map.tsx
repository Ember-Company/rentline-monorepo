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
				<h3 className="text-lg font-semibold text-gray-900">Location</h3>
			</CardHeader>
			<CardBody>
				<div className="w-full h-64 rounded-lg overflow-hidden bg-gray-100 relative">
					{/* Placeholder for map - replace with actual map component */}
					<div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
						<div className="text-center">
							<div className="w-12 h-12 bg-red-500 rounded-full mx-auto mb-2 flex items-center justify-center">
								<span className="text-white text-xs font-bold">📍</span>
							</div>
							<p className="text-sm text-gray-700 font-medium">{propertyName}</p>
							<p className="text-xs text-gray-600">{address}</p>
							<p className="text-xs text-gray-500 mt-1">
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

