import type { Route } from "./+types/route";
import {
	Card,
	CardBody,
	CardHeader,
	Table,
	TableHeader,
	TableColumn,
	TableBody,
	TableRow,
	TableCell,
	Chip,
	Input,
	Button,
	Select,
	SelectItem,
} from "@heroui/react";
import { Search, Plus, Download, FileText } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { recentTransactions } from "@/lib/mock-data/transactions";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { useState } from "react";

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "Payments - Rentline" },
		{ name: "description", content: "Manage payments" },
	];
}

export default function PaymentsPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");

	const filteredPayments = recentTransactions.filter((payment) => {
		const matchesSearch =
			payment.property.toLowerCase().includes(searchQuery.toLowerCase()) ||
			payment.tenant.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesStatus =
			statusFilter === "all" || payment.status === statusFilter;
		return matchesSearch && matchesStatus;
	});

	return (
		<div className="space-y-6">
			<PageHeader
				title="Payments"
				subtitle="View and manage all payment transactions"
				actions={
					<>
						<Button
							variant="bordered"
							startContent={<Download className="w-4 h-4" />}
						>
							Export
						</Button>
						<Button color="primary" startContent={<Plus className="w-4 h-4" />}>
							Record Payment
						</Button>
					</>
				}
			/>

			<Card className="border border-gray-200 shadow-sm">
				<CardHeader className="flex justify-between items-center">
					<div>
						<h2 className="text-xl font-semibold">All Payments</h2>
						<p className="text-sm text-gray-600">
							{filteredPayments.length} payments found
						</p>
					</div>
					<div className="flex gap-2">
						<Input
							placeholder="Search payments..."
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
							className="w-40"
							labelPlacement="outside"
						>
							<SelectItem key="all">All Status</SelectItem>
							<SelectItem key="completed">Completed</SelectItem>
							<SelectItem key="pending">Pending</SelectItem>
							<SelectItem key="overdue">Overdue</SelectItem>
						</Select>
					</div>
				</CardHeader>
				<CardBody>
					<Table aria-label="Payments table" removeWrapper>
						<TableHeader>
							<TableColumn>PROPERTY</TableColumn>
							<TableColumn>TENANT</TableColumn>
							<TableColumn>AMOUNT</TableColumn>
							<TableColumn>DATE</TableColumn>
							<TableColumn>STATUS</TableColumn>
							<TableColumn>ACTIONS</TableColumn>
						</TableHeader>
						<TableBody>
							{filteredPayments.map((payment) => (
								<TableRow key={payment.id}>
									<TableCell>
										<span className="font-medium">{payment.property}</span>
									</TableCell>
									<TableCell>{payment.tenant}</TableCell>
									<TableCell>
										<span className="font-semibold">
											{formatCurrency(payment.amount)}
										</span>
									</TableCell>
									<TableCell>
										<span className="text-sm text-gray-600">
											{formatDate(payment.date)}
										</span>
									</TableCell>
									<TableCell>
										<Chip
											size="sm"
											variant="flat"
											color={
												payment.status === "completed"
													? "success"
													: payment.status === "pending"
														? "warning"
														: "danger"
											}
										>
											{payment.status.charAt(0).toUpperCase() +
												payment.status.slice(1)}
										</Chip>
									</TableCell>
									<TableCell>
										<Button size="sm" variant="light" isIconOnly>
											<FileText className="w-4 h-4" />
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
