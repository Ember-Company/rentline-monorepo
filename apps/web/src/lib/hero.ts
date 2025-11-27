// hero.ts
import { heroui } from "@heroui/react";

// Color scheme based on Figma design:
// Primary: Green (for buttons, main actions)
// Secondary: Orange (for accents, highlights)
// Both with proper light and dark mode variants

export default heroui({
	themes: {
		light: {
			colors: {
				// Primary: Green (main brand color)
				primary: {
					DEFAULT: "#10B981", // emerald-500 - main green
					50: "#ECFDF5",
					100: "#D1FAE5",
					200: "#A7F3D0",
					300: "#6EE7B7",
					400: "#34D399",
					500: "#10B981", // Main primary
					600: "#059669",
					700: "#047857",
					800: "#065F46",
					900: "#064E3B",
					foreground: "#FFFFFF",
				},
				// Secondary: Orange (accent color)
				secondary: {
					DEFAULT: "#FB790E", // orange-500
					50: "#FFF4E6",
					100: "#FFE6CC",
					200: "#FFCC99",
					300: "#FFB366",
					400: "#FF9933",
					500: "#FB790E", // Main secondary
					600: "#E66A0C",
					700: "#CC5B0A",
					800: "#B34C08",
					900: "#993D06",
					foreground: "#FFFFFF",
				},
				// Background colors
				background: {
					DEFAULT: "#FFFFFF",
					foreground: "#111827",
				},
				// Content colors (for text, borders, etc.)
				content1: {
					DEFAULT: "#FFFFFF",
					foreground: "#111827",
				},
				content2: {
					DEFAULT: "#F9FAFB",
					foreground: "#374151",
				},
				content3: {
					DEFAULT: "#F3F4F6",
					foreground: "#4B5563",
				},
				content4: {
					DEFAULT: "#E5E7EB",
					foreground: "#6B7280",
				},
				// Default colors
				default: {
					50: "#F9FAFB",
					100: "#F3F4F6",
					200: "#E5E7EB",
					300: "#D1D5DB",
					400: "#9CA3AF",
					500: "#6B7280",
					600: "#4B5563",
					700: "#374151",
					800: "#1F2937",
					900: "#111827",
					DEFAULT: "#F3F4F6",
					foreground: "#111827",
				},
				// Success, Warning, Danger, etc. using theme colors
				success: {
					DEFAULT: "#10B981",
					foreground: "#FFFFFF",
				},
				warning: {
					DEFAULT: "#FB790E",
					foreground: "#FFFFFF",
				},
				danger: {
					DEFAULT: "#EF4444",
					foreground: "#FFFFFF",
				},
			},
		},
		dark: {
			colors: {
				// Primary: Green (adjusted for dark mode)
				primary: {
					DEFAULT: "#34D399", // lighter green for dark mode
					50: "#064E3B",
					100: "#065F46",
					200: "#047857",
					300: "#059669",
					400: "#10B981",
					500: "#34D399", // Main primary (lighter for dark)
					600: "#6EE7B7",
					700: "#A7F3D0",
					800: "#D1FAE5",
					900: "#ECFDF5",
					foreground: "#064E3B",
				},
				// Secondary: Orange (adjusted for dark mode)
				secondary: {
					DEFAULT: "#FF9933", // lighter orange for dark mode
					50: "#993D06",
					100: "#B34C08",
					200: "#CC5B0A",
					300: "#E66A0C",
					400: "#FB790E",
					500: "#FF9933", // Main secondary (lighter for dark)
					600: "#FFB366",
					700: "#FFCC99",
					800: "#FFE6CC",
					900: "#FFF4E6",
					foreground: "#993D06",
				},
				// Background colors
				background: {
					DEFAULT: "#111827",
					foreground: "#F9FAFB",
				},
				// Content colors (for text, borders, etc.)
				content1: {
					DEFAULT: "#1F2937",
					foreground: "#F9FAFB",
				},
				content2: {
					DEFAULT: "#374151",
					foreground: "#E5E7EB",
				},
				content3: {
					DEFAULT: "#4B5563",
					foreground: "#D1D5DB",
				},
				content4: {
					DEFAULT: "#6B7280",
					foreground: "#9CA3AF",
				},
				// Default colors
				default: {
					50: "#111827",
					100: "#1F2937",
					200: "#374151",
					300: "#4B5563",
					400: "#6B7280",
					500: "#9CA3AF",
					600: "#D1D5DB",
					700: "#E5E7EB",
					800: "#F3F4F6",
					900: "#F9FAFB",
					DEFAULT: "#374151",
					foreground: "#F9FAFB",
				},
				// Success, Warning, Danger, etc.
				success: {
					DEFAULT: "#34D399",
					foreground: "#064E3B",
				},
				warning: {
					DEFAULT: "#FF9933",
					foreground: "#993D06",
				},
				danger: {
					DEFAULT: "#F87171",
					foreground: "#FFFFFF",
				},
			},
		},
	},
});
