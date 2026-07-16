import React from "react";
import Head from "next/head";
import Link from "next/link";
import { ArrowLeft, Wand2 } from "lucide-react";
import Navbar from "../app/frontend/Navbar";
import Footer from "../app/frontend/Footer";
import SiteGeneratorPanel from "../app/frontend/marketing/generator/SiteGeneratorPanel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/**
 * AI directory generator — SiteSpec plan + preview (download PRO).
 */
const GeneratePage = () => {
	return (
		<>
			<Head>
				<title>AI Directory Generator — ToolDir</title>
				<meta
					name="description"
					content="Describe a niche directory. ToolDir plans a SiteSpec, previews it live, and lets PRO users download a starter repository pack."
				/>
			</Head>

			<div className="flex min-h-screen flex-col">
				<Navbar />
				<main className="flex-1">
					<section className="border-b px-4 py-10 sm:px-6 lg:px-8">
						<div className="mx-auto max-w-5xl">
							<Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
								<Link href="/">
									<ArrowLeft className="size-4" />
									Back to product
								</Link>
							</Button>
							<Badge variant="secondary" className="mb-3 gap-1">
								<Wand2 className="size-3" />
								Generator
							</Badge>
							<h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
								Generate your directory starter
							</h1>
							<p className="mt-3 max-w-2xl text-muted-foreground">
								One prompt → structured SiteSpec (not free-form AI code). Preview
								is free. Download the repository overlay, SEO/blog ideas, marketing
								directories, and Cursor prompt with PRO.
							</p>
						</div>
					</section>

					<section className="px-4 py-10 pb-28 sm:px-6 lg:px-8">
						<div className="mx-auto max-w-5xl">
							<SiteGeneratorPanel />
						</div>
					</section>
				</main>
				<Footer />
			</div>
		</>
	);
};

export default GeneratePage;
