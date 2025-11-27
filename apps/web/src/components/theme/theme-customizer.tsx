import {
	Button,
	Popover,
	PopoverContent,
	PopoverTrigger,
	Switch,
} from "@heroui/react";
import { Check, Monitor, Moon, Palette, Sun } from "lucide-react";
import { useTheme, useCustomTheme, type ThemeAccent } from "../theme-provider";

const themeModes = [
	{ value: "light", label: "Claro", icon: Sun },
	{ value: "dark", label: "Escuro", icon: Moon },
	{ value: "system", label: "Sistema", icon: Monitor },
] as const;

const accentColors: { value: ThemeAccent; label: string; color: string }[] = [
	{ value: "blue", label: "Azul", color: "bg-blue-500" },
	{ value: "violet", label: "Violeta", color: "bg-violet-500" },
	{ value: "emerald", label: "Esmeralda", color: "bg-emerald-500" },
	{ value: "amber", label: "Âmbar", color: "bg-amber-500" },
	{ value: "rose", label: "Rosa", color: "bg-rose-500" },
	{ value: "slate", label: "Cinza", color: "bg-slate-500" },
];

export function ThemeCustomizer() {
	const { theme, setTheme } = useTheme();
	const { accent, compactMode, setAccent, setCompactMode } = useCustomTheme();

	return (
		<Popover placement="bottom-end">
			<PopoverTrigger>
				<Button variant="light" isIconOnly size="sm" aria-label="Tema">
					<Palette className="h-4 w-4" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-72 p-4">
				<div className="space-y-4">
					{/* Theme Mode */}
					<div>
						<p className="mb-2 font-medium text-gray-700 text-xs uppercase tracking-wider dark:text-gray-300">
							Modo
						</p>
						<div className="flex gap-2">
							{themeModes.map((item) => {
								const Icon = item.icon;
								const isActive = theme === item.value;
								return (
									<button
										key={item.value}
										type="button"
										onClick={() => setTheme(item.value)}
										className={`flex flex-1 flex-col items-center gap-1 rounded-lg border p-2 transition-all ${
											isActive
												? "border-primary bg-primary-50 text-primary dark:bg-primary-900/20"
												: "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-800"
										}`}
									>
										<Icon className="h-4 w-4" />
										<span className="text-xs">{item.label}</span>
									</button>
								);
							})}
						</div>
					</div>

					{/* Accent Color */}
					<div>
						<p className="mb-2 font-medium text-gray-700 text-xs uppercase tracking-wider dark:text-gray-300">
							Cor de destaque
						</p>
						<div className="grid grid-cols-6 gap-2">
							{accentColors.map((item) => {
								const isActive = accent === item.value;
								return (
									<button
										key={item.value}
										type="button"
										onClick={() => setAccent(item.value)}
										className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${item.color} ${
											isActive ? "ring-2 ring-gray-400 ring-offset-2" : ""
										}`}
										title={item.label}
									>
										{isActive && <Check className="h-4 w-4 text-white" />}
									</button>
								);
							})}
						</div>
					</div>

					{/* Compact Mode */}
					<div className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700">
						<div>
							<p className="font-medium text-gray-900 text-sm dark:text-gray-100">
								Modo Compacto
							</p>
							<p className="text-gray-500 text-xs dark:text-gray-400">
								Reduz espaçamentos
							</p>
						</div>
						<Switch
							size="sm"
							isSelected={compactMode}
							onValueChange={setCompactMode}
						/>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}
