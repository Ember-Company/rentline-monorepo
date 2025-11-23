import { router } from "../index";
import { healthRouter } from "./health";
import { userRouter } from "./user";
import { brazilRouter } from "./brazil";

export const appRouter = router({
	health: healthRouter,
	user: userRouter,
	brazil: brazilRouter,
});

export type AppRouter = typeof appRouter;
