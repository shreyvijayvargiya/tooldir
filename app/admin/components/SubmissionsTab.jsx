import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
	Search,
	Globe,
	ExternalLink,
	CheckCircle2,
	Trash2,
	Upload,
	Calendar,
	Mail,
	Shield,
	CreditCard,
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
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

const slugFromName = (name) =>
	(name || "")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/(^-|-$)/g, "");

const SubmissionsTab = ({ queryClient }) => {
	const [searchQuery, setSearchQuery] = useState("");
	const [selected, setSelected] = useState(null);
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
			setSelected((prev) =>
				prev?.id === submissionId
					? { ...prev, status: "listed", directoryToolId: tool.id }
					: prev
			);
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
		onSuccess: (_data, deletedId) => {
			queryClient.invalidateQueries({ queryKey: ["toolSubmissions"] });
			toast.success("Submission deleted");
			if (selected?.id === deletedId) setSelected(null);
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

	const paymentBadge = (submission) => {
		const ps = submission.paymentStatus || "unpaid";
		if (ps === "paid") {
			return (
				<Badge className="bg-green-100 text-green-800 hover:bg-green-100">
					Paid
				</Badge>
			);
		}
		if (ps === "not_required") {
			return <span className="text-xs text-muted-foreground">Free</span>;
		}
		if (ps === "failed") {
			return (
				<Badge variant="destructive" className="text-xs">
					Failed
				</Badge>
			);
		}
		if (ps === "pending") {
			return (
				<Badge variant="secondary" className="text-xs">
					Pending
				</Badge>
			);
		}
		return submission.slotIsPaid ? (
			<Badge variant="outline" className="text-xs">
				Unpaid
			</Badge>
		) : (
			<span className="text-xs text-muted-foreground">—</span>
		);
	};

	const toolPublicPath = (submission) =>
		`/tool/${publishedSlugs[submission.id] || slugFromName(submission.name)}`;

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
				<TableSkeleton columns={9} rows={5} />
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
							<TableHead>Payment</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filtered.length === 0 ? (
							<TableEmpty message="No tool submissions yet" colSpan={9} />
						) : (
							filtered.map((submission) => (
								<TableRow key={submission.id}>
									<TableCell>
										<button
											type="button"
											onClick={() => setSelected(submission)}
											className="flex items-center gap-2 font-medium text-left hover:text-primary transition-colors group"
										>
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
											<span className="group-hover:underline underline-offset-2">
												{submission.name}
											</span>
										</button>
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
									<TableCell>{paymentBadge(submission)}</TableCell>
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
													onClick={() => publishMutation.mutate(submission.id)}
													disabled={publishMutation.isPending}
												>
													List on Website
												</Button>
											)}
											{submission.status === "listed" && (
												<Button size="sm" variant="outline" asChild>
													<a
														href={toolPublicPath(submission)}
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

			{/* Tool details modal */}
			<Dialog
				open={Boolean(selected)}
				onOpenChange={(open) => {
					if (!open) setSelected(null);
				}}
			>
				<DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
					{selected && (
						<>
							<DialogHeader>
								<div className="flex items-start gap-3 pr-6">
									{selected.logoUrl ? (
										<img
											src={selected.logoUrl}
											alt=""
											className="w-12 h-12 rounded-xl object-contain border bg-muted"
										/>
									) : (
										<div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-lg font-bold text-primary shrink-0">
											{selected.name?.[0]}
										</div>
									)}
									<div className="min-w-0 space-y-1">
										<DialogTitle className="text-left leading-tight">
											{selected.name}
										</DialogTitle>
										<DialogDescription className="text-left flex flex-wrap items-center gap-2">
											<span
												className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${statusColor(selected.status)}`}
											>
												{selected.status}
											</span>
											{paymentBadge(selected)}
										</DialogDescription>
									</div>
								</div>
							</DialogHeader>

							<div className="space-y-4 text-sm">
								{selected.screenshotUrl && (
									<img
										src={selected.screenshotUrl}
										alt={`${selected.name} screenshot`}
										className="w-full rounded-xl border object-cover max-h-48"
									/>
								)}

								<div>
									<p className="text-xs font-medium text-muted-foreground mb-1">
										Description
									</p>
									<p className="text-foreground whitespace-pre-wrap">
										{selected.description || "—"}
									</p>
								</div>

								{(selected.tags || []).length > 0 && (
									<div className="flex flex-wrap gap-1.5">
										{selected.tags.map((tag) => (
											<Badge key={tag} variant="secondary">
												{tag}
											</Badge>
										))}
									</div>
								)}

								<Separator />

								<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
									<div className="flex items-start gap-2">
										<Globe className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
										<div className="min-w-0">
											<p className="text-xs text-muted-foreground">Website</p>
											<a
												href={selected.website}
												target="_blank"
												rel="noopener noreferrer"
												className="text-primary hover:underline break-all"
											>
												{selected.website?.replace(/^https?:\/\//, "")}
											</a>
										</div>
									</div>
									<div className="flex items-start gap-2">
										<Mail className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
										<div>
											<p className="text-xs text-muted-foreground">Submitter</p>
											<p>{selected.submitterEmail || "—"}</p>
										</div>
									</div>
									<div className="flex items-start gap-2">
										<Calendar className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
										<div>
											<p className="text-xs text-muted-foreground">Launch slot</p>
											<p>
												{selected.launchDate
													? formatDate(selected.launchDate)
													: "—"}
											</p>
											<p className="text-xs text-muted-foreground">
												{selected.slotLabel || "—"}
												{selected.slotIsPaid
													? ` · $${selected.slotPrice}`
													: " · Free"}
											</p>
										</div>
									</div>
									<div className="flex items-start gap-2">
										<CreditCard className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
										<div>
											<p className="text-xs text-muted-foreground">Payment</p>
											<div className="mt-0.5">{paymentBadge(selected)}</div>
											{selected.paymentId && (
												<p className="text-[10px] font-mono text-muted-foreground mt-1 break-all">
													{selected.paymentId}
												</p>
											)}
										</div>
									</div>
									<div className="flex items-start gap-2">
										<Shield className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
										<div>
											<p className="text-xs text-muted-foreground">Badge</p>
											<p>
												{selected.badgeVerified ? "Verified" : "Not verified"}
											</p>
										</div>
									</div>
									<div>
										<p className="text-xs text-muted-foreground">Submitted</p>
										<p>{formatDate(selected.createdAt)}</p>
									</div>
								</div>
							</div>

							<DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
								<Button
									variant="outline"
									asChild
									className="w-full sm:w-auto"
								>
									<a
										href={selected.website}
										target="_blank"
										rel="noopener noreferrer"
									>
										<ExternalLink className="w-4 h-4" />
										Visit site
									</a>
								</Button>
								{selected.status === "listed" ? (
									<Button variant="outline" asChild className="w-full sm:w-auto">
										<a
											href={toolPublicPath(selected)}
											target="_blank"
											rel="noopener noreferrer"
										>
											View listing
										</a>
									</Button>
								) : (
									<Button
										className="w-full sm:w-auto"
										onClick={() => publishMutation.mutate(selected.id)}
										disabled={publishMutation.isPending}
									>
										{publishMutation.isPending
											? "Listing…"
											: "List on Website"}
									</Button>
								)}
								<Button
									variant="destructive"
									className="w-full sm:w-auto"
									onClick={() => handleDelete(selected)}
								>
									<Trash2 className="w-4 h-4" />
									Delete
								</Button>
							</DialogFooter>
						</>
					)}
				</DialogContent>
			</Dialog>

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
