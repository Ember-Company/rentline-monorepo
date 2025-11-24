import { NavLink, useLocation } from "react-router";
import {
	LayoutDashboard,
	Users,
	BarChart3,
	Calendar,
	MessageSquare,
	Home,
	UserPlus,
	Receipt,
	Tag,
	Settings,
	HelpCircle,
	MessageCircle,
	Menu,
	X,
	Contact,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@heroui/react";

const mainMenuItems = [
	{ to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
	{ to: "/dashboard/agents", label: "Agents", icon: Users },
	{ to: "/dashboard/clients", label: "Clients", icon: Users },
	{ to: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
	{ to: "/dashboard/calendar", label: "Calendar", icon: Calendar },
	{ to: "/dashboard/messages", label: "Messages", icon: MessageSquare },
] as const;

const salesChannelItems = [
	{ to: "/dashboard/properties", label: "Properties", icon: Home },
	{ to: "/dashboard/leads", label: "Leads", icon: UserPlus },
	{ to: "/dashboard/transactions", label: "Transactions", icon: Receipt },
	{ to: "/dashboard/discounts", label: "Discounts", icon: Tag },
	{ to: "/dashboard/contacts", label: "Contacts", icon: Contact },
] as const;

const bottomItems = [
	{ to: "/dashboard/settings", label: "Setting", icon: Settings },
	{ to: "/dashboard/help", label: "Help Center", icon: HelpCircle },
	{ to: "/dashboard/feedback", label: "Feedback", icon: MessageCircle },
] as const;

export function NewSidebar() {
	const [isMobileOpen, setIsMobileOpen] = useState(false);
	const location = useLocation();

	const isActive = (path: string) => {
		if (path === "/dashboard") {
			return location.pathname === "/dashboard";
		}
		return location.pathname.startsWith(path);
	};

	return (
		<>
			{/* Mobile menu button */}
			<div className="lg:hidden fixed top-4 left-4 z-50">
				<Button
					isIconOnly
					variant="flat"
					onPress={() => setIsMobileOpen(!isMobileOpen)}
					aria-label="Toggle menu"
					className="bg-white"
				>
					{isMobileOpen ? (
						<X className="w-5 h-5" />
					) : (
						<Menu className="w-5 h-5" />
					)}
				</Button>
			</div>

			{/* Sidebar */}
			<aside
				className={`fixed top-0 left-0 h-screen w-64 bg-gray-50 border-r border-gray-200 z-40 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
					isMobileOpen ? "translate-x-0" : "-translate-x-full"
				}`}
			>
				<div className="flex flex-col h-full">
					{/* Logo/Brand */}
					<div className="p-6 border-b border-gray-200 bg-white">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
								<span className="text-white font-bold text-xl">R</span>
							</div>
							<span className="text-xl font-bold text-gray-900">Rentline</span>
						</div>
					</div>

					{/* Navigation */}
					<nav className="flex-1 p-4 space-y-6 overflow-y-auto">
						{/* Main Menu */}
						<div>
							<p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 mb-3">
								Main Menu
							</p>
							<div className="space-y-1">
								{mainMenuItems.map((item) => {
									const Icon = item.icon;
									const active = isActive(item.to);
									return (
										<NavLink
											key={item.to}
											to={item.to}
											className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
												active
													? "bg-primary text-white font-medium"
													: "text-gray-700 hover:bg-gray-100"
											}`}
											onClick={() => setIsMobileOpen(false)}
										>
											<Icon className="w-5 h-5" />
											<span>{item.label}</span>
										</NavLink>
									);
								})}
							</div>
						</div>

						{/* Sales Channel */}
						<div>
							<p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 mb-3">
								Sales Channel
							</p>
							<div className="space-y-1">
								{salesChannelItems.map((item) => {
									const Icon = item.icon;
									const active = isActive(item.to);
									return (
										<NavLink
											key={item.to}
											to={item.to}
											className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
												active
													? "bg-primary text-white font-medium"
													: "text-gray-700 hover:bg-gray-100"
											}`}
											onClick={() => setIsMobileOpen(false)}
										>
											<Icon className="w-5 h-5" />
											<span>{item.label}</span>
										</NavLink>
									);
								})}
							</div>
						</div>

						{/* Bottom Section */}
						<div className="mt-auto pt-6 border-t border-gray-200">
							<div className="space-y-1">
								{bottomItems.map((item) => {
									const Icon = item.icon;
									const active = isActive(item.to);
									return (
										<NavLink
											key={item.to}
											to={item.to}
											className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
												active
													? "bg-primary text-white font-medium"
													: "text-gray-700 hover:bg-gray-100"
											}`}
											onClick={() => setIsMobileOpen(false)}
										>
											<Icon className="w-5 h-5" />
											<span>{item.label}</span>
										</NavLink>
									);
								})}
							</div>
						</div>
					</nav>
				</div>
			</aside>

			{/* Overlay for mobile */}
			{isMobileOpen && (
				<div
					className="fixed inset-0 bg-black/50 z-30 lg:hidden"
					onClick={() => setIsMobileOpen(false)}
				/>
			)}
		</>
	);
}

