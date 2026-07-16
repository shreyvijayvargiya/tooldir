import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
	ArrowRight,
	Blocks,
	Check,
	Code2,
	Database,
	ExternalLink,
	LayoutTemplate,
	Mail,
	Package,
	Palette,
	Shapes,
	Sparkles,
	Terminal,
	Twitter,
	Zap,
	Shield,
	Search,
	Calendar,
	FileText,
	Settings,
	Ticket,
	Briefcase,
	GraduationCap,
	Mic,
	Puzzle,
	Users,
	BookOpen,
	Percent,
	Rocket,
} from "lucide-react";
import { PRESET_LIST } from "@/lib/presets";
import { usePreset } from "@/lib/presets/PresetContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
	MotionSection,
	itemVariants,
	heroItemVariants,
	HeroBackdrop,
} from "../landings/shared";

export const GUMROAD_TEMPLATE_URL =
	"https://shreyvijayvargiya.gumroad.com/l/nextjs-supabase-directory-boilerplate?layout=profile";

export const CONTACT_EMAIL = "shreyvijayvargiya26@gmail.com";
export const CONTACT_X_URL = "https://x.com/shreyvijayvargiya26";

const PRESET_ICONS = {
	"ai-tools": Sparkles,
	"prompt-library": Terminal,
	"design-resources": Palette,
	"ui-inspiration": LayoutTemplate,
	resources: Package,
	"icons-library": Shapes,
	"components-library": Blocks,
	"coupons-deals": Ticket,
	"notion-templates": FileText,
	"job-board": Briefcase,
	"newsletter-directory": Mail,
	"course-directory": GraduationCap,
	"podcast-directory": Mic,
	"chrome-extensions": Puzzle,
	"no-code-tools": Blocks,
	communities: Users,
	"ebook-directory": BookOpen,
	"affiliate-offers": Percent,
	"indie-products": Rocket,
};

const FEATURES = [
	{
		icon: LayoutTemplate,
		title: "19 niche landing templates",
		body: "AI tools, Notion, deals, jobs, courses, podcasts, extensions, and more — each with a distinct hero. Switch and ship.",
	},
	{
		icon: Search,
		title: "Searchable directory",
		body: "Filters, categories, tool detail pages, and submit flows ready for your niche.",
	},
	{
		icon: Calendar,
		title: "Paid launch slots",
		body: "Stripe Checkout for featured placement dates with webhook + admin pricing controls.",
	},
	{
		icon: FileText,
		title: "SEO blog CMS",
		body: "Tiptap editor, published posts, sitemap, and Open Graph tags out of the box.",
	},
	{
		icon: Settings,
		title: "Full admin panel",
		body: "Submissions, users, payments, analytics, blogs, and pricing — one dashboard.",
	},
	{
		icon: Zap,
		title: "Theme customizer",
		body: "shadcn/ui tokens, accents, light/dark — make it yours without rebuilding UI.",
	},
];

const TECH_STACK = [
	{ name: "Next.js", detail: "Pages Router" },
	{ name: "React", detail: "19" },
	{ name: "Supabase", detail: "Auth · DB · Storage" },
	{ name: "Stripe", detail: "Checkout + webhooks" },
	{ name: "Tailwind", detail: "v3" },
	{ name: "shadcn/ui", detail: "Radix primitives" },
	{ name: "Framer Motion", detail: "Landing motion" },
	{ name: "TanStack Query", detail: "Client data" },
];

const INCLUDED = [
	"Source code + niche presets",
	"Supabase migrations SQL",
	"Stripe launch-slot flow",
	"Admin panel + blog CMS",
	"SEO, sitemap, robots",
	"Lifetime updates for this package",
];

/**
 * Demo product homepage — explains ToolDir as a boilerplate (not a live directory).
 * Niche templates remain unchanged at /demo.
 */
