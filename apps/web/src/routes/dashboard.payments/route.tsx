import {
	Button,
	Card,
	CardBody,
	CardHeader,
	Chip,
	Input,
	Select,
	SelectItem,
	Table,
	TableBody,
	TableCell,
	TableColumn,
	TableHeader,
	TableRow,
} from "@heroui/react";
import { Download, FileText, Plus, Search } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { recentTransactions } from "@/lib/mock-data/transactions";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import type { Route } from "./+types/route";

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
							startContent={<Download className="h-4 w-4" />}
						>
							Export
						</Button>
						<Button color="primary" startContent={<Plus className="h-4 w-4" />}>
							Record Payment
						</Button>
					</>
				}
			/>

			<Card className="border border-gray-200 shadow-sm">
				<CardHeader className="flex items-center justify-between">
					<div>
						<h2 className="font-semibold text-xl">All Payments</h2>
						<p className="text-gray-600 text-sm">
							{filteredPayments.length} payments found
						</p>
					</div>
					<div className="flex gap-2">
						<Input
							placeholder="Search payments..."
							value={searchQuery}
							onValueChange={setSearchQuery}
							startContent={<Search className="h-4 w-4" />}
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
										<span className="text-gray-600 text-sm">
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
											<FileText className="h-4 w-4" />
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
