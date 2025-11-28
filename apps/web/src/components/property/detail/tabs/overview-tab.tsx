import {
	Avatar,
	Button,
	Card,
	CardBody,
	CardHeader,
	Chip,
	Divider,
	Table,
	TableBody,
	TableCell,
	TableColumn,
	TableHeader,
	TableRow,
} from "@heroui/react";
import {
	Bath,
	BedDouble,
	Building2,
	Calendar,
	Car,
	FileText,
	Plus,
	Ruler,
	Unlink,
	UserPlus,
	Users,
} from "lucide-react";
import { formatArea, formatBRL } from "@/lib/constants/brazil";
import type { Contact, Expense, Payment, Property } from "../types";

interface OverviewTabProps {
	property: Property;
	payments: Payment[];
	expenses: Expense[];
	propertyContacts: Contact[];
	totalPayments: number;
	totalExpenses: number;
	netIncome: number;
	onAddPayment: () => void;
	onAddExpense: () => void;
	onLinkContact: () => void;
	onUnlinkContact: (contactId: string) => void;
	onAddLease?: () => void;
	onAddTenant?: () => void;
}

export function OverviewTab({
	property,
	payments,
	expenses,
	propertyContacts,
	totalPayments,
	totalExpenses,
	netIncome,
	onAddPayment,
	onAddExpense,
	onLinkContact,
	onUnlinkContact,
	onAddLease,
	onAddTenant,
}: OverviewTabProps) {
	return (
		<div className="space-y-6">
			{/* Quick Actions - Add Lease/Tenant Cards */}
			{(onAddLease || onAddTenant) && (
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					{onAddLease && (
						<Card className="border border-default-200 bg-content1">
							<CardBody className="p-6">
								<div className="flex items-start gap-4">
									<div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
										<FileText className="h-6 w-6 text-primary" />
									</div>
									<div className="flex-1">
										<h4 className="mb-2 font-semibold text-foreground">
											Adicionar Contrato
										</h4>
										<p className="mb-4 text-sm text-default-foreground">
											Comece adicionando seu contrato e comece a rastrear seus
											pagamentos de aluguel.
										</p>
										<p className="mb-4 text-xs text-default-foreground/70">
											Nenhum upload de documento necessário.
										</p>
										<Button
											color="primary"
											size="sm"
											startContent={<Plus className="h-4 w-4" />}
											onPress={onAddLease}
										>
											Adicionar Contrato
										</Button>
									</div>
								</div>
							</CardBody>
						</Card>
					)}
					{onAddTenant && (
						<Card className="border border-default-200 bg-content1">
							<CardBody className="p-6">
								<div className="flex items-start gap-4">
									<div className="flex h-12 w-12 items-center justify-center rounded-full bg-default-100">
										<UserPlus className="h-6 w-6 text-default-foreground" />
									</div>
									<div className="flex-1">
										<h4 className="mb-2 font-semibold text-foreground">
											Adicionar Inquilino
										</h4>
										<p className="mb-4 text-sm text-default-foreground">
											Adicione um inquilino ao seu contrato.
										</p>
										<Button
											variant="bordered"
											size="sm"
											startContent={<UserPlus className="h-4 w-4" />}
											onPress={onAddTenant}
										>
											Adicionar Inquilino
										</Button>
									</div>
								</div>
							</CardBody>
						</Card>
					)}
				</div>
			)}

			<PropertyInfoSection property={property} />
			<FinancialSummarySection
				property={property}
				payments={payments}
				expenses={expenses}
				totalPayments={totalPayments}
				totalExpenses={totalExpenses}
				netIncome={netIncome}
				onAddPayment={onAddPayment}
				onAddExpense={onAddExpense}
			/>
			<LinkedContactsSection
				propertyContacts={propertyContacts}
				onLinkContact={onLinkContact}
				onUnlinkContact={onUnlinkContact}
			/>
		</div>
	);
}

