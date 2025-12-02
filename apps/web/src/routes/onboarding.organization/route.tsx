import {
	Button,
	Input,
	Select,
	SelectItem,
	Autocomplete,
	AutocompleteItem,
} from "@heroui/react";
import { useForm } from "@tanstack/react-form";
import {
	ArrowRight,
	Building2,
	MapPin,
	Globe,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { BRAZILIAN_STATES } from "@/lib/constants/brazil";
import { useCountries } from "@/lib/hooks/use-countries";
import type { Route } from "./+types/route";

export function meta(_args: Route.MetaArgs) {
	return [{ title: "Organization Setup - Rentline" }];
}

export default function OrganizationStep() {
	const navigate = useNavigate();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [selectedCountryCode, setSelectedCountryCode] = useState<'BR' |'MZ' | 'ZA' | undefined>(undefined);

	const { data: countries, isLoading: loadingCountries } = useCountries();

	const form = useForm({
		defaultValues: {
			name: "",
			slug: "",
			countryCode: "",
			city: "",
			state: "",
			cnpj: "",
			phone: "",
			website: "",
		},
		onSubmit: async ({ value }) => {
			setIsSubmitting(true);
			try {
				if (!value.countryCode) {
					toast.error("Please select a country");
					setIsSubmitting(false);
					return;
				}

				const selectedCountry = countries?.find((c) => c.code === value.countryCode);
				
				// Validate CNPJ for Brazil
				if (value.countryCode === "BR" && selectedCountry?.requiredFields?.cnpj) {
					if (!value.cnpj) {
						toast.error("CNPJ é obrigatório para organizações brasileiras");
						setIsSubmitting(false);
						return;
					}
				}

				// Store in sessionStorage for later submission
				const existingData = JSON.parse(sessionStorage.getItem("onboarding_data") || "{}");
				const onboardingData = {
					...existingData,
					organization: {
						...value,
						type: "landlord",
					},
				};

				sessionStorage.setItem("onboarding_data", JSON.stringify(onboardingData));

				toast.success("Organization details saved!");
				navigate("/onboarding/plan");
			} catch {
				toast.error("Error saving details");
			} finally {
				setIsSubmitting(false);
			}
		},
	});

	// Auto-generate slug from name
	const handleNameChange = (name: string) => {
		form.setFieldValue("name", name);
		const slug = name
			.toLowerCase()
			.normalize("NFD")
			.replace(/[\u0300-\u036f]/g, "")
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-|-$/g, "");
		form.setFieldValue("slug", slug);
	};

	const handleCountrySelect = (code: 'BR' | 'MZ' | 'ZA') => {
		setSelectedCountryCode(code);
		form.setFieldValue("countryCode", code);
		form.setFieldValue("state", "");
		form.setFieldValue("cnpj", "");
	};
	// console.log(countries)
	const selectedCountry = useMemo(() => countries?.find((c) => c.code === selectedCountryCode), [countries, selectedCountryCode]);

	const requiresCnpj = useMemo(() => selectedCountryCode ? selectedCountry?.requiredFields?.cnpj : false, [selectedCountryCode]);
	const isBrazil = useMemo(() => selectedCountryCode ? selectedCountry?.code === "BR" : false, [selectedCountryCode]);

	if (loadingCountries) {
		return (
			<OnboardingLayout
				title="Organization Setup"
				description="Configure your organization details"
			>
				<div className="flex items-center justify-center py-12">
					<div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
				</div>
			</OnboardingLayout>
		);
	}

	return (
		<OnboardingLayout
			title="Setup Your Organization"
			description="Configure your organization details"
		>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
				className="space-y-8 max-w-full mx-auto"
				noValidate
			>
				{/* Country Selection */}
			<div className="space-y-10">
				<div className="flex items-center gap-2">
					<Globe className="h-5 w-5 text-primary" />
					<h3 className="font-semibold text-lg">Select Your Country</h3>
					<span className="text-red-500">*</span>
				</div>

				<form.Field name="countryCode">
					{(field) => (
						<Select
							label="Country"
							placeholder="Select a country"
							selectedKeys={field.state.value ? [field.state.value] : []}
							onSelectionChange={(keys) => {
								const value = Array.from(keys)[0] as string;
								handleCountrySelect(value as 'BR' | 'MZ' | 'ZA');
							}}
							size="lg"
							variant="flat"
							isLoading={loadingCountries}
							isRequired={requiresCnpj}
							labelPlacement="outside"
						>
							{countries?.map((country) => (
								<SelectItem
									key={country.code}
									startContent={<span className="text-xl">{country.flag}</span>}
									textValue={country.name}
								>
									<div className="flex flex-col">
										<span className="text-small">{country.name}</span>
										<span className="text-tiny text-default-400">
											{country.currencySymbol} ({country.currencyCode})
										</span>
									</div>
								</SelectItem>
							)) || null}
						</Select>
					)}
				</form.Field>
			</div>

				{/* Organization Details */}
				<div className="space-y-10">
					<div className="flex items-center gap-2">
						<Building2 className="h-5 w-5 text-primary" />
						<h3 className="font-semibold text-lg">Organization Details</h3>
					</div>

					<form.Field name="name">
						{(field) => (
							<Input
								label="Organization Name"
								placeholder="Ex: Imobiliária São Paulo"
								value={field.state.value}
								onBlur={field.handleBlur}
								onValueChange={handleNameChange}
								startContent={<Building2 className="h-4 w-4 text-gray-400" />}
								isRequired
								isInvalid={field.state.meta.errors.length > 0}
								errorMessage={field.state.meta.errors[0]?.message}
								labelPlacement="outside"
								size="lg"
								variant="flat"
								
							/>
						)}
					</form.Field>

					<form.Field name="slug">
						{(field) => (
							<div className="space-y-2">
								<Input
									label="Unique Identifier"
									placeholder="ex: imobiliaria-sao-paulo"
									value={field.state.value}
									onBlur={field.handleBlur}
									onValueChange={(value) => field.handleChange(value)}
									description="Auto generated"
									isRequired
									isInvalid={field.state.meta.errors.length > 0}
									errorMessage={field.state.meta.errors[0]?.message}
									labelPlacement="outside"
									size="lg"
									disabled
									variant="flat"
									
								/>
								{/* <p className="text-xs text-gray-500">
									rentline.com.br/
									<span className="font-medium text-primary">
										{field.state.value || "your-company"}
									</span>
								</p> */}
							</div>
						)}
					</form.Field>

					{requiresCnpj && (
						<form.Field name="cnpj">
							{(field) => (
								<Input
									label="CNPJ"
									placeholder="00.000.000/0000-00"
									value={field.state.value}
									onBlur={field.handleBlur}
									onValueChange={(value) => {
										const cleaned = value.replace(/\D/g, "");
										const formatted = cleaned
											.replace(/^(\d{2})(\d)/, "$1.$2")
											.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
											.replace(/\.(\d{3})(\d)/, ".$1/$2")
											.replace(/(\d{4})(\d)/, "$1-$2");
										field.handleChange(formatted);
									}}
									maxLength={18}
									isRequired
									labelPlacement="outside"
									size="lg"
									description="Brazilian company registration number"
									classNames={{
										input: "font-mono",
									}}
									variant="flat"
								/>
							)}
						</form.Field>
					)}

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<form.Field name="city">
							{(field) => (
								<Input
									label="City"
									placeholder="Ex: São Paulo"
									value={field.state.value}
									onBlur={field.handleBlur}
									onValueChange={(value) => field.handleChange(value)}
									startContent={<MapPin className="h-4 w-4 text-gray-400" />}
									isRequired
									isInvalid={field.state.meta.errors.length > 0}
									errorMessage={field.state.meta.errors[0]?.message}
									labelPlacement="outside"
									size="lg"
									variant="flat"
								/>
							)}
						</form.Field>

						<form.Field name="state">
							{(field) =>
								isBrazil ? (
									<Select
										label="State"
										placeholder="Select"
										selectedKeys={field.state.value ? [field.state.value] : []}
										onSelectionChange={(keys) => {
											const value = Array.from(keys)[0] as string;
											field.handleChange(value);
										}}
										isRequired
										isInvalid={field.state.meta.errors.length > 0}
										errorMessage={field.state.meta.errors[0]?.message}
										labelPlacement="outside"
										size="lg"
										variant="flat"
										
									>
										{BRAZILIAN_STATES.map((state) => (
											<SelectItem key={state.value}>{state.label}</SelectItem>
										))}
									</Select>
								) : (
									<Input
										label="State / Province"
										placeholder="Ex: California"
										value={field.state.value}
										onBlur={field.handleBlur}
										onValueChange={(value) => field.handleChange(value)}
										isRequired
										isInvalid={field.state.meta.errors.length > 0}
										errorMessage={field.state.meta.errors[0]?.message}
										labelPlacement="outside"
										size="lg"
										variant="flat"
										
									/>
								)
							}
						</form.Field>
					</div>
				</div>

				{/* Submit */}
				<div className="flex items-center justify-end pt-6 border-t border-gray-100">
					<form.Subscribe>
						{(state) => (
							<Button
								type="submit"
								color="primary"
								size="lg"
								isDisabled={!state.canSubmit}
								isLoading={isSubmitting}
								endContent={!isSubmitting && <ArrowRight className="h-4 w-4" />}
								className="font-semibold px-8"
							>
								{isSubmitting ? "Saving..." : "Continue to Plans"}
							</Button>
						)}
					</form.Subscribe>
				</div>
			</form>
		</OnboardingLayout>
	);
}
