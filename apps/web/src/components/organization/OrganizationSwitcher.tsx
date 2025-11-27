import {
	Button,
	Dropdown,
	DropdownItem,
	DropdownMenu,
	DropdownTrigger,
} from "@heroui/react";
import { Building2, Check, ChevronDown, Plus } from "lucide-react";
import { useState } from "react";
import { useOrganizations } from "@/hooks/use-organization-management";
import { authClient } from "@/lib/auth-client";
import { CreateOrganizationModal } from "./CreateOrganizationModal";

export function OrganizationSwitcher() {
	const { data: session } = authClient.useSession();
	const { organizations, isLoading, switchOrganization, isSwitching } =
		useOrganizations();
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

	const currentOrgId = session?.user?.activeOrganizationId;
	const currentOrg = organizations.find((org) => org.id === currentOrgId);

	if (isLoading) {
		return (
			<Button variant="light" isLoading className="text-gray-600">
				Loading...
			</Button>
		);
	}

	if (organizations.length === 0) {
		return (
			<>
				<Button
					color="primary"
					startContent={<Plus className="h-4 w-4" />}
					onPress={() => setIsCreateModalOpen(true)}
				>
					Create Organization
				</Button>
				<CreateOrganizationModal
					isOpen={isCreateModalOpen}
					onClose={() => setIsCreateModalOpen(false)}
				/>
			</>
		);
	}

	return (
		<>
			<Dropdown placement="bottom-start">
				<DropdownTrigger>
					<Button
						variant="light"
						className="text-gray-600"
						startContent={<Building2 className="h-4 w-4" />}
						endContent={<ChevronDown className="h-4 w-4" />}
						isLoading={isSwitching}
					>
						{currentOrg?.name || "Select Organization"}
					</Button>
				</DropdownTrigger>
				<DropdownMenu
					aria-label="Organization selection"
					selectedKeys={currentOrgId ? [currentOrgId] : []}
					onAction={(key) => {
						if (key === "create") {
							setIsCreateModalOpen(true);
						} else {
							switchOrganization(key as string);
						}
					}}
				>
					{organizations.map((org) => (
						<DropdownItem
							key={org.id}
							startContent={
								currentOrgId === org.id ? (
									<Check className="h-4 w-4 text-primary" />
								) : (
									<div className="h-4 w-4" />
								)
							}
						>
							<div className="flex flex-col">
								<span className="font-medium">{org.name}</span>
								{org.slug && (
									<span className="text-gray-500 text-xs">{org.slug}</span>
								)}
							</div>
						</DropdownItem>
					))}
					<DropdownItem
						key="create"
						startContent={<Plus className="h-4 w-4" />}
						className="text-primary"
					>
						Create New Organization
					</DropdownItem>
				</DropdownMenu>
			</Dropdown>
			<CreateOrganizationModal
				isOpen={isCreateModalOpen}
				onClose={() => setIsCreateModalOpen(false)}
			/>
		</>
	);
}
