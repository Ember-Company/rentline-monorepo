import { Button, Input } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ChevronRight, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { trpc } from "@/utils/trpc";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FormType = any;

type Props = {
	form: FormType;
	onNext: () => void;
	onBack: () => void;
	isSubmitting: boolean;
};

export function OrganizationAddress({
	form,
	onNext,
	onBack,
	isSubmitting,
}: Props) {
	const [cepToLookup, setCepToLookup] = useState<string | null>(null);

	const cepQuery = useQuery({
		...trpc.brazil.getCep.queryOptions({
			cep: cepToLookup || "",
		}),
		enabled: cepToLookup !== null && cepToLookup.length === 8,
	});

	useEffect(() => {
		if (cepQuery.data) {
			const data = cepQuery.data;

			// Auto-fill form fields
			if (data.rua) {
				form.setFieldValue("address", data.rua);
			}
			if (data.cidade) {
				form.setFieldValue("city", data.cidade);
			}
			if (data.estado) {
				form.setFieldValue("state", data.estado);
			}
			form.setFieldValue("country", "Brasil");

			toast.success("Endereço carregado com sucesso");
			setCepToLookup(null); // Reset after successful lookup
		}
	}, [cepQuery.data, form]);

	useEffect(() => {
		if (cepQuery.error) {
			toast.error("Erro ao buscar CEP. Verifique o número e tente novamente.");
			setCepToLookup(null); // Reset on error
		}
	}, [cepQuery.error]);

	const handleCepLookup = (cep: string) => {
		const cepLimpo = cep.replace(/\D/g, "");
		if (cepLimpo.length !== 8) {
			toast.error("CEP deve ter 8 dígitos");
			return;
		}
		setCepToLookup(cepLimpo);
	};

	return (
		<div className="w-full">
			<div className="space-y-6">
				{/* CEP Lookup */}
				<div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
					<form.Field name="postalCode">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>
									CEP <span className="text-red-500">*</span>
								</Label>
								<div className="flex gap-2">
									<Input
										id={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onValueChange={(value) => {
											// Format CEP: XXXXX-XXX
											const cleaned = value.replace(/\D/g, "");
											const formatted = cleaned.replace(
												/^(\d{5})(\d{3})/,
												"$1-$2",
											);
											field.handleChange(formatted);
										}}
										placeholder="00000-000"
										classNames={{ input: "text-sm" }}
										maxLength={9}
									/>
									<Button
										color="primary"
										variant="flat"
										onPress={() => handleCepLookup(field.state.value)}
										isLoading={cepQuery.isFetching}
										startContent={<Search className="h-4 w-4" />}
									>
										Buscar
									</Button>
								</div>
								<p className="text-gray-500 text-xs">
									Digite o CEP e clique em buscar para preencher automaticamente
								</p>
							</div>
						)}
					</form.Field>
				</div>

				{/* Address */}
				<form.Field name="address">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor={field.name}>
								Endereço <span className="text-red-500">*</span>
							</Label>
							<Input
								id={field.name}
								value={field.state.value}
								onBlur={field.handleBlur}
								onValueChange={(value) => field.handleChange(value)}
								placeholder="Rua, número, complemento"
								classNames={{ input: "text-sm" }}
							/>
							{field.state.meta.errors &&
								field.state.meta.errors.length > 0 && (
									<p className="text-red-500 text-sm">
										{String(field.state.meta.errors[0])}
									</p>
								)}
						</div>
					)}
				</form.Field>

				<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
					<form.Field name="city">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>
									Cidade <span className="text-red-500">*</span>
								</Label>
								<Input
									id={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onValueChange={(value) => field.handleChange(value)}
									placeholder="São Paulo"
									classNames={{ input: "text-sm" }}
								/>
								{field.state.meta.errors &&
									field.state.meta.errors.length > 0 && (
										<p className="text-red-500 text-sm">
											{String(field.state.meta.errors[0])}
										</p>
									)}
							</div>
						)}
					</form.Field>

					<form.Field name="state">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>
									Estado <span className="text-red-500">*</span>
								</Label>
								<Input
									id={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onValueChange={(value) =>
										field.handleChange(value.toUpperCase())
									}
									placeholder="SP"
									classNames={{ input: "text-sm" }}
									maxLength={2}
								/>
								{field.state.meta.errors &&
									field.state.meta.errors.length > 0 && (
										<p className="text-red-500 text-sm">
											{String(field.state.meta.errors[0])}
										</p>
									)}
							</div>
						)}
					</form.Field>

					<form.Field name="country">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>
									País <span className="text-red-500">*</span>
								</Label>
								<Input
									id={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onValueChange={(value) => field.handleChange(value)}
									placeholder="Brasil"
									classNames={{ input: "text-sm" }}
								/>
								{field.state.meta.errors &&
									field.state.meta.errors.length > 0 && (
										<p className="text-red-500 text-sm">
											{String(field.state.meta.errors[0])}
										</p>
									)}
							</div>
						)}
					</form.Field>
				</div>

				<div className="flex justify-between gap-3 pt-6">
					<Button
						variant="light"
						startContent={<ArrowLeft className="h-4 w-4" />}
						onPress={onBack}
						size="lg"
					>
						Back
					</Button>
					<Button
						color="primary"
						endContent={<ChevronRight className="h-4 w-4" />}
						onPress={onNext}
						isLoading={isSubmitting}
						size="lg"
						className="min-w-[140px]"
					>
						Continue
					</Button>
				</div>
			</div>
		</div>
	);
}
