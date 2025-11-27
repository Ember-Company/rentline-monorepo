import { Button, Checkbox, Divider, Input, Spinner } from "@heroui/react";
import { useForm } from "@tanstack/react-form";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import z from "zod";
import { authClient } from "@/lib/auth-client";

export default function SignUpForm() {
	const navigate = useNavigate();
	const { isPending } = authClient.useSession();
	const [showPassword, setShowPassword] = useState(false);
	const [acceptTerms, setAcceptTerms] = useState(false);

	const form = useForm({
		defaultValues: {
			name: "",
			email: "",
			password: "",
			confirmPassword: "",
		},
		onSubmit: async ({ value }) => {
			if (!acceptTerms) {
				toast.error("Você deve aceitar os termos de uso");
				return;
			}

			if (value.password !== value.confirmPassword) {
				toast.error("As senhas não coincidem");
				return;
			}

			await authClient.signUp.email(
				{
					email: value.email,
					password: value.password,
					name: value.name,
				},
				{
					onSuccess: () => {
						toast.success("Conta criada com sucesso!");
						navigate("/onboarding/organization");
					},
					onError: (error) => {
						toast.error(error.error.message || "Erro ao criar conta");
					},
				},
			);
		},
		validators: {
			onSubmit: z.object({
				name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
				email: z.string().email("Email inválido"),
				password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
				confirmPassword: z.string().min(1, "Confirme sua senha"),
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
				<h1 className="font-bold text-2xl text-gray-900">Crie sua conta</h1>
				<p className="mt-2 text-gray-600">
					Comece a gerenciar seus imóveis gratuitamente
				</p>
			</div>

			{/* Form */}
			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
				className="space-y-4"
			>
				<form.Field name="name">
					{(field) => (
						<div className="space-y-1.5">
							<label
								htmlFor={field.name}
								className="font-medium text-gray-700 text-sm"
							>
								Nome completo
							</label>
							<Input
								id={field.name}
								type="text"
								placeholder="João Silva"
								value={field.state.value}
								onBlur={field.handleBlur}
								onValueChange={(value) => field.handleChange(value)}
								startContent={<User className="h-4 w-4 text-gray-400" />}
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
							<label
								htmlFor={field.name}
								className="font-medium text-gray-700 text-sm"
							>
								Senha
							</label>
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
							<p className="text-gray-500 text-xs">Mínimo de 8 caracteres</p>
						</div>
					)}
				</form.Field>

				<form.Field name="confirmPassword">
					{(field) => (
						<div className="space-y-1.5">
							<label
								htmlFor={field.name}
								className="font-medium text-gray-700 text-sm"
							>
								Confirmar senha
							</label>
							<Input
								id={field.name}
								type={showPassword ? "text" : "password"}
								placeholder="••••••••"
								value={field.state.value}
								onBlur={field.handleBlur}
								onValueChange={(value) => field.handleChange(value)}
								startContent={<Lock className="h-4 w-4 text-gray-400" />}
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

				<div className="pt-2">
					<Checkbox
						isSelected={acceptTerms}
						onValueChange={setAcceptTerms}
						size="sm"
					>
						<span className="text-gray-600 text-sm">
							Aceito os{" "}
							<Link to="/terms" className="text-primary hover:text-primary-600">
								Termos de Uso
							</Link>{" "}
							e a{" "}
							<Link
								to="/privacy"
								className="text-primary hover:text-primary-600"
							>
								Política de Privacidade
							</Link>
						</span>
					</Checkbox>
				</div>

				<form.Subscribe>
					{(state) => (
						<Button
							type="submit"
							color="primary"
							className="w-full font-semibold"
							size="lg"
							isDisabled={!state.canSubmit || !acceptTerms}
							isLoading={state.isSubmitting}
						>
							{state.isSubmitting ? "Criando conta..." : "Criar conta"}
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

			{/* Sign In Link */}
			<div className="text-center">
				<p className="text-gray-600">
					Já tem uma conta?{" "}
					<Link
						to="/auth/login"
						className="font-semibold text-primary hover:text-primary-600"
					>
						Fazer login
					</Link>
				</p>
			</div>
		</div>
	);
}
