/**
 * Theme utility functions to ensure consistent color usage
 * All colors should use these utilities instead of hardcoded values
 */

/**
 * Get theme-aware color classes
 * Use these instead of hardcoded Tailwind color classes
 */
export const themeColors = {
	// Primary (Green)
	primary: {
		bg: "bg-primary",
		text: "text-primary",
		border: "border-primary",
		hover: "hover:bg-primary",
		foreground: "text-primary-foreground",
	},
	// Secondary (Orange)
	secondary: {
		bg: "bg-secondary",
		text: "text-secondary",
		border: "border-secondary",
		hover: "hover:bg-secondary",
		foreground: "text-secondary-foreground",
	},
	// Background colors
	background: {
		DEFAULT: "bg-background",
		foreground: "text-foreground",
	},
	// Content colors (for cards, surfaces)
	content: {
		1: {
			bg: "bg-content1",
			text: "text-content1-foreground",
		},
		2: {
			bg: "bg-content2",
			text: "text-content2-foreground",
		},
		3: {
			bg: "bg-content3",
			text: "text-content3-foreground",
		},
		4: {
			bg: "bg-content4",
			text: "text-content4-foreground",
		},
	},
	// Default/neutral colors
	default: {
		bg: "bg-default",
		text: "text-default-foreground",
		border: "border-default",
	},
	// Status colors
	success: {
		bg: "bg-success",
		text: "text-success-foreground",
		border: "border-success",
	},
	warning: {
		bg: "bg-warning",
		text: "text-warning-foreground",
		border: "border-warning",
	},
	danger: {
		bg: "bg-danger",
		text: "text-danger-foreground",
		border: "border-danger",
	},
} as const;

/**
 * Common color replacement patterns:
 * 
 * OLD -> NEW
 * bg-gray-* -> bg-content* or bg-default
 * text-gray-* -> text-foreground or text-content*-foreground
 * border-gray-* -> border-default or border-content*
 * 
 * bg-blue-* -> bg-primary
 * text-blue-* -> text-primary
 * border-blue-* -> border-primary
 * 
 * bg-orange-* -> bg-secondary
 * text-orange-* -> text-secondary
 * border-orange-* -> border-secondary
 * 
 * bg-green-* -> bg-success or bg-primary
 * bg-red-* -> bg-danger
 * bg-yellow-* -> bg-warning
 */

