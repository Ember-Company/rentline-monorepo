import {
	Button,
	Card,
	CardBody,
	CardHeader,
	Chip,
	Table,
	TableBody,
	TableCell,
	TableColumn,
	TableHeader,
	TableRow,
} from "@heroui/react";
import { Plus } from "lucide-react";
import type { PropertyDetail } from "@/lib/mock-data/property-details";
import { formatDate } from "@/lib/utils/format";

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
			<CardHeader className="flex items-center justify-between">
				<h3 className="font-semibold text-gray-900 text-lg">Tickets</h3>
				<Button
					color="primary"
					size="sm"
					startContent={<Plus className="h-4 w-4" />}
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
					<p className="py-8 text-center text-gray-500 text-sm">
						No tickets found
					</p>
				)}
			</CardBody>
		</Card>
	);
}
