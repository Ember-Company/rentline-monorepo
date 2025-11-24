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
	Checkbox,
} from "@heroui/react";
import { Search, Filter, ArrowUpDown, MoreVertical } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { Avatar } from "@heroui/react";

type Payment = {
	id: string;
	date: string;
	propertyInfo: string;
	customerName: string;
	type: "Rent" | "Sale";
	amount: number;
	status: "Pending" | "Completed" | "Failed";
};

type RecentPaymentsTableProps = {
	payments: Payment[];
	onSearch?: (query: string) => void;
	onFilter?: () => void;
	onSort?: () => void;
};

export function RecentPaymentsTable({
	payments,
	onSearch,
	onFilter,
	onSort,
}: RecentPaymentsTableProps) {
	const getStatusColor = (status: Payment["status"]): "warning" | "success" | "danger" => {
		switch (status) {
			case "Pending":
				return "warning";
			case "Completed":
				return "success";
			case "Failed":
				return "danger";
		}
	};

	const getTypeColor = (type: Payment["type"]): "success" | "default" => {
		return type === "Rent" ? "success" : "default";
	};

	return (
		<Card className="border border-gray-200 shadow-sm">
			<CardHeader>
				<h3 className="text-lg font-semibold text-gray-900">Recent Payments</h3>
			</CardHeader>
			<CardBody className="p-0">
				{/* Search and Filter Bar */}
				<div className="flex items-center gap-2 p-4 border-b border-gray-200">
					<Input
						placeholder="Search payments..."
						startContent={<Search className="w-4 h-4 text-gray-400" />}
						classNames={{
							input: "text-sm",
							inputWrapper: "bg-white border-gray-200 max-w-xs",
						}}
						onValueChange={(value) => onSearch?.(value)}
					/>
					<Button
						variant="bordered"
						startContent={<Filter className="w-4 h-4" />}
						onPress={onFilter}
					>
						Filter
					</Button>
					<Button
						variant="bordered"
						startContent={<ArrowUpDown className="w-4 h-4" />}
						onPress={onSort}
					>
						Sort by
					</Button>
				</div>

				<Table aria-label="Recent payments table" removeWrapper>
					<TableHeader>
						<TableColumn width={40}>
							<Checkbox />
						</TableColumn>
						<TableColumn>PAYMENT ID</TableColumn>
						<TableColumn>DATE</TableColumn>
						<TableColumn>PROPERTY INFO</TableColumn>
						<TableColumn>CUSTOMER NAME</TableColumn>
						<TableColumn>TYPE</TableColumn>
						<TableColumn>AMOUNT</TableColumn>
						<TableColumn>STATUS</TableColumn>
						<TableColumn width={40}>ACTIONS</TableColumn>
					</TableHeader>
					<TableBody>
						{payments.map((payment) => (
							<TableRow key={payment.id} className="hover:bg-gray-50">
								<TableCell>
									<Checkbox />
								</TableCell>
								<TableCell className="font-medium">{payment.id}</TableCell>
								<TableCell>{formatDate(payment.date)}</TableCell>
								<TableCell className="max-w-xs truncate">
									{payment.propertyInfo}
								</TableCell>
								<TableCell>
									<div className="flex items-center gap-2">
										<Avatar
											name={payment.customerName}
											size="sm"
											className="w-6 h-6"
										/>
										<span>{payment.customerName}</span>
									</div>
								</TableCell>
								<TableCell>
									<Chip
										size="sm"
										color={getTypeColor(payment.type)}
										variant="flat"
									>
										{payment.type}
									</Chip>
								</TableCell>
								<TableCell className="font-semibold">
									{formatCurrency(payment.amount)}
								</TableCell>
								<TableCell>
									<Chip
										size="sm"
										color={getStatusColor(payment.status)}
										variant="flat"
									>
										{payment.status}
									</Chip>
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
			</CardBody>
		</Card>
	);
}

