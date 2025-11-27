import { Card, CardBody, CardHeader } from "@heroui/react";
import { PageHeader } from "@/components/dashboard/page-header";
import type { Route } from "./+types/route";

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "Others - Rentline" },
		{ name: "description", content: "Additional features" },
	];
}

export default function OthersPage() {
	return (
		<div className="space-y-6">
			<PageHeader title="Others" subtitle="Additional features and tools" />

			<Card className="border border-gray-200 shadow-sm">
				<CardHeader>
					<h2 className="font-semibold text-xl">Additional Features</h2>
				</CardHeader>
				<CardBody>
					<p className="text-gray-600">
						This section contains additional features and tools. More options
						will be available here in future updates.
					</p>
				</CardBody>
			</Card>
		</div>
	);
}
