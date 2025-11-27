import SignUpForm from "@/components/sign-up-form";
import type { Route } from "./+types/route";

export function meta(_args: Route.MetaArgs) {
	return [
		{ title: "Cadastro - Rentline" },
		{ name: "description", content: "Crie sua conta Rentline grátis" },
	];
}

export default function RegisterPage() {
	return <SignUpForm />;
}
