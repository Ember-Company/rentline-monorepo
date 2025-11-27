import { Button, Spinner } from "@heroui/react";
import { ArrowLeft, CheckCircle, Rocket, XCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { useCompleteOnboarding } from "@/hooks/use-onboarding";
import type { Route } from "./+types/route";

export function meta(_args: Route.MetaArgs) {
	return [{ title: "Concluir Configuração - Rentline" }];
}

type CompletionState = "loading" | "success" | "error" | "no-data";

export default function CompleteStep() {
	const navigate = useNavigate();
	const { completeOnboarding, error, isSubmitting, isSuccess } =
		useCompleteOnboarding();
	const [state, setState] = useState<CompletionState>("loading");
	const hasAttempted = useRef(false);

	useEffect(() => {
		// Only attempt once
		if (hasAttempted.current) return;

		// Check if we have onboarding data
		const storedData = sessionStorage.getItem("onboarding_data");

		if (!storedData) {
			setState("no-data");
			hasAttempted.current = true;
			return;
		}

		try {
			const data = JSON.parse(storedData);
			// Validate that we have organization data
			if (!data?.organization?.name || !data?.organization?.slug) {
				setState("no-data");
				hasAttempted.current = true;
				return;
			}

			// Trigger the completion
			hasAttempted.current = true;
			completeOnboarding();
		} catch {
			setState("no-data");
			hasAttempted.current = true;
		}
	}, [completeOnboarding]);

	// Handle success
	useEffect(() => {
		if (isSuccess) {
			setState("success");
			// Clear onboarding data
			sessionStorage.removeItem("onboarding_data");
			// Auto-redirect after 3 seconds
			const timeout = setTimeout(() => {
				navigate("/dashboard", { replace: true });
			}, 3000);
			return () => clearTimeout(timeout);
		}
	}, [isSuccess, navigate]);

	// Handle error
	useEffect(() => {
		if (error) {
			setState("error");
		}
	}, [error]);

	const handleGoToDashboard = () => {
		navigate("/dashboard", { replace: true });
	};

	const handleRetry = () => {
		setState("loading");
		hasAttempted.current = false;
		completeOnboarding();
	};

	const handleGoBack = () => {
		navigate("/onboarding/organization", { replace: true });
	};

	// Loading state
	if (state === "loading" || isSubmitting) {
		return (
			<OnboardingLayout
				title="Finalizando"
				description="Estamos configurando sua conta..."
				showProgress={false}
			>
				<div className="flex flex-col items-center py-12">
					<Spinner size="lg" color="primary" />
					<p className="mt-6 text-center text-gray-600">
						Por favor, aguarde enquanto criamos sua organização e configuramos
						tudo para você.
					</p>
				</div>
			</OnboardingLayout>
		);
	}

	// No data state
	if (state === "no-data") {
		return (
			<OnboardingLayout
				title="Dados não encontrados"
				description="Não encontramos os dados da configuração."
				showProgress={false}
			>
				<div className="flex flex-col items-center py-8">
					<div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
						<XCircle className="h-10 w-10 text-yellow-500" />
					</div>
					<p className="mb-6 text-center text-gray-600">
						Parece que você ainda não preencheu os dados da sua empresa. Vamos
						começar do início?
					</p>
					<Button
						color="primary"
						startContent={<ArrowLeft className="h-4 w-4" />}
						onPress={handleGoBack}
					>
						Voltar ao início
					</Button>
				</div>
			</OnboardingLayout>
		);
	}

	// Error state
	if (state === "error") {
		return (
			<OnboardingLayout
				title="Ops! Algo deu errado"
				description="Não foi possível completar a configuração."
				showProgress={false}
			>
				<div className="flex flex-col items-center py-8">
					<div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
						<XCircle className="h-10 w-10 text-red-500" />
					</div>
					<p className="mb-2 text-center font-medium text-gray-900">
						{error || "Ocorreu um erro inesperado"}
					</p>
					<p className="mb-6 text-center text-gray-500 text-sm">
						Não se preocupe, seus dados foram salvos. Você pode tentar
						novamente.
					</p>
					<div className="flex gap-3">
						<Button variant="bordered" onPress={handleGoBack}>
							Voltar
						</Button>
						<Button color="primary" onPress={handleRetry}>
							Tentar novamente
						</Button>
					</div>
				</div>
			</OnboardingLayout>
		);
	}

	// Success state
	return (
		<OnboardingLayout
			title="Tudo pronto!"
			description="Sua conta foi configurada com sucesso."
			showProgress={false}
		>
			<div className="flex flex-col items-center py-8">
				<div className="relative mb-6">
					<div className="flex h-20 w-20 animate-pulse items-center justify-center rounded-full bg-green-100">
						<CheckCircle className="h-12 w-12 text-green-500" />
					</div>
					<div className="-bottom-1 -right-1 absolute flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
						<Rocket className="h-4 w-4" />
					</div>
				</div>

				<h2 className="mb-2 font-bold text-gray-900 text-xl">Parabéns! 🎉</h2>
				<p className="mb-8 text-center text-gray-600">
					Sua organização foi criada e você está pronto para começar a gerenciar
					seus imóveis.
				</p>

				<div className="w-full space-y-3">
					<Button
						color="primary"
						size="lg"
						className="w-full font-semibold"
						endContent={<Rocket className="h-4 w-4" />}
						onPress={handleGoToDashboard}
					>
						Ir para o Painel
					</Button>
					<p className="text-center text-gray-500 text-xs">
						Você será redirecionado automaticamente em alguns segundos
					</p>
				</div>
			</div>
		</OnboardingLayout>
	);
}
