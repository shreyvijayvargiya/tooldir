import React, { useState, useEffect } from "react";
import {
	ChevronLeft,
	ChevronRight,
	Check,
	Home,
	Mail,
	Share2,
	TrendingUp,
	Search,
	BarChart3,
	Tag,
	BadgeCheck,
	LayoutGrid,
	Twitter,
	Sparkles,
} from "lucide-react";
import {
	getSlotPricing,
	getCalendarDays,
	MONTH_NAMES,
	DAY_HEADERS,
	formatDateKey,
} from "@/lib/data/pricing-slots";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDisplayDateShort } from "@/lib/utils/formatDate";

const PERK_ICONS = [
	{ match: /homepage/i, icon: Home, className: "text-sky-500" },
	{ match: /newsletter|blast|mail/i, icon: Mail, className: "text-violet-500" },
	{ match: /social|share|tweet/i, icon: Share2, className: "text-blue-500" },
	{ match: /trending/i, icon: TrendingUp, className: "text-orange-500" },
	{ match: /search|indexing/i, icon: Search, className: "text-emerald-500" },
	{ match: /analytics|dashboard/i, icon: BarChart3, className: "text-indigo-500" },
	{ match: /tag|categor/i, icon: Tag, className: "text-amber-500" },
	{ match: /badge|submit/i, icon: BadgeCheck, className: "text-teal-500" },
	{ match: /directory|listing/i, icon: LayoutGrid, className: "text-rose-500" },
	{ match: /twitter|launch tweet/i, icon: Twitter, className: "text-sky-600" },
	{ match: /feature|spotlight|placement/i, icon: Sparkles, className: "text-primary" },
];

const getPerkIcon = (perk) => {
	const found = PERK_ICONS.find((item) => item.match.test(perk));
	if (found) return found;
	return { icon: Check, className: "text-primary" };
};

