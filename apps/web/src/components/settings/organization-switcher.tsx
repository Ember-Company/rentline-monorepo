import {
	Avatar,
	Button,
	Modal,
	ModalBody,
	ModalContent,
	ModalHeader,
	Spinner,
} from "@heroui/react";
import { Building2, Check, ChevronRight, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { useOrganizations } from "@/hooks/use-organization-management";
import { CreateOrganizationModal } from "./create-organization-modal";

interface Organization {
	id: string;
	name: string;
	slug: string;
	logo?: string | null;
}

interface OrganizationSwitcherProps {
	variant?: "full" | "compact";
	showCreateButton?: boolean;
}

export function OrganizationSwitcher({
	variant = "full",
	showCreateButton = true,
}: OrganizationSwitcherProps) {
	const { data: session } = authClient.useSession();
	const { organizations, isLoading, switchOrganization, isSwitching } = useOrganizations();

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [currentOrgId, setCurrentOrgId] = useState<string | null>(null);

	// Get active organization ID from session
	useEffect(() => {
		if (session) {
			// Try multiple ways to access activeOrganizationId
			const orgId =
				(session.user as { activeOrganizationId?: string })?.activeOrganizationId ||
				(session.session as { activeOrganizationId?: string })?.activeOrganizationId ||
				null;
			
			setCurrentOrgId(orgId);
			
			// Debug logging
			if (process.env.NODE_ENV === "development") {
				console.log("Session data:", {
					user: session.user,
					session: session.session,
					activeOrgId: orgId,
				});
			}
		}
	}, [session]);

	const currentOrg = organizations.find((org) => org.id === currentOrgId);

	const handleSwitch = async (orgId: string) => {
		if (orgId === currentOrgId) {
			setIsModalOpen(false);
			return;
		}

		// Close modal immediately for better UX
		setIsModalOpen(false);

		try {
			await switchOrganization(orgId);
		} catch {
			// Error handled in hook
		}
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
				<Spinner size="sm" />
			</div>
		);
	}

	if (variant === "compact") {
		return (
			<>
				<button
					type="button"
					onClick={() => setIsModalOpen(true)}
					className="flex w-full items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 text-left transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
				>
					<Avatar
						name={currentOrg?.name || "O"}
						src={currentOrg?.logo || undefined}
						size="sm"
						className="flex-shrink-0"
						classNames={{
							base: "bg-primary/10",
							name: "text-primary font-semibold",
						}}
					/>
					<div className="min-w-0 flex-1">
						<p className="truncate text-sm font-medium text-gray-900 dark:text-white">
							{currentOrg?.name || "Selecione"}
						</p>
						<p className="truncate text-xs text-gray-500">
							{currentOrg?.slug || "Nenhuma organização"}
						</p>
					</div>
					<ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-400" />
				</button>

				<Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="md">
					<ModalContent>
						<ModalHeader className="flex items-center gap-2">
							<Building2 className="h-5 w-5 text-primary" />
							Trocar Organização
						</ModalHeader>
						<ModalBody className="pb-6">
							<OrganizationList
								organizations={organizations}
								currentOrgId={currentOrgId}
								isSwitching={isSwitching}
								onSwitch={handleSwitch}
								showCreateButton={showCreateButton}
								onCreate={() => {
									setIsModalOpen(false);
									setIsCreateModalOpen(true);
								}}
							/>
						</ModalBody>
					</ModalContent>
				</Modal>

				<CreateOrganizationModal
					isOpen={isCreateModalOpen}
					onClose={() => setIsCreateModalOpen(false)}
				/>
			</>
		);
	}

	return (
		<>
		<div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
			<div className="mb-4 flex items-center justify-between">
				<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
					Organizações
				</h3>
				<span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
					{organizations.length}
				</span>
			</div>

			<OrganizationList
				organizations={organizations}
				currentOrgId={currentOrgId}
				isSwitching={isSwitching}
				onSwitch={handleSwitch}
				showCreateButton={showCreateButton}
				onCreate={() => setIsCreateModalOpen(true)}
			/>
		</div>

		<CreateOrganizationModal
			isOpen={isCreateModalOpen}
			onClose={() => setIsCreateModalOpen(false)}
		/>
		</>
	);
}

interface OrganizationListProps {
	organizations: Organization[];
	currentOrgId?: string | null;
	isSwitching: boolean;
	onSwitch: (orgId: string) => void;
	showCreateButton: boolean;
	onCreate: () => void;
}

function OrganizationList({
	organizations,
	currentOrgId,
	isSwitching,
	onSwitch,
	showCreateButton,
	onCreate,
}: OrganizationListProps) {
	return (
		<div className="space-y-2">
			{organizations.length > 0 ? (
				organizations.map((org) => {
					const isCurrent = org.id === currentOrgId;

					return (
						<button
							key={org.id}
							type="button"
							onClick={() => onSwitch(org.id)}
							disabled={isSwitching}
							className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all ${
								isCurrent
									? "border-primary bg-primary-50 dark:bg-primary-900/20"
									: "border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-800"
							} ${isSwitching ? "opacity-50" : ""}`}
						>
							<Avatar
								name={org.name}
								src={org.logo || undefined}
								size="sm"
								className="flex-shrink-0"
								classNames={{
									base: isCurrent ? "bg-primary" : "bg-gray-100 dark:bg-gray-700",
									name: isCurrent ? "text-white font-semibold" : "text-gray-600 dark:text-gray-300",
								}}
							/>
							<div className="min-w-0 flex-1">
								<p
									className={`truncate text-sm font-medium ${
										isCurrent ? "text-primary" : "text-gray-900 dark:text-white"
									}`}
								>
									{org.name}
								</p>
								<p className="truncate text-xs text-gray-500">{org.slug}</p>
							</div>
							{isCurrent && (
								<div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
									<Check className="h-3 w-3 text-white" />
								</div>
							)}
						</button>
					);
				})
			) : (
				<div className="rounded-lg border-2 border-dashed border-gray-200 p-6 text-center dark:border-gray-700">
					<Building2 className="mx-auto mb-2 h-10 w-10 text-gray-400" />
					<p className="mb-1 font-medium text-gray-700 dark:text-gray-300">
						Nenhuma organização
					</p>
					<p className="text-sm text-gray-500">
						Crie uma organização para começar
					</p>
				</div>
			)}

			{showCreateButton && (
				<Button
					variant="flat"
					color="primary"
					className="mt-2 w-full"
					startContent={<Plus className="h-4 w-4" />}
					onPress={onCreate}
				>
					Criar Nova Organização
				</Button>
			)}
		</div>
	);
}
