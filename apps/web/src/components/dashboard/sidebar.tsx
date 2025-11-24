import { NavLink } from "react-router";
import {
	LayoutDashboard,
	Home,
	Users,
	FileText,
	Wrench,
	DollarSign,
	BarChart3,
	HelpCircle,
	Settings,
	MoreHorizontal,
	Menu,
	X,
	Contact,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@heroui/react";

const navItems = [
	{ to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
	{ to: "/dashboard/properties", label: "Properties", icon: Home },
	{ to: "/dashboard/payments", label: "Payments", icon: FileText },
	{ to: "/dashboard/tenants", label: "Tenants", icon: Users },
	{ to: "/dashboard/maintenance", label: "Maintenance", icon: Wrench },
	{ to: "/dashboard/finances", label: "Finances", icon: DollarSign },
	{ to: "/dashboard/reports", label: "Reports", icon: BarChart3 },
	{ to: "/dashboard/contacts", label: "Contacts", icon: Contact },
	{ to: "/dashboard/others", label: "Others", icon: MoreHorizontal },
	{ to: "/dashboard/help", label: "Help and Support", icon: HelpCircle },
	{ to: "/dashboard/settings", label: "Settings", icon: Settings },
] as const;

export function Sidebar() {
	const [isMobileOpen, setIsMobileOpen] = useState(false);

	return (
		<>
			{/* Mobile menu button */}
			<div className="lg:hidden fixed top-4 left-4 z-50">
				<Button
					isIconOnly
					variant="flat"
					onPress={() => setIsMobileOpen(!isMobileOpen)}
					aria-label="Toggle menu"
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
				className={`fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 z-40 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
					isMobileOpen ? "translate-x-0" : "-translate-x-full"
				}`}
			>
				<div className="flex flex-col h-full">
					{/* Logo/Brand */}
					<div className="p-6 border-b border-gray-200">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
								<div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
									<div className="w-3 h-3 rounded-full bg-white" />
								</div>
							</div>
							<span className="text-xl font-bold text-gray-900">Rentline</span>
						</div>
					</div>

					{/* Navigation */}
					<nav className="flex-1 p-4 space-y-1 overflow-y-auto">
						<p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 mb-3">
							Main Menu
						</p>
						{navItems.map((item) => {
							const Icon = item.icon;
							return (
								<NavLink
									key={item.to}
									to={item.to}
									className={({ isActive }) =>
										`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
											isActive
												? "bg-gray-100 text-primary font-medium"
												: "text-gray-700 hover:bg-gray-50"
										}`
									}
									onClick={() => setIsMobileOpen(false)}
								>
									<Icon className="w-5 h-5" />
									<span>{item.label}</span>
								</NavLink>
							);
						})}
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
