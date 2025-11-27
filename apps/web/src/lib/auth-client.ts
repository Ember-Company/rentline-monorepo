import type { auth } from "@rentline/auth";
import {
	adminClient,
	emailOTPClient,
	inferAdditionalFields,
	inferOrgAdditionalFields,
	organizationClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
	baseURL: import.meta.env.VITE_SERVER_URL,
	plugins: [
		inferAdditionalFields<typeof auth>(),
		organizationClient({
			schema: inferOrgAdditionalFields<typeof auth>(),
		}),
		adminClient(),
		emailOTPClient(),
	],
});
