import React, { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Fuse from "fuse.js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
	Search,
	X,
	FileText,
	Users,
	ArrowRight,
	Sparkles,
	Receipt,
	CreditCard,
	FileEdit,
} from "lucide-react";
import { getAllBlogs } from "../../../lib/api/blog";
import { getAllPayments } from "../../../lib/api/payments";
import { getAllInvoices } from "../../../lib/api/invoice";
import { getAllUsers } from "../../../lib/api/users";
import { getAllToolSubmissions } from "../../../lib/api/toolSubmissions";

const SearchModal = ({ isOpen, onClose, onNavigate }) => {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("all");

	const formatValue = (value) => {
		if (value === null || value === undefined) return "";
		if (typeof value === "string") return value;
		if (typeof value === "number" || typeof value === "boolean") return String(value);
		if (value instanceof Date) {
			if (isNaN(value.getTime())) return "";
			return value.toLocaleString();
		}
		if (
			typeof value === "object" &&
			typeof value.seconds === "number" &&
			typeof value.nanoseconds === "number"
		) {
			const ms = value.seconds * 1000 + Math.floor(value.nanoseconds / 1e6);
			const d = new Date(ms);
			return isNaN(d.getTime()) ? "" : d.toLocaleString();
		}
		return "";
	};

	const { data: blogs = [] } = useQuery({
		queryKey: ["blogs"],
		queryFn: () => getAllBlogs(),
		enabled: isOpen,
	});

	const { data: users = [] } = useQuery({
		queryKey: ["users"],
		queryFn: () => getAllUsers(),
		enabled: isOpen,
	});

	const { data: payments = [] } = useQuery({
		queryKey: ["payments"],
		queryFn: () => getAllPayments(),
		enabled: isOpen,
	});

	const { data: invoices = [] } = useQuery({
		queryKey: ["invoices"],
		queryFn: () => getAllInvoices(),
		enabled: isOpen,
	});

	const { data: submissions = [] } = useQuery({
		queryKey: ["toolSubmissions"],
		queryFn: () => getAllToolSubmissions(),
		enabled: isOpen,
	});

	const searchData = useMemo(() => {
		const data = [];

		if (selectedCategory === "all" || selectedCategory === "blogs") {
			blogs.forEach((blog) => {
				data.push({
					type: "blog",
					id: blog.id,
					title: blog.title,
					subtitle: blog.slug || blog.author || "",
					searchText: `${blog.title} ${blog.slug || ""} ${blog.author || ""}`,
					data: blog,
				});
			});
		}

		if (selectedCategory === "all" || selectedCategory === "users") {
			users.forEach((u) => {
				const id = u.id || u.uid || u.email || `${u.email || "user"}-${Math.random()}`;
				const title = formatValue(u.email || u.name || u.displayName || "User");
				const subtitle = formatValue(u.role || u.plan || u.status || "");
				data.push({
					type: "user",
					id,
					title,
					subtitle,
					searchText: `${title} ${subtitle} ${formatValue(u.email || "")}`,
					data: u,
				});
			});
		}

		if (selectedCategory === "all" || selectedCategory === "payments") {
			payments.forEach((p) => {
				const id = p.id || p.paymentId || p.orderId || `${p.email || "payment"}-${Math.random()}`;
				const title = formatValue(p.customerEmail || p.email || p.customer_email || "Payment");
				const subtitle = formatValue(p.status || p.amount || p.currency || "");
				data.push({
					type: "payment",
					id,
					title,
					subtitle,
					searchText: `${title} ${subtitle}`,
					data: p,
				});
			});
		}

		if (selectedCategory === "all" || selectedCategory === "invoices") {
			invoices.forEach((inv) => {
				const id = inv.id || inv.invoiceId || inv.number || `${inv.customerEmail || "invoice"}-${Math.random()}`;
				const title = formatValue(
					inv.number ? `Invoice ${inv.number}` : inv.customerEmail || inv.email || "Invoice"
				);
				const subtitle = formatValue(inv.status || inv.total || "");
				data.push({
					type: "invoice",
					id,
					title,
					subtitle,
					searchText: `${title} ${subtitle} ${formatValue(inv.customerEmail || inv.email || "")}`,
					data: inv,
				});
			});
		}

		if (selectedCategory === "all" || selectedCategory === "submissions") {
			submissions.forEach((s) => {
				const id = s.id || `${s.name || "submission"}-${Math.random()}`;
				const title = formatValue(s.name || "Submission");
				const subtitle = formatValue(s.status || s.website || "");
				data.push({
					type: "submission",
					id,
					title,
					subtitle,
					searchText: `${title} ${subtitle} ${formatValue(s.submitterEmail || "")}`,
					data: s,
				});
			});
		}

		return data;
	}, [blogs, users, payments, invoices, submissions, selectedCategory]);

	const fuse = useMemo(() => {
		return new Fuse(searchData, {
			keys: ["title", "subtitle", "searchText"],
			threshold: 0.3,
			includeScore: true,
		});
	}, [searchData]);

	const searchResults = useMemo(() => {
		if (!searchQuery.trim()) {
			return [];
		}
		return fuse.search(searchQuery).map((result) => result.item);
	}, [searchQuery, fuse]);

	useEffect(() => {
		if (!isOpen) {
			setSearchQuery("");
			setSelectedCategory("all");
		}
	}, [isOpen]);

	useEffect(() => {
		if (!isOpen) return;

		const handleKeyDown = (e) => {
			if ((e.metaKey || e.ctrlKey) && e.key === "k") {
				e.preventDefault();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isOpen]);

	const categories = [
		{ id: "all", label: "All" },
		{ id: "blogs", label: "Blogs" },
		{ id: "users", label: "Users" },
		{ id: "submissions", label: "Submissions" },
		{ id: "payments", label: "Payments" },
		{ id: "invoices", label: "Invoices" },
	];

	const handleResultClick = (result) => {
		if (result.type === "blog") {
			onNavigate("blogs");
			window.location.href = `/admin/blogs/${result.id}`;
		} else if (result.type === "user") {
			onNavigate("users");
		} else if (result.type === "payment") {
			onNavigate("payments");
		} else if (result.type === "invoice") {
			onNavigate("invoices");
		} else if (result.type === "submission") {
			onNavigate("submissions");
		}
		onClose();
	};

	const guidanceActions = [
		{
			icon: FileText,
			label: "Create New Blog",
			action: () => {
				onNavigate("blogs");
				window.location.href = "/admin/blogs/new";
				onClose();
			},
		},
		{
			icon: Receipt,
			label: "Create New Invoice",
			action: () => {
				onNavigate("invoices");
				onClose();
			},
		},
		{
			icon: FileEdit,
			label: "View Submissions",
			action: () => {
				onNavigate("submissions");
				onClose();
			},
		},
		{
			icon: Users,
			label: "Manage Users",
			action: () => {
				onNavigate("users");
				onClose();
			},
		},
	];

	const getTypeIcon = (type) => {
		switch (type) {
			case "blog":
				return FileText;
			case "user":
				return Users;
			case "payment":
				return CreditCard;
			case "invoice":
				return Receipt;
			case "submission":
				return FileEdit;
			default:
				return FileText;
		}
	};

	const getTypeColor = (type) => {
		switch (type) {
			case "blog":
				return "bg-muted text-foreground";
			case "user":
				return "bg-blue-100 text-blue-800";
			case "payment":
				return "bg-emerald-100 text-emerald-800";
			case "invoice":
				return "bg-muted text-foreground";
			case "submission":
				return "bg-violet-100 text-violet-800";
			default:
				return "bg-muted text-foreground";
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="flex max-h-[80vh] w-full max-w-2xl flex-col gap-0 overflow-hidden p-0 sm:rounded-2xl [&>button]:hidden">
				<div className="p-4">
					<div className="mb-3 flex items-center gap-3">
						<div className="relative flex-1">
							<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
							<Input
								type="text"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								placeholder="Search blogs, users, submissions, payments, invoices..."
								className="rounded-xl pl-10"
								autoFocus
							/>
						</div>
						<Button
							variant="ghost"
							size="icon"
							onClick={onClose}
							className="rounded-xl"
						>
							<X className="h-5 w-5" />
						</Button>
					</div>
					<div className="flex flex-wrap gap-2">
						{categories.map((category) => (
							<Button
								key={category.id}
								variant={selectedCategory === category.id ? "default" : "outline"}
								size="sm"
								onClick={() => setSelectedCategory(category.id)}
								className="rounded-xl"
							>
								{category.label}
							</Button>
						))}
					</div>
				</div>

				<div className="flex-1 overflow-y-auto p-4">
					{searchQuery.trim() && (
						<div className="mb-6">
							{searchResults.length === 0 ? (
								<div className="py-8 text-center text-sm text-muted-foreground">
									No results found for "{searchQuery}"
								</div>
							) : (
								<div className="space-y-1">
									{searchResults.map((result) => {
										const Icon = getTypeIcon(result.type);
										return (
											<Button
												key={`${result.type}-${result.id}`}
												variant="ghost"
												onClick={() => handleResultClick(result)}
												className="h-auto w-full justify-start rounded-xl border p-2 text-left hover:bg-muted"
											>
												<div
													className={`rounded-xl p-2 ${getTypeColor(result.type)}`}
												>
													<Icon className="h-4 w-4" />
												</div>
												<div className="min-w-0 flex-1">
													<div className="truncate font-medium text-foreground">
														{result.title}
													</div>
													{result.subtitle && (
														<div className="truncate text-xs text-muted-foreground">
															{result.subtitle}
														</div>
													)}
												</div>
												<div className="flex items-center gap-2">
													<span
														className={`rounded px-2 py-0.5 text-xs font-medium ${getTypeColor(
															result.type
														)}`}
													>
														{result.type}
													</span>
													<ArrowRight className="h-4 w-4 text-muted-foreground" />
												</div>
											</Button>
										);
									})}
								</div>
							)}
						</div>
					)}

					<div>
						<div className="mb-3 flex items-center gap-2">
							<Sparkles className="h-4 w-4 text-muted-foreground" />
							<h3 className="text-sm font-semibold text-muted-foreground">
								Quick Actions
							</h3>
						</div>
						<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
							{guidanceActions.map((action, index) => {
								const Icon = action.icon;
								return (
									<Button
										key={index}
										variant="ghost"
										onClick={action.action}
										className="h-auto justify-start rounded-xl border px-2 py-1 text-left hover:bg-muted"
									>
										<div className="rounded-xl bg-muted px-2 py-1 text-muted-foreground">
											<Icon className="h-4 w-4" />
										</div>
										<span className="text-sm font-medium text-foreground">
											{action.label}
										</span>
										<ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
									</Button>
								);
							})}
						</div>
					</div>
				</div>

				<div className="border-t border bg-muted p-4">
					<div className="flex items-center justify-between text-xs text-muted-foreground">
						<span>Press Esc to close</span>
						<span>
							{searchQuery.trim()
								? `${searchResults.length} result${searchResults.length !== 1 ? "s" : ""}`
								: `${searchData.length} total items`}
						</span>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default SearchModal;
