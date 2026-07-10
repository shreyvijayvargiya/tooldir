import React from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
	ExternalLink,
	Star,
	ThumbsUp,
	Globe,
	Calendar,
	ArrowLeft,
	ChevronRight,
	Sparkles,
	Link2,
	DollarSign,
	FolderOpen,
	TrendingUp,
	Share2,
} from "lucide-react";
import Navbar from "../../app/frontend/Navbar";
import Footer from "../../app/frontend/Footer";
import ToolsDirectoryTable from "../../app/frontend/marketing/ToolsDirectoryTable";
import SubmitToolCard from "../../app/frontend/marketing/SubmitToolCard";
import { getToolBySlug } from "@/lib/api/directoryTools";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { formatDisplayDate, formatDisplayDateShort } from "@/lib/utils/formatDate";
import { toast } from "@/lib/toast";

const formatCount = (n) => {
	if (!n) return "0";
	if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
	if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
	return n.toString();
};

const pricingVariant = (pricing) => {
	switch (pricing?.toLowerCase()) {
		case "free":
		case "open source":
			return "secondary";
		case "paid":
			return "default";
		default:
			return "outline";
	}
};

const StatCard = ({ icon: Icon, label, value, accent }) => (
	<Card className="overflow-hidden group hover:shadow-md transition-shadow">
		<CardContent className="p-4 flex items-center gap-3">
			<div
				className={cn(
					"rounded-xl p-2.5 shrink-0",
					accent || "bg-primary/10 text-primary"
				)}
			>
				<Icon className="w-4 h-4" />
			</div>
			<div className="min-w-0">
				<p className="text-xl font-bold text-foreground leading-tight">{value}</p>
				<p className="text-xs text-muted-foreground">{label}</p>
			</div>
		</CardContent>
	</Card>
);

const DetailRow = ({ icon: Icon, label, children }) => (
	<div className="flex items-start gap-3 p-3 rounded-xl bg-muted/50 border border-transparent hover:border-border transition-colors">
		<div className="rounded-lg bg-background p-2 border shrink-0">
			<Icon className="w-4 h-4 text-muted-foreground" />
		</div>
		<div className="min-w-0 flex-1">
			<p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5">
				{label}
			</p>
			<div className="text-sm font-medium text-foreground">{children}</div>
		</div>
	</div>
);

const ToolDetailSkeleton = () => (
	<div className="max-w-7xl mx-auto animate-pulse space-y-8">
		<div className="h-4 w-48 bg-muted rounded" />
		<div className="h-64 bg-muted rounded-2xl" />
		<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
			{[1, 2, 3, 4].map((i) => (
				<div key={i} className="h-20 bg-muted rounded-xl" />
			))}
		</div>
	</div>
);

