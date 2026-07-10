import React, { useState, useRef, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
	Plus,
	Trash2,
	X,
	Save,
	Image as ImageIcon,
	Copy,
	FileText,
	Search,
	ArrowUpDown,
	ArrowUp,
	ArrowDown,
} from "lucide-react";
import Fuse from "fuse.js";
import TiptapEditor from "./TiptapEditor";
import TableSkeleton from "../../../lib/ui/TableSkeleton";
import ExportDropdown from "../../../lib/ui/ExportDropdown";
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
	getAllBlogs,
	createBlog,
	updateBlog,
	deleteBlog,
} from "../../../lib/api/blog";
import { uploadBlogImages } from "../../../lib/api/upload";
import { htmlToMarkdown } from "../../../lib/utils/htmlToMarkdown";
import AnimatedDropdown from "../../../lib/ui/AnimatedDropdown";
import ConfirmationModal from "../../../lib/ui/ConfirmationModal";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const BlogTab = () => {
	const queryClient = useQueryClient();
	const [showBlogModal, setShowBlogModal] = useState(false);
	const [editingBlog, setEditingBlog] = useState(null);
	const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
	const [blogForm, setBlogForm] = useState({
		title: "",
		slug: "",
		author: "",
		status: "draft",
		bannerImage: "",
	});
	const [blogContent, setBlogContent] = useState("");
	const [bannerFile, setBannerFile] = useState(null);
	const [bannerPreview, setBannerPreview] = useState(null);
	const bannerFileInputRef = useRef(null);

	// Modal states
	const [showConfirmModal, setShowConfirmModal] = useState(false);
	const [confirmAction, setConfirmAction] = useState(null);

	// Fetch blogs with React Query
	const {
		data: blogs = [],
		isLoading,
		error,
	} = useQuery({
		queryKey: ["blogs"],
		queryFn: () => getAllBlogs(),
	});

	const [searchQuery, setSearchQuery] = useState("");
	const [sortField, setSortField] = useState(null);
	const [sortDirection, setSortDirection] = useState("asc");

	// Configure Fuse.js for search
	const fuse = useMemo(() => {
		return new Fuse(blogs, {
			keys: ["title", "author", "status", "slug", "content"],
			threshold: 0.3,
			includeScore: true,
		});
	}, [blogs]);

	// Perform search with Fuse.js
	const searchedBlogs = useMemo(() => {
		if (!searchQuery.trim()) {
			return blogs;
		}
		return fuse.search(searchQuery).map((result) => result.item);
	}, [searchQuery, fuse, blogs]);

	// Sort blogs
	const sortedBlogs = useMemo(() => {
		return [...searchedBlogs].sort((a, b) => {
			if (!sortField) return 0;

			// Handle date comparison
			if (sortField === "createdAt") {
				const dateA = new Date(a.created_at || a.createdAt || 0);
				const dateB = new Date(b.created_at || b.createdAt || 0);
				return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
			}

			// Handle string comparison for other fields
			let aValue, bValue;

			switch (sortField) {
				case "title":
					aValue = (a.title || "").toLowerCase();
					bValue = (b.title || "").toLowerCase();
					break;
				case "author":
					aValue = (a.author || "").toLowerCase();
					bValue = (b.author || "").toLowerCase();
					break;
				case "status":
					aValue = (a.status || "").toLowerCase();
					bValue = (b.status || "").toLowerCase();
					break;
				default:
					return 0;
			}

			if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
			if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
			return 0;
		});
	}, [searchedBlogs, sortField, sortDirection]);

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

	// Create blog mutation
	const createBlogMutation = useMutation({
		mutationFn: async (blogData) => {
			// Upload images before creating blog
			const blogDataWithImages = await uploadBlogImages(
				blogData,
				bannerFile,
				null
			);
			return createBlog(blogDataWithImages);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["blogs"] });
			handleCloseModal();
			toast.success("Blog created successfully!");
		},
		onError: (error) => {
			console.error("Error creating blog:", error);
			toast.error("Failed to create blog. Please try again.");
		},
	});

	// Update blog mutation
	const updateBlogMutation = useMutation({
		mutationFn: async ({ id, data }) => {
			// Upload images before updating blog
			const blogDataWithImages = await uploadBlogImages(data, bannerFile, id);
			return updateBlog(id, blogDataWithImages);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["blogs"] });
			handleCloseModal();
			toast.success("Blog updated successfully!");
		},
		onError: (error) => {
			console.error("Error updating blog:", error);
			toast.error("Failed to update blog. Please try again.");
		},
	});

	// Delete blog mutation
	const deleteBlogMutation = useMutation({
		mutationFn: deleteBlog,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["blogs"] });
			toast.success("Blog deleted successfully!");
		},
		onError: (error) => {
			console.error("Error deleting blog:", error);
			toast.error("Failed to delete blog. Please try again.");
		},
	});

	// Generate slug from title
	const generateSlug = (title) => {
		return title
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/(^-|-$)/g, "");
	};

	// Handle blog form change
	const handleBlogFormChange = (e) => {
		const { name, value } = e.target;
		setBlogForm((prev) => {
			const updated = { ...prev, [name]: value };
			if (name === "title" && !editingBlog) {
				updated.slug = generateSlug(value);
			}
			return updated;
		});
	};

	// Handle banner image upload
	const handleBannerImageChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			if (!file.type.startsWith("image/")) {
				toast.warning("Please select an image file");
				return;
			}
			setBannerFile(file);
			const reader = new FileReader();
			reader.onload = (e) => {
				setBannerPreview(e.target.result);
			};
			reader.readAsDataURL(file);
		}
		e.target.value = "";
	};

	// Remove banner image
	const handleRemoveBanner = () => {
		setBannerFile(null);
		setBannerPreview(null);
		setBlogForm((prev) => ({ ...prev, bannerImage: "" }));
	};

	// Create or update blog
	const handleSaveBlog = async () => {
		if (!blogForm.title || !blogContent) return;

		const blogData = {
			...blogForm,
			content: blogContent,
		};

		if (editingBlog) {
			updateBlogMutation.mutate({ id: editingBlog.id, data: blogData });
		} else {
			createBlogMutation.mutate(blogData);
		}
	};

	// Delete blog
	const handleDeleteBlog = async (id) => {
		setConfirmAction(() => () => deleteBlogMutation.mutate(id));
		setShowConfirmModal(true);
	};

	// Edit blog
	const handleEditBlog = (blog) => {
		// Navigate to editor page instead of opening modal
		window.location.href = `/admin/blogs/${blog.id}`;
	};

	// Copy HTML content
	const handleCopyHTML = async (content) => {
		try {
			await navigator.clipboard.writeText(content);
			toast.success("HTML content copied to clipboard!");
		} catch (error) {
			console.error("Failed to copy HTML:", error);
			toast.error("Failed to copy HTML content");
		}
	};

	// Copy Markdown content
	const handleCopyMarkdown = async (htmlContent) => {
		try {
			const markdown = htmlToMarkdown(htmlContent);
			await navigator.clipboard.writeText(markdown);
			toast.success("Markdown content copied to clipboard!");
		} catch (error) {
			console.error("Failed to copy Markdown:", error);
			toast.error("Failed to copy Markdown content");
		}
	};

	// Close modal
	const handleCloseModal = () => {
		setShowBlogModal(false);
		setEditingBlog(null);
		setBlogForm({
			title: "",
			slug: "",
			author: "",
			status: "draft",
			bannerImage: "",
		});
		setBlogContent("");
		setBannerFile(null);
		setBannerPreview(null);
		setIsStatusDropdownOpen(false);
	};

	// Format date
	const formatDate = (dateString) => {
		if (!dateString) return "N/A";
		const date = dateString?.toDate
			? dateString.toDate()
			: new Date(dateString);
		return date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	// Status options
	const statusOptions = [
		{ value: "draft", label: "Draft", color: "bg-yellow-100 text-yellow-800" },
		{
			value: "published",
			label: "Published",
			color: "bg-green-100 text-green-800",
		},
		{
			value: "scheduled",
			label: "Scheduled",
			color: "bg-blue-100 text-blue-800",
		},
	];

	// Handle status select
	const handleStatusSelect = (status) => {
		setBlogForm((prev) => ({ ...prev, status }));
	};

	return (
		<div className="space-y-4">
			{/* Header */}
			<div className="flex justify-between items-center border-b py-2 px-4">
				<div>
					<h2 className="text-lg text-foreground">Blog Posts</h2>
					<p className="text-sm text-muted-foreground mt-1">
						Manage your blog posts and content
					</p>
				</div>
				<div className="flex items-center gap-2">
					<ExportDropdown dataType="blogs" data={sortedBlogs} />
					<motion.a
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}
						href="/admin/blogs/new"
						className="flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1.5 rounded-xl hover:bg-primary/90 transition-colors text-sm"
					>
						<Plus className="w-3.5 h-3.5" />
						Create New Blog
					</motion.a>
				</div>
			</div>

			{/* Search */}
			<div className="relative mx-4">
				<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
				<input
					type="text"
					placeholder="Search blogs by title, author, status, or slug..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="w-full pl-10 pr-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring text-sm"
				/>
			</div>

			{/* Table */}
			<div className="overflow-x-auto px-4">
				{isLoading ? (
					<TableSkeleton rows={5} columns={6} />
				) : (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead sortable onClick={() => handleSort("title")}>
									<div className="flex items-center gap-2">
										Title
										{getSortIcon("title")}
									</div>
								</TableHead>
								<TableHead sortable onClick={() => handleSort("author")}>
									<div className="flex items-center gap-2">
										Author
										{getSortIcon("author")}
									</div>
								</TableHead>
								<TableHead sortable onClick={() => handleSort("status")}>
									<div className="flex items-center gap-2">
										Status
										{getSortIcon("status")}
									</div>
								</TableHead>
								<TableHead sortable onClick={() => handleSort("createdAt")}>
									<div className="flex items-center gap-2">
										Created
										{getSortIcon("createdAt")}
									</div>
								</TableHead>
								<TableHead>Copy</TableHead>
								<TableHead>Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{error ? (
								<TableEmpty
									colSpan={6}
									message="Error loading blogs. Please try again."
								/>
							) : sortedBlogs.length === 0 ? (
								<TableEmpty
									colSpan={6}
									message={
										searchQuery
											? "No blogs found matching your search."
											: "No blogs found. Create your first blog!"
									}
								/>
							) : (
								sortedBlogs.map((blog) => (
									<TableRow key={blog.id}>
										<TableCell
											onClick={() => handleEditBlog(blog)}
											className="cursor-pointer"
										>
											<div className="font-medium text-foreground hover:text-muted-foreground transition-colors">
												{blog.title}
											</div>
											<div className="text-sm text-muted-foreground">{blog.slug}</div>
										</TableCell>
										<TableCell className="text-muted-foreground">{blog.author}</TableCell>
										<TableCell>
											<span
												className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
													blog.status === "published"
														? "bg-green-100 text-green-800"
														: blog.status === "scheduled"
															? "bg-blue-100 text-blue-800"
															: "bg-yellow-100 text-yellow-800"
												}`}
											>
												{blog.status}
											</span>
										</TableCell>
										<TableCell className="text-sm text-muted-foreground">
											{formatDate(blog.createdAt)}
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-2">
												<Button
													onClick={(e) => {
														e.stopPropagation();
														handleCopyHTML(blog.content || "");
													}}
													className="p-2 text-muted-foreground hover:text-muted-foreground transition-colors"
													title="Copy HTML"
												>
													<Copy className="w-4 h-4" />
												</Button>
												<Button
													onClick={(e) => {
														e.stopPropagation();
														handleCopyMarkdown(blog.content || "");
													}}
													className="p-2 text-muted-foreground hover:text-purple-600 transition-colors"
													title="Copy Markdown"
												>
													<FileText className="w-4 h-4" />
												</Button>
											</div>
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-2">
												<Button
													onClick={(e) => {
														e.stopPropagation();
														handleDeleteBlog(blog.id);
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

			{/* Blog Modal */}
			<AnimatePresence>
				{showBlogModal && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
					>
						<motion.div
							initial={{ scale: 0.9, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							exit={{ scale: 0.9, opacity: 0 }}
							className="bg-card rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
						>
							{/* Modal Header */}
							<div className="flex items-center justify-between p-4 border-b border">
								<h3 className="text-lg font-bold text-foreground">
									{editingBlog ? "Edit Blog" : "Create Blog"}
								</h3>
								<div className="flex items-center gap-3">
									<Button onClick={handleSaveBlog} size="sm" className="rounded-xl gap-2">
										<Save className="w-4 h-4" />
										{editingBlog ? "Update" : "Create"} Blog
									</Button>
									<Button
										onClick={handleCloseModal}
										className="px-4 py-1.5 text-sm text-muted-foreground bg-muted hover:bg-muted rounded-xl font-medium transition-colors"
									>
										Cancel
									</Button>
									<button
										onClick={handleCloseModal}
										className="p-2 text-muted-foreground hover:text-muted-foreground transition-colors"
									>
										<X className="w-4 h-4" />
									</button>
								</div>
							</div>

							{/* Modal Body */}
							<div className="flex-1 overflow-y-auto p-4 space-y-4">
								{/* Banner Image */}
								<div>
									<label className="block text-sm font-medium text-muted-foreground mb-2">
										Banner Image
									</label>
									{bannerPreview ? (
										<div className="relative">
											<img
												src={bannerPreview}
												alt="Banner preview"
												className="w-full h-48 object-cover rounded-xl border border"
											/>
											<Button
												onClick={handleRemoveBanner}
												className="absolute top-2 right-2 p-2 bg-red-500 text-primary-foreground rounded-full hover:bg-red-600 transition-colors"
												title="Remove banner"
											>
												<X className="w-4 h-4" />
											</Button>
										</div>
									) : (
										<div
											onClick={() => bannerFileInputRef.current?.click()}
											className="w-full h-48 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-ring transition-colors"
										>
											<ImageIcon className="w-12 h-12 text-muted-foreground mb-2" />
											<p className="text-sm text-muted-foreground">
												Click to upload banner image
											</p>
											<p className="text-xs text-muted-foreground mt-1">
												Recommended: 1200x600px
											</p>
										</div>
									)}
									<input
										ref={bannerFileInputRef}
										type="file"
										accept="image/*"
										onChange={handleBannerImageChange}
										style={{ display: "none" }}
									/>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-muted-foreground mb-2">
											Title *
										</label>
										<input
											type="text"
											name="title"
											value={blogForm.title}
											onChange={handleBlogFormChange}
											className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-ring focus:outline-none"
											placeholder="Blog title"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-muted-foreground mb-2">
											Slug *
										</label>
										<input
											type="text"
											name="slug"
											value={blogForm.slug}
											onChange={handleBlogFormChange}
											className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-ring focus:outline-none"
											placeholder="blog-slug"
										/>
									</div>
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-muted-foreground mb-2">
											Author *
										</label>
										<input
											type="text"
											name="author"
											value={blogForm.author}
											onChange={handleBlogFormChange}
											className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-ring focus:outline-none"
											placeholder="Author name"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-muted-foreground mb-2">
											Status *
										</label>
										<AnimatedDropdown
											isOpen={isStatusDropdownOpen}
											onToggle={() =>
												setIsStatusDropdownOpen(!isStatusDropdownOpen)
											}
											onSelect={handleStatusSelect}
											options={statusOptions}
											value={blogForm.status}
											placeholder="Select status"
										/>
									</div>
								</div>
								<div>
									<label className="block text-sm font-medium text-muted-foreground mb-2">
										Content *
									</label>
									<TiptapEditor
										placeholder="Start writing your blog post... Type / for commands"
										content={blogContent}
										onChange={setBlogContent}
									/>
								</div>
							</div>
						</motion.div>
					</motion.div>
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
				title="Delete Blog"
				message="Are you sure you want to delete this blog? This action cannot be undone."
				confirmText="Delete"
				cancelText="Cancel"
				variant="danger"
			/>
		</div>
	);
};

export default BlogTab;
