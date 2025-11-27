import bcrypt from "bcryptjs";
import { config } from "dotenv";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

// Load environment variables from the server .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: resolve(__dirname, "../../../apps/server/.env") });

import { PrismaPg } from "@prisma/adapter-pg";
import { randomUUID } from "crypto";
import { PrismaClient } from "./generated/client";

const adapter = new PrismaPg({
	connectionString: process.env.DATABASE_URL || "",
});
const prisma = new PrismaClient({ adapter });

// Hash password using bcrypt (compatible with better-auth)
async function hashPassword(password: string): Promise<string> {
	const saltRounds = 10;
	return bcrypt.hash(password, saltRounds);
}

// Helper to generate random dates
function randomDate(start: Date, end: Date): Date {
	return new Date(
		start.getTime() + Math.random() * (end.getTime() - start.getTime()),
	);
}

// Helper to pick random item from array
function randomItem<T>(arr: T[]): T {
	return arr[Math.floor(Math.random() * arr.length)];
}

// Helper to generate random number in range
function randomInt(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
	console.log("🌱 Iniciando seed do banco de dados...\n");

	// ============================================
	// 1. CURRENCIES
	// ============================================
	console.log("💰 Inserindo moedas...");
	const currencies = [
		{ id: "BRL", name: "Real Brasileiro", symbol: "R$" },
		{ id: "USD", name: "Dólar Americano", symbol: "$" },
		{ id: "EUR", name: "Euro", symbol: "€" },
	];

	for (const currency of currencies) {
		await prisma.currency.upsert({
			where: { id: currency.id },
			update: currency,
			create: currency,
		});
	}
	console.log(`   ✅ ${currencies.length} moedas inseridas\n`);

	// ============================================
	// 2. PAYMENT METHODS
	// ============================================
	console.log("💳 Inserindo formas de pagamento...");
	const paymentMethods = [
		{ name: "PIX", type: "online" },
		{ name: "Boleto Bancário", type: "manual" },
		{ name: "Transferência Bancária", type: "manual" },
		{ name: "Dinheiro", type: "manual" },
		{ name: "Cartão de Crédito", type: "online" },
		{ name: "Cartão de Débito", type: "online" },
		{ name: "Cheque", type: "manual" },
	];

	const createdPaymentMethods: Array<{ id: string; name: string }> = [];
	for (const method of paymentMethods) {
		const pm = await prisma.paymentMethod.upsert({
			where: { name: method.name },
			update: method,
			create: method,
		});
		createdPaymentMethods.push(pm);
	}
	console.log(`   ✅ ${paymentMethods.length} formas de pagamento inseridas\n`);

	// ============================================
	// 3. TEST USERS (with password accounts for better-auth)
	// ============================================
	console.log("👤 Inserindo usuários de teste...");

	// Hash the default password for all test users using bcrypt (better-auth compatible)
	const defaultPassword = await hashPassword("senha123");

	const testUsers = [
		{
			id: randomUUID(),
			name: "João Silva",
			email: "admin@rentline.com.br",
			emailVerified: true,
			role: "admin",
			userType: "landlord",
			hasOnboarded: true,
			phone: "+55 11 99999-0001",
			address: "Av. Paulista, 1000, Apto 101",
			city: "São Paulo",
			state: "SP",
			postalCode: "01310-100",
			country: "Brasil",
		},
		{
			id: randomUUID(),
			name: "Maria Santos",
			email: "maria@rentline.com.br",
			emailVerified: true,
			role: "user",
			userType: "landlord",
			hasOnboarded: true,
			phone: "+55 21 99999-0002",
			address: "Rua Copacabana, 500, Sala 201",
			city: "Rio de Janeiro",
			state: "RJ",
			postalCode: "22050-002",
			country: "Brasil",
		},
		{
			id: randomUUID(),
			name: "Pedro Oliveira",
			email: "pedro@rentline.com.br",
			emailVerified: true,
			role: "user",
			userType: "landlord",
			hasOnboarded: true,
			phone: "+55 31 99999-0003",
			address: "Rua da Bahia, 1500",
			city: "Belo Horizonte",
			state: "MG",
			postalCode: "30160-011",
			country: "Brasil",
		},
	];

	const createdUsers: Array<{ id: string; name: string; email: string }> = [];
	for (const user of testUsers) {
		// Create or update user
		const u = await prisma.user.upsert({
			where: { email: user.email },
			update: user,
			create: user,
		});
		createdUsers.push(u);

		// Create account for credential-based login (better-auth format)
		const existingAccount = await prisma.account.findFirst({
			where: { userId: u.id, providerId: "credential" },
		});

		if (!existingAccount) {
			await prisma.account.create({
				data: {
					id: randomUUID(),
					accountId: u.id, // better-auth uses the user id as accountId for credentials
					providerId: "credential",
					userId: u.id,
					password: defaultPassword,
				},
			});
		} else {
			// Update password if account exists
			await prisma.account.update({
				where: { id: existingAccount.id },
				data: { password: defaultPassword },
			});
		}
	}
	console.log(`   ✅ ${testUsers.length} usuários inseridos`);
	console.log("   📧 Login: admin@rentline.com.br");
	console.log("   🔑 Senha: senha123\n");

	// ============================================
	// 4. ORGANIZATIONS
	// ============================================
	console.log("🏢 Inserindo organizações...");
	const organizations = [
		{
			id: randomUUID(),
			name: "Imobiliária São Paulo",
			slug: "imobiliaria-sp",
			type: "property_manager",
			address: "Av. Paulista, 1500, 10º andar",
			city: "São Paulo",
			state: "SP",
			postalCode: "01310-200",
			country: "Brasil",
			phone: "+55 11 3000-0001",
			email: "contato@imobiliaria-sp.com.br",
			cnpj: "12.345.678/0001-90",
		},
		{
			id: randomUUID(),
			name: "Rio Imóveis",
			slug: "rio-imoveis",
			type: "property_manager",
			address: "Av. Atlântica, 2000, Sala 501",
			city: "Rio de Janeiro",
			state: "RJ",
			postalCode: "22021-001",
			country: "Brasil",
			phone: "+55 21 3000-0002",
			email: "contato@rioimoveis.com.br",
			cnpj: "98.765.432/0001-10",
		},
	];

	const createdOrgs: Array<{ id: string; name: string; slug: string }> = [];
	for (const org of organizations) {
		const o = await prisma.organization.upsert({
			where: { slug: org.slug },
			update: org,
			create: org,
		});
		createdOrgs.push(o);
	}
	console.log(`   ✅ ${organizations.length} organizações inseridas\n`);

	// ============================================
	// 5. ORGANIZATION MEMBERS
	// ============================================
	console.log("👥 Inserindo membros das organizações...");
	const memberAssignments = [
		{ orgIndex: 0, userIndex: 0, role: "owner" },
		{ orgIndex: 0, userIndex: 1, role: "admin" },
		{ orgIndex: 1, userIndex: 2, role: "owner" },
	];

	let memberCount = 0;
	for (const assignment of memberAssignments) {
		const org = createdOrgs[assignment.orgIndex];
		const user = createdUsers[assignment.userIndex];

		const existingMember = await prisma.member.findFirst({
			where: { organizationId: org.id, userId: user.id },
		});

		if (!existingMember) {
			await prisma.member.create({
				data: {
					id: randomUUID(),
					organizationId: org.id,
					userId: user.id,
					role: assignment.role,
					createdAt: new Date(),
				},
			});
			memberCount++;
		}
	}
	console.log(`   ✅ ${memberCount} membros inseridos\n`);

	// ============================================
	// 6. CONTACTS (Inquilinos, Corretores, Proprietários)
	// ============================================
	console.log("📇 Inserindo contatos...");
	const contactsData = [
		// Inquilinos
		{
			type: "tenant",
			firstName: "Ana",
			lastName: "Costa",
			email: "ana.costa@email.com",
			phone: "+55 11 98765-0001",
			mobile: "+55 11 98765-0002",
			address: "Rua das Flores, 100, Apto 42",
			city: "São Paulo",
			state: "SP",
			postalCode: "01310-000",
			country: "Brasil",
			status: "active",
			taxId: "123.456.789-00",
		},
		{
			type: "tenant",
			firstName: "Carlos",
			lastName: "Ferreira",
			email: "carlos.ferreira@email.com",
			phone: "+55 21 98765-0003",
			mobile: "+55 21 98765-0004",
			address: "Rua do Catete, 200",
			city: "Rio de Janeiro",
			state: "RJ",
			postalCode: "22220-000",
			country: "Brasil",
			status: "active",
			taxId: "987.654.321-00",
		},
		{
			type: "tenant",
			firstName: "Fernanda",
			lastName: "Lima",
			email: "fernanda.lima@email.com",
			phone: "+55 31 98765-0005",
			address: "Av. Afonso Pena, 3000",
			city: "Belo Horizonte",
			state: "MG",
			postalCode: "30130-009",
			country: "Brasil",
			status: "active",
			taxId: "456.789.123-00",
		},
		{
			type: "tenant",
			firstName: "Roberto",
			lastName: "Almeida",
			email: "roberto.almeida@email.com",
			phone: "+55 41 98765-0006",
			address: "Rua XV de Novembro, 500",
			city: "Curitiba",
			state: "PR",
			postalCode: "80020-310",
			country: "Brasil",
			status: "active",
			taxId: "321.654.987-00",
		},
		// Corretores
		{
			type: "agent",
			firstName: "Lucas",
			lastName: "Mendes",
			email: "lucas.mendes@imobiliaria.com",
			phone: "+55 11 3333-0001",
			mobile: "+55 11 99999-1001",
			address: "Av. Paulista, 2000, Cj 101",
			city: "São Paulo",
			state: "SP",
			postalCode: "01310-300",
			country: "Brasil",
			status: "active",
			notes: "CRECI-SP 12345, especializado em imóveis residenciais",
		},
		{
			type: "agent",
			firstName: "Juliana",
			lastName: "Rodrigues",
			email: "juliana.rodrigues@imobiliaria.com",
			phone: "+55 21 3333-0002",
			mobile: "+55 21 99999-1002",
			address: "Rua da Assembleia, 100",
			city: "Rio de Janeiro",
			state: "RJ",
			postalCode: "20011-000",
			country: "Brasil",
			status: "active",
			notes: "CRECI-RJ 67890, especializada em imóveis comerciais",
		},
		// Proprietários
		{
			type: "owner",
			firstName: "Ricardo",
			lastName: "Souza",
			email: "ricardo.souza@gmail.com",
			phone: "+55 11 2222-0001",
			mobile: "+55 11 99888-0001",
			address: "Alameda Santos, 1500",
			city: "São Paulo",
			state: "SP",
			postalCode: "01418-100",
			country: "Brasil",
			status: "active",
			taxId: "111.222.333-44",
		},
		{
			type: "owner",
			firstName: "Patrícia",
			lastName: "Martins",
			email: "patricia.martins@gmail.com",
			phone: "+55 21 2222-0002",
			address: "Rua Visconde de Pirajá, 500",
			city: "Rio de Janeiro",
			state: "RJ",
			postalCode: "22410-002",
			country: "Brasil",
			status: "active",
			taxId: "555.666.777-88",
		},
	];

	const createdContacts: Array<{
		id: string;
		type: string;
		firstName: string | null;
	}> = [];
	for (const contact of contactsData) {
		const c = await prisma.contact.create({
			data: {
				id: randomUUID(),
				organizationId: createdOrgs[0].id,
				...contact,
			},
		});
		createdContacts.push(c);
	}
	console.log(`   ✅ ${contactsData.length} contatos inseridos\n`);

	// ============================================
	// 7. PROPERTIES (Brazilian)
	// ============================================
	console.log("🏠 Inserindo imóveis...");
	const propertiesData = [
		// Prédio de Apartamentos 1
		{
			name: "Edifício Solar das Palmeiras",
			type: "apartment_building",
			category: "rent",
			status: "active",
			address: "Rua Augusta, 2500",
			city: "São Paulo",
			state: "SP",
			postalCode: "01413-100",
			country: "Brasil",
			description:
				"Edifício moderno com 20 unidades, academia, piscina e salão de festas. Localização privilegiada na região dos Jardins.",
			totalArea: 2500,
			floors: 10,
			yearBuilt: 2018,
			parkingSpaces: 40,
			purchasePrice: 15000000,
			currentValue: 18000000,
			monthlyRent: 85000,
			currencyId: "BRL",
			features: JSON.stringify(["Elevador", "Portaria 24h", "Interfone"]),
			amenities: JSON.stringify([
				"Academia",
				"Piscina",
				"Salão de Festas",
				"Churrasqueira",
			]),
		},
		// Prédio de Apartamentos 2
		{
			name: "Condomínio Vista Mar",
			type: "apartment_building",
			category: "rent",
			status: "active",
			address: "Av. Atlântica, 3000",
			city: "Rio de Janeiro",
			state: "RJ",
			postalCode: "22070-002",
			country: "Brasil",
			description:
				"Edifício de alto padrão em Copacabana com vista para o mar. 15 unidades de luxo.",
			totalArea: 1800,
			floors: 8,
			yearBuilt: 2020,
			parkingSpaces: 30,
			purchasePrice: 25000000,
			currentValue: 28000000,
			monthlyRent: 120000,
			currencyId: "BRL",
			features: JSON.stringify(["Vista Mar", "Porteiro", "Gerador"]),
			amenities: JSON.stringify([
				"Academia",
				"Sauna",
				"Espaço Gourmet",
				"Playground",
			]),
		},
		// Casa 1
		{
			name: "Casa Vila Madalena",
			type: "house",
			category: "rent",
			status: "active",
			address: "Rua Harmonia, 350",
			city: "São Paulo",
			state: "SP",
			postalCode: "05435-000",
			country: "Brasil",
			description:
				"Casa charmosa em bairro nobre, com quintal amplo e cozinha gourmet.",
			totalArea: 280,
			lotSize: 400,
			floors: 2,
			yearBuilt: 2015,
			parkingSpaces: 2,
			bedrooms: 4,
			bathrooms: 3,
			purchasePrice: 1800000,
			currentValue: 2200000,
			monthlyRent: 12000,
			currencyId: "BRL",
			features: JSON.stringify(["Piso de Madeira", "Lareira", "Automação"]),
			amenities: JSON.stringify([
				"Quintal",
				"Churrasqueira",
				"Garagem Coberta",
			]),
		},
		// Casa 2 - Venda
		{
			name: "Mansão Jardins",
			type: "house",
			category: "sale",
			status: "active",
			address: "Rua Estados Unidos, 1000",
			city: "São Paulo",
			state: "SP",
			postalCode: "01427-001",
			country: "Brasil",
			description: "Mansão de luxo nos Jardins com piscina, adega e cinema.",
			totalArea: 650,
			lotSize: 1200,
			floors: 3,
			yearBuilt: 2019,
			parkingSpaces: 6,
			bedrooms: 6,
			bathrooms: 7,
			purchasePrice: 12000000,
			currentValue: 15000000,
			askingPrice: 16000000,
			currencyId: "BRL",
			features: JSON.stringify(["Piscina Aquecida", "Adega", "Cinema"]),
			amenities: JSON.stringify([
				"Spa",
				"Jardim",
				"Casa de Hóspedes",
				"Quadra",
			]),
		},
		// Casa 3 - Aluguel e Venda
		{
			name: "Sobrado Pinheiros",
			type: "house",
			category: "both",
			status: "active",
			address: "Rua dos Pinheiros, 800",
			city: "São Paulo",
			state: "SP",
			postalCode: "05422-001",
			country: "Brasil",
			description:
				"Sobrado reformado em localização premium, disponível para venda ou locação.",
			totalArea: 220,
			lotSize: 300,
			floors: 2,
			yearBuilt: 2021,
			parkingSpaces: 2,
			bedrooms: 3,
			bathrooms: 3,
			purchasePrice: 1500000,
			currentValue: 1700000,
			askingPrice: 1850000,
			monthlyRent: 9500,
			currencyId: "BRL",
			features: JSON.stringify([
				"Terraço",
				"Acabamento Premium",
				"Eficiência Energética",
			]),
			amenities: JSON.stringify([
				"Lavanderia",
				"Depósito",
				"Entrada Independente",
			]),
		},
		// Sala Comercial
		{
			name: "Centro Empresarial Faria Lima",
			type: "office",
			category: "rent",
			status: "active",
			address: "Av. Brigadeiro Faria Lima, 3500",
			city: "São Paulo",
			state: "SP",
			postalCode: "04538-133",
			country: "Brasil",
			description:
				"Lajes corporativas de alto padrão na região mais valorizada de São Paulo.",
			totalArea: 5000,
			usableArea: 4500,
			floors: 15,
			yearBuilt: 2017,
			parkingSpaces: 200,
			purchasePrice: 80000000,
			currentValue: 95000000,
			monthlyRent: 450000,
			currencyId: "BRL",
			features: JSON.stringify(["Fibra Óptica", "Segurança 24h", "Heliponto"]),
			amenities: JSON.stringify([
				"Auditório",
				"Restaurante",
				"Academia",
				"Estacionamento",
			]),
		},
		// Terreno 1
		{
			name: "Terreno Alphaville",
			type: "land",
			category: "sale",
			status: "active",
			address: "Alameda Rio Negro, Lote 15",
			city: "Barueri",
			state: "SP",
			postalCode: "06454-000",
			country: "Brasil",
			description:
				"Terreno plano em condomínio fechado de alto padrão. Pronto para construir.",
			totalArea: 0,
			lotSize: 800,
			purchasePrice: 800000,
			currentValue: 950000,
			askingPrice: 1000000,
			currencyId: "BRL",
			features: JSON.stringify([
				"Condomínio Fechado",
				"Infraestrutura Completa",
				"Segurança",
			]),
		},
		// Terreno 2
		{
			name: "Terreno Barra da Tijuca",
			type: "land",
			category: "sale",
			status: "active",
			address: "Av. das Américas, Km 12",
			city: "Rio de Janeiro",
			state: "RJ",
			postalCode: "22793-080",
			country: "Brasil",
			description:
				"Terreno comercial em área de grande valorização. Ideal para incorporação.",
			lotSize: 2500,
			purchasePrice: 5000000,
			currentValue: 6500000,
			askingPrice: 7000000,
			currencyId: "BRL",
			features: JSON.stringify([
				"Zoneamento Comercial",
				"Frente para Avenida",
				"Documentação OK",
			]),
		},
	];

	const createdProperties: Array<{ id: string; name: string; type: string }> =
		[];
	for (const propertyData of propertiesData) {
		const property = await prisma.property.create({
			data: {
				organizationId: createdOrgs[0].id,
				landlordId: createdUsers[0].id,
				...propertyData,
			},
		});
		createdProperties.push(property);
	}
	console.log(`   ✅ ${propertiesData.length} imóveis inseridos\n`);

	// ============================================
	// 8. UNITS (for apartment buildings and office)
	// ============================================
	console.log("🚪 Inserindo unidades...");
	const createdUnits: Array<{
		id: string;
		unitNumber: string;
		propertyId: string;
	}> = [];

	// Find apartment buildings and offices
	const apartmentBuildings = createdProperties.filter(
		(p) => p.type === "apartment_building",
	);
	const offices = createdProperties.filter((p) => p.type === "office");

	// Create units for apartment buildings
	for (const building of apartmentBuildings) {
		const numUnits = building.name.includes("Solar") ? 20 : 15;
		const floors = building.name.includes("Solar") ? 10 : 8;
		const unitsPerFloor = Math.ceil(numUnits / floors);

		for (let floor = 1; floor <= floors; floor++) {
			for (let unit = 1; unit <= unitsPerFloor; unit++) {
				const unitNum = floor * 100 + unit;
				if (
					createdUnits.filter((u) => u.propertyId === building.id).length >=
					numUnits
				)
					break;

				const bedrooms = randomItem([1, 2, 3]);
				const bathrooms = bedrooms === 1 ? 1 : bedrooms === 2 ? 2 : 3;
				const area = bedrooms === 1 ? 45 : bedrooms === 2 ? 70 : 100;
				const rentAmount = bedrooms === 1 ? 2500 : bedrooms === 2 ? 4000 : 6000;

				const u = await prisma.unit.create({
					data: {
						id: randomUUID(),
						propertyId: building.id,
						unitNumber: String(unitNum),
						name: `Apartamento ${unitNum}`,
						type: "apartment",
						floor,
						bedrooms,
						bathrooms,
						area,
						status: randomItem([
							"available",
							"occupied",
							"occupied",
							"occupied",
						]),
						rentAmount,
						depositAmount: rentAmount * 3,
						currencyId: "BRL",
						features: JSON.stringify(["Varanda", "Armários Embutidos"]),
						amenities: JSON.stringify(["Vista Livre"]),
					},
				});
				createdUnits.push(u);
			}
		}
	}

	// Create units for office building
	for (const office of offices) {
		for (let floor = 1; floor <= 15; floor++) {
			const area = randomItem([100, 200, 300, 500]);
			const rentAmount = area * 80;

			const u = await prisma.unit.create({
				data: {
					id: randomUUID(),
					propertyId: office.id,
					unitNumber: `${floor}01`,
					name: `Sala ${floor}01`,
					type: "office",
					floor,
					area,
					status: randomItem(["available", "occupied", "occupied"]),
					rentAmount,
					depositAmount: rentAmount * 3,
					currencyId: "BRL",
					features: JSON.stringify(["Ar Condicionado Central", "Piso Elevado"]),
				},
			});
			createdUnits.push(u);
		}
	}
	console.log(`   ✅ ${createdUnits.length} unidades inseridas\n`);

	// ============================================
	// 9. LEASES
	// ============================================
	console.log("📝 Inserindo contratos de locação...");
	const tenantContacts = createdContacts.filter((c) => c.type === "tenant");
	const leasesCreated: Array<{ id: string; unitId: string | null }> = [];

	// Get some occupied units for leases
	const unitsForLeases = await prisma.unit.findMany({
		where: {
			status: "occupied",
			propertyId: { in: createdProperties.map((p) => p.id) },
		},
		take: tenantContacts.length,
	});

	for (
		let i = 0;
		i < Math.min(tenantContacts.length, unitsForLeases.length);
		i++
	) {
		const tenant = tenantContacts[i];
		const unit = unitsForLeases[i];
		const startDate = randomDate(
			new Date("2023-01-01"),
			new Date("2024-06-01"),
		);
		const endDate = new Date(startDate);
		endDate.setMonth(endDate.getMonth() + randomItem([12, 24, 30, 36]));

		const rentAmount =
			(await prisma.unit.findUnique({ where: { id: unit.id } }))?.rentAmount ||
			3000;

		const lease = await prisma.lease.create({
			data: {
				id: randomUUID(),
				unitId: unit.id,
				tenantContactId: tenant.id,
				leaseType: "fixed",
				startDate,
				endDate,
				moveInDate: startDate,
				rentAmount: Number(rentAmount),
				depositAmount: Number(rentAmount) * 3,
				currencyId: "BRL",
				paymentDueDay: randomItem([1, 5, 10, 15]),
				lateFeeType: "percentage",
				lateFeePercentage: 2,
				gracePeriodDays: 3,
				status: "active",
				autoRenew: true,
				renewalNoticeDays: 30,
				notificationChannel: "email",
			},
		});
		leasesCreated.push(lease);
	}
	console.log(`   ✅ ${leasesCreated.length} contratos inseridos\n`);

	// ============================================
	// 10. PAYMENTS
	// ============================================
	console.log("💵 Inserindo pagamentos...");
	let paymentCount = 0;
	const pixMethod = createdPaymentMethods.find((pm) => pm.name === "PIX");
	const boletoMethod = createdPaymentMethods.find(
		(pm) => pm.name === "Boleto Bancário",
	);

	for (const lease of leasesCreated) {
		const leaseData = await prisma.lease.findUnique({
			where: { id: lease.id },
		});
		if (!leaseData) continue;

		const startDate = new Date(leaseData.startDate);
		const today = new Date();
		const monthsDiff = Math.floor(
			(today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30),
		);

		for (let month = 0; month < Math.min(monthsDiff, 12); month++) {
			const paymentDate = new Date(startDate);
			paymentDate.setMonth(paymentDate.getMonth() + month);
			paymentDate.setDate(leaseData.paymentDueDay);

			const isPaid = Math.random() > 0.1;

			await prisma.payment.create({
				data: {
					id: randomUUID(),
					leaseId: lease.id,
					amount: Number(leaseData.rentAmount),
					currencyId: "BRL",
					paymentMethodId:
						randomItem([pixMethod?.id, boletoMethod?.id]) || pixMethod?.id,
					type: "rent",
					status: isPaid ? "completed" : "pending",
					date: paymentDate,
					periodStart: new Date(
						paymentDate.getFullYear(),
						paymentDate.getMonth(),
						1,
					),
					periodEnd: new Date(
						paymentDate.getFullYear(),
						paymentDate.getMonth() + 1,
						0,
					),
					notes: `Aluguel ${paymentDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}`,
				},
			});
			paymentCount++;
		}
	}
	console.log(`   ✅ ${paymentCount} pagamentos inseridos\n`);

	// ============================================
	// 11. INVOICES (Cobranças)
	// ============================================
	console.log("📄 Inserindo cobranças...");
	let invoiceCount = 0;
	let invoiceNumber = 1;

	for (const lease of leasesCreated) {
		const leaseData = await prisma.lease.findUnique({
			where: { id: lease.id },
		});
		if (!leaseData) continue;

		const startDate = new Date(leaseData.startDate);
		const today = new Date();

		// Generate invoices for next 3 months (future invoices)
		for (let month = 0; month < 3; month++) {
			const dueDate = new Date();
			dueDate.setMonth(dueDate.getMonth() + month);
			dueDate.setDate(leaseData.paymentDueDay);

			// Determine status based on due date
			let status: "pending" | "overdue" | "paid" = "pending";
			if (month === 0 && dueDate < today) {
				status = Math.random() > 0.7 ? "paid" : "overdue"; // 70% overdue, 30% paid
			} else if (dueDate < today) {
				status = "overdue";
			}

			const year = dueDate.getFullYear();
			const invoiceNum = `INV-${year}-${String(invoiceNumber).padStart(5, "0")}`;

			await prisma.invoice.create({
				data: {
					id: randomUUID(),
					leaseId: lease.id,
					invoiceNumber: invoiceNum,
					dueDate,
					amount: Number(leaseData.rentAmount),
					currencyId: "BRL",
					lineItems: JSON.stringify([
						{
							description: `Aluguel - ${dueDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}`,
							amount: Number(leaseData.rentAmount),
							quantity: 1,
						},
					]),
					status,
					paidAmount: status === "paid" ? Number(leaseData.rentAmount) : 0,
					paidAt: status === "paid" ? new Date() : null,
					notes: `Cobrança automática para ${dueDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}`,
				},
			});
			invoiceCount++;
			invoiceNumber++;
		}
	}
	console.log(`   ✅ ${invoiceCount} cobranças inseridas\n`);

	// ============================================
	// 12. EXPENSES
	// ============================================
	console.log("📊 Inserindo despesas...");
	const expenseCategories = [
		"maintenance",
		"utilities",
		"tax",
		"insurance",
		"repairs",
		"supplies",
	];
	const vendors = [
		"Eletricista João",
		"Encanador Silva",
		"CPFL Energia",
		"Sabesp",
		"Seguradora Porto",
		"Prefeitura de São Paulo",
		"Materiais ABC",
	];
	let expenseCount = 0;

	for (const property of createdProperties) {
		const numExpenses = randomInt(5, 15);

		for (let i = 0; i < numExpenses; i++) {
			const category = randomItem(expenseCategories) as
				| "maintenance"
				| "utilities"
				| "tax"
				| "insurance"
				| "repairs"
				| "supplies";
			const amount =
				category === "tax"
					? randomInt(500, 3000)
					: category === "insurance"
						? randomInt(200, 800)
						: category === "utilities"
							? randomInt(100, 500)
							: randomInt(100, 2000);

			await prisma.expense.create({
				data: {
					id: randomUUID(),
					propertyId: property.id,
					paidBy: createdUsers[0].id,
					category,
					vendor: randomItem(vendors),
					amount,
					currencyId: "BRL",
					date: randomDate(new Date("2024-01-01"), new Date()),
					description: `${category} - ${property.name}`,
					isRecurring: category === "insurance" || category === "tax",
					recurringFrequency:
						category === "insurance" || category === "tax" ? "monthly" : null,
					isTaxDeductible: ["maintenance", "repairs", "supplies"].includes(
						category,
					),
				},
			});
			expenseCount++;
		}
	}
	console.log(`   ✅ ${expenseCount} despesas inseridas\n`);

	// ============================================
	// 13. MAINTENANCE REQUESTS
	// ============================================
	console.log("🔧 Inserindo solicitações de manutenção...");
	const maintenanceTitles = [
		"Vazamento no banheiro",
		"Ar condicionado não funciona",
		"Porta com defeito",
		"Infiltração no teto",
		"Tomada queimada",
		"Interfone com problemas",
		"Fechadura travando",
		"Piso soltando",
	];
	let maintenanceCount = 0;

	for (const unit of createdUnits.slice(0, 20)) {
		if (Math.random() > 0.4) continue;

		await prisma.maintenanceRequest.create({
			data: {
				id: randomUUID(),
				unitId: unit.id,
				requestedBy: createdUsers[0].id,
				assignedTo: Math.random() > 0.5 ? createdUsers[1]?.id : null,
				title: randomItem(maintenanceTitles),
				description: "Solicitação de manutenção preventiva/corretiva.",
				status: randomItem(["open", "in_progress", "closed"]),
				priority: randomItem(["low", "medium", "high"]),
			},
		});
		maintenanceCount++;
	}
	console.log(`   ✅ ${maintenanceCount} solicitações inseridas\n`);

	// ============================================
	// 14. PROPERTY CONTACTS
	// ============================================
	console.log("🔗 Vinculando contatos aos imóveis...");
	let linkCount = 0;

	const ownerContacts = createdContacts.filter((c) => c.type === "owner");
	for (
		let i = 0;
		i < createdProperties.length && i < ownerContacts.length;
		i++
	) {
		const owner = ownerContacts[i % ownerContacts.length];
		await prisma.propertyContact.create({
			data: {
				id: randomUUID(),
				propertyId: createdProperties[i].id,
				contactId: owner.id,
				role: "Proprietário",
			},
		});
		linkCount++;
	}

	const agentContacts = createdContacts.filter((c) => c.type === "agent");
	for (let i = 0; i < 4 && i < agentContacts.length; i++) {
		const agent = agentContacts[i % agentContacts.length];
		await prisma.propertyContact.create({
			data: {
				id: randomUUID(),
				propertyId: createdProperties[i % createdProperties.length].id,
				contactId: agent.id,
				role: "Corretor",
			},
		});
		linkCount++;
	}
	console.log(`   ✅ ${linkCount} vínculos criados\n`);

	// ============================================
	// SUMMARY
	// ============================================
	console.log("═".repeat(50));
	console.log("✅ SEED CONCLUÍDO COM SUCESSO!\n");
	console.log("📊 Resumo:");
	console.log(`   • ${currencies.length} moedas`);
	console.log(`   • ${paymentMethods.length} formas de pagamento`);
	console.log(`   • ${testUsers.length} usuários`);
	console.log(`   • ${organizations.length} organizações`);
	console.log(`   • ${memberCount} membros`);
	console.log(`   • ${contactsData.length} contatos`);
	console.log(`   • ${propertiesData.length} imóveis`);
	console.log(`   • ${createdUnits.length} unidades`);
	console.log(`   • ${leasesCreated.length} contratos`);
	console.log(`   • ${paymentCount} pagamentos`);
	console.log(`   • ${expenseCount} despesas`);
	console.log(`   • ${maintenanceCount} solicitações de manutenção`);
	console.log(`   • ${linkCount} vínculos de contatos\n`);
	console.log("🔐 Credenciais de acesso:");
	console.log("   Email: admin@rentline.com.br");
	console.log("   Senha: senha123");
	console.log("═".repeat(50));
}

main()
	.catch((e) => {
		console.error("❌ Erro durante o seed:", e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
