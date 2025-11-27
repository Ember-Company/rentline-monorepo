import { Button, Divider, Input, Spinner } from "@heroui/react";
import { useForm } from "@tanstack/react-form";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import z from "zod";
import { authClient } from "@/lib/auth-client";

export default function SignInForm() {
	const navigate = useNavigate();
	const { isPending } = authClient.useSession();
	const [showPassword, setShowPassword] = useState(false);

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
		},
		onSubmit: async ({ value }) => {
			await authClient.signIn.email(
				{
					email: value.email,
					password: value.password,
				},
				{
					onSuccess: () => {
						toast.success("Login realizado com sucesso!");
						navigate("/dashboard");
					},
					onError: (error) => {
						toast.error(error.error.message || "Erro ao fazer login");
					},
				},
			);
		},
		validators: {
			onSubmit: z.object({
				email: z.string().email("Email inválido"),
				password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
			}),
		},
	});

	if (isPending) {
		return (
			<div className="flex items-center justify-center py-12">
				<Spinner size="lg" color="primary" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="text-center">
				<h1 className="font-bold text-2xl text-gray-900">Bem-vindo de volta</h1>
				<p className="mt-2 text-gray-600">Entre com sua conta para continuar</p>
			</div>

			{/* Form */}
			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
				className="space-y-5"
			>
				<form.Field name="email">
					{(field) => (
						<div className="space-y-1.5">
							<label
								htmlFor={field.name}
								className="font-medium text-gray-700 text-sm"
							>
								Email
							</label>
							<Input
								id={field.name}
								type="email"
								placeholder="seu@email.com"
								value={field.state.value}
								onBlur={field.handleBlur}
								onValueChange={(value) => field.handleChange(value)}
								startContent={<Mail className="h-4 w-4 text-gray-400" />}
								classNames={{
									inputWrapper:
										"border-gray-300 bg-white hover:border-gray-400 focus-within:border-primary",
								}}
								isInvalid={field.state.meta.errors.length > 0}
								errorMessage={field.state.meta.errors[0]?.message}
							/>
						</div>
					)}
				</form.Field>

				<form.Field name="password">
					{(field) => (
						<div className="space-y-1.5">
							<div className="flex items-center justify-between">
								<label
									htmlFor={field.name}
									className="font-medium text-gray-700 text-sm"
								>
									Senha
								</label>
								<Link
									to="/auth/forgot-password"
									className="text-primary text-sm hover:text-primary-600"
								>
									Esqueceu a senha?
								</Link>
							</div>
							<Input
								id={field.name}
								type={showPassword ? "text" : "password"}
								placeholder="••••••••"
								value={field.state.value}
								onBlur={field.handleBlur}
								onValueChange={(value) => field.handleChange(value)}
								startContent={<Lock className="h-4 w-4 text-gray-400" />}
								endContent={
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										className="text-gray-400 hover:text-gray-600"
									>
										{showPassword ? (
											<EyeOff className="h-4 w-4" />
										) : (
											<Eye className="h-4 w-4" />
										)}
									</button>
								}
								classNames={{
									inputWrapper:
										"border-gray-300 bg-white hover:border-gray-400 focus-within:border-primary",
								}}
								isInvalid={field.state.meta.errors.length > 0}
								errorMessage={field.state.meta.errors[0]?.message}
							/>
						</div>
					)}
				</form.Field>

				<form.Subscribe>
					{(state) => (
						<Button
							type="submit"
							color="primary"
							className="w-full font-semibold"
							size="lg"
							isDisabled={!state.canSubmit}
							isLoading={state.isSubmitting}
						>
							{state.isSubmitting ? "Entrando..." : "Entrar"}
						</Button>
					)}
				</form.Subscribe>
			</form>

			{/* Divider */}
			<div className="relative">
				<Divider />
				<span className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 bg-gray-50 px-3 text-gray-500 text-sm">
					ou
				</span>
			</div>

			{/* Sign Up Link */}
			<div className="text-center">
				<p className="text-gray-600">
					Não tem uma conta?{" "}
					<Link
						to="/auth/register"
						className="font-semibold text-primary hover:text-primary-600"
					>
						Cadastre-se grátis
					</Link>
				</p>
			</div>

			{/* Demo Credentials */}
			<div className="rounded-lg border border-gray-300 border-dashed bg-gray-50/50 p-4">
				<p className="mb-2 font-medium text-gray-500 text-xs uppercase tracking-wider">
					Credenciais de demonstração
				</p>
				<p className="text-gray-700 text-sm">
					<span className="font-medium">Email:</span> admin@rentline.com.br
				</p>
				<p className="text-gray-700 text-sm">
					<span className="font-medium">Senha:</span> senha123
				</p>
			</div>
		</div>
	);
}
