import { Button } from "@heroui/react";
import { ReactNode } from "react";

type PageHeaderProps = {
	title: string;
	subtitle?: string;
	actions?: ReactNode;
};

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
	return (
		<div className="flex justify-between items-center">
			<div>
				<h1 className="text-3xl font-bold">{title}</h1>
				{subtitle && (
					<p className="text-muted-foreground mt-1">{subtitle}</p>
				)}
			</div>
			{actions && <div className="flex gap-2">{actions}</div>}
		</div>
	);
}

