// hero.ts
import { heroui } from "@heroui/react";

export default heroui({
	themes: {
		light: {
			colors: {
				primary: {
					DEFAULT: "#FB790E",
					50: "#FFF4E6",
					100: "#FFE6CC",
					200: "#FFCC99",
					300: "#FFB366",
					400: "#FF9933",
					500: "#FB790E",
					600: "#E66A0C",
					700: "#CC5B0A",
					800: "#B34C08",
					900: "#993D06",
					foreground: "#FFFFFF",
				},
				secondary: {
					DEFAULT: "#549F93",
					50: "#E8F5F3",
					100: "#D1EBE7",
					200: "#A3D7CF",
					300: "#75C3B7",
					400: "#47AF9F",
					500: "#549F93",
					600: "#4A8F84",
					700: "#407F75",
					800: "#366F66",
					900: "#2C5F57",
					foreground: "#FFFFFF",
				},
			},
		},
		dark: {
			colors: {
				primary: {
					DEFAULT: "#FB790E",
					50: "#993D06",
					100: "#B34C08",
					200: "#CC5B0A",
					300: "#E66A0C",
					400: "#FF9933",
					500: "#FB790E",
					600: "#FFB366",
					700: "#FFCC99",
					800: "#FFE6CC",
					900: "#FFF4E6",
					foreground: "#FFFFFF",
				},
				secondary: {
					DEFAULT: "#549F93",
					50: "#2C5F57",
					100: "#366F66",
					200: "#407F75",
					300: "#4A8F84",
					400: "#47AF9F",
					500: "#549F93",
					600: "#75C3B7",
					700: "#A3D7CF",
					800: "#D1EBE7",
					900: "#E8F5F3",
					foreground: "#FFFFFF",
				},
			},
		},
	},
});
