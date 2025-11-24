import {
	Card,
	CardBody,
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
	Dropdown,
	DropdownTrigger,
	DropdownMenu,
	DropdownItem,
} from "@heroui/react";
import { Search, Plus, MoreVertical } from "lucide-react";
import { useState, useMemo } from "react";
import { formatCurrency } from "@/lib/utils/format";
import { formatDate } from "@/lib/utils/format";
import type { PropertyDetail } from "@/lib/mock-data/property-types";

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
	const [activeTab, setActiveTab] = useState<"payments" | "expenses">("payments");
	const [paymentSubTab, setPaymentSubTab] = useState<"payments" | "periods">("payments");
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
			<div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center flex-shrink-0">
				<span className="text-white text-xs">🏠</span>
			</div>
		);
	};

	return (
		<Card className="border border-gray-200 shadow-sm">
			<CardBody className="p-0">
				{/* Tabs */}
				<div className="flex items-center justify-between border-b border-gray-200 px-6 pt-6 pb-0">
					<div className="flex gap-1">
						<button
							type="button"
							onClick={() => setActiveTab("payments")}
							className={`px-4 py-3 text-sm font-medium transition-colors relative ${
								activeTab === "payments"
									? "text-primary border-b-2 border-primary"
									: "text-gray-600 hover:text-gray-900"
							}`}
						>
							Payments
						</button>
						<button
							type="button"
							onClick={() => setActiveTab("expenses")}
							className={`px-4 py-3 text-sm font-medium transition-colors relative ${
								activeTab === "expenses"
									? "text-primary border-b-2 border-primary"
									: "text-gray-600 hover:text-gray-900"
							}`}
						>
							Expenses
						</button>
					</div>

					{activeTab === "payments" && (
						<div className="flex items-center gap-3">
							<div className="flex gap-1 bg-gray-100 rounded-lg p-1">
								<button
									type="button"
									onClick={() => setPaymentSubTab("payments")}
									className={`px-3 py-1.5 text-xs font-medium transition-colors rounded ${
										paymentSubTab === "payments"
											? "text-primary bg-white shadow-sm"
											: "text-gray-600 hover:text-gray-900"
									}`}
								>
									Payments
								</button>
								<button
									type="button"
									onClick={() => setPaymentSubTab("periods")}
									className={`px-3 py-1.5 text-xs font-medium transition-colors rounded ${
										paymentSubTab === "periods"
											? "text-primary bg-white shadow-sm"
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
				<div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
					<Input
						placeholder="Search"
						value={searchQuery}
						onValueChange={setSearchQuery}
						startContent={<Search className="h-4 w-4 text-gray-400" />}
						classNames={{
							input: "text-sm",
							inputWrapper: "bg-white border-gray-200 hover:border-gray-300 max-w-xs",
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
								<TableColumn width={50}></TableColumn>
							</TableHeader>
							<TableBody emptyContent="No payments found">
								{paginatedPayments.map((payment) => (
									<TableRow key={payment.id}>
										<TableCell>
											<span className="text-sm text-gray-900">
												{formatDate(payment.date)}
											</span>
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-3">
												{getCategoryIcon(payment.category)}
												<span className="text-sm font-medium text-gray-900">
													{payment.category}
												</span>
											</div>
										</TableCell>
										<TableCell>
											<span className="text-sm text-gray-900">
												{payment.period}
											</span>
										</TableCell>
										<TableCell>
											<span className="text-sm text-gray-900">
												{payment.tenant || "-"}
											</span>
										</TableCell>
										<TableCell>
											<span className="text-sm text-gray-500">
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
											<span className="text-sm font-semibold text-gray-900">
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
						<div className="max-w-md mx-auto">
							<div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
								<span className="text-2xl">📊</span>
							</div>
							<p className="text-gray-600 font-medium mb-2">No expenses recorded</p>
							<p className="text-sm text-gray-500 mb-4">
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
					<div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
						<div className="flex items-center gap-2 text-sm text-gray-600">
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
							<span className="text-sm text-gray-600">
								{(currentPage - 1) * rowsPerPage + 1}-
								{Math.min(currentPage * rowsPerPage, filteredPayments.length)} of{" "}
								{filteredPayments.length}
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
									onPress={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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

