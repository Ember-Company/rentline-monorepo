import { Button } from "@heroui/react";
import type { ReactNode } from "react";

type PageHeaderProps = {
	title: string;
	subtitle?: string;
	actions?: ReactNode;
};

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
	return (
		<div className="flex items-center justify-between">
			<div>
				<h1 className="font-bold text-3xl">{title}</h1>
				{subtitle && <p className="mt-1 text-muted-foreground">{subtitle}</p>}
			</div>
			{actions && <div className="flex gap-2">{actions}</div>}
		</div>
	);
}
