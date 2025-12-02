import { router } from "../index";
import { brazilRouter } from "./brazil";
import { contactsRouter } from "./contacts";
import { countriesRouter } from "./countries";
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
	countries: countriesRouter,
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

// Export all routers for server setup
export { brazilRouter } from "./brazil";
export { contactsRouter } from "./contacts";
export { countriesRouter } from "./countries";
export { expensesRouter } from "./expenses";
export { healthRouter } from "./health";
export { invoicesRouter } from "./invoices";
export { leasesRouter } from "./leases";
export { maintenanceRouter } from "./maintenance";
export { organizationsRouter } from "./organizations";
export { paymentsRouter } from "./payments";
export { propertiesRouter } from "./properties";
export { salesRouter } from "./sales";
export { unitsRouter } from "./units";
export { userRouter } from "./user";
