import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
	Search,
	Calendar,
	ArrowUpDown,
	ArrowUp,
	ArrowDown,
	Trash2,
	CheckCircle2,
	Clock,
} from "lucide-react";
import {
	getAllReportIssues,
	deleteReportIssue,
	markIssueAsFixed,
	markIssueAsPending,
} from "../../../lib/api/reportissues";
import TableSkeleton from "../../../lib/ui/TableSkeleton";
import AnimatedDropdown from "../../../lib/ui/AnimatedDropdown";
import ConfirmationModal from "../../../lib/ui/ConfirmationModal";
import { toast } from "react-toastify";

const ReportIssuesTab = ({ queryClient }) => {
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("all"); // all, pending, fixed
	const [isStatusFilterDropdownOpen, setIsStatusFilterDropdownOpen] =
		useState(false);
	const [sortField, setSortField] = useState(null); // 'name', 'email', 'issue', 'status', 'createdAt', 'id'
	const [sortDirection, setSortDirection] = useState("asc"); // 'asc' or 'desc'
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [issueToDelete, setIssueToDelete] = useState(null);

	const {
		data: issues = [],
		isLoading,
		error,
	} = useQuery({
		queryKey: ["reportIssues"],
		queryFn: () => getAllReportIssues(),
	});

	const filteredIssues = issues.filter((issue) => {
		const searchLower = searchQuery.toLowerCase();
		const matchesSearch =
			issue.name?.toLowerCase().includes(searchLower) ||
			issue.email?.toLowerCase().includes(searchLower) ||
			issue.issue?.toLowerCase().includes(searchLower) ||
			issue.id?.toLowerCase().includes(searchLower) ||
			issue.username?.toLowerCase().includes(searchLower);

		const matchesStatus =
			statusFilter === "all" || issue.status === statusFilter;

		return matchesSearch && matchesStatus;
	});

	// Sort issues
	const sortedIssues = [...filteredIssues].sort((a, b) => {
		if (!sortField) return 0;

		// Handle date comparison
		if (sortField === "createdAt") {
			const dateA = a.createdAt?.toDate
				? a.createdAt.toDate()
				: new Date(a.createdAt || 0);
			const dateB = b.createdAt?.toDate
				? b.createdAt.toDate()
				: new Date(b.createdAt || 0);
			return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
		}

		// Handle string comparison for other fields
		let aValue, bValue;

		switch (sortField) {
			case "name":
				aValue = (a.name || "").toLowerCase();
				bValue = (b.name || "").toLowerCase();
				break;
			case "email":
				aValue = (a.email || "").toLowerCase();
				bValue = (b.email || "").toLowerCase();
				break;
			case "issue":
				aValue = (a.issue || "").toLowerCase();
				bValue = (b.issue || "").toLowerCase();
				break;
			case "status":
				aValue = (a.status || "").toLowerCase();
				bValue = (b.status || "").toLowerCase();
				break;
			case "id":
				aValue = (a.id || "").toLowerCase();
				bValue = (b.id || "").toLowerCase();
				break;
			case "username":
				aValue = (a.username || "").toLowerCase();
				bValue = (b.username || "").toLowerCase();
				break;
			default:
				return 0;
		}

		// String comparison
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
			return <ArrowUpDown className="w-3.5 h-3.5 ml-1 text-zinc-400" />;
		}
		return sortDirection === "asc" ? (
			<ArrowUp className="w-3.5 h-3.5 ml-1 text-zinc-900" />
		) : (
			<ArrowDown className="w-3.5 h-3.5 ml-1 text-zinc-900" />
		);
	};

	const formatDate = (date) => {
		if (!date) return "";
		const d = date?.toDate ? date.toDate() : new Date(date);
		if (isNaN(d.getTime())) return "";
		return d.toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	const getStatusBadge = (status) => {
		switch (status) {
			case "fixed":
				return (
					<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
						<CheckCircle2 className="w-3 h-3" />
						Fixed
					</span>
				);
			case "pending":
				return (
					<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
						<Clock className="w-3 h-3" />
						Pending
					</span>
				);
			default:
				return (
					<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800">
						{status || "Unknown"}
					</span>
				);
		}
	};

	const handleDeleteClick = (issue) => {
		setIssueToDelete(issue);
		setIsDeleteModalOpen(true);
	};

	const handleDeleteConfirm = async () => {
		if (!issueToDelete) return;

		try {
			await deleteReportIssue(issueToDelete.id);
			toast.success("Report issue deleted successfully");
			queryClient.invalidateQueries({ queryKey: ["reportIssues"] });
		} catch (error) {
			console.error("Error deleting report issue:", error);
			toast.error("Failed to delete report issue. Please try again.");
		} finally {
			setIssueToDelete(null);
			setIsDeleteModalOpen(false);
		}
	};

	const handleStatusToggle = async (issue) => {
		try {
			if (issue.status === "fixed") {
				await markIssueAsPending(issue.id);
				toast.success("Issue marked as pending");
			} else {
				await markIssueAsFixed(issue.id);
				toast.success("Issue marked as fixed");
			}
			queryClient.invalidateQueries({ queryKey: ["reportIssues"] });
		} catch (error) {
			console.error("Error updating issue status:", error);
			toast.error("Failed to update issue status. Please try again.");
		}
	};

	// Status filter options
	const statusFilterOptions = [
		{ value: "all", label: "All Status" },
		{
			value: "pending",
			label: "Pending",
			color: "bg-yellow-100 text-yellow-800",
		},
		{ value: "fixed", label: "Fixed", color: "bg-green-100 text-green-800" },
	];

	return (
		<div className="space-y-4">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-zinc-900">Report Issues</h1>
					<p className="text-sm text-zinc-600 mt-1">
						Manage reported issues from users
					</p>
				</div>
			</div>

			{/* Filters */}
			<div className="flex items-center gap-4">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
					<input
						type="text"
						placeholder="Search by name, email, issue, ID, or username..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 text-sm"
					/>
				</div>
				<div className="w-48">
					<AnimatedDropdown
						isOpen={isStatusFilterDropdownOpen}
						onToggle={() =>
							setIsStatusFilterDropdownOpen(!isStatusFilterDropdownOpen)
						}
						onSelect={(value) => {
							setStatusFilter(value);
							setIsStatusFilterDropdownOpen(false);
						}}
						options={statusFilterOptions}
						value={statusFilter}
						placeholder="All Status"
						buttonClassName="text-sm"
					/>
				</div>
			</div>

			{/* Table */}
			<div className="border border-zinc-200 rounded-xl overflow-hidden">
				<table className="w-full">
					<thead className="bg-zinc-50 border-b border-zinc-200">
						<tr>
							<th
								className="py-3 px-4 text-left text-xs font-semibold text-zinc-700 border-r border-zinc-200 cursor-pointer hover:bg-zinc-100 transition-colors"
								onClick={() => handleSort("id")}
							>
								<div className="flex items-center">
									ID
									{getSortIcon("id")}
								</div>
							</th>
							<th
								className="py-3 px-4 text-left text-xs font-semibold text-zinc-700 border-r border-zinc-200 cursor-pointer hover:bg-zinc-100 transition-colors"
								onClick={() => handleSort("name")}
							>
								<div className="flex items-center">
									Name
									{getSortIcon("name")}
								</div>
							</th>
							<th
								className="py-3 px-4 text-left text-xs font-semibold text-zinc-700 border-r border-zinc-200 cursor-pointer hover:bg-zinc-100 transition-colors"
								onClick={() => handleSort("email")}
							>
								<div className="flex items-center">
									Email
									{getSortIcon("email")}
								</div>
							</th>
							<th
								className="py-3 px-4 text-left text-xs font-semibold text-zinc-700 border-r border-zinc-200 cursor-pointer hover:bg-zinc-100 transition-colors"
								onClick={() => handleSort("username")}
							>
								<div className="flex items-center">
									Username
									{getSortIcon("username")}
								</div>
							</th>
							<th
								className="py-3 px-4 text-left text-xs font-semibold text-zinc-700 border-r border-zinc-200 cursor-pointer hover:bg-zinc-100 transition-colors"
								onClick={() => handleSort("issue")}
							>
								<div className="flex items-center">
									Issue
									{getSortIcon("issue")}
								</div>
							</th>
							<th
								className="py-3 px-4 text-left text-xs font-semibold text-zinc-700 border-r border-zinc-200 cursor-pointer hover:bg-zinc-100 transition-colors"
								onClick={() => handleSort("status")}
							>
								<div className="flex items-center">
									Status
									{getSortIcon("status")}
								</div>
							</th>
							<th
								className="py-3 px-4 text-left text-xs font-semibold text-zinc-700 border-r border-zinc-200 cursor-pointer hover:bg-zinc-100 transition-colors"
								onClick={() => handleSort("createdAt")}
							>
								<div className="flex items-center">
									Date
									{getSortIcon("createdAt")}
								</div>
							</th>
							<th className="py-3 px-4 text-left text-xs font-semibold text-zinc-700">
								Actions
							</th>
						</tr>
					</thead>
					<tbody>
						{isLoading ? (
							<tr>
								<td colSpan={8} className="py-8">
									<TableSkeleton rows={5} columns={8} />
								</td>
							</tr>
						) : error ? (
							<tr>
								<td colSpan={8} className="py-8 text-center text-zinc-500">
									Error loading report issues. Please try again.
								</td>
							</tr>
						) : sortedIssues.length === 0 ? (
							<tr>
								<td colSpan={8} className="py-8 text-center text-zinc-500">
									{searchQuery || statusFilter !== "all"
										? "No issues found matching your filters."
										: "No reported issues yet."}
								</td>
							</tr>
						) : (
							sortedIssues.map((issue, index) => (
								<tr
									key={issue.id}
									className={`${
										index === sortedIssues.length - 1
											? ""
											: "border-b border-zinc-200"
									} hover:bg-zinc-50 transition-colors`}
								>
									<td className="py-3 px-4 border-r border-zinc-200">
										<code className="text-xs text-zinc-600 font-mono">
											{issue.id}
										</code>
									</td>
									<td className="py-3 px-4 border-r border-zinc-200">
										<div className="font-medium text-sm text-zinc-900">
											{issue.name || ""}
										</div>
									</td>
									<td className="py-3 px-4 border-r border-zinc-200">
										<div className="text-sm text-zinc-600">
											{issue.email || ""}
										</div>
									</td>
									<td className="py-3 px-4 border-r border-zinc-200">
										<div className="text-sm text-zinc-600">
											{issue.username || ""}
										</div>
									</td>
									<td className="py-3 px-4 border-r border-zinc-200">
										<div className="text-sm text-zinc-900 max-w-xs truncate">
											{issue.issue || ""}
										</div>
									</td>
									<td className="py-3 px-4 border-r border-zinc-200">
										<button
											onClick={() => handleStatusToggle(issue)}
											className="cursor-pointer"
										>
											{getStatusBadge(issue.status)}
										</button>
									</td>
									<td className="py-3 px-4 border-r border-zinc-200">
										<div className="text-xs text-zinc-600 flex items-center gap-1">
											<Calendar className="w-3 h-3" />
											{formatDate(issue.createdAt)}
										</div>
									</td>
									<td className="py-3 px-4">
										<div className="flex items-center gap-2">
											<motion.button
												whileHover={{ scale: 1.1 }}
												whileTap={{ scale: 0.9 }}
												onClick={() => handleDeleteClick(issue)}
												className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors"
												title="Remove"
											>
												<Trash2 className="w-4 h-4" />
											</motion.button>
										</div>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>

			{/* Delete Confirmation Modal */}
			<ConfirmationModal
				isOpen={isDeleteModalOpen}
				onClose={() => {
					setIsDeleteModalOpen(false);
					setIssueToDelete(null);
				}}
				onConfirm={handleDeleteConfirm}
				title="Delete Report Issue"
				message={
					issueToDelete
						? `Are you sure you want to delete this report issue? This action cannot be undone.`
						: "Are you sure you want to delete this report issue?"
				}
				confirmText="Delete"
				cancelText="Cancel"
				variant="danger"
			/>
		</div>
	);
};

export default ReportIssuesTab;
