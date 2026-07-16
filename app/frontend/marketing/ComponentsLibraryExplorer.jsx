import React, { useMemo, useState } from "react";
import {
	ChevronLeft,
	ChevronRight,
	Copy,
	Search,
} from "lucide-react";
import {
	COMPONENTS_CATALOG,
	COMPONENT_SECTIONS,
} from "@/lib/data/components-catalog";
import { ComponentPreview } from "./component-library/ComponentPreviews";
import { toast } from "@/lib/toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TABS = [
	{ id: "preview", label: "Preview" },
	{ id: "react", label: "React" },
	{ id: "html", label: "HTML" },
];

/**
 * Docs-style component explorer: sidebar list, search, Preview / React / HTML tabs.
 */
export default function ComponentsLibraryExplorer() {
	const [search, setSearch] = useState("");
	const [activeId, setActiveId] = useState(COMPONENTS_CATALOG[0]?.id);
	const [tab, setTab] = useState("preview");

	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase();
		if (!q) return COMPONENTS_CATALOG;
		return COMPONENTS_CATALOG.filter(
			(c) =>
				c.name.toLowerCase().includes(q) ||
				c.description.toLowerCase().includes(q) ||
				c.section.toLowerCase().includes(q)
		);
	}, [search]);

	const activeIndex = filtered.findIndex((c) => c.id === activeId);
	const active =
		filtered[activeIndex >= 0 ? activeIndex : 0] || COMPONENTS_CATALOG[0];

	const selectComponent = (id) => {
		setActiveId(id);
		setTab("preview");
	};

	const goPrev = () => {
		if (filtered.length === 0) return;
		const idx = activeIndex >= 0 ? activeIndex : 0;
		const next = (idx - 1 + filtered.length) % filtered.length;
		selectComponent(filtered[next].id);
	};

	const goNext = () => {
		if (filtered.length === 0) return;
		const idx = activeIndex >= 0 ? activeIndex : 0;
		const next = (idx + 1) % filtered.length;
		selectComponent(filtered[next].id);
	};

	const copyCode = async (code, label) => {
		try {
			await navigator.clipboard.writeText(code);
			toast.success(`Copied ${label} code`);
		} catch {
			toast.error("Could not copy to clipboard");
		}
	};

	return (
		<div className="flex min-h-[640px] flex-col overflow-hidden rounded-2xl border bg-background shadow-sm lg:flex-row">
			{/* Sidebar */}
			<aside className="flex w-full shrink-0 flex-col border-b lg:w-64 lg:border-b-0 lg:border-r">
				<div className="border-b p-3">
					<div className="relative">
						<Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							placeholder="Search components…"
							className="h-9 pl-8 text-sm"
							aria-label="Search components"
						/>
					</div>
				</div>

				<nav className="max-h-[480px] overflow-y-auto p-2 lg:max-h-[660px] [scrollbar-width:thin]">
					{COMPONENT_SECTIONS.map((section) => {
						const items = filtered.filter((c) => c.section === section.id);
						if (items.length === 0) return null;
						return (
							<div key={section.id} className="mb-3">
								<p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
									{section.label}
								</p>
								<ul className="space-y-0.5">
									{items.map((item) => (
										<li key={item.id}>
											<button
												type="button"
												onClick={() => selectComponent(item.id)}
												className={cn(
													"w-full rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
													active.id === item.id
														? "bg-muted font-medium text-foreground"
														: "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
												)}
											>
												{item.name}
											</button>
										</li>
									))}
								</ul>
							</div>
						);
					})}
					{filtered.length === 0 ? (
						<p className="px-2 py-6 text-center text-sm text-muted-foreground">
							No components match.
						</p>
					) : null}
				</nav>
			</aside>

			{/* Main panel */}
			<div className="flex min-w-0 flex-1 flex-col">
				<div className="flex items-start justify-between gap-3 border-b px-4 py-4 sm:px-6">
					<div className="min-w-0">
						<h3 className="text-xl font-semibold tracking-tight">
							{active.name}
						</h3>
						<p className="mt-1 text-sm text-muted-foreground">
							{active.description}
						</p>
					</div>
					<div className="flex shrink-0 items-center gap-1">
						<Button
							type="button"
							variant="outline"
							size="icon"
							className="size-8"
							onClick={goPrev}
							aria-label="Previous component"
						>
							<ChevronLeft className="size-4" />
						</Button>
						<Button
							type="button"
							variant="outline"
							size="icon"
							className="size-8"
							onClick={goNext}
							aria-label="Next component"
						>
							<ChevronRight className="size-4" />
						</Button>
					</div>
				</div>

				{/* Tabs */}
				<div className="flex items-center gap-1 border-b px-4 py-2 sm:px-6">
					{TABS.map((t) => (
						<button
							key={t.id}
							type="button"
							onClick={() => setTab(t.id)}
							className={cn(
								"rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
								tab === t.id
									? "bg-muted text-foreground"
									: "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
							)}
						>
							{t.label}
						</button>
					))}
				</div>

				{/* Tab content */}
				<div className="flex-1 overflow-auto p-4 sm:p-6">
					{tab === "preview" ? (
						<div className="flex min-h-[320px] items-center justify-center rounded-xl border bg-muted/30 p-8">
							<ComponentPreview id={active.id} />
						</div>
					) : (
						<div className="relative">
							<Button
								type="button"
								variant="outline"
								size="sm"
								className="absolute right-2 top-2 z-10 gap-1.5"
								onClick={() =>
									copyCode(
										tab === "react" ? active.reactCode : active.htmlCode,
										tab === "react" ? "React" : "HTML"
									)
								}
							>
								<Copy className="size-3.5" />
								Copy
							</Button>
							<pre className="max-h-[420px] overflow-auto rounded-xl border border-border bg-muted p-4 pt-12 text-[13px] leading-relaxed text-foreground [scrollbar-width:thin] dark:bg-zinc-950 dark:text-zinc-100">
								<code className="font-mono text-inherit">
									{tab === "react" ? active.reactCode : active.htmlCode}
								</code>
							</pre>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
