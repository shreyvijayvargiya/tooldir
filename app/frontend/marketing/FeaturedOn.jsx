import React from "react";
import { cn } from "@/lib/utils";

export const FEATURED_LISTINGS = [
	{
		id: "product-hunt",
		label: "Listed on Product Hunt",
		href: "https://www.producthunt.com",
	},
	{
		id: "launchstag",
		type: "badge",
		// Exact Launchstag embed (rel must be "noopener" for their checker)
		href: "https://launchstag.com",
		src: "https://launchstag.com/badge-light.svg",
		alt: "Featured on Launchstag",
		width: 198,
		height: 62,
	},
];

/**
 * Footer "Featured on" strip — badge stays in SSR HTML for directory checkers.
 */
export default function FeaturedOn({ className, scrollClassName }) {
	return (
		<div className={cn("space-y-2", className)}>
			<p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
				Featured on
			</p>
			<div
				className={cn(
					"flex max-w-xs items-center gap-3 overflow-x-auto pb-0.5 [scrollbar-width:thin]",
					scrollClassName
				)}
			>
				{FEATURED_LISTINGS.map((item) =>
					item.type === "badge" ? (
						<a
							key={item.id}
							href={item.href}
							target="_blank"
							rel="noopener"
						>
							<img
								src={item.src}
								alt={item.alt}
								width={item.width}
								height={item.height}
							/>
						</a>
					) : (
						<a
							key={item.id}
							href={item.href}
							target="_blank"
							rel="noopener noreferrer"
							className={cn(
								"shrink-0 rounded-xl border bg-muted/60 px-3 py-2",
								"text-xs font-medium text-foreground whitespace-nowrap",
								"transition-colors hover:bg-muted"
							)}
						>
							{item.label}
						</a>
					)
				)}
			</div>
		</div>
	);
}
