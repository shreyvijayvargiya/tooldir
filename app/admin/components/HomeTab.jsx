import React from "react";
import {
	LayoutDashboard,
	Eye,
	Users,
	FileEdit,
	CreditCard,
	Receipt,
	DollarSign,
	FileText,
	Plus,
	ExternalLink,
	ArrowRight,
	Search,
	Shield,
	Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const SECTIONS = [
	{
		id: "analytics",
		title: "Analytics",
		icon: Eye,
		blurb: "Traffic, visitors, and location map for your directory.",
		actions: [
			{ label: "Open analytics", tab: "analytics" },
		],
	},
	{
		id: "users",
		title: "Users",
		icon: Users,
		blurb: "People who signed in or paid for a launch slot.",
		actions: [
			{ label: "View users", tab: "users" },
		],
	},
	{
		id: "submissions",
		title: "Submissions",
		icon: FileEdit,
		blurb: "Review /submit entries, payment status, and list tools on the site.",
		actions: [
			{ label: "Review submissions", tab: "submissions" },
			{ label: "Public submit form", href: "/submit", external: true },
		],
	},
	{
		id: "payments",
		title: "Payments",
		icon: CreditCard,
		blurb: "Stripe launch-slot charges (and $0 test payments) synced via webhook.",
		actions: [
			{ label: "View payments", tab: "payments" },
		],
	},
	{
		id: "invoices",
		title: "Invoices",
		icon: Receipt,
		blurb: "Create and manage manual invoices for clients.",
		actions: [
			{ label: "Open invoices", tab: "invoices" },
		],
	},
	{
		id: "pricing-slots",
		title: "Launch pricing",
		icon: DollarSign,
		blurb: "Set per-date slot prices used by /pricing and Stripe Checkout.",
		actions: [
			{ label: "Edit calendar", tab: "pricing-slots" },
			{ label: "View pricing page", href: "/pricing", external: true },
		],
	},
	{
		id: "blogs",
		title: "Blogs",
		icon: FileText,
		blurb: "TipTap CMS — draft, publish, upload images to Supabase Storage.",
		actions: [
			{ label: "All posts", tab: "blogs" },
			{ label: "New post", href: "/admin/blogs/new" },
			{ label: "Public blog", href: "/blog", external: true },
		],
	},
];

const QUICK_START = [
	{
		step: "1",
		title: "Sign in with Google",
		body: "Use Continue with Google in the sidebar. Auth is Supabase OAuth.",
		icon: Shield,
	},
	{
		step: "2",
		title: "Set launch prices",
		body: "Open Launch Pricing and set paid / free dates for the calendar.",
		icon: Calendar,
	},
	{
		step: "3",
		title: "Review submissions",
		body: "When founders submit tools, approve and List on Website from Submissions.",
		icon: FileEdit,
	},
	{
		step: "4",
		title: "Publish content",
		body: "Write SEO posts in Blogs. Images go to the saas-starter-storage bucket.",
		icon: FileText,
	},
];

const HomeTab = ({ onNavigate }) => {
	const go = (tab) => {
		if (typeof onNavigate === "function") onNavigate(tab);
	};

	return (
		<div className="p-6 space-y-8 max-w-5xl">
			{/* Hero */}
			<div className="space-y-3">
				<div className="flex items-center gap-2 text-muted-foreground text-xs font-medium uppercase tracking-wider">
					<LayoutDashboard className="w-3.5 h-3.5" />
					Admin home
				</div>
				<h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
					ToolDir control panel
				</h1>
				<p className="text-muted-foreground text-sm sm:text-base max-w-2xl leading-relaxed">
					Manage your AI tool directory from one place: review submissions, take
					launch-slot payments, publish the blog, and track traffic. Use the
					sidebar or the cards below to jump into any section.
				</p>
				<div className="flex flex-wrap gap-2 pt-1">
					<Badge variant="secondary">CMD + K search</Badge>
					<Badge variant="secondary">Google Auth</Badge>
					<Badge variant="secondary">Stripe slots</Badge>
					<Badge variant="secondary">Supabase</Badge>
				</div>
			</div>

			{/* Quick start */}
			<section className="space-y-3">
				<h2 className="text-sm font-semibold text-foreground">How this admin works</h2>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
					{QUICK_START.map((item) => {
						const Icon = item.icon;
						return (
							<div
								key={item.step}
								className="flex gap-3 rounded-xl border bg-card p-4"
							>
								<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">
									{item.step}
								</div>
								<div className="min-w-0 space-y-1">
									<div className="flex items-center gap-1.5">
										<Icon className="w-3.5 h-3.5 text-muted-foreground" />
										<p className="text-sm font-medium text-foreground">
											{item.title}
										</p>
									</div>
									<p className="text-xs text-muted-foreground leading-relaxed">
										{item.body}
									</p>
								</div>
							</div>
						);
					})}
				</div>
			</section>

			{/* All actions */}
			<section className="space-y-3">
				<div className="flex items-end justify-between gap-2">
					<h2 className="text-sm font-semibold text-foreground">
						All admin actions
					</h2>
					<p className="text-xs text-muted-foreground hidden sm:block">
						Click a card action to open that tab
					</p>
				</div>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
					{SECTIONS.map((section) => {
						const Icon = section.icon;
						return (
							<Card
								key={section.id}
								className="shadow-none hover:border-primary/40 transition-colors"
							>
								<CardHeader className="pb-2 space-y-2">
									<div className="flex items-center gap-2">
										<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
											<Icon className="w-4 h-4 text-foreground" />
										</div>
										<CardTitle className="text-base">{section.title}</CardTitle>
									</div>
									<CardDescription className="text-xs leading-relaxed">
										{section.blurb}
									</CardDescription>
								</CardHeader>
								<CardContent className="flex flex-wrap gap-2 pt-0">
									{section.actions.map((action) =>
										action.href ? (
											<Button
												key={action.label}
												variant="outline"
												size="sm"
												asChild
											>
												<a
													href={action.href}
													{...(action.external
														? { target: "_blank", rel: "noopener noreferrer" }
														: {})}
												>
													{action.label}
													{action.external ? (
														<ExternalLink className="w-3 h-3" />
													) : (
														<ArrowRight className="w-3 h-3" />
													)}
												</a>
											</Button>
										) : (
											<Button
												key={action.label}
												variant="outline"
												size="sm"
												onClick={() => go(action.tab)}
											>
												{action.label}
												<ArrowRight className="w-3 h-3" />
											</Button>
										)
									)}
								</CardContent>
							</Card>
						);
					})}
				</div>
			</section>

			{/* Shortcuts */}
			<section className="rounded-xl border bg-muted/40 p-4 space-y-3">
				<h2 className="text-sm font-semibold text-foreground">Shortcuts</h2>
				<ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
					<li className="flex items-center gap-2">
						<Search className="w-3.5 h-3.5 shrink-0" />
						<span>
							<strong className="text-foreground font-medium">CMD / Ctrl + K</strong>{" "}
							— search users, payments, blogs, submissions
						</span>
					</li>
					<li className="flex items-center gap-2">
						<Plus className="w-3.5 h-3.5 shrink-0" />
						<span>
							<strong className="text-foreground font-medium">New blog</strong>{" "}
							—{" "}
							<a
								href="/admin/blogs/new"
								className="text-primary hover:underline"
							>
								/admin/blogs/new
							</a>
						</span>
					</li>
					<li className="flex items-center gap-2">
						<ExternalLink className="w-3.5 h-3.5 shrink-0" />
						<span>
							<strong className="text-foreground font-medium">Public site</strong>{" "}
							—{" "}
							<a href="/" className="text-primary hover:underline">
								homepage
							</a>
							{", "}
							<a href="/submit" className="text-primary hover:underline">
								submit
							</a>
							{", "}
							<a href="/pricing" className="text-primary hover:underline">
								pricing
							</a>
						</span>
					</li>
					<li className="flex items-center gap-2">
						<LayoutDashboard className="w-3.5 h-3.5 shrink-0" />
						<span>
							Drag sidebar items to reorder — saved in your browser
						</span>
					</li>
				</ul>
			</section>
		</div>
	);
};

export default HomeTab;
