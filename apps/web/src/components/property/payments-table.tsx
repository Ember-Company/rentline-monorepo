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
	Tabs,
	Tab,
} from "@heroui/react";
import { Search, Plus, MoreVertical } from "lucide-react";
import { useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import type { PropertyDetail } from "@/lib/mock-data/property-details";

type PaymentsTableProps = {
	property: PropertyDetail;
	onAddPayment?: () => void;
};

export function PaymentsTable({ property, onAddPayment }: PaymentsTableProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [activeTab, setActiveTab] = useState("payments");

	const filteredPayments = property.payments.filter(
		(payment) =>
			payment.tenant.toLowerCase().includes(searchQuery.toLowerCase()) ||
			payment.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
			payment.notes?.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	const getStatusColor = (
		status: "paid" | "pending" | "overdue",
	): "success" | "warning" | "danger" => {
		switch (status) {
			case "paid":
				return "success";
			case "pending":
				return "warning";
			case "overdue":
				return "danger";
		}
	};

	return (
		<Card className="border border-gray-200 shadow-sm">
			<CardHeader className="flex justify-between items-center">
				<div className="flex items-center gap-4">
					<Tabs
						selectedKey={activeTab}
						onSelectionChange={(key) => setActiveTab(String(key))}
						size="sm"
					>
						<Tab key="payments" title="Payments" />
						<Tab key="expenses" title="Expenses" />
					</Tabs>
				</div>
				<div className="flex items-center gap-2">
					<Input
						placeholder="Search..."
						startContent={<Search className="w-4 h-4 text-gray-400" />}
						value={searchQuery}
						onValueChange={setSearchQuery}
						className="w-64"
						size="sm"
					/>
					{activeTab === "payments" && (
						<>
							<Select
								defaultSelectedKeys={["all"]}
								className="w-40"
								size="sm"
								labelPlacement="outside-left"
							>
								<SelectItem key="all">All</SelectItem>
								<SelectItem key="paid">Paid</SelectItem>
								<SelectItem key="pending">Pending</SelectItem>
								<SelectItem key="overdue">Overdue</SelectItem>
							</Select>
							<Button
								color="primary"
								size="sm"
								startContent={<Plus className="w-4 h-4" />}
								onPress={onAddPayment}
							>
								New
							</Button>
						</>
					)}
					{activeTab === "expenses" && (
						<Button
							color="primary"
							size="sm"
							startContent={<Plus className="w-4 h-4" />}
							onPress={onAddPayment}
						>
							New
						</Button>
					)}
				</div>
			</CardHeader>
			<CardBody>
				{activeTab === "payments" ? (
					<>
						<Tabs size="sm" className="mb-4">
							<Tab key="payments" title="Payments" />
							<Tab key="periods" title="Payment periods" />
						</Tabs>
						<Table aria-label="Payments table" removeWrapper>
							<TableHeader>
								<TableColumn>DATE</TableColumn>
								<TableColumn>CATEGORY</TableColumn>
								<TableColumn>PERIOD</TableColumn>
								<TableColumn>TENANT</TableColumn>
								<TableColumn>NOTES</TableColumn>
								<TableColumn>STATUS</TableColumn>
								<TableColumn>AMOUNT</TableColumn>
								<TableColumn>ACTIONS</TableColumn>
							</TableHeader>
							<TableBody>
								{filteredPayments.map((payment) => (
									<TableRow key={payment.id}>
										<TableCell>{formatDate(payment.date)}</TableCell>
										<TableCell>
											<Chip size="sm" color="success" variant="flat">
												{payment.category}
											</Chip>
										</TableCell>
										<TableCell>{payment.period}</TableCell>
										<TableCell>{payment.tenant || "-"}</TableCell>
										<TableCell>{payment.notes || "-"}</TableCell>
										<TableCell>
											<Chip
												size="sm"
												color={getStatusColor(payment.status)}
												variant="flat"
											>
												{payment.status.toUpperCase()}
											</Chip>
										</TableCell>
										<TableCell className="font-semibold">
											{formatCurrency(payment.amount)}
										</TableCell>
										<TableCell>
											<Button
												isIconOnly
												variant="light"
												size="sm"
											>
												<MoreVertical className="w-4 h-4" />
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
						<div className="flex items-center justify-between mt-4 text-sm text-gray-600">
							<span>Rows per page: 10</span>
							<span>
								1-{filteredPayments.length} of {filteredPayments.length}
							</span>
							<div className="flex gap-2">
								<Button size="sm" variant="light" isDisabled>
									Previous
								</Button>
								<Button size="sm" variant="light" isDisabled>
									Next
								</Button>
							</div>
						</div>
					</>
				) : (
					<Table aria-label="Expenses table" removeWrapper>
						<TableHeader>
							<TableColumn>DATE</TableColumn>
							<TableColumn>CATEGORY</TableColumn>
							<TableColumn>DESCRIPTION</TableColumn>
							<TableColumn>VENDOR</TableColumn>
							<TableColumn>STATUS</TableColumn>
							<TableColumn>AMOUNT</TableColumn>
							<TableColumn>ACTIONS</TableColumn>
						</TableHeader>
						<TableBody>
							{property.expenses.map((expense) => (
								<TableRow key={expense.id}>
									<TableCell>{formatDate(expense.date)}</TableCell>
									<TableCell>
										<Chip size="sm" color="default" variant="flat">
											{expense.category}
										</Chip>
									</TableCell>
									<TableCell>{expense.description}</TableCell>
									<TableCell>{expense.vendor || "-"}</TableCell>
									<TableCell>
										<Chip
											size="sm"
											color={expense.status === "paid" ? "success" : "warning"}
											variant="flat"
										>
											{expense.status.toUpperCase()}
										</Chip>
									</TableCell>
									<TableCell className="font-semibold">
										{formatCurrency(expense.amount)}
									</TableCell>
									<TableCell>
										<Button isIconOnly variant="light" size="sm">
											<MoreVertical className="w-4 h-4" />
										</Button>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				)}
			</CardBody>
		</Card>
	);
}

