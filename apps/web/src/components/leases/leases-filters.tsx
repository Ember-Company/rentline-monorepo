import { Button, Input, Select, SelectItem } from "@heroui/react";
import { Filter, Search, X } from "lucide-react";
import type { LeaseStatus, LeaseType } from "./types";
import { leaseStatusConfig, leaseTypeConfig } from "./types";

interface LeasesFiltersProps {
	searchQuery: string;
	onSearchChange: (value: string) => void;
	statusFilter: LeaseStatus | "all";
	onStatusChange: (value: LeaseStatus | "all") => void;
	typeFilter: LeaseType | "all";
	onTypeChange: (value: LeaseType | "all") => void;
	onClearFilters: () => void;
	hasActiveFilters: boolean;
}

export function LeasesFilters({
	searchQuery,
	onSearchChange,
	statusFilter,
	onStatusChange,
	typeFilter,
	onTypeChange,
	onClearFilters,
	hasActiveFilters,
}: LeasesFiltersProps) {
	return (
		<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			<div className="flex flex-1 items-center gap-3">
				<Input
					placeholder="Buscar contratos..."
					value={searchQuery}
					onValueChange={onSearchChange}
					startContent={<Search className="h-4 w-4 text-gray-400" />}
					classNames={{
						base: "max-w-xs",
						inputWrapper: "bg-white border border-gray-200",
					}}
				/>

				<Select
					placeholder="Status"
					selectedKeys={statusFilter === "all" ? [] : [statusFilter]}
					onSelectionChange={(keys) => {
						const value = Array.from(keys)[0] as LeaseStatus | undefined;
						onStatusChange(value || "all");
					}}
					startContent={<Filter className="h-4 w-4 text-gray-400" />}
					classNames={{
						base: "w-40",
						trigger: "bg-white border border-gray-200",
					}}
				>
					<SelectItem key="all">Todos</SelectItem>
					{Object.entries(leaseStatusConfig).map(([key, config]) => (
						<SelectItem key={key}>{config.label}</SelectItem>
					))}
				</Select>

				<Select
					placeholder="Tipo"
					selectedKeys={typeFilter === "all" ? [] : [typeFilter]}
					onSelectionChange={(keys) => {
						const value = Array.from(keys)[0] as LeaseType | undefined;
						onTypeChange(value || "all");
					}}
					classNames={{
						base: "w-48",
						trigger: "bg-white border border-gray-200",
					}}
				>
					<SelectItem key="all">Todos os tipos</SelectItem>
					{Object.entries(leaseTypeConfig).map(([key, config]) => (
						<SelectItem key={key}>{config.label}</SelectItem>
					))}
				</Select>

				{hasActiveFilters && (
					<Button
						variant="light"
						size="sm"
						startContent={<X className="h-4 w-4" />}
						onPress={onClearFilters}
					>
						Limpar
					</Button>
				)}
			</div>
		</div>
	);
}
