import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import {
	Search,
	X,
	Flame,
	LayoutGrid,
	Rocket,
	LayoutDashboard,
	PlusCircle,
	FileText,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
	{
		id: "trending",
		label: "Trending projects",
		href: "/?sort=trending",
		icon: Flame,
		iconClass: "text-orange-500",
	},
	{
		id: "categories",
		label: "Categories",
		href: "/categories/ai-writing",
		icon: LayoutGrid,
		iconClass: "text-violet-500",
	},
];

const NAVIGATION = [
	{
		id: "explore",
		label: "Explore launches",
		href: "/pricing",
		icon: Rocket,
		iconClass: "text-orange-500",
	},
	{
		id: "dashboard",
		label: "Dashboard",
		href: "/dashboard",
		icon: LayoutDashboard,
		iconClass: "text-emerald-500",
	},
	{
		id: "submit",
		label: "Submit Project",
		href: "/submit",
		icon: PlusCircle,
		iconClass: "text-sky-500",
	},
	{
		id: "blog",
		label: "Blog",
		href: "/blog",
		icon: FileText,
		iconClass: "text-amber-600",
	},
];

const CommandSearchModal = ({ open, onOpenChange }) => {
	const router = useRouter();
	const inputRef = useRef(null);
	const [query, setQuery] = useState("");
	const [activeIndex, setActiveIndex] = useState(0);

	const filteredSuggestions = useMemo(() => {
		const q = query.trim().toLowerCase();
		if (!q) return SUGGESTIONS;
		return SUGGESTIONS.filter((item) => item.label.toLowerCase().includes(q));
	}, [query]);

	const filteredNavigation = useMemo(() => {
		const q = query.trim().toLowerCase();
		if (!q) return NAVIGATION;
		return NAVIGATION.filter((item) => item.label.toLowerCase().includes(q));
	}, [query]);

	const flatItems = useMemo(
		() => [...filteredSuggestions, ...filteredNavigation],
		[filteredSuggestions, filteredNavigation]
	);

	useEffect(() => {
		if (open) {
			setQuery("");
			setActiveIndex(0);
			const t = setTimeout(() => inputRef.current?.focus(), 50);
			return () => clearTimeout(t);
		}
	}, [open]);

	useEffect(() => {
		setActiveIndex(0);
	}, [query]);

	const navigate = (href) => {
		onOpenChange(false);
		router.push(href);
	};

	const onKeyDown = (e) => {
		if (e.key === "ArrowDown") {
			e.preventDefault();
			setActiveIndex((i) => (flatItems.length ? (i + 1) % flatItems.length : 0));
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			setActiveIndex((i) =>
				flatItems.length ? (i - 1 + flatItems.length) % flatItems.length : 0
			);
		} else if (e.key === "Enter") {
			e.preventDefault();
			const item = flatItems[activeIndex];
			if (item) navigate(item.href);
		}
	};

	const renderGroup = (title, items, offset) => {
		if (!items.length) return null;
		return (
			<div className="px-2 py-2">
				<p className="px-2 pb-1.5 text-xs font-medium text-muted-foreground">
					{title}
				</p>
				<ul className="space-y-0.5">
					{items.map((item, i) => {
						const index = offset + i;
						const Icon = item.icon;
						const active = index === activeIndex;
						return (
							<li key={item.id}>
								<button
									type="button"
									onClick={() => navigate(item.href)}
									onMouseEnter={() => setActiveIndex(index)}
									className={cn(
										"flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-left text-sm transition-colors",
										active
											? "bg-muted text-foreground"
											: "text-foreground/90 hover:bg-muted/70"
									)}
								>
									<Icon className={cn("h-4 w-4 shrink-0", item.iconClass)} />
									<span className="font-medium">{item.label}</span>
								</button>
							</li>
						);
					})}
				</ul>
			</div>
		);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				className="top-[20%] translate-y-0 gap-0 overflow-hidden p-0 sm:max-w-lg outline-none focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 [&>button]:hidden"
				onKeyDown={onKeyDown}
			>
				<div className="flex items-center gap-2 border-b px-3">
					<Search className="h-4 w-4 shrink-0 text-muted-foreground" />
					<input
						ref={inputRef}
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder="Search projects, categories..."
						className="flex h-12 w-full bg-transparent px-0 text-sm outline-none placeholder:text-muted-foreground border-0 shadow-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
					/>
					<button
						type="button"
						onClick={() => onOpenChange(false)}
						className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground outline-none focus:outline-none focus-visible:ring-0"
						aria-label="Close"
					>
						<X className="h-4 w-4" />
					</button>
				</div>

				<div className="max-h-[360px] overflow-y-auto py-1">
					{flatItems.length === 0 ? (
						<p className="px-4 py-8 text-center text-sm text-muted-foreground">
							No results for &ldquo;{query}&rdquo;
						</p>
					) : (
						<>
							{renderGroup("Suggestions", filteredSuggestions, 0)}
							{filteredSuggestions.length > 0 &&
								filteredNavigation.length > 0 && (
									<div className="mx-2 border-t" />
								)}
							{renderGroup(
								"Navigation",
								filteredNavigation,
								filteredSuggestions.length
							)}
						</>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default CommandSearchModal;
