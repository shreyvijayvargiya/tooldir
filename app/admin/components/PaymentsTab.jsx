import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { DollarSign, Search, Calendar, CheckCircle2, XCircle, Clock } from "lucide-react";
import { getAllPayments } from "../../../lib/api/payments";
import TableSkeleton from "../../../lib/ui/TableSkeleton";

const PaymentsTab = () => {
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("all"); // all, succeeded, failed, pending

	const { data: payments = [], isLoading, error } = useQuery({
		queryKey: ["payments"],
		queryFn: () => getAllPayments(),
	});

	const filteredPayments = payments.filter((payment) => {
		const matchesSearch =
			payment.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			payment.payment_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			payment.paymentId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			payment.customer_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			payment.customerId?.toLowerCase().includes(searchQuery.toLowerCase());

		const matchesStatus =
			statusFilter === "all" || payment.status === statusFilter;

		return matchesSearch && matchesStatus;
	});

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
							<th className="py-3 px-4 text-left text-xs font-semibold text-zinc-700 border-r border-zinc-200">
								Payment ID
							</th>
							<th className="py-3 px-4 text-left text-xs font-semibold text-zinc-700 border-r border-zinc-200">
								Customer
							</th>
							<th className="py-3 px-4 text-left text-xs font-semibold text-zinc-700 border-r border-zinc-200">
								Amount
							</th>
							<th className="py-3 px-4 text-left text-xs font-semibold text-zinc-700 border-r border-zinc-200">
								Status
							</th>
							<th className="py-3 px-4 text-left text-xs font-semibold text-zinc-700 border-r border-zinc-200">
								Date
							</th>
							<th className="py-3 px-4 text-left text-xs font-semibold text-zinc-700">
								Plan
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
						) : filteredPayments.length === 0 ? (
							<tr>
								<td colSpan={6} className="py-8 text-center text-zinc-500">
									{searchQuery || statusFilter !== "all"
										? "No payments found matching your filters."
										: "No payments yet. Payments will appear here after customers subscribe."}
								</td>
							</tr>
						) : (
							filteredPayments.map((payment, index) => (
								<tr
									key={payment.id}
									className={`${
										index === filteredPayments.length - 1
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


