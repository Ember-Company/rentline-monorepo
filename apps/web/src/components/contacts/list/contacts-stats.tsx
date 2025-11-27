import { Card, CardBody } from "@heroui/react";
import { Building2, User, Users } from "lucide-react";
import type { Contact, ContactType } from "./types";
import { TAB_LABELS } from "./types";

interface ContactsStatsProps {
	contacts: Contact[];
	activeTab: ContactType;
	onTabChange: (tab: ContactType) => void;
}

export function ContactsStats({
	contacts,
	activeTab,
	onTabChange,
}: ContactsStatsProps) {
	const tabs: ContactType[] = ["tenant", "agent", "owner"];

	const icons = {
		tenant: User,
		agent: Users,
		owner: Building2,
	};

	const colors = {
		tenant: "bg-primary-100 text-primary",
		agent: "bg-violet-100 text-violet-600",
		owner: "bg-green-100 text-green-600",
	};

	return (
		<div className="grid grid-cols-3 gap-4">
			{tabs.map((type) => {
				const Icon = icons[type];
				const count = contacts.filter((c) => c.type === type).length;

				return (
					<Card
						key={type}
						isPressable
						isHoverable
						className={`border border-gray-200 ${activeTab === type ? "ring-2 ring-primary" : ""}`}
						onPress={() => onTabChange(type)}
					>
						<CardBody className="p-4">
							<div className="flex items-center gap-4">
								<div
									className={`flex h-12 w-12 items-center justify-center rounded-xl ${colors[type]}`}
								>
									<Icon className="h-6 w-6" />
								</div>
								<div>
									<p className="font-bold text-2xl text-gray-900">{count}</p>
									<p className="text-gray-500 text-sm">{TAB_LABELS[type]}</p>
								</div>
							</div>
						</CardBody>
					</Card>
				);
			})}
		</div>
	);
}
