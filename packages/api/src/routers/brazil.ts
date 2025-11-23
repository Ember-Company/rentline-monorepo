import prisma from "@rentline/db";
import { publicProcedure, router } from "../index";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const mapearPorte = (porte?: string): string => {
	if (!porte) return "";
	const porteMap: Record<string, string> = {
		"00": "Não informado",
		"01": "Micro empresa",
		"03": "Empresa de pequeno porte",
		"05": "Demais",
	};
	return porteMap[porte] || porte;
};

const cleanCep = (cep: string): string => {
	return cep.replace(/\D/g, "");
};

const cleanCnpj = (cnpj: string): string => {
	return cnpj.replace(/\D/g, "");
};

const validateCep = (cep: string): void => {
	if (cep.length !== 8) {
		throw new TRPCError({
			code: "BAD_REQUEST",
			message: "CEP deve ter 8 dígitos",
		});
	}
};

const validateCnpj = (cnpj: string): void => {
	if (cnpj.length !== 14) {
		throw new TRPCError({
			code: "BAD_REQUEST",
			message: "CNPJ deve ter 14 dígitos",
		});
	}
};

type ViaCepResponse = {
	logradouro?: string;
	bairro?: string;
	localidade?: string;
	uf?: string;
	erro?: boolean;
};

const fetchViaCep = async (cep: string) => {
	const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
		method: "GET",
	});

	if (!response.ok) {
		throw new TRPCError({
			code: "INTERNAL_SERVER_ERROR",
			message: "Erro ao consultar ViaCEP",
		});
	}

	const data = (await response.json()) as ViaCepResponse;

	if (data.erro) {
		throw new TRPCError({
			code: "NOT_FOUND",
			message: "CEP não encontrado",
		});
	}

	return {
		rua: data.logradouro || "",
		bairro: data.bairro || "",
		cidade: data.localidade || "",
		estado: data.uf || "",
	};
};

type BrasilApiCepResponse = {
	street?: string;
	neighborhood?: string;
	city?: string;
	state?: string;
};

const fetchBrasilApiCep = async (cep: string) => {
	const response = await fetch(`https://brasilapi.com.br/api/cep/v1/${cep}`, {
		method: "GET",
	});

	if (!response.ok) {
		throw new TRPCError({
			code: "INTERNAL_SERVER_ERROR",
			message: "Erro ao consultar BrasilAPI (CEP)",
		});
	}

	const data = (await response.json()) as BrasilApiCepResponse;

	return {
		rua: data.street || "",
		bairro: data.neighborhood || "",
		cidade: data.city || "",
		estado: data.state || "",
	};
};

type BrasilApiCnpjResponse = {
	razao_social?: string;
	nome_fantasia?: string;
	data_inicio_atividade?: string;
	cnae_fiscal_descricao?: string;
	cnae_fiscal?: number | string;
	porte?: string;
	inscricao_estadual?: string;
	inscricao_municipal?: string;
};

const fetchBrasilApiCnpj = async (cnpj: string) => {
	const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`, {
		method: "GET",
	});

	if (!response.ok) {
		throw new TRPCError({
			code: "INTERNAL_SERVER_ERROR",
			message: "Erro ao consultar BrasilAPI (CNPJ)",
		});
	}

	const data = (await response.json()) as BrasilApiCnpjResponse;

	return {
		razaoSocial: data.razao_social || data.nome_fantasia || "",
		nomeFantasia: data.nome_fantasia || data.razao_social || "",
		dataAbertura: data.data_inicio_atividade?.split("T")[0] || "",
		cnae: data.cnae_fiscal_descricao || data.cnae_fiscal?.toString() || "",
		porte: mapearPorte(data.porte),
		inscricaoEstadual: data.inscricao_estadual || "",
		inscricaoMunicipal: data.inscricao_municipal || "",
	};
};

type ReceitaWsCnpjResponse = {
	nome?: string;
	fantasia?: string;
	abertura?: string;
	atividade_principal?: Array<{ text?: string }>;
	porte?: string;
};

const fetchReceitaWsCnpj = async (cnpj: string) => {
	const response = await fetch(`https://www.receitaws.com.br/v1/cnpj/${cnpj}`, {
		method: "GET",
	});

	if (!response.ok) {
		throw new TRPCError({
			code: "INTERNAL_SERVER_ERROR",
			message: "Erro ao consultar ReceitaWS",
		});
	}

	const data = (await response.json()) as ReceitaWsCnpjResponse;

	return {
		razaoSocial: data.nome || "",
		nomeFantasia: data.fantasia || data.nome || "",
		dataAbertura: data.abertura || "",
		cnae: data.atividade_principal?.[0]?.text || "",
		porte: mapearPorte(data.porte),
		inscricaoEstadual: "",
		inscricaoMunicipal: "",
	};
};

export const brazilRouter = router({
	getCep: publicProcedure
		.input(z.object({ cep: z.string().min(1, "CEP é obrigatório") }))
		.query(async ({ input }) => {
			const cepLimpo = cleanCep(input.cep);
			validateCep(cepLimpo);

			try {
				return await fetchViaCep(cepLimpo);
			} catch (error) {
				// Fallback para BrasilAPI
				if (error instanceof TRPCError && error.code === "NOT_FOUND") {
					throw error; // Re-throw NOT_FOUND errors
				}

				try {
					return await fetchBrasilApiCep(cepLimpo);
				} catch (fallbackError) {
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: "Serviço de consulta de CEP indisponível",
						cause: fallbackError,
					});
				}
			}
		}),
	getCnpj: publicProcedure
		.input(z.object({ cnpj: z.string().min(1, "CNPJ é obrigatório") }))
		.query(async ({ input }) => {
			const cnpjLimpo = cleanCnpj(input.cnpj);
			validateCnpj(cnpjLimpo);

			try {
				return await fetchBrasilApiCnpj(cnpjLimpo);
			} catch (error) {
				// Fallback para ReceitaWS
				try {
					return await fetchReceitaWsCnpj(cnpjLimpo);
				} catch (fallbackError) {
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: "Serviço de consulta de CNPJ indisponível",
						cause: fallbackError,
					});
				}
			}
		}),
});
