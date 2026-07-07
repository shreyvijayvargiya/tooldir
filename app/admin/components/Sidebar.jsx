import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	FileText,
	Mail,
	Users,
	Shield,
	Eye,
	ShoppingBag,
	Search,
	LogIn,
	ChevronDown,
	Plus,
	Home,
	CreditCard,
	MessageSquare,
	User,
	RocketIcon,
	ExternalLink,
	Receipt,
	Building2,
	AlertCircle,
	UsersRound,
	LayoutGrid,
	FileEdit,
	GitBranch,
	FolderOpen,
	Clock,
	GripVertical,
	Lightbulb,
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
	Home,
	FileText,
	Mail,
	LayoutGrid,
	FolderOpen,
	Clock,
	User,
	Users,
	Building2,
	UsersRound,
	Eye,
	CreditCard,
	Receipt,
	ShoppingBag,
	MessageSquare,
	FileEdit,
	AlertCircle,
	GitBranch,
	Shield,
	Lightbulb,
};

const DEFAULT_NAV_STRUCTURE = [
	{
		id: "overview",
		title: "Overview",
		items: [{ id: "home", label: "Home", icon: "Home" }],
	},
	{
		id: "content",
		title: "Content",
		items: [
			{ id: "blogs", label: "Blogs", icon: "FileText" },
			{ id: "emails", label: "Emails", icon: "Mail" },
			{ id: "kanban-board", label: "Kanban Board", icon: "LayoutGrid" },
			{ id: "idea-database", label: "Idea Database", icon: "Lightbulb" },
			{ id: "assets", label: "Assets", icon: "FolderOpen" },
			{ id: "cron-jobs", label: "CRON Jobs", icon: "Clock" },
		],
	},
	{
		id: "audience",
		title: "Audience",
		items: [
			{ id: "subscribers", label: "Email Subscribers", icon: "User" },
			{ id: "users", label: "Users", icon: "Users" },
			{ id: "customers", label: "Customers", icon: "Building2" },
			{ id: "waitlist", label: "Waitlist", icon: "UsersRound" },
			{ id: "analytics", label: "Analytics", icon: "Eye" },
		],
	},
	{
		id: "financial",
		title: "Financial",
		items: [
			{ id: "payments", label: "Payments", icon: "CreditCard" },
			{ id: "invoices", label: "Invoices", icon: "Receipt" },
			{ id: "products", label: "Products", icon: "ShoppingBag" },
		],
	},
	{
		id: "communication",
		title: "Communication",
		items: [
			{ id: "messages", label: "Messages", icon: "MessageSquare" },
			{ id: "forms", label: "Forms", icon: "FileEdit" },
		],
	},
	{
		id: "support",
		title: "Support",
		items: [
			{ id: "reportIssues", label: "Report Issues", icon: "AlertCircle" },
		],
	},
	{
		id: "frontend",
		title: "Frontend",
		items: [{ id: "changelog", label: "Changelog", icon: "GitBranch" }],
	},
	{
		id: "settings",
		title: "Settings",
		items: [{ id: "teams", label: "Teams", icon: "Shield" }],
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

	const Icon = ICON_MAP[item.icon] || Home;

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
	setActiveTab,
	isSidebarOpen,
	setIsSidebarOpen,
	setShowSearchModal,
	setShowLoginModal,
	user,
}) => {
	const queryClient = useQueryClient();
	const queryKey = ["admin_nav_structure"];

	// Helper function to merge new items from default structure into saved structure
	const mergeNavStructure = (savedStructure, defaultStructure) => {
		if (!savedStructure) return defaultStructure;

		// Create a map of existing items by id for quick lookup
		const existingItems = new Set();
		savedStructure.forEach((category) => {
			category.items?.forEach((item) => existingItems.add(item.id));
		});

		// Merge new items from default structure
		const merged = savedStructure.map((savedCategory) => {
			const defaultCategory = defaultStructure.find(
				(cat) => cat.id === savedCategory.id
			);
			if (!defaultCategory) return savedCategory;

			// Find items in default that don't exist in saved
			const newItems = defaultCategory.items.filter(
				(defaultItem) => !existingItems.has(defaultItem.id)
			);

			// If there are new items, add them to the saved category
			if (newItems.length > 0) {
				return {
					...savedCategory,
					items: [...savedCategory.items, ...newItems],
				};
			}

			return savedCategory;
		});

		// Add any new categories that don't exist in saved structure
		defaultStructure.forEach((defaultCategory) => {
			const exists = merged.some((cat) => cat.id === defaultCategory.id);
			if (!exists) {
				merged.push(defaultCategory);
			}
		});

		return merged;
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

	const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
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

	const sidebarContent = (isMobile = false) => (
		<div className={`flex flex-col h-full ${isMobile ? "p-3" : "py-6 px-1"}`}>
			<div className="flex-1 space-y-2 hidescrollbar overflow-y-auto">
				{/* Project Dropdown / Logo */}
				<div className="relative project-dropdown mb-2">
					<div className="flex items-center gap-1 mb-2">
						<ThemeToggle />
						<ThemeCustomizerButton />
					</div>
					<motion.button
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}
						className="w-full flex items-center gap-2 px-3 py-2 bg-card border rounded-xl hover:bg-muted transition-colors"
					>
						<RocketIcon className="w-3.5 h-3.5" />
						<span className="text-xs font-medium">SAAS Starter Admin</span>
						{isMobile && (
							<ChevronDown
								className={`w-4 h-4 ml-auto text-muted-foreground transition-transform ${
									isProjectDropdownOpen ? "rotate-180" : ""
								}`}
							/>
						)}
					</motion.button>
				</div>

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
									setActiveTab(id);
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

			{/* Footer Section */}
			<div className="mt-auto pt-4 space-y-2 border-t">
				<a
					className="flex gap-2 items-center px-2 py-1.5 cursor-pointer text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
					href="/docs"
					target="_blank"
				>
					<ExternalLink className="w-3 h-3" /> Read Docs
				</a>
				<Button
					variant="secondary"
					onClick={() => setShowLoginModal(true)}
					className="w-full justify-start gap-2 rounded-xl h-auto py-1.5 px-2.5 text-xs font-medium"
				>
					<LogIn className="w-3.5 h-3.5" />
					<span className="truncate flex-1 text-left">
						{user ? user.displayName || "Logged In" : "Login"}
					</span>
				</Button>

				<div className="p-3 bg-card border rounded-xl shadow-sm">
					<p className="font-bold text-foreground text-sm">Buildsaas PRO</p>
					<p className="text-[10px] text-muted-foreground mt-1 mb-2 leading-relaxed">
						Build SAAS applications 10x Faster. The complete boilerplate for
						developers.
					</p>
					<Button asChild size="sm" className="w-full rounded-xl text-[10px] h-auto py-1.5">
						<a
							target="_blank"
							rel="noopener noreferrer"
							href="https://buy.polar.sh/polar_cl_4DKKA9Ohkz60mo6VtK0VetQLUkkS5lWnjpeRv4Y9rPK"
						>
							Get PRO Access
						</a>
					</Button>
				</div>
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