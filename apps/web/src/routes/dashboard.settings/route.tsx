import type { Route } from "./+types/route";
import {
	Card,
	CardBody,
	CardHeader,
	Button,
	Input,
	Tabs,
	Tab,
	Switch,
	Select,
	SelectItem,
	Chip,
} from "@heroui/react";
import { User, Bell, Shield, CreditCard, Building2 } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { useState } from "react";
import { ProfileSettings } from "@/components/profile/ProfileSettings";
import { OrganizationSettings } from "@/components/organization/OrganizationSettings";
import { Label } from "@/components/ui/label";

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "Settings - Rentline" },
		{ name: "description", content: "Manage your account settings" },
	];
}

export default function SettingsPage() {
	const [selectedTab, setSelectedTab] = useState("profile");

	const [notifications, setNotifications] = useState({
		emailNotifications: true,
		smsNotifications: false,
		rentReminders: true,
		maintenanceAlerts: true,
		paymentReceipts: true,
	});

	const [security, setSecurity] = useState({
		twoFactorEnabled: false,
		sessionTimeout: "30",
	});

	return (
		<div className="space-y-6">
			<PageHeader
				title="Settings"
				subtitle="Manage your account and preferences"
			/>

			<Tabs
				selectedKey={selectedTab}
				onSelectionChange={(key) => setSelectedTab(key as string)}
				aria-label="Settings tabs"
			>
				<Tab
					key="profile"
					title={
						<div className="flex items-center gap-2">
							<User className="w-4 h-4" />
							<span>Profile</span>
						</div>
					}
				>
					<ProfileSettings />
				</Tab>

				<Tab
					key="organization"
					title={
						<div className="flex items-center gap-2">
							<Building2 className="w-4 h-4" />
							<span>Organization</span>
						</div>
					}
				>
					<OrganizationSettings />
				</Tab>

				<Tab
					key="notifications"
					title={
						<div className="flex items-center gap-2">
							<Bell className="w-4 h-4" />
							<span>Notifications</span>
						</div>
					}
				>
					<Card className="border border-gray-200 shadow-sm">
						<CardHeader>
							<h2 className="text-xl font-semibold">
								Notification Preferences
							</h2>
							<p className="text-sm text-muted-foreground">
								Choose how you want to be notified
							</p>
						</CardHeader>
						<CardBody className="space-y-6">
							<div className="flex justify-between items-center">
								<div>
									<p className="font-medium">Email Notifications</p>
									<p className="text-sm text-muted-foreground">
										Receive notifications via email
									</p>
								</div>
								<Switch
									isSelected={notifications.emailNotifications}
									onValueChange={(value) =>
										setNotifications({
											...notifications,
											emailNotifications: value,
										})
									}
								/>
							</div>
							<div className="flex justify-between items-center">
								<div>
									<p className="font-medium">SMS Notifications</p>
									<p className="text-sm text-muted-foreground">
										Receive notifications via SMS
									</p>
								</div>
								<Switch
									isSelected={notifications.smsNotifications}
									onValueChange={(value) =>
										setNotifications({
											...notifications,
											smsNotifications: value,
										})
									}
								/>
							</div>
							<div className="flex justify-between items-center">
								<div>
									<p className="font-medium">Rent Reminders</p>
									<p className="text-sm text-muted-foreground">
										Get reminded about upcoming rent payments
									</p>
								</div>
								<Switch
									isSelected={notifications.rentReminders}
									onValueChange={(value) =>
										setNotifications({
											...notifications,
											rentReminders: value,
										})
									}
								/>
							</div>
							<div className="flex justify-between items-center">
								<div>
									<p className="font-medium">Maintenance Alerts</p>
									<p className="text-sm text-muted-foreground">
										Get notified about maintenance requests
									</p>
								</div>
								<Switch
									isSelected={notifications.maintenanceAlerts}
									onValueChange={(value) =>
										setNotifications({
											...notifications,
											maintenanceAlerts: value,
										})
									}
								/>
							</div>
							<div className="flex justify-between items-center">
								<div>
									<p className="font-medium">Payment Receipts</p>
									<p className="text-sm text-muted-foreground">
										Automatically send payment receipts
									</p>
								</div>
								<Switch
									isSelected={notifications.paymentReceipts}
									onValueChange={(value) =>
										setNotifications({
											...notifications,
											paymentReceipts: value,
										})
									}
								/>
							</div>
							<div className="flex justify-end pt-4">
								<Button color="primary">Save Changes</Button>
							</div>
						</CardBody>
					</Card>
				</Tab>

				<Tab
					key="security"
					title={
						<div className="flex items-center gap-2">
							<Shield className="w-4 h-4" />
							<span>Security</span>
						</div>
					}
				>
					<Card className="border border-gray-200 shadow-sm">
						<CardHeader>
							<h2 className="text-xl font-semibold">Security Settings</h2>
							<p className="text-sm text-muted-foreground">
								Manage your account security
							</p>
						</CardHeader>
						<CardBody className="space-y-6">
							<div>
								<Label htmlFor="current-password">Current Password</Label>
								<Input
									id="current-password"
									type="password"
									className="mt-2"
									placeholder="Enter current password"
								/>
							</div>
							<div>
								<Label htmlFor="new-password">New Password</Label>
								<Input
									id="new-password"
									type="password"
									className="mt-2"
									placeholder="Enter new password"
								/>
							</div>
							<div>
								<Label htmlFor="confirm-password">Confirm New Password</Label>
								<Input
									id="confirm-password"
									type="password"
									className="mt-2"
									placeholder="Confirm new password"
								/>
							</div>
							<div className="flex justify-between items-center pt-4">
								<div>
									<p className="font-medium">Two-Factor Authentication</p>
									<p className="text-sm text-muted-foreground">
										Add an extra layer of security to your account
									</p>
								</div>
								<Switch
									isSelected={security.twoFactorEnabled}
									onValueChange={(value) =>
										setSecurity({ ...security, twoFactorEnabled: value })
									}
								/>
							</div>
							<div>
								<Label htmlFor="session-timeout">Session Timeout</Label>
								<Select
									selectedKeys={[security.sessionTimeout]}
									onSelectionChange={(keys) =>
										setSecurity({
											...security,
											sessionTimeout: Array.from(keys)[0] as string,
										})
									}
									className="mt-2"
								>
									<SelectItem key="15" value="15">
										15 minutes
									</SelectItem>
									<SelectItem key="30" value="30">
										30 minutes
									</SelectItem>
									<SelectItem key="60" value="60">
										1 hour
									</SelectItem>
									<SelectItem key="120" value="120">
										2 hours
									</SelectItem>
								</Select>
							</div>
							<div className="flex justify-end pt-4">
								<Button color="primary">Save Changes</Button>
							</div>
						</CardBody>
					</Card>
				</Tab>

				<Tab
					key="billing"
					title={
						<div className="flex items-center gap-2">
							<CreditCard className="w-4 h-4" />
							<span>Billing</span>
						</div>
					}
				>
					<Card className="border border-gray-200 shadow-sm">
						<CardHeader>
							<h2 className="text-xl font-semibold">Billing & Subscription</h2>
							<p className="text-sm text-muted-foreground">
								Manage your subscription and payment methods
							</p>
						</CardHeader>
						<CardBody className="space-y-6">
							<div>
								<h3 className="font-semibold mb-2">Current Plan</h3>
								<div className="p-4 border rounded-lg">
									<div className="flex justify-between items-center">
										<div>
											<p className="font-semibold">Professional</p>
											<p className="text-sm text-muted-foreground">$79/month</p>
										</div>
										<Chip color="primary" variant="flat">
											Active
										</Chip>
									</div>
								</div>
							</div>
							<div>
								<h3 className="font-semibold mb-2">Payment Method</h3>
								<div className="p-4 border rounded-lg">
									<div className="flex justify-between items-center">
										<div>
											<p className="font-medium">•••• •••• •••• 4242</p>
											<p className="text-sm text-muted-foreground">
												Expires 12/25
											</p>
										</div>
										<Button variant="light" size="sm">
											Update
										</Button>
									</div>
								</div>
							</div>
							<div>
								<h3 className="font-semibold mb-2">Billing History</h3>
								<div className="space-y-2">
									<div className="flex justify-between items-center p-3 border rounded">
										<div>
											<p className="font-medium">January 2024</p>
											<p className="text-sm text-muted-foreground">
												Jan 15, 2024
											</p>
										</div>
										<div className="text-right">
											<p className="font-semibold">$79.00</p>
											<p className="text-sm text-success">Paid</p>
										</div>
									</div>
									<div className="flex justify-between items-center p-3 border rounded">
										<div>
											<p className="font-medium">December 2023</p>
											<p className="text-sm text-muted-foreground">
												Dec 15, 2023
											</p>
										</div>
										<div className="text-right">
											<p className="font-semibold">$79.00</p>
											<p className="text-sm text-success">Paid</p>
										</div>
									</div>
								</div>
							</div>
							<div className="flex justify-end pt-4">
								<Button variant="bordered">Change Plan</Button>
							</div>
						</CardBody>
					</Card>
				</Tab>
			</Tabs>
		</div>
	);
}
