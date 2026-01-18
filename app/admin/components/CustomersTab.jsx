import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
	Search,
	Mail,
	Calendar,
	CheckCircle2,
	XCircle,
	ArrowUpDown,
	ArrowUp,
	ArrowDown,
} from "lucide-react";
import { getAllCustomers } from "../../../lib/api/customers";
import TableSkeleton from "../../../lib/ui/TableSkeleton";
import Fuse from "fuse.js";

const CustomersTab = () => {
	const [searchQuery, setSearchQuery] = useState("");
	const [sortField, setSortField] = useState(null);
	const [sortDirection, setSortDirection] = useState("asc");

	const {
		data: customers = [],
		isLoading,
		error,
	} = useQuery({
		queryKey: ["customers"],
		queryFn: () => getAllCustomers(),
	});

	// Configure Fuse.js for search
	const fuse = useMemo(() => {
		return new Fuse(customers, {
			keys: [
				"email",
				"name",
				"customer_id",
				"customerId",
				"plan_name",
				"planName",
				"status",
			],
			threshold: 0.3,
			includeScore: true,
		});
	}, [customers]);

	// Perform search with Fuse.js
	const searchedCustomers = useMemo(() => {
		if (!searchQuery.trim()) {
			return customers;
		}
		return fuse.search(searchQuery).map((result) => result.item);
	}, [searchQuery, fuse, customers]);

	// Sort customers
	const sortedCustomers = useMemo(() => {
		return [...searchedCustomers].sort((a, b) => {
			if (!sortField) return 0;

			// Handle date comparison
			if (sortField === "createdAt") {
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
				case "name":
					aValue = (a.name || "").toLowerCase();
					bValue = (b.name || "").toLowerCase();
					break;
				case "planName":
					aValue = (a.plan_name || a.planName || "").toLowerCase();
					bValue = (b.plan_name || b.planName || "").toLowerCase();
					break;
				case "status":
					aValue = (a.status || "").toLowerCase();
					bValue = (b.status || "").toLowerCase();
					break;
				case "customerId":
					aValue = (a.customer_id || a.customerId || a.id || "").toLowerCase();
					bValue = (b.customer_id || b.customerId || b.id || "").toLowerCase();
					break;
				default:
					return 0;
			}

			if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
			if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
			return 0;
		});
	}, [searchedCustomers, sortField, sortDirection]);

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
		const d = new Date(date);
		return d.toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	const formatCurrency = (amount, currency = "usd") => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: currency.toUpperCase(),
		}).format(amount / 100);
	};

	return (
		<div className="space-y-4">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-zinc-900">Customers</h1>
					<p className="text-sm text-zinc-600 mt-1">
						Manage your paid customers and subscriptions
					</p>
				</div>
			</div>

			{/* Search */}
			<div className="relative">
				<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
				<input
					type="text"
					placeholder="Search customers by email, name, or customer ID..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-100 text-sm"
				/>
			</div>

			{/* Table */}
			<div className="border border-zinc-200 rounded-xl overflow-x-auto">
				<table className="w-full">
					<thead className="bg-zinc-50 border-b border-zinc-200">
						<tr>
							<th
								className="py-3 px-4 text-left text-xs font-semibold text-zinc-700 border-r border-zinc-200 cursor-pointer hover:bg-zinc-100 transition-colors"
								onClick={() => handleSort("name")}
							>
								<div className="flex items-center">
									Customer
									{getSortIcon("name")}
								</div>
							</th>
							<th
								className="py-3 px-4 text-left text-xs font-semibold text-zinc-700 border-r border-zinc-200 cursor-pointer hover:bg-zinc-100 transition-colors"
								onClick={() => handleSort("planName")}
							>
								<div className="flex items-center">
									Plan
									{getSortIcon("planName")}
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
								onClick={() => handleSort("amount")}
							>
								<div className="flex items-center">
									Amount
									{getSortIcon("amount")}
								</div>
							</th>
							<th
								className="py-3 px-4 text-left text-xs font-semibold text-zinc-700 border-r border-zinc-200 cursor-pointer hover:bg-zinc-100 transition-colors"
								onClick={() => handleSort("createdAt")}
							>
								<div className="flex items-center">
									Joined
									{getSortIcon("createdAt")}
								</div>
							</th>
							<th
								className="py-3 px-4 text-left text-xs font-semibold text-zinc-700 cursor-pointer hover:bg-zinc-100 transition-colors"
								onClick={() => handleSort("customerId")}
							>
								<div className="flex items-center">
									Customer ID
									{getSortIcon("customerId")}
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
									Error loading customers. Please try again.
								</td>
							</tr>
						) : sortedCustomers.length === 0 ? (
							<tr>
								<td colSpan={6} className="py-8 text-center text-zinc-500">
									{searchQuery
										? "No customers found matching your search."
										: "No customers yet. Customers will appear here after they subscribe."}
								</td>
							</tr>
						) : (
							sortedCustomers.map((customer, index) => (
								<tr
									key={customer.id}
									className={`${
										index === sortedCustomers.length - 1
											? ""
											: "border-b border-zinc-200"
									} hover:bg-zinc-50 transition-colors`}
								>
									<td className="py-3 px-4 border-r border-zinc-200">
										<div>
											<div className="font-medium text-sm text-zinc-900">
												{customer.name || "N/A"}
											</div>
											<div className="text-xs text-zinc-600 flex items-center gap-1 mt-1">
												<Mail className="w-3 h-3" />
												{customer.email || "N/A"}
											</div>
										</div>
									</td>
									<td className="py-3 px-4 border-r border-zinc-200">
										<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-900 text-white">
											{customer.plan_name || customer.planName || "Pro"}
										</span>
									</td>
									<td className="py-3 px-4 border-r border-zinc-200">
										{customer.status === "active" ? (
											<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
												<CheckCircle2 className="w-3 h-3" />
												Active
											</span>
										) : (
											<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
												<XCircle className="w-3 h-3" />
												{customer.status || "Inactive"}
											</span>
										)}
									</td>
									<td className="py-3 px-4 border-r border-zinc-200">
										{formatCurrency(
											customer.amount || 0,
											customer.currency || "usd"
										)}
									</td>
									<td className="py-3 px-4 border-r border-zinc-200">
										<div className="text-xs text-zinc-600 flex items-center gap-1">
											<Calendar className="w-3 h-3" />
											{formatDate(customer.created_at || customer.createdAt)}
										</div>
									</td>
									<td className="py-3 px-4">
										<code className="text-xs text-zinc-600 font-mono">
											{customer.customer_id ||
												customer.customerId ||
												customer.id}
										</code>
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

export default CustomersTab;
