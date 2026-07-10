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
import AnimatedDropdown from "../../../lib/ui/AnimatedDropdown";
import Fuse from "fuse.js";
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
import { Plus } from "lucide-react";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PaymentsTab = () => {
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("all"); // all, succeeded, failed, pending
	const [statusFilterDropdownOpen, setStatusFilterDropdownOpen] =
		useState(false);
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
			return <ArrowUpDown className="w-3.5 h-3.5 ml-1 text-muted-foreground" />;
		}
		return sortDirection === "asc" ? (
			<ArrowUp className="w-3.5 h-3.5 ml-1 text-foreground" />
		) : (
			<ArrowDown className="w-3.5 h-3.5 ml-1 text-foreground" />
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
					<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-foreground">
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
			<div className="flex items-center justify-between border-b py-2 px-4">
				<div>
					<h1 className="text-lg text-foreground">Payments</h1>
					<p className="text-sm text-muted-foreground mt-1">
						Track all payment transactions and revenue
					</p>
				</div>
				<div className="flex items-center gap-2">
					<ExportDropdown
						dataType="payments"
						data={sortedPayments.map((p) => ({
							...p,
							paymentId: p.paymentId || p.payment_id || p.id,
							customerName: p.customerName || p.customer_name || p.name || "N/A",
							customerEmail: p.customerEmail || p.email || "N/A",
							planName: p.planName || p.plan_name,
							createdAt: p.createdAt || p.created_at,
						}))}
					/>
					<Button
						onClick={() =>
							toast.info(
								"Payments are created automatically after checkout. This view is read-only."
							)
						}
						className="flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1.5 rounded-xl hover:bg-primary/90 transition-colors text-sm"
					>
						<Plus className="w-3.5 h-3.5" />
						Add Payment
					</Button>
				</div>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4 px-4">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="p-4 rounded-xl border bg-card"
				>
					<div className="flex items-center justify-between">
						<div>
							<p className="text-xs font-medium text-muted-foreground mb-1">
								Total Payments
							</p>
							<p className="text-2xl font-bold text-foreground">{stats.total}</p>
						</div>
						<DollarSign className="w-8 h-8 text-muted-foreground" />
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
			<div className="flex items-center gap-4 mx-4">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
					<input
						type="text"
						placeholder="Search payments by email, payment ID, or customer ID..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full pl-10 pr-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring text-sm"
					/>
				</div>
				<AnimatedDropdown
					isOpen={statusFilterDropdownOpen}
					onToggle={() =>
						setStatusFilterDropdownOpen(!statusFilterDropdownOpen)
					}
					onSelect={(value) => setStatusFilter(value)}
					options={[
						{ value: "all", label: "All Status" },
						{
							value: "succeeded",
							label: "Succeeded",
							color: "bg-green-100 text-green-800",
						},
						{
							value: "failed",
							label: "Failed",
							color: "bg-red-100 text-red-800",
						},
						{
							value: "pending",
							label: "Pending",
							color: "bg-yellow-100 text-yellow-800",
						},
					]}
					value={statusFilter}
					placeholder="All Status"
					className="w-48"
					buttonClassName="text-sm"
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
								<TableHead sortable onClick={() => handleSort("paymentId")}>
									<div className="flex items-center gap-2">
										Payment ID
										{getSortIcon("paymentId")}
									</div>
								</TableHead>
								<TableHead sortable onClick={() => handleSort("customerName")}>
									<div className="flex items-center gap-2">
										Customer
										{getSortIcon("customerName")}
									</div>
								</TableHead>
								<TableHead sortable onClick={() => handleSort("amount")}>
									<div className="flex items-center gap-2">
										Amount
										{getSortIcon("amount")}
									</div>
								</TableHead>
								<TableHead sortable onClick={() => handleSort("status")}>
									<div className="flex items-center gap-2">
										Status
										{getSortIcon("status")}
									</div>
								</TableHead>
								<TableHead sortable onClick={() => handleSort("date")}>
									<div className="flex items-center gap-2">
										Date
										{getSortIcon("date")}
									</div>
								</TableHead>
								<TableHead sortable onClick={() => handleSort("planName")}>
									<div className="flex items-center gap-2">
										Plan
										{getSortIcon("planName")}
									</div>
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{error ? (
								<TableEmpty
									colSpan={6}
									message="Error loading payments. Please try again."
								/>
							) : sortedPayments.length === 0 ? (
								<TableEmpty
									colSpan={6}
									message={
										searchQuery || statusFilter !== "all"
											? "No payments found matching your filters."
											: "No payments yet. Paid launch slots from /submit will show here after Stripe webhook."
									}
								/>
							) : (
								sortedPayments.map((payment) => (
									<TableRow key={payment.id}>
										<TableCell>
											<code className="text-xs text-muted-foreground font-mono">
												{payment.payment_id || payment.paymentId || payment.id}
											</code>
										</TableCell>
										<TableCell>
											<div>
												<div className="font-medium text-sm text-foreground">
													{payment.name || payment.customer_name || "N/A"}
												</div>
												<div className="text-xs text-muted-foreground">
													{payment.email || "N/A"}
												</div>
											</div>
										</TableCell>
										<TableCell>
											<span className="font-semibold text-sm text-foreground">
												{payment.amount
													? formatCurrency(payment.amount, payment.currency)
													: "$0"}
											</span>
										</TableCell>
										<TableCell>{getStatusBadge(payment.status)}</TableCell>
										<TableCell className="text-muted-foreground">
											<div className="text-xs flex items-center gap-1">
												<Calendar className="w-3 h-3" />
												{formatDate(payment.created_at || payment.createdAt)}
											</div>
										</TableCell>
										<TableCell>
											<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary text-primary-foreground">
												{payment.plan_name || payment.planName || "Pro"}
											</span>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				)}
			</div>
		</div>
	);
};

export default PaymentsTab;
