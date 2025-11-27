import {
	Button,
	Card,
	CardBody,
	Chip,
	Dropdown,
	DropdownItem,
	DropdownMenu,
	DropdownTrigger,
	Input,
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
import {
	Briefcase,
	Building2,
	Eye,
	Home,
	MoreVertical,
	Mountain,
	Pencil,
	Plus,
	Search,
	Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { CrudModal } from "@/components/dashboard/crud-modal";
import {
	formatBRL,
	PROPERTY_CATEGORY_LABELS,
	PROPERTY_STATUS_LABELS,
	PROPERTY_TYPE_LABELS,
} from "@/lib/constants/brazil";
import { useDeleteProperty, useProperties } from "@/lib/hooks";
import type {
	PropertyCategory,
	PropertyStatus,
	PropertyType,
} from "@/lib/types/api";
import { formatCurrency } from "@/lib/utils/format";
import type { Route } from "./+types/route";

export function meta(_args: Route.MetaArgs) {
	return [
		{ title: "Imóveis - Rentline" },
		{ name: "description", content: "Gerencie seus imóveis" },
	];
}

type FilterType =
	| "all"
	| "apartment_building"
	| "house"
	| "office"
	| "land"
	| "rent"
	| "sale";

export default function PropertiesPage() {
	const navigate = useNavigate();
	const [searchQuery, setSearchQuery] = useState("");
	const [activeFilter, setActiveFilter] = useState<FilterType>("all");
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(
		null,
	);
	const [currentPage, setCurrentPage] = useState(1);
	const [rowsPerPage, setRowsPerPage] = useState(10);

	// Build query params based on filter
	const queryInput = useMemo(() => {
		const input: {
			type?: PropertyType;
			category?: PropertyCategory;
			search?: string;
			limit: number;
			offset: number;
		} = {
			limit: rowsPerPage,
			offset: (currentPage - 1) * rowsPerPage,
		};

		if (searchQuery) {
			input.search = searchQuery;
		}

		// Property type filters
		if (
			["apartment_building", "house", "office", "land"].includes(activeFilter)
		) {
			input.type = activeFilter as PropertyType;
		}

		// Category filters
		if (activeFilter === "rent") {
			input.category = "rent";
		} else if (activeFilter === "sale") {
			input.category = "sale";
		}

		return input;
	}, [searchQuery, activeFilter, rowsPerPage, currentPage]);

	// Fetch properties from backend
	const {
		data: propertiesData,
		isLoading,
		error,
		refetch,
	} = useProperties(queryInput);
	const deleteProperty = useDeleteProperty();

	const properties = propertiesData?.properties ?? [];
	const total = propertiesData?.total ?? 0;
	const totalPages = Math.ceil(total / rowsPerPage);

	const handleDelete = (propertyId: string) => {
		setSelectedPropertyId(propertyId);
		setIsDeleteModalOpen(true);
	};

	const confirmDelete = async () => {
		if (selectedPropertyId) {
			try {
				await deleteProperty.mutateAsync({ id: selectedPropertyId });
				toast.success("Imóvel excluído com sucesso");
				setIsDeleteModalOpen(false);
				setSelectedPropertyId(null);
				refetch();
			} catch (err) {
				toast.error("Erro ao excluir imóvel");
				console.error(err);
			}
		}
	};

	const getPropertyIcon = (type: PropertyType) => {
		switch (type) {
			case "apartment_building":
				return <Building2 className="h-6 w-6 text-gray-400" />;
			case "house":
				return <Home className="h-6 w-6 text-gray-400" />;
			case "office":
				return <Briefcase className="h-6 w-6 text-gray-400" />;
			case "land":
				return <Mountain className="h-6 w-6 text-gray-400" />;
			default:
				return <Home className="h-6 w-6 text-gray-400" />;
		}
	};

	const formatPrice = (property: (typeof properties)[0]) => {
		if (property.monthlyRent) {
			return `${formatBRL(Number(property.monthlyRent))}/mês`;
		}
		if (property.askingPrice) {
			return formatBRL(Number(property.askingPrice));
		}
		return "-";
	};

	if (error) {
		return (
			<div className="flex h-96 flex-col items-center justify-center space-y-4">
				<p className="text-red-600">Erro ao carregar imóveis</p>
				<Button color="primary" onPress={() => refetch()}>
					Tentar novamente
				</Button>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-bold text-3xl text-gray-900">Imóveis</h1>
					<p className="mt-1 text-gray-500 text-sm">
						Gerencie todos os seus imóveis em um só lugar
					</p>
				</div>
				<Button
					color="primary"
					startContent={<Plus className="h-4 w-4" />}
					onPress={() => navigate("/dashboard/properties/new")}
					size="lg"
					className="bg-primary text-white hover:bg-primary-600"
				>
					Novo Imóvel
				</Button>
			</div>

			{/* Filters */}
			<div className="flex items-center gap-1 border-gray-200 border-b pb-0">
				<button
					type="button"
					onClick={() => {
						setActiveFilter("all");
						setCurrentPage(1);
					}}
					className={`relative px-4 py-2 font-medium text-sm transition-colors ${
						activeFilter === "all"
							? "border-primary border-b-2 text-primary"
							: "text-gray-600 hover:text-gray-900"
					}`}
				>
					Todos
				</button>
				<button
					type="button"
					onClick={() => {
						setActiveFilter("apartment_building");
						setCurrentPage(1);
					}}
					className={`relative flex items-center gap-2 px-4 py-2 font-medium text-sm transition-colors ${
						activeFilter === "apartment_building"
							? "border-primary border-b-2 text-primary"
							: "text-gray-600 hover:text-gray-900"
					}`}
				>
					Apartamentos
				</button>
				<button
					type="button"
					onClick={() => {
						setActiveFilter("house");
						setCurrentPage(1);
					}}
					className={`relative flex items-center gap-2 px-4 py-2 font-medium text-sm transition-colors ${
						activeFilter === "house"
							? "border-primary border-b-2 text-primary"
							: "text-gray-600 hover:text-gray-900"
					}`}
				>
					Casas
				</button>
				<button
					type="button"
					onClick={() => {
						setActiveFilter("office");
						setCurrentPage(1);
					}}
					className={`relative flex items-center gap-2 px-4 py-2 font-medium text-sm transition-colors ${
						activeFilter === "office"
							? "border-primary border-b-2 text-primary"
							: "text-gray-600 hover:text-gray-900"
					}`}
				>
					Comerciais
				</button>
				<button
					type="button"
					onClick={() => {
						setActiveFilter("land");
						setCurrentPage(1);
					}}
					className={`relative flex items-center gap-2 px-4 py-2 font-medium text-sm transition-colors ${
						activeFilter === "land"
							? "border-primary border-b-2 text-primary"
							: "text-gray-600 hover:text-gray-900"
					}`}
				>
					Terrenos
				</button>
				<div className="mx-2 h-6 w-px bg-gray-300" />
				<button
					type="button"
					onClick={() => {
						setActiveFilter("rent");
						setCurrentPage(1);
					}}
					className={`relative flex items-center gap-2 px-4 py-2 font-medium text-sm transition-colors ${
						activeFilter === "rent"
							? "border-primary border-b-2 text-primary"
							: "text-gray-600 hover:text-gray-900"
					}`}
				>
					Para Aluguel
				</button>
				<button
					type="button"
					onClick={() => {
						setActiveFilter("sale");
						setCurrentPage(1);
					}}
					className={`relative flex items-center gap-2 px-4 py-2 font-medium text-sm transition-colors ${
						activeFilter === "sale"
							? "border-primary border-b-2 text-primary"
							: "text-gray-600 hover:text-gray-900"
					}`}
				>
					Para Venda
				</button>
			</div>

			{/* Search Bar */}
			<Input
				placeholder="Buscar por nome, endereço ou cidade..."
				value={searchQuery}
				onValueChange={(value) => {
					setSearchQuery(value);
					setCurrentPage(1);
				}}
				startContent={<Search className="h-4 w-4 text-gray-400" />}
				classNames={{
					input: "text-sm",
					inputWrapper: "border-gray-200 bg-white hover:border-gray-300",
				}}
				className="max-w-md"
			/>

			{/* Properties Table */}
			<Card className="border border-gray-200 shadow-sm">
				<CardBody className="p-0">
					{isLoading ? (
						<div className="flex items-center justify-center py-20">
							<Spinner size="lg" />
						</div>
					) : (
						<Table
							aria-label="Tabela de imóveis"
							removeWrapper
							classNames={{
								base: "min-h-[400px]",
								table: "min-h-[400px]",
								thead: "[&>tr]:first:shadow-none",
								th: "border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-700",
								td: "border-b border-gray-100",
							}}
						>
							<TableHeader>
								<TableColumn>IMÓVEL</TableColumn>
								<TableColumn>TIPO</TableColumn>
								<TableColumn>FINALIDADE</TableColumn>
								<TableColumn>UNIDADES</TableColumn>
								<TableColumn>VALOR</TableColumn>
								<TableColumn>STATUS</TableColumn>
								<TableColumn width={50}>AÇÕES</TableColumn>
							</TableHeader>
							<TableBody emptyContent="Nenhum imóvel encontrado. Cadastre seu primeiro imóvel!">
								{properties.map((property) => (
									<TableRow
										key={property.id}
										className="transition-colors hover:bg-gray-50"
									>
										<TableCell>
											<Link
												to={`/dashboard/properties/${property.id}`}
												className="flex items-center gap-4 text-inherit no-underline hover:text-inherit"
											>
												{/* Property Image */}
												<div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-gray-200 to-gray-300">
													{property.coverImage ? (
														<img
															src={property.coverImage}
															alt={property.name}
															className="h-full w-full object-cover"
														/>
													) : (
														getPropertyIcon(property.type as PropertyType)
													)}
												</div>
												{/* Property Info */}
												<div className="min-w-0 flex-1">
													<p className="truncate font-semibold text-gray-900">
														{property.name}
													</p>
													<p className="truncate text-gray-500 text-sm">
														{property.address}
														{property.city && `, ${property.city}`}
														{property.state && ` - ${property.state}`}
													</p>
												</div>
											</Link>
										</TableCell>
										<TableCell>
											<Link
												to={`/dashboard/properties/${property.id}`}
												className="block text-inherit no-underline hover:text-inherit"
											>
												<span className="text-gray-900">
													{PROPERTY_TYPE_LABELS[property.type as PropertyType]}
												</span>
											</Link>
										</TableCell>
										<TableCell>
											<Link
												to={`/dashboard/properties/${property.id}`}
												className="block text-inherit no-underline hover:text-inherit"
											>
												<Chip
													size="sm"
													variant="flat"
													color={
														property.category === "rent"
															? "primary"
															: property.category === "sale"
																? "secondary"
																: "default"
													}
												>
													{
														PROPERTY_CATEGORY_LABELS[
															property.category as PropertyCategory
														]
													}
												</Chip>
											</Link>
										</TableCell>
										<TableCell>
											<Link
												to={`/dashboard/properties/${property.id}`}
												className="block text-inherit no-underline hover:text-inherit"
											>
												{property.unitCount && property.unitCount > 0 ? (
													<span className="text-gray-900">
														{property.occupiedUnits}/{property.unitCount}{" "}
														ocupadas
													</span>
												) : (
													<span className="text-gray-400">-</span>
												)}
											</Link>
										</TableCell>
										<TableCell>
											<Link
												to={`/dashboard/properties/${property.id}`}
												className="block text-inherit no-underline hover:text-inherit"
											>
												<span className="font-semibold text-gray-900">
													{formatPrice(property)}
												</span>
											</Link>
										</TableCell>
										<TableCell>
											<Link
												to={`/dashboard/properties/${property.id}`}
												className="block text-inherit no-underline hover:text-inherit"
											>
												<Chip
													size="sm"
													variant="flat"
													color={
														property.status === "active"
															? "success"
															: property.status === "rented"
																? "primary"
																: property.status === "sold"
																	? "secondary"
																	: "default"
													}
												>
													{
														PROPERTY_STATUS_LABELS[
															property.status as PropertyStatus
														]
													}
												</Chip>
											</Link>
										</TableCell>
										<TableCell>
											<Dropdown>
												<DropdownTrigger>
													<Button isIconOnly variant="light" size="sm">
														<MoreVertical className="h-4 w-4" />
													</Button>
												</DropdownTrigger>
												<DropdownMenu
													aria-label="Ações do imóvel"
													onAction={(key) => {
														if (key === "view") {
															navigate(`/dashboard/properties/${property.id}`);
														} else if (key === "edit") {
															navigate(
																`/dashboard/properties/${property.id}/edit`,
															);
														} else if (key === "delete") {
															handleDelete(property.id);
														}
													}}
												>
													<DropdownItem
														key="view"
														startContent={<Eye className="h-4 w-4" />}
													>
														Ver Detalhes
													</DropdownItem>
													<DropdownItem
														key="edit"
														startContent={<Pencil className="h-4 w-4" />}
													>
														Editar
													</DropdownItem>
													<DropdownItem
														key="delete"
														className="text-danger"
														color="danger"
														startContent={<Trash2 className="h-4 w-4" />}
													>
														Excluir
													</DropdownItem>
												</DropdownMenu>
											</Dropdown>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardBody>
			</Card>

			{/* Pagination */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2 text-gray-600 text-sm">
					<span>Linhas por página:</span>
					<Select
						selectedKeys={[rowsPerPage.toString()]}
						onSelectionChange={(keys) => {
							const value = Array.from(keys)[0] as string;
							setRowsPerPage(Number(value));
							setCurrentPage(1);
						}}
						className="w-20"
						size="sm"
					>
						<SelectItem key="10">10</SelectItem>
						<SelectItem key="25">25</SelectItem>
						<SelectItem key="50">50</SelectItem>
						<SelectItem key="100">100</SelectItem>
					</Select>
				</div>
				<div className="flex items-center gap-4">
					<span className="text-gray-600 text-sm">
						{total > 0 ? (
							<>
								{(currentPage - 1) * rowsPerPage + 1}-
								{Math.min(currentPage * rowsPerPage, total)} de {total}
							</>
						) : (
							"0 resultados"
						)}
					</span>
					<div className="flex gap-1">
						<Button
							size="sm"
							variant="light"
							isDisabled={currentPage === 1}
							onPress={() => setCurrentPage((p) => Math.max(1, p - 1))}
						>
							←
						</Button>
						<Button
							size="sm"
							variant="light"
							isDisabled={currentPage === totalPages || totalPages === 0}
							onPress={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
						>
							→
						</Button>
					</div>
				</div>
			</div>

			{/* Delete Confirmation Modal */}
			<CrudModal
				isOpen={isDeleteModalOpen}
				onClose={() => {
					setIsDeleteModalOpen(false);
					setSelectedPropertyId(null);
				}}
				title="Excluir Imóvel"
				onDelete={confirmDelete}
				deleteLabel="Excluir"
				size="md"
				isLoading={deleteProperty.isPending}
			>
				<p>
					Tem certeza que deseja excluir este imóvel? Esta ação não pode ser
					desfeita.
				</p>
			</CrudModal>
		</div>
	);
}
