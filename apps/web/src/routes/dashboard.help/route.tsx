import type { Route } from "./+types/route";
import { Card, CardBody, CardHeader, Button, Input } from "@heroui/react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Search, HelpCircle, MessageCircle, Book, Video } from "lucide-react";

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
						startContent={<Search className="w-4 h-4" />}
						size="lg"
						classNames={{
							input: "text-sm",
							inputWrapper: "bg-gray-50 border-gray-200",
						}}
					/>
				</CardBody>
			</Card>

			{/* Help Categories */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
					<CardBody className="p-6 text-center">
						<div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mx-auto mb-4">
							<Book className="w-6 h-6 text-blue-600" />
						</div>
						<h3 className="font-semibold text-gray-900 mb-2">Documentation</h3>
						<p className="text-sm text-gray-600">Read our guides</p>
					</CardBody>
				</Card>
				<Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
					<CardBody className="p-6 text-center">
						<div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mx-auto mb-4">
							<Video className="w-6 h-6 text-green-600" />
						</div>
						<h3 className="font-semibold text-gray-900 mb-2">Video Tutorials</h3>
						<p className="text-sm text-gray-600">Watch tutorials</p>
					</CardBody>
				</Card>
				<Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
					<CardBody className="p-6 text-center">
						<div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mx-auto mb-4">
							<MessageCircle className="w-6 h-6 text-purple-600" />
						</div>
						<h3 className="font-semibold text-gray-900 mb-2">Live Chat</h3>
						<p className="text-sm text-gray-600">Chat with support</p>
					</CardBody>
				</Card>
				<Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
					<CardBody className="p-6 text-center">
						<div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center mx-auto mb-4">
							<HelpCircle className="w-6 h-6 text-orange-600" />
						</div>
						<h3 className="font-semibold text-gray-900 mb-2">FAQ</h3>
						<p className="text-sm text-gray-600">Frequently asked questions</p>
					</CardBody>
				</Card>
			</div>

			{/* Contact Support */}
			<Card className="border border-gray-200 shadow-sm">
				<CardHeader>
					<h2 className="text-xl font-semibold">Contact Support</h2>
				</CardHeader>
				<CardBody className="space-y-4">
					<div>
						<p className="text-sm text-gray-600 mb-2">Email Support</p>
						<p className="font-medium">support@rentline.com</p>
					</div>
					<div>
						<p className="text-sm text-gray-600 mb-2">Phone Support</p>
						<p className="font-medium">+1 (555) 123-4567</p>
					</div>
					<div>
						<p className="text-sm text-gray-600 mb-2">Business Hours</p>
						<p className="font-medium">Monday - Friday, 9 AM - 6 PM EST</p>
					</div>
					<Button color="primary" startContent={<MessageCircle className="w-4 h-4" />}>
						Start Live Chat
					</Button>
				</CardBody>
			</Card>
		</div>
	);
}

