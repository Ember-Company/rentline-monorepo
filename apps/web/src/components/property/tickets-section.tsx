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
	Button,
} from "@heroui/react";
import { Plus } from "lucide-react";
import { formatDate } from "@/lib/utils/format";
import type { PropertyDetail } from "@/lib/mock-data/property-details";

type TicketsSectionProps = {
	property: PropertyDetail;
	onAddTicket?: () => void;
};

export function TicketsSection({ property, onAddTicket }: TicketsSectionProps) {
	const getStatusColor = (
		status: "open" | "in-progress" | "resolved" | "closed",
	): "default" | "primary" | "success" | "default" => {
		switch (status) {
			case "open":
				return "default";
			case "in-progress":
				return "primary";
			case "resolved":
				return "success";
			case "closed":
				return "default";
		}
	};

	const getPriorityColor = (
		priority: "low" | "medium" | "high" | "urgent",
	): "default" | "warning" | "danger" => {
		switch (priority) {
			case "low":
				return "default";
			case "medium":
				return "warning";
			case "high":
				return "danger";
			case "urgent":
				return "danger";
		}
	};

	return (
		<Card className="border border-gray-200 shadow-sm">
			<CardHeader className="flex justify-between items-center">
				<h3 className="text-lg font-semibold text-gray-900">Tickets</h3>
				<Button
					color="primary"
					size="sm"
					startContent={<Plus className="w-4 h-4" />}
					onPress={onAddTicket}
				>
					New Ticket
				</Button>
			</CardHeader>
			<CardBody>
				<Table aria-label="Tickets table" removeWrapper>
					<TableHeader>
						<TableColumn>TITLE</TableColumn>
						<TableColumn>DESCRIPTION</TableColumn>
						<TableColumn>TENANT</TableColumn>
						<TableColumn>PRIORITY</TableColumn>
						<TableColumn>STATUS</TableColumn>
						<TableColumn>CREATED</TableColumn>
						<TableColumn>UPDATED</TableColumn>
					</TableHeader>
					<TableBody>
						{property.tickets.map((ticket) => (
							<TableRow key={ticket.id}>
								<TableCell className="font-medium">{ticket.title}</TableCell>
								<TableCell className="max-w-md truncate">
									{ticket.description}
								</TableCell>
								<TableCell>{ticket.tenant || "-"}</TableCell>
								<TableCell>
									<Chip
										size="sm"
										color={getPriorityColor(ticket.priority)}
										variant="flat"
									>
										{ticket.priority.toUpperCase()}
									</Chip>
								</TableCell>
								<TableCell>
									<Chip
										size="sm"
										color={getStatusColor(ticket.status)}
										variant="flat"
									>
										{ticket.status.replace("-", " ").toUpperCase()}
									</Chip>
								</TableCell>
								<TableCell>{formatDate(ticket.createdAt)}</TableCell>
								<TableCell>{formatDate(ticket.updatedAt)}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
				{property.tickets.length === 0 && (
					<p className="text-sm text-gray-500 text-center py-8">
						No tickets found
					</p>
				)}
			</CardBody>
		</Card>
	);
}

