import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	FileText,
	Users,
	Eye,
	Search,
	CreditCard,
	Receipt,
	FileEdit,
	GripVertical,
	DollarSign,
} from "lucide-react";
import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	DragOverlay,
} from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
	useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "@/lib/toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { ThemeCustomizerButton } from "@/components/theme/ThemeCustomizer";

const ICON_MAP = {
	FileText,
	Users,
	Eye,
	CreditCard,
	Receipt,
	FileEdit,
	DollarSign,
};

const DEFAULT_NAV_STRUCTURE = [
	{
		id: "overview",
		title: "Overview",
		items: [{ id: "analytics", label: "Analytics", icon: "Eye" }],
	},
	{
		id: "audience",
		title: "Audience",
		items: [
			{ id: "users", label: "Users", icon: "Users" },
			{ id: "submissions", label: "Submissions", icon: "FileEdit" },
		],
	},
	{
		id: "financial",
		title: "Financial",
		items: [
			{ id: "payments", label: "Payments", icon: "CreditCard" },
			{ id: "invoices", label: "Invoices", icon: "Receipt" },
			{ id: "pricing-slots", label: "Launch Pricing", icon: "DollarSign" },
		],
	},
	{
		id: "content",
		title: "Content",
		items: [{ id: "blogs", label: "Blogs", icon: "FileText" }],
	},
];

const SortableNavItem = ({ item, activeTab, onSelect }) => {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: item.id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	};

	const Icon = ICON_MAP[item.icon] || FileText;

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={`group relative flex items-center rounded-xl transition-all ${
				isDragging ? "bg-muted ring-2 ring-border shadow-sm z-50" : ""
			}`}
		>
			<button
				{...attributes}
				{...listeners}
				className="py-1 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-opacity"
			>
				<GripVertical className="w-3 h-3" />
			</button>
			<button
				onClick={() => onSelect(item.id)}
				className={`flex-1 px-2 py-1.5 text-xs font-medium transition-colors rounded-xl flex items-center gap-2 ${
					activeTab === item.id
						? "bg-muted text-foreground"
						: "text-muted-foreground hover:bg-muted hover:text-foreground"
				}`}
			>
				<Icon className="w-3.5 h-3.5" />
				{item.label}
			</button>
		</div>
	);
};

const SortableCategory = ({
	category,
	activeTab,
	onSelect,
}) => {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: category.id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={`pt-2 group/category rounded-xl transition-all ${
				isDragging
					? "bg-card ring-2 ring-border shadow-lg z-50 px-1 pb-2"
					: ""
			}`}
		>
			<div className="flex items-center justify-between mb-1">
				<p className="px-2.5 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
					{category.title}
				</p>
				<button
					{...attributes}
					{...listeners}
					className="p-1 opacity-0 group-hover/category:opacity-100 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-opacity"
				>
					<GripVertical className="w-3 h-3" />
				</button>
			</div>
			<div className="space-y-1">
				<SortableContext
					items={category.items.map((i) => i.id)}
					strategy={verticalListSortingStrategy}
				>
					{category.items.map((item) => (
						<SortableNavItem
							key={item.id}
							item={item}
							activeTab={activeTab}
							onSelect={onSelect}
						/>
					))}
				</SortableContext>
			</div>
		</div>
	);
};

