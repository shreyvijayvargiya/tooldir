import React, { useMemo } from "react";
import { TESTIMONIALS } from "@/lib/data/testimonials";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const TestimonialCard = ({ testimonial }) => (
	<Card className="w-full shrink-0 my-3">
		<CardContent className="p-5">
			<p className="text-sm text-foreground mb-4 leading-relaxed">
				&ldquo;{testimonial.quote}&rdquo;
			</p>
			<div className="flex items-center gap-3">
				<div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
					{testimonial.avatar}
				</div>
				<div>
					<p className="text-sm font-medium">{testimonial.name}</p>
					<p className="text-xs text-muted-foreground">{testimonial.role}</p>
				</div>
			</div>
		</CardContent>
	</Card>
);

const MarqueeColumn = ({ items, reverse = false, duration = "45s" }) => {
	const doubled = [...items, ...items];

	return (
		<div className="relative flex-1 min-w-0 overflow-hidden h-full">
			<div
				className={cn(
					"marquee-track-vertical px-2",
					reverse && "marquee-track-vertical-reverse"
				)}
				style={{ animationDuration: duration }}
			>
				{doubled.map((t, i) => (
					<TestimonialCard key={`${t.id}-${i}`} testimonial={t} />
				))}
			</div>
		</div>
	);
};

const TestimonialsMarquee = () => {
	const columns = useMemo(() => {
		const left = [];
		const center = [];
		const right = [];
		TESTIMONIALS.forEach((t, i) => {
			if (i % 3 === 0) left.push(t);
			else if (i % 3 === 1) center.push(t);
			else right.push(t);
		});
		// Ensure each column has enough cards to scroll smoothly
		const pad = (col) =>
			col.length >= 3 ? col : [...col, ...TESTIMONIALS].slice(0, 4);
		return [pad(left), pad(center), pad(right)];
	}, []);

	return (
		<div className="relative overflow-hidden h-[560px] sm:h-[620px]">
			<div className="absolute left-0 right-0 top-0 h-20 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none" />
			<div className="absolute left-0 right-0 bottom-0 h-20 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />
			<div className="absolute inset-y-0 left-0 w-8 sm:w-16 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
			<div className="absolute inset-y-0 right-0 w-8 sm:w-16 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

			<div className="flex gap-3 sm:gap-4 h-full">
				{/* Left column — extra grid row */}
				<div className="hidden md:block flex-1 min-w-0 h-full">
					<MarqueeColumn items={columns[0]} duration="50s" />
				</div>
				{/* Center */}
				<div className="flex-1 min-w-0 h-full">
					<MarqueeColumn items={columns[1]} reverse duration="42s" />
				</div>
				{/* Right column — extra grid row */}
				<div className="hidden md:block flex-1 min-w-0 h-full">
					<MarqueeColumn items={columns[2]} duration="48s" />
				</div>
			</div>
		</div>
	);
};

export default TestimonialsMarquee;