const PricingCalendar = ({
	onSelectSlot,
	selectedDate: controlledDate,
	compact = false,
	mini = false,
	calendarOnly = false,
	slotsMap = {},
}) => {
	const [mounted, setMounted] = useState(false);
	const [viewYear, setViewYear] = useState(null);
	const [viewMonth, setViewMonth] = useState(null);
	const [internalDate, setInternalDate] = useState(null);

	useEffect(() => {
		const today = new Date();
		setViewYear(today.getFullYear());
		setViewMonth(today.getMonth());
		if (!controlledDate) {
			setInternalDate(
				new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
			);
		}
		setMounted(true);
	}, [controlledDate]);

	const selectedDate = controlledDate || internalDate;

	const resolveSlot = (date) => {
		if (!date) return null;
		const key = formatDateKey(date);
		return slotsMap[key] || getSlotPricing(date);
	};

	const slotInfo = selectedDate ? resolveSlot(selectedDate) : null;
	const days =
		mounted && viewYear !== null && viewMonth !== null
			? getCalendarDays(viewYear, viewMonth)
			: [];

	const prevMonth = () => {
		if (viewMonth === 0) {
			setViewMonth(11);
			setViewYear((y) => y - 1);
		} else {
			setViewMonth((m) => m - 1);
		}
	};

	const nextMonth = () => {
		if (viewMonth === 11) {
			setViewMonth(0);
			setViewYear((y) => y + 1);
		} else {
			setViewMonth((m) => m + 1);
		}
	};

	const selectDay = (date) => {
		if (!controlledDate) setInternalDate(date);
		onSelectSlot?.(date, resolveSlot(date));
	};

	const isSelected = (date) =>
		date && selectedDate && formatDateKey(date) === formatDateKey(selectedDate);

	const isPast = (date) => {
		if (!date || !mounted) return false;
		const t = new Date();
		t.setHours(0, 0, 0, 0);
		return date < t;
	};

	if (!mounted || viewYear === null || viewMonth === null) {
		return (
			<div
				className={cn(
					"grid gap-4",
					calendarOnly
						? "grid-cols-1"
						: compact || mini
							? "grid-cols-1"
							: "grid-cols-1 lg:grid-cols-2",
					mini && "max-w-xl mx-auto"
				)}
			>
				<Card className={cn(calendarOnly && "border-0 shadow-none", mini && "text-sm")}>
					<CardContent className={cn("animate-pulse bg-muted/30 rounded-lg", mini ? "h-48 m-4" : "h-72 m-6")} />
				</Card>
			</div>
		);
	}

	return (
		<div
			className={cn(
				"grid gap-4",
				calendarOnly
					? "grid-cols-1"
					: compact || mini
						? "grid-cols-1"
						: "grid-cols-1 lg:grid-cols-2",
				mini && "max-w-xs mx-auto"
			)}
		>
			<Card
				className={cn(
					calendarOnly && "border-0 shadow-none",
					mini && "text-sm"
				)}
			>
				<CardHeader className={cn("pb-1", mini && "py-3 px-4")}>
					<div className="flex items-center justify-between">
						<Button
							variant="ghost"
							size={mini ? "icon" : "icon"}
							className={mini ? "h-7 w-7" : ""}
							onClick={prevMonth}
						>
							<ChevronLeft className="w-4 h-4" />
						</Button>
						<CardTitle className={cn("text-base", mini && "text-sm")}>
							{MONTH_NAMES[viewMonth]} {viewYear}
						</CardTitle>
						<Button
							variant="ghost"
							size="icon"
							className={mini ? "h-7 w-7" : ""}
							onClick={nextMonth}
						>
							<ChevronRight className="w-4 h-4" />
						</Button>
					</div>
				</CardHeader>
				<CardContent className={cn(mini && "px-4 pb-4 pt-0")}>
					<div className={cn("grid grid-cols-7 gap-0.5 mb-1", mini && "gap-px")}>
						{DAY_HEADERS.map((d) => (
							<div
								key={d}
								className={cn(
									"text-center text-xs font-medium text-muted-foreground",
									mini ? "py-0.5" : "py-1"
								)}
							>
								{mini ? d.charAt(0) : d}
							</div>
						))}
					</div>
					<div className={cn("grid grid-cols-7 gap-0.5", mini && "gap-px")}>
						{days.map((date, i) => (
							<div key={i} className={mini ? "h-8" : "aspect-square max-h-10"}>
								{date ? (
									<Button
										variant={isSelected(date) ? "default" : "ghost"}
										size="sm"
										disabled={isPast(date)}
										className={cn(
											"w-full h-full p-0",
											mini ? "text-xs h-8 min-h-0" : "text-sm",
											isPast(date) && "opacity-30"
										)}
										onClick={() => !isPast(date) && selectDay(date)}
									>
										{date.getDate()}
									</Button>
								) : null}
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{slotInfo && !calendarOnly && (
				<Card className={cn(mini && "text-sm")}>
					<CardHeader className={mini ? "py-3 px-4" : ""}>
						<div className="flex items-center justify-between">
							<CardTitle className={cn("text-lg", mini && "text-base")}>
								{slotInfo.label}
							</CardTitle>
							<Badge variant={slotInfo.isPaid ? "default" : "secondary"}>
								{slotInfo.isPaid ? `$${slotInfo.price}` : "Free"}
							</Badge>
						</div>
						{selectedDate && (
							<p className="text-sm text-muted-foreground">
								{formatDisplayDateShort(formatDateKey(selectedDate))}
							</p>
						)}
					</CardHeader>
					<CardContent className={cn("space-y-3", mini && "px-4 pb-4 pt-0")}>
						<p className="text-sm text-muted-foreground">{slotInfo.description}</p>
						<ul className="space-y-2">
							{slotInfo.perks.map((perk) => {
								const { icon: Icon, className: iconClass } = getPerkIcon(perk);
								return (
									<li key={perk} className="flex items-center gap-2.5 text-sm">
										<span
											className={cn(
												"flex h-7 w-7 shrink-0 items-center justify-center rounded-md border bg-muted/40",
												iconClass
											)}
										>
											<Icon className="w-3.5 h-3.5" />
										</span>
										{perk}
									</li>
								);
							})}
						</ul>
					</CardContent>
				</Card>
			)}
		</div>
	);
};

export default PricingCalendar;
