import { router } from "../index";
import { healthRouter } from "./health";
import { userRouter } from "./user";
import { brazilRouter } from "./brazil";
import { contactsRouter } from "./contacts";

export const appRouter = router({
	health: healthRouter,
	user: userRouter,
	brazil: brazilRouter,
	contacts: contactsRouter,
});

export type AppRouter = typeof appRouter;
