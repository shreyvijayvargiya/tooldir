import React from "react";
import {
	ArrowRight,
	ExternalLink,
	Sparkles,
	Star,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TOP_DIRECTORY_SUBMISSIONS } from "@/lib/generator/directories";

/**
 * Renders a SiteSpec with known-good UI primitives (no AI JSX).
 */
export default function GeneratedSitePreview({ spec }) {
	if (!spec) return null;

	const listings = spec.seedListings || [];
	const categories = spec.taxonomy?.categories || [];

	return (
		<div className="overflow-hidden rounded-2xl border bg-background shadow-sm">
			{/* Mini hero */}
			<div className="border-b bg-muted/30 px-5 py-8 sm:px-8">
				<Badge variant="secondary" className="mb-3 gap-1">
					<Sparkles className="size-3" />
					{spec.landing.badge}
				</Badge>
				<h3 className="text-2xl font-bold tracking-tight sm:text-3xl">
					{spec.landing.headlineBefore}{" "}
					<span className="text-primary">{spec.landing.headlineAccent}</span>
				</h3>
				<p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
					{spec.landing.subhead}
				</p>
				<div className="mt-4 flex flex-wrap gap-2">
					<Button size="sm">
						{spec.landing.primaryCta}
						<ArrowRight className="size-3.5" />
					</Button>
					<Button size="sm" variant="outline">
						{spec.landing.secondaryCta}
					</Button>
					<Badge variant="outline" className="ml-auto">
						{spec.mode} · {spec.template}
					</Badge>
				</div>
			</div>

			<div className="grid gap-0 lg:grid-cols-[1fr_280px]">
				{/* Listings */}
				<div className="space-y-4 p-5 sm:p-6">
					<div>
						<h4 className="font-semibold">{spec.landing.trendingTitle}</h4>
						<p className="text-xs text-muted-foreground">
							{spec.landing.trendingSubhead}
						</p>
					</div>
					<div className="flex flex-wrap gap-1.5">
						{categories.map((cat) => (
							<Badge key={cat} variant="secondary" className="font-normal">
								{cat}
							</Badge>
						))}
					</div>
					<div className="grid gap-2 sm:grid-cols-2">
						{listings.slice(0, 8).map((item) => (
							<Card key={item.slug} className="border-dashed">
								<CardContent className="space-y-1 p-4">
									<div className="flex items-start justify-between gap-2">
										<p className="font-medium leading-tight">{item.name}</p>
										<span className="inline-flex items-center gap-0.5 text-[11px] text-muted-foreground">
											<Star className="size-3 fill-amber-400 text-amber-400" />
											{item.stars}
										</span>
									</div>
									<p className="line-clamp-2 text-xs text-muted-foreground">
										{item.description}
									</p>
									<p className="text-[11px] text-muted-foreground">
										{item.category} · {item.pricing}
									</p>
								</CardContent>
							</Card>
						))}
					</div>
				</div>

				{/* Side pack */}
				<aside className="space-y-4 border-t bg-muted/20 p-5 lg:border-l lg:border-t-0">
					<div>
						<p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
							Brand
						</p>
						<p className="mt-1 font-semibold">{spec.brand.name}</p>
						<p className="text-xs text-muted-foreground">{spec.brand.tagline}</p>
					</div>
					<Separator />
					<div>
						<p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
							SEO blogs
						</p>
						<ul className="mt-2 space-y-2">
							{(spec.seo.blogIdeas || []).slice(0, 3).map((b) => (
								<li key={b.title} className="text-xs">
									<span className="font-medium">{b.title}</span>
									<span className="block text-muted-foreground">
										{b.keyword}
									</span>
								</li>
							))}
						</ul>
					</div>
					<Separator />
					<div>
						<p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
							Submit to
						</p>
						<ul className="mt-2 space-y-1.5">
							{TOP_DIRECTORY_SUBMISSIONS.slice(0, 6).map((d) => (
								<li key={d.name}>
									<a
										href={d.url}
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
									>
										{d.name}
										<ExternalLink className="size-3 opacity-60" />
									</a>
								</li>
							))}
						</ul>
						<p className="mt-2 text-[11px] text-muted-foreground">
							Full top-20 list ships in MARKETING.md
						</p>
					</div>
				</aside>
			</div>
		</div>
	);
}
