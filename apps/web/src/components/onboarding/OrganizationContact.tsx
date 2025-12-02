// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FormType = any;

import { Button, Card, CardBody, Input, Radio, RadioGroup } from "@heroui/react";
import { ArrowLeft, Building2, Check, ChevronRight, Globe } from "lucide-react";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { useCountries } from "@/lib/hooks/use-countries";

type Props = {
	form: FormType;
	onNext: () => void;
	onBack: () => void;
	isSubmitting: boolean;
};

export function OrganizationContact({
	form,
	onNext,
	onBack,
	isSubmitting,
}: Props) {
	const { data: countriesData, isLoading } = useCountries();
	const countries = countriesData?.countries || [];
	const [selectedCountry, setSelectedCountry] = useState<string>(
		form.getFieldValue("countryCode") || "",
	);

	// Get selected country config
	const selectedCountryConfig = countries.find((c) => c.code === selectedCountry);
	const requiresCnpj = selectedCountryConfig?.requiredFields?.cnpj || false;

	const handleCountrySelect = (code: string) => {
		setSelectedCountry(code);
		form.setFieldValue("countryCode", code);
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-12">
				<div className="text-center">
					<div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
					<p className="text-sm text-gray-500">Loading countries...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="w-full">
			<div className="space-y-8">
				{/* Header */}
				<div className="text-center space-y-2">
					<div className="flex justify-center mb-4">
						<div className="p-3 rounded-full bg-primary/10">
							<Building2 className="h-8 w-8 text-primary" />
						</div>
					</div>
					<h2 className="text-2xl font-bold">Organization Details</h2>
					<p className="text-gray-500 text-sm max-w-md mx-auto">
						Tell us about your organization and select your country to customize your experience
					</p>
				</div>

				{/* Country Selection */}
				<div className="space-y-3">
					<div className="flex items-center gap-2">
						<Globe className="h-4 w-4 text-gray-500" />
						<Label className="text-base font-semibold">
							Select Your Country <span className="text-red-500">*</span>
						</Label>
					</div>
					
					<div className="grid grid-cols-3 gap-4">
						{countries.map((country) => (
							<Card
								key={country.code}
								isPressable
								isHoverable
								onPress={() => handleCountrySelect(country.code)}
								className={`cursor-pointer transition-all ${
									selectedCountry === country.code
										? "border-2 border-primary bg-primary/5"
										: "border border-gray-200 hover:border-gray-300"
								}`}
							>
								<CardBody className="py-6">
									<div className="text-center space-y-2">
										<div className="text-4xl mb-2">{country.flag}</div>
										<p className="font-semibold text-sm">{country.name}</p>
										<p className="text-xs text-gray-500">{country.currencySymbol}</p>
										{selectedCountry === country.code && (
											<div className="absolute top-2 right-2">
												<div className="p-1 rounded-full bg-primary">
													<Check className="h-3 w-3 text-white" />
												</div>
											</div>
										)}
									</div>
								</CardBody>
							</Card>
						))}
					</div>
				</div>

				{/* Organization Name */}
				<form.Field name="name">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor={field.name} className="text-base">
								Organization Name <span className="text-red-500">*</span>
							</Label>
							<Input
								id={field.name}
								value={field.state.value}
								onBlur={field.handleBlur}
								onValueChange={(value) => field.handleChange(value)}
								placeholder="Enter your organization name"
								size="lg"
								classNames={{ input: "text-base" }}
								startContent={<Building2 className="h-4 w-4 text-gray-400" />}
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

				{/* CNPJ (Only for Brazil) */}
				{requiresCnpj && selectedCountry === "BR" && (
					<form.Field name="cnpj">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name} className="text-base">
									CNPJ <span className="text-red-500">*</span>
								</Label>
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
									size="lg"
									maxLength={18}
									classNames={{ input: "text-base font-mono" }}
									description="Brazilian company registration number"
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
				)}

				{/* Phone */}
				<form.Field name="phone">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor={field.name} className="text-base">
								Phone Number <span className="text-red-500">*</span>
							</Label>
							<Input
								id={field.name}
								value={field.state.value}
								onBlur={field.handleBlur}
								onValueChange={(value) => {
									// Format phone: (XX) XXXXX-XXXX
									const cleaned = value.replace(/\D/g, "");
									const formatted = cleaned
										.replace(/^(\d{2})(\d)/, "($1) $2")
										.replace(/(\d{5})(\d)/, "$1-$2");
									field.handleChange(formatted);
								}}
								placeholder="(11) 99999-9999"
								size="lg"
								maxLength={15}
								classNames={{ input: "text-base" }}
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

				{/* Website (Optional) */}
				<form.Field name="website">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor={field.name} className="text-base">
								Website
								<span className="text-gray-400 text-sm ml-2">(optional)</span>
							</Label>
							<Input
								id={field.name}
								value={field.state.value}
								onBlur={field.handleBlur}
								onValueChange={(value) => field.handleChange(value)}
								placeholder="https://www.yourcompany.com"
								size="lg"
								classNames={{ input: "text-base" }}
								startContent={<Globe className="h-4 w-4 text-gray-400" />}
							/>
						</div>
					)}
				</form.Field>

				{/* Footer Info */}
				{selectedCountryConfig && (
					<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
						<p className="text-sm text-blue-900">
							<strong>Currency:</strong> {selectedCountryConfig.currencyCode} ({selectedCountryConfig.currencySymbol})
						</p>
						<p className="text-xs text-blue-700 mt-1">
							Your dashboard will be configured for {selectedCountryConfig.name}
						</p>
					</div>
				)}

				{/* Buttons */}
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
						isDisabled={!selectedCountry}
					>
						Continue
					</Button>
				</div>
			</div>
		</div>
	);
}
