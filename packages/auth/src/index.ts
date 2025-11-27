import { expo } from "@better-auth/expo";
import prisma from "@rentline/db";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin, organization } from "better-auth/plugins";

export const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: "postgresql",
	}),
	trustedOrigins: [process.env.CORS_ORIGIN || "", "mybettertapp://", "exp://"],
	emailAndPassword: {
		enabled: true,
	},
	user: {
		additionalFields: {
			hasOnboarded: {
				type: "boolean",
				required: false,
				defaultValue: false,
			},
			phone: {
				type: "string",
				required: false,
			},
			dateOfBirth: {
				type: "date",
				required: false,
			},
			address: {
				type: "string",
				required: false,
			},
			city: {
				type: "string",
				required: false,
			},
			state: {
				type: "string",
				required: false,
			},
			postalCode: {
				type: "string",
				required: false,
			},
			country: {
				type: "string",
				required: false,
			},
			preferredLanguage: {
				type: "string",
				required: false,
			},
			userType: {
				type: "string",
				required: false,
			},
		},
	},
	advanced: {
		defaultCookieAttributes: {
			sameSite: "none",
			secure: true,
			httpOnly: true,
		},
	},
	plugins: [
		expo(), // mobile
		organization({
			schema: {
				organization: {
					additionalFields: {
						address: { type: "string", input: true, required: false },
						city: { type: "string", input: true, required: false },
						state: { type: "string", input: true, required: false },
						postalCode: { type: "string", input: true, required: false },
						country: { type: "string", input: true, required: false },
						phone: { type: "string", input: true, required: false },
						email: { type: "string", input: true, required: false },
						website: { type: "string", input: true, required: false },
						cnpj: { type: "string", input: true, required: false },
						type: { type: "string", input: true, required: false },
					},
				},
			},
		}),
		admin({
			defaultRole: "user",
		}),
		// emailOTP({
		// 	// resend api
		// 	sendVerificationOTP: async ({ email, otp }) => {
		// 		console.log(`Sending verification OTP to ${email}: ${otp}`);
		// 	},
		// }),
	],
});
