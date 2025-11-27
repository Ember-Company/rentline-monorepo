import { HeroUIProvider } from "@heroui/react";
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
	type ReactNode,
} from "react";

// Theme accent types - using green as primary (emerald) and orange as secondary
export type ThemeAccent = "emerald" | "amber";

interface CustomThemeConfig {
	accent: ThemeAccent;
	compactMode: boolean;
	sidebarCollapsed: boolean;
}

interface CustomThemeContextValue extends CustomThemeConfig {
	setAccent: (accent: ThemeAccent) => void;
	setCompactMode: (compact: boolean) => void;
	setSidebarCollapsed: (collapsed: boolean) => void;
	toggleSidebar: () => void;
}

const CustomThemeContext = createContext<CustomThemeContextValue | null>(null);

const STORAGE_KEY = "rentline-custom-theme";

const defaultConfig: CustomThemeConfig = {
	accent: "emerald", // Green as default primary
	compactMode: false,
	sidebarCollapsed: false,
};

// Accent color CSS variables - Green (primary) and Orange (secondary)
const accentColors: Record<ThemeAccent, { primary: string; primaryForeground: string }> = {
	emerald: { primary: "160 84% 39%", primaryForeground: "152 40% 98%" }, // Green
	amber: { primary: "38 92% 50%", primaryForeground: "48 40% 98%" }, // Orange
};

function CustomThemeProvider({ children }: { children: ReactNode }) {
	const [config, setConfig] = useState<CustomThemeConfig>(() => {
		if (typeof window === "undefined") return defaultConfig;
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			try {
				return { ...defaultConfig, ...JSON.parse(stored) };
			} catch {
				return defaultConfig;
			}
		}
		return defaultConfig;
	});

	// Apply custom CSS variables
	// Note: HeroUI handles theme colors automatically, but we keep this for any custom overrides
	useEffect(() => {
		const root = document.documentElement;

		if (config.compactMode) {
			root.classList.add("compact");
		} else {
			root.classList.remove("compact");
		}
	}, [config.compactMode]);

	// Persist to localStorage
	useEffect(() => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
	}, [config]);

	const setAccent = useCallback((accent: ThemeAccent) => {
		setConfig((prev) => ({ ...prev, accent }));
	}, []);

	const setCompactMode = useCallback((compactMode: boolean) => {
		setConfig((prev) => ({ ...prev, compactMode }));
	}, []);

	const setSidebarCollapsed = useCallback((sidebarCollapsed: boolean) => {
		setConfig((prev) => ({ ...prev, sidebarCollapsed }));
	}, []);

	const toggleSidebar = useCallback(() => {
		setConfig((prev) => ({ ...prev, sidebarCollapsed: !prev.sidebarCollapsed }));
	}, []);

	return (
		<CustomThemeContext.Provider
			value={{
				...config,
				setAccent,
				setCompactMode,
				setSidebarCollapsed,
				toggleSidebar,
			}}
		>
			{children}
		</CustomThemeContext.Provider>
	);
}

export function ThemeProvider({
	children,
	...props
}: React.ComponentProps<typeof NextThemesProvider>) {
	return (
		<HeroUIProvider>
			<NextThemesProvider {...props}>
				<CustomThemeProvider>{children}</CustomThemeProvider>
			</NextThemesProvider>
		</HeroUIProvider>
	);
}

// Custom theme hook
export function useCustomTheme() {
	const context = useContext(CustomThemeContext);
	if (!context) {
		throw new Error("useCustomTheme must be used within ThemeProvider");
	}
	return context;
}

// Re-export next-themes useTheme
export { useTheme } from "next-themes";
