import {
	Avatar,
	Button,
	Card,
	CardBody,
	Chip,
	Divider,
	Input,
	Spinner,
	Switch,
} from "@heroui/react";
import {
	Bell,
	Building2,
	Check,
	CreditCard,
	Key,
	Lock,
	Palette,
	Plus,
	Save,
	Shield,
	User,
	Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import {
	CreateOrganizationModal,
	MembersSettings,
	OrganizationGeneral,
	OrganizationSwitcher,
} from "@/components/settings";
import { ThemeCustomizer } from "@/components/theme/theme-customizer";
import { useCustomTheme } from "@/components/theme-provider";
import { useOrganizations } from "@/hooks/use-organization-management";
import { authClient } from "@/lib/auth-client";
import type { Route } from "./+types/route";

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "Configurações - Rentline" },
		{ name: "description", content: "Gerencie suas configurações" },
	];
}

type SettingsSection =
	| "profile"
	| "organization"
	| "members"
	| "notifications"
	| "security"
	| "appearance"
	| "billing";

const sections: { id: SettingsSection; label: string; icon: typeof User }[] = [
	{ id: "profile", label: "Perfil", icon: User },
	{ id: "organization", label: "Organização", icon: Building2 },
	{ id: "members", label: "Equipe", icon: Users },
	{ id: "appearance", label: "Aparência", icon: Palette },
	{ id: "notifications", label: "Notificações", icon: Bell },
	{ id: "security", label: "Segurança", icon: Shield },
	{ id: "billing", label: "Assinatura", icon: CreditCard },
];

