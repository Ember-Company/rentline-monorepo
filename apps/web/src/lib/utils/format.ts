export function formatCurrency(amount: number, currency: string = "USD"): string {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: currency,
		minimumFractionDigits: 2,
	}).format(amount);
}

export function formatDate(dateString: string): string {
	const date = new Date(dateString);
	return date.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

export function formatDateLong(dateString: string): string {
	const date = new Date(dateString);
	return date.toLocaleDateString("en-US", {
		month: "long",
		day: "numeric",
		year: "numeric",
	});
}

export function formatDateTime(dateString: string): string {
	const date = new Date(dateString);
	return date.toLocaleString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "numeric",
		minute: "2-digit",
	});
}

