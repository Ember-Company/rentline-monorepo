interface EnhancedPropertyTabsProps {
	activeTab: string;
	onTabChange: (key: string) => void;
}

export function EnhancedPropertyTabs({
	activeTab,
	onTabChange,
}: EnhancedPropertyTabsProps) {
	const tabs = [
		{ key: "overview", label: "Overview" },
		{ key: "contacts", label: "Contacts" },
		{ key: "documents", label: "Documents" },
		{ key: "mileage-reminders", label: "Mileage & Reminders" },
		{ key: "other", label: "Other" },
	];

	return (
		<div className="border-b border-gray-200">
			<div className="flex items-center gap-8">
				{tabs.map((tab) => (
					<button
						key={tab.key}
						type="button"
						onClick={() => onTabChange(tab.key)}
						className={`relative px-1 py-4 text-sm font-medium transition-colors ${
							activeTab === tab.key
								? "text-primary"
								: "text-gray-600 hover:text-gray-900"
						}`}
					>
						{tab.label}
						{activeTab === tab.key && (
							<span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
						)}
					</button>
				))}
			</div>
		</div>
	);
}