// Property Information Section
function PropertyInfoSection({ property }: { property: Property }) {
	return (
		<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
			<Card className="border border-gray-200 shadow-sm lg:col-span-2">
				<CardHeader className="border-gray-100 border-b bg-gray-50/50 px-6 py-4">
					<h3 className="font-semibold text-gray-900 text-lg">
						Informações do Imóvel
					</h3>
				</CardHeader>
				<CardBody className="p-6">
					<div className="grid grid-cols-2 gap-6 md:grid-cols-3">
						{property.totalArea && (
							<InfoItem
								icon={Ruler}
								label="Área Total"
								value={formatArea(Number(property.totalArea))}
							/>
						)}
						{property.bedrooms && (
							<InfoItem
								icon={BedDouble}
								label="Quartos"
								value={property.bedrooms.toString()}
							/>
						)}
						{property.bathrooms && (
							<InfoItem
								icon={Bath}
								label="Banheiros"
								value={property.bathrooms.toString()}
							/>
						)}
						{property.parkingSpaces && (
							<InfoItem
								icon={Car}
								label="Vagas"
								value={property.parkingSpaces.toString()}
							/>
						)}
						{property.floors && (
							<InfoItem
								icon={Building2}
								label="Andares"
								value={property.floors.toString()}
							/>
						)}
						{property.yearBuilt && (
							<InfoItem
								icon={Calendar}
								label="Ano"
								value={property.yearBuilt.toString()}
							/>
						)}
					</div>
					{property.description && (
						<>
							<Divider className="my-6" />
							<div>
								<p className="mb-2 font-medium text-gray-700 text-sm">
									Descrição
								</p>
								<p className="text-gray-600 text-sm">{property.description}</p>
							</div>
						</>
					)}
					{property.amenities && property.amenities.length > 0 && (
						<>
							<Divider className="my-6" />
							<div>
								<p className="mb-3 font-medium text-gray-700 text-sm">
									Comodidades
								</p>
								<div className="flex flex-wrap gap-2">
									{property.amenities.map((amenity: string, i: number) => (
										<Chip key={i} size="sm" variant="flat">
											{amenity}
										</Chip>
									))}
								</div>
							</div>
						</>
					)}
				</CardBody>
			</Card>

			<Card className="border border-gray-200 shadow-sm">
				<CardHeader className="border-gray-100 border-b bg-gray-50/50 px-6 py-4">
					<h3 className="font-semibold text-gray-900 text-lg">Valores</h3>
				</CardHeader>
				<CardBody className="space-y-4 p-6">
					{property.monthlyRent && (
						<div className="flex items-center justify-between">
							<span className="text-gray-500 text-sm">Aluguel Mensal</span>
							<span className="font-semibold text-green-600">
								{formatBRL(Number(property.monthlyRent))}
							</span>
						</div>
					)}
					{property.askingPrice && (
						<div className="flex items-center justify-between">
							<span className="text-gray-500 text-sm">Valor de Venda</span>
							<span className="font-semibold text-gray-900">
								{formatBRL(Number(property.askingPrice))}
							</span>
						</div>
					)}
					{property.currentValue && (
						<div className="flex items-center justify-between">
							<span className="text-gray-500 text-sm">Valor Atual</span>
							<span className="font-semibold text-gray-900">
								{formatBRL(Number(property.currentValue))}
							</span>
						</div>
					)}
				</CardBody>
			</Card>
		</div>
	);
}

// Info Item Component
function InfoItem({
	icon: Icon,
	label,
	value,
}: {
	icon: typeof Ruler;
	label: string;
	value: string;
}) {
	return (
		<div className="flex items-start gap-3">
			<Icon className="h-5 w-5 text-gray-400" />
			<div>
				<p className="text-gray-500 text-sm">{label}</p>
				<p className="font-semibold text-gray-900">{value}</p>
			</div>
		</div>
	);
}