const ToolDetailPage = () => {
	const { slug } = useRouter().query;

	const { data: tool, isLoading } = useQuery({
		queryKey: ["directoryTool", slug],
		queryFn: () => getToolBySlug(slug),
		enabled: !!slug,
	});

	const handleShare = async () => {
		const url = typeof window !== "undefined" ? window.location.href : "";
		try {
			if (navigator.share) {
				await navigator.share({ title: tool?.name, url });
			} else {
				await navigator.clipboard.writeText(url);
				toast.success("Link copied to clipboard!");
			}
		} catch {
			// user cancelled share
		}
	};

	if (isLoading) {
		return (
			<div className="min-h-screen flex flex-col">
				<Navbar />
				<section className="py-10 px-4 sm:px-6 lg:px-8">
					<ToolDetailSkeleton />
				</section>
				<Footer />
			</div>
		);
	}

	if (!tool) {
		return (
			<div className="min-h-screen flex flex-col">
				<Navbar />
				<div className="flex-1 flex items-center justify-center px-4">
					<Card className="max-w-md w-full text-center">
						<CardContent className="pt-10 pb-8">
							<div className="w-14 h-14 rounded-2xl bg-muted mx-auto mb-4 flex items-center justify-center">
								<FolderOpen className="w-7 h-7 text-muted-foreground" />
							</div>
							<h1 className="text-xl font-bold mb-2">Tool not found</h1>
							<p className="text-sm text-muted-foreground mb-6">
								This listing may have been removed or the URL is incorrect.
							</p>
							<Button asChild>
								<Link href="/">
									<ArrowLeft className="w-4 h-4" />
									Back to Directory
								</Link>
							</Button>
						</CardContent>
					</Card>
				</div>
				<Footer />
			</div>
		);
	}

	const isTrending = tool.upvotes >= 2000;
	const hostname = (() => {
		try {
			return new URL(tool.website).hostname.replace(/^www\./, "");
		} catch {
			return tool.website;
		}
	})();

	return (
		<>
			<Head>
				<title>{tool.name} — ToolDir</title>
				<meta name="description" content={tool.description} />
			</Head>

			<div className="min-h-screen flex flex-col bg-background">
				<Navbar />

				{/* Hero band */}
				<div className="relative border-b overflow-hidden">
					<div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-primary/3 to-transparent pointer-events-none" />
					<div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

					<section className="relative py-8 px-4 sm:px-6 lg:px-8">
						<div className="max-w-7xl mx-auto">
							{/* Breadcrumb */}
							<nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6 flex-wrap">
								<Link href="/" className="hover:text-foreground transition-colors">
									Directory
								</Link>
								<ChevronRight className="w-3.5 h-3.5 shrink-0" />
								<Link
									href={`/?category=${encodeURIComponent(tool.category)}`}
									className="hover:text-foreground transition-colors"
								>
									{tool.category}
								</Link>
								<ChevronRight className="w-3.5 h-3.5 shrink-0" />
								<span className="text-foreground font-medium truncate">
									{tool.name}
								</span>
							</nav>

							<motion.div
								initial={false}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.4 }}
								className="flex flex-col lg:flex-row gap-8 items-start"
							>
								{/* Logo + title block */}
								<div className="flex gap-5 flex-1 min-w-0">
									<div className="relative shrink-0">
										{tool.logo ? (
											<img
												src={tool.logo}
												alt={tool.name}
												className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-2 border-background shadow-lg object-contain bg-card"
											/>
										) : (
											<div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-background shadow-lg flex items-center justify-center text-3xl font-bold text-primary">
												{tool.name[0]}
											</div>
										)}
										{isTrending && (
											<span className="absolute -top-2 -right-2 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow">
												<TrendingUp className="w-2.5 h-2.5" />
												Hot
											</span>
										)}
									</div>

									<div className="min-w-0 pt-1">
										<div className="flex flex-wrap items-center gap-2 mb-2">
											<Badge variant="secondary" className="gap-1 text-xs">
												<Sparkles className="w-3 h-3" />
												{tool.category}
											</Badge>
											<Badge variant={pricingVariant(tool.pricing)} className="text-xs">
												{tool.pricing}
											</Badge>
											{tool.featured && (
												<Badge className="text-xs">Featured</Badge>
											)}
										</div>
										<h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-2">
											{tool.name}
										</h1>
										<p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-2xl">
											{tool.description}
										</p>
										<div className="flex flex-wrap gap-1.5 mt-4">
											{tool.tags.map((tag) => (
												<Badge key={tag} variant="outline" className="text-xs font-normal">
													{tag}
												</Badge>
											))}
										</div>
									</div>
								</div>

								{/* Desktop actions */}
								<div className="flex flex-row lg:flex-col gap-2 w-full lg:w-auto shrink-0">
									<Button asChild size="lg" className="flex-1 lg:flex-none lg:min-w-[200px]">
										<a
											href={tool.website}
											target="_blank"
											rel="noopener noreferrer"
										>
											Visit Website
											<ExternalLink className="w-4 h-4" />
										</a>
									</Button>
									<Button
										variant="outline"
										size="lg"
										className="flex-1 lg:flex-none"
										onClick={handleShare}
									>
										<Share2 className="w-4 h-4" />
										Share
									</Button>
									<Button asChild variant="ghost" size="sm" className="hidden lg:flex">
										<Link href="/submit">Submit a similar tool</Link>
									</Button>
								</div>
							</motion.div>
						</div>
					</section>
				</div>

				{/* Main content */}
				<section className="py-10 px-4 sm:px-6 lg:px-8 flex-1">
					<div className="max-w-7xl mx-auto">
						<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
							{/* Left column */}
							<div className="lg:col-span-2 space-y-8">
								{/* Stats */}
								<motion.div
									initial={false}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.1 }}
									className="grid grid-cols-2 sm:grid-cols-4 gap-3"
								>
									<StatCard
										icon={ThumbsUp}
										label="Community upvotes"
										value={formatCount(tool.upvotes)}
									/>
									<StatCard
										icon={Star}
										label="GitHub stars"
										value={tool.stars > 0 ? formatCount(tool.stars) : "—"}
										accent="bg-amber-500/10 text-amber-600"
									/>
									<StatCard
										icon={Globe}
										label="Country"
										value={tool.country}
										accent="bg-blue-500/10 text-blue-600"
									/>
									<StatCard
										icon={Calendar}
										label="Listed on"
										value={formatDisplayDateShort(tool.date)}
										accent="bg-violet-500/10 text-violet-600"
									/>
								</motion.div>

								{/* Screenshot / preview */}
								<motion.div
									initial={false}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.15 }}
								>
									<Card className="overflow-hidden">
										<div className="flex items-center gap-2 px-4 py-2.5 border-b bg-muted/40">
											<div className="flex gap-1.5">
												<span className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
												<span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
												<span className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
											</div>
											<div className="flex-1 mx-2">
												<div className="bg-background border rounded-md px-3 py-1 text-xs text-muted-foreground truncate text-center">
													{hostname}
												</div>
											</div>
										</div>
										<div className="relative aspect-video bg-gradient-to-br from-muted via-muted/50 to-primary/5 flex items-center justify-center">
											{tool.screenshot ? (
												<img
													src={tool.screenshot}
													alt={`${tool.name} screenshot`}
													className="w-full h-full object-cover"
												/>
											) : (
												<div className="text-center p-8">
													<div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
														{tool.logo ? (
															<img
																src={tool.logo}
																alt=""
																className="w-10 h-10 object-contain"
															/>
														) : (
															<span className="text-2xl font-bold text-primary">
																{tool.name[0]}
															</span>
														)}
													</div>
													<p className="text-sm font-medium text-foreground mb-1">
														{tool.name}
													</p>
													<p className="text-xs text-muted-foreground max-w-xs mx-auto">
														{tool.description}
													</p>
													<Button asChild size="sm" className="mt-4">
														<a
															href={tool.website}
															target="_blank"
															rel="noopener noreferrer"
														>
															Open live site
															<ExternalLink className="w-3.5 h-3.5" />
														</a>
													</Button>
												</div>
											)}
										</div>
									</Card>
								</motion.div>

								{/* About */}
								<motion.div
									initial={false}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.2 }}
								>
									<Card>
										<CardHeader>
											<CardTitle className="text-lg">About {tool.name}</CardTitle>
										</CardHeader>
										<CardContent className="space-y-4">
											<p className="text-muted-foreground leading-relaxed">
												{tool.description}
											</p>
											<p className="text-muted-foreground leading-relaxed text-sm">
												{tool.name} is listed in the{" "}
												<span className="font-medium text-foreground">
													{tool.category}
												</span>{" "}
												category on ToolDir — the curated directory for AI tools.
												{tool.stars > 0 && (
													<>
														{" "}
														It has garnered{" "}
														<span className="font-medium text-foreground">
															{formatCount(tool.stars)} GitHub stars
														</span>{" "}
														from the open-source community.
													</>
												)}
											</p>
										</CardContent>
									</Card>
								</motion.div>
							</div>

							{/* Right sidebar */}
							<div className="space-y-4">
								<motion.div
									initial={false}
									animate={{ opacity: 1, x: 0 }}
									transition={{ delay: 0.15 }}
									className="lg:sticky lg:top-20 space-y-4"
								>
									<Card>
										<CardHeader className="pb-3">
											<CardTitle className="text-base">Tool details</CardTitle>
										</CardHeader>
										<CardContent className="space-y-2">
											<DetailRow icon={Link2} label="Website">
												<a
													href={tool.website}
													target="_blank"
													rel="noopener noreferrer"
													className="text-primary hover:underline truncate block"
												>
													{hostname}
												</a>
											</DetailRow>
											<DetailRow icon={DollarSign} label="Pricing">
												{tool.pricing}
											</DetailRow>
											<DetailRow icon={FolderOpen} label="Category">
												{tool.category}
											</DetailRow>
											<DetailRow icon={Calendar} label="Listed">
												{formatDisplayDate(tool.date)}
											</DetailRow>
											<DetailRow icon={Globe} label="Region">
												{tool.country}
											</DetailRow>
										</CardContent>
									</Card>

									<Card className="bg-primary/5 border-primary/20">
										<CardContent className="p-4">
											<p className="text-sm font-medium text-foreground mb-1">
												Building something similar?
											</p>
											<p className="text-xs text-muted-foreground mb-3">
												List your AI tool and reach 1M+ monthly visitors.
											</p>
											<Button asChild className="w-full" size="sm">
												<Link href="/submit">Submit your tool</Link>
											</Button>
										</CardContent>
									</Card>

									<Button asChild variant="outline" className="w-full" size="sm">
										<Link href="/">
											<ArrowLeft className="w-4 h-4" />
											Back to directory
										</Link>
									</Button>
								</motion.div>
							</div>
						</div>

						<Separator className="my-12" />

						<motion.div
							initial={false}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							className="mb-8"
						>
							<div className="flex items-end justify-between gap-4 mb-6">
								<div>
									<h2 className="text-2xl font-bold text-foreground">
										More AI Tools
									</h2>
									<p className="text-muted-foreground text-sm mt-1">
										Explore other trending tools you might like
									</p>
								</div>
								<Button asChild variant="ghost" size="sm" className="hidden sm:flex">
									<Link href="/">
										View all
										<ChevronRight className="w-4 h-4" />
									</Link>
								</Button>
							</div>
							<ToolsDirectoryTable
								excludeSlug={tool.slug}
								limit={8}
								showSubmitCta={false}
							/>
						</motion.div>

						<SubmitToolCard />
					</div>
				</section>

				<Footer />
			</div>
		</>
	);
};

export default ToolDetailPage;
