// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FormType = any;

import { Button, Input } from "@heroui/react";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { Label } from "@/components/ui/label";

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
	return (
		<div className="w-full">
			<div className="space-y-6">
				<form.Field name="email">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor={field.name}>
								Email <span className="text-red-500">*</span>
							</Label>
							<Input
								id={field.name}
								type="email"
								value={field.state.value}
								onBlur={field.handleBlur}
								onValueChange={(value) => field.handleChange(value)}
								placeholder="contato@empresa.com.br"
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

				<form.Field name="phone">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor={field.name}>
								Phone <span className="text-red-500">*</span>
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
								classNames={{ input: "text-sm" }}
								maxLength={15}
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

				<form.Field name="website">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor={field.name}>Website</Label>
							<Input
								id={field.name}
								value={field.state.value}
								onBlur={field.handleBlur}
								onValueChange={(value) => field.handleChange(value)}
								placeholder="https://www.empresa.com.br"
								classNames={{ input: "text-sm" }}
							/>
						</div>
					)}
				</form.Field>

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
