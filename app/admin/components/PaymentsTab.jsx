import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
	DollarSign,
	Search,
	Calendar,
	CheckCircle2,
	XCircle,
	Clock,
	ArrowUpDown,
	ArrowUp,
	ArrowDown,
} from "lucide-react";
import { getAllPayments } from "../../../lib/api/payments";
import TableSkeleton from "../../../lib/ui/TableSkeleton";
import Fuse from "fuse.js";

const PaymentsTab = () => {
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("all"); // all, succeeded, failed, pending
	const [sortField, setSortField] = useState(null);
	const [sortDirection, setSortDirection] = useState("asc");

	const {
		data: payments = [],
		isLoading,
		error,
	} = useQuery({
		queryKey: ["payments"],
		queryFn: () => getAllPayments(),
	});

	// Filter by status first
	const statusFilteredPayments = useMemo(() => {
		return payments.filter((payment) => {
			return statusFilter === "all" || payment.status === statusFilter;
		});
	}, [payments, statusFilter]);

	// Configure Fuse.js for search
	const fuse = useMemo(() => {
		return new Fuse(statusFilteredPayments, {
			keys: [
				"email",
				"payment_id",
				"paymentId",
				"customer_id",
				"customerId",
				"name",
				"plan_name",
				"planName",
			],
			threshold: 0.3,
			includeScore: true,
		});
	}, [statusFilteredPayments]);

	// Perform search with Fuse.js
	const searchedPayments = useMemo(() => {
		if (!searchQuery.trim()) {
			return statusFilteredPayments;
		}
		return fuse.search(searchQuery).map((result) => result.item);
	}, [searchQuery, fuse, statusFilteredPayments]);

	// Sort payments
	const sortedPayments = useMemo(() => {
		return [...searchedPayments].sort((a, b) => {
			if (!sortField) return 0;

			// Handle date comparison
			if (sortField === "createdAt" || sortField === "date") {
				const dateA = new Date(a.created_at || a.createdAt || 0);
				const dateB = new Date(b.created_at || b.createdAt || 0);
				return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
			}

			// Handle numeric comparison for amount
			if (sortField === "amount") {
				const amountA = a.amount || 0;
				const amountB = b.amount || 0;
				return sortDirection === "asc" ? amountA - amountB : amountB - amountA;
			}

			// Handle string comparison for other fields
			let aValue, bValue;

			switch (sortField) {
				case "paymentId":
					aValue = (a.payment_id || a.paymentId || a.id || "").toLowerCase();
					bValue = (b.payment_id || b.paymentId || b.id || "").toLowerCase();
					break;
				case "customerName":
					aValue = (a.name || a.customer_name || "").toLowerCase();
					bValue = (b.name || b.customer_name || "").toLowerCase();
					break;
				case "status":
					aValue = (a.status || "").toLowerCase();
					bValue = (b.status || "").toLowerCase();
					break;
				case "planName":
					aValue = (a.plan_name || a.planName || "").toLowerCase();
					bValue = (b.plan_name || b.planName || "").toLowerCase();
					break;
				default:
					return 0;
			}

			if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
			if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
			return 0;
		});
	}, [searchedPayments, sortField, sortDirection]);

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
		if (!date) return "N/A";

		try {
			const d = new Date(date);

			// Validate date
			if (isNaN(d.getTime())) {
				return "Invalid Date";
			}

			return d.toLocaleDateString("en-US", {
				year: "numeric",
				month: "short",
				day: "numeric",
				hour: "2-digit",
				minute: "2-digit",
			});
		} catch (error) {
			console.error("Error formatting date:", error, date);
			return "N/A";
		}
	};

	const formatCurrency = (amount, currency = "usd") => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: currency.toUpperCase(),
		}).format(amount / 100);
	};

	const getStatusBadge = (status) => {
		switch (status) {
			case "succeeded":
				return (
					<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
						<CheckCircle2 className="w-3 h-3" />
						Success
					</span>
				);
			case "failed":
				return (
					<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
						<XCircle className="w-3 h-3" />
						Failed
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

	const stats = {
		total: payments.length,
		succeeded: payments.filter((p) => p.status === "succeeded").length,
		failed: payments.filter((p) => p.status === "failed").length,
		pending: payments.filter((p) => p.status === "pending").length,
		totalRevenue: payments
			.filter((p) => p.status === "succeeded")
			.reduce((sum, p) => sum + (p.amount || 0), 0),
	};

	return (
		<div className="space-y-4">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-zinc-900">Payments</h1>
					<p className="text-sm text-zinc-600 mt-1">
						Track all payment transactions and revenue
					</p>
				</div>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="p-4 rounded-xl border border-zinc-200 bg-white"
				>
					<div className="flex items-center justify-between">
						<div>
							<p className="text-xs font-medium text-zinc-600 mb-1">
								Total Payments
							</p>
							<p className="text-2xl font-bold text-zinc-900">{stats.total}</p>
						</div>
						<DollarSign className="w-8 h-8 text-zinc-400" />
					</div>
				</motion.div>
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1 }}
					className="p-4 rounded-xl border border-green-200 bg-green-50"
				>
					<div className="flex items-center justify-between">
						<div>
							<p className="text-xs font-medium text-green-600 mb-1">
								Successful
							</p>
							<p className="text-2xl font-bold text-green-900">
								{stats.succeeded}
							</p>
						</div>
						<CheckCircle2 className="w-8 h-8 text-green-400" />
					</div>
				</motion.div>
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
					className="p-4 rounded-xl border border-red-200 bg-red-50"
				>
					<div className="flex items-center justify-between">
						<div>
							<p className="text-xs font-medium text-red-600 mb-1">Failed</p>
							<p className="text-2xl font-bold text-red-900">{stats.failed}</p>
						</div>
						<XCircle className="w-8 h-8 text-red-400" />
					</div>
				</motion.div>
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
					className="p-4 rounded-xl border border-yellow-200 bg-yellow-50"
				>
					<div className="flex items-center justify-between">
						<div>
							<p className="text-xs font-medium text-yellow-600 mb-1">
								Total Revenue
							</p>
							<p className="text-2xl font-bold text-yellow-900">
								{formatCurrency(stats.totalRevenue)}
							</p>
						</div>
						<DollarSign className="w-8 h-8 text-yellow-400" />
					</div>
				</motion.div>
			</div>

			{/* Filters */}
			<div className="flex items-center gap-4">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
					<input
						type="text"
						placeholder="Search payments by email, payment ID, or customer ID..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 text-sm"
					/>
				</div>
				<select
					value={statusFilter}
					onChange={(e) => setStatusFilter(e.target.value)}
					className="px-4 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 text-sm"
				>
					<option value="all">All Status</option>
					<option value="succeeded">Succeeded</option>
					<option value="failed">Failed</option>
					<option value="pending">Pending</option>
				</select>
			</div>

			{/* Table */}
			<div className="border border-zinc-200 rounded-xl overflow-hidden">
				<table className="w-full">
					<thead className="bg-zinc-50 border-b border-zinc-200">
						<tr>
							<th
								className="py-3 px-4 text-left text-xs font-semibold text-zinc-700 border-r border-zinc-200 cursor-pointer hover:bg-zinc-100 transition-colors"
								onClick={() => handleSort("paymentId")}
							>
								<div className="flex items-center">
									Payment ID
									{getSortIcon("paymentId")}
								</div>
							</th>
							<th
								className="py-3 px-4 text-left text-xs font-semibold text-zinc-700 border-r border-zinc-200 cursor-pointer hover:bg-zinc-100 transition-colors"
								onClick={() => handleSort("customerName")}
							>
								<div className="flex items-center">
									Customer
									{getSortIcon("customerName")}
								</div>
							</th>
							<th
								className="py-3 px-4 text-left text-xs font-semibold text-zinc-700 border-r border-zinc-200 cursor-pointer hover:bg-zinc-100 transition-colors"
								onClick={() => handleSort("amount")}
							>
								<div className="flex items-center">
									Amount
									{getSortIcon("amount")}
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
								onClick={() => handleSort("date")}
							>
								<div className="flex items-center">
									Date
									{getSortIcon("date")}
								</div>
							</th>
							<th
								className="py-3 px-4 text-left text-xs font-semibold text-zinc-700 cursor-pointer hover:bg-zinc-100 transition-colors"
								onClick={() => handleSort("planName")}
							>
								<div className="flex items-center">
									Plan
									{getSortIcon("planName")}
								</div>
							</th>
						</tr>
					</thead>
					<tbody>
						{isLoading ? (
							<tr>
								<td colSpan={6} className="py-8">
									<TableSkeleton rows={5} columns={6} />
								</td>
							</tr>
						) : error ? (
							<tr>
								<td colSpan={6} className="py-8 text-center text-zinc-500">
									Error loading payments. Please try again.
								</td>
							</tr>
						) : sortedPayments.length === 0 ? (
							<tr>
								<td colSpan={6} className="py-8 text-center text-zinc-500">
									{searchQuery || statusFilter !== "all"
										? "No payments found matching your filters."
										: "No payments yet. Payments will appear here after customers subscribe."}
								</td>
							</tr>
						) : (
							sortedPayments.map((payment, index) => (
								<tr
									key={payment.id}
									className={`${
										index === sortedPayments.length - 1
											? ""
											: "border-b border-zinc-200"
									} hover:bg-zinc-50 transition-colors`}
								>
									<td className="py-3 px-4 border-r border-zinc-200">
										<code className="text-xs text-zinc-600 font-mono">
											{payment.payment_id || payment.paymentId || payment.id}
										</code>
									</td>
									<td className="py-3 px-4 border-r border-zinc-200">
										<div>
											<div className="font-medium text-sm text-zinc-900">
												{payment.name || "N/A"}
											</div>
											<div className="text-xs text-zinc-600">
												{payment.email || "N/A"}
											</div>
										</div>
									</td>
									<td className="py-3 px-4 border-r border-zinc-200">
										<span className="font-semibold text-sm text-zinc-900">
											{payment.amount
												? formatCurrency(payment.amount, payment.currency)
												: "N/A"}
										</span>
									</td>
									<td className="py-3 px-4 border-r border-zinc-200">
										{getStatusBadge(payment.status)}
									</td>
									<td className="py-3 px-4 border-r border-zinc-200">
										<div className="text-xs text-zinc-600 flex items-center gap-1">
											<Calendar className="w-3 h-3" />
											{formatDate(payment.created_at || payment.createdAt)}
										</div>
									</td>
									<td className="py-3 px-4">
										<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-900 text-white">
											{payment.plan_name || payment.planName || "Pro"}
										</span>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default PaymentsTab;
