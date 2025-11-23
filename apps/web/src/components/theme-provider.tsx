import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { HeroUIProvider } from "@heroui/react";

export function ThemeProvider({
	children,
	...props
}: React.ComponentProps<typeof NextThemesProvider>) {
	return (
		<HeroUIProvider>
			<NextThemesProvider {...props}>{children}</NextThemesProvider>
		</HeroUIProvider>
	);
}

export { useTheme } from "next-themes";