const Sidebar = ({
	activeTab,
	onTabSelect,
	isSidebarOpen,
	setIsSidebarOpen,
	setShowSearchModal,
	setShowLoginModal,
	user,
}) => {
	const queryClient = useQueryClient();
	const queryKey = ["admin_nav_structure"];

	// Sync saved sidebar structure with current default (add new items, remove stale ones)
	const mergeNavStructure = (savedStructure, defaultStructure) => {
		if (!savedStructure) return defaultStructure;

		const validItemIds = new Set(
			defaultStructure.flatMap((cat) => cat.items.map((item) => item.id))
		);
		const validCategoryIds = new Set(defaultStructure.map((cat) => cat.id));

		// Remap legacy tab ids from older boilerplate builds
		const normalized = savedStructure.map((cat) => ({
			...cat,
			items: (cat.items || []).map((item) =>
				item.id === "forms"
					? { ...item, id: "submissions", label: "Submissions" }
					: item
			),
		}));

		const sanitized = normalized
			.filter((cat) => validCategoryIds.has(cat.id))
			.map((cat) => ({
				...cat,
				items: (cat.items || []).filter((item) => validItemIds.has(item.id)),
			}));

		defaultStructure.forEach((defaultCategory) => {
			const existing = sanitized.find((cat) => cat.id === defaultCategory.id);
			if (!existing) {
				sanitized.push(defaultCategory);
				return;
			}

			const existingIds = new Set(existing.items.map((item) => item.id));
			const newItems = defaultCategory.items.filter(
				(item) => !existingIds.has(item.id)
			);
			if (newItems.length > 0) {
				existing.items = [...existing.items, ...newItems];
			}
		});

		return sanitized;
	};

	// Use React Query to manage the sidebar structure
	const { data: navStructure = DEFAULT_NAV_STRUCTURE } = useQuery({
		queryKey,
		queryFn: () => {
			if (typeof window === "undefined") return DEFAULT_NAV_STRUCTURE;
			const saved = localStorage.getItem("admin_nav_structure");
			const savedStructure = saved ? JSON.parse(saved) : null;

			// Merge saved structure with default to include any new items
			const merged = mergeNavStructure(savedStructure, DEFAULT_NAV_STRUCTURE);

			// If structure was merged (new items added), save it back
			if (
				savedStructure &&
				JSON.stringify(merged) !== JSON.stringify(savedStructure)
			) {
				localStorage.setItem("admin_nav_structure", JSON.stringify(merged));
			}

			return merged;
		},
		staleTime: Infinity, // Keep the data fresh as it's purely local
	});

	const { mutate: updateNavStructure } = useMutation({
		mutationFn: async (newStructure) => {
			if (typeof window !== "undefined") {
				localStorage.setItem(
					"admin_nav_structure",
					JSON.stringify(newStructure)
				);
			}
			return newStructure;
		},
		onSuccess: (newStructure) => {
			queryClient.setQueryData(queryKey, newStructure);
		},
	});

	const [activeId, setActiveId] = useState(null);

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 5,
			},
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	const handleDragStart = (event) => {
		setActiveId(event.active.id);
	};

	const handleDragEnd = (event) => {
		const { active, over } = event;
		setActiveId(null);
		if (!over) return;

		if (active.id !== over.id) {
			// Check if we are dragging a category or an item
			const isActiveCategory = navStructure.some((cat) => cat.id === active.id);
			const isOverCategory = navStructure.some((cat) => cat.id === over.id);

			if (isActiveCategory && isOverCategory) {
				// Reordering categories
				const oldIndex = navStructure.findIndex((cat) => cat.id === active.id);
				const newIndex = navStructure.findIndex((cat) => cat.id === over.id);
				updateNavStructure(arrayMove(navStructure, oldIndex, newIndex));
			} else {
				// Reordering items within or across categories
				const activeCatIndex = navStructure.findIndex((cat) =>
					cat.items.some((i) => i.id === active.id)
				);
				const overCatIndex = navStructure.findIndex((cat) =>
					cat.items.some((i) => i.id === over.id)
				);

				if (activeCatIndex === -1) return;

				const newStructure = [...navStructure];

				if (activeCatIndex === overCatIndex) {
					// Reordering within the same category
					const category = { ...newStructure[activeCatIndex] };
					const oldIndex = category.items.findIndex((i) => i.id === active.id);
					const newIndex = category.items.findIndex((i) => i.id === over.id);
					category.items = arrayMove(category.items, oldIndex, newIndex);
					newStructure[activeCatIndex] = category;
				} else if (overCatIndex !== -1) {
					// Moving from one category to another
					const activeCategory = { ...newStructure[activeCatIndex] };
					const overCategory = { ...newStructure[overCatIndex] };

					const activeItemIndex = activeCategory.items.findIndex(
						(i) => i.id === active.id
					);
					const item = activeCategory.items[activeItemIndex];

					// Remove from active category
					activeCategory.items.splice(activeItemIndex, 1);

					// Add to over category at the correct index
					const overItemIndex = overCategory.items.findIndex(
						(i) => i.id === over.id
					);
					overCategory.items.splice(overItemIndex, 0, item);

					newStructure[activeCatIndex] = activeCategory;
					newStructure[overCatIndex] = overCategory;
				}

				updateNavStructure(newStructure);
			}
		}
	};

	const handleDragCancel = () => {
		setActiveId(null);
	};

	const activeItem = activeId
		? navStructure
				.flatMap((cat) => [cat, ...cat.items])
				.find((item) => item.id === activeId)
		: null;

	const isCategory = (id) => navStructure.some((cat) => cat.id === id);

	const handleSelect = (id) => {
		onTabSelect?.(id);
	};

	const GoogleIcon = () => (
		<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
			<path
				d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
				fill="#4285F4"
			/>
			<path
				d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
				fill="#34A853"
			/>
			<path
				d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
				fill="#FBBC05"
			/>
			<path
				d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
				fill="#EA4335"
			/>
		</svg>
	);

	const sidebarContent = (isMobile = false) => (
		<div className={`flex flex-col h-full ${isMobile ? "p-3" : "py-6 px-1"}`}>
			<div className="flex-1 space-y-2 hidescrollbar overflow-y-auto">
				{/* Search Button */}
				<Button
					variant="outline"
					onClick={() => {
						setShowSearchModal(true);
						if (isMobile) setIsSidebarOpen(false);
					}}
					className="w-full justify-start gap-2 rounded-xl mb-2 h-auto py-1.5 px-2 text-sm font-medium"
				>
					<Search className="w-3.5 h-3.5" />
					<div className="flex items-center gap-2 flex-1 justify-between">
						<p>Search</p>
						{!isMobile && (
							<i className="text-[9px] mt-0.5 text-muted-foreground whitespace-nowrap">
								CMD + K
							</i>
						)}
					</div>
				</Button>

				<DndContext
					sensors={sensors}
					collisionDetection={closestCenter}
					onDragStart={handleDragStart}
					onDragEnd={handleDragEnd}
					onDragCancel={handleDragCancel}
				>
					<SortableContext
						items={navStructure.map((cat) => cat.id)}
						strategy={verticalListSortingStrategy}
					>
						{navStructure.map((category) => (
							<SortableCategory
								key={category.id}
								category={category}
								activeTab={activeTab}
								onSelect={(id) => {
									handleSelect(id);
									if (isMobile) setIsSidebarOpen(false);
								}}
							/>
						))}
					</SortableContext>
					<DragOverlay zoom={1.05}>
						{activeId ? (
							isCategory(activeId) ? (
								<div className="bg-card ring-2 ring-border shadow-2xl rounded-xl p-2 opacity-90">
									<p className="px-2.5 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
										{activeItem.title}
									</p>
									<div className="space-y-1">
										{activeItem.items.map((item) => (
											<div
												key={item.id}
												className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-muted-foreground bg-muted rounded-xl border italic opacity-50"
											>
												{item.label}
											</div>
										))}
									</div>
								</div>
							) : (
								<div className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-foreground bg-card rounded-xl shadow-xl ring-2 ring-border border min-w-[150px]">
									{ICON_MAP[activeItem.icon] &&
										React.createElement(ICON_MAP[activeItem.icon], {
											className: "w-3.5 h-3.5",
										})}
									{activeItem.label}
								</div>
							)
						) : null}
					</DragOverlay>
				</DndContext>
			</div>

			{/* Footer */}
			<div className="mt-auto pt-4 space-y-2 border-t">
				<div className="flex items-center justify-center gap-1 px-1">
					<ThemeToggle />
					<ThemeCustomizerButton />
				</div>

				<Button
					variant="outline"
					onClick={() => setShowLoginModal(true)}
					className="w-full justify-start gap-2 rounded-xl h-auto py-2 px-2.5 text-xs font-medium"
				>
					<GoogleIcon />
					<span className="truncate flex-1 text-left">
						{user ? user.displayName || user.email : "Continue with Google"}
					</span>
				</Button>
			</div>
		</div>
	);

	return (
		<>
			{/* Desktop Sidebar */}
			<aside className="hidden md:flex h-full w-48 bg-transparent flex-col overflow-hidden">
				{sidebarContent(false)}
			</aside>

			{/* Mobile Sidebar */}
			<AnimatePresence>
				{isSidebarOpen && (
					<motion.aside
						initial={{ x: -280 }}
						animate={{ x: 0 }}
						exit={{ x: -280 }}
						transition={{ type: "spring", damping: 25, stiffness: 200 }}
						className="fixed md:hidden inset-y-0 left-0 top-0 w-64 bg-background border-r z-50 overflow-hidden"
					>
						{sidebarContent(true)}
					</motion.aside>
				)}
			</AnimatePresence>
		</>
	);
};

export default Sidebar;