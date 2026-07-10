import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
	Search,
	Globe,
	ExternalLink,
	CheckCircle2,
	Trash2,
	Upload,
} from "lucide-react";
import {
	getAllToolSubmissions,
	deleteToolSubmission,
} from "../../../lib/api/toolSubmissions";
import { isSupabaseConfigured } from "../../../lib/config/supabase";
import { toast } from "@/lib/toast";
import ConfirmationModal from "../../../lib/ui/ConfirmationModal";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const SubmissionsTab = ({ queryClient }) => {
	const [searchQuery, setSearchQuery] = useState("");
	const [showConfirmModal, setShowConfirmModal] = useState(false);
	const [confirmAction, setConfirmAction] = useState(null);
	const [confirmData, setConfirmData] = useState({
		title: "",
		message: "",
		variant: "danger",
	});

	const {
		data: submissions = [],
		isLoading,
		error,
	} = useQuery({
		queryKey: ["toolSubmissions"],
		queryFn: getAllToolSubmissions,
	});

	const [publishedSlugs, setPublishedSlugs] = useState({});

	const publishMutation = useMutation({
		mutationFn: async (submissionId) => {
			const res = await fetch("/api/directory-tools/publish", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ submissionId }),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Failed to publish");
			return { submissionId, tool: data.tool };
		},
		onSuccess: ({ submissionId, tool }) => {
			setPublishedSlugs((prev) => ({ ...prev, [submissionId]: tool.slug }));
			queryClient.invalidateQueries({ queryKey: ["toolSubmissions"] });
			queryClient.invalidateQueries({ queryKey: ["directoryTools"] });
			toast.success("Tool listed on website!");
		},
		onError: (err) => {
			toast.error(err.message || "Failed to list tool");
		},
	});

	const seedMutation = useMutation({
		mutationFn: async () => {
			const res = await fetch("/api/directory-tools/seed", { method: "POST" });
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Seed failed");
			return data;
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["directoryTools"] });
			toast.success(data.message || `Seeded ${data.seeded} tools`);
		},
		onError: (err) => toast.error(err.message),
	});

	const deleteMutation = useMutation({
		mutationFn: deleteToolSubmission,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["toolSubmissions"] });
			toast.success("Submission deleted");
		},
		onError: () => toast.error("Failed to delete submission"),
	});

	const formatDate = (dateStr) => {
		if (!dateStr) return "—";
		return new Date(dateStr).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	};

	const filtered = submissions.filter((s) => {
		const q = searchQuery.toLowerCase();
		return (
			s.name?.toLowerCase().includes(q) ||
			s.website?.toLowerCase().includes(q) ||
			s.description?.toLowerCase().includes(q) ||
			s.status?.toLowerCase().includes(q)
		);
	});

	const handleDelete = (submission) => {
		setConfirmData({
			title: "Delete Submission",
			message: `Delete submission for "${submission.name}"?`,
			variant: "danger",
		});
		setConfirmAction(() => () => deleteMutation.mutate(submission.id));
		setShowConfirmModal(true);
	};

	const statusColor = (status) => {
		switch (status) {
			case "listed":
				return "bg-green-100 text-green-800";
			case "approved":
				return "bg-blue-100 text-blue-800";
			case "rejected":
				return "bg-red-100 text-red-800";
			default:
				return "bg-yellow-100 text-yellow-800";
		}
	};

	return (
		<div className="p-6 space-y-4">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
				<div>
					<h1 className="text-xl font-bold text-foreground">Tool Submissions</h1>
					<p className="text-sm text-muted-foreground">
						Review submit flow entries and list approved tools on the website
					</p>
				</div>
				<div className="flex gap-2">
					{isSupabaseConfigured() && (
						<Button
							variant="outline"
							size="sm"
							onClick={() => seedMutation.mutate()}
							disabled={seedMutation.isPending}
						>
							<Upload className="w-4 h-4" />
							{seedMutation.isPending ? "Seeding..." : "Seed Sample Tools"}
						</Button>
					)}
				</div>
			</div>

			{!isSupabaseConfigured() && (
				<div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
					Supabase is not configured. Submissions require{" "}
					<code className="text-xs">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
					<code className="text-xs">NEXT_PUBLIC_SUPABASE_KEY</code>. The public
					site uses sample data until connected.
				</div>
			)}

			<div className="relative max-w-md">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
				<Input
					placeholder="Search submissions..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="pl-10"
				/>
			</div>

			{isLoading ? (
				<TableSkeleton columns={8} rows={5} />
			) : error ? (
				<p className="text-sm text-destructive">Failed to load submissions.</p>
			) : (
				<Table>
					<TableHeader>
						<TableRow hover={false}>
							<TableHead>Tool</TableHead>
							<TableHead>Website</TableHead>
							<TableHead className="hidden md:table-cell">Description</TableHead>
							<TableHead className="hidden lg:table-cell">Tags</TableHead>
							<TableHead>Badge</TableHead>
							<TableHead className="hidden sm:table-cell">Launch Slot</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filtered.length === 0 ? (
							<TableEmpty
								message="No tool submissions yet"
								colSpan={8}
							/>
						) : (
							filtered.map((submission) => (
								<TableRow key={submission.id}>
									<TableCell>
										<div className="flex items-center gap-2 font-medium">
											{submission.logoUrl ? (
												<img
													src={submission.logoUrl}
													alt=""
													className="w-6 h-6 rounded object-contain"
												/>
											) : (
												<div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
													{submission.name?.[0]}
												</div>
											)}
											{submission.name}
										</div>
									</TableCell>
									<TableCell>
										<a
											href={submission.website}
											target="_blank"
											rel="noopener noreferrer"
											className="text-primary text-sm flex items-center gap-1 hover:underline"
										>
											<Globe className="w-3.5 h-3.5" />
											<span className="truncate max-w-[120px]">
												{submission.website?.replace(/^https?:\/\//, "")}
											</span>
											<ExternalLink className="w-3 h-3" />
										</a>
									</TableCell>
									<TableCell className="hidden md:table-cell max-w-xs truncate text-sm text-muted-foreground">
										{submission.description}
									</TableCell>
									<TableCell className="hidden lg:table-cell">
										<div className="flex flex-wrap gap-1">
											{(submission.tags || []).slice(0, 2).map((tag) => (
												<Badge key={tag} variant="secondary" className="text-xs">
													{tag}
												</Badge>
											))}
										</div>
									</TableCell>
									<TableCell>
										{submission.badgeVerified ? (
											<CheckCircle2 className="w-4 h-4 text-green-600" />
										) : (
											<span className="text-muted-foreground text-xs">—</span>
										)}
									</TableCell>
									<TableCell className="hidden sm:table-cell text-sm">
										{submission.launchDate ? (
											<div>
												<p>{formatDate(submission.launchDate)}</p>
												<p className="text-xs text-muted-foreground">
													{submission.slotLabel}{" "}
													{submission.slotIsPaid
														? `($${submission.slotPrice})`
														: "(Free)"}
												</p>
											</div>
										) : (
											"—"
										)}
									</TableCell>
									<TableCell>
										<span
											className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${statusColor(submission.status)}`}
										>
											{submission.status}
										</span>
									</TableCell>
									<TableCell>
										<div className="flex items-center gap-1">
											{submission.status !== "listed" && (
												<Button
													size="sm"
													onClick={() =>
														publishMutation.mutate(submission.id)
													}
													disabled={publishMutation.isPending}
												>
													List on Website
												</Button>
											)}
											{submission.status === "listed" && (
												<Button size="sm" variant="outline" asChild>
													<a
														href={`/tool/${publishedSlugs[submission.id] || submission.name
															.toLowerCase()
															.replace(/[^a-z0-9]+/g, "-")
															.replace(/(^-|-$)/g, "")}`}
														target="_blank"
														rel="noopener noreferrer"
													>
														View
													</a>
												</Button>
											)}
											<Button
												size="icon"
												variant="ghost"
												onClick={() => handleDelete(submission)}
											>
												<Trash2 className="w-4 h-4 text-destructive" />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			)}

			<ConfirmationModal
				isOpen={showConfirmModal}
				onClose={() => {
					setShowConfirmModal(false);
					setConfirmAction(null);
				}}
				onConfirm={() => {
					if (confirmAction) confirmAction();
					setShowConfirmModal(false);
					setConfirmAction(null);
				}}
				title={confirmData.title}
				message={confirmData.message}
				variant={confirmData.variant}
			/>
		</div>
	);
};

export default SubmissionsTab;
