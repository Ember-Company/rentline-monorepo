import type { Route } from "./+types/route";
import { Card, CardBody, CardHeader, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Input, Button, Select, SelectItem } from "@heroui/react";
import { Search, Plus, Wrench, AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { useState } from "react";
import { formatDate } from "@/lib/utils/format";

type MaintenanceRequest = {
	id: number;
	property: string;
	unit: string;
	issue: string;
	priority: "low" | "medium" | "high" | "urgent";
	status: "pending" | "in-progress" | "completed" | "cancelled";
	requestedDate: string;
	assignedTo?: string;
};

const maintenanceRequests: MaintenanceRequest[] = [
	{
		id: 1,
		property: "123 Main St",
		unit: "Apt 2B",
		issue: "Leaky faucet in kitchen",
		priority: "medium",
		status: "pending",
		requestedDate: "2024-01-15",
	},
	{
		id: 2,
		property: "456 Oak Ave",
		unit: "Unit 5",
		issue: "HVAC not working",
		priority: "urgent",
		status: "in-progress",
		requestedDate: "2024-01-14",
		assignedTo: "John Smith",
	},
	{
		id: 3,
		property: "789 Pine Rd",
		unit: "Main",
		issue: "Broken window",
		priority: "high",
		status: "completed",
		requestedDate: "2024-01-10",
		assignedTo: "Mike Davis",
	},
	{
		id: 4,
		property: "321 Elm St",
		unit: "Apt 3A",
		issue: "Plumbing issue",
		priority: "urgent",
		status: "in-progress",
		requestedDate: "2024-01-16",
		assignedTo: "Sarah Johnson",
	},
];

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "Maintenance - Rentline" },
		{ name: "description", content: "Manage maintenance requests" },
	];
}

export default function MaintenancePage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [priorityFilter, setPriorityFilter] = useState<string>("all");

	const filteredRequests = maintenanceRequests.filter((request) => {
		const matchesSearch =
			request.property.toLowerCase().includes(searchQuery.toLowerCase()) ||
			request.issue.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesStatus = statusFilter === "all" || request.status === statusFilter;
		const matchesPriority = priorityFilter === "all" || request.priority === priorityFilter;
		return matchesSearch && matchesStatus && matchesPriority;
	});

	const getPriorityColor = (priority: string) => {
		switch (priority) {
			case "urgent":
				return "danger";
			case "high":
				return "warning";
			case "medium":
				return "default";
			case "low":
				return "success";
			default:
				return "default";
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "completed":
				return "success";
			case "in-progress":
				return "primary";
			case "pending":
				return "warning";
			case "cancelled":
				return "danger";
			default:
				return "default";
		}
	};

	return (
		<div className="space-y-6">
			<PageHeader
				title="Maintenance"
				subtitle="Manage maintenance requests and work orders"
				actions={
					<Button color="primary" startContent={<Plus className="w-4 h-4" />}>
						New Request
					</Button>
				}
			/>

			<Card className="border border-gray-200 shadow-sm">
				<CardHeader className="flex justify-between items-center">
					<div>
						<h2 className="text-xl font-semibold">Maintenance Requests</h2>
						<p className="text-sm text-gray-600">
							{filteredRequests.length} requests found
						</p>
					</div>
					<div className="flex gap-2">
						<Input
							placeholder="Search requests..."
							value={searchQuery}
							onValueChange={setSearchQuery}
							startContent={<Search className="w-4 h-4" />}
							classNames={{
								input: "text-sm",
								inputWrapper: "bg-gray-50 border-gray-200 max-w-xs",
							}}
						/>
						<Select
							selectedKeys={[statusFilter]}
							onSelectionChange={(keys) =>
								setStatusFilter(Array.from(keys)[0] as string)
							}
							className="w-32"
							labelPlacement="outside"
						>
							<SelectItem key="all">All Status</SelectItem>
							<SelectItem key="pending">Pending</SelectItem>
							<SelectItem key="in-progress">In Progress</SelectItem>
							<SelectItem key="completed">Completed</SelectItem>
						</Select>
						<Select
							selectedKeys={[priorityFilter]}
							onSelectionChange={(keys) =>
								setPriorityFilter(Array.from(keys)[0] as string)
							}
							className="w-32"
							labelPlacement="outside"
						>
							<SelectItem key="all">All Priority</SelectItem>
							<SelectItem key="urgent">Urgent</SelectItem>
							<SelectItem key="high">High</SelectItem>
							<SelectItem key="medium">Medium</SelectItem>
							<SelectItem key="low">Low</SelectItem>
						</Select>
					</div>
				</CardHeader>
				<CardBody>
					<Table aria-label="Maintenance requests table" removeWrapper>
						<TableHeader>
							<TableColumn>PROPERTY</TableColumn>
							<TableColumn>UNIT</TableColumn>
							<TableColumn>ISSUE</TableColumn>
							<TableColumn>PRIORITY</TableColumn>
							<TableColumn>STATUS</TableColumn>
							<TableColumn>REQUESTED DATE</TableColumn>
							<TableColumn>ASSIGNED TO</TableColumn>
							<TableColumn>ACTIONS</TableColumn>
						</TableHeader>
						<TableBody>
							{filteredRequests.map((request) => (
								<TableRow key={request.id}>
									<TableCell>
										<span className="font-medium">{request.property}</span>
									</TableCell>
									<TableCell>{request.unit}</TableCell>
									<TableCell>{request.issue}</TableCell>
									<TableCell>
										<Chip
											size="sm"
											variant="flat"
											color={getPriorityColor(request.priority)}
										>
											{request.priority.charAt(0).toUpperCase() +
												request.priority.slice(1)}
										</Chip>
									</TableCell>
									<TableCell>
										<Chip
											size="sm"
											variant="flat"
											color={getStatusColor(request.status)}
										>
											{request.status.charAt(0).toUpperCase() +
												request.status.slice(1)}
										</Chip>
									</TableCell>
									<TableCell>
										<span className="text-sm text-gray-600">
											{formatDate(request.requestedDate)}
										</span>
									</TableCell>
									<TableCell>
										{request.assignedTo || (
											<span className="text-gray-400">Unassigned</span>
										)}
									</TableCell>
									<TableCell>
										<Button size="sm" variant="light" isIconOnly>
											<Wrench className="w-4 h-4" />
										</Button>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardBody>
			</Card>
		</div>
	);
}

