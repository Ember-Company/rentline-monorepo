import {
	Button,
	Card,
	CardBody,
	Chip,
	Dropdown,
	DropdownItem,
	DropdownMenu,
	DropdownTrigger,
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
import { MoreVertical, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { PropertyDetail } from "@/lib/mock-data/property-types";
import { formatCurrency, formatDate } from "@/lib/utils/format";

interface Payment {
	id: string;
	date: string;
	category: string;
	period: string;
	tenant?: string;
	notes?: string;
	status: "paid" | "pending" | "overdue";
	amount: number;
}

interface PaymentsTableEnhancedProps {
	property: PropertyDetail;
	payments: Payment[];
	expenses: Array<{
		id: string;
		date: string;
		category: string;
		description: string;
		amount: number;
		status: "paid" | "pending";
	}>;
	onAddPayment?: () => void;
	onAddExpense?: () => void;
}

export function PaymentsTableEnhanced({
	property,
	payments,
	expenses,
	onAddPayment,
	onAddExpense,
}: PaymentsTableEnhancedProps) {
	const [activeTab, setActiveTab] = useState<"payments" | "expenses">(
		"payments",
	);
	const [paymentSubTab, setPaymentSubTab] = useState<"payments" | "periods">(
		"payments",
	);
	const [searchQuery, setSearchQuery] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [rowsPerPage, setRowsPerPage] = useState(10);

	const filteredPayments = useMemo(() => {
		if (!searchQuery) return payments;
		const query = searchQuery.toLowerCase();
		return payments.filter(
			(p) =>
				p.category.toLowerCase().includes(query) ||
				p.tenant?.toLowerCase().includes(query) ||
				p.notes?.toLowerCase().includes(query),
		);
	}, [payments, searchQuery]);

	const paginatedPayments = useMemo(() => {
		const start = (currentPage - 1) * rowsPerPage;
		const end = start + rowsPerPage;
		return filteredPayments.slice(start, end);
	}, [filteredPayments, currentPage, rowsPerPage]);

	const totalPages = Math.ceil(filteredPayments.length / rowsPerPage);

	const getStatusColor = (status: string) => {
		switch (status) {
			case "paid":
				return "success";
			case "pending":
				return "warning";
			case "overdue":
				return "danger";
			default:
				return "default";
		}
	};

	const getCategoryIcon = (category: string) => {
		return (
			<div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-green-500">
				<span className="text-white text-xs">🏠</span>
			</div>
		);
	};

	return (
		<Card className="border border-gray-200 shadow-sm">
			<CardBody className="p-0">
				{/* Tabs */}
				<div className="flex items-center justify-between border-gray-200 border-b px-6 pt-6 pb-0">
					<div className="flex gap-1">
						<button
							type="button"
							onClick={() => setActiveTab("payments")}
							className={`relative px-4 py-3 font-medium text-sm transition-colors ${
								activeTab === "payments"
									? "border-primary border-b-2 text-primary"
									: "text-gray-600 hover:text-gray-900"
							}`}
						>
							Payments
						</button>
						<button
							type="button"
							onClick={() => setActiveTab("expenses")}
							className={`relative px-4 py-3 font-medium text-sm transition-colors ${
								activeTab === "expenses"
									? "border-primary border-b-2 text-primary"
									: "text-gray-600 hover:text-gray-900"
							}`}
						>
							Expenses
						</button>
					</div>

					{activeTab === "payments" && (
						<div className="flex items-center gap-3">
							<div className="flex gap-1 rounded-lg bg-gray-100 p-1">
								<button
									type="button"
									onClick={() => setPaymentSubTab("payments")}
									className={`rounded px-3 py-1.5 font-medium text-xs transition-colors ${
										paymentSubTab === "payments"
											? "bg-white text-primary shadow-sm"
											: "text-gray-600 hover:text-gray-900"
									}`}
								>
									Payments
								</button>
								<button
									type="button"
									onClick={() => setPaymentSubTab("periods")}
									className={`rounded px-3 py-1.5 font-medium text-xs transition-colors ${
										paymentSubTab === "periods"
											? "bg-white text-primary shadow-sm"
											: "text-gray-600 hover:text-gray-900"
									}`}
								>
									Payment periods
								</button>
							</div>
							<Button
								size="sm"
								variant="bordered"
								startContent={<Plus className="h-4 w-4" />}
								onPress={onAddPayment}
								className="border-gray-300 hover:border-primary hover:text-primary"
							>
								New
							</Button>
						</div>
					)}

					{activeTab === "expenses" && (
						<Button
							size="sm"
							variant="bordered"
							startContent={<Plus className="h-4 w-4" />}
							onPress={onAddExpense}
							className="border-gray-300 hover:border-primary hover:text-primary"
						>
							New
						</Button>
					)}
				</div>

				{/* Search Bar */}
				<div className="border-gray-200 border-b bg-gray-50 px-6 py-4">
					<Input
						placeholder="Search"
						value={searchQuery}
						onValueChange={setSearchQuery}
						startContent={<Search className="h-4 w-4 text-gray-400" />}
						classNames={{
							input: "text-sm",
							inputWrapper:
								"bg-white border-gray-200 hover:border-gray-300 max-w-xs",
						}}
					/>
				</div>

				{/* Table */}
				{activeTab === "payments" && (
					<div className="overflow-x-auto">
						<Table
							aria-label="Payments table"
							removeWrapper
							classNames={{
								base: "min-h-[200px]",
								table: "min-h-[200px]",
								thead: "[&>tr]:first:shadow-none",
								th: "bg-gray-50 text-gray-700 font-semibold text-xs uppercase tracking-wider border-b border-gray-200 px-4",
								td: "border-b border-gray-100 px-4 py-3",
								wrapper: "min-h-[200px]",
							}}
						>
							<TableHeader>
								<TableColumn>DATE</TableColumn>
								<TableColumn>CATEGORY</TableColumn>
								<TableColumn>PERIOD</TableColumn>
								<TableColumn>TENANT</TableColumn>
								<TableColumn>NOTES</TableColumn>
								<TableColumn>STATUS</TableColumn>
								<TableColumn>AMOUNT</TableColumn>
								<TableColumn width={50} />
							</TableHeader>
							<TableBody emptyContent="No payments found">
								{paginatedPayments.map((payment) => (
									<TableRow key={payment.id}>
										<TableCell>
											<span className="text-gray-900 text-sm">
												{formatDate(payment.date)}
											</span>
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-3">
												{getCategoryIcon(payment.category)}
												<span className="font-medium text-gray-900 text-sm">
													{payment.category}
												</span>
											</div>
										</TableCell>
										<TableCell>
											<span className="text-gray-900 text-sm">
												{payment.period}
											</span>
										</TableCell>
										<TableCell>
											<span className="text-gray-900 text-sm">
												{payment.tenant || "-"}
											</span>
										</TableCell>
										<TableCell>
											<span className="text-gray-500 text-sm">
												{payment.notes || "-"}
											</span>
										</TableCell>
										<TableCell>
											<Chip
												size="sm"
												color={getStatusColor(payment.status)}
												variant="flat"
												className="font-semibold"
											>
												{payment.status.toUpperCase()}
											</Chip>
										</TableCell>
										<TableCell>
											<span className="font-semibold text-gray-900 text-sm">
												{formatCurrency(payment.amount, property.currency)}
											</span>
										</TableCell>
										<TableCell>
											<Dropdown>
												<DropdownTrigger>
													<Button
														isIconOnly
														variant="light"
														size="sm"
														className="min-w-0"
													>
														<MoreVertical className="h-4 w-4" />
													</Button>
												</DropdownTrigger>
												<DropdownMenu aria-label="Payment actions">
													<DropdownItem key="view">View Details</DropdownItem>
													<DropdownItem key="edit">Edit</DropdownItem>
													<DropdownItem key="delete" color="danger">
														Delete
													</DropdownItem>
												</DropdownMenu>
											</Dropdown>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				)}

				{activeTab === "expenses" && (
					<div className="p-12 text-center">
						<div className="mx-auto max-w-md">
							<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
								<span className="text-2xl">📊</span>
							</div>
							<p className="mb-2 font-medium text-gray-600">
								No expenses recorded
							</p>
							<p className="mb-4 text-gray-500 text-sm">
								Start tracking expenses for this property
							</p>
							<Button
								size="sm"
								color="primary"
								startContent={<Plus className="h-4 w-4" />}
								onPress={onAddExpense}
							>
								Add Expense
							</Button>
						</div>
					</div>
				)}

				{/* Pagination */}
				{activeTab === "payments" && filteredPayments.length > 0 && (
					<div className="flex items-center justify-between border-gray-200 border-t px-6 py-4">
						<div className="flex items-center gap-2 text-gray-600 text-sm">
							<span>Rows per page:</span>
							<Select
								selectedKeys={[rowsPerPage.toString()]}
								onSelectionChange={(keys) => {
									const value = Array.from(keys)[0] as string;
									setRowsPerPage(Number(value));
									setCurrentPage(1);
								}}
								className="w-20"
								size="sm"
							>
								<SelectItem key="10">10</SelectItem>
								<SelectItem key="25">25</SelectItem>
								<SelectItem key="50">50</SelectItem>
							</Select>
						</div>
						<div className="flex items-center gap-4">
							<span className="text-gray-600 text-sm">
								{(currentPage - 1) * rowsPerPage + 1}-
								{Math.min(currentPage * rowsPerPage, filteredPayments.length)}{" "}
								of {filteredPayments.length}
							</span>
							<div className="flex gap-1">
								<Button
									size="sm"
									variant="light"
									isDisabled={currentPage === 1}
									onPress={() => setCurrentPage((p) => Math.max(1, p - 1))}
								>
									←
								</Button>
								<Button
									size="sm"
									variant="light"
									isDisabled={currentPage === totalPages || totalPages === 0}
									onPress={() =>
										setCurrentPage((p) => Math.min(totalPages, p + 1))
									}
								>
									→
								</Button>
							</div>
						</div>
					</div>
				)}
			</CardBody>
		</Card>
	);
}
