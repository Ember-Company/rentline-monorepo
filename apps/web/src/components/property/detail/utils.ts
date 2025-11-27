import { Briefcase, Building2, Home, Mountain } from "lucide-react";
import type { PropertyStatus, PropertyType, UnitStatus } from "./types";

export function getPropertyIcon(type: PropertyType) {
	switch (type) {
		case "apartment_building":
			return Building2;
		case "house":
			return Home;
		case "office":
			return Briefcase;
		case "land":
			return Mountain;
		default:
			return Home;
	}
}

export function getStatusColor(status: PropertyStatus) {
	switch (status) {
		case "active":
			return "success";
		case "rented":
			return "primary";
		case "sold":
			return "secondary";
		case "inactive":
			return "default";
		default:
			return "default";
	}
}

export function getUnitStatusColor(status: UnitStatus) {
	switch (status) {
		case "available":
			return "success";
		case "occupied":
			return "primary";
		case "maintenance":
			return "warning";
		case "reserved":
			return "secondary";
		default:
			return "default";
	}
}

export function getLeaseStatusColor(status: string) {
	switch (status) {
		case "active":
			return "success";
		case "pending":
			return "warning";
		case "expired":
			return "danger";
		default:
			return "default";
	}
}

export function getLeaseStatusLabel(status: string) {
	switch (status) {
		case "active":
			return "Ativo";
		case "pending":
			return "Pendente";
		case "expired":
			return "Expirado";
		default:
			return status;
	}
}

export function getMaintenancePriorityColor(priority: string) {
	switch (priority) {
		case "urgent":
			return "danger";
		case "high":
			return "warning";
		case "medium":
			return "default";
		case "low":
			return "default";
		default:
			return "default";
	}
}

export function getMaintenancePriorityLabel(priority: string) {
	switch (priority) {
		case "urgent":
			return "Urgente";
		case "high":
			return "Alta";
		case "medium":
			return "Média";
		case "low":
			return "Baixa";
		default:
			return priority;
	}
}

export function getMaintenanceStatusColor(status: string) {
	switch (status) {
		case "closed":
			return "success";
		case "in_progress":
			return "warning";
		case "open":
			return "default";
		default:
			return "default";
	}
}

export function getMaintenanceStatusLabel(status: string) {
	switch (status) {
		case "closed":
			return "Concluído";
		case "in_progress":
			return "Em Andamento";
		case "open":
			return "Aberto";
		default:
			return status;
	}
}

export function getCategoryLabel(category: string) {
	switch (category) {
		case "maintenance":
			return "Manutenção";
		case "utilities":
			return "Utilidades";
		case "tax":
			return "Impostos";
		case "insurance":
			return "Seguro";
		case "repairs":
			return "Reparos";
		case "supplies":
			return "Suprimentos";
		default:
			return category;
	}
}

export function getContactTypeLabel(type: string) {
	switch (type) {
		case "tenant":
			return "Inquilino";
		case "agent":
			return "Corretor";
		case "owner":
			return "Proprietário";
		default:
			return type;
	}
}
