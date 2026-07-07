import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
	Search,
	Mail,
	Calendar,
	CheckCircle2,
	XCircle,
	Plus,
	ArrowUpDown,
	ArrowUp,
	ArrowDown,
} from "lucide-react";
import { getAllCustomers } from "../../../lib/api/customers";
import TableSkeleton from "../../../lib/ui/TableSkeleton";
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
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
			<div className="flex items-center justify-between border-b py-2 px-4">
				<div>
					<h1 className="text-lg text-foreground">Customers</h1>
					<p className="text-sm text-muted-foreground mt-1">
						Manage your paid customers and subscriptions
					</p>
				</div>
				<div className="flex items-center gap-2">
					<ExportDropdown
						dataType="customers"
						data={sortedCustomers.map((c) => ({
							...c,
							customerId: c.customerId || c.customer_id || c.id,
							subscriptionId: c.subscriptionId || c.subscription_id,
							planName: c.planName || c.plan_name,
							createdAt: c.createdAt || c.created_at,
						}))}
					/>
					<Button
						onClick={() =>
							toast.info(
								"Customers are created after checkout/subscription. This list is read-only."
							)
						}
						className="flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1.5 rounded-xl hover:bg-primary/90 transition-colors text-sm"
					>
						<Plus className="w-3.5 h-3.5" />
						Add New Customer
					</Button>
				</div>
			</div>

			{/* Search */}
			<div className="relative mx-4">
				<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
				<input
					type="text"
					placeholder="Search customers by email, name, or customer ID..."
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
								<TableHead sortable onClick={() => handleSort("name")}>
									<div className="flex items-center gap-2">
										Customer
										{getSortIcon("name")}
									</div>
								</TableHead>
								<TableHead sortable onClick={() => handleSort("planName")}>
									<div className="flex items-center gap-2">
										Plan
										{getSortIcon("planName")}
									</div>
								</TableHead>
								<TableHead sortable onClick={() => handleSort("status")}>
									<div className="flex items-center gap-2">
										Status
										{getSortIcon("status")}
									</div>
								</TableHead>
								<TableHead sortable onClick={() => handleSort("amount")}>
									<div className="flex items-center gap-2">
										Amount
										{getSortIcon("amount")}
									</div>
								</TableHead>
								<TableHead sortable onClick={() => handleSort("createdAt")}>
									<div className="flex items-center gap-2">
										Joined
										{getSortIcon("createdAt")}
									</div>
								</TableHead>
								<TableHead sortable onClick={() => handleSort("customerId")}>
									<div className="flex items-center gap-2">
										Customer ID
										{getSortIcon("customerId")}
									</div>
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{error ? (
								<TableEmpty
									colSpan={6}
									message="Error loading customers. Please try again."
								/>
							) : sortedCustomers.length === 0 ? (
								<TableEmpty
									colSpan={6}
									message={
										searchQuery
											? "No customers found matching your search."
											: "No customers yet. Customers will appear here after they subscribe."
									}
								/>
							) : (
								sortedCustomers.map((customer) => (
									<TableRow key={customer.id} hover>
										<TableCell>
											<div>
												<div className="font-medium text-sm text-foreground">
													{customer.name || "N/A"}
												</div>
												<div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
													<Mail className="w-3 h-3" />
													{customer.email || "N/A"}
												</div>
											</div>
										</TableCell>
										<TableCell>
											<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary text-primary-foreground">
												{customer.plan_name || customer.planName || "Pro"}
											</span>
										</TableCell>
										<TableCell>
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
										</TableCell>
										<TableCell>
											{formatCurrency(
												customer.amount || 0,
												customer.currency || "usd"
											)}
										</TableCell>
										<TableCell className="text-muted-foreground">
											<div className="text-xs flex items-center gap-1">
												<Calendar className="w-3 h-3" />
												{formatDate(customer.created_at || customer.createdAt)}
											</div>
										</TableCell>
										<TableCell>
											<code className="text-xs text-muted-foreground font-mono">
												{customer.customer_id ||
													customer.customerId ||
													customer.id}
											</code>
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

export default CustomersTab;
