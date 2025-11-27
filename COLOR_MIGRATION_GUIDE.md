# Color Migration Guide

This guide documents the color scheme migration from hardcoded colors to theme-aware colors.

## Color Scheme

- **Primary**: Green (`#10B981` / `emerald-500`) - Main brand color, buttons, links
- **Secondary**: Orange (`#FB790E` / `amber-500`) - Accent color, highlights
- **Background**: White (light) / Dark gray (dark)
- **Content**: Various shades for cards, surfaces, borders

## Replacement Patterns

### Gray Colors → Theme Colors

| Old | New | Usage |
|-----|-----|-------|
| `bg-gray-50` | `bg-content1` | Light backgrounds |
| `bg-gray-100` | `bg-content2` | Subtle backgrounds |
| `bg-gray-200` | `bg-content3` | Borders, dividers |
| `bg-gray-800` | `bg-content1` (dark) | Dark backgrounds |
| `text-gray-900` | `text-foreground` | Primary text |
| `text-gray-700` | `text-default-foreground` | Secondary text |
| `text-gray-500` | `text-default-foreground/70` | Tertiary text |
| `text-gray-400` | `text-default-foreground/50` | Muted text |
| `border-gray-200` | `border-default-200` | Light borders |
| `border-gray-700` | `border-default-300` | Dark borders |

### Blue Colors → Primary (Green)

| Old | New |
|-----|-----|
| `bg-blue-*` | `bg-primary` |
| `text-blue-*` | `text-primary` |
| `border-blue-*` | `border-primary` |

### Orange Colors → Secondary

| Old | New |
|-----|-----|
| `bg-orange-*` | `bg-secondary` |
| `text-orange-*` | `text-secondary` |
| `border-orange-*` | `border-secondary` |

### Status Colors

| Old | New |
|-----|-----|
| `bg-green-*` | `bg-success` or `bg-primary` |
| `bg-red-*` | `bg-danger` |
| `bg-yellow-*` | `bg-warning` |

## Dark Mode Classes

Remove all `dark:` variants that override colors. HeroUI handles dark mode automatically through the theme system.

**Before:**
```tsx
className="text-gray-900 dark:text-white"
```

**After:**
```tsx
className="text-foreground"
```

## Common Patterns

### Cards
```tsx
// Before
<Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">

// After
<Card className="border border-default-200 bg-content1">
```

### Text
```tsx
// Before
<p className="text-gray-900 dark:text-white">Title</p>
<p className="text-gray-500 dark:text-gray-400">Description</p>

// After
<p className="text-foreground">Title</p>
<p className="text-default-foreground">Description</p>
```

### Buttons
```tsx
// Before
<Button className="bg-blue-600 hover:bg-blue-700 text-white">

// After
<Button color="primary"> // Uses theme automatically
```

## Files to Update

Priority order:
1. Settings components
2. Dashboard components
3. Property components
4. Lease components
5. Contact components
6. Maintenance components
7. Common UI components

## Testing

After migration:
1. Test light mode
2. Test dark mode
3. Test theme switching
4. Verify all colors are theme-aware
5. Check for any remaining hardcoded hex colors

