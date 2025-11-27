import SignInForm from "@/components/sign-in-form";
import type { Route } from "./+types/route";

export function meta(_args: Route.MetaArgs) {
	return [
		{ title: "Entrar - Rentline" },
		{ name: "description", content: "Faça login na sua conta Rentline" },
	];
}

export default function LoginPage() {
	return <SignInForm />;
}
