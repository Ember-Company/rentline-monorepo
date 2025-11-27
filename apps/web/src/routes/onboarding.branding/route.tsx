import { Button } from "@heroui/react";
import { ArrowLeft, ArrowRight, Check, Palette, Upload, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import type { Route } from "./+types/route";

export function meta(_args: Route.MetaArgs) {
	return [{ title: "Marca - Rentline" }];
}

const brandColors = [
	{ name: "Azul", value: "#3b82f6", class: "bg-blue-500" },
	{ name: "Verde", value: "#22c55e", class: "bg-green-500" },
	{ name: "Roxo", value: "#8b5cf6", class: "bg-violet-500" },
	{ name: "Rosa", value: "#ec4899", class: "bg-pink-500" },
	{ name: "Laranja", value: "#f97316", class: "bg-orange-500" },
	{ name: "Vermelho", value: "#ef4444", class: "bg-red-500" },
	{ name: "Ciano", value: "#06b6d4", class: "bg-cyan-500" },
	{ name: "Amarelo", value: "#eab308", class: "bg-yellow-500" },
];

export default function BrandingStep() {
	const navigate = useNavigate();
	const [logo, setLogo] = useState<string | null>(null);
	const [selectedColor, setSelectedColor] = useState(brandColors[0].value);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Load existing data
	useEffect(() => {
		const existingData = JSON.parse(
			sessionStorage.getItem("onboarding_data") || "{}",
		);
		if (existingData.branding?.logo) {
			setLogo(existingData.branding.logo);
		}
		if (existingData.branding?.primaryColor) {
			setSelectedColor(existingData.branding.primaryColor);
		}
	}, []);

	const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			if (file.size > 10 * 1024 * 1024) {
				toast.error("Arquivo muito grande. Máximo de 10MB.");
				return;
			}
			const reader = new FileReader();
			reader.onloadend = () => {
				const base64String = reader.result as string;
				setLogo(base64String);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleRemoveLogo = () => {
		setLogo(null);
	};

	const handleNext = () => {
		setIsSubmitting(true);
		try {
			// Store in sessionStorage
			const onboardingData = JSON.parse(
				sessionStorage.getItem("onboarding_data") || "{}",
			);
			onboardingData.branding = {
				logo,
				primaryColor: selectedColor,
			};
			sessionStorage.setItem("onboarding_data", JSON.stringify(onboardingData));

			toast.success("Marca salva!");
			navigate("/onboarding/properties");
		} catch {
			toast.error("Erro ao salvar marca");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleSkip = () => {
		navigate("/onboarding/properties");
	};

	return (
		<OnboardingLayout
			title="Personalização"
			description="Adicione sua logo e escolha a cor principal da sua marca. Este passo é opcional."
		>
			<div className="space-y-8">
				{/* Logo Upload */}
				<div>
					<label className="mb-3 block font-medium text-gray-700 text-sm">
						Logo da empresa
					</label>
					<div className="rounded-xl border-2 border-gray-200 border-dashed bg-gray-50/50 p-8 transition-colors hover:border-gray-300">
						{logo ? (
							<div className="flex flex-col items-center gap-4">
								<div className="relative">
									<img
										src={logo}
										alt="Logo"
										className="max-h-32 max-w-full rounded-lg object-contain"
									/>
									<button
										type="button"
										onClick={handleRemoveLogo}
										className="-right-2 -top-2 absolute flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-md transition-transform hover:scale-110"
									>
										<X className="h-4 w-4" />
									</button>
								</div>
								<p className="text-gray-500 text-sm">Logo carregado</p>
							</div>
						) : (
							<label
								htmlFor="logo-upload"
								className="block cursor-pointer text-center"
							>
								<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-gray-100">
									<Upload className="h-8 w-8 text-gray-400" />
								</div>
								<p className="font-medium text-gray-700 text-sm">
									<span className="text-primary">Clique para enviar</span> ou
									arraste
								</p>
								<p className="mt-1 text-gray-500 text-xs">
									PNG, JPG ou GIF até 10MB
								</p>
								<input
									id="logo-upload"
									type="file"
									accept="image/*"
									className="hidden"
									onChange={handleFileUpload}
								/>
							</label>
						)}
					</div>
				</div>

				{/* Color Selection */}
				<div>
					<label className="mb-3 flex items-center gap-2 font-medium text-gray-700 text-sm">
						<Palette className="h-4 w-4" />
						Cor principal
					</label>
					<div className="grid grid-cols-4 gap-3">
						{brandColors.map((color) => (
							<button
								key={color.value}
								type="button"
								onClick={() => setSelectedColor(color.value)}
								className={`group relative flex h-14 items-center justify-center rounded-xl transition-all ${color.class} ${
									selectedColor === color.value
										? "scale-105 ring-2 ring-gray-900 ring-offset-2"
										: "hover:scale-105"
								}`}
							>
								{selectedColor === color.value && (
									<Check className="h-6 w-6 text-white" />
								)}
								<span className="sr-only">{color.name}</span>
							</button>
						))}
					</div>
					<p className="mt-3 text-gray-500 text-xs">
						Esta cor será usada nos botões, links e elementos de destaque
					</p>
				</div>

				{/* Actions */}
				<div className="flex items-center justify-between gap-3 border-gray-100 border-t pt-6">
					<Button
						variant="light"
						startContent={<ArrowLeft className="h-4 w-4" />}
						onPress={() => navigate("/onboarding/organization")}
					>
						Voltar
					</Button>
					<div className="flex gap-3">
						<Button variant="light" onPress={handleSkip}>
							Pular
						</Button>
						<Button
							color="primary"
							endContent={<ArrowRight className="h-4 w-4" />}
							onPress={handleNext}
							isLoading={isSubmitting}
						>
							Continuar
						</Button>
					</div>
				</div>
			</div>
		</OnboardingLayout>
	);
}
