import { Card, CardBody, CardHeader, Button } from "@heroui/react";
import {
	DollarSign,
	Home,
	Users,
	AlertCircle,
	FileText,
	Settings,
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
				<h2 className="text-xl font-semibold">{title}</h2>
			</CardHeader>
			<CardBody className="space-y-2">
				{actions.map((action, index) => {
					const Icon = action.icon;
					return (
						<Button
							key={index}
							variant="bordered"
							className="w-full justify-start"
							startContent={<Icon className="w-4 h-4" />}
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

