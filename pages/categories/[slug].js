import React from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { ChevronRight } from "lucide-react";
import Navbar from "../../app/frontend/Navbar";
import Footer from "../../app/frontend/Footer";
import ToolsDirectoryTable from "../../app/frontend/marketing/ToolsDirectoryTable";
import CategoryChips from "../../app/frontend/marketing/CategoryChips";
import SubmitToolCard from "../../app/frontend/marketing/SubmitToolCard";
import { usePreset } from "@/lib/presets/PresetContext";
import { PRESET_LIST } from "@/lib/presets";

const allCategoryMeta = () => {
	const map = new Map();
	for (const p of PRESET_LIST) {
		for (const c of p.categoryMeta || []) {
			if (!map.has(c.slug)) map.set(c.slug, c);
		}
	}
	return [...map.values()];
};

const findCategoryBySlug = (slug) =>
	allCategoryMeta().find((c) => c.slug === slug) || null;

export async function getStaticPaths() {
	return {
		paths: allCategoryMeta().map((c) => ({ params: { slug: c.slug } })),
		fallback: false,
	};
}

export async function getStaticProps({ params }) {
	const category = findCategoryBySlug(params.slug);
	if (!category) {
		return { notFound: true };
	}
	return {
		props: {
			category,
		},
	};
}

const CategoryPage = ({ category }) => {
	const router = useRouter();
	const { preset } = usePreset();
	const activeSlug = category?.slug || router.query.slug;

	if (!category) return null;

	return (
		<>
			<Head>
				<title>
					{category.name} — {preset.brand}
				</title>
				<meta
					name="description"
					content={`Browse ${category.name} ${preset.entityPlural} in ${preset.brand}. Search, filter, and discover the best listings.`}
				/>
			</Head>

			<div className="min-h-screen flex flex-col">
				<Navbar />

				<section className="py-10 px-4 sm:px-6 lg:px-8 border-b bg-muted/30">
					<div className="max-w-7xl mx-auto">
						<nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
							<Link href="/" className="hover:text-foreground transition-colors">
								Home
							</Link>
							<ChevronRight className="w-3.5 h-3.5" />
							<Link
								href="/#trending"
								className="hover:text-foreground transition-colors"
							>
								Categories
							</Link>
							<ChevronRight className="w-3.5 h-3.5" />
							<span className="text-foreground font-medium">{category.name}</span>
						</nav>

						<h1 className="text-3xl font-bold text-foreground mb-2">
							{category.name}
						</h1>
						<p className="text-muted-foreground text-sm mb-6 max-w-2xl">
							Explore {category.name.toLowerCase()} {preset.entityPlural} ranked
							by community upvotes. Use search and filters to narrow results.
						</p>

						<CategoryChips activeSlug={activeSlug} />
					</div>
				</section>

				<section className="flex-1 py-10 px-4 sm:px-6 lg:px-8">
					<div className="max-w-7xl mx-auto space-y-10">
						<ToolsDirectoryTable
							initialCategories={[category.name]}
							showSubmitCta={false}
						/>

						<SubmitToolCard />
					</div>
				</section>

				<Footer />
			</div>
		</>
	);
};

export default CategoryPage;
