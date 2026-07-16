/** Component library sections for CompDir (frontend-only catalog) */
export const COMPONENT_SECTIONS = [
	{ id: "feedback", label: "Feedback" },
	{ id: "navigation", label: "Navigation" },
	{ id: "overlays", label: "Overlays" },
	{ id: "micro", label: "Micro-interactions" },
	{ id: "layout", label: "Layout" },
	{ id: "motion", label: "Motion" },
];

/**
 * @typedef {Object} ComponentCatalogEntry
 * @property {string} id
 * @property {string} name
 * @property {string} section
 * @property {string} description
 * @property {string} reactCode
 * @property {string} htmlCode
 */

/** @type {ComponentCatalogEntry[]} */
export const COMPONENTS_CATALOG = [
	{
		id: "notification-badge",
		name: "Notification badge",
		section: "feedback",
		description: "Diagonal slide with spring pop-in on a bell trigger.",
		reactCode: `import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NotificationBadge() {
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
}`,
		htmlCode: `<button id="bell" class="bell-btn" aria-label="Notifications">
  <svg><!-- bell icon --></svg>
  <span id="badge" class="badge hidden">3</span>
</button>
<button id="animate">Animate</button>

<style>
.bell-btn { position: relative; }
.badge {
  position: absolute; top: -4px; right: -4px;
  width: 20px; height: 20px; border-radius: 9999px;
  background: #2563eb; color: white; font-size: 10px;
  display: flex; align-items: center; justify-content: center;
  animation: badge-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.badge.hidden { display: none; }
@keyframes badge-in {
  from { opacity: 0; transform: translate(8px, -8px) scale(0.4); }
  to { opacity: 1; transform: translate(0, 0) scale(1); }
}
</style>

<script>
document.getElementById("animate").onclick = () =>
  document.getElementById("badge").classList.remove("hidden");
</script>`,
	},
	{
		id: "menu-dropdown",
		name: "Menu dropdown",
		section: "navigation",
		description: "Radix dropdown with fade + slide entrance.",
		reactCode: `import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function MenuDropdown() {
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
}`,
		htmlCode: `<details class="menu">
  <summary class="menu-trigger">Open menu</summary>
  <ul class="menu-panel">
    <li>Profile</li>
    <li>Billing</li>
    <li>Sign out</li>
  </ul>
</details>

<style>
.menu-trigger { cursor: pointer; padding: 8px 16px; border: 1px solid #e4e4e7; border-radius: 8px; }
.menu-panel { margin-top: 8px; padding: 4px; border: 1px solid #e4e4e7; border-radius: 8px; list-style: none; animation: drop-in 0.2s ease; }
@keyframes drop-in { from { opacity: 0; transform: translateY(-6px); } }
</style>`,
	},
	{
		id: "modal-dialog",
		name: "Modal dialog",
		section: "overlays",
		description: "Centered modal with backdrop fade and scale-in panel.",
		reactCode: `import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function ModalDialog() {
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
}`,
		htmlCode: `<button onclick="document.getElementById('modal').showModal()">
  Open modal
</button>

<dialog id="modal" class="modal">
  <h2>Launch slot booked</h2>
  <p>Your tool goes live tomorrow at 9:00 AM UTC.</p>
  <button onclick="this.closest('dialog').close()">Close</button>
</dialog>

<style>
.modal { border: none; border-radius: 12px; padding: 24px; max-width: 400px; }
.modal::backdrop { background: rgba(0,0,0,0.45); }
</style>`,
	},
	{
		id: "icon-swap",
		name: "Icon swap",
		section: "micro",
		description: "Cross-fade between two icons on toggle.",
		reactCode: `import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

export function IconSwap() {
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
        >
          {liked ? <Star className="size-5 fill-amber-400 text-amber-400" /> : <Heart className="size-5" />}
        </motion.span>
      </AnimatePresence>
    </Button>
  );
}`,
		htmlCode: `<button id="swap" class="icon-btn" aria-pressed="false">♡</button>

<script>
const btn = document.getElementById("swap");
let on = false;
btn.onclick = () => {
  on = !on;
  btn.textContent = on ? "★" : "♡";
  btn.style.color = on ? "#f59e0b" : "inherit";
  btn.setAttribute("aria-pressed", String(on));
};
</script>`,
	},
	{
		id: "success-check",
		name: "Success checkmark",
		section: "feedback",
		description: "Circle morphs into a spring checkmark on complete.",
		reactCode: `import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SuccessCheck() {
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
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500 }}>
            <Check className="size-7 text-primary-foreground" strokeWidth={3} />
          </motion.div>
        ) : null}
      </motion.div>
      <Button size="sm" onClick={() => setDone(true)} disabled={done}>
        {done ? "Done" : "Mark complete"}
      </Button>
    </div>
  );
}`,
		htmlCode: `<div id="check" class="check-circle"></div>
<button id="run">Mark complete</button>

<style>
.check-circle {
  width: 56px; height: 56px; border-radius: 9999px;
  border: 2px solid #e4e4e7; transition: all 0.3s ease;
}
.check-circle.done {
  background: #2563eb; border-color: #2563eb;
  background-image: url("data:image/svg+xml,...");
}
</style>`,
	},
	{
		id: "avatar-stack",
		name: "Avatar stack",
		section: "layout",
		description: "Overlapping avatars expand spacing on group hover.",
		reactCode: `const AVATARS = ["SV", "AK", "MR", "JL"];

export function AvatarStack() {
  return (
    <div className="group flex -space-x-3 hover:space-x-1 transition-all duration-300">
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
}`,
		htmlCode: `<div class="avatar-stack">
  <span>SV</span><span>AK</span><span>MR</span><span>JL</span>
</div>

<style>
.avatar-stack { display: flex; }
.avatar-stack span {
  width: 40px; height: 40px; border-radius: 9999px;
  margin-left: -12px; border: 2px solid white;
  display: flex; align-items: center; justify-content: center;
  background: #f4f4f5; font-size: 12px; font-weight: 600;
  transition: margin 0.3s, transform 0.3s;
}
.avatar-stack:hover span { margin-left: 4px; transform: scale(1.05); }
.avatar-stack span:first-child { margin-left: 0; }
</style>`,
	},
	{
		id: "card-hover-lift",
		name: "Card hover lift",
		section: "layout",
		description: "Subtle translateY and shadow on card hover.",
		reactCode: `import { Card, CardContent } from "@/components/ui/card";

export function CardHoverLift() {
  return (
    <Card className="w-56 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer">
      <CardContent className="p-5">
        <p className="font-semibold">Featured listing</p>
        <p className="text-sm text-muted-foreground mt-1">
          Homepage placement for 7 days.
        </p>
      </CardContent>
    </Card>
  );
}`,
		htmlCode: `<article class="lift-card">
  <h3>Featured listing</h3>
  <p>Homepage placement for 7 days.</p>
</article>

<style>
.lift-card {
  width: 224px; padding: 20px; border-radius: 12px;
  border: 1px solid #e4e4e7; transition: transform 0.3s, box-shadow 0.3s;
}
.lift-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0,0,0,0.08);
}
</style>`,
	},
	{
		id: "number-counter",
		name: "Number counter",
		section: "micro",
		description: "Pop-in scale when the stat increments.",
		reactCode: `import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

export function NumberCounter() {
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
}`,
		htmlCode: `<p id="count" class="stat">1,284</p>
<button id="inc">+1 visitor</button>

<script>
let n = 1284;
document.getElementById("inc").onclick = () => {
  n += 1;
  const el = document.getElementById("count");
  el.style.animation = "none";
  void el.offsetWidth;
  el.textContent = n.toLocaleString();
  el.style.animation = "pop 0.35s ease";
};
</script>

<style>
.stat { font-size: 2.25rem; font-weight: 700; }
@keyframes pop {
  from { opacity: 0; transform: translateY(12px) scale(0.8); }
  to { opacity: 1; transform: none; }
}
</style>`,
	},
	{
		id: "text-swap",
		name: "Text states swap",
		section: "micro",
		description: "Button label cross-fades between idle and success.",
		reactCode: `import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

export function TextSwap() {
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
}`,
		htmlCode: `<button id="sub" class="swap-btn">Subscribe</button>

<script>
const btn = document.getElementById("sub");
btn.onclick = () => {
  btn.textContent = "Sent!";
  btn.disabled = true;
  setTimeout(() => { btn.textContent = "Subscribe"; btn.disabled = false; }, 2000);
};
</script>`,
	},
	{
		id: "badge-pulse",
		name: "Live status badge",
		section: "feedback",
		description: "Pulsing dot for live / online states.",
		reactCode: `import { Badge } from "@/components/ui/badge";

export function LiveStatusBadge() {
  return (
    <Badge variant="secondary" className="gap-2 pl-2">
      <span className="relative flex size-2">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
      </span>
      Live on ToolDir
    </Badge>
  );
}`,
		htmlCode: `<span class="live-badge">
  <span class="dot"></span>
  Live on ToolDir
</span>

<style>
.live-badge {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 4px 12px; border-radius: 9999px; background: #f4f4f5; font-size: 14px;
}
.dot {
  width: 8px; height: 8px; border-radius: 9999px; background: #10b981;
  box-shadow: 0 0 0 0 rgba(16,185,129,0.6);
  animation: pulse 1.5s infinite;
}
@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(16,185,129,0.6); }
  70% { box-shadow: 0 0 0 8px rgba(16,185,129,0); }
}
</style>`,
	},
	{
		id: "skeleton-shimmer",
		name: "Skeleton shimmer",
		section: "layout",
		description: "Loading placeholder with moving shimmer gradient.",
		reactCode: `import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonShimmer() {
  return (
    <div className="w-56 space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-24 w-full rounded-xl" />
    </div>
  );
}`,
		htmlCode: `<div class="skeleton-block">
  <div class="line w-75"></div>
  <div class="line"></div>
  <div class="card"></div>
</div>

<style>
.line, .card {
  background: linear-gradient(90deg, #f4f4f5 25%, #e4e4e7 50%, #f4f4f5 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 6px; height: 16px; margin-bottom: 12px;
}
.card { height: 96px; border-radius: 12px; }
.w-75 { width: 75%; }
@keyframes shimmer { to { background-position: -200% 0; } }
</style>`,
	},
	{
		id: "copy-toast",
		name: "Copy with toast",
		section: "feedback",
		description: "One-click copy snippet with sonner toast feedback.",
		reactCode: `import { Copy } from "lucide-react";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";

export function CopyWithToast() {
  const snippet = "npm install lucide-react";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(snippet);
    toast.success("Copied to clipboard", { description: snippet });
  };

  return (
    <Button variant="outline" className="gap-2 font-mono text-xs" onClick={handleCopy}>
      <Copy className="size-3.5" />
      {snippet}
    </Button>
  );
}`,
		htmlCode: `<button id="copy" class="copy-btn">npm install lucide-react</button>
<div id="toast" class="toast hidden">Copied!</div>

<script>
document.getElementById("copy").onclick = async () => {
  await navigator.clipboard.writeText("npm install lucide-react");
  const t = document.getElementById("toast");
  t.classList.remove("hidden");
  setTimeout(() => t.classList.add("hidden"), 2000);
};
</script>`,
	},
	{
		id: "accordion-expand",
		name: "Accordion expand",
		section: "layout",
		description: "Smooth height animation when FAQ items open and close.",
		reactCode: `import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const FAQ = [
  { q: "How do launch slots work?", a: "Pick a date, pay, and go live on the homepage." },
  { q: "Can I edit my listing?", a: "Yes — update copy and assets anytime from the dashboard." },
];

export function AccordionExpand() {
  const [open, setOpen] = useState(0);
  return (
    <div className="w-72 divide-y rounded-xl border">
      {FAQ.map((item, i) => (
        <div key={item.q}>
          <button type="button" className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium" onClick={() => setOpen(open === i ? -1 : i)}>
            {item.q}
            <motion.span animate={{ rotate: open === i ? 180 : 0 }}><ChevronDown className="size-4" /></motion.span>
          </button>
          <AnimatePresence initial={false}>
            {open === i ? (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <p className="px-4 pb-3 text-sm text-muted-foreground">{item.a}</p>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}`,
		htmlCode: `<details class="faq"><summary>How do launch slots work?</summary><p>Pick a date, pay, and go live.</p></details>
<style>
details { border: 1px solid #e4e4e7; border-radius: 12px; padding: 12px 16px; }
details[open] summary { margin-bottom: 8px; }
details p { animation: fade-in 0.25s ease; }
@keyframes fade-in { from { opacity: 0; transform: translateY(-4px); } }
</style>`,
	},
	{
		id: "sheet-slide-in",
		name: "Sheet slide-in",
		section: "overlays",
		description: "Side panel slides in from the right with backdrop fade.",
		reactCode: `import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export function SheetSlideIn() {
  return (
    <Sheet>
      <SheetTrigger asChild><Button variant="outline">Open sheet</Button></SheetTrigger>
      <SheetContent>
        <SheetHeader><SheetTitle>Filter tools</SheetTitle></SheetHeader>
        <p className="text-sm text-muted-foreground mt-2">Narrow by category, pricing, or tags.</p>
      </SheetContent>
    </Sheet>
  );
}`,
		htmlCode: `<button onclick="document.getElementById('sheet').classList.add('open')">Open sheet</button>
<aside id="sheet" class="sheet"><h2>Filter tools</h2><p>Narrow by category.</p></aside>
<style>
.sheet { position: fixed; right: 0; top: 0; height: 100%; width: 320px; transform: translateX(100%); transition: transform 0.35s ease; background: white; padding: 24px; box-shadow: -8px 0 24px rgba(0,0,0,0.08); }
.sheet.open { transform: translateX(0); }
</style>`,
	},
	{
		id: "progress-bar",
		name: "Progress bar",
		section: "feedback",
		description: "Animated fill bar driven by upload or task progress.",
		reactCode: `import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function ProgressBar() {
  const [progress, setProgress] = useState(35);
  return (
    <div className="w-64 space-y-3">
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <motion.div className="h-full rounded-full bg-primary" animate={{ width: \`\${progress}%\` }} transition={{ type: "spring", stiffness: 120, damping: 20 }} />
      </div>
      <Button size="sm" onClick={() => setProgress((p) => Math.min(100, p + 15))}>Simulate upload</Button>
    </div>
  );
}`,
		htmlCode: `<div class="track"><div id="bar" class="fill" style="width:35%"></div></div>
<button id="go">Simulate upload</button>
<style>.track{height:8px;background:#f4f4f5;border-radius:9999px;overflow:hidden;width:256px}
.fill{height:100%;background:#2563eb;border-radius:9999px;transition:width 0.4s cubic-bezier(0.34,1.2,0.64,1)}</style>
<script>document.getElementById("go").onclick=()=>{const b=document.getElementById("bar");b.style.width=Math.min(100,parseInt(b.style.width)+15)+"%"}</script>`,
	},
	{
		id: "spinner-loader",
		name: "Spinner loader",
		section: "feedback",
		description: "Rotating loader with optional label for async states.",
		reactCode: `import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function SpinnerLoader() {
  const [loading, setLoading] = useState(false);
  return (
    <div className="flex flex-col items-center gap-3">
      {loading ? (
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-5 animate-spin text-primary" />
          Syncing listings…
        </motion.div>
      ) : null}
      <Button size="sm" disabled={loading} onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 2000); }}>
        {loading ? "Loading" : "Start sync"}
      </Button>
    </div>
  );
}`,
		htmlCode: `<div id="loader" class="loader hidden"><span class="spin"></span> Syncing…</div>
<button id="sync">Start sync</button>
<style>.spin{width:20px;height:20px;border:2px solid #e4e4e7;border-top-color:#2563eb;border-radius:50%;animation:spin 0.8s linear infinite;display:inline-block}
@keyframes spin{to{transform:rotate(360deg)}}</style>`,
	},
	{
		id: "staggered-list",
		name: "Staggered list",
		section: "motion",
		description: "List items fade and slide up with staggered timing.",
		reactCode: `import { motion } from "framer-motion";

const ITEMS = ["Cursor", "v0", "Bolt", "Replit", "Lovable"];

export function StaggeredList() {
  return (
    <motion.ul initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }} className="w-48 space-y-2">
      {ITEMS.map((name) => (
        <motion.li key={name} variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }} className="rounded-lg border bg-background px-3 py-2 text-sm font-medium">
          {name}
        </motion.li>
      ))}
    </motion.ul>
  );
}`,
		htmlCode: `<ul class="stagger">
  <li>Cursor</li><li>v0</li><li>Bolt</li><li>Replit</li><li>Lovable</li>
</ul>
<style>
.stagger li { opacity: 0; animation: rise 0.4s ease forwards; border: 1px solid #e4e4e7; border-radius: 8px; padding: 8px 12px; margin-bottom: 8px; }
.stagger li:nth-child(1){animation-delay:0s}.stagger li:nth-child(2){animation-delay:.08s}
.stagger li:nth-child(3){animation-delay:.16s}.stagger li:nth-child(4){animation-delay:.24s}
.stagger li:nth-child(5){animation-delay:.32s}
@keyframes rise { to { opacity: 1; transform: translateY(0); } from { opacity: 0; transform: translateY(12px); } }
</style>`,
	},
	{
		id: "flip-card",
		name: "Flip card",
		section: "layout",
		description: "3D Y-axis flip reveals details on the back face.",
		reactCode: `export function FlipCard() {
  return (
    <div className="group h-36 w-52 [perspective:1000px]">
      <div className="relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl border bg-background [backface-visibility:hidden]">
          <p className="font-semibold">ToolDir Pro</p>
          <p className="text-xs text-muted-foreground mt-1">Hover to flip</p>
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl border bg-primary text-primary-foreground [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <p className="font-semibold">$49/mo</p>
          <p className="text-xs opacity-90 mt-1">Featured + analytics</p>
        </div>
      </div>
    </div>
  );
}`,
		htmlCode: `<div class="flip-card"><div class="inner"><div class="front">ToolDir Pro</div><div class="back">$49/mo</div></div></div>
<style>
.flip-card { width: 208px; height: 144px; perspective: 1000px; }
.inner { position: relative; width: 100%; height: 100%; transition: transform 0.5s; transform-style: preserve-3d; }
.flip-card:hover .inner { transform: rotateY(180deg); }
.front, .back { position: absolute; inset: 0; backface-visibility: hidden; border-radius: 12px; border: 1px solid #e4e4e7; display: flex; align-items: center; justify-content: center; }
.back { transform: rotateY(180deg); background: #2563eb; color: white; }
</style>`,
	},
	{
		id: "like-bounce",
		name: "Like bounce",
		section: "micro",
		description: "Spring scale bounce when toggling a favorite heart.",
		reactCode: `import { useState } from "react";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LikeBounce() {
  const [liked, setLiked] = useState(false);
  return (
    <Button variant="outline" size="icon" className="size-12" onClick={() => setLiked((v) => !v)}>
      <motion.div animate={{ scale: liked ? [1, 1.35, 1] : 1 }} transition={{ duration: 0.35 }}>
        <Heart className={liked ? "size-5 fill-rose-500 text-rose-500" : "size-5"} />
      </motion.div>
    </Button>
  );
}`,
		htmlCode: `<button id="like" class="like-btn">♡</button>
<style>.like-btn.liked { color: #f43f5e; animation: bounce 0.35s ease; }
@keyframes bounce { 50% { transform: scale(1.35); } }</style>
<script>document.getElementById("like").onclick=function(){this.classList.toggle("liked");this.textContent=this.classList.contains("liked")?"♥":"♡"}</script>`,
	},
	{
		id: "tabs-indicator",
		name: "Tabs indicator",
		section: "navigation",
		description: "Sliding underline follows the active tab with layout animation.",
		reactCode: `import { useState } from "react";
import { motion } from "framer-motion";

const TABS = ["All", "Trending", "New"];

export function TabsIndicator() {
  const [active, setActive] = useState(0);
  return (
    <div className="relative flex gap-1 rounded-lg border bg-muted/40 p-1">
      {TABS.map((tab, i) => (
        <button key={tab} type="button" onClick={() => setActive(i)} className="relative z-10 px-4 py-1.5 text-sm font-medium text-muted-foreground data-[active=true]:text-foreground" data-active={active === i}>
          {active === i ? <motion.span layoutId="tab-pill" className="absolute inset-0 -z-10 rounded-md bg-background shadow-sm" transition={{ type: "spring", stiffness: 400, damping: 30 }} /> : null}
          {tab}
        </button>
      ))}
    </div>
  );
}`,
		htmlCode: `<div class="tabs"><button class="active">All</button><button>Trending</button><button>New</button></div>
<style>.tabs{display:flex;gap:4px;padding:4px;border-radius:8px;background:#f4f4f5}
.tabs button{padding:6px 16px;border:none;background:transparent;border-radius:6px;cursor:pointer}
.tabs button.active{background:white;box-shadow:0 1px 3px rgba(0,0,0,0.08);transition:all 0.25s ease}</style>`,
	},
	{
		id: "confetti-burst",
		name: "Confetti burst",
		section: "motion",
		description: "Particle burst celebrates a successful action.",
		reactCode: `import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

const COLORS = ["#2563eb", "#7c3aed", "#059669", "#f59e0b", "#e11d48"];

export function ConfettiBurst() {
  const [burst, setBurst] = useState(0);
  const particles = Array.from({ length: 12 }, (_, i) => i);
  return (
    <div className="relative flex flex-col items-center gap-3">
      <AnimatePresence>
        {burst > 0 ? particles.map((i) => (
          <motion.span key={\`\${burst}-\${i}\`} className="absolute size-2 rounded-sm" style={{ background: COLORS[i % COLORS.length] }}
            initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }} animate={{ x: (i % 2 ? 1 : -1) * (40 + i * 8), y: -60 - i * 4, opacity: 0, rotate: 180 }} transition={{ duration: 0.7, ease: "easeOut" }} />
        )) : null}
      </AnimatePresence>
      <Button onClick={() => setBurst((b) => b + 1)}>Celebrate launch 🎉</Button>
    </div>
  );
}`,
		htmlCode: `<button id="pop">Celebrate launch 🎉</button>
<div id="confetti"></div>
<script>
document.getElementById("pop").onclick=()=>{
  const c=document.getElementById("confetti");
  for(let i=0;i<12;i++){const p=document.createElement("span");p.className="p";p.style.setProperty("--x",(i%2?1:-1)*(40+i*8)+"px");c.appendChild(p);setTimeout(()=>p.remove(),700)}
};
</script>
<style>.p{position:fixed;width:8px;height:8px;background:#2563eb;animation:burst .7s ease-out forwards}
@keyframes burst{to{transform:translate(var(--x),-80px) rotate(180deg);opacity:0}}</style>`,
	},
	{
		id: "search-expand",
		name: "Search expand",
		section: "navigation",
		description: "Search input width grows on focus with smooth transition.",
		reactCode: `import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function SearchExpand() {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input placeholder="Search tools…" className="w-40 pl-9 transition-all duration-300 focus:w-64" />
    </div>
  );
}`,
		htmlCode: `<div class="search-wrap"><input class="search" placeholder="Search tools…" /></div>
<style>
.search { width: 160px; padding: 8px 12px 8px 36px; border: 1px solid #e4e4e7; border-radius: 8px; transition: width 0.3s ease; }
.search:focus { width: 256px; outline: none; border-color: #2563eb; }
</style>`,
	},
	{
		id: "slide-toast",
		name: "Slide-in alert",
		section: "feedback",
		description: "Banner slides down from the top with spring easing.",
		reactCode: `import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle2, X } from "lucide-react";

export function SlideToast() {
  const [show, setShow] = useState(false);
  return (
    <div className="relative h-24 w-72">
      <AnimatePresence>
        {show ? (
          <motion.div initial={{ y: -48, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -48, opacity: 0 }} transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="absolute inset-x-0 top-0 flex items-center gap-2 rounded-xl border bg-background px-3 py-2.5 shadow-lg text-sm">
            <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
            <span className="flex-1">Listing submitted successfully</span>
            <button type="button" onClick={() => setShow(false)}><X className="size-4 text-muted-foreground" /></button>
          </motion.div>
        ) : null}
      </AnimatePresence>
      <Button size="sm" className="absolute bottom-0 left-1/2 -translate-x-1/2" onClick={() => setShow(true)}>Show alert</Button>
    </div>
  );
}`,
		htmlCode: `<div id="alert" class="alert hidden">Listing submitted successfully</div>
<button id="show">Show alert</button>
<style>
.alert{position:absolute;top:0;left:0;right:0;padding:10px 14px;border-radius:12px;border:1px solid #e4e4e7;background:white;animation:slide-down .35s cubic-bezier(0.34,1.2,0.64,1)}
@keyframes slide-down{from{transform:translateY(-48px);opacity:0}}
</style>`,
	},
	{
		id: "magnetic-button",
		name: "Magnetic button",
		section: "motion",
		description: "CTA subtly follows the cursor for a tactile hover feel.",
		reactCode: `import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { Button } from "@/components/ui/button";

export function MagneticButton() {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 300, damping: 20 });
  const sy = useSpring(y, { stiffness: 300, damping: 20 });
  const onMove = (e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left - rect.width / 2) * 0.25);
    y.set((e.clientY - rect.top - rect.height / 2) * 0.25);
  };
  const onLeave = () => { x.set(0); y.set(0); };
  return (
    <motion.div ref={ref} style={{ x: sx, y: sy }} onMouseMove={onMove} onMouseLeave={onLeave}>
      <Button>Get started</Button>
    </motion.div>
  );
}`,
		htmlCode: `<button class="magnetic" id="mag">Get started</button>
<script>
const btn=document.getElementById("mag");
btn.onmousemove=(e)=>{const r=btn.getBoundingClientRect();const dx=(e.clientX-r.left-r.width/2)*0.15;const dy=(e.clientY-r.top-r.height/2)*0.15;btn.style.transform=\`translate(\${dx}px,\${dy}px)\`};
btn.onmouseleave=()=>btn.style.transform="";
</script>
<style>.magnetic{transition:transform 0.2s ease}</style>`,
	},
	{
		id: "typing-dots",
		name: "Typing indicator",
		section: "motion",
		description: "Three bouncing dots for chat or AI loading states.",
		reactCode: `import { motion } from "framer-motion";

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 rounded-full border bg-muted/50 px-3 py-2">
      {[0, 1, 2].map((i) => (
        <motion.span key={i} className="size-1.5 rounded-full bg-muted-foreground"
          animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
      ))}
    </div>
  );
}`,
		htmlCode: `<div class="typing"><span></span><span></span><span></span></div>
<style>
.typing{display:flex;gap:4px;padding:8px 12px;border-radius:9999px;border:1px solid #e4e4e7}
.typing span{width:6px;height:6px;border-radius:50%;background:#71717a;animation:bounce .6s infinite}
.typing span:nth-child(2){animation-delay:.15s}.typing span:nth-child(3){animation-delay:.3s}
@keyframes bounce{50%{transform:translateY(-4px)}}
</style>`,
	},
	{
		id: "reveal-on-scroll",
		name: "Reveal on scroll",
		section: "motion",
		description: "Content fades up into view — replay with the button below.",
		reactCode: `import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function RevealOnScroll() {
  const [key, setKey] = useState(0);
  return (
    <div className="space-y-3 text-center">
      <motion.div key={key} initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.6 }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-xl border bg-background px-6 py-8 w-56">
        <p className="font-semibold">Featured tool</p>
        <p className="text-sm text-muted-foreground mt-1">Scroll-style reveal</p>
      </motion.div>
      <Button size="sm" variant="outline" onClick={() => setKey((k) => k + 1)}>Replay</Button>
    </div>
  );
}`,
		htmlCode: `<div class="reveal"><h3>Featured tool</h3><p>Scroll-style reveal</p></div>
<style>.reveal{animation:reveal .55s cubic-bezier(0.22,1,0.36,1) both;padding:32px;border:1px solid #e4e4e7;border-radius:12px}
@keyframes reveal{from{opacity:0;transform:translateY(32px)}to{opacity:1;transform:none}}</style>`,
	},
	{
		id: "popover-fade",
		name: "Popover fade",
		section: "overlays",
		description: "Lightweight popover scales and fades on trigger click.",
		reactCode: `import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";

export function PopoverFade() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <Button variant="outline" size="icon" onClick={() => setOpen((v) => !v)}><Info className="size-4" /></Button>
      <AnimatePresence>
        {open ? (
          <motion.div initial={{ opacity: 0, scale: 0.92, y: 4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 4 }}
            className="absolute bottom-full left-1/2 mb-2 w-48 -translate-x-1/2 rounded-lg border bg-background p-3 text-xs shadow-lg">
            Launch slots fill fast — book early for homepage placement.
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}`,
		htmlCode: `<button id="tip">ℹ</button><div id="pop" class="popover hidden">Launch slots fill fast.</div>
<style>.popover{position:absolute;bottom:calc(100% + 8px);padding:12px;border-radius:8px;border:1px solid #e4e4e7;background:white;font-size:12px;animation:pop-in .2s ease}
@keyframes pop-in{from{opacity:0;transform:scale(0.92) translateY(4px)}}</style>`,
	},
];

export const getComponentById = (id) =>
	COMPONENTS_CATALOG.find((c) => c.id === id) || COMPONENTS_CATALOG[0];

export const getComponentsBySection = (sectionId) =>
	COMPONENTS_CATALOG.filter((c) => c.section === sectionId);
