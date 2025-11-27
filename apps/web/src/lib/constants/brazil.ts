// Brazilian States
export const BRAZILIAN_STATES = [
	{ value: "AC", label: "Acre" },
	{ value: "AL", label: "Alagoas" },
	{ value: "AP", label: "Amapá" },
	{ value: "AM", label: "Amazonas" },
	{ value: "BA", label: "Bahia" },
	{ value: "CE", label: "Ceará" },
	{ value: "DF", label: "Distrito Federal" },
	{ value: "ES", label: "Espírito Santo" },
	{ value: "GO", label: "Goiás" },
	{ value: "MA", label: "Maranhão" },
	{ value: "MT", label: "Mato Grosso" },
	{ value: "MS", label: "Mato Grosso do Sul" },
	{ value: "MG", label: "Minas Gerais" },
	{ value: "PA", label: "Pará" },
	{ value: "PB", label: "Paraíba" },
	{ value: "PR", label: "Paraná" },
	{ value: "PE", label: "Pernambuco" },
	{ value: "PI", label: "Piauí" },
	{ value: "RJ", label: "Rio de Janeiro" },
	{ value: "RN", label: "Rio Grande do Norte" },
	{ value: "RS", label: "Rio Grande do Sul" },
	{ value: "RO", label: "Rondônia" },
	{ value: "RR", label: "Roraima" },
	{ value: "SC", label: "Santa Catarina" },
	{ value: "SP", label: "São Paulo" },
	{ value: "SE", label: "Sergipe" },
	{ value: "TO", label: "Tocantins" },
] as const;

// Major Brazilian cities by state (for suggestions)
export const BRAZILIAN_CITIES: Record<string, string[]> = {
	SP: [
		"São Paulo",
		"Campinas",
		"Guarulhos",
		"São Bernardo do Campo",
		"Santo André",
		"Osasco",
		"Ribeirão Preto",
		"Sorocaba",
		"Santos",
		"São José dos Campos",
	],
	RJ: [
		"Rio de Janeiro",
		"Niterói",
		"Nova Iguaçu",
		"Duque de Caxias",
		"Petrópolis",
		"Volta Redonda",
		"Campos dos Goytacazes",
		"São Gonçalo",
		"Belford Roxo",
		"Angra dos Reis",
	],
	MG: [
		"Belo Horizonte",
		"Uberlândia",
		"Contagem",
		"Juiz de Fora",
		"Betim",
		"Montes Claros",
		"Ribeirão das Neves",
		"Uberaba",
		"Governador Valadares",
		"Ipatinga",
	],
	BA: [
		"Salvador",
		"Feira de Santana",
		"Vitória da Conquista",
		"Camaçari",
		"Itabuna",
		"Juazeiro",
		"Lauro de Freitas",
		"Ilhéus",
		"Teixeira de Freitas",
		"Barreiras",
	],
	PR: [
		"Curitiba",
		"Londrina",
		"Maringá",
		"Ponta Grossa",
		"Cascavel",
		"São José dos Pinhais",
		"Foz do Iguaçu",
		"Colombo",
		"Guarapuava",
		"Paranaguá",
	],
	RS: [
		"Porto Alegre",
		"Caxias do Sul",
		"Pelotas",
		"Canoas",
		"Santa Maria",
		"Gravataí",
		"Viamão",
		"Novo Hamburgo",
		"São Leopoldo",
		"Rio Grande",
	],
	SC: [
		"Florianópolis",
		"Joinville",
		"Blumenau",
		"São José",
		"Chapecó",
		"Criciúma",
		"Itajaí",
		"Jaraguá do Sul",
		"Lages",
		"Palhoça",
	],
	PE: [
		"Recife",
		"Jaboatão dos Guararapes",
		"Olinda",
		"Caruaru",
		"Petrolina",
		"Paulista",
		"Cabo de Santo Agostinho",
		"Camaragibe",
		"Garanhuns",
		"Vitória de Santo Antão",
	],
	CE: [
		"Fortaleza",
		"Caucaia",
		"Juazeiro do Norte",
		"Maracanaú",
		"Sobral",
		"Crato",
		"Itapipoca",
		"Maranguape",
		"Iguatu",
		"Quixadá",
	],
	GO: [
		"Goiânia",
		"Aparecida de Goiânia",
		"Anápolis",
		"Rio Verde",
		"Luziânia",
		"Águas Lindas de Goiás",
		"Valparaíso de Goiás",
		"Trindade",
		"Formosa",
		"Novo Gama",
	],
	DF: ["Brasília"],
};

