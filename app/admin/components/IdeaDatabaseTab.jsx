import React, { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
	Plus,
	Search,
	Filter,
	X,
	Trash2,
	Save,
	ArrowUpDown,
	ArrowUp,
	ArrowDown,
	ExternalLink,
} from "lucide-react";
import TiptapEditor from "./TiptapEditor";
import TableSkeleton from "../../../lib/ui/TableSkeleton";
import {
	Table,
	TableHeader,
	TableBody,
	TableRow,
	TableHead,
	TableCell,
	TableEmpty,
} from "../../../lib/ui/Table";
import {
	getAllIdeas,
	createIdea,
	updateIdea,
	deleteIdea,
} from "../../../lib/api/idea-database";
import { createTask } from "../../../lib/api/tasks";
import AnimatedDropdown from "../../../lib/ui/AnimatedDropdown";
import ConfirmationModal from "../../../lib/ui/ConfirmationModal";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const IdeaDatabaseTab = ({ queryClient, onNavigate }) => {
	const [searchQuery, setSearchQuery] = useState("");
	const [sortField, setSortField] = useState(null);
	const [sortDirection, setSortDirection] = useState("asc");
	const [showDrawer, setShowDrawer] = useState(false);
	const [selectedIdea, setSelectedIdea] = useState(null);
	const [showFilterDropdown, setShowFilterDropdown] = useState(false);
	const [openFilterType, setOpenFilterType] = useState(null);
	const [activeFilters, setActiveFilters] = useState({
		markAsTask: null, // null, true, false
	});
	const filterDropdownRef = useRef(null);

	// Form state for drawer
	const [ideaForm, setIdeaForm] = useState({
		title: "",
		content: "",
		markAsTask: false,
		taskId: null,
		taskStatus: "todo",
	});

	// Modal states
	const [showConfirmModal, setShowConfirmModal] = useState(false);
	const [confirmAction, setConfirmAction] = useState(null);
	const [isTaskStatusDropdownOpen, setIsTaskStatusDropdownOpen] =
		useState(false);

	// Fetch ideas
	const {
		data: ideas = [],
		isLoading,
		error,
	} = useQuery({
		queryKey: ["ideas"],
		queryFn: () => getAllIdeas(),
	});

	// Close filter dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (
				filterDropdownRef.current &&
				!filterDropdownRef.current.contains(event.target)
			) {
				setShowFilterDropdown(false);
				setOpenFilterType(null);
			}
		};

		if (showFilterDropdown) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [showFilterDropdown]);

	// Filter ideas by search query
	const filteredIdeas = ideas.filter((idea) => {
		const searchLower = searchQuery.toLowerCase();
		return (
			idea.title?.toLowerCase().includes(searchLower) ||
			idea.content?.toLowerCase().includes(searchLower)
		);
	});

	// Apply filters
	const filteredByStatus = filteredIdeas.filter((idea) => {
		if (activeFilters.markAsTask === null) return true;
		return idea.markAsTask === activeFilters.markAsTask;
	});

	// Sort ideas
	const sortedIdeas = [...filteredByStatus].sort((a, b) => {
		if (!sortField) return 0;

		if (sortField === "createdAt") {
			const dateA = a.createdAt?.toDate
				? a.createdAt.toDate()
				: new Date(a.createdAt || 0);
			const dateB = b.createdAt?.toDate
				? b.createdAt.toDate()
				: new Date(b.createdAt || 0);
			return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
		}

		let aValue, bValue;
		switch (sortField) {
			case "title":
				aValue = (a.title || "").toLowerCase();
				bValue = (b.title || "").toLowerCase();
				break;
			default:
				return 0;
		}

		if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
		if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
		return 0;
	});

	// Handle column sort
	const handleSort = (field) => {
		if (sortField === field) {
			setSortDirection(sortDirection === "asc" ? "desc" : "asc");
		} else {
			setSortField(field);
			setSortDirection("asc");
		}
	};

	// Get sort icon for column header
	const getSortIcon = (field) => {
		if (sortField !== field) {
			return <ArrowUpDown className="w-3.5 h-3.5 ml-1 text-muted-foreground" />;
		}
		return sortDirection === "asc" ? (
			<ArrowUp className="w-3.5 h-3.5 ml-1 text-foreground" />
		) : (
			<ArrowDown className="w-3.5 h-3.5 ml-1 text-foreground" />
		);
	};

	// Create idea mutation
	const createIdeaMutation = useMutation({
		mutationFn: async (ideaData) => {
			// If markAsTask is true, create a task first
			if (ideaData.markAsTask) {
				const taskData = {
					title: ideaData.title,
					description: ideaData.content,
					type: "feature",
					status:
						ideaData.taskStatus === "todo"
							? "backlog"
							: ideaData.taskStatus === "in-progress"
							? "in-progress"
							: "done",
					priority: "Medium",
					category: "Idea Database",
				};
				const taskId = await createTask(taskData);
				// Create idea with taskId
				return createIdea({
					...ideaData,
					taskId,
				});
			}
			return createIdea(ideaData);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["ideas"] });
			queryClient.invalidateQueries({ queryKey: ["tasks"] });
			handleCloseDrawer();
			toast.success("Idea created successfully!");
		},
		onError: (error) => {
			console.error("Error creating idea:", error);
			toast.error("Failed to create idea. Please try again.");
		},
	});

	// Create task mutation
	const createTaskMutation = useMutation({
		mutationFn: createTask,
		onError: (error) => {
			console.error("Error creating task:", error);
			toast.error("Failed to create task. Please try again.");
		},
	});

	// Update idea mutation
	const updateIdeaMutation = useMutation({
		mutationFn: async ({ id, data }) => {
			// If markAsTask is true and taskId doesn't exist, create a task first
			if (data.markAsTask && !data.taskId) {
				const taskData = {
					title: data.title,
					description: data.content,
					type: "feature",
					status:
						data.taskStatus === "todo"
							? "backlog"
							: data.taskStatus === "in-progress"
							? "in-progress"
							: "done",
					priority: "Medium",
					category: "Idea Database",
				};
				const taskId = await createTask(taskData);
				// Update data with taskId
				return updateIdea(id, {
					...data,
					taskId,
				});
			}
			return updateIdea(id, data);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["ideas"] });
			queryClient.invalidateQueries({ queryKey: ["tasks"] });
			toast.success("Idea updated successfully!");
		},
		onError: (error) => {
			console.error("Error updating idea:", error);
			toast.error("Failed to update idea. Please try again.");
		},
	});

	// Delete idea mutation
	const deleteIdeaMutation = useMutation({
		mutationFn: deleteIdea,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["ideas"] });
			toast.success("Idea deleted successfully!");
		},
		onError: (error) => {
			console.error("Error deleting idea:", error);
			toast.error("Failed to delete idea. Please try again.");
		},
	});

	// Handle save
	const handleSave = () => {
		if (!ideaForm.title.trim()) {
			toast.warning("Idea title is required");
			return;
		}

		if (selectedIdea) {
			updateIdeaMutation.mutate({
				id: selectedIdea.id,
				data: ideaForm,
			});
		} else {
			createIdeaMutation.mutate(ideaForm);
		}
	};

	// Handle delete
	const handleDelete = (id) => {
		setConfirmAction(() => () => deleteIdeaMutation.mutate(id));
		setShowConfirmModal(true);
	};

	// Handle row click to open drawer
	const handleRowClick = (idea) => {
		setSelectedIdea(idea);
		setIdeaForm({
			title: idea.title || "",
			content: idea.content || "",
			markAsTask: idea.markAsTask || false,
			taskId: idea.taskId || null,
			taskStatus: idea.taskStatus || "todo",
		});
		setShowDrawer(true);
	};

	// Handle add new idea
	const handleAddNew = () => {
		setSelectedIdea(null);
		setIdeaForm({
			title: "",
			content: "",
			markAsTask: false,
			taskId: null,
			taskStatus: "todo",
		});
		setShowDrawer(true);
	};

	// Handle close drawer
	const handleCloseDrawer = () => {
		setShowDrawer(false);
		setSelectedIdea(null);
		setIdeaForm({
			title: "",
			content: "",
			markAsTask: false,
			taskId: null,
			taskStatus: "todo",
		});
	};

	// Format date
	const formatDate = (dateString) => {
		if (!dateString) return "";
		const date = dateString?.toDate
			? dateString.toDate()
			: new Date(dateString);
		if (isNaN(date.getTime())) return "";
		return date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	// Filter options
	const filterOptions = {
		markAsTask: [
			{ value: null, label: "All Ideas" },
			{
				value: true,
				label: "Marked as Task",
				color: "bg-blue-100 text-blue-700",
			},
			{
				value: false,
				label: "Not Marked as Task",
				color: "bg-muted text-muted-foreground",
			},
		],
	};

	// Task status options
	const taskStatusOptions = [
		{ value: "todo", label: "Todo", color: "bg-muted text-muted-foreground" },
		{
			value: "in-progress",
			label: "In Progress",
			color: "bg-blue-100 text-blue-700",
		},
		{
			value: "completed",
			label: "Completed",
			color: "bg-green-100 text-green-700",
		},
	];

	// Handle filter select
	const handleFilterSelect = (filterType, value) => {
		setActiveFilters((prev) => ({
			...prev,
			[filterType]: value,
		}));
	};

	const clearFilters = () => {
		setActiveFilters({
			markAsTask: null,
		});
	};

	const hasActiveFilters = Object.values(activeFilters).some(
		(filter) => filter !== null
	);

	return (
		<div className="relative">
			<div className="flex justify-between items-center border-b py-2 px-4">
				<div>
					<h2 className="text-lg text-foreground">Idea Database</h2>
					<p className="text-sm text-muted-foreground mt-1">List of your Ideas/Notes/Features for SAAS application</p>
				</div>
				<Button onClick={handleAddNew} size="sm" className="rounded-xl gap-1.5">
					<Plus className="w-3.5 h-3.5" />
					Add New Idea
				</Button>
			</div>

			{/* Search and Filter */}
			<div className="flex items-center gap-2 my-4 mx-4">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
					<input
						type="text"
						placeholder="Search ideas..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full pl-10 pr-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring text-sm"
					/>
				</div>
				<div className="relative" ref={filterDropdownRef}>
					<Button
						onClick={() => setShowFilterDropdown(!showFilterDropdown)}
						className={`flex items-center gap-2 px-3 py-2 bg-card border rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted ${
							hasActiveFilters ? "ring-2 ring-primary" : ""
						}`}
					>
						<Filter className="w-4 h-4" />
						Filter
						{hasActiveFilters && (
							<span className="px-1.5 py-0.5 bg-primary text-primary-foreground rounded-full text-xs">
								{Object.values(activeFilters).filter((f) => f !== null).length}
							</span>
						)}
					</Button>

					<AnimatePresence>
						{showFilterDropdown && (
							<motion.div
								initial={{ opacity: 0, y: -10, scale: 0.95 }}
								animate={{ opacity: 1, y: 0, scale: 1 }}
								exit={{ opacity: 0, y: -10, scale: 0.95 }}
								className="absolute right-0 top-full mt-2 w-64 bg-card border rounded-xl shadow-lg z-50 p-4 space-y-4"
							>
								<div className="flex items-center justify-between mb-2">
									<h4 className="font-semibold text-foreground text-sm">
										Filters
									</h4>
									{hasActiveFilters && (
										<button
											onClick={() => {
												clearFilters();
												setShowFilterDropdown(false);
											}}
											className="text-xs text-muted-foreground hover:text-foreground underline"
										>
											Clear all
										</button>
									)}
								</div>

								{/* Mark as Task Filter */}
								<div>
									<label className="block text-xs font-medium text-muted-foreground mb-2">
										Mark as Task
									</label>
									<AnimatedDropdown
										isOpen={openFilterType === "markAsTask"}
										onToggle={() =>
											setOpenFilterType(
												openFilterType === "markAsTask" ? null : "markAsTask"
											)
										}
										onSelect={(value) => {
											handleFilterSelect("markAsTask", value);
											setOpenFilterType(null);
										}}
										options={filterOptions.markAsTask}
										value={activeFilters.markAsTask}
										placeholder="All Ideas"
									/>
								</div>
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</div>

			{/* Table */}
			<div className="overflow-x-auto px-4">
				{isLoading ? (
					<TableSkeleton rows={5} columns={4} />
				) : (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead
									sortable
									onClick={() => handleSort("title")}
									className="min-w-[250px]"
								>
									<div className="flex items-center gap-2">
										Title
										{getSortIcon("title")}
									</div>
								</TableHead>
								<TableHead>Content Preview</TableHead>
								<TableHead>Task Status</TableHead>
								<TableHead sortable onClick={() => handleSort("createdAt")}>
									<div className="flex items-center gap-2">
										Created
										{getSortIcon("createdAt")}
									</div>
								</TableHead>
								<TableHead>Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{error ? (
								<TableEmpty
									colSpan={5}
									message="Error loading ideas. Please try again."
								/>
							) : sortedIdeas.length === 0 ? (
								<TableEmpty
									colSpan={5}
									message={
										searchQuery
											? "No ideas found matching your search."
											: "No ideas found. Create your first idea!"
									}
								/>
							) : (
								sortedIdeas.map((idea) => (
									<TableRow
										key={idea.id}
										onClick={() => handleRowClick(idea)}
										className="cursor-pointer"
									>
										<TableCell>
											<div className="font-medium text-foreground hover:text-muted-foreground transition-colors">
												{idea.title || "Untitled"}
											</div>
										</TableCell>
										<TableCell>
											<div className="text-sm text-muted-foreground truncate max-w-xs">
												{idea.content
													? idea.content
															.replace(/<[^>]*>/g, "")
															.substring(0, 100)
													: "No content"}
											</div>
										</TableCell>
										<TableCell>
											{idea.markAsTask && idea.taskStatus ? (
												<div className="flex items-center gap-2">
													<span
														className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
															idea.taskStatus === "completed"
																? "bg-green-100 text-green-800"
																: idea.taskStatus === "in-progress"
																? "bg-blue-100 text-blue-800"
																: "bg-muted text-foreground"
														}`}
													>
														{idea.taskStatus}
													</span>
													{idea.taskId && onNavigate && (
														<Button
															onClick={(e) => {
																e.stopPropagation();
																onNavigate("kanban-board");
															}}
															className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
															title="View in Kanban Board"
														>
															<ExternalLink className="w-3.5 h-3.5" />
														</Button>
													)}
												</div>
											) : (
												<span className="text-sm text-muted-foreground">-</span>
											)}
										</TableCell>
										<TableCell className="text-muted-foreground">
											{formatDate(idea.createdAt)}
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-2">
												<Button
													onClick={(e) => {
														e.stopPropagation();
														handleDelete(idea.id);
													}}
													className="p-2 text-muted-foreground hover:text-red-600 transition-colors"
													title="Delete"
												>
													<Trash2 className="w-4 h-4" />
												</Button>
											</div>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				)}
			</div>

			{/* Right Sidebar Drawer */}
			<AnimatePresence>
				{showDrawer && (
					<>
						{/* Backdrop */}
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							onClick={handleCloseDrawer}
							className="fixed inset-0 bg-black bg-opacity-50 z-40"
						/>

						{/* Drawer */}
						<motion.div
							initial={{ x: "100%" }}
							animate={{ x: 0 }}
							exit={{ x: "100%" }}
							transition={{ type: "spring", damping: 25, stiffness: 200 }}
							className="fixed right-0 top-0 h-full w-full md:w-[600px] bg-card shadow-2xl z-50 flex flex-col"
							onClick={(e) => e.stopPropagation()}
						>
							{/* Drawer Header */}
							<div className="flex items-center justify-between p-2 border-b border">
								<h3 className="text-sm font-semibold text-foreground">
									{selectedIdea ? "Edit Idea" : "New Idea"}
								</h3>
								<button
									onClick={handleCloseDrawer}
									className="cursor-pointer p-1.5 text-muted-foreground hover:bg-muted hover:text-muted-foreground rounded-xl transition-colors"
								>
									<X className="w-4 h-4" />
								</button>
							</div>

							{/* Drawer Content */}
							<div className="flex-1 overflow-y-auto p-4 space-y-4">
								{/* Title */}
								<div>
									<label className="block text-sm font-medium text-muted-foreground mb-2">
										Title *
									</label>
									<input
										type="text"
										value={ideaForm.title}
										onChange={(e) =>
											setIdeaForm({ ...ideaForm, title: e.target.value })
										}
										className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring text-sm"
										placeholder="Enter idea title..."
									/>
								</div>

								{/* Mark as Task Switch */}
								<div className="flex items-center justify-between p-3 bg-muted rounded-xl border border">
									<div>
										<label className="block text-sm font-medium text-muted-foreground">
											Mark as Task
										</label>
										<p className="text-xs text-muted-foreground mt-1">
											Convert this idea into a task in the kanban board
										</p>
									</div>
									<label className="relative inline-flex items-center cursor-pointer">
										<input
											type="checkbox"
											checked={ideaForm.markAsTask}
											onChange={(e) =>
												setIdeaForm({
													...ideaForm,
													markAsTask: e.target.checked,
													taskStatus: e.target.checked
														? ideaForm.taskStatus || "todo"
														: null,
												})
											}
											className="sr-only peer"
										/>
										<div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-card after:border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
									</label>
								</div>

								{/* Task Status Dropdown (only shown when markAsTask is true) */}
								{ideaForm.markAsTask && (
									<div>
										<label className="block text-sm font-medium text-muted-foreground mb-2">
											Task Status
										</label>
										<AnimatedDropdown
											isOpen={isTaskStatusDropdownOpen}
											onToggle={() =>
												setIsTaskStatusDropdownOpen(!isTaskStatusDropdownOpen)
											}
											onSelect={(value) => {
												setIdeaForm({ ...ideaForm, taskStatus: value });
												setIsTaskStatusDropdownOpen(false);
											}}
											options={taskStatusOptions}
											value={ideaForm.taskStatus}
											placeholder="Select task status"
										/>
									</div>
								)}

								{/* Content Editor */}
								<div className="flex-1 min-h-[400px]">
									<label className="block text-sm font-medium text-muted-foreground mb-2">
										Content
									</label>
									<div className="h-[400px]">
										<TiptapEditor
											placeholder="Start writing your idea, feature, or note..."
											content={ideaForm.content}
											onChange={(content) =>
												setIdeaForm({ ...ideaForm, content })
											}
										/>
									</div>
								</div>
							</div>

							{/* Drawer Footer */}
							<div className="flex items-center gap-2 p-4 border-t border">
								<Button onClick={handleSave} className="rounded-xl gap-2">
									<Save className="w-4 h-4" />
									{selectedIdea ? "Update" : "Create"} Idea
								</Button>
							</div>
						</motion.div>
					</>
				)}
			</AnimatePresence>

			{/* Confirmation Modal */}
			<ConfirmationModal
				isOpen={showConfirmModal}
				onClose={() => {
					setShowConfirmModal(false);
					setConfirmAction(null);
				}}
				onConfirm={() => {
					if (confirmAction) {
						confirmAction();
					}
					setShowConfirmModal(false);
					setConfirmAction(null);
				}}
				title="Delete Idea"
				message="Are you sure you want to delete this idea? This action cannot be undone."
				confirmText="Delete"
				cancelText="Cancel"
				variant="danger"
			/>
		</div>
	);
};

export default IdeaDatabaseTab;