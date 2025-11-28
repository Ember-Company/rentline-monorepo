import { router } from "../index";
import { brazilRouter } from "./brazil";
import { contactsRouter } from "./contacts";
import { expensesRouter } from "./expenses";
import { healthRouter } from "./health";
import { invoicesRouter } from "./invoices";
import { leasesRouter } from "./leases";
import { maintenanceRouter } from "./maintenance";
import { organizationsRouter } from "./organizations";
import { paymentsRouter } from "./payments";
import { propertiesRouter } from "./properties";
import { salesRouter } from "./sales";
import { unitsRouter } from "./units";
import { userRouter } from "./user";

export const appRouter = router({
	health: healthRouter,
	user: userRouter,
	brazil: brazilRouter,
	contacts: contactsRouter,
	organizations: organizationsRouter,
	properties: propertiesRouter,
	units: unitsRouter,
	leases: leasesRouter,
	sales: salesRouter,
	payments: paymentsRouter,
	expenses: expensesRouter,
	maintenance: maintenanceRouter,
	invoices: invoicesRouter,
});

export type AppRouter = typeof appRouter;
