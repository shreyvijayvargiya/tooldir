import React, { useMemo, useState } from "react";
import * as LucideIcons from "lucide-react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import {
	ICONS_CATALOG,
	ICON_CATEGORIES,
	ICON_SIZES,
	ICON_COLOR_PALETTES,
	ICONS_PAGE_SIZE,
} from "@/lib/data/icons-catalog";
import { toast } from "@/lib/toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const buildReactSnippet = (name, size, color) =>
	`import { ${name} } from "lucide-react";\n\n<${name} size={${size}} color="${color}" />`;

const svgFromButton = (buttonEl, size, color) => {
	const svg = buttonEl?.querySelector("svg");
	if (!svg) return null;
	const clone = svg.cloneNode(true);
	clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
	clone.setAttribute("width", String(size));
	clone.setAttribute("height", String(size));
	clone.setAttribute("stroke", color);
	clone.removeAttribute("class");
	return clone.outerHTML;
};

/**
 * 10-column Lucide icon grid with search, category, size & color controls.
 * Click copies React + SVG to the clipboard.
 */
export default function IconsDirectoryGrid() {
	const [search, setSearch] = useState("");
	const [category, setCategory] = useState("all");
	const [size, setSize] = useState(24);
	const [color, setColor] = useState(ICON_COLOR_PALETTES[0].value);
	const [page, setPage] = useState(0);

	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase();
		return ICONS_CATALOG.filter((icon) => {
			if (category !== "all" && icon.category !== category) return false;
			if (!q) return true;
			return (
				icon.name.toLowerCase().includes(q) ||
				icon.category.toLowerCase().includes(q)
			);
		});
	}, [search, category]);

	const totalPages = Math.max(1, Math.ceil(filtered.length / ICONS_PAGE_SIZE));
	const safePage = Math.min(page, totalPages - 1);
	const pageItems = filtered.slice(
		safePage * ICONS_PAGE_SIZE,
		safePage * ICONS_PAGE_SIZE + ICONS_PAGE_SIZE
	);

	const onSearch = (value) => {
		setSearch(value);
		setPage(0);
	};

	const onCategory = (value) => {
		setCategory(value);
		setPage(0);
	};

	const handleCopy = async (event, name) => {
		const reactCode = buildReactSnippet(name, size, color);
		const svg = svgFromButton(event.currentTarget, size, color);
		const payload = svg
			? `${reactCode}\n\n${svg}`
			: reactCode;

		try {
			await navigator.clipboard.writeText(payload);
			toast.success(`Copied ${name}`, {
				description: "React snippet + SVG are on your clipboard",
			});
		} catch {
			toast.error("Could not copy to clipboard");
		}
	};

	const activePalette =
		ICON_COLOR_PALETTES.find((p) => p.value === color) || ICON_COLOR_PALETTES[0];

	return (
		<div className="space-y-4">
			<div className="flex flex-col gap-3 lg:flex-row lg:items-center">
				<div className="relative flex-1 min-w-0">
					<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						value={search}
						onChange={(e) => onSearch(e.target.value)}
						placeholder="Search icons…"
						className="pl-9"
						aria-label="Search icons"
					/>
				</div>

				<div className="flex flex-wrap items-center gap-2">
					<Select value={category} onValueChange={onCategory}>
						<SelectTrigger className="w-[160px]" aria-label="Filter category">
							<SelectValue placeholder="Category" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All categories</SelectItem>
							{ICON_CATEGORIES.map((cat) => (
								<SelectItem key={cat} value={cat}>
									{cat}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					<Select
						value={String(size)}
						onValueChange={(v) => setSize(Number(v))}
					>
						<SelectTrigger className="w-[120px]" aria-label="Icon size">
							<SelectValue placeholder="Size" />
						</SelectTrigger>
						<SelectContent>
							{ICON_SIZES.map((opt) => (
								<SelectItem key={opt.value} value={String(opt.value)}>
									{opt.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					<Select value={color} onValueChange={setColor}>
						<SelectTrigger className="w-[150px]" aria-label="Icon color">
							<span className="flex items-center gap-2 truncate">
								<span
									className="size-3.5 shrink-0 rounded-full border border-border"
									style={{
										background:
											color === "currentColor" ? "var(--foreground)" : color,
									}}
								/>
								<SelectValue placeholder="Color">
									{activePalette.label}
								</SelectValue>
							</span>
						</SelectTrigger>
						<SelectContent>
							{ICON_COLOR_PALETTES.map((palette) => (
								<SelectItem key={palette.id} value={palette.value}>
									<span className="flex items-center gap-2">
										<span
											className="size-3.5 rounded-full border border-border"
											style={{
												background:
													palette.value === "currentColor"
														? "var(--foreground)"
														: palette.value,
											}}
										/>
										{palette.label}
									</span>
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>

			<div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
				<p>
					{filtered.length} icon{filtered.length === 1 ? "" : "s"}
					{category !== "all" ? ` in ${category}` : ""}
					{filtered.length > ICONS_PAGE_SIZE
						? ` · page ${safePage + 1}/${totalPages}`
						: ""}
				</p>
				{totalPages > 1 ? (
					<div className="flex items-center gap-1">
						<Button
							type="button"
							variant="outline"
							size="icon"
							className="size-8"
							disabled={safePage <= 0}
							onClick={() => setPage((p) => Math.max(0, p - 1))}
							aria-label="Previous page"
						>
							<ChevronLeft className="size-4" />
						</Button>
						<Button
							type="button"
							variant="outline"
							size="icon"
							className="size-8"
							disabled={safePage >= totalPages - 1}
							onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
							aria-label="Next page"
						>
							<ChevronRight className="size-4" />
						</Button>
					</div>
				) : null}
			</div>

			{pageItems.length === 0 ? (
				<p className="py-16 text-center text-sm text-muted-foreground">
					No icons match your search.
				</p>
			) : (
				<TooltipProvider delayDuration={200}>
					<div
						className={cn(
							"grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-1.5",
							"rounded-2xl border bg-muted/20 p-2"
						)}
					>
						{pageItems.map((icon) => {
							const Icon = LucideIcons[icon.name];
							if (!Icon) return null;
							return (
								<Tooltip key={icon.name}>
									<TooltipTrigger asChild>
										<button
											type="button"
											onClick={(e) => handleCopy(e, icon.name)}
											className={cn(
												"group flex aspect-square flex-col items-center justify-center gap-1 rounded-xl",
												"border border-transparent bg-background/80 transition-colors",
												"hover:border-primary/30 hover:bg-background hover:shadow-sm",
												"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
											)}
											aria-label={`Copy ${icon.name}`}
										>
											<Icon
												size={size}
												color={color}
												strokeWidth={1.75}
												className="shrink-0 transition-transform group-hover:scale-110"
											/>
											<span className="hidden max-w-full truncate px-1 text-[9px] text-muted-foreground sm:block">
												{icon.name}
											</span>
										</button>
									</TooltipTrigger>
									<TooltipContent side="top">
										<p className="font-medium">{icon.name}</p>
										<p className="text-[11px] text-muted-foreground">
											Click to copy React + SVG
										</p>
									</TooltipContent>
								</Tooltip>
							);
						})}
					</div>
				</TooltipProvider>
			)}
		</div>
	);
}
