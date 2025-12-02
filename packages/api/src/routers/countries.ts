import { z } from "zod";
import { publicProcedure, router } from "../index";
import { COUNTRIES, getEnabledCountries, getCountryByCode, type CountryConfig } from "../config/countries";
import { TRPCError } from "@trpc/server";

/**
 * Countries Router
 * 
 * Public endpoints for country configuration
 */
export const countriesRouter = router({
	/**
	 * List all enabled countries
	 */
	list: publicProcedure.output(z.array(z.custom<CountryConfig>())).query(() => {
		const countries = getEnabledCountries();
		return countries;
	}),

	/**
	 * Get country by code
	 */
	getByCode: publicProcedure
		.input(
			z.object({
				code: z.string().length(2, "Country code must be 2 characters"),
			}),
		)
		.query(({ input }) => {
			const country = getCountryByCode(input.code);
			
			if (!country) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: `Country with code ${input.code} not found`,
				});
			}

			if (!country.enabled) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: `Country ${country.name} is not currently supported`,
				});
			}

			return { country };
		}),
});
