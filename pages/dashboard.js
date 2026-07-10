import React, { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import {
	Plus,
	Rocket,
	ThumbsUp,
	UserRound,
	Flame,
	Hash,
	Medal,
	LayoutDashboard,
	ExternalLink,
} from "lucide-react";
import Navbar from "../app/frontend/Navbar";
import Footer from "../app/frontend/Footer";
import LoginModal from "../lib/ui/LoginModal";
import { getUserCookie } from "../lib/utils/cookies";
import { getToolSubmissionsByEmail } from "../lib/api/toolSubmissions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatDisplayDateShort } from "@/lib/utils/formatDate";

const PROJECT_TABS = [
	{ id: "active", label: "Active" },
	{ id: "upcoming", label: "Upcoming" },
	{ id: "not_paid", label: "Not paid" },
	{ id: "past", label: "Past" },
];

const classifySubmission = (submission) => {
	const status = (submission.status || "").toLowerCase();
	const launch = submission.launchDate
		? new Date(`${submission.launchDate}T00:00:00`)
		: null;
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	if (status === "rejected" || status === "archived") return "past";
	if (status === "published" || status === "approved") {
		if (launch && launch < today) return "past";
		return "active";
	}
	if (submission.slotIsPaid && Number(submission.slotPrice) > 0 && status === "pending") {
		// Treat unpaid pending paid slots as not_paid when no payment marker exists
		if (!submission.directoryToolId) return "not_paid";
	}
	if (launch && launch > today) return "upcoming";
	if (status === "pending") return "upcoming";
	return "past";
};

const EmptyState = ({ icon: Icon, title, description, action }) => (
	<div className="flex flex-col items-center justify-center py-12 px-4 text-center">
		<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
			<Icon className="h-5 w-5 text-muted-foreground" />
		</div>
		<p className="font-medium text-foreground mb-1">{title}</p>
		<p className="text-sm text-muted-foreground mb-5 max-w-sm">{description}</p>
		{action}
	</div>
);

const DashboardPage = () => {
	const router = useRouter();
	const [mounted, setMounted] = useState(false);
	const [user, setUser] = useState(null);
	const [showLogin, setShowLogin] = useState(false);
	const [projectTab, setProjectTab] = useState("active");

	useEffect(() => {
		setMounted(true);
		const cookieUser = getUserCookie();
		setUser(cookieUser);
		if (!cookieUser) setShowLogin(true);
	}, []);

	const { data: submissions = [], isLoading } = useQuery({
		queryKey: ["my-submissions", user?.email],
		queryFn: () => getToolSubmissionsByEmail(user.email),
		enabled: Boolean(user?.email),
		staleTime: 60 * 1000,
	});

	const grouped = useMemo(() => {
		const buckets = {
			active: [],
			upcoming: [],
			not_paid: [],
			past: [],
		};
		submissions.forEach((s) => {
			buckets[classifySubmission(s)].push(s);
		});
		return buckets;
	}, [submissions]);

	const counts = {
		active: grouped.active.length,
		upcoming: grouped.upcoming.length,
		not_paid: grouped.not_paid.length,
		past: grouped.past.length,
	};

	const visibleProjects = grouped[projectTab] || [];

	if (!mounted) {
		return (
			<div className="min-h-screen flex flex-col">
				<Navbar />
				<div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
					Loading...
				</div>
				<Footer />
			</div>
		);
	}

	return (
		<>
			<Head>
				<title>Dashboard — ToolDir</title>
				<meta
					name="description"
					content="Manage your ToolDir submissions, profile, and launch activity."
				/>
			</Head>

			<div className="min-h-screen flex flex-col">
				<Navbar />

				<section className="flex-1 py-10 px-4 sm:px-6 lg:px-8">
					<div className="max-w-7xl mx-auto space-y-8">
						<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
							<div>
								<h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
								<p className="text-muted-foreground mt-1">
									Welcome, {user?.displayName || "Guest"}
								</p>
							</div>
							<div className="flex flex-wrap gap-2">
								<Button asChild variant="outline">
									<Link href="/pricing">Explore Launches</Link>
								</Button>
								<Button asChild>
									<Link href="/submit">
										<Plus className="w-4 h-4" />
										Submit a Project
									</Link>
								</Button>
							</div>
						</div>

						{!user ? (
							<Card>
								<CardContent className="py-16">
									<EmptyState
										icon={LayoutDashboard}
										title="Sign in to view your dashboard"
										description="Log in to manage submissions, track launches, and update your profile."
										action={
											<Button onClick={() => setShowLogin(true)}>
												Get Started
											</Button>
										}
									/>
								</CardContent>
							</Card>
						) : (
							<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
								{/* Left column */}
								<div className="lg:col-span-2 space-y-6">
									<Card>
										<CardHeader className="pb-3">
											<CardTitle className="text-lg">My Projects</CardTitle>
											<CardDescription>
												Manage your submitted AI tools
											</CardDescription>
										</CardHeader>
										<CardContent className="space-y-4">
											<div className="flex flex-wrap gap-1 border-b pb-1">
												{PROJECT_TABS.map((tab) => (
													<button
														key={tab.id}
														type="button"
														onClick={() => setProjectTab(tab.id)}
														className={cn(
															"px-3 py-2 text-sm font-medium rounded-md transition-colors",
															projectTab === tab.id
																? "bg-muted text-foreground"
																: "text-muted-foreground hover:text-foreground hover:bg-muted/60"
														)}
													>
														{tab.label} ({counts[tab.id]})
													</button>
												))}
											</div>

											{isLoading ? (
												<p className="py-10 text-center text-sm text-muted-foreground">
													Loading projects...
												</p>
											) : visibleProjects.length === 0 ? (
												<EmptyState
													icon={Rocket}
													title={
														projectTab === "active"
															? "No active launches"
															: projectTab === "upcoming"
																? "No upcoming launches"
																: projectTab === "not_paid"
																	? "No unpaid projects"
																	: "No past launches"
													}
													description="Submit your AI tool to get listed, book a launch slot, and track status here."
													action={
														<Button asChild>
															<Link href="/submit">
																<Plus className="w-4 h-4" />
																Submit a Project
															</Link>
														</Button>
													}
												/>
											) : (
												<ul className="divide-y rounded-lg border">
													{visibleProjects.map((project) => (
														<li
															key={project.id}
															className="flex items-start justify-between gap-3 p-4"
														>
															<div className="min-w-0">
																<p className="font-medium truncate">
																	{project.name}
																</p>
																<p className="text-sm text-muted-foreground truncate">
																	{project.website}
																</p>
																<div className="mt-2 flex flex-wrap gap-2">
																	<Badge variant="secondary">
																		{project.status || "pending"}
																	</Badge>
																	{project.slotLabel && (
																		<Badge variant="outline">
																			{project.slotLabel}
																		</Badge>
																	)}
																	{project.launchDate && (
																		<span className="text-xs text-muted-foreground">
																			{formatDisplayDateShort(project.launchDate)}
																		</span>
																	)}
																</div>
															</div>
															{project.website && (
																<Button asChild variant="ghost" size="icon">
																	<a
																		href={project.website}
																		target="_blank"
																		rel="noopener noreferrer"
																	>
																		<ExternalLink className="w-4 h-4" />
																	</a>
																</Button>
															)}
														</li>
													))}
												</ul>
											)}
										</CardContent>
									</Card>

									<Card>
										<CardHeader className="pb-3">
											<CardTitle className="text-lg">Recent Upvotes</CardTitle>
											<CardDescription>
												Tools you&apos;ve recently upvoted
											</CardDescription>
										</CardHeader>
										<CardContent>
											<EmptyState
												icon={ThumbsUp}
												title="No upvotes yet"
												description="Explore the directory and upvote tools you love. They'll show up here."
												action={
													<Button asChild variant="outline">
														<Link href="/#trending">Explore Projects</Link>
													</Button>
												}
											/>
										</CardContent>
									</Card>
								</div>

								{/* Right column */}
								<div className="space-y-6">
									<Card>
										<CardHeader className="pb-3">
											<CardTitle className="text-lg">Profile</CardTitle>
											<CardDescription>Your account information</CardDescription>
										</CardHeader>
										<CardContent className="space-y-4">
											<div className="flex items-center gap-3">
												{user.photoURL ? (
													<img
														src={user.photoURL}
														alt=""
														className="h-12 w-12 rounded-full object-cover border"
													/>
												) : (
													<div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
														{(user.displayName || "U")[0]}
													</div>
												)}
												<div className="min-w-0">
													<p className="font-medium truncate">
														{user.displayName}
													</p>
													<p className="text-sm text-muted-foreground truncate">
														{user.email}
													</p>
												</div>
											</div>
											<Button variant="outline" className="w-full" disabled>
												<UserRound className="w-4 h-4" />
												Edit Profile
											</Button>
										</CardContent>
									</Card>

									<Card>
										<CardHeader className="pb-3">
											<CardTitle className="text-lg">Quick Actions</CardTitle>
											<CardDescription>
												Common tasks you can perform
											</CardDescription>
										</CardHeader>
										<CardContent className="space-y-2">
											<Button asChild variant="outline" className="w-full justify-start">
												<Link href="/submit">
													<Plus className="w-4 h-4" />
													Submit a Project
												</Link>
											</Button>
											<Button asChild variant="outline" className="w-full justify-start">
												<Link href="/pricing">
													<Rocket className="w-4 h-4" />
													Explore Launches
												</Link>
											</Button>
											<Button asChild variant="outline" className="w-full justify-start">
												<Link href="/pricing">
													<Medal className="w-4 h-4" />
													Winners
												</Link>
											</Button>
											<Button asChild variant="outline" className="w-full justify-start">
												<Link href="/?sort=trending">
													<Flame className="w-4 h-4" />
													Trending Projects
												</Link>
											</Button>
											<Button asChild variant="outline" className="w-full justify-start">
												<Link href="/categories/ai-writing">
													<Hash className="w-4 h-4" />
													Explore categories
												</Link>
											</Button>
										</CardContent>
									</Card>
								</div>
							</div>
						)}
					</div>
				</section>

				<Footer />
			</div>

			<LoginModal
				isOpen={showLogin}
				onClose={() => {
					setShowLogin(false);
					const cookieUser = getUserCookie();
					setUser(cookieUser);
					if (!cookieUser) router.push("/");
				}}
			/>
		</>
	);
};

export default DashboardPage;
