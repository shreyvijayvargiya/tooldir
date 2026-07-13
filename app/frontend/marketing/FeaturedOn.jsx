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
		href: "https://launchstag.com",
		src: "https://launchstag.com/badge-light.svg",
		alt: "Featured on Launchstag",
		width: 198,
		height: 62,
	},
];

/**
 * Always-on directory listing badges (footer).
 * Keep the Launchstag <img> in the page DOM so their embed checker can find it.
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
							rel="noopener noreferrer"
							className="shrink-0 transition-opacity hover:opacity-90"
						>
							<img
								src={item.src}
								alt={item.alt}
								width={item.width}
								height={item.height}
								className="h-[42px] w-auto"
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
