/**
 * Country Configuration System
 * 
 * Defines supported countries with their specific requirements,
 * currency codes, and validation rules.
 */

export interface CountryRequiredFields {
	cnpj?: boolean;
	// Future fields for other countries
	vatNumber?: boolean;
	tradeLicense?: boolean;
	companyRegistration?: boolean;
}

export interface CountryValidationRules {
	cnpj?: RegExp;
	// Future validation rules
	vatNumber?: RegExp;
	tradeLicense?: RegExp;
}

export interface CountryConfig {
	code: string;
	name: string;
	currencyCode: string;
	currencySymbol: string;
	flag: string;
	enabled: boolean;
	requiredFields: CountryRequiredFields;
	validationRules: CountryValidationRules;
	locale: string;
	timezone: string;
}

/**
 * Supported Countries Configuration
 * 
 * Currently supporting:
 * - Brazil (BR)
 * - Mozambique (MZ)
 * - South Africa (ZA)
 */
export const COUNTRIES: Record<string, CountryConfig> = {
	BR: {
		code: "BR",
		name: "Brazil",
		currencyCode: "BRL",
		currencySymbol: "R$",
		flag: "🇧🇷",
		enabled: true,
		locale: "pt-BR",
		timezone: "America/Sao_Paulo",
		requiredFields: {
			cnpj: true,
		},
		validationRules: {
			// CNPJ format: XX.XXX.XXX/XXXX-XX
			cnpj: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
		},
	},
	MZ: {
		code: "MZ",
		name: "Mozambique",
		currencyCode: "MZN",
		currencySymbol: "MT",
		flag: "🇲🇿",
		enabled: true,
		locale: "pt-MZ",
		timezone: "Africa/Maputo",
		requiredFields: {},
		validationRules: {},
	},
	ZA: {
		code: "ZA",
		name: "South Africa",
		currencyCode: "ZAR",
		currencySymbol: "R",
		flag: "🇿🇦",
		enabled: true,
		locale: "en-ZA",
		timezone: "Africa/Johannesburg",
		requiredFields: {},
		validationRules: {},
	},
};

/**
 * Get all enabled countries
 */
export function getEnabledCountries() {
	return Object.values(COUNTRIES).filter((country) => country.enabled);
}

/**
 * Get country by code
 */
export function getCountryByCode(code: string): CountryConfig | undefined {
	return COUNTRIES[code];
}

/**
 * Validate if country code is supported
 */
export function isValidCountryCode(code: string): boolean {
	const country = COUNTRIES[code];
	return !!country && country.enabled;
}

/**
 * Validate CNPJ format (Brazil)
 */
export function validateCNPJ(countryCode: string, cnpj: string): boolean {
	const country = COUNTRIES[countryCode];
	if (!country || !country.validationRules || !country.validationRules.cnpj) {
		return false;
	}
	return country.validationRules.cnpj.test(cnpj);
}

/**
 * Check if country requires specific field
 */
export function requiresField(
	countryCode: string,
	fieldName: keyof CountryRequiredFields,
): boolean {
	const country = COUNTRIES[countryCode];
	if (!country) return false;
	return !!country.requiredFields[fieldName];
}
