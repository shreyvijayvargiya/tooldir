import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
	Search,
	ArrowUpDown,
	ArrowUp,
	ArrowDown,
	Filter,
	Star,
	ThumbsUp,
	ExternalLink,
} from "lucide-react";
import { TOOL_CATEGORIES } from "@/lib/data/tools";
import { useDirectoryTools } from "@/lib/hooks/useDirectoryTools";
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
import {
	Table,
	TableHeader,
	TableBody,
	TableRow,
	TableHead,
	TableCell,
} from "@/lib/ui/Table";

import { formatDisplayDateShort } from "@/lib/utils/formatDate";

const formatCount = (n) => {
	if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
	return n.toString();
};

const SortIcon = ({ column, sortKey, sortDir }) => {
	if (sortKey !== column) return <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />;
	return sortDir === "asc" ? (
		<ArrowUp className="w-3.5 h-3.5" />
	) : (
		<ArrowDown className="w-3.5 h-3.5" />
	);
};

const ToolsDirectoryTable = ({
	tools: toolsProp,
	showSubmitCta = true,
	limit,
	excludeSlug,
	initialCategories = [],
	isLoading: isLoadingProp,
}) => {
	const router = useRouter();
	const { preset } = usePreset();
	const categoryOptions = preset.categories || TOOL_CATEGORIES;
	const { data: fetchedTools = [], isLoading: isFetching } = useDirectoryTools({
		enabled: !toolsProp,
	});

	const tools = toolsProp || fetchedTools;
	const isLoading = isLoadingProp ?? (!toolsProp && isFetching);
	const [search, setSearch] = useState("");
	const [selectedCategories, setSelectedCategories] = useState(initialCategories);
	const [selectedTags, setSelectedTags] = useState([]);
	const [sortKey, setSortKey] = useState("upvotes");
	const [sortDir, setSortDir] = useState("desc");

	useEffect(() => {
		setSelectedCategories(initialCategories);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [initialCategories.join("|")]);

	const allTags = useMemo(
		() => [...new Set(tools.flatMap((t) => t.tags))].sort(),
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

	const handleSort = (key) => {
		if (sortKey === key) {
			setSortDir((d) => (d === "asc" ? "desc" : "asc"));
		} else {
			setSortKey(key);
			setSortDir("desc");
		}
	};

	const filtered = useMemo(() => {
		let result = [...tools];

		if (excludeSlug) {
			result = result.filter((t) => t.slug !== excludeSlug);
		}

		if (search.trim()) {
			const q = search.toLowerCase();
			result = result.filter(
				(t) =>
					t.name.toLowerCase().includes(q) ||
					t.description.toLowerCase().includes(q) ||
					t.tags.some((tag) => tag.toLowerCase().includes(q))
			);
		}

		if (selectedCategories.length > 0) {
			result = result.filter((t) => selectedCategories.includes(t.category));
		}

		if (selectedTags.length > 0) {
			result = result.filter((t) =>
				selectedTags.some((tag) => t.tags.includes(tag))
			);
		}

		result.sort((a, b) => {
			let aVal = a[sortKey];
			let bVal = b[sortKey];
			if (sortKey === "date") {
				aVal = new Date(aVal).getTime();
				bVal = new Date(bVal).getTime();
			}
			if (typeof aVal === "string") {
				aVal = aVal.toLowerCase();
				bVal = bVal.toLowerCase();
			}
			if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
			if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
			return 0;
		});

		if (limit) result = result.slice(0, limit);
		return result;
	}, [tools, search, selectedCategories, selectedTags, sortKey, sortDir, limit, excludeSlug]);

	const activeFilterCount = selectedCategories.length + selectedTags.length;

	if (isLoading) {
		return (
			<div className="text-center py-12 text-muted-foreground text-sm">
				Loading tools...
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
					<Input
						placeholder="Search tools, tags, descriptions..."
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
					<DropdownMenuContent align="end" className="w-56">
						<DropdownMenuLabel>Categories</DropdownMenuLabel>
						{categoryOptions.map((cat) => (
							<DropdownMenuCheckboxItem
								key={cat}
								checked={selectedCategories.includes(cat)}
								onCheckedChange={() => toggleCategory(cat)}
							>
								{cat}
							</DropdownMenuCheckboxItem>
						))}
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
					</DropdownMenuContent>
				</DropdownMenu>

				{showSubmitCta && (
					<Button asChild className="sm:ml-auto">
						<Link href="/submit">Submit Your Tool</Link>
					</Button>
				)}
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

			<Table>
				<TableHeader>
					<TableRow hover={false}>
						<TableHead>
							<button
								type="button"
								className="flex items-center gap-1 font-semibold"
								onClick={() => handleSort("name")}
							>
								Name <SortIcon column="name" sortKey={sortKey} sortDir={sortDir} />
							</button>
						</TableHead>
						<TableHead className="hidden md:table-cell">Website</TableHead>
						<TableHead className="hidden lg:table-cell">Description</TableHead>
						<TableHead>
							<button
								type="button"
								className="flex items-center gap-1 font-semibold"
								onClick={() => handleSort("stars")}
							>
								Stars <SortIcon column="stars" sortKey={sortKey} sortDir={sortDir} />
							</button>
						</TableHead>
						<TableHead>
							<button
								type="button"
								className="flex items-center gap-1 font-semibold"
								onClick={() => handleSort("upvotes")}
							>
								Upvotes <SortIcon column="upvotes" sortKey={sortKey} sortDir={sortDir} />
							</button>
						</TableHead>
						<TableHead className="hidden sm:table-cell">
							<button
								type="button"
								className="flex items-center gap-1 font-semibold"
								onClick={() => handleSort("date")}
							>
								Date <SortIcon column="date" sortKey={sortKey} sortDir={sortDir} />
							</button>
						</TableHead>
						<TableHead className="hidden md:table-cell">Country</TableHead>
						<TableHead className="hidden sm:table-cell">Pricing</TableHead>
						<TableHead className="hidden lg:table-cell">Tags</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{filtered.length === 0 ? (
						<TableRow hover={false}>
							<TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
								No tools found matching your filters.
							</TableCell>
						</TableRow>
					) : (
						filtered.map((tool) => (
							<TableRow
								key={tool.id}
								onClick={() => router.push(`/tool/${tool.slug}`)}
							>
								<TableCell>
									<div className="flex items-center gap-2 font-medium">
										{tool.logo ? (
											<img
												src={tool.logo}
												alt=""
												className="w-6 h-6 rounded"
											/>
										) : (
											<div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
												{tool.name[0]}
											</div>
										)}
										{tool.name}
									</div>
								</TableCell>
								<TableCell className="hidden md:table-cell">
									<a
										href={tool.website}
										target="_blank"
										rel="noopener noreferrer"
										onClick={(e) => e.stopPropagation()}
										className="text-primary hover:underline flex items-center gap-1 text-sm"
									>
										{new URL(tool.website).hostname}
										<ExternalLink className="w-3 h-3" />
									</a>
								</TableCell>
								<TableCell className="hidden lg:table-cell max-w-xs truncate text-sm text-muted-foreground">
									{tool.description}
								</TableCell>
								<TableCell>
									{tool.stars > 0 ? (
										<span className="flex items-center gap-1 text-sm">
											<Star className="w-3.5 h-3.5 text-amber-500" />
											{formatCount(tool.stars)}
										</span>
									) : (
										<span className="text-muted-foreground text-sm">—</span>
									)}
								</TableCell>
								<TableCell>
									<span className="flex items-center gap-1 text-sm">
										<ThumbsUp className="w-3.5 h-3.5 text-primary" />
										{formatCount(tool.upvotes)}
									</span>
								</TableCell>
								<TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
									{formatDisplayDateShort(tool.date)}
								</TableCell>
								<TableCell className="hidden md:table-cell text-sm">
									{tool.country}
								</TableCell>
								<TableCell className="hidden sm:table-cell">
									<Badge variant="outline" className="text-xs">
										{tool.pricing}
									</Badge>
								</TableCell>
								<TableCell className="hidden lg:table-cell">
									<div className="flex flex-wrap gap-1">
										{tool.tags.slice(0, 2).map((tag) => (
											<Badge key={tag} variant="secondary" className="text-xs">
												{tag}
											</Badge>
										))}
									</div>
								</TableCell>
							</TableRow>
						))
					)}
				</TableBody>
			</Table>
		</div>
	);
};

export default ToolsDirectoryTable;
