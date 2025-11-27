// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FormType = any;

import { Button, Input } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { trpc } from "@/utils/trpc";

type Props = {
	form: FormType;
	onNext: () => void;
	isSubmitting: boolean;
};

export function OrganizationBasicInfo({ form, onNext, isSubmitting }: Props) {
	const [cnpjToLookup, setCnpjToLookup] = useState<string | null>(null);

	const cnpjQuery = useQuery({
		...trpc.brazil.getCnpj.queryOptions({
			cnpj: cnpjToLookup || "",
		}),
		enabled: cnpjToLookup !== null && cnpjToLookup.length === 14,
	});

	useEffect(() => {
		if (cnpjQuery.data) {
			const data = cnpjQuery.data;

			// Auto-fill form fields
			if (data.razaoSocial) {
				form.setFieldValue("name", data.razaoSocial);
				form.setFieldValue("razaoSocial", data.razaoSocial);
			}
			if (data.nomeFantasia) {
				form.setFieldValue(
					"slug",
					data.nomeFantasia.toLowerCase().replace(/\s+/g, "-"),
				);
				form.setFieldValue("nomeFantasia", data.nomeFantasia);
			}
			if (data.dataAbertura) {
				form.setFieldValue("dataAbertura", data.dataAbertura);
			}
			if (data.cnae) {
				form.setFieldValue("cnae", data.cnae);
			}
			if (data.porte) {
				form.setFieldValue("porte", data.porte);
			}
			if (data.inscricaoEstadual) {
				form.setFieldValue("inscricaoEstadual", data.inscricaoEstadual);
			}
			if (data.inscricaoMunicipal) {
				form.setFieldValue("inscricaoMunicipal", data.inscricaoMunicipal);
			}

			toast.success("Dados do CNPJ carregados com sucesso");
			setCnpjToLookup(null); // Reset after successful lookup
		}
	}, [cnpjQuery.data, form]);

	useEffect(() => {
		if (cnpjQuery.error) {
			toast.error("Erro ao buscar CNPJ. Verifique o número e tente novamente.");
			setCnpjToLookup(null); // Reset on error
		}
	}, [cnpjQuery.error]);

	const handleCnpjLookup = (cnpj: string) => {
		const cnpjLimpo = cnpj.replace(/\D/g, "");
		if (cnpjLimpo.length !== 14) {
			toast.error("CNPJ deve ter 14 dígitos");
			return;
		}
		setCnpjToLookup(cnpjLimpo);
	};

	return (
		<div className="w-full">
			<div className="space-y-6">
				{/* CNPJ Lookup */}
				<div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
					<form.Field name="cnpj">
						{(field) => (
							<div className="space-y-3">
								<Label
									htmlFor={field.name}
									className="font-medium text-gray-700 text-sm"
								>
									CNPJ <span className="text-red-500">*</span>
								</Label>
								<div className="flex gap-2">
									<Input
										id={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onValueChange={(value) => {
											// Format CNPJ: XX.XXX.XXX/XXXX-XX
											const cleaned = value.replace(/\D/g, "");
											const formatted = cleaned
												.replace(/^(\d{2})(\d)/, "$1.$2")
												.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
												.replace(/\.(\d{3})(\d)/, ".$1/$2")
												.replace(/(\d{4})(\d)/, "$1-$2");
											field.handleChange(formatted);
										}}
										placeholder="00.000.000/0000-00"
										classNames={{
											input: "text-sm",
											inputWrapper:
												"bg-white border-gray-200 hover:border-gray-300 focus-within:border-primary",
										}}
										maxLength={18}
									/>
									<Button
										color="primary"
										variant="flat"
										onPress={() => handleCnpjLookup(field.state.value)}
										isLoading={cnpjQuery.isFetching}
										startContent={<Search className="h-4 w-4" />}
										className="min-w-[100px]"
									>
										Search
									</Button>
								</div>
								<p className="text-gray-500 text-xs">
									Enter your CNPJ and click search to auto-fill the form
								</p>
							</div>
						)}
					</form.Field>
				</div>

				{/* Organization Name */}
				<form.Field name="name">
					{(field) => (
						<div className="space-y-2">
							<Label
								htmlFor={field.name}
								className="font-medium text-gray-700 text-sm"
							>
								Company Name <span className="text-red-500">*</span>
							</Label>
							<Input
								id={field.name}
								value={field.state.value}
								onBlur={field.handleBlur}
								onValueChange={(value) => field.handleChange(value)}
								placeholder="Enter your company name"
								classNames={{
									input: "text-sm",
									inputWrapper:
										"bg-white border-gray-200 hover:border-gray-300 focus-within:border-primary h-11",
								}}
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

				{/* Slug */}
				<form.Field name="slug">
					{(field) => (
						<div className="space-y-2">
							<Label
								htmlFor={field.name}
								className="font-medium text-gray-700 text-sm"
							>
								Slug <span className="text-red-500">*</span>
							</Label>
							<Input
								id={field.name}
								value={field.state.value}
								onBlur={field.handleBlur}
								onValueChange={(value) =>
									field.handleChange(value.toLowerCase().replace(/\s+/g, "-"))
								}
								placeholder="company-name"
								classNames={{
									input: "text-sm",
									inputWrapper:
										"bg-white border-gray-200 hover:border-gray-300 focus-within:border-primary h-11",
								}}
							/>
							<p className="text-gray-500 text-xs">
								Used in your organization URL
							</p>
							{field.state.meta.errors &&
								field.state.meta.errors.length > 0 && (
									<p className="text-red-500 text-sm">
										{String(field.state.meta.errors[0])}
									</p>
								)}
						</div>
					)}
				</form.Field>

				<div className="flex justify-end gap-3 pt-6">
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
