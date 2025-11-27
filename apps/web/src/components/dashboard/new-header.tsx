import {
	Avatar,
	Button,
	Dropdown,
	DropdownItem,
	DropdownMenu,
	DropdownTrigger,
} from "@heroui/react";
import { ChevronRight, Download, LogOut, RefreshCw } from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import { authClient } from "@/lib/auth-client";
import { formatDate } from "@/lib/utils/format";

export function NewHeader() {
	const { data: session } = authClient.useSession();
	const navigate = useNavigate();
	const location = useLocation();
	const userName = session?.user?.name || "User";
	const userEmail = session?.user?.email || "user@example.com";
	const userRole = "Property Manager"; // You can get this from session or user data

	// Generate breadcrumbs from path
	const getBreadcrumbs = () => {
		const path = location.pathname;
		if (path === "/dashboard") {
			return [
				{ label: "Home", path: "/dashboard" },
				{ label: "Dashboard", path: "/dashboard" },
			];
		}
		const parts = path.split("/").filter(Boolean);
		const breadcrumbs = [{ label: "Home", path: "/dashboard" }];
		let currentPath = "";
		parts.forEach((part, index) => {
			currentPath += `/${part}`;
			const label =
				part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, " ");
			breadcrumbs.push({ label, path: currentPath });
		});
		return breadcrumbs;
	};

	const breadcrumbs = getBreadcrumbs();
	const lastUpdated = new Date().toISOString();

	const handleSignOut = async () => {
		await authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					navigate("/");
				},
			},
		});
	};

	const handleExport = () => {
		// Export functionality
		console.log("Exporting data...");
	};

	return (
		<header className="sticky top-0 z-20 border-gray-200 border-b bg-white">
			<div className="flex items-center justify-between px-6 py-4">
				{/* Left: Logo and Breadcrumbs */}
				<div className="flex items-center gap-4">
					<div className="flex items-center gap-2">
						<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
							<span className="font-bold text-lg text-white">R</span>
						</div>
						<span className="hidden font-bold text-gray-900 text-lg sm:inline">
							Rentline
						</span>
					</div>
					<div className="flex items-center gap-2 text-gray-600 text-sm">
						{breadcrumbs.map((crumb, index) => (
							<div key={crumb.path} className="flex items-center gap-2">
								{index > 0 && <ChevronRight className="h-4 w-4" />}
								<span
									className={
										index === breadcrumbs.length - 1
											? "font-medium text-gray-900"
											: ""
									}
								>
									{crumb.label}
								</span>
							</div>
						))}
					</div>
				</div>

				{/* Right: User Info, Last Updated, Export */}
				<div className="flex items-center gap-4">
					{/* Last Updated */}
					<div className="hidden items-center gap-2 text-gray-600 text-sm md:flex">
						<RefreshCw className="h-4 w-4" />
						<span>Last updated: {formatDate(lastUpdated)}</span>
					</div>

					{/* Export Button */}
					<Button
						color="primary"
						variant="solid"
						startContent={<Download className="h-4 w-4" />}
						onPress={handleExport}
						className="bg-primary text-white hover:bg-primary-600"
					>
						Export CSV
					</Button>

					{/* User Profile */}
					<Dropdown placement="bottom-end">
						<DropdownTrigger>
							<Button variant="light" className="flex items-center gap-3 px-2">
								<div className="flex flex-col items-end text-right">
									<span className="font-medium text-gray-900 text-sm">
										{userName}
									</span>
									<span className="text-gray-500 text-xs">{userRole}</span>
								</div>
								<Avatar name={userName} size="sm" className="h-8 w-8" />
							</Button>
						</DropdownTrigger>
						<DropdownMenu
							aria-label="User menu"
							onAction={(key) => {
								if (key === "logout") {
									handleSignOut();
								} else if (key === "settings") {
									navigate("/dashboard/settings");
								} else if (key === "profile") {
									navigate("/dashboard/settings");
								}
							}}
						>
							<DropdownItem key="profile">Profile</DropdownItem>
							<DropdownItem key="settings">Settings</DropdownItem>
							<DropdownItem
								key="logout"
								color="danger"
								startContent={<LogOut className="h-4 w-4" />}
							>
								Logout
							</DropdownItem>
						</DropdownMenu>
					</Dropdown>
				</div>
			</div>
		</header>
	);
}
