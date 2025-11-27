import { Button, Card, CardBody, CardHeader, Input } from "@heroui/react";
import { Book, HelpCircle, MessageCircle, Search, Video } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import type { Route } from "./+types/route";

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "Help and Support - Rentline" },
		{ name: "description", content: "Get help and support" },
	];
}

export default function HelpPage() {
	return (
		<div className="space-y-6">
			<PageHeader
				title="Help and Support"
				subtitle="Find answers and get assistance"
			/>

			{/* Search */}
			<Card className="border border-gray-200 shadow-sm">
				<CardBody className="p-6">
					<Input
						placeholder="Search for help articles..."
						startContent={<Search className="h-4 w-4" />}
						size="lg"
						classNames={{
							input: "text-sm",
							inputWrapper: "bg-gray-50 border-gray-200",
						}}
					/>
				</CardBody>
			</Card>

			{/* Help Categories */}
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card className="cursor-pointer border border-gray-200 shadow-sm transition-shadow hover:shadow-md">
					<CardBody className="p-6 text-center">
						<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
							<Book className="h-6 w-6 text-blue-600" />
						</div>
						<h3 className="mb-2 font-semibold text-gray-900">Documentation</h3>
						<p className="text-gray-600 text-sm">Read our guides</p>
					</CardBody>
				</Card>
				<Card className="cursor-pointer border border-gray-200 shadow-sm transition-shadow hover:shadow-md">
					<CardBody className="p-6 text-center">
						<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
							<Video className="h-6 w-6 text-green-600" />
						</div>
						<h3 className="mb-2 font-semibold text-gray-900">
							Video Tutorials
						</h3>
						<p className="text-gray-600 text-sm">Watch tutorials</p>
					</CardBody>
				</Card>
				<Card className="cursor-pointer border border-gray-200 shadow-sm transition-shadow hover:shadow-md">
					<CardBody className="p-6 text-center">
						<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
							<MessageCircle className="h-6 w-6 text-purple-600" />
						</div>
						<h3 className="mb-2 font-semibold text-gray-900">Live Chat</h3>
						<p className="text-gray-600 text-sm">Chat with support</p>
					</CardBody>
				</Card>
				<Card className="cursor-pointer border border-gray-200 shadow-sm transition-shadow hover:shadow-md">
					<CardBody className="p-6 text-center">
						<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
							<HelpCircle className="h-6 w-6 text-orange-600" />
						</div>
						<h3 className="mb-2 font-semibold text-gray-900">FAQ</h3>
						<p className="text-gray-600 text-sm">Frequently asked questions</p>
					</CardBody>
				</Card>
			</div>

			{/* Contact Support */}
			<Card className="border border-gray-200 shadow-sm">
				<CardHeader>
					<h2 className="font-semibold text-xl">Contact Support</h2>
				</CardHeader>
				<CardBody className="space-y-4">
					<div>
						<p className="mb-2 text-gray-600 text-sm">Email Support</p>
						<p className="font-medium">support@rentline.com</p>
					</div>
					<div>
						<p className="mb-2 text-gray-600 text-sm">Phone Support</p>
						<p className="font-medium">+1 (555) 123-4567</p>
					</div>
					<div>
						<p className="mb-2 text-gray-600 text-sm">Business Hours</p>
						<p className="font-medium">Monday - Friday, 9 AM - 6 PM EST</p>
					</div>
					<Button
						color="primary"
						startContent={<MessageCircle className="h-4 w-4" />}
					>
						Start Live Chat
					</Button>
				</CardBody>
			</Card>
		</div>
	);
}
