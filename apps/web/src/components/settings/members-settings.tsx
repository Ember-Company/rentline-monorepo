import {
	Avatar,
	Button,
	Card,
	CardBody,
	Chip,
	Dropdown,
	DropdownItem,
	DropdownMenu,
	DropdownTrigger,
	Input,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	Select,
	SelectItem,
	Spinner,
	Table,
	TableBody,
	TableCell,
	TableColumn,
	TableHeader,
	TableRow,
} from "@heroui/react";
import { useQueryClient } from "@tanstack/react-query";
import {
	Crown,
	Mail,
	MoreVertical,
	Shield,
	Trash2,
	UserMinus,
	UserPlus,
	Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import {
	ORGANIZATION_DETAILS_QUERY_KEY,
	useOrganizationDetails,
} from "@/hooks/use-organization-details";

type Role = "owner" | "admin" | "member";

const roleConfig: Record<Role, { label: string; color: "warning" | "primary" | "default"; icon: typeof Crown }> = {
	owner: { label: "Proprietário", color: "warning", icon: Crown },
	admin: { label: "Administrador", color: "primary", icon: Shield },
	member: { label: "Membro", color: "default", icon: Users },
};

interface MembersSettingsProps {
	organizationId: string;
}

interface Member {
	id: string;
	userId: string;
	role: Role;
	createdAt: string;
	user: {
		id: string;
		name?: string;
		email: string;
		image?: string;
	};
}

interface Invitation {
	id: string;
	email: string;
	role: Role;
	status: string;
	expiresAt: string;
}

export function MembersSettings({ organizationId }: MembersSettingsProps) {
	const { data: session } = authClient.useSession();
	const queryClient = useQueryClient();
	
	// Use shared React Query hook - prevents duplicate requests
	const {
		data: organization,
		isLoading,
		error,
		refetch: refetchOrganization,
	} = useOrganizationDetails(organizationId);

	const members: Member[] = organization?.members || [];
	const invitations: Invitation[] = organization?.invitations || [];

	const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
	const [inviteEmail, setInviteEmail] = useState("");
	const [inviteRole, setInviteRole] = useState<Role>("member");
	const [isInviting, setIsInviting] = useState(false);
	const [isUpdating, setIsUpdating] = useState<string | null>(null);
	const [isRemoving, setIsRemoving] = useState<string | null>(null);
	const [isCancelling, setIsCancelling] = useState<string | null>(null);

	const pendingInvitations = invitations.filter((inv) => inv.status === "pending");

	const currentUserMember = members.find((m) => m.userId === session?.user?.id);
	const isAdmin = currentUserMember?.role === "owner" || currentUserMember?.role === "admin";

	const handleInvite = async () => {
		if (!inviteEmail.trim()) {
			toast.error("Digite um email válido");
			return;
		}

		setIsInviting(true);
		try {
			const { error } = await authClient.organization.inviteMember({
				organizationId,
				email: inviteEmail.trim(),
				role: inviteRole,
			});

			if (error) {
				throw new Error(typeof error === "string" ? error : error.message || "Falha ao enviar convite");
			}

			toast.success("Convite enviado com sucesso!");
			setInviteEmail("");
			setInviteRole("member");
			setIsInviteModalOpen(false);
			
			// Invalidate organization details query to refetch fresh data
			queryClient.invalidateQueries({
				queryKey: ORGANIZATION_DETAILS_QUERY_KEY(organizationId),
			});
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Falha ao enviar convite");
		} finally {
			setIsInviting(false);
		}
	};

	const handleUpdateRole = async (memberId: string, newRole: Role) => {
		setIsUpdating(memberId);
		try {
			const { error } = await authClient.organization.updateMemberRole({
				organizationId,
				memberId,
				role: newRole,
			});

			if (error) {
				throw new Error(typeof error === "string" ? error : error.message || "Falha ao atualizar cargo");
			}

			toast.success("Cargo atualizado com sucesso!");
			
			// Invalidate organization details query to refetch fresh data
			queryClient.invalidateQueries({
				queryKey: ORGANIZATION_DETAILS_QUERY_KEY(organizationId),
			});
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Falha ao atualizar cargo");
		} finally {
			setIsUpdating(null);
		}
	};

	const handleRemoveMember = async (memberIdOrEmail: string) => {
		if (!confirm("Tem certeza que deseja remover este membro?")) return;

		setIsRemoving(memberIdOrEmail);
		try {
			const { error } = await authClient.organization.removeMember({
				organizationId,
				memberIdOrEmail,
			});

			if (error) {
				throw new Error(typeof error === "string" ? error : error.message || "Falha ao remover membro");
			}

			toast.success("Membro removido com sucesso!");
			
			// Invalidate organization details query to refetch fresh data
			queryClient.invalidateQueries({
				queryKey: ORGANIZATION_DETAILS_QUERY_KEY(organizationId),
			});
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Falha ao remover membro");
		} finally {
			setIsRemoving(null);
		}
	};

	const handleCancelInvitation = async (invitationId: string) => {
		setIsCancelling(invitationId);
		try {
			const { error } = await authClient.organization.cancelInvitation({
				invitationId,
			});

			if (error) {
				throw new Error(typeof error === "string" ? error : error.message || "Falha ao cancelar convite");
			}

			toast.success("Convite cancelado!");
			
			// Invalidate organization details query to refetch fresh data
			queryClient.invalidateQueries({
				queryKey: ORGANIZATION_DETAILS_QUERY_KEY(organizationId),
			});
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Falha ao cancelar convite");
		} finally {
			setIsCancelling(null);
		}
	};

	if (isLoading) {
		return (
			<div className="flex h-64 items-center justify-center">
				<Spinner size="lg" />
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex flex-col items-center justify-center py-12">
				<Users className="mb-4 h-12 w-12 text-default-foreground/50" />
				<p className="text-default-foreground">
					{error instanceof Error ? error.message : "Falha ao carregar membros"}
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h3 className="text-lg font-semibold text-foreground">
						Membros da Equipe
					</h3>
					<p className="text-sm text-default-foreground">
						{members.length} membro{members.length !== 1 ? "s" : ""} na organização
					</p>
				</div>
				{isAdmin && (
					<Button
						color="primary"
						startContent={<UserPlus className="h-4 w-4" />}
						onPress={() => setIsInviteModalOpen(true)}
					>
						Convidar Membro
					</Button>
				)}
			</div>

			{/* Pending Invitations */}
			{pendingInvitations.length > 0 && (
				<Card className="border border-warning-200 bg-warning-50">
					<CardBody className="p-4">
						<div className="mb-3 flex items-center gap-2">
							<Mail className="h-4 w-4 text-warning" />
							<span className="text-sm font-medium text-warning-foreground">
								Convites Pendentes ({pendingInvitations.length})
							</span>
						</div>
						<div className="space-y-2">
							{pendingInvitations.map((invitation) => (
								<div
									key={invitation.id}
									className="flex items-center justify-between rounded-lg bg-content1 p-3"
								>
									<div className="flex items-center gap-3">
										<Avatar name={invitation.email} size="sm" />
										<div>
											<p className="text-sm font-medium text-foreground">
												{invitation.email}
											</p>
											<p className="text-xs text-default-foreground">
												Expira em {new Date(invitation.expiresAt).toLocaleDateString("pt-BR")}
											</p>
										</div>
									</div>
									<div className="flex items-center gap-2">
										<Chip size="sm" variant="flat" color={roleConfig[invitation.role]?.color || "default"}>
											{roleConfig[invitation.role]?.label || invitation.role}
										</Chip>
										{isAdmin && (
											<Button
												isIconOnly
												size="sm"
												variant="light"
												color="danger"
												onPress={() => handleCancelInvitation(invitation.id)}
												isLoading={isCancelling === invitation.id}
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										)}
									</div>
								</div>
							))}
						</div>
					</CardBody>
				</Card>
			)}

			{/* Members Table */}
			<Card className="border border-default-200">
				<Table aria-label="Membros da organização" removeWrapper>
					<TableHeader>
						<TableColumn>MEMBRO</TableColumn>
						<TableColumn>CARGO</TableColumn>
						<TableColumn>DESDE</TableColumn>
						<TableColumn width={80}>AÇÕES</TableColumn>
					</TableHeader>
					<TableBody emptyContent="Nenhum membro encontrado">
						{members.map((member) => {
							const role = roleConfig[member.role] || roleConfig.member;
							const Icon = role.icon;
							const isCurrentUser = member.userId === session?.user?.id;
							const isOwner = member.role === "owner";

							return (
								<TableRow key={member.id}>
									<TableCell>
										<div className="flex items-center gap-3">
											<Avatar
												name={member.user?.name || member.user?.email}
												src={member.user?.image}
												size="sm"
											/>
											<div>
												<p className="font-medium text-foreground">
													{member.user?.name || "Sem nome"}
													{isCurrentUser && (
														<span className="ml-2 text-xs text-default-foreground">(você)</span>
													)}
												</p>
												<p className="text-sm text-default-foreground">
													{member.user?.email}
												</p>
											</div>
										</div>
									</TableCell>
									<TableCell>
										<div className="flex items-center gap-2">
											<Icon className={`h-4 w-4 ${
												role.color === "warning" ? "text-amber-500" :
												role.color === "primary" ? "text-primary" : "text-default-foreground/50"
											}`} />
											<Chip size="sm" variant="flat" color={role.color}>
												{role.label}
											</Chip>
										</div>
									</TableCell>
									<TableCell>
										<span className="text-sm text-default-foreground">
											{new Date(member.createdAt).toLocaleDateString("pt-BR")}
										</span>
									</TableCell>
									<TableCell>
										{isAdmin && !isCurrentUser && !isOwner && (
											<Dropdown placement="bottom-end">
												<DropdownTrigger>
													<Button
														isIconOnly
														size="sm"
														variant="light"
														isLoading={isUpdating === member.id || isRemoving === member.id}
													>
														<MoreVertical className="h-4 w-4" />
													</Button>
												</DropdownTrigger>
												<DropdownMenu aria-label="Ações do membro">
													<DropdownItem
														key="make-admin"
														startContent={<Shield className="h-4 w-4" />}
														onPress={() => handleUpdateRole(member.id, member.role === "admin" ? "member" : "admin")}
													>
														{member.role === "admin" ? "Remover Admin" : "Tornar Admin"}
													</DropdownItem>
													<DropdownItem
														key="remove"
														color="danger"
														startContent={<UserMinus className="h-4 w-4" />}
														onPress={() => handleRemoveMember(member.id)}
													>
														Remover Membro
													</DropdownItem>
												</DropdownMenu>
											</Dropdown>
										)}
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</Card>

			{/* Invite Modal */}
			<Modal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)}>
				<ModalContent>
					<ModalHeader className="flex items-center gap-2">
						<UserPlus className="h-5 w-5 text-primary" />
						<span>Convidar Membro</span>
					</ModalHeader>
					<ModalBody className="space-y-4">
						<p className="text-sm text-default-foreground">
							Envie um convite por email para adicionar um novo membro à sua organização.
						</p>
						<Input
							label="Email"
							type="email"
							placeholder="email@exemplo.com"
							value={inviteEmail}
							onValueChange={setInviteEmail}
							startContent={<Mail className="h-4 w-4 text-default-foreground/50" />}
						/>
						<Select
							label="Cargo"
							selectedKeys={[inviteRole]}
							onSelectionChange={(keys) => setInviteRole(Array.from(keys)[0] as Role)}
							description="Define as permissões do membro"
						>
							<SelectItem key="member" startContent={<Users className="h-4 w-4" />}>
								Membro - Acesso básico
							</SelectItem>
							<SelectItem key="admin" startContent={<Shield className="h-4 w-4" />}>
								Administrador - Gerenciar membros e configurações
							</SelectItem>
						</Select>
					</ModalBody>
					<ModalFooter>
						<Button variant="light" onPress={() => setIsInviteModalOpen(false)}>
							Cancelar
						</Button>
						<Button
							color="primary"
							onPress={handleInvite}
							isLoading={isInviting}
							isDisabled={!inviteEmail.trim()}
						>
							Enviar Convite
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</div>
	);
}
