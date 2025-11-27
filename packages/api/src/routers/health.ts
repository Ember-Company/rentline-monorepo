import { publicProcedure, router } from "../index";

export const healthRouter = router({
	healthCheck: publicProcedure.query(() => {
		return "OK";
	}),
});