// Financial Summary Section
function FinancialSummarySection({
	payments,
	expenses,
	totalPayments,
	totalExpenses,
	netIncome,
	onAddPayment,
	onAddExpense,
}: Omit<
	OverviewTabProps,
	"property" | "propertyContacts" | "onLinkContact" | "onUnlinkContact"
>) {
	const transactions = [
		...payments.map((p) => ({
			id: p.id,
			transactionType: "income" as const,
			date: new Date(p.date),
			amount: p.amount,
			category: p.type === "rent" ? "Aluguel" : p.type,
			description: p.notes || "-",
		})),
		...expenses.map((e) => ({
			id: e.id,
			transactionType: "expense" as const,
			date: new Date(e.date),
			amount: e.amount,
			category: getCategoryLabel(e.category),
			description: e.description || "-",
		})),
	]
		.sort((a, b) => b.date.getTime() - a.date.getTime())
		.slice(0, 10);

	return (
		<Card className="border border-gray-200 shadow-sm">
			<CardHeader className="flex items-center justify-between border-gray-100 border-b bg-gray-50/50 px-6 py-4">
				<h3 className="font-semibold text-gray-900 text-lg">
					Receitas e Despesas
				</h3>
				<div className="flex gap-2">
					<Button
						size="sm"
						variant="bordered"
						startContent={<Plus className="h-4 w-4" />}
						onPress={onAddPayment}
					>
						Receita
					</Button>
					<Button
						size="sm"
						variant="bordered"
						color="danger"
						startContent={<Plus className="h-4 w-4" />}
						onPress={onAddExpense}
					>
						Despesa
					</Button>
				</div>
			</CardHeader>
			<CardBody className="p-0">
				<div className="grid grid-cols-3 gap-4 border-gray-100 border-b p-6">
					<SummaryCard
						label="Total Recebido"
						value={formatBRL(totalPayments)}
						variant="success"
					/>
					<SummaryCard
						label="Total Despesas"
						value={formatBRL(totalExpenses)}
						variant="danger"
					/>
					<SummaryCard
						label="Resultado"
						value={formatBRL(netIncome)}
						variant={netIncome >= 0 ? "info" : "warning"}
					/>
				</div>

				<div className="max-h-96 overflow-auto">
					<Table removeWrapper aria-label="Transações">
						<TableHeader>
							<TableColumn>DATA</TableColumn>
							<TableColumn>TIPO</TableColumn>
							<TableColumn>CATEGORIA</TableColumn>
							<TableColumn>DESCRIÇÃO</TableColumn>
							<TableColumn>VALOR</TableColumn>
						</TableHeader>
						<TableBody>
							{transactions.map((item) => (
								<TableRow key={item.id} className="hover:bg-gray-50">
									<TableCell className="text-gray-600 text-sm">
										{item.date.toLocaleDateString("pt-BR")}
									</TableCell>
									<TableCell>
										<Chip
											size="sm"
											variant="flat"
											color={
												item.transactionType === "income" ? "success" : "danger"
											}
										>
											{item.transactionType === "income"
												? "Receita"
												: "Despesa"}
										</Chip>
									</TableCell>
									<TableCell className="text-gray-600 text-sm">
										{item.category}
									</TableCell>
									<TableCell className="text-gray-600 text-sm">
										{item.description}
									</TableCell>
									<TableCell
										className={`font-semibold ${item.transactionType === "income" ? "text-green-600" : "text-red-600"}`}
									>
										{item.transactionType === "income" ? "+" : "-"}
										{formatBRL(Number(item.amount))}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</CardBody>
		</Card>
	);
}

function getCategoryLabel(category: string) {
	const labels: Record<string, string> = {
		maintenance: "Manutenção",
		utilities: "Utilidades",
		tax: "Impostos",
		insurance: "Seguro",
		repairs: "Reparos",
		supplies: "Suprimentos",
	};
	return labels[category] || category;
}

function SummaryCard({
	label,
	value,
	variant,
}: {
	label: string;
	value: string;
	variant: "success" | "danger" | "info" | "warning";
}) {
	const colors = {
		success: "bg-green-50 text-green-700",
		danger: "bg-red-50 text-red-700",
		info: "bg-blue-50 text-blue-700",
		warning: "bg-yellow-50 text-yellow-700",
	};

	return (
		<div className={`rounded-lg p-4 ${colors[variant]}`}>
			<p className="text-sm">{label}</p>
			<p className="font-bold text-xl">{value}</p>
		</div>
	);
}

// Linked Contacts Section
function LinkedContactsSection({
	propertyContacts,
	onLinkContact,
	onUnlinkContact,
}: {
	propertyContacts: Contact[];
	onLinkContact: () => void;
	onUnlinkContact: (contactId: string) => void;
}) {
	return (
		<Card className="border border-gray-200 shadow-sm">
			<CardHeader className="flex items-center justify-between border-gray-100 border-b bg-gray-50/50 px-6 py-4">
				<h3 className="font-semibold text-gray-900 text-lg">
					Contatos Vinculados
				</h3>
				<Button
					size="sm"
					color="primary"
					startContent={<UserPlus className="h-4 w-4" />}
					onPress={onLinkContact}
				>
					Vincular Contato
				</Button>
			</CardHeader>
			<CardBody className="p-6">
				{propertyContacts.length === 0 ? (
					<div className="py-8 text-center">
						<Users className="mx-auto mb-3 h-10 w-10 text-gray-300" />
						<p className="text-gray-500 text-sm">Nenhum contato vinculado</p>
						<Button
							size="sm"
							variant="light"
							className="mt-2"
							onPress={onLinkContact}
						>
							Vincular primeiro contato
						</Button>
					</div>
				) : (
					<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
						{propertyContacts.slice(0, 6).map((contact) => (
							<ContactCard
								key={contact.id}
								contact={contact}
								onUnlink={() => onUnlinkContact(contact.id)}
							/>
						))}
					</div>
				)}
			</CardBody>
		</Card>
	);
}

function ContactCard({
	contact,
	onUnlink,
}: {
	contact: Contact;
	onUnlink: () => void;
}) {
	return (
		<div className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
			<div className="flex items-center gap-3">
				<Avatar name={contact.firstName || "?"} size="sm" />
				<div>
					<p className="font-medium text-gray-900 text-sm">
						{contact.firstName} {contact.lastName}
					</p>
					<p className="text-gray-500 text-xs capitalize">{contact.type}</p>
				</div>
			</div>
			<Button
				isIconOnly
				size="sm"
				variant="light"
				color="danger"
				onPress={onUnlink}
			>
				<Unlink className="h-4 w-4" />
			</Button>
		</div>
	);
}
