import { Button, Card, CardBody, Spinner } from "@heroui/react";
import { Building2, Check, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import type { Route } from "./+types/route";

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "Aceitar Convite - Rentline" },
		{ name: "description", content: "Aceite o convite para fazer parte de uma organização" },
	];
}

type InviteStatus = "loading" | "valid" | "invalid" | "accepted" | "expired" | "error";

interface InviteData {
	organizationName: string;
	organizationSlug: string;
	inviterName: string;
	inviterEmail: string;
	role: string;
	email: string;
}

export default function AcceptInvitePage() {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const { data: session, isPending: isSessionLoading } = authClient.useSession();

	const [status, setStatus] = useState<InviteStatus>("loading");
	const [inviteData, setInviteData] = useState<InviteData | null>(null);
	const [isAccepting, setIsAccepting] = useState(false);

	const token = searchParams.get("token");

	useEffect(() => {
		if (!token) {
			setStatus("invalid");
			return;
		}

		// Validate the invitation token
		const validateInvite = async () => {
			try {
				const result = await authClient.organization.getInvitation({
					invitationId: token,
				});

				if (result.error || !result.data) {
					setStatus("invalid");
					return;
				}

				const invitation = result.data as {
					status: string;
					expiresAt: string;
					organization: { name: string; slug: string };
					inviter: { name?: string; email: string };
					role: string;
					email: string;
				};

				if (invitation.status !== "pending") {
					setStatus(invitation.status === "accepted" ? "accepted" : "invalid");
					return;
				}

				if (new Date(invitation.expiresAt) < new Date()) {
					setStatus("expired");
					return;
				}

				setInviteData({
					organizationName: invitation.organization.name,
					organizationSlug: invitation.organization.slug,
					inviterName: invitation.inviter.name || invitation.inviter.email,
					inviterEmail: invitation.inviter.email,
					role: invitation.role,
					email: invitation.email,
				});
				setStatus("valid");
			} catch {
				setStatus("error");
			}
		};

		validateInvite();
	}, [token]);

	const handleAccept = async () => {
		if (!token) return;

		setIsAccepting(true);
		try {
			const { error } = await authClient.organization.acceptInvitation({
				invitationId: token,
			});

			if (error) {
				throw new Error(typeof error === "string" ? error : error.message || "Falha ao aceitar convite");
			}

			toast.success("Convite aceito! Bem-vindo à organização.");
			setStatus("accepted");

			// Redirect to dashboard after a short delay
			setTimeout(() => {
				navigate("/dashboard");
			}, 2000);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Falha ao aceitar convite");
			setStatus("error");
		} finally {
			setIsAccepting(false);
		}
	};

	// Show loading state
	if (status === "loading" || isSessionLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-primary-50/30 dark:from-gray-950 dark:to-primary-950/20">
				<div className="text-center">
					<Spinner size="lg" color="primary" />
					<p className="mt-4 text-gray-600 dark:text-gray-400">Verificando convite...</p>
				</div>
			</div>
		);
	}

	// User needs to login first
	if (!session && status === "valid") {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-primary-50/30 p-4 dark:from-gray-950 dark:to-primary-950/20">
				<Card className="w-full max-w-md border border-gray-200 dark:border-gray-700">
					<CardBody className="p-8 text-center">
						<div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
							<Building2 className="h-8 w-8 text-white" />
						</div>

						<h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
							Você foi convidado!
						</h1>

						<p className="mb-6 text-gray-600 dark:text-gray-400">
							<strong>{inviteData?.inviterName}</strong> convidou você para fazer parte de{" "}
							<strong>{inviteData?.organizationName}</strong>.
						</p>

						<p className="mb-6 text-sm text-gray-500">
							Para aceitar o convite, faça login ou crie uma conta com o email{" "}
							<strong className="text-primary">{inviteData?.email}</strong>.
						</p>

						<div className="space-y-3">
							<Button
								as={Link}
								to={`/auth/login?email=${encodeURIComponent(inviteData?.email || "")}&redirect=${encodeURIComponent(`/auth/invite?token=${token}`)}`}
								color="primary"
								className="w-full"
								size="lg"
							>
								Fazer Login
							</Button>
							<Button
								as={Link}
								to={`/auth/register?email=${encodeURIComponent(inviteData?.email || "")}&redirect=${encodeURIComponent(`/auth/invite?token=${token}`)}`}
								variant="bordered"
								className="w-full"
								size="lg"
							>
								Criar Conta
							</Button>
						</div>
					</CardBody>
				</Card>
			</div>
		);
	}

	// Valid invitation - show accept UI
	if (status === "valid" && inviteData) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-primary-50/30 p-4 dark:from-gray-950 dark:to-primary-950/20">
				<Card className="w-full max-w-md border border-gray-200 dark:border-gray-700">
					<CardBody className="p-8 text-center">
						<div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
							<Building2 className="h-8 w-8 text-white" />
						</div>

						<h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
							Você foi convidado!
						</h1>

						<p className="mb-2 text-gray-600 dark:text-gray-400">
							<strong>{inviteData.inviterName}</strong> convidou você para fazer parte de:
						</p>

						<div className="my-6 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
							<p className="text-xl font-bold text-gray-900 dark:text-white">
								{inviteData.organizationName}
							</p>
							<p className="mt-1 text-sm text-gray-500">
								Cargo: <span className="font-medium capitalize">{inviteData.role}</span>
							</p>
						</div>

						<div className="space-y-3">
							<Button
								color="primary"
								className="w-full"
								size="lg"
								onPress={handleAccept}
								isLoading={isAccepting}
								startContent={!isAccepting && <Check className="h-5 w-5" />}
							>
								Aceitar Convite
							</Button>
							<Button
								variant="light"
								className="w-full"
								as={Link}
								to="/"
							>
								Recusar
							</Button>
						</div>
					</CardBody>
				</Card>
			</div>
		);
	}

	// Accepted
	if (status === "accepted") {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-green-50/30 p-4 dark:from-gray-950 dark:to-green-950/20">
				<Card className="w-full max-w-md border border-green-200 dark:border-green-800">
					<CardBody className="p-8 text-center">
						<div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500">
							<Check className="h-8 w-8 text-white" />
						</div>

						<h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
							Bem-vindo!
						</h1>

						<p className="mb-6 text-gray-600 dark:text-gray-400">
							Você agora faz parte da organização. Redirecionando para o painel...
						</p>

						<Spinner size="sm" color="primary" />
					</CardBody>
				</Card>
			</div>
		);
	}

	// Invalid, expired, or error
	return (
		<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-red-50/30 p-4 dark:from-gray-950 dark:to-red-950/20">
			<Card className="w-full max-w-md border border-red-200 dark:border-red-800">
				<CardBody className="p-8 text-center">
					<div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500">
						<X className="h-8 w-8 text-white" />
					</div>

					<h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
						{status === "expired" ? "Convite Expirado" : "Convite Inválido"}
					</h1>

					<p className="mb-6 text-gray-600 dark:text-gray-400">
						{status === "expired"
							? "Este convite expirou. Solicite um novo convite ao administrador da organização."
							: "Este convite não é válido ou já foi utilizado."}
					</p>

					<Button as={Link} to="/" color="primary" variant="flat" className="w-full">
						Voltar para a página inicial
					</Button>
				</CardBody>
			</Card>
		</div>
	);
}
