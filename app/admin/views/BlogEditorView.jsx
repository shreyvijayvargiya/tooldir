import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, Image as ImageIcon, X } from "lucide-react";
import dynamic from "next/dynamic";
import AdminShell from "../AdminShell";
import AnimatedDropdown from "../../../lib/ui/AnimatedDropdown";
import { getBlogById, createBlog, updateBlog } from "../../../lib/api/blog";
import { uploadBlogImages } from "../../../lib/api/upload";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const BlogTiptapEditor = dynamic(
	() => import("../components/BlogTiptapEditor"),
	{
		ssr: false,
		loading: () => (
			<div className="flex items-center justify-center h-[500px] rounded-xl border bg-card text-muted-foreground text-sm">
				Loading editor...
			</div>
		),
	}
);

const STATUS_OPTIONS = [
	{ value: "draft", label: "Draft", color: "bg-yellow-100 text-yellow-800" },
	{ value: "published", label: "Published", color: "bg-green-100 text-green-800" },
	{ value: "scheduled", label: "Scheduled", color: "bg-blue-100 text-blue-800" },
];

const BlogEditorView = ({ blogId = null }) => {
	const router = useRouter();
	const queryClient = useQueryClient();
	const bannerFileInputRef = useRef(null);

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
	const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
	const [isSaving, setIsSaving] = useState(false);

	const { data: existingBlog, isLoading } = useQuery({
		queryKey: ["blog", blogId],
		queryFn: () => getBlogById(blogId),
		enabled: !!blogId,
	});

	useEffect(() => {
		if (existingBlog && blogId) {
			setBlogForm({
				title: existingBlog.title || "",
				slug: existingBlog.slug || "",
				author: existingBlog.author || "",
				status: existingBlog.status || "draft",
				bannerImage: existingBlog.bannerImage || "",
			});
			setBlogContent(existingBlog.content || "");
			setBannerPreview(existingBlog.bannerImage || null);
			setBannerFile(null);
		}
	}, [existingBlog, blogId]);

	const generateSlug = (title) =>
		title
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/(^-|-$)/g, "");

	const handleFormChange = (e) => {
		const { name, value } = e.target;
		setBlogForm((prev) => {
			const updated = { ...prev, [name]: value };
			if (name === "title" && !blogId) {
				updated.slug = generateSlug(value);
			}
			return updated;
		});
	};

	const handleBannerChange = (e) => {
		const file = e.target.files?.[0];
		if (!file) return;
		if (!file.type.startsWith("image/")) {
			toast.warning("Please select an image file");
			return;
		}
		setBannerFile(file);
		const reader = new FileReader();
		reader.onload = (ev) => setBannerPreview(ev.target.result);
		reader.readAsDataURL(file);
		e.target.value = "";
	};

	const saveMutation = useMutation({
		mutationFn: async (payload) => {
			let dataWithImages = await uploadBlogImages(payload, bannerFile, blogId || null);

			if (blogId) {
				await updateBlog(blogId, dataWithImages);
				return blogId;
			}

			const newId = await createBlog(dataWithImages);

			if (newId && dataWithImages.content?.includes("blogs/content/")) {
				dataWithImages = await uploadBlogImages(dataWithImages, null, newId);
				await updateBlog(newId, dataWithImages);
			}

			return newId;
		},
		onSuccess: (savedId) => {
			queryClient.invalidateQueries({ queryKey: ["blogs"] });
			if (savedId) {
				queryClient.invalidateQueries({ queryKey: ["blog", savedId] });
			}
			setIsSaving(false);
			setBannerFile(null);
			toast.success(blogId ? "Blog updated!" : "Blog created!");
			if (!blogId && savedId) {
				router.replace(`/admin/blogs/${savedId}`);
			}
		},
		onError: (error) => {
			console.error(error);
			setIsSaving(false);
			toast.error("Failed to save blog");
		},
	});

	const handleSave = () => {
		if (!blogForm.title?.trim() || !blogContent?.trim()) {
			toast.warning("Title and content are required");
			return;
		}
		if (!blogForm.slug?.trim() || !blogForm.author?.trim()) {
			toast.warning("Slug and author are required");
			return;
		}
		setIsSaving(true);
		saveMutation.mutate({ ...blogForm, content: blogContent });
	};

	const handleTabSelect = (tabId) => {
		if (tabId === "blogs") {
			router.push("/admin?tab=blogs");
			return;
		}
		router.push(`/admin?tab=${tabId}`);
	};

	if (blogId && isLoading) {
		return (
			<AdminShell activeTab="blogs" onTabSelect={handleTabSelect}>
				<div className="flex items-center justify-center h-full min-h-[400px]">
					<div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
				</div>
			</AdminShell>
		);
	}

	return (
		<AdminShell activeTab="blogs" onTabSelect={handleTabSelect}>
			<div className="flex flex-col h-full">
				<header className="sticky top-0 z-10 bg-card border-b px-4 py-3 flex items-center justify-between gap-4">
					<h1 className="text-base font-semibold">
						{blogId ? "Edit Blog" : "New Blog"}
					</h1>
					<Button onClick={handleSave} disabled={isSaving} size="sm">
						<Save className="w-4 h-4" />
						{isSaving ? "Saving..." : blogId ? "Update" : "Publish"}
					</Button>
				</header>

				<div className="flex-1 overflow-y-auto p-4">
					<div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
						<BlogTiptapEditor
							content={blogContent}
							onChange={setBlogContent}
							blogId={blogId}
						/>

						<Card className="lg:sticky lg:top-4">
							<CardHeader>
								<CardTitle className="text-base">Post Settings</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-2">
									<Label>Banner Image</Label>
									{bannerPreview ? (
										<div className="relative">
											<img
												src={bannerPreview}
												alt="Banner"
												className="w-full h-28 object-cover rounded-lg border"
											/>
											<Button
												type="button"
												variant="destructive"
												size="icon"
												className="absolute top-2 right-2 h-7 w-7"
												onClick={() => {
													setBannerPreview(null);
													setBannerFile(null);
													setBlogForm((p) => ({ ...p, bannerImage: "" }));
												}}
											>
												<X className="w-3.5 h-3.5" />
											</Button>
										</div>
									) : (
										<button
											type="button"
											onClick={() => bannerFileInputRef.current?.click()}
											className="w-full h-28 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-1 text-muted-foreground hover:bg-muted/50 transition-colors"
										>
											<ImageIcon className="w-5 h-5" />
											<span className="text-xs">Upload banner</span>
										</button>
									)}
									<input
										ref={bannerFileInputRef}
										type="file"
										accept="image/*"
										onChange={handleBannerChange}
										className="hidden"
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="title">Title *</Label>
									<Input
										id="title"
										name="title"
										value={blogForm.title}
										onChange={handleFormChange}
										placeholder="Blog title"
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="slug">Slug *</Label>
									<Input
										id="slug"
										name="slug"
										value={blogForm.slug}
										onChange={handleFormChange}
										placeholder="blog-slug"
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="author">Author *</Label>
									<Input
										id="author"
										name="author"
										value={blogForm.author}
										onChange={handleFormChange}
										placeholder="Author name"
									/>
								</div>

								<div className="space-y-2">
									<Label>Status</Label>
									<AnimatedDropdown
										isOpen={isStatusDropdownOpen}
										onToggle={() => setIsStatusDropdownOpen((o) => !o)}
										onSelect={(status) =>
											setBlogForm((p) => ({ ...p, status }))
										}
										options={STATUS_OPTIONS}
										value={blogForm.status}
										placeholder="Select status"
									/>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</AdminShell>
	);
};

export default BlogEditorView;
