import type { Route } from "./+types/route";
import {
	Card,
	CardBody,
	CardHeader,
	Button,
	Table,
	TableHeader,
	TableColumn,
	TableBody,
	TableRow,
	TableCell,
	Chip,
	Input,
	Select,
	SelectItem,
} from "@heroui/react";
import { DollarSign, Plus, Search, Edit, Trash2, Download } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { CrudModal } from "@/components/dashboard/crud-modal";
import {
	recentTransactions,
	type Transaction,
} from "@/lib/mock-data/transactions";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import z from "zod";

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "Transactions - Rentline" },
		{ name: "description", content: "View all transactions" },
	];
}

export default function TransactionsPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [selectedTransaction, setSelectedTransaction] =
		useState<Transaction | null>(null);
	const [transactionsList, setTransactionsList] = useState(recentTransactions);

	const filteredTransactions = transactionsList.filter((transaction) => {
		const matchesSearch =
			transaction.property.toLowerCase().includes(searchQuery.toLowerCase()) ||
			transaction.tenant.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesStatus =
			statusFilter === "all" || transaction.status === statusFilter;
		return matchesSearch && matchesStatus;
	});

	const form = useForm({
		defaultValues: {
			property: "",
			tenant: "",
			amount: "",
			type: "rent" as Transaction["type"],
			status: "pending" as Transaction["status"],
			date: new Date().toISOString().split("T")[0],
		},
		onSubmit: async ({ value }) => {
			if (selectedTransaction) {
				// Update
				setTransactionsList(
					transactionsList.map((t) =>
						t.id === selectedTransaction.id
							? {
									...t,
									property: value.property,
									tenant: value.tenant,
									amount: Number(value.amount),
									type: value.type,
									status: value.status,
									date: value.date,
								}
							: t,
					),
				);
				toast.success("Transaction updated successfully");
			} else {
				// Create
				const newTransaction: Transaction = {
					id: transactionsList.length + 1,
					property: value.property,
					tenant: value.tenant,
					amount: Number(value.amount),
					type: value.type,
					status: value.status,
					date: value.date,
				};
				setTransactionsList([...transactionsList, newTransaction]);
				toast.success("Transaction created successfully");
			}
			setIsModalOpen(false);
			setSelectedTransaction(null);
			form.reset();
		},
		validators: {
			onSubmit: z.object({
				property: z.string().min(5, "Property address is required"),
				tenant: z.string().min(2, "Tenant name is required"),
				amount: z.string().regex(/^\d+$/, "Must be a valid number"),
				type: z.enum(["rent", "expense", "deposit"]),
				status: z.enum(["completed", "pending", "overdue"]),
				date: z.string().min(1, "Date is required"),
			}),
		},
	});

	const handleCreate = () => {
		setSelectedTransaction(null);
		form.reset();
		form.setFieldValue("date", new Date().toISOString().split("T")[0]);
		setIsModalOpen(true);
	};

	const handleEdit = (transaction: Transaction) => {
		setSelectedTransaction(transaction);
		form.setFieldValue("property", transaction.property);
		form.setFieldValue("tenant", transaction.tenant);
		form.setFieldValue("amount", transaction.amount.toString());
		form.setFieldValue("type", transaction.type);
		form.setFieldValue("status", transaction.status);
		form.setFieldValue("date", transaction.date);
		setIsModalOpen(true);
	};

	const handleDelete = (transaction: Transaction) => {
		setSelectedTransaction(transaction);
		setIsDeleteModalOpen(true);
	};

	const confirmDelete = () => {
		if (selectedTransaction) {
			setTransactionsList(
				transactionsList.filter((t) => t.id !== selectedTransaction.id),
			);
			toast.success("Transaction deleted successfully");
			setIsDeleteModalOpen(false);
			setSelectedTransaction(null);
		}
	};

	return (
		<div className="space-y-6">
			<PageHeader
				title="Transactions"
				subtitle="View and manage all financial transactions"
				actions={
					<>
						<Button
							variant="bordered"
							startContent={<Download className="w-4 h-4" />}
						>
							Export
						</Button>
						<Button
							color="primary"
							startContent={<Plus className="w-4 h-4" />}
							onPress={handleCreate}
						>
							Record Transaction
						</Button>
					</>
				}
			/>

			<Card className="border border-gray-200 shadow-sm">
				<CardHeader className="flex justify-between items-center">
					<div>
						<h2 className="text-xl font-semibold">All Transactions</h2>
						<p className="text-sm text-gray-600">
							{filteredTransactions.length} transactions found
						</p>
					</div>
					<div className="flex gap-2">
						<Input
							placeholder="Search transactions..."
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
							<SelectItem key="all" value="all">
								All Status
							</SelectItem>
							<SelectItem key="completed" value="completed">
								Completed
							</SelectItem>
							<SelectItem key="pending" value="pending">
								Pending
							</SelectItem>
							<SelectItem key="overdue" value="overdue">
								Overdue
							</SelectItem>
						</Select>
					</div>
				</CardHeader>
				<CardBody>
					<Table aria-label="Transactions list" removeWrapper>
						<TableHeader>
							<TableColumn>PROPERTY</TableColumn>
							<TableColumn>TENANT</TableColumn>
							<TableColumn>TYPE</TableColumn>
							<TableColumn>AMOUNT</TableColumn>
							<TableColumn>DATE</TableColumn>
							<TableColumn>STATUS</TableColumn>
							<TableColumn>ACTIONS</TableColumn>
						</TableHeader>
						<TableBody>
							{filteredTransactions.map((transaction) => (
								<TableRow key={transaction.id}>
									<TableCell>
										<span className="font-medium">{transaction.property}</span>
									</TableCell>
									<TableCell>{transaction.tenant}</TableCell>
									<TableCell>
										<Chip size="sm" variant="flat" color="primary">
											{transaction.type.charAt(0).toUpperCase() +
												transaction.type.slice(1)}
										</Chip>
									</TableCell>
									<TableCell>
										<span className="font-semibold">
											{formatCurrency(transaction.amount)}
										</span>
									</TableCell>
									<TableCell>
										<span className="text-sm text-muted-foreground">
											{formatDate(transaction.date)}
										</span>
									</TableCell>
									<TableCell>
										<Chip
											size="sm"
											variant="flat"
											color={
												transaction.status === "completed"
													? "success"
													: transaction.status === "pending"
														? "warning"
														: "danger"
											}
										>
											{transaction.status.charAt(0).toUpperCase() +
												transaction.status.slice(1)}
										</Chip>
									</TableCell>
									<TableCell>
										<div className="flex items-center gap-2">
											<Button
												size="sm"
												variant="light"
												isIconOnly
												onPress={() => handleEdit(transaction)}
											>
												<Edit className="w-4 h-4" />
											</Button>
											<Button
												size="sm"
												variant="light"
												color="danger"
												isIconOnly
												onPress={() => handleDelete(transaction)}
											>
												<Trash2 className="w-4 h-4" />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardBody>
			</Card>

			{/* Create/Edit Modal */}
			<CrudModal
				isOpen={isModalOpen}
				onClose={() => {
					setIsModalOpen(false);
					setSelectedTransaction(null);
					form.reset();
				}}
				title={
					selectedTransaction ? "Edit Transaction" : "Record New Transaction"
				}
				onSave={() => form.handleSubmit()}
				saveLabel={selectedTransaction ? "Update" : "Create"}
				isLoading={form.state.isSubmitting}
			>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
					className="space-y-4"
				>
					<div className="grid grid-cols-2 gap-4">
						<div>
							<form.Field name="property">
								{(field) => (
									<div className="space-y-2">
										<Label htmlFor={field.name}>Property *</Label>
										<Input
											id={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onValueChange={(e) => field.handleChange(e)}
											placeholder="123 Main St, Apt 2B"
										/>
										{field.state.meta.errors.map((error) => (
											<p key={error?.message} className="text-sm text-danger">
												{error?.message}
											</p>
										))}
									</div>
								)}
							</form.Field>
						</div>

						<div>
							<form.Field name="tenant">
								{(field) => (
									<div className="space-y-2">
										<Label htmlFor={field.name}>Tenant *</Label>
										<Input
											id={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onValueChange={(e) => field.handleChange(e)}
											placeholder="John Doe"
										/>
										{field.state.meta.errors.map((error) => (
											<p key={error?.message} className="text-sm text-danger">
												{error?.message}
											</p>
										))}
									</div>
								)}
							</form.Field>
						</div>
					</div>

					<div className="grid grid-cols-3 gap-4">
						<div>
							<form.Field name="amount">
								{(field) => (
									<div className="space-y-2">
										<Label htmlFor={field.name}>Amount *</Label>
										<Input
											id={field.name}
											type="number"
											value={field.state.value}
											onBlur={field.handleBlur}
											onValueChange={(e) => field.handleChange(e)}
											placeholder="2500"
											startContent="$"
										/>
										{field.state.meta.errors.map((error) => (
											<p key={error?.message} className="text-sm text-danger">
												{error?.message}
											</p>
										))}
									</div>
								)}
							</form.Field>
						</div>

						<div>
							<form.Field name="type">
								{(field) => (
									<div className="space-y-2">
										<Label htmlFor={field.name}>Type *</Label>
										<Select
											selectedKeys={[field.state.value]}
											onSelectionChange={(keys) =>
												field.handleChange(
													Array.from(keys)[0] as Transaction["type"],
												)
											}
										>
											<SelectItem key="rent">Rent</SelectItem>
											<SelectItem key="expense">Expense</SelectItem>
											<SelectItem key="deposit">Deposit</SelectItem>
										</Select>
										{field.state.meta.errors.map((error) => (
											<p key={error?.message} className="text-sm text-danger">
												{error?.message}
											</p>
										))}
									</div>
								)}
							</form.Field>
						</div>

						<div>
							<form.Field name="status">
								{(field) => (
									<div className="space-y-2">
										<Label htmlFor={field.name}>Status *</Label>
										<Select
											selectedKeys={[field.state.value]}
											onSelectionChange={(keys) =>
												field.handleChange(
													Array.from(keys)[0] as Transaction["status"],
												)
											}
										>
											<SelectItem key="completed">Completed</SelectItem>
											<SelectItem key="pending">Pending</SelectItem>
											<SelectItem key="overdue">Overdue</SelectItem>
										</Select>
										{field.state.meta.errors.map((error) => (
											<p key={error?.message} className="text-sm text-danger">
												{error?.message}
											</p>
										))}
									</div>
								)}
							</form.Field>
						</div>
					</div>

					<div>
						<form.Field name="date">
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>Date *</Label>
									<Input
										id={field.name}
										type="date"
										value={field.state.value}
										onBlur={field.handleBlur}
										onValueChange={(e) => field.handleChange(e)}
									/>
									{field.state.meta.errors.map((error) => (
										<p key={error?.message} className="text-sm text-danger">
											{error?.message}
										</p>
									))}
								</div>
							)}
						</form.Field>
					</div>
				</form>
			</CrudModal>

			{/* Delete Confirmation Modal */}
			<CrudModal
				isOpen={isDeleteModalOpen}
				onClose={() => {
					setIsDeleteModalOpen(false);
					setSelectedTransaction(null);
				}}
				title="Delete Transaction"
				onDelete={confirmDelete}
				deleteLabel="Delete"
				size="md"
			>
				<p>
					Are you sure you want to delete this transaction? This action cannot
					be undone.
				</p>
			</CrudModal>
		</div>
	);
}
