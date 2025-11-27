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

// Theme accent types
export type ThemeAccent =
	| "blue"
	| "violet"
	| "emerald"
	| "amber"
	| "rose"
	| "slate";

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
	accent: "blue",
	compactMode: false,
	sidebarCollapsed: false,
};

// Accent color CSS variables
const accentColors: Record<ThemeAccent, { primary: string; primaryForeground: string }> = {
	blue: { primary: "221 83% 53%", primaryForeground: "210 40% 98%" },
	violet: { primary: "262 83% 58%", primaryForeground: "270 40% 98%" },
	emerald: { primary: "160 84% 39%", primaryForeground: "152 40% 98%" },
	amber: { primary: "38 92% 50%", primaryForeground: "48 40% 98%" },
	rose: { primary: "350 89% 60%", primaryForeground: "355 40% 98%" },
	slate: { primary: "215 20% 45%", primaryForeground: "210 40% 98%" },
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
	useEffect(() => {
		const root = document.documentElement;
		const accent = accentColors[config.accent];

		root.style.setProperty("--heroui-primary", accent.primary);
		root.style.setProperty("--heroui-primary-foreground", accent.primaryForeground);

		if (config.compactMode) {
			root.classList.add("compact");
		} else {
			root.classList.remove("compact");
		}
	}, [config.accent, config.compactMode]);

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
