import { useState, useEffect } from "react";
import { ContactsList } from "./contacts-list";

interface ContactsTabsProps {
	propertyId?: string;
	activeTab?: "tenant" | "agent" | "owner";
	onTabChange?: (tab: "tenant" | "agent" | "owner") => void;
}

export function ContactsTabs({
	propertyId,
	activeTab: controlledActiveTab,
	onTabChange: controlledOnTabChange,
}: ContactsTabsProps) {
	const [internalActiveTab, setInternalActiveTab] = useState<"tenant" | "agent" | "owner">("tenant");

	const activeTab = controlledActiveTab ?? internalActiveTab;
	const setActiveTab = controlledOnTabChange ?? setInternalActiveTab;

	return (
		<div className="space-y-6">
			{/* Tabs */}
			<div className="border-b border-gray-200">
				<div className="flex items-center gap-8">
					{(["tenant", "agent", "owner"] as const).map((tab) => (
						<button
							key={tab}
							type="button"
							onClick={() => setActiveTab(tab)}
							className={`relative px-1 py-4 text-sm font-medium transition-colors capitalize ${
								activeTab === tab
									? "text-primary"
									: "text-gray-600 hover:text-gray-900"
							}`}
						>
							{tab === "tenant" ? "Tenants" : tab === "agent" ? "Agents" : "Owners"}
							{activeTab === tab && (
								<span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
							)}
						</button>
					))}
				</div>
			</div>

			{/* Content */}
			<ContactsList contactType={activeTab} propertyId={propertyId} />
		</div>
	);
}

