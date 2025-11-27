import {
	Avatar,
	Button,
	Dropdown,
	DropdownItem,
	DropdownMenu,
	DropdownTrigger,
	Tooltip,
} from "@heroui/react";
import {
	Building2,
	ChevronLeft,
	ChevronRight,
	Contact,
	CreditCard,
	FileText,
	HelpCircle,
	Home,
	LayoutDashboard,
	LogOut,
	Menu,
	Settings,
	Wrench,
	X,
} from "lucide-react";
import { useState } from "react";
import { NavLink, useNavigate } from "react-router";
import { authClient } from "@/lib/auth-client";
import { useCustomTheme } from "../theme-provider";

const mainNavItems = [
	{ to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
	{ to: "/dashboard/properties", label: "Imóveis", icon: Home },
	{ to: "/dashboard/leases", label: "Contratos", icon: FileText },
	{ to: "/dashboard/finances", label: "Financeiro", icon: CreditCard },
	{ to: "/dashboard/maintenance", label: "Manutenção", icon: Wrench },
	{ to: "/dashboard/contacts", label: "Contatos", icon: Contact },
];

const bottomNavItems = [
	{ to: "/dashboard/settings", label: "Configurações", icon: Settings },
	{ to: "/dashboard/help", label: "Ajuda", icon: HelpCircle },
];

export function Sidebar() {
	const [isMobileOpen, setIsMobileOpen] = useState(false);
	const { sidebarCollapsed, toggleSidebar } = useCustomTheme();
	const { data: session } = authClient.useSession();
	const navigate = useNavigate();

	const handleSignOut = async () => {
		await authClient.signOut({
			fetchOptions: {
				onSuccess: () => navigate("/"),
			},
		});
	};

	const NavItem = ({
		item,
		collapsed,
	}: {
		item: (typeof mainNavItems)[0];
		collapsed: boolean;
	}) => {
		const Icon = item.icon;
		const content = (
			<NavLink
				to={item.to}
				end={item.end}
				className={({ isActive }) =>
					`group flex items-center gap-3 rounded-lg transition-all ${
						collapsed ? "justify-center p-2.5" : "px-3 py-2"
					} ${
						isActive
							? "bg-primary text-white"
							: "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
					}`
				}
				onClick={() => setIsMobileOpen(false)}
			>
				<Icon className={collapsed ? "h-5 w-5" : "h-4 w-4"} />
				{!collapsed && (
					<span className="text-sm font-medium">{item.label}</span>
				)}
			</NavLink>
		);

		if (collapsed) {
			return (
				<Tooltip content={item.label} placement="right" delay={0}>
					{content}
				</Tooltip>
			);
		}

		return content;
	};

	const sidebarWidth = sidebarCollapsed ? "w-16" : "w-56";

	return (
		<>
			{/* Mobile menu button */}
			<div className="fixed left-3 top-3 z-50 lg:hidden">
				<Button
					isIconOnly
					variant="flat"
					size="sm"
					onPress={() => setIsMobileOpen(!isMobileOpen)}
					aria-label="Toggle menu"
					className="bg-white shadow-sm dark:bg-gray-800"
				>
					{isMobileOpen ? (
						<X className="h-4 w-4" />
					) : (
						<Menu className="h-4 w-4" />
					)}
				</Button>
			</div>

			{/* Sidebar */}
			<aside
				className={`fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-gray-200 bg-white transition-all duration-200 dark:border-gray-800 dark:bg-gray-900 lg:translate-x-0 ${sidebarWidth} ${
					isMobileOpen ? "translate-x-0" : "-translate-x-full"
				}`}
			>
				{/* Header */}
				<div
					className={`flex h-14 items-center border-b border-gray-200 dark:border-gray-800 ${
						sidebarCollapsed ? "justify-center px-2" : "justify-between px-3"
					}`}
				>
					<NavLink
						to="/dashboard"
						className="flex items-center gap-2"
						onClick={() => setIsMobileOpen(false)}
					>
						<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
							<Building2 className="h-4 w-4 text-white" />
						</div>
						{!sidebarCollapsed && (
							<span className="font-bold text-gray-900 dark:text-white">
								Rentline
							</span>
						)}
					</NavLink>

					{!sidebarCollapsed && (
						<Button
							isIconOnly
							variant="light"
							size="sm"
							onPress={toggleSidebar}
							className="hidden text-gray-400 hover:text-gray-600 lg:flex"
						>
							<ChevronLeft className="h-4 w-4" />
						</Button>
					)}
				</div>

				{/* Collapsed toggle button */}
				{sidebarCollapsed && (
					<div className="hidden justify-center border-b border-gray-200 py-2 dark:border-gray-800 lg:flex">
						<Button
							isIconOnly
							variant="light"
							size="sm"
							onPress={toggleSidebar}
							className="text-gray-400 hover:text-gray-600"
						>
							<ChevronRight className="h-4 w-4" />
						</Button>
					</div>
				)}

				{/* Navigation */}
				<nav className="flex-1 overflow-y-auto p-2">
					{!sidebarCollapsed && (
						<p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
							Menu
						</p>
					)}
					<div className="space-y-0.5">
						{mainNavItems.map((item) => (
							<NavItem key={item.to} item={item} collapsed={sidebarCollapsed} />
						))}
					</div>
				</nav>

				{/* Bottom section */}
				<div className="border-t border-gray-200 p-2 dark:border-gray-800">
					<div className="space-y-0.5">
						{bottomNavItems.map((item) => (
							<NavItem key={item.to} item={item} collapsed={sidebarCollapsed} />
						))}
					</div>

					{/* User */}
					<div className="mt-2 border-t border-gray-200 pt-2 dark:border-gray-800">
						<Dropdown placement="top-start">
							<DropdownTrigger>
								<button
									type="button"
									className={`flex w-full items-center gap-2 rounded-lg p-2 text-left transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${
										sidebarCollapsed ? "justify-center" : ""
									}`}
								>
									<Avatar
										name={session?.user?.name || "U"}
										size="sm"
										className="h-7 w-7 text-xs"
									/>
									{!sidebarCollapsed && (
										<div className="min-w-0 flex-1">
											<p className="truncate text-xs font-medium text-gray-900 dark:text-white">
												{session?.user?.name || "Usuário"}
											</p>
											<p className="truncate text-[10px] text-gray-500">
												{session?.user?.email}
											</p>
										</div>
									)}
								</button>
							</DropdownTrigger>
							<DropdownMenu
								aria-label="User menu"
								onAction={(key) => {
									if (key === "logout") handleSignOut();
									else if (key === "settings")
										navigate("/dashboard/settings");
								}}
							>
								<DropdownItem key="profile">Meu Perfil</DropdownItem>
								<DropdownItem key="settings">Configurações</DropdownItem>
								<DropdownItem
									key="logout"
									color="danger"
									startContent={<LogOut className="h-4 w-4" />}
								>
									Sair
								</DropdownItem>
							</DropdownMenu>
						</Dropdown>
					</div>
				</div>
			</aside>

			{/* Overlay for mobile */}
			{isMobileOpen && (
				<div
					className="fixed inset-0 z-30 bg-black/50 lg:hidden"
					onClick={() => setIsMobileOpen(false)}
				/>
			)}
		</>
	);
}
