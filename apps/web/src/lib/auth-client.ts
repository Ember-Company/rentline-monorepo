import type { auth } from "@rentline/auth";
import { createAuthClient } from "better-auth/react";
import {
	emailOTPClient,
	inferAdditionalFields,
	organizationClient,
	adminClient,
	inferOrgAdditionalFields,
} from "better-auth/client/plugins";

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
