import { Button, Card, CardBody, CardHeader } from "@heroui/react";
import {
	AlertCircle,
	DollarSign,
	FileText,
	Home,
	Settings,
	Users,
} from "lucide-react";

type QuickAction = {
	label: string;
	icon: React.ComponentType<{ className?: string }>;
	onClick?: () => void;
};

const defaultActions: QuickAction[] = [
	{
		label: "Record Payment",
		icon: DollarSign,
	},
	{
		label: "Add Property",
		icon: Home,
	},
	{
		label: "Add Tenant",
		icon: Users,
	},
	{
		label: "View Overdue Rent",
		icon: AlertCircle,
	},
];

type QuickActionsProps = {
	actions?: QuickAction[];
	title?: string;
};

export function QuickActions({
	actions = defaultActions,
	title = "Quick Actions",
}: QuickActionsProps) {
	return (
		<Card>
			<CardHeader>
				<h2 className="font-semibold text-xl">{title}</h2>
			</CardHeader>
			<CardBody className="space-y-2">
				{actions.map((action, index) => {
					const Icon = action.icon;
					return (
						<Button
							key={index}
							variant="bordered"
							className="w-full justify-start"
							startContent={<Icon className="h-4 w-4" />}
							onPress={action.onClick}
						>
							{action.label}
						</Button>
					);
				})}
			</CardBody>
		</Card>
	);
}
