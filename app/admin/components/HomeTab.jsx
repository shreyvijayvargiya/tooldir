import React from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
	FileText,
	Mail,
	Users,
	TrendingUp,
	BarChart3,
	DollarSign,
	Eye,
} from "lucide-react";
import {
	LineChart,
	Line,
	BarChart,
	Bar,
	PieChart,
	Pie,
	Cell,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from "recharts";
import { getAllBlogs } from "../../../lib/api/blog";
import { getAllEmails } from "../../../lib/api/emails";
import { getAllCustomers } from "../../../lib/api/customers";
import { getAllPayments } from "../../../lib/api/payments";

const COLORS = ["#18181b", "#78716c", "#a8a29e", "#d6d3d1"];

const HomeTab = () => {
	// Fetch blogs and emails for analytics
	const { data: blogs = [], isLoading: blogsLoading } = useQuery({
		queryKey: ["blogs"],
		queryFn: () => getAllBlogs(),
	});

	const { data: emails = [], isLoading: emailsLoading } = useQuery({
		queryKey: ["emails"],
		queryFn: () => getAllEmails(),
	});

	// Fetch customers for analytics
	const { data: customers = [], isLoading: customersLoading } = useQuery({
		queryKey: ["customers"],
		queryFn: () => getAllCustomers(),
	});

	// Fetch payments for revenue calculation
	const { data: payments = [], isLoading: paymentsLoading } = useQuery({
		queryKey: ["payments"],
		queryFn: () => getAllPayments(),
	});

	// Calculate blog statistics
	const blogStats = {
		total: blogs.length,
		published: blogs.filter((b) => b.status === "published").length,
		draft: blogs.filter((b) => b.status === "draft").length,
		scheduled: blogs.filter((b) => b.status === "scheduled").length,
	};

	// Calculate email statistics
	const emailStats = {
		total: emails.length,
		published: emails.filter((e) => e.status === "published").length,
		draft: emails.filter((e) => e.status === "draft").length,
		scheduled: emails.filter((e) => e.status === "scheduled").length,
	};

	// Calculate customer statistics
	const customerStats = {
		total: customers.length,
		active: customers.filter((c) => c.status === "active").length,
		canceled: customers.filter(
			(c) => c.status === "canceled" || c.status === "cancelled"
		).length,
		trialing: customers.filter((c) => c.status === "trialing").length,
	};

	// Calculate revenue from successful payments
	const totalRevenue = payments
		.filter((p) => p.status === "succeeded")
		.reduce((sum, p) => {
			const amount = p.amount || 0;
			return sum + amount;
		}, 0);

	// Format revenue
	const formatCurrency = (amount, currency = "usd") => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: currency.toUpperCase(),
		}).format(amount / 100);
	};

	// Blog status distribution for pie chart
	const blogStatusData = [
		{ name: "Published", value: blogStats.published },
		{ name: "Draft", value: blogStats.draft },
		{ name: "Scheduled", value: blogStats.scheduled },
	];

	// Email status distribution for pie chart
	const emailStatusData = [
		{ name: "Published", value: emailStats.published },
		{ name: "Draft", value: emailStats.draft },
		{ name: "Scheduled", value: emailStats.scheduled },
	];

	// Blog creation over time (last 7 days)
	const getBlogsOverTime = () => {
		const days = [];
		for (let i = 6; i >= 0; i--) {
			const date = new Date();
			date.setDate(date.getDate() - i);
			date.setHours(0, 0, 0, 0);
			const dateStr = date.toLocaleDateString("en-US", {
				month: "short",
				day: "numeric",
			});

			const count = blogs.filter((blog) => {
				if (!blog.createdAt) return false;
				const blogDate = blog.createdAt?.toDate
					? blog.createdAt.toDate()
					: new Date(blog.createdAt);
				blogDate.setHours(0, 0, 0, 0);
				return blogDate.getTime() === date.getTime();
			}).length;

			const emailCount = emails.filter((email) => {
				if (!email.createdAt) return false;
				const emailDate = email.createdAt?.toDate
					? email.createdAt.toDate()
					: new Date(email.createdAt);
				emailDate.setHours(0, 0, 0, 0);
				return emailDate.getTime() === date.getTime();
			}).length;

			days.push({ date: dateStr, blogs: count, emails: emailCount });
		}

		return days;
	};

	const timeSeriesData = getBlogsOverTime();

	// Stats cards
	const statsCards = [
		{
			icon: FileText,
			title: "Total Blogs",
			value: blogStats.total,
			color: "bg-blue-50 text-blue-600 border-blue-200",
			isLoading: blogsLoading,
		},
		{
			icon: Mail,
			title: "Total Emails",
			value: emailStats.total,
			color: "bg-purple-50 text-purple-600 border-purple-200",
			isLoading: emailsLoading,
		},
		{
			icon: Users,
			title: "Customers",
			value: customersLoading ? "..." : customerStats.total,
			color: "bg-green-50 text-green-600 border-green-200",
			isLoading: customersLoading,
		},
		{
			icon: DollarSign,
			title: "Total Revenue",
			value: paymentsLoading ? "..." : formatCurrency(totalRevenue),
			color: "bg-yellow-50 text-yellow-600 border-yellow-200",
			isLoading: paymentsLoading,
		},
	];

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="text-left space-y-2 pb-4">
				<h1 className="text-2xl font-bold text-zinc-900">Admin Dashboard</h1>
				<p className="text-sm text-zinc-600">
					Overview of your content, customers, and revenue
				</p>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				{statsCards.map((stat, index) => {
					const Icon = stat.icon;
					return (
						<motion.div
							key={index}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: index * 0.1 }}
							className={`p-4 rounded-xl border ${stat.color}`}
						>
							<div className="flex items-center justify-between">
								<div>
									<p className="text-xs font-medium text-zinc-600 mb-1">
										{stat.title}
									</p>
									<p className="text-2xl font-bold text-zinc-900">
										{stat.value}
									</p>
								</div>
								<Icon className="w-8 h-8 opacity-50" />
							</div>
						</motion.div>
					);
				})}
			</div>

			{/* Charts Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Blog Status Distribution */}
				<div className="p-4 rounded-xl border border-zinc-200 bg-white">
					<h3 className="text-sm font-semibold text-zinc-900 mb-4 flex items-center gap-2">
						<BarChart3 className="w-4 h-4" />
						Blog Status Distribution
					</h3>
					{blogsLoading ? (
						<div className="h-64 flex items-center justify-center text-zinc-500">
							Loading...
						</div>
					) : (
						<ResponsiveContainer width="100%" height={250}>
							<PieChart>
								<Pie
									data={blogStatusData}
									cx="50%"
									cy="50%"
									labelLine={false}
									label={({ name, percent }) =>
										`${name} ${(percent * 100).toFixed(0)}%`
									}
									outerRadius={80}
									fill="#8884d8"
									dataKey="value"
								>
									{blogStatusData.map((entry, index) => (
										<Cell
											key={`cell-${index}`}
											fill={COLORS[index % COLORS.length]}
										/>
									))}
								</Pie>
								<Tooltip />
							</PieChart>
						</ResponsiveContainer>
					)}
				</div>

				{/* Email Status Distribution */}
				<div className="p-4 rounded-xl border border-zinc-200 bg-white">
					<h3 className="text-sm font-semibold text-zinc-900 mb-4 flex items-center gap-2">
						<BarChart3 className="w-4 h-4" />
						Email Status Distribution
					</h3>
					{emailsLoading ? (
						<div className="h-64 flex items-center justify-center text-zinc-500">
							Loading...
						</div>
					) : (
						<ResponsiveContainer width="100%" height={250}>
							<PieChart>
								<Pie
									data={emailStatusData}
									cx="50%"
									cy="50%"
									labelLine={false}
									label={({ name, percent }) =>
										`${name} ${(percent * 100).toFixed(0)}%`
									}
									outerRadius={80}
									fill="#8884d8"
									dataKey="value"
								>
									{emailStatusData.map((entry, index) => (
										<Cell
											key={`cell-${index}`}
											fill={COLORS[index % COLORS.length]}
										/>
									))}
								</Pie>
								<Tooltip />
							</PieChart>
						</ResponsiveContainer>
					)}
				</div>

				{/* Content Creation Over Time */}
				<div className="p-4 rounded-xl border border-zinc-200 bg-white lg:col-span-2">
					<h3 className="text-sm font-semibold text-zinc-900 mb-4 flex items-center gap-2">
						<TrendingUp className="w-4 h-4" />
						Content Creation Over Time (Last 7 Days)
					</h3>
					{blogsLoading || emailsLoading ? (
						<div className="h-64 flex items-center justify-center text-zinc-500">
							Loading...
						</div>
					) : (
						<ResponsiveContainer width="100%" height={300}>
							<LineChart data={timeSeriesData}>
								<CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
								<XAxis
									dataKey="date"
									stroke="#71717a"
									style={{ fontSize: "12px" }}
								/>
								<YAxis stroke="#71717a" style={{ fontSize: "12px" }} />
								<Tooltip
									contentStyle={{
										backgroundColor: "#fff",
										border: "1px solid #e4e4e7",
										borderRadius: "8px",
									}}
								/>
								<Legend />
								<Line
									type="monotone"
									dataKey="blogs"
									stroke="#3b82f6"
									strokeWidth={2}
									name="Blogs"
									dot={{ fill: "#3b82f6", r: 4 }}
								/>
								<Line
									type="monotone"
									dataKey="emails"
									stroke="#a855f7"
									strokeWidth={2}
									name="Emails"
									dot={{ fill: "#a855f7", r: 4 }}
								/>
							</LineChart>
						</ResponsiveContainer>
					)}
				</div>

				{/* Blog vs Email Comparison */}
				<div className="p-4 rounded-xl border border-zinc-200 bg-white lg:col-span-2">
					<h3 className="text-sm font-semibold text-zinc-900 mb-4 flex items-center gap-2">
						<BarChart3 className="w-4 h-4" />
						Content Overview
					</h3>
					{blogsLoading || emailsLoading ? (
						<div className="h-64 flex items-center justify-center text-zinc-500">
							Loading...
						</div>
					) : (
						<ResponsiveContainer width="100%" height={300}>
							<BarChart data={timeSeriesData}>
								<CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
								<XAxis
									dataKey="date"
									stroke="#71717a"
									style={{ fontSize: "12px" }}
								/>
								<YAxis stroke="#71717a" style={{ fontSize: "12px" }} />
								<Tooltip
									contentStyle={{
										backgroundColor: "#fff",
										border: "1px solid #e4e4e7",
										borderRadius: "8px",
									}}
								/>
								<Legend />
								<Bar
									dataKey="blogs"
									fill="#3b82f6"
									name="Blogs"
									radius={[8, 8, 0, 0]}
								/>
								<Bar
									dataKey="emails"
									fill="#a855f7"
									name="Emails"
									radius={[8, 8, 0, 0]}
								/>
							</BarChart>
						</ResponsiveContainer>
					)}
				</div>
			</div>
		</div>
	);
};

export default HomeTab;
