import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Users, Search, Mail, Calendar, CheckCircle2, XCircle } from "lucide-react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../../../utils/firebase";
import TableSkeleton from "../../../lib/ui/TableSkeleton";

const CUSTOMERS_COLLECTION = "customers";

const getAllCustomers = async () => {
	try {
		const q = query(
			collection(db, CUSTOMERS_COLLECTION),
			orderBy("createdAt", "desc")
		);
		const querySnapshot = await getDocs(q);
		const customers = [];
		querySnapshot.forEach((doc) => {
			customers.push({
				id: doc.id,
				...doc.data(),
			});
		});
		return customers;
	} catch (error) {
		console.error("Error getting customers:", error);
		throw error;
	}
};

const CustomersTab = () => {
	const [searchQuery, setSearchQuery] = useState("");

	const { data: customers = [], isLoading, error } = useQuery({
		queryKey: ["customers"],
		queryFn: () => getAllCustomers(),
	});

	const filteredCustomers = customers.filter((customer) => {
		const searchLower = searchQuery.toLowerCase();
		return (
			customer.email?.toLowerCase().includes(searchLower) ||
			customer.name?.toLowerCase().includes(searchLower) ||
			customer.customerId?.toLowerCase().includes(searchLower)
		);
	});

	const formatDate = (date) => {
		if (!date) return "N/A";
		const d = date?.toDate ? date.toDate() : new Date(date);
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
					className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 text-sm"
				/>
			</div>

			{/* Table */}
			<div className="border border-zinc-200 rounded-xl overflow-hidden">
				<table className="w-full">
					<thead className="bg-zinc-50 border-b border-zinc-200">
						<tr>
							<th className="py-3 px-4 text-left text-xs font-semibold text-zinc-700 border-r border-zinc-200">
								Customer
							</th>
							<th className="py-3 px-4 text-left text-xs font-semibold text-zinc-700 border-r border-zinc-200">
								Plan
							</th>
							<th className="py-3 px-4 text-left text-xs font-semibold text-zinc-700 border-r border-zinc-200">
								Status
							</th>
							<th className="py-3 px-4 text-left text-xs font-semibold text-zinc-700 border-r border-zinc-200">
								Amount
							</th>
							<th className="py-3 px-4 text-left text-xs font-semibold text-zinc-700 border-r border-zinc-200">
								Joined
							</th>
							<th className="py-3 px-4 text-left text-xs font-semibold text-zinc-700">
								Customer ID
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
						) : filteredCustomers.length === 0 ? (
							<tr>
								<td colSpan={6} className="py-8 text-center text-zinc-500">
									{searchQuery
										? "No customers found matching your search."
										: "No customers yet. Customers will appear here after they subscribe."}
								</td>
							</tr>
						) : (
							filteredCustomers.map((customer, index) => (
								<tr
									key={customer.id}
									className={`${
										index === filteredCustomers.length - 1
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
											{customer.planName || "Pro"}
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
										{customer.amount
											? formatCurrency(customer.amount, customer.currency)
											: "N/A"}
									</td>
									<td className="py-3 px-4 border-r border-zinc-200">
										<div className="text-xs text-zinc-600 flex items-center gap-1">
											<Calendar className="w-3 h-3" />
											{formatDate(customer.createdAt)}
										</div>
									</td>
									<td className="py-3 px-4">
										<code className="text-xs text-zinc-600 font-mono">
											{customer.customerId || customer.id}
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

