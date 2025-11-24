import type { Route } from "./+types/route";
import { ContactsTabs } from "@/components/contacts/contacts-tabs";
import { useSearchParams } from "react-router";
import { useEffect, useState } from "react";

export function meta(_args: Route.MetaArgs) {
	return [{ title: "Contacts - Rentline" }];
}

export default function ContactsPage() {
	const [searchParams] = useSearchParams();
	const typeParam = searchParams.get("type") as "tenant" | "agent" | "owner" | null;
	const [activeTab, setActiveTab] = useState<"tenant" | "agent" | "owner">(
		typeParam || "tenant",
	);

	useEffect(() => {
		if (typeParam && ["tenant", "agent", "owner"].includes(typeParam)) {
			setActiveTab(typeParam);
		}
	}, [typeParam]);

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
				<p className="text-sm text-gray-600 mt-1">
					Manage all your organization's contacts
				</p>
			</div>
			<ContactsTabs activeTab={activeTab} onTabChange={setActiveTab} />
		</div>
	);
}
