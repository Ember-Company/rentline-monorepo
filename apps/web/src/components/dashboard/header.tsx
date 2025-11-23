import {
	Input,
	Button,
	Dropdown,
	DropdownTrigger,
	DropdownMenu,
	DropdownItem,
	Avatar,
} from "@heroui/react";
import {
	Search,
	Bell,
	MessageCircle,
	Globe,
	ChevronDown,
	LogOut,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useNavigate } from "react-router";

export function DashboardHeader() {
	const { data: session } = authClient.useSession();
	const navigate = useNavigate();
	const userName = session?.user?.name || "User";
	const userEmail = session?.user?.email || "user@example.com";

	const handleSignOut = async () => {
		await authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					navigate("/");
				},
			},
		});
	};

	return (
		<header className="sticky top-0 z-20 bg-white border-b border-gray-200">
			<div className="flex items-center justify-between px-6 py-4 gap-4">
				{/* Search Bar */}
				<div className="flex-1 max-w-md">
					<Input
						placeholder="Search anything..."
						startContent={<Search className="w-4 h-4 text-gray-400" />}
						classNames={{
							input: "text-sm",
							inputWrapper: "bg-gray-50 border-gray-200",
						}}
					/>
				</div>

				{/* Icons */}
				<div className="flex items-center gap-3">
					<Button
						isIconOnly
						variant="light"
						className="text-gray-600"
						aria-label="Notifications"
					>
						<Bell className="w-5 h-5" />
					</Button>
					<Button
						isIconOnly
						variant="light"
						className="text-gray-600"
						aria-label="Messages"
					>
						<MessageCircle className="w-5 h-5" />
					</Button>
					<Button
						isIconOnly
						variant="light"
						className="text-gray-600"
						aria-label="Snapchat"
					>
						<div className="w-5 h-5 rounded-full bg-yellow-400" />
					</Button>
					<Dropdown>
						<DropdownTrigger>
							<Button
								variant="light"
								className="text-gray-600"
								endContent={<Globe className="w-4 h-4" />}
							>
								English
							</Button>
						</DropdownTrigger>
						<DropdownMenu aria-label="Language selection">
							<DropdownItem key="english">English</DropdownItem>
							<DropdownItem key="spanish">Spanish</DropdownItem>
							<DropdownItem key="french">French</DropdownItem>
						</DropdownMenu>
					</Dropdown>
				</div>

				{/* User Profile */}
				<Dropdown placement="bottom-end">
					<DropdownTrigger>
						<Button variant="light" className="flex items-center gap-3 px-2">
							<Avatar
								src="https://i.pravatar.cc/150?u=user"
								name={userName}
								size="sm"
							/>
							<div className="flex flex-col items-start text-left">
								<span className="text-sm font-medium text-gray-900">
									{userName}
								</span>
								<span className="text-xs text-gray-500">{userEmail}</span>
							</div>
							<ChevronDown className="w-4 h-4 text-gray-400" />
						</Button>
					</DropdownTrigger>
					<DropdownMenu
						aria-label="User menu"
						onAction={(key) => {
							if (key === "logout") {
								handleSignOut();
							} else if (key === "settings") {
								navigate("/dashboard/settings");
							}
						}}
					>
						<DropdownItem key="profile">Profile</DropdownItem>
						<DropdownItem key="settings">Settings</DropdownItem>
						<DropdownItem
							key="logout"
							color="danger"
							startContent={<LogOut className="w-4 h-4" />}
						>
							Logout
						</DropdownItem>
					</DropdownMenu>
				</Dropdown>
			</div>
		</header>
	);
}
