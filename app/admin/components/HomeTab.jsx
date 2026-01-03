import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
	FileText,
	Mail,
	Users,
	TrendingUp,
	DollarSign,
	CreditCard,
	Receipt,
	MessageSquare,
	Building2,
	UsersRound,
	AlertCircle,
	ArrowRight,
	CheckCircle2,
	Clock,
	Activity,
	Zap,
	Eye,
} from "lucide-react";
import {
	LineChart,
	Line,
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
import { getAllInvoices } from "../../../lib/api/invoice";
import { getAllWaitlist } from "../../../lib/api/waitlist";
import { getAllReportIssues } from "../../../lib/api/reportissues";
import { getAllMessages } from "../../../lib/api/messages";
import { getAllSubscribers } from "../../../lib/api/subscribers";
import { getAllUsers } from "../../../lib/api/users";
import AnimatedDropdown from "../../../lib/ui/AnimatedDropdown";

const HomeTab = ({ onNavigate }) => {
	const [isQuickActionsDropdownOpen, setIsQuickActionsDropdownOpen] =
		useState(false);

	// Fetch all data
	const { data: blogs = [], isLoading: blogsLoading } = useQuery({
		queryKey: ["blogs"],
		queryFn: () => getAllBlogs(),
	});

	const { data: emails = [], isLoading: emailsLoading } = useQuery({
		queryKey: ["emails"],
		queryFn: () => getAllEmails(),
	});

	const { data: customers = [], isLoading: customersLoading } = useQuery({
		queryKey: ["customers"],
		queryFn: () => getAllCustomers(),
	});

	const { data: payments = [], isLoading: paymentsLoading } = useQuery({
		queryKey: ["payments"],
		queryFn: () => getAllPayments(),
	});

	const { data: invoices = [], isLoading: invoicesLoading } = useQuery({
		queryKey: ["invoices"],
		queryFn: () => getAllInvoices(),
	});

	const { data: waitlist = [], isLoading: waitlistLoading } = useQuery({
		queryKey: ["waitlist"],
		queryFn: () => getAllWaitlist(),
	});

	const { data: reportIssues = [], isLoading: issuesLoading } = useQuery({
		queryKey: ["reportIssues"],
		queryFn: () => getAllReportIssues(),
	});

	const { data: messages = [], isLoading: messagesLoading } = useQuery({
		queryKey: ["messages"],
		queryFn: () => getAllMessages(),
	});

	const { data: subscribers = [], isLoading: subscribersLoading } = useQuery({
		queryKey: ["subscribers"],
		queryFn: () => getAllSubscribers(),
	});

	const { data: users = [], isLoading: usersLoading } = useQuery({
		queryKey: ["users"],
		queryFn: () => getAllUsers(),
	});

	// Calculate statistics
	const formatCurrency = (amount, currency = "usd") => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: currency.toUpperCase(),
		}).format(amount / 100);
	};

	// Content Stats
	const contentStats = {
		blogs: {
			total: blogs.length,
			published: blogs.filter((b) => b.status === "published").length,
			draft: blogs.filter((b) => b.status === "draft").length,
		},
		emails: {
			total: emails.length,
			published: emails.filter((e) => e.status === "published").length,
			draft: emails.filter((e) => e.status === "draft").length,
		},
	};

	// Audience Stats
	const audienceStats = {
		subscribers: subscribers.filter((s) => s.status === "active").length,
		users: users.length,
		customers: customers.filter((c) => c.status === "active").length,
		waitlist: waitlist.length,
	};

	// Financial Stats
	const financialStats = {
		totalRevenue: payments
			.filter((p) => p.status === "succeeded")
			.reduce((sum, p) => sum + (p.amount || 0), 0),
		totalPayments: payments.filter((p) => p.status === "succeeded").length,
		totalInvoices: invoices.length,
		paidInvoices: invoices.filter((i) => i.status === "paid").length,
		unpaidInvoices: invoices.filter((i) => i.status === "unpaid").length,
		unpaidAmount: invoices
			.filter((i) => i.status === "unpaid")
			.reduce((sum, i) => sum + (i.total || 0), 0),
		invoiceRevenue: invoices
			.filter((i) => i.status === "paid")
			.reduce((sum, i) => sum + (i.total || 0), 0),
	};

	// Communication Stats
	const communicationStats = {
		totalMessages: messages.length,
		unreadMessages: messages.filter((m) => !m.read).length,
		unrepliedMessages: messages.filter((m) => !m.replied).length,
	};

	// Support Stats
	const supportStats = {
		totalIssues: reportIssues.length,
		pendingIssues: reportIssues.filter((i) => i.status === "pending").length,
		fixedIssues: reportIssues.filter((i) => i.status === "fixed").length,
	};

	// Recent activity
	const recentBlogs = blogs.slice(0, 3);
	const recentInvoices = invoices.slice(0, 3);
	const recentMessages = messages.filter((m) => !m.read).slice(0, 3);
	const recentIssues = reportIssues
		.filter((i) => i.status === "pending")
		.slice(0, 3);

	const formatDate = (date) => {
		if (!date) return "";
		const d = date?.toDate ? date.toDate() : new Date(date);
		if (isNaN(d.getTime())) return "";
		const now = new Date();
		const diffTime = Math.abs(now - d);
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

		if (diffDays === 0) return "Today";
		if (diffDays === 1) return "Yesterday";
		if (diffDays < 7) return `${diffDays} days ago`;
		return d.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
		});
	};

	// Content creation over time (last 7 days)
	const getContentOverTime = () => {
		const days = [];
		for (let i = 6; i >= 0; i--) {
			const date = new Date();
			date.setDate(date.getDate() - i);
			date.setHours(0, 0, 0, 0);
			const dateStr = date.toLocaleDateString("en-US", {
				month: "short",
				day: "numeric",
			});

			const blogCount = blogs.filter((blog) => {
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

			days.push({ date: dateStr, blogs: blogCount, emails: emailCount });
		}
		return days;
	};

	const timeSeriesData = getContentOverTime();

	// Priority alerts
	const priorityAlerts = [
		...(communicationStats.unreadMessages > 0
			? [
					{
						type: "message",
						count: communicationStats.unreadMessages,
						label: "unread message",
						action: () => onNavigate?.("messages"),
						color: "bg-zinc-50 border-zinc-300 text-zinc-900",
						icon: MessageSquare,
					},
				]
			: []),
		...(supportStats.pendingIssues > 0
			? [
					{
						type: "issue",
						count: supportStats.pendingIssues,
						label: "pending issue",
						action: () => onNavigate?.("reportIssues"),
						color: "bg-zinc-50 border-zinc-300 text-zinc-900",
						icon: AlertCircle,
					},
				]
			: []),
		...(financialStats.unpaidInvoices > 0
			? [
					{
						type: "invoice",
						count: financialStats.unpaidInvoices,
						label: "unpaid invoice",
						action: () => onNavigate?.("invoices"),
						color: "bg-zinc-50 border-zinc-300 text-zinc-900",
						icon: Receipt,
					},
				]
			: []),
	];

	// Quick actions for dropdown
	const quickActionsOptions = [
		{
			value: "blog",
			label: "New Blog Post",
		},
		{
			value: "email",
			label: "New Email",
		},
		{
			value: "invoice",
			label: "Create Invoice",
		},
		{
			value: "waitlist",
			label: "Add Waitlist",
		},
	];

	const handleQuickActionSelect = (value) => {
		setIsQuickActionsDropdownOpen(false);
		switch (value) {
			case "blog":
				onNavigate?.("blogs");
				break;
			case "email":
				onNavigate?.("emails");
				break;
			case "invoice":
				onNavigate?.("invoices");
				break;
			case "waitlist":
				onNavigate?.("waitlist");
				break;
			default:
				break;
		}
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-zinc-900">Dashboard</h1>
					<p className="text-sm text-zinc-600 mt-1">
						Welcome back! Here's what's happening with your business.
					</p>
				</div>
				<div className="flex items-center gap-2 text-sm text-zinc-600">
					<Activity className="w-4 h-4" />
					<span>Last updated: Just now</span>
				</div>
			</div>

			{/* Priority Alerts */}
			{priorityAlerts.length > 0 && (
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					{priorityAlerts.map((alert, index) => {
						const Icon = alert.icon;
					return (
						<motion.div
							key={index}
								initial={{ opacity: 0, x: -20 }}
								animate={{ opacity: 1, x: 0 }}
							transition={{ delay: index * 0.1 }}
								onClick={alert.action}
								className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg ${alert.color}`}
						>
							<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<div className="p-2 rounded-xl bg-white/50">
											<Icon className="w-5 h-5" />
										</div>
								<div>
											<p className="text-sm font-medium">
												{alert.count} {alert.label}
												{alert.count > 1 ? "s" : ""}
											</p>
											<p className="text-xs opacity-75 mt-0.5">Click to view</p>
										</div>
									</div>
									<ArrowRight className="w-4 h-4 opacity-50" />
							</div>
						</motion.div>
					);
				})}
			</div>
			)}

			{/* Key Metrics */}
			<div>
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
						<TrendingUp className="w-5 h-5 text-zinc-600" />
						Key Metrics
					</h2>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					{/* Revenue Card */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="p-5 rounded-xl border-2 border-zinc-200 bg-zinc-50 cursor-pointer hover:shadow-lg transition-all"
						onClick={() => onNavigate?.("payments")}
					>
						<div className="flex items-center justify-between mb-3">
							<div className="p-2.5 rounded-xl bg-zinc-200">
								<DollarSign className="w-6 h-6 text-zinc-900" />
							</div>
							<span className="text-xs font-medium text-zinc-700 bg-zinc-200 px-2 py-1 rounded-full">
								Revenue
							</span>
						</div>
						<p className="text-3xl font-bold text-zinc-900 mb-1">
							{paymentsLoading
								? "..."
								: formatCurrency(financialStats.totalRevenue)}
						</p>
						<p className="text-sm text-zinc-600">
							{financialStats.totalPayments} successful payments
						</p>
					</motion.div>

					{/* Customers Card */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.1 }}
						className="p-5 rounded-xl border-2 border-zinc-200 bg-zinc-50 cursor-pointer hover:shadow-lg transition-all"
						onClick={() => onNavigate?.("customers")}
					>
						<div className="flex items-center justify-between mb-3">
							<div className="p-2.5 rounded-xl bg-zinc-200">
								<Building2 className="w-6 h-6 text-zinc-900" />
							</div>
							<span className="text-xs font-medium text-zinc-700 bg-zinc-200 px-2 py-1 rounded-full">
								Active
							</span>
						</div>
						<p className="text-3xl font-bold text-zinc-900 mb-1">
							{customersLoading ? "..." : audienceStats.customers}
						</p>
						<p className="text-sm text-zinc-600">Active customers</p>
					</motion.div>

					{/* Content Card */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2 }}
						className="p-5 rounded-xl border-2 border-zinc-200 bg-zinc-50 cursor-pointer hover:shadow-lg transition-all"
						onClick={() => onNavigate?.("blogs")}
					>
						<div className="flex items-center justify-between mb-3">
							<div className="p-2.5 rounded-xl bg-zinc-200">
								<FileText className="w-6 h-6 text-zinc-900" />
							</div>
							<span className="text-xs font-medium text-zinc-700 bg-zinc-200 px-2 py-1 rounded-full">
								Published
							</span>
				</div>
						<p className="text-3xl font-bold text-zinc-900 mb-1">
							{blogsLoading ? "..." : contentStats.blogs.published}
						</p>
						<p className="text-sm text-zinc-600">
							{contentStats.blogs.total} total blog posts
						</p>
					</motion.div>

					{/* Audience Card */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3 }}
						className="p-5 rounded-xl border-2 border-zinc-200 bg-zinc-50 cursor-pointer hover:shadow-lg transition-all"
						onClick={() => onNavigate?.("subscribers")}
					>
						<div className="flex items-center justify-between mb-3">
							<div className="p-2.5 rounded-xl bg-zinc-200">
								<Users className="w-6 h-6 text-zinc-900" />
							</div>
							<span className="text-xs font-medium text-zinc-700 bg-zinc-200 px-2 py-1 rounded-full">
								Subscribers
							</span>
						</div>
						<p className="text-3xl font-bold text-zinc-900 mb-1">
							{subscribersLoading ? "..." : audienceStats.subscribers}
						</p>
						<p className="text-sm text-zinc-600">Email subscribers</p>
					</motion.div>
				</div>
			</div>

			{/* Quick Actions */}
			<div>
				<div className="flex items-center justify-between mb-3">
					<h2 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
						<Zap className="w-5 h-5 text-zinc-600" />
						Quick Actions
					</h2>
				</div>
				<div className="w-full md:w-64">
					<AnimatedDropdown
						isOpen={isQuickActionsDropdownOpen}
						onToggle={() =>
							setIsQuickActionsDropdownOpen(!isQuickActionsDropdownOpen)
						}
						onSelect={handleQuickActionSelect}
						options={quickActionsOptions}
						value=""
						placeholder="Select an action..."
						buttonClassName="text-sm"
					/>
				</div>
				</div>

			{/* Charts and Activity */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Content Creation Chart */}
				<div className="lg:col-span-2 p-5 rounded-xl border border-zinc-200 bg-white">
					<div className="flex items-center justify-between mb-4">
						<h3 className="text-base font-semibold text-zinc-900 flex items-center gap-2">
							<Activity className="w-4 h-4 text-zinc-600" />
							Content Activity (Last 7 Days)
					</h3>
					</div>
					{blogsLoading || emailsLoading ? (
						<div className="h-64 flex items-center justify-center text-zinc-500">
							Loading...
						</div>
					) : (
						<ResponsiveContainer width="100%" height={250}>
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
									strokeWidth={3}
									name="Blogs"
									dot={{ fill: "#3b82f6", r: 5 }}
								/>
								<Line
									type="monotone"
									dataKey="emails"
									stroke="#a855f7"
									strokeWidth={3}
									name="Emails"
									dot={{ fill: "#a855f7", r: 5 }}
								/>
							</LineChart>
						</ResponsiveContainer>
					)}
				</div>

				{/* Financial Summary */}
				<div className="p-5 rounded-xl border border-zinc-200 bg-white">
					<h3 className="text-base font-semibold text-zinc-900 mb-4 flex items-center gap-2">
						<CreditCard className="w-4 h-4 text-zinc-600" />
						Financial Summary
					</h3>
					<div className="space-y-4">
						<div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
							<p className="text-xs text-zinc-600 mb-1">Paid Invoices</p>
							<p className="text-xl font-bold text-zinc-900">
								{invoicesLoading ? "..." : financialStats.paidInvoices}
							</p>
							<p className="text-xs text-zinc-600 mt-1">
								{new Intl.NumberFormat("en-US", {
									style: "currency",
									currency: "USD",
								}).format(financialStats.invoiceRevenue)}
							</p>
						</div>
						<div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
							<p className="text-xs text-zinc-600 mb-1">Unpaid Invoices</p>
							<p className="text-xl font-bold text-zinc-900">
								{invoicesLoading ? "..." : financialStats.unpaidInvoices}
							</p>
							<p className="text-xs text-zinc-600 mt-1">
								{new Intl.NumberFormat("en-US", {
									style: "currency",
									currency: "USD",
								}).format(financialStats.unpaidAmount)}
							</p>
						</div>
						<button
							onClick={() => onNavigate?.("invoices")}
							className="w-full mt-4 px-4 py-2 text-sm font-medium bg-zinc-900 text-white rounded-xl hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2"
						>
							<Receipt className="w-4 h-4" />
							View All Invoices
						</button>
					</div>
				</div>
			</div>

			{/* Recent Activity */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Unread Messages */}
				<div className="p-5 rounded-xl border border-zinc-200 bg-white">
					<div className="flex items-center justify-between mb-4">
						<h3 className="text-base font-semibold text-zinc-900 flex items-center gap-2">
							<MessageSquare className="w-4 h-4 text-zinc-600" />
							Unread Messages
							{communicationStats.unreadMessages > 0 && (
								<span className="ml-2 px-2 py-0.5 bg-zinc-200 text-zinc-800 text-xs font-medium rounded-full">
									{communicationStats.unreadMessages}
								</span>
							)}
						</h3>
						{communicationStats.unreadMessages > 0 && (
							<button
								onClick={() => onNavigate?.("messages")}
								className="text-xs text-zinc-600 hover:text-zinc-900 flex items-center gap-1"
							>
								View All
								<ArrowRight className="w-3 h-3" />
							</button>
						)}
					</div>
					{messagesLoading ? (
						<div className="text-center py-8 text-zinc-500 text-sm">
							Loading...
						</div>
					) : recentMessages.length === 0 ? (
						<div className="text-center py-8 text-zinc-500 text-sm">
							<div className="p-3 rounded-xl bg-zinc-50">
								<CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
								<p>All caught up!</p>
								<p className="text-xs mt-1">No unread messages</p>
							</div>
						</div>
					) : (
						<div className="space-y-2">
							{recentMessages.map((message) => (
								<div
									key={message.id}
									className="p-3 rounded-xl border border-zinc-200 hover:bg-zinc-50 transition-colors cursor-pointer group"
									onClick={() => onNavigate?.("messages")}
								>
									<div className="flex items-start justify-between">
										<div className="flex-1">
											<p className="text-sm font-medium text-zinc-900 group-hover:text-zinc-600">
												{message.name || "Anonymous"}
											</p>
											<p className="text-xs text-zinc-600 mt-1 line-clamp-1">
												{message.subject || message.message}
											</p>
											<p className="text-xs text-zinc-500 mt-1">
												{formatDate(message.createdAt)}
											</p>
										</div>
										<div className="w-2 h-2 bg-zinc-900 rounded-full mt-1.5"></div>
									</div>
								</div>
							))}
						</div>
					)}
				</div>

				{/* Pending Issues */}
				<div className="p-5 rounded-xl border border-zinc-200 bg-white">
					<div className="flex items-center justify-between mb-4">
						<h3 className="text-base font-semibold text-zinc-900 flex items-center gap-2">
							<AlertCircle className="w-4 h-4 text-zinc-600" />
							Pending Issues
							{supportStats.pendingIssues > 0 && (
								<span className="ml-2 px-2 py-0.5 bg-zinc-200 text-zinc-800 text-xs font-medium rounded-full">
									{supportStats.pendingIssues}
								</span>
							)}
						</h3>
						{supportStats.pendingIssues > 0 && (
							<button
								onClick={() => onNavigate?.("reportIssues")}
								className="text-xs text-zinc-600 hover:text-zinc-900 flex items-center gap-1"
							>
								View All
								<ArrowRight className="w-3 h-3" />
							</button>
						)}
					</div>
					{issuesLoading ? (
						<div className="text-center py-8 text-zinc-500 text-sm">
							Loading...
						</div>
					) : recentIssues.length === 0 ? (
						<div className="text-center py-8 text-zinc-500 text-sm">
							<div className="p-3 rounded-xl bg-zinc-50">
								<CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
								<p>All clear!</p>
								<p className="text-xs mt-1">No pending issues</p>
							</div>
						</div>
					) : (
						<div className="space-y-2">
							{recentIssues.map((issue) => (
								<div
									key={issue.id}
									className="p-3 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 transition-colors cursor-pointer group"
									onClick={() => onNavigate?.("reportIssues")}
								>
									<div className="flex items-start justify-between">
										<div className="flex-1">
											<p className="text-sm font-medium text-zinc-900">
												{issue.name || "Anonymous"}
											</p>
											<p className="text-xs text-zinc-600 mt-1 line-clamp-2">
												{issue.issue}
											</p>
											<p className="text-xs text-zinc-500 mt-1">
												{formatDate(issue.createdAt)}
											</p>
										</div>
										<Clock className="w-4 h-4 text-zinc-600 mt-0.5" />
									</div>
								</div>
							))}
						</div>
					)}
				</div>

				{/* Recent Invoices */}
				<div className="p-5 rounded-xl border border-zinc-200 bg-white">
					<div className="flex items-center justify-between mb-4">
						<h3 className="text-base font-semibold text-zinc-900 flex items-center gap-2">
							<Receipt className="w-4 h-4 text-zinc-600" />
							Recent Invoices
						</h3>
						<button
							onClick={() => onNavigate?.("invoices")}
							className="text-xs text-zinc-600 hover:text-zinc-900 flex items-center gap-1"
						>
							View All
							<ArrowRight className="w-3 h-3" />
						</button>
					</div>
					{invoicesLoading ? (
						<div className="text-center py-8 text-zinc-500 text-sm">
							Loading...
						</div>
					) : recentInvoices.length === 0 ? (
						<div className="text-center py-8 text-zinc-500 text-sm">
							<div className="p-3 rounded-xl bg-zinc-50">
								<Receipt className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
								<p>No invoices yet</p>
								<button
									onClick={() => onNavigate?.("invoices")}
									className="mt-2 text-xs text-blue-600 hover:text-blue-700"
								>
									Create your first invoice
								</button>
							</div>
						</div>
					) : (
						<div className="space-y-2">
							{recentInvoices.map((invoice) => (
								<div
									key={invoice.id}
									className="p-3 rounded-xl border border-zinc-200 hover:bg-zinc-50 transition-colors cursor-pointer group"
									onClick={() => onNavigate?.("invoices")}
								>
									<div className="flex items-center justify-between">
										<div className="flex-1">
											<div className="flex items-center gap-2">
												<p className="text-sm font-medium text-zinc-900 group-hover:text-zinc-600">
													{invoice.invoiceNumber || invoice.id}
												</p>
												{invoice.status === "paid" ? (
													<span className="px-2 py-0.5 bg-zinc-200 text-zinc-800 text-xs font-medium rounded-full">
														Paid
													</span>
												) : (
													<span className="px-2 py-0.5 bg-zinc-200 text-zinc-800 text-xs font-medium rounded-full">
														Unpaid
													</span>
												)}
											</div>
											<p className="text-xs text-zinc-600 mt-1">
												{invoice.to?.name || invoice.to?.email || ""}
											</p>
											<p className="text-xs text-zinc-500 mt-1">
												{formatDate(invoice.createdAt || invoice.invoiceDate)}
											</p>
										</div>
										<div className="text-right">
											<p className="text-sm font-semibold text-zinc-900">
												${invoice.total?.toFixed(2) || "0.00"}
											</p>
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>

			{/* All Metrics Overview */}
			<div className="p-5 rounded-xl border border-zinc-200 bg-white">
				<h3 className="text-base font-semibold text-zinc-900 mb-4 flex items-center gap-2">
					<Eye className="w-4 h-4 text-zinc-500" />
					Complete Overview
				</h3>
				<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
					{[
						{
							label: "Blogs",
							value: contentStats.blogs.total,
							icon: FileText,
							action: () => onNavigate?.("blogs"),
							color: "text-zinc-600",
						},
						{
							label: "Emails",
							value: contentStats.emails.total,
							icon: Mail,
							action: () => onNavigate?.("emails"),
							color: "text-zinc-600",
						},
						{
							label: "Users",
							value: audienceStats.users,
							icon: Users,
							action: () => onNavigate?.("users"),
							color: "text-zinc-600",
						},
						{
							label: "Waitlist",
							value: audienceStats.waitlist,
							icon: UsersRound,
							action: () => onNavigate?.("waitlist"),
							color: "text-zinc-600",
						},
						{
							label: "Messages",
							value: communicationStats.totalMessages,
							icon: MessageSquare,
							action: () => onNavigate?.("messages"),
							color: "text-zinc-600",
						},
						{
							label: "Issues",
							value: supportStats.totalIssues,
							icon: AlertCircle,
							action: () => onNavigate?.("reportIssues"),
							color: "text-zinc-600",
						},
					].map((metric, index) => {
						const Icon = metric.icon;
						return (
							<motion.button
								key={index}
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								onClick={metric.action}
								className="p-3 rounded-xl border border-zinc-200 hover:bg-zinc-50 transition-colors text-left"
							>
								<div className="flex items-center gap-2 mb-2">
									<Icon className={`w-4 h-4 ${metric.color}`} />
									<p className="text-xs text-zinc-600">{metric.label}</p>
								</div>
								<p className="text-xl font-bold text-zinc-900">
									{metric.value}
								</p>
							</motion.button>
						);
					})}
				</div>
			</div>
		</div>
	);
};

export default HomeTab;