import React, { useMemo, useState, useEffect } from "react";
import { Search, Filter } from "lucide-react";
import { TOOL_CATEGORIES } from "@/lib/data/tools";
import { usePreset } from "@/lib/presets/PresetContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuCheckboxItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Same search + category/tag filter bar used on ToolDir table landings.
 * Returns filtered tools via render-prop or use with useDirectoryListFilters.
 */
export function useDirectoryListFilters(tools = [], initialCategories = []) {
	const [search, setSearch] = useState("");
	const [selectedCategories, setSelectedCategories] = useState(initialCategories);
	const [selectedTags, setSelectedTags] = useState([]);

	useEffect(() => {
		setSelectedCategories(initialCategories);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [initialCategories.join("|")]);

	const allTags = useMemo(
		() => [...new Set(tools.flatMap((t) => t.tags || []))].sort(),
		[tools]
	);

	const toggleCategory = (cat) => {
		setSelectedCategories((prev) =>
			prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
		);
	};

	const toggleTag = (tag) => {
		setSelectedTags((prev) =>
			prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
		);
	};

	const filtered = useMemo(() => {
		let result = [...tools];
		if (search.trim()) {
			const q = search.toLowerCase();
			result = result.filter(
				(t) =>
					t.name?.toLowerCase().includes(q) ||
					t.description?.toLowerCase().includes(q) ||
					(t.tags || []).some((tag) => tag.toLowerCase().includes(q))
			);
		}
		if (selectedCategories.length) {
			result = result.filter((t) => selectedCategories.includes(t.category));
		}
		if (selectedTags.length) {
			result = result.filter((t) =>
				selectedTags.some((tag) => (t.tags || []).includes(tag))
			);
		}
		return result;
	}, [tools, search, selectedCategories, selectedTags]);

	return {
		search,
		setSearch,
		selectedCategories,
		selectedTags,
		allTags,
		toggleCategory,
		toggleTag,
		filtered,
		activeFilterCount: selectedCategories.length + selectedTags.length,
	};
}

export default function DirectorySearchFilter({
	search,
	setSearch,
	categoryOptions,
	allTags = [],
	selectedCategories = [],
	selectedTags = [],
	toggleCategory,
	toggleTag,
	activeFilterCount = 0,
	placeholder,
}) {
	const { preset } = usePreset();
	const categories = categoryOptions || preset.categories || TOOL_CATEGORIES;
	const entity = preset.entityPlural || "listings";

	return (
		<div className="space-y-3">
			<div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
					<Input
						placeholder={
							placeholder || `Search ${entity}, tags, descriptions...`
						}
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="pl-10"
					/>
				</div>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="outline" className="gap-2">
							<Filter className="w-4 h-4" />
							Filter
							{activeFilterCount > 0 && (
								<Badge variant="secondary" className="ml-1 h-5 px-1.5">
									{activeFilterCount}
								</Badge>
							)}
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-56 max-h-72 overflow-y-auto">
						<DropdownMenuLabel>Categories</DropdownMenuLabel>
						{categories.map((cat) => (
							<DropdownMenuCheckboxItem
								key={cat}
								checked={selectedCategories.includes(cat)}
								onCheckedChange={() => toggleCategory(cat)}
							>
								{cat}
							</DropdownMenuCheckboxItem>
						))}
						{allTags.length > 0 && (
							<>
								<DropdownMenuSeparator />
								<DropdownMenuLabel>Tags</DropdownMenuLabel>
								{allTags.map((tag) => (
									<DropdownMenuCheckboxItem
										key={tag}
										checked={selectedTags.includes(tag)}
										onCheckedChange={() => toggleTag(tag)}
									>
										{tag}
									</DropdownMenuCheckboxItem>
								))}
							</>
						)}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			{(selectedCategories.length > 0 || selectedTags.length > 0) && (
				<div className="flex flex-wrap gap-2">
					{selectedCategories.map((cat) => (
						<Badge
							key={cat}
							variant="secondary"
							className="cursor-pointer"
							onClick={() => toggleCategory(cat)}
						>
							{cat} ×
						</Badge>
					))}
					{selectedTags.map((tag) => (
						<Badge
							key={tag}
							variant="outline"
							className="cursor-pointer"
							onClick={() => toggleTag(tag)}
						>
							{tag} ×
						</Badge>
					))}
				</div>
			)}
		</div>
	);
}
