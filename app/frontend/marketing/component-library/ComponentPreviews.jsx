import React, { useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import {
	Bell,
	Heart,
	Star,
	Check,
	Copy,
	ChevronDown,
	Loader2,
	Search,
	CheckCircle2,
	X,
	Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

const AVATARS = ["SV", "AK", "MR", "JL"];
const FAQ = [
	{ q: "How do launch slots work?", a: "Pick a date, pay, and go live on the homepage." },
	{ q: "Can I edit my listing?", a: "Yes — update copy and assets anytime from the dashboard." },
];
const STAGGER_ITEMS = ["Cursor", "v0", "Bolt", "Replit", "Lovable"];
const TAB_LABELS = ["All", "Trending", "New"];
const CONFETTI_COLORS = ["#2563eb", "#7c3aed", "#059669", "#f59e0b", "#e11d48"];

function NotificationBadgePreview() {
	const [show, setShow] = useState(false);
	return (
		<div className="flex flex-col items-center gap-3">
			<Button
				variant="outline"
				size="icon"
				className="relative size-12"
				onClick={() => setShow((v) => !v)}
			>
				<Bell className="size-5" />
				<AnimatePresence>
					{show ? (
						<motion.span
							initial={{ opacity: 0, x: 8, y: -8, scale: 0.4 }}
							animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
							exit={{ opacity: 0, x: 8, y: -8, scale: 0.4 }}
							transition={{ type: "spring", stiffness: 500, damping: 22 }}
							className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground"
						>
							3
						</motion.span>
					) : null}
				</AnimatePresence>
			</Button>
			<Button size="sm" variant="secondary" onClick={() => setShow(true)}>
				Animate
			</Button>
		</div>
	);
}

function MenuDropdownPreview() {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline">Open menu</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="center" className="w-44">
				<DropdownMenuItem>Profile</DropdownMenuItem>
				<DropdownMenuItem>Billing</DropdownMenuItem>
				<DropdownMenuItem>Sign out</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

function ModalDialogPreview() {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button>Open modal</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Launch slot booked</DialogTitle>
				</DialogHeader>
				<p className="text-sm text-muted-foreground">
					Your tool goes live tomorrow at 9:00 AM UTC.
				</p>
			</DialogContent>
		</Dialog>
	);
}

function IconSwapPreview() {
	const [liked, setLiked] = useState(false);
	return (
		<Button
			variant="outline"
			size="icon"
			className="size-12"
			onClick={() => setLiked((v) => !v)}
		>
			<AnimatePresence mode="wait" initial={false}>
				<motion.span
					key={liked ? "star" : "heart"}
					initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
					animate={{ opacity: 1, rotate: 0, scale: 1 }}
					exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
					transition={{ duration: 0.2 }}
					className="flex items-center justify-center"
				>
					{liked ? (
						<Star className="size-5 fill-amber-400 text-amber-400" />
					) : (
						<Heart className="size-5" />
					)}
				</motion.span>
			</AnimatePresence>
		</Button>
	);
}

function SuccessCheckPreview() {
	const [done, setDone] = useState(false);
	return (
		<div className="flex flex-col items-center gap-3">
			<motion.div
				className="flex size-14 items-center justify-center rounded-full border-2"
				animate={{
					borderColor: done ? "hsl(var(--primary))" : "hsl(var(--border))",
					backgroundColor: done ? "hsl(var(--primary))" : "transparent",
				}}
			>
				{done ? (
					<motion.div
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						transition={{ type: "spring", stiffness: 500 }}
					>
						<Check className="size-7 text-primary-foreground" strokeWidth={3} />
					</motion.div>
				) : null}
			</motion.div>
			<Button size="sm" onClick={() => setDone(true)} disabled={done}>
				{done ? "Done" : "Mark complete"}
			</Button>
		</div>
	);
}

function AvatarStackPreview() {
	return (
		<div className="group flex -space-x-3 transition-all duration-300 hover:space-x-1">
			{AVATARS.map((initials) => (
				<div
					key={initials}
					className="flex size-10 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-semibold transition-transform group-hover:scale-105"
				>
					{initials}
				</div>
			))}
		</div>
	);
}

function CardHoverLiftPreview() {
	return (
		<Card className="w-56 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
			<CardContent className="p-5">
				<p className="font-semibold">Featured listing</p>
				<p className="mt-1 text-sm text-muted-foreground">
					Homepage placement for 7 days.
				</p>
			</CardContent>
		</Card>
	);
}

function NumberCounterPreview() {
	const [count, setCount] = useState(1284);
	return (
		<div className="flex flex-col items-center gap-3">
			<AnimatePresence mode="popLayout">
				<motion.p
					key={count}
					initial={{ opacity: 0, y: 12, scale: 0.8 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					className="text-4xl font-bold tabular-nums"
				>
					{count.toLocaleString()}
				</motion.p>
			</AnimatePresence>
			<Button size="sm" onClick={() => setCount((c) => c + 1)}>
				+1 visitor
			</Button>
		</div>
	);
}

function TextSwapPreview() {
	const [sent, setSent] = useState(false);
	return (
		<Button
			className="min-w-[120px]"
			disabled={sent}
			onClick={() => {
				setSent(true);
				setTimeout(() => setSent(false), 2000);
			}}
		>
			<AnimatePresence mode="wait" initial={false}>
				<motion.span
					key={sent ? "sent" : "idle"}
					initial={{ opacity: 0, y: 8 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -8 }}
					transition={{ duration: 0.15 }}
				>
					{sent ? "Sent!" : "Subscribe"}
				</motion.span>
			</AnimatePresence>
		</Button>
	);
}

function LiveStatusBadgePreview() {
	return (
		<Badge variant="secondary" className="gap-2 pl-2">
			<span className="relative flex size-2">
				<span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
				<span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
			</span>
			Live on CompDir
		</Badge>
	);
}

function SkeletonShimmerPreview() {
	return (
		<div className="w-56 space-y-3">
			<Skeleton className="h-4 w-3/4" />
			<Skeleton className="h-4 w-full" />
			<Skeleton className="h-24 w-full rounded-xl" />
		</div>
	);
}

function CopyWithToastPreview() {
	const snippet = "npm install lucide-react";
	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(snippet);
			toast.success("Copied to clipboard", { description: snippet });
		} catch {
			toast.error("Could not copy");
		}
	};
	return (
		<Button
			variant="outline"
			className="gap-2 font-mono text-xs"
			onClick={handleCopy}
		>
			<Copy className="size-3.5" />
			{snippet}
		</Button>
	);
}

function AccordionExpandPreview() {
	const [open, setOpen] = useState(0);
	return (
		<div className="w-72 divide-y rounded-xl border">
			{FAQ.map((item, i) => (
				<div key={item.q}>
					<button
						type="button"
						className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium"
						onClick={() => setOpen(open === i ? -1 : i)}
					>
						{item.q}
						<motion.span animate={{ rotate: open === i ? 180 : 0 }}>
							<ChevronDown className="size-4" />
						</motion.span>
					</button>
					<AnimatePresence initial={false}>
						{open === i ? (
							<motion.div
								initial={{ height: 0, opacity: 0 }}
								animate={{ height: "auto", opacity: 1 }}
								exit={{ height: 0, opacity: 0 }}
								className="overflow-hidden"
							>
								<p className="px-4 pb-3 text-sm text-muted-foreground">
									{item.a}
								</p>
							</motion.div>
						) : null}
					</AnimatePresence>
				</div>
			))}
		</div>
	);
}

function SheetSlideInPreview() {
	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button variant="outline">Open sheet</Button>
			</SheetTrigger>
			<SheetContent>
				<SheetHeader>
					<SheetTitle>Filter tools</SheetTitle>
				</SheetHeader>
				<p className="mt-2 text-sm text-muted-foreground">
					Narrow by category, pricing, or tags.
				</p>
			</SheetContent>
		</Sheet>
	);
}

function ProgressBarPreview() {
	const [progress, setProgress] = useState(35);
	return (
		<div className="w-64 space-y-3">
			<div className="h-2 overflow-hidden rounded-full bg-muted">
				<motion.div
					className="h-full rounded-full bg-primary"
					animate={{ width: `${progress}%` }}
					transition={{ type: "spring", stiffness: 120, damping: 20 }}
				/>
			</div>
			<Button
				size="sm"
				onClick={() => setProgress((p) => Math.min(100, p + 15))}
			>
				Simulate upload
			</Button>
		</div>
	);
}

function SpinnerLoaderPreview() {
	const [loading, setLoading] = useState(false);
	return (
		<div className="flex flex-col items-center gap-3">
			{loading ? (
				<motion.div
					initial={{ opacity: 0, scale: 0.8 }}
					animate={{ opacity: 1, scale: 1 }}
					className="flex items-center gap-2 text-sm text-muted-foreground"
				>
					<Loader2 className="size-5 animate-spin text-primary" />
					Syncing listings…
				</motion.div>
			) : null}
			<Button
				size="sm"
				disabled={loading}
				onClick={() => {
					setLoading(true);
					setTimeout(() => setLoading(false), 2000);
				}}
			>
				{loading ? "Loading" : "Start sync"}
			</Button>
		</div>
	);
}

function StaggeredListPreview() {
	return (
		<motion.ul
			initial="hidden"
			animate="show"
			variants={{ show: { transition: { staggerChildren: 0.08 } } }}
			className="w-48 space-y-2"
		>
			{STAGGER_ITEMS.map((name) => (
				<motion.li
					key={name}
					variants={{
						hidden: { opacity: 0, y: 12 },
						show: { opacity: 1, y: 0 },
					}}
					className="rounded-lg border bg-background px-3 py-2 text-sm font-medium"
				>
					{name}
				</motion.li>
			))}
		</motion.ul>
	);
}

function FlipCardPreview() {
	return (
		<div className="group h-36 w-52 [perspective:1000px]">
			<div className="relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
				<div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl border bg-background [backface-visibility:hidden]">
					<p className="font-semibold">ToolDir Pro</p>
					<p className="mt-1 text-xs text-muted-foreground">Hover to flip</p>
				</div>
				<div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl border bg-primary text-primary-foreground [backface-visibility:hidden] [transform:rotateY(180deg)]">
					<p className="font-semibold">$49/mo</p>
					<p className="mt-1 text-xs opacity-90">Featured + analytics</p>
				</div>
			</div>
		</div>
	);
}

function LikeBouncePreview() {
	const [liked, setLiked] = useState(false);
	return (
		<Button
			variant="outline"
			size="icon"
			className="size-12"
			onClick={() => setLiked((v) => !v)}
		>
			<motion.div
				animate={{ scale: liked ? [1, 1.35, 1] : 1 }}
				transition={{ duration: 0.35 }}
			>
				<Heart
					className={
						liked ? "size-5 fill-rose-500 text-rose-500" : "size-5"
					}
				/>
			</motion.div>
		</Button>
	);
}

function TabsIndicatorPreview() {
	const [active, setActive] = useState(0);
	return (
		<div className="relative flex gap-1 rounded-lg border bg-muted/40 p-1">
			{TAB_LABELS.map((tab, i) => (
				<button
					key={tab}
					type="button"
					onClick={() => setActive(i)}
					className={cn(
						"relative px-4 py-1.5 text-sm font-medium transition-colors",
						active === i ? "text-foreground" : "text-muted-foreground"
					)}
				>
					{active === i ? (
						<motion.span
							layoutId="compdir-tab-pill"
							className="absolute inset-0 rounded-md bg-background shadow-sm"
							transition={{ type: "spring", stiffness: 400, damping: 30 }}
							style={{ zIndex: 0 }}
						/>
					) : null}
					<span className="relative z-10">{tab}</span>
				</button>
			))}
		</div>
	);
}

function ConfettiBurstPreview() {
	const [burst, setBurst] = useState(0);
	const particles = Array.from({ length: 12 }, (_, i) => i);
	return (
		<div className="relative flex flex-col items-center gap-3">
			<div className="pointer-events-none absolute left-1/2 top-8 size-0 -translate-x-1/2">
				<AnimatePresence>
					{burst > 0
						? particles.map((i) => (
								<motion.span
									key={`${burst}-${i}`}
									className="absolute size-2 rounded-sm"
									style={{
										background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
									}}
									initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
									animate={{
										x: (i % 2 ? 1 : -1) * (40 + i * 8),
										y: -60 - i * 4,
										opacity: 0,
										rotate: 180,
									}}
									transition={{ duration: 0.7, ease: "easeOut" }}
								/>
							))
						: null}
				</AnimatePresence>
			</div>
			<Button onClick={() => setBurst((b) => b + 1)}>Celebrate launch 🎉</Button>
		</div>
	);
}

function SearchExpandPreview() {
	return (
		<div className="relative">
			<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
			<Input
				placeholder="Search tools…"
				className="w-40 pl-9 transition-all duration-300 focus:w-64"
			/>
		</div>
	);
}

function SlideToastPreview() {
	const [show, setShow] = useState(false);
	return (
		<div className="relative h-24 w-72">
			<AnimatePresence>
				{show ? (
					<motion.div
						initial={{ y: -48, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						exit={{ y: -48, opacity: 0 }}
						transition={{ type: "spring", stiffness: 380, damping: 28 }}
						className="absolute inset-x-0 top-0 flex items-center gap-2 rounded-xl border bg-background px-3 py-2.5 text-sm shadow-lg"
					>
						<CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
						<span className="flex-1">Listing submitted successfully</span>
						<button type="button" onClick={() => setShow(false)}>
							<X className="size-4 text-muted-foreground" />
						</button>
					</motion.div>
				) : null}
			</AnimatePresence>
			<Button
				size="sm"
				className="absolute bottom-0 left-1/2 -translate-x-1/2"
				onClick={() => setShow(true)}
			>
				Show alert
			</Button>
		</div>
	);
}

function MagneticButtonPreview() {
	const ref = useRef(null);
	const x = useMotionValue(0);
	const y = useMotionValue(0);
	const sx = useSpring(x, { stiffness: 300, damping: 20 });
	const sy = useSpring(y, { stiffness: 300, damping: 20 });

	return (
		<motion.div
			ref={ref}
			style={{ x: sx, y: sy }}
			onMouseMove={(e) => {
				const rect = ref.current?.getBoundingClientRect();
				if (!rect) return;
				x.set((e.clientX - rect.left - rect.width / 2) * 0.25);
				y.set((e.clientY - rect.top - rect.height / 2) * 0.25);
			}}
			onMouseLeave={() => {
				x.set(0);
				y.set(0);
			}}
		>
			<Button>Get started</Button>
		</motion.div>
	);
}

function TypingIndicatorPreview() {
	return (
		<div className="flex items-center gap-1 rounded-full border bg-muted/50 px-3 py-2">
			{[0, 1, 2].map((i) => (
				<motion.span
					key={i}
					className="size-1.5 rounded-full bg-muted-foreground"
					animate={{ y: [0, -4, 0] }}
					transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
				/>
			))}
		</div>
	);
}

function RevealOnScrollPreview() {
	const [key, setKey] = useState(0);
	return (
		<div className="space-y-3 text-center">
			<motion.div
				key={key}
				initial={{ opacity: 0, y: 32 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: false, amount: 0.6 }}
				transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
				className="w-56 rounded-xl border bg-background px-6 py-8"
			>
				<p className="font-semibold">Featured tool</p>
				<p className="mt-1 text-sm text-muted-foreground">Scroll-style reveal</p>
			</motion.div>
			<Button size="sm" variant="outline" onClick={() => setKey((k) => k + 1)}>
				Replay
			</Button>
		</div>
	);
}

function PopoverFadePreview() {
	const [open, setOpen] = useState(false);
	return (
		<div className="relative pt-16">
			<Button
				variant="outline"
				size="icon"
				onClick={() => setOpen((v) => !v)}
			>
				<Info className="size-4" />
			</Button>
			<AnimatePresence>
				{open ? (
					<motion.div
						initial={{ opacity: 0, scale: 0.92, y: 4 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.92, y: 4 }}
						className="absolute bottom-full left-1/2 mb-2 w-48 -translate-x-1/2 rounded-lg border bg-background p-3 text-xs shadow-lg"
					>
						Launch slots fill fast — book early for homepage placement.
					</motion.div>
				) : null}
			</AnimatePresence>
		</div>
	);
}

/** Live previews keyed by catalog id */
export const COMPONENT_PREVIEWS = {
	"notification-badge": NotificationBadgePreview,
	"menu-dropdown": MenuDropdownPreview,
	"modal-dialog": ModalDialogPreview,
	"icon-swap": IconSwapPreview,
	"success-check": SuccessCheckPreview,
	"avatar-stack": AvatarStackPreview,
	"card-hover-lift": CardHoverLiftPreview,
	"number-counter": NumberCounterPreview,
	"text-swap": TextSwapPreview,
	"badge-pulse": LiveStatusBadgePreview,
	"skeleton-shimmer": SkeletonShimmerPreview,
	"copy-toast": CopyWithToastPreview,
	"accordion-expand": AccordionExpandPreview,
	"sheet-slide-in": SheetSlideInPreview,
	"progress-bar": ProgressBarPreview,
	"spinner-loader": SpinnerLoaderPreview,
	"staggered-list": StaggeredListPreview,
	"flip-card": FlipCardPreview,
	"like-bounce": LikeBouncePreview,
	"tabs-indicator": TabsIndicatorPreview,
	"confetti-burst": ConfettiBurstPreview,
	"search-expand": SearchExpandPreview,
	"slide-toast": SlideToastPreview,
	"magnetic-button": MagneticButtonPreview,
	"typing-dots": TypingIndicatorPreview,
	"reveal-on-scroll": RevealOnScrollPreview,
	"popover-fade": PopoverFadePreview,
};

export function ComponentPreview({ id }) {
	const Preview = COMPONENT_PREVIEWS[id];
	if (!Preview) {
		return (
			<p className="text-sm text-muted-foreground">Preview not available.</p>
		);
	}
	return <Preview />;
}
