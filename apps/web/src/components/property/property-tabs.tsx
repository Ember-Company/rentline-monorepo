import { Tabs, Tab } from "@heroui/react";

type PropertyTabsProps = {
	activeTab: string;
	onTabChange: (key: string) => void;
};

export function PropertyTabs({
	activeTab,
	onTabChange,
}: PropertyTabsProps) {
	return (
		<Tabs
			selectedKey={activeTab}
			onSelectionChange={(key) => onTabChange(String(key))}
			className="mb-6"
		>
			<Tab key="overview" title="Overview" />
			<Tab key="units" title="Units" />
			<Tab key="payments" title="Payment details" />
			<Tab key="reports" title="Weekly reports" />
			<Tab key="tickets" title="Tickets" />
			<Tab key="tenant" title="Tenant" />
		</Tabs>
	);
}

