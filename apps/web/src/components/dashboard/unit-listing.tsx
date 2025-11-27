import {
	Button,
	Card,
	CardBody,
	CardHeader,
	Input,
	Tab,
	Tabs,
} from "@heroui/react";
import { Home, Search } from "lucide-react";
import { useState } from "react";
import { properties } from "@/lib/mock-data/properties";
import { formatCurrency } from "@/lib/utils/format";

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
				<div className="flex w-full items-center justify-between">
					<div className="flex items-center gap-2">
						<Home className="h-5 w-5 text-gray-600" />
						<h3 className="font-semibold text-gray-900 text-lg">
							Unit Listing
						</h3>
					</div>
				</div>
				<div className="flex w-full items-center gap-4">
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
						startContent={<Search className="h-4 w-4 text-gray-400" />}
						classNames={{
							input: "text-sm",
							inputWrapper: "bg-gray-50 border-gray-200 max-w-xs",
						}}
					/>
				</div>
			</CardHeader>
			<CardBody>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
					{filteredProperties.map((property) => (
						<div
							key={property.id}
							className="overflow-hidden rounded-lg border border-gray-200 transition-shadow hover:shadow-md"
						>
							<div className="flex h-48 items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
								<Home className="h-16 w-16 text-gray-400" />
							</div>
							<div className="p-4">
								<h4 className="mb-1 font-semibold text-gray-900">
									{property.address}
								</h4>
								<p className="mb-2 text-gray-600 text-sm">{property.type}</p>
								<div className="flex items-center justify-between">
									<span className="font-bold text-gray-900 text-lg">
										{formatCurrency(property.rent)}
									</span>
									<span
										className={`rounded px-2 py-1 text-sm ${
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
