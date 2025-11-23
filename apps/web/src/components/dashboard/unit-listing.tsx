import { Card, CardBody, CardHeader, Button, Input, Tabs, Tab } from "@heroui/react";
import { Home, Search } from "lucide-react";
import { properties } from "@/lib/mock-data/properties";
import { formatCurrency } from "@/lib/utils/format";
import { useState } from "react";

export function UnitListing() {
	const [selectedTab, setSelectedTab] = useState("all");
	const [searchQuery, setSearchQuery] = useState("");

	const filteredProperties = properties.filter((property) => {
		const matchesSearch = property.address
			.toLowerCase()
			.includes(searchQuery.toLowerCase());
		const matchesFilter =
			selectedTab === "all" ||
			(selectedTab === "rented" && property.status === "occupied") ||
			(selectedTab === "vacant" && property.status === "vacant");
		return matchesSearch && matchesFilter;
	});

	return (
		<Card className="border border-gray-200 shadow-sm">
			<CardHeader className="flex flex-col gap-4">
				<div className="flex items-center justify-between w-full">
					<div className="flex items-center gap-2">
						<Home className="w-5 h-5 text-gray-600" />
						<h3 className="text-lg font-semibold text-gray-900">Unit Listing</h3>
					</div>
				</div>
				<div className="flex items-center gap-4 w-full">
					<Tabs
						selectedKey={selectedTab}
						onSelectionChange={(key) => setSelectedTab(key as string)}
						classNames={{
							tabList: "gap-2",
							tab: "min-w-24",
						}}
					>
						<Tab key="all" title="All Units" />
						<Tab key="rented" title="Rented Units" />
						<Tab key="vacant" title="Vacant Units" />
					</Tabs>
					<Input
						placeholder="Search property location"
						value={searchQuery}
						onValueChange={setSearchQuery}
						startContent={<Search className="w-4 h-4 text-gray-400" />}
						classNames={{
							input: "text-sm",
							inputWrapper: "bg-gray-50 border-gray-200 max-w-xs",
						}}
					/>
				</div>
			</CardHeader>
			<CardBody>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{filteredProperties.map((property) => (
						<div
							key={property.id}
							className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
						>
							<div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
								<Home className="w-16 h-16 text-gray-400" />
							</div>
							<div className="p-4">
								<h4 className="font-semibold text-gray-900 mb-1">
									{property.address}
								</h4>
								<p className="text-sm text-gray-600 mb-2">{property.type}</p>
								<div className="flex items-center justify-between">
									<span className="text-lg font-bold text-gray-900">
										{formatCurrency(property.rent)}
									</span>
									<span
										className={`text-sm px-2 py-1 rounded ${
											property.status === "occupied"
												? "bg-green-100 text-green-700"
												: "bg-gray-100 text-gray-700"
										}`}
									>
										{property.status}
									</span>
								</div>
							</div>
						</div>
					))}
				</div>
			</CardBody>
		</Card>
	);
}

