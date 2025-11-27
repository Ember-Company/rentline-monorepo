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
		expo(),
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
			async sendInvitationEmail({ email, inviter, organization, token }) {
				// Check if Resend is configured
				const resendApiKey = process.env.RESEND_API_KEY;
				if (!resendApiKey) {
					console.log("Resend API key not configured. Invitation email not sent.");
					console.log(`Invitation for ${email} to join ${organization.name}`);
					console.log(`Token: ${token}`);
					return;
				}

				const baseUrl = process.env.CORS_ORIGIN || "http://localhost:3000";
				const inviteLink = `${baseUrl}/auth/invite?token=${token}`;

				try {
					const response = await fetch("https://api.resend.com/emails", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${resendApiKey}`,
						},
						body: JSON.stringify({
							from: process.env.EMAIL_FROM || "Rentline <noreply@rentline.com.br>",
							to: email,
							subject: `Você foi convidado para ${organization.name}`,
							html: `
								<!DOCTYPE html>
								<html>
								<head>
									<meta charset="utf-8">
									<meta name="viewport" content="width=device-width, initial-scale=1.0">
								</head>
								<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5;">
									<div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
										<div style="background-color: white; border-radius: 12px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
											<div style="text-align: center; margin-bottom: 32px;">
												<div style="display: inline-block; width: 48px; height: 48px; background-color: #fb790e; border-radius: 12px; line-height: 48px; color: white; font-weight: bold; font-size: 24px;">R</div>
												<h1 style="margin: 16px 0 0 0; font-size: 24px; color: #18181b;">Rentline</h1>
											</div>
											
											<h2 style="margin: 0 0 16px 0; font-size: 20px; color: #18181b; text-align: center;">Você foi convidado!</h2>
											
											<p style="margin: 0 0 24px 0; color: #52525b; line-height: 1.6; text-align: center;">
												<strong>${inviter.name || inviter.email}</strong> convidou você para fazer parte da organização <strong>${organization.name}</strong> no Rentline.
											</p>
											
											<div style="text-align: center; margin: 32px 0;">
												<a href="${inviteLink}" style="display: inline-block; background-color: #fb790e; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
													Aceitar Convite
												</a>
											</div>
											
											<p style="margin: 24px 0 0 0; color: #71717a; font-size: 14px; text-align: center;">
												Se você não esperava este convite, pode ignorar este email.
											</p>
											
											<hr style="border: none; border-top: 1px solid #e4e4e7; margin: 32px 0;">
											
											<p style="margin: 0; color: #a1a1aa; font-size: 12px; text-align: center;">
												Este convite expira em 7 dias.
											</p>
										</div>
									</div>
								</body>
								</html>
							`,
						}),
					});

					if (!response.ok) {
						const errorData = await response.json();
						console.error("Failed to send invitation email:", errorData);
					}
				} catch (error) {
					console.error("Failed to send invitation email:", error);
				}
			},
		}),
		admin({
			defaultRole: "user",
		}),
	],
});