export default function SettingsPage() {
	const [activeSection, setActiveSection] = useState<SettingsSection>("profile");
	const { data: session, isPending: isSessionLoading } = authClient.useSession();
	const { organizations, isLoading: isOrgsLoading } = useOrganizations();
	const [currentOrgId, setCurrentOrgId] = useState<string | null>(null);
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

	// Get active organization ID from session
	useEffect(() => {
		if (session) {
			// Try multiple ways to access activeOrganizationId
			const orgId =
				(session.user as { activeOrganizationId?: string })?.activeOrganizationId ||
				(session.session as { activeOrganizationId?: string })?.activeOrganizationId ||
				null;
			setCurrentOrgId(orgId);
		}
	}, [session]);

	const currentOrg = organizations.find((org) => org.id === currentOrgId);

	const isLoading = isSessionLoading || isOrgsLoading;

	return (
		<div className="mx-auto max-w-6xl">
			{/* Header */}
			<div className="mb-8">
				<h1 className="text-2xl font-bold text-foreground">
					Configurações
				</h1>
				<p className="mt-1 text-default-foreground">
					Gerencie sua conta, organização e preferências
				</p>
			</div>

			<div className="flex flex-col gap-6 lg:flex-row">
				{/* Sidebar Navigation */}
				<aside className="w-full flex-shrink-0 lg:w-64">
					<nav className="space-y-1 rounded-xl border border-default-200 bg-content1 p-2">
						{sections.map((section) => {
							const Icon = section.icon;
							const isActive = activeSection === section.id;
							const needsOrg = section.id === "organization" || section.id === "members";
							const isDisabled = needsOrg && !currentOrgId && !isLoading;

							return (
								<button
									key={section.id}
									type="button"
									onClick={() => !isDisabled && setActiveSection(section.id)}
									disabled={isDisabled}
									className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
										isActive
											? "bg-primary text-white"
											: isDisabled
											? "cursor-not-allowed text-default-foreground/40"
											: "text-default-foreground hover:bg-content2"
									}`}
								>
									<Icon className="h-4 w-4" />
									{section.label}
								</button>
							);
						})}
					</nav>

					{/* Organization Switcher */}
					<div className="mt-4">
						<p className="mb-2 px-1 text-xs font-medium uppercase tracking-wider text-default-foreground">
							Organização Ativa
						</p>
						{isLoading ? (
							<div className="flex items-center justify-center rounded-lg border border-default-200 bg-content1 p-4">
								<Spinner size="sm" />
							</div>
						) : currentOrg ? (
							<OrganizationSwitcher variant="compact" />
						) : (
							<div className="rounded-lg border border-dashed border-default-300 bg-content2 p-4 text-center">
								<Building2 className="mx-auto mb-2 h-8 w-8 text-default-foreground/50" />
								<p className="mb-3 text-sm text-default-foreground">
									Nenhuma organização
								</p>
								<Button
									size="sm"
									color="primary"
									startContent={<Plus className="h-4 w-4" />}
									onPress={() => setIsCreateModalOpen(true)}
								>
									Criar Organização
								</Button>
							</div>
						)}
					</div>
				</aside>

				{/* Main Content */}
				<main className="min-w-0 flex-1">
					<Card className="border border-default-200">
						<CardBody className="p-6">
							{activeSection === "profile" && <ProfileSection />}
							{activeSection === "organization" && (
								currentOrgId ? (
									<OrganizationGeneral organizationId={currentOrgId} />
								) : (
									<NoOrganizationState section="organization" />
								)
							)}
							{activeSection === "members" && (
								currentOrgId ? (
									<MembersSettings organizationId={currentOrgId} />
								) : (
									<NoOrganizationState section="members" />
								)
							)}
							{activeSection === "appearance" && <AppearanceSection />}
							{activeSection === "notifications" && <NotificationsSection />}
							{activeSection === "security" && <SecuritySection />}
							{activeSection === "billing" && <BillingSection />}
						</CardBody>
					</Card>
				</main>
			</div>

			<CreateOrganizationModal
				isOpen={isCreateModalOpen}
				onClose={() => setIsCreateModalOpen(false)}
			/>
		</div>
	);
}

// No Organization State
function NoOrganizationState({ section }: { section: "organization" | "members" }) {
	return (
		<div className="flex flex-col items-center justify-center py-12 text-center">
			<div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-content2">
				{section === "organization" ? (
					<Building2 className="h-8 w-8 text-default-foreground/50" />
				) : (
					<Users className="h-8 w-8 text-default-foreground/50" />
				)}
			</div>
			<h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
				{section === "organization"
					? "Nenhuma Organização Selecionada"
					: "Equipe Não Disponível"}
			</h3>
			<p className="mb-6 max-w-md text-gray-500">
				{section === "organization"
					? "Crie ou selecione uma organização para gerenciar suas configurações."
					: "Você precisa ter uma organização ativa para gerenciar membros da equipe."}
			</p>
			<Button
				color="primary"
				startContent={<Plus className="h-4 w-4" />}
				onPress={() => setIsCreateModalOpen(true)}
			>
				Criar Organização
			</Button>
		</div>
	);
}

// Profile Section
function ProfileSection() {
	const { data: session, isPending } = authClient.useSession();
	const [isUpdating, setIsUpdating] = useState(false);
	const [formData, setFormData] = useState({
		name: session?.user?.name || "",
		email: session?.user?.email || "",
	});

	if (isPending) {
		return (
			<div className="flex h-64 items-center justify-center">
				<Spinner size="lg" />
			</div>
		);
	}

	const handleUpdate = async () => {
		setIsUpdating(true);
		try {
			const { error } = await authClient.updateUser({
				name: formData.name,
			});

			if (error) {
				throw new Error(typeof error === "string" ? error : error.message);
			}

			toast.success("Perfil atualizado com sucesso!");
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Falha ao atualizar perfil");
		} finally {
			setIsUpdating(false);
		}
	};

	return (
		<div className="space-y-6">
			<div>
				<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
					Informações do Perfil
				</h3>
				<p className="text-sm text-gray-500">
					Atualize suas informações pessoais
				</p>
			</div>

			{/* Avatar */}
			<div className="flex items-center gap-4">
				<Avatar
					name={session?.user?.name || "U"}
					src={session?.user?.image || undefined}
					className="h-20 w-20 text-2xl"
				/>
				<div>
					<p className="font-medium text-gray-900 dark:text-white">
						{session?.user?.name || "Usuário"}
					</p>
					<p className="text-sm text-gray-500">{session?.user?.email}</p>
					<Button size="sm" variant="light" className="mt-2">
						Alterar foto
					</Button>
				</div>
			</div>

			<Divider />

			{/* Form */}
			<div className="grid gap-4 sm:grid-cols-2">
				<Input
					label="Nome completo"
					value={formData.name}
					onValueChange={(value) => setFormData({ ...formData, name: value })}
					labelPlacement="outside"
				/>
				<Input
					label="Email"
					value={formData.email}
					isReadOnly
					description="O email não pode ser alterado"
					labelPlacement="outside"
				/>
			</div>

			<div className="flex justify-end border-t border-gray-200 pt-6 dark:border-gray-700">
				<Button
					color="primary"
					startContent={<Save className="h-4 w-4" />}
					onPress={handleUpdate}
					isLoading={isUpdating}
				>
					Salvar Alterações
				</Button>
			</div>
		</div>
	);
}

// Appearance Section
function AppearanceSection() {
	const { compactMode, setCompactMode, accent, setAccent } = useCustomTheme();

	const accentColors = [
		{ value: "blue", label: "Azul", color: "bg-blue-500" },
		{ value: "violet", label: "Violeta", color: "bg-violet-500" },
		{ value: "emerald", label: "Esmeralda", color: "bg-emerald-500" },
		{ value: "amber", label: "Âmbar", color: "bg-amber-500" },
		{ value: "rose", label: "Rosa", color: "bg-rose-500" },
		{ value: "slate", label: "Cinza", color: "bg-slate-500" },
	] as const;

	return (
		<div className="space-y-6">
			<div>
				<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
					Aparência
				</h3>
				<p className="text-sm text-gray-500">
					Personalize a aparência do sistema
				</p>
			</div>

			<div className="space-y-6">
				{/* Theme */}
				<div>
					<p className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
						Tema
					</p>
					<ThemeCustomizer />
				</div>

				<Divider />

				{/* Accent Color */}
				<div>
					<p className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
						Cor de Destaque
					</p>
					<div className="flex flex-wrap gap-3">
						{accentColors.map((color) => (
							<button
								key={color.value}
								type="button"
								onClick={() => setAccent(color.value)}
								className={`group relative flex h-12 w-12 items-center justify-center rounded-xl transition-all ${color.color} ${
									accent === color.value
										? "ring-2 ring-offset-2 ring-gray-400"
										: "hover:scale-105"
								}`}
								title={color.label}
							>
								{accent === color.value && (
									<Check className="h-5 w-5 text-white" />
								)}
							</button>
						))}
					</div>
				</div>

				<Divider />

				{/* Compact Mode */}
				<div className="flex items-center justify-between">
					<div>
						<p className="font-medium text-gray-900 dark:text-white">
							Modo Compacto
						</p>
						<p className="text-sm text-gray-500">
							Reduz o espaçamento para mostrar mais conteúdo
						</p>
					</div>
					<Switch isSelected={compactMode} onValueChange={setCompactMode} />
				</div>
			</div>
		</div>
	);
}

// Notifications Section
function NotificationsSection() {
	const [notifications, setNotifications] = useState({
		emailNotifications: true,
		smsNotifications: false,
		rentReminders: true,
		maintenanceAlerts: true,
		paymentReceipts: true,
		weeklyReport: false,
	});

	return (
		<div className="space-y-6">
			<div>
				<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
					Notificações
				</h3>
				<p className="text-sm text-gray-500">
					Configure como você deseja ser notificado
				</p>
			</div>

			<div className="space-y-4">
				<NotificationToggle
					title="Notificações por Email"
					description="Receba atualizações importantes por email"
					isSelected={notifications.emailNotifications}
					onValueChange={(value) =>
						setNotifications({ ...notifications, emailNotifications: value })
					}
				/>
				<NotificationToggle
					title="Notificações por SMS"
					description="Receba alertas urgentes via SMS"
					isSelected={notifications.smsNotifications}
					onValueChange={(value) =>
						setNotifications({ ...notifications, smsNotifications: value })
					}
				/>
				<Divider />
				<NotificationToggle
					title="Lembretes de Aluguel"
					description="Lembrete quando pagamentos estiverem próximos"
					isSelected={notifications.rentReminders}
					onValueChange={(value) =>
						setNotifications({ ...notifications, rentReminders: value })
					}
				/>
				<NotificationToggle
					title="Alertas de Manutenção"
					description="Notificação quando houver novas solicitações"
					isSelected={notifications.maintenanceAlerts}
					onValueChange={(value) =>
						setNotifications({ ...notifications, maintenanceAlerts: value })
					}
				/>
				<NotificationToggle
					title="Recibos de Pagamento"
					description="Enviar recibo automaticamente após pagamento"
					isSelected={notifications.paymentReceipts}
					onValueChange={(value) =>
						setNotifications({ ...notifications, paymentReceipts: value })
					}
				/>
				<NotificationToggle
					title="Relatório Semanal"
					description="Resumo semanal das atividades"
					isSelected={notifications.weeklyReport}
					onValueChange={(value) =>
						setNotifications({ ...notifications, weeklyReport: value })
					}
				/>
			</div>

			<div className="flex justify-end border-t border-gray-200 pt-6 dark:border-gray-700">
				<Button
					color="primary"
					startContent={<Save className="h-4 w-4" />}
					onPress={() => toast.success("Preferências salvas!")}
				>
					Salvar Preferências
				</Button>
			</div>
		</div>
	);
}

function NotificationToggle({
	title,
	description,
	isSelected,
	onValueChange,
}: {
	title: string;
	description: string;
	isSelected: boolean;
	onValueChange: (value: boolean) => void;
}) {
	return (
		<div className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700">
			<div>
				<p className="font-medium text-gray-900 dark:text-white">{title}</p>
				<p className="text-sm text-gray-500">{description}</p>
			</div>
			<Switch isSelected={isSelected} onValueChange={onValueChange} />
		</div>
	);
}

// Security Section
function SecuritySection() {
	const [isChangingPassword, setIsChangingPassword] = useState(false);
	const [passwords, setPasswords] = useState({
		current: "",
		new: "",
		confirm: "",
	});
	const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

	const handleChangePassword = async () => {
		if (passwords.new !== passwords.confirm) {
			toast.error("As senhas não coincidem");
			return;
		}

		if (passwords.new.length < 8) {
			toast.error("A nova senha deve ter pelo menos 8 caracteres");
			return;
		}

		setIsChangingPassword(true);
		try {
			const { error } = await authClient.changePassword({
				currentPassword: passwords.current,
				newPassword: passwords.new,
			});

			if (error) {
				throw new Error(typeof error === "string" ? error : error.message);
			}

			toast.success("Senha alterada com sucesso!");
			setPasswords({ current: "", new: "", confirm: "" });
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Falha ao alterar senha");
		} finally {
			setIsChangingPassword(false);
		}
	};

	return (
		<div className="space-y-6">
			<div>
				<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
					Segurança
				</h3>
				<p className="text-sm text-gray-500">
					Proteja sua conta com configurações de segurança
				</p>
			</div>

			{/* Password Change */}
			<div className="space-y-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
				<div className="flex items-center gap-2">
					<Key className="h-5 w-5 text-primary" />
					<h4 className="font-medium text-gray-900 dark:text-white">
						Alterar Senha
					</h4>
				</div>

				<div className="grid gap-4 sm:grid-cols-3">
					<Input
						type="password"
						label="Senha atual"
						value={passwords.current}
						onValueChange={(value) =>
							setPasswords({ ...passwords, current: value })
						}
						labelPlacement="outside"
					/>
					<Input
						type="password"
						label="Nova senha"
						value={passwords.new}
						onValueChange={(value) =>
							setPasswords({ ...passwords, new: value })
						}
						labelPlacement="outside"
					/>
					<Input
						type="password"
						label="Confirmar senha"
						value={passwords.confirm}
						onValueChange={(value) =>
							setPasswords({ ...passwords, confirm: value })
						}
						labelPlacement="outside"
					/>
				</div>

				<Button
					color="primary"
					variant="flat"
					startContent={<Lock className="h-4 w-4" />}
					onPress={handleChangePassword}
					isLoading={isChangingPassword}
					isDisabled={!passwords.current || !passwords.new || !passwords.confirm}
				>
					Alterar Senha
				</Button>
			</div>

			<Divider />

			{/* Two-Factor Auth */}
			<div className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700">
				<div className="flex items-center gap-4">
					<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
						<Shield className="h-5 w-5 text-primary" />
					</div>
					<div>
						<p className="font-medium text-gray-900 dark:text-white">
							Autenticação de Dois Fatores
						</p>
						<p className="text-sm text-gray-500">
							Adicione uma camada extra de segurança à sua conta
						</p>
					</div>
				</div>
				<Switch
					isSelected={twoFactorEnabled}
					onValueChange={(value) => {
						setTwoFactorEnabled(value);
						toast.info(
							value
								? "2FA habilitado (em desenvolvimento)"
								: "2FA desabilitado"
						);
					}}
				/>
			</div>
		</div>
	);
}

// Billing Section
function BillingSection() {
	return (
		<div className="space-y-6">
			<div>
				<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
					Assinatura
				</h3>
				<p className="text-sm text-gray-500">
					Gerencie seu plano e formas de pagamento
				</p>
			</div>

			{/* Current Plan */}
			<div className="rounded-xl border-2 border-primary bg-primary/5 p-6">
				<div className="flex items-start justify-between">
					<div>
						<div className="flex items-center gap-2">
							<h4 className="text-xl font-bold text-gray-900 dark:text-white">
								Plano Profissional
							</h4>
							<Chip color="primary" size="sm" variant="flat">
								Ativo
							</Chip>
						</div>
						<p className="mt-1 text-gray-500">
							Acesso completo a todos os recursos
						</p>
						<p className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
							R$ 79<span className="text-base font-normal text-gray-500">/mês</span>
						</p>
					</div>
					<Button color="primary" variant="flat">
						Alterar Plano
					</Button>
				</div>

				<Divider className="my-4" />

				<div className="grid gap-3 sm:grid-cols-3">
					{[
						"Imóveis ilimitados",
						"Contratos ilimitados",
						"5 usuários inclusos",
						"Relatórios avançados",
						"Suporte prioritário",
						"Integrações premium",
					].map((feature) => (
						<div key={feature} className="flex items-center gap-2">
							<Check className="h-4 w-4 text-primary" />
							<span className="text-sm text-gray-600 dark:text-gray-400">
								{feature}
							</span>
						</div>
					))}
				</div>
			</div>

			{/* Payment Method */}
			<div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-14 items-center justify-center rounded bg-gray-100 dark:bg-gray-700">
							<CreditCard className="h-5 w-5 text-gray-500" />
						</div>
						<div>
							<p className="font-medium text-gray-900 dark:text-white">
								•••• •••• •••• 4242
							</p>
							<p className="text-sm text-gray-500">Expira em 12/25</p>
						</div>
					</div>
					<Button size="sm" variant="light">
						Atualizar
					</Button>
				</div>
			</div>

			{/* Billing History */}
			<div>
				<h4 className="mb-3 font-medium text-gray-900 dark:text-white">
					Histórico de Cobranças
				</h4>
				<div className="space-y-2">
					{[
						{ date: "15 Jan 2024", amount: "R$ 79,00", status: "Pago" },
						{ date: "15 Dez 2023", amount: "R$ 79,00", status: "Pago" },
						{ date: "15 Nov 2023", amount: "R$ 79,00", status: "Pago" },
					].map((invoice, i) => (
						<div
							key={i}
							className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700"
						>
							<div>
								<p className="font-medium text-gray-900 dark:text-white">
									{invoice.date}
								</p>
								<p className="text-sm text-gray-500">{invoice.amount}</p>
							</div>
							<div className="flex items-center gap-2">
								<Chip size="sm" color="success" variant="flat">
									{invoice.status}
								</Chip>
								<Button size="sm" variant="light">
									Baixar
								</Button>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
