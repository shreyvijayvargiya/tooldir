import React from "react";
import Link from "next/link";
import SEO from "../lib/modules/SEO";
import { Button } from "@/components/ui/button";

export default function Custom404() {
	const customSEO = {
		title: "404 — Page Not Found — ToolDir",
		description: "The page you are looking for does not exist.",
		keywords: "404, page not found, error",
		ogImage: "/og-default.png",
		ogType: "website",
		noindex: true,
	};

	return (
		<>
			<SEO customSEO={customSEO} />
			<div className="min-h-screen bg-muted flex items-center justify-center px-4">
				<div className="text-center">
					<h1 className="text-6xl font-bold text-foreground mb-4">404</h1>
					<h2 className="text-2xl font-semibold text-foreground/80 mb-4">
						Page Not Found
					</h2>
					<p className="text-muted-foreground mb-8">
						The page you are looking for does not exist.
					</p>
					<Button asChild>
						<Link href="/">Go Back Home</Link>
					</Button>
				</div>
			</div>
		</>
	);
}
