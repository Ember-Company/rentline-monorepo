export type ContactType = "tenant" | "agent" | "owner";

export interface Contact {
	id: string;
	type: string;
	firstName?: string | null;
	lastName?: string | null;
	companyName?: string | null;
	email?: string | null;
	phone?: string | null;
	mobile?: string | null;
	address?: string | null;
	city?: string | null;
	state?: string | null;
	postalCode?: string | null;
	notes?: string | null;
	status?: string | null;
}

export const TAB_LABELS: Record<ContactType, string> = {
	tenant: "Inquilinos",
	agent: "Corretores",
	owner: "Proprietários",
};

export const TYPE_COLORS: Record<
	ContactType,
	"primary" | "secondary" | "success"
> = {
	tenant: "primary",
	agent: "secondary",
	owner: "success",
};

export function getContactName(contact: Contact): string {
	if (contact.companyName) return contact.companyName;
	return (
		`${contact.firstName || ""} ${contact.lastName || ""}`.trim() || "Sem nome"
	);
}

export function getContactInitials(contact: Contact): string {
	if (contact.companyName) {
		return contact.companyName
			.split(" ")
			.map((w) => w[0])
			.join("")
			.toUpperCase()
			.slice(0, 2);
	}
	const first = contact.firstName?.[0] || "";
	const last = contact.lastName?.[0] || "";
	return `${first}${last}`.toUpperCase() || "?";
}
