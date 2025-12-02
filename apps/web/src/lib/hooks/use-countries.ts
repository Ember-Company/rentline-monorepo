import { trpc } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";

/**
 * Hook to fetch all enabled countries
 */
export function useCountries() {
	return useQuery({
		...trpc.countries.list.queryOptions(),
		staleTime: 1000 * 60 * 5,
	})
}

/**
 * Hook to fetch a specific country by code
 */
export function useCountry(code: string) {
	return useQuery({
		...trpc.countries.getByCode.queryOptions({ code }),
		staleTime: 1000 * 60 * 5,
	});
}