// Property amenities in Portuguese
export const PROPERTY_AMENITIES = [
	{ value: "pool", label: "Piscina" },
	{ value: "gym", label: "Academia" },
	{ value: "parking", label: "Estacionamento" },
	{ value: "security", label: "Segurança 24h" },
	{ value: "elevator", label: "Elevador" },
	{ value: "playground", label: "Playground" },
	{ value: "party_room", label: "Salão de Festas" },
	{ value: "gourmet_area", label: "Área Gourmet" },
	{ value: "sauna", label: "Sauna" },
	{ value: "garden", label: "Jardim" },
	{ value: "barbecue", label: "Churrasqueira" },
	{ value: "sports_court", label: "Quadra Esportiva" },
	{ value: "concierge", label: "Portaria" },
	{ value: "laundry", label: "Lavanderia" },
	{ value: "storage", label: "Depósito" },
	{ value: "pet_friendly", label: "Aceita Pets" },
	{ value: "furnished", label: "Mobiliado" },
	{ value: "air_conditioning", label: "Ar Condicionado" },
	{ value: "balcony", label: "Varanda" },
	{ value: "garage", label: "Garagem" },
];

// Property features in Portuguese
export const PROPERTY_FEATURES = [
	{ value: "solar_energy", label: "Energia Solar" },
	{ value: "natural_gas", label: "Gás Encanado" },
	{ value: "cable_tv", label: "TV a Cabo" },
	{ value: "internet", label: "Internet" },
	{ value: "intercom", label: "Interfone" },
	{ value: "alarm", label: "Alarme" },
	{ value: "cctv", label: "Câmeras de Segurança" },
	{ value: "electric_fence", label: "Cerca Elétrica" },
	{ value: "water_tank", label: "Cisterna" },
	{ value: "generator", label: "Gerador" },
];

// Unit types in Portuguese
export const UNIT_TYPES = [
	{ value: "apartment", label: "Apartamento" },
	{ value: "office", label: "Sala Comercial" },
	{ value: "retail", label: "Loja" },
	{ value: "storage", label: "Depósito" },
	{ value: "parking", label: "Vaga de Garagem" },
] as const;

// Format CEP (Brazilian postal code)
export function formatCEP(cep: string): string {
	const cleanCep = cep.replace(/\D/g, "");
	if (cleanCep.length <= 5) {
		return cleanCep;
	}
	return `${cleanCep.slice(0, 5)}-${cleanCep.slice(5, 8)}`;
}

// Validate CEP format
export function isValidCEP(cep: string): boolean {
	const cleanCep = cep.replace(/\D/g, "");
	return cleanCep.length === 8;
}

// Format currency to BRL
export function formatBRL(value: number): string {
	return new Intl.NumberFormat("pt-BR", {
		style: "currency",
		currency: "BRL",
	}).format(value);
}

// Format area in m²
export function formatArea(value: number): string {
	return `${new Intl.NumberFormat("pt-BR").format(value)} m²`;
}

// Property category labels in Portuguese
export const PROPERTY_CATEGORY_LABELS = {
	rent: "Para Aluguel",
	sale: "Para Venda",
	both: "Aluguel e Venda",
} as const;

// Property status labels in Portuguese
export const PROPERTY_STATUS_LABELS = {
	active: "Ativo",
	inactive: "Inativo",
	sold: "Vendido",
	rented: "Alugado",
} as const;

// Property type labels in Portuguese
export const PROPERTY_TYPE_LABELS = {
	apartment_building: "Prédio de Apartamentos",
	house: "Casa",
	office: "Sala Comercial",
	land: "Terreno",
} as const;

// Unit status labels in Portuguese
export const UNIT_STATUS_LABELS = {
	available: "Disponível",
	occupied: "Ocupado",
	maintenance: "Em Manutenção",
	reserved: "Reservado",
} as const;
