import {
	Avatar,
	Badge,
	Button,
	Dropdown,
	DropdownItem,
	DropdownMenu,
	DropdownSection,
	DropdownTrigger,
	Input,
	Kbd,
} from "@heroui/react";
import {
	Bell,
	Building2,
	ChevronDown,
	LogOut,
	Plus,
	Search,
	Settings,
	User,
} from "lucide-react";
import { useNavigate } from "react-router";
import { authClient } from "@/lib/auth-client";
import { ThemeCustomizer } from "../theme/theme-customizer";
import { useCustomTheme } from "../theme-provider";

export function DashboardHeader() {
	const { data: session } = authClient.useSession();
	const { sidebarCollapsed } = useCustomTheme();
	const navigate = useNavigate();

	const handleSignOut = async () => {
		await authClient.signOut({
			fetchOptions: {
				onSuccess: () => navigate("/"),
			},
		});
	};

	// Get active organization from session
	const activeOrg = session?.user?.activeOrganizationId
		? // Could fetch org details here
			{ name: "Minha Empresa", slug: "minha-empresa" }
		: null;

	return (
		<header
			className={`sticky top-0 z-20 flex h-14 items-center justify-between gap-4 border-b border-gray-200 bg-white/95 px-4 backdrop-blur dark:border-gray-800 dark:bg-gray-900/95 ${
				sidebarCollapsed ? "lg:pl-20" : "lg:pl-60"
			}`}
		>
			{/* Left side - Search */}
			<div className="flex flex-1 items-center gap-3">
				<div className="hidden max-w-sm flex-1 md:block">
					<Input
						placeholder="Buscar..."
						size="sm"
						startContent={<Search className="h-4 w-4 text-gray-400" />}
						endContent={
							<Kbd className="hidden lg:inline-block" keys={["command"]}>
								K
							</Kbd>
						}
						classNames={{
							inputWrapper:
								"h-9 bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700",
							input: "text-sm",
						}}
					/>
				</div>

				{/* Mobile search button */}
				<Button
					isIconOnly
					variant="light"
					size="sm"
					className="md:hidden"
					aria-label="Buscar"
				>
					<Search className="h-4 w-4" />
				</Button>
			</div>

			{/* Right side - Actions */}
			<div className="flex items-center gap-1">
				{/* Quick Add */}
				<Dropdown placement="bottom-end">
					<DropdownTrigger>
						<Button
							size="sm"
							color="primary"
							variant="flat"
							startContent={<Plus className="h-4 w-4" />}
							className="hidden sm:flex"
						>
							Adicionar
						</Button>
					</DropdownTrigger>
					<DropdownMenu aria-label="Ações rápidas">
						<DropdownItem
							key="property"
							description="Cadastrar novo imóvel"
							onPress={() => navigate("/dashboard/properties/new")}
						>
							Novo Imóvel
						</DropdownItem>
						<DropdownItem
							key="lease"
							description="Criar contrato de locação"
							onPress={() => navigate("/dashboard/leases")}
						>
							Novo Contrato
						</DropdownItem>
						<DropdownItem
							key="contact"
							description="Adicionar inquilino ou proprietário"
							onPress={() => navigate("/dashboard/contacts")}
						>
							Novo Contato
						</DropdownItem>
						<DropdownItem
							key="maintenance"
							description="Registrar solicitação"
							onPress={() => navigate("/dashboard/maintenance")}
						>
							Nova Manutenção
						</DropdownItem>
					</DropdownMenu>
				</Dropdown>

				{/* Mobile quick add */}
				<Button
					isIconOnly
					size="sm"
					color="primary"
					variant="flat"
					className="sm:hidden"
					aria-label="Adicionar"
				>
					<Plus className="h-4 w-4" />
				</Button>

				{/* Theme customizer */}
				<ThemeCustomizer />

				{/* Notifications */}
				<Dropdown placement="bottom-end">
					<DropdownTrigger>
						<Button
							isIconOnly
							variant="light"
							size="sm"
							aria-label="Notificações"
						>
							<Badge
								content=""
								color="danger"
								shape="circle"
								size="sm"
								placement="top-right"
							>
								<Bell className="h-4 w-4" />
							</Badge>
						</Button>
					</DropdownTrigger>
					<DropdownMenu aria-label="Notificações" className="w-80">
						<DropdownSection title="Notificações">
							<DropdownItem
								key="1"
								description="Contrato de João Silva expira em 30 dias"
								className="py-3"
							>
								Contrato expirando
							</DropdownItem>
							<DropdownItem
								key="2"
								description="Pagamento de R$ 2.500 recebido"
								className="py-3"
							>
								Pagamento recebido
							</DropdownItem>
							<DropdownItem
								key="3"
								description="Nova solicitação de manutenção"
								className="py-3"
							>
								Manutenção pendente
							</DropdownItem>
						</DropdownSection>
					</DropdownMenu>
				</Dropdown>

				{/* Organization Switcher */}
				{activeOrg && (
					<Dropdown placement="bottom-end">
						<DropdownTrigger>
							<Button
								variant="light"
								size="sm"
								className="hidden gap-2 px-2 lg:flex"
							>
								<div className="flex h-6 w-6 items-center justify-center rounded bg-primary-100 dark:bg-primary-900/30">
									<Building2 className="h-3 w-3 text-primary" />
								</div>
								<span className="max-w-[100px] truncate text-xs font-medium">
									{activeOrg.name}
								</span>
								<ChevronDown className="h-3 w-3 text-gray-400" />
							</Button>
						</DropdownTrigger>
						<DropdownMenu aria-label="Organizações">
							<DropdownSection title="Organização Ativa">
								<DropdownItem
									key="current"
									startContent={
										<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100">
											<Building2 className="h-4 w-4 text-primary" />
										</div>
									}
								>
									<p className="font-medium">{activeOrg.name}</p>
									<p className="text-xs text-gray-500">{activeOrg.slug}</p>
								</DropdownItem>
							</DropdownSection>
							<DropdownSection>
								<DropdownItem
									key="manage"
									onPress={() => navigate("/dashboard/settings")}
								>
									Gerenciar Organização
								</DropdownItem>
							</DropdownSection>
						</DropdownMenu>
					</Dropdown>
				)}

				{/* User Menu */}
				<Dropdown placement="bottom-end">
					<DropdownTrigger>
						<Button isIconOnly variant="light" size="sm" className="rounded-full">
							<Avatar
								name={session?.user?.name || "U"}
								size="sm"
								className="h-7 w-7"
							/>
						</Button>
					</DropdownTrigger>
					<DropdownMenu
						aria-label="Menu do usuário"
						onAction={(key) => {
							if (key === "logout") handleSignOut();
							else if (key === "settings") navigate("/dashboard/settings");
							else if (key === "profile") navigate("/dashboard/settings");
						}}
					>
						<DropdownSection showDivider>
							<DropdownItem key="info" isReadOnly className="cursor-default">
								<p className="font-medium">{session?.user?.name || "Usuário"}</p>
								<p className="text-xs text-gray-500">{session?.user?.email}</p>
							</DropdownItem>
						</DropdownSection>
						<DropdownSection>
							<DropdownItem key="profile" startContent={<User className="h-4 w-4" />}>
								Meu Perfil
							</DropdownItem>
							<DropdownItem
								key="settings"
								startContent={<Settings className="h-4 w-4" />}
							>
								Configurações
							</DropdownItem>
						</DropdownSection>
						<DropdownSection>
							<DropdownItem
								key="logout"
								color="danger"
								startContent={<LogOut className="h-4 w-4" />}
							>
								Sair
							</DropdownItem>
						</DropdownSection>
					</DropdownMenu>
				</Dropdown>
			</div>
		</header>
	);
}