export default function ProductHome() {
	const { setPresetId, switcherEnabled } = usePreset();

	const openTemplate = (presetId) => {
		if (switcherEnabled) setPresetId(presetId);
	};

	return (
		<>
			{/* Hero */}
			<MotionSection className="relative flex min-h-[70vh] items-center overflow-hidden border-b px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
				<HeroBackdrop presetId="ai-tools" noiseOpacity={0.1} />
				<div className="relative z-10 mx-auto max-w-4xl text-center">
					<motion.div variants={heroItemVariants}>
						<Badge variant="secondary" className="mb-4 gap-1.5">
							<Sparkles className="size-3" />
							Full-stack boilerplate · $89
						</Badge>
					</motion.div>
					<motion.h1
						variants={heroItemVariants}
						className="mb-5 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
					>
						Build directory &amp; animated{" "}
						<span className="text-primary">websites in days</span>
					</motion.h1>
					<motion.p
						variants={heroItemVariants}
						className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground"
					>
						ToolDir is a Next.js + Supabase + Stripe template. The pages you can
						preview below are niche landing templates — lock one, connect your
						keys, and run your own directory site.
					</motion.p>
					<motion.div
						variants={heroItemVariants}
						className="flex flex-col items-center justify-center gap-3 sm:flex-row"
					>
						<Button asChild size="lg">
							<a
								href={GUMROAD_TEMPLATE_URL}
								target="_blank"
								rel="noopener noreferrer"
							>
								Buy the template
								<ExternalLink className="size-4 opacity-80" />
							</a>
						</Button>
						<Button asChild variant="outline" size="lg">
							<Link href="/templates">
								Browse templates
								<ArrowRight className="size-4" />
							</Link>
						</Button>
					</motion.div>
					<motion.p
						variants={heroItemVariants}
						className="mt-6 text-sm text-muted-foreground"
					>
						Use the bottom dock to switch niches live · then buy or{" "}
						<a href="#contact" className="underline underline-offset-4 hover:text-foreground">
							contact me
						</a>
					</motion.p>
				</div>
			</MotionSection>

			{/* How it works */}
			<MotionSection className="border-b px-4 py-16 sm:px-6 lg:px-8">
				<div className="mx-auto max-w-5xl">
					<motion.div variants={itemVariants} className="mb-10 text-center">
						<h2 className="mb-2 text-2xl font-bold sm:text-3xl">
							How it works
						</h2>
						<p className="text-muted-foreground">
							Simple path from this demo to your own live directory.
						</p>
					</motion.div>
					<div className="grid gap-4 sm:grid-cols-3">
						{[
							{
								step: "1",
								title: "Preview templates",
								body: "Open /templates or use the bottom dock dropdown to try each niche landing — deals, Notion, jobs, courses, and more.",
							},
							{
								step: "2",
								title: "Buy the boilerplate",
								body: "Get the full source on Gumroad. Lock your niche in directory.config.js and ship your brand.",
							},
							{
								step: "3",
								title: "Connect & launch",
								body: "Add Supabase + Stripe keys, run the SQL migration, and go live with admin, blog, and slots.",
							},
						].map((item) => (
							<motion.div key={item.step} variants={itemVariants}>
								<Card className="h-full">
									<CardHeader className="pb-2">
										<div className="mb-2 flex size-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
											{item.step}
										</div>
										<CardTitle className="text-base">{item.title}</CardTitle>
									</CardHeader>
									<CardContent>
										<p className="text-sm text-muted-foreground">{item.body}</p>
									</CardContent>
								</Card>
							</motion.div>
						))}
					</div>
				</div>
			</MotionSection>

			{/* Templates */}
			<MotionSection
				id="templates"
				className="border-b px-4 py-16 sm:px-6 lg:px-8"
			>
				<div className="mx-auto max-w-6xl">
					<motion.div variants={itemVariants} className="mb-10 text-center">
						<h2 className="mb-2 text-2xl font-bold sm:text-3xl">
							Niche templates included
						</h2>
						<p className="mx-auto max-w-xl text-muted-foreground">
							One codebase, many directory shapes. These are templates — not
							separate products. Pick one niche and customize it.
						</p>
					</motion.div>
					<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{PRESET_LIST.map((preset) => {
							const Icon = PRESET_ICONS[preset.id] || LayoutTemplate;
							return (
								<motion.div key={preset.id} variants={itemVariants}>
									<Link
										href="/templates"
										onClick={() => openTemplate(preset.id)}
										className="block h-full"
									>
										<Card className="h-full transition-colors hover:border-primary/40 hover:bg-muted/30">
											<CardContent className="flex flex-col gap-3 p-5">
												<div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
													<Icon className="size-5 text-primary" />
												</div>
												<div>
													<p className="font-semibold">{preset.brand}</p>
													<p className="text-xs text-muted-foreground">
														{preset.tagline}
													</p>
												</div>
												<span className="mt-auto inline-flex items-center gap-1 text-xs font-medium text-primary">
													Preview
													<ArrowRight className="size-3" />
												</span>
											</CardContent>
										</Card>
									</Link>
								</motion.div>
							);
						})}
					</div>
				</div>
			</MotionSection>

			{/* Features */}
			<MotionSection className="border-b px-4 py-16 sm:px-6 lg:px-8">
				<div className="mx-auto max-w-6xl">
					<motion.div variants={itemVariants} className="mb-10 text-center">
						<h2 className="mb-2 text-2xl font-bold sm:text-3xl">
							What you get
						</h2>
						<p className="text-muted-foreground">
							Production pieces so you skip months of wiring.
						</p>
					</motion.div>
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{FEATURES.map((feature) => {
							const Icon = feature.icon;
							return (
								<motion.div key={feature.title} variants={itemVariants}>
									<Card className="h-full border-dashed">
										<CardContent className="space-y-3 p-5">
											<div className="flex size-9 items-center justify-center rounded-lg bg-muted">
												<Icon className="size-4 text-foreground" />
											</div>
											<p className="font-semibold">{feature.title}</p>
											<p className="text-sm text-muted-foreground">
												{feature.body}
											</p>
										</CardContent>
									</Card>
								</motion.div>
							);
						})}
					</div>
				</div>
			</MotionSection>

			{/* Tech stack */}
			<MotionSection className="border-b px-4 py-16 sm:px-6 lg:px-8">
				<div className="mx-auto max-w-4xl">
					<motion.div variants={itemVariants} className="mb-10 text-center">
						<div className="mb-3 inline-flex items-center gap-2 text-primary">
							<Code2 className="size-5" />
							<span className="text-sm font-medium uppercase tracking-wider">
								Tech stack
							</span>
						</div>
						<h2 className="mb-2 text-2xl font-bold sm:text-3xl">
							Modern, familiar tools
						</h2>
						<p className="text-muted-foreground">
							No exotic frameworks — ship with what you already know.
						</p>
					</motion.div>
					<motion.div
						variants={itemVariants}
						className="grid grid-cols-2 gap-3 sm:grid-cols-4"
					>
						{TECH_STACK.map((tech) => (
							<div
								key={tech.name}
								className="rounded-xl border bg-muted/30 px-4 py-4 text-center"
							>
								<p className="font-semibold">{tech.name}</p>
								<p className="mt-0.5 text-xs text-muted-foreground">
									{tech.detail}
								</p>
							</div>
						))}
					</motion.div>
					<motion.div
						variants={itemVariants}
						className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground"
					>
						<Database className="size-4" />
						One SQL migration for Auth, Storage, and directory tables
					</motion.div>
				</div>
			</MotionSection>

			{/* Pricing */}
			<MotionSection
				id="buy"
				className="border-b px-4 py-16 sm:px-6 lg:px-8"
			>
				<div className="mx-auto max-w-lg">
					<motion.div variants={itemVariants}>
						<Card className="overflow-hidden border-primary/20 shadow-lg">
							<CardHeader className="space-y-2 bg-muted/40 pb-4 text-center">
								<Badge className="mx-auto w-fit" variant="secondary">
									One-time purchase
								</Badge>
								<CardTitle className="text-3xl">
									$89{" "}
									<span className="text-base font-normal text-muted-foreground">
										USD
									</span>
								</CardTitle>
								<p className="text-sm text-muted-foreground">
									Full ToolDir boilerplate — all niche templates included
								</p>
							</CardHeader>
							<CardContent className="space-y-5 p-6">
								<ul className="space-y-2.5">
									{INCLUDED.map((line) => (
										<li
											key={line}
											className="flex items-start gap-2 text-sm"
										>
											<Check className="mt-0.5 size-4 shrink-0 text-primary" />
											{line}
										</li>
									))}
								</ul>
								<Button asChild size="lg" className="w-full">
									<a
										href={GUMROAD_TEMPLATE_URL}
										target="_blank"
										rel="noopener noreferrer"
									>
										Buy on Gumroad
										<ExternalLink className="size-4 opacity-80" />
									</a>
								</Button>
								<p className="text-center text-xs text-muted-foreground">
									Questions before buying? Reach out below — happy to help.
								</p>
							</CardContent>
						</Card>
					</motion.div>
				</div>
			</MotionSection>

			{/* Contact */}
			<MotionSection
				id="contact"
				className="px-4 py-16 sm:px-6 lg:px-8"
			>
				<div className="mx-auto max-w-2xl text-center">
					<motion.div variants={itemVariants}>
						<div className="mb-3 inline-flex items-center gap-2 text-primary">
							<Shield className="size-5" />
							<span className="text-sm font-medium uppercase tracking-wider">
								Contact
							</span>
						</div>
						<h2 className="mb-2 text-2xl font-bold sm:text-3xl">
							Talk to the maker
						</h2>
						<p className="mb-8 text-muted-foreground">
							Follow on X or email me directly — for template questions,
							custom niches, or support.
						</p>
					</motion.div>
					<motion.div
						variants={itemVariants}
						className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center"
					>
						<Button asChild variant="outline" size="lg" className="gap-2">
							<a
								href={CONTACT_X_URL}
								target="_blank"
								rel="noopener noreferrer"
							>
								<Twitter className="size-4" />
								Follow on X
							</a>
						</Button>
						<Button asChild size="lg" className="gap-2">
							<a href={`mailto:${CONTACT_EMAIL}`}>
								<Mail className="size-4" />
								{CONTACT_EMAIL}
							</a>
						</Button>
					</motion.div>
					<Separator className="my-10" />
					<motion.p
						variants={itemVariants}
						className={cn("text-sm text-muted-foreground")}
					>
						Prefer the in-app form?{" "}
						<Link
							href="/contact"
							className="font-medium text-foreground underline underline-offset-4"
						>
							Contact page
						</Link>
					</motion.p>
				</div>
			</MotionSection>
		</>
	);
}
