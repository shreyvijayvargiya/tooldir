import React from "react";
import Head from "next/head";
import Navbar from "../app/frontend/Navbar";
import Footer from "../app/frontend/Footer";
import { usePreset } from "@/lib/presets/PresetContext";
import { getLandingComponent } from "../app/frontend/landings";
import { isPresetSwitcherEnabled } from "@/lib/presets";
import ProductHome from "../app/frontend/marketing/ProductHome";

/**
 * Home:
 * - Demo site (PRESET_SWITCHER=true) → product marketing page
 * - Buyer / locked niche → niche landing (unchanged)
 * Niche previews live at /demo when the switcher is on.
 */
const HomePage = () => {
	const { preset } = usePreset();
	const showProductHome = isPresetSwitcherEnabled();
	const Landing = getLandingComponent(preset);

	if (showProductHome) {
		return (
			<>
				<Head>
					<title>
						ToolDir — Full-stack Directory Website Boilerplate
					</title>
					<meta
						name="description"
						content="Next.js + Supabase + Stripe boilerplate to launch niche directory and animated component sites. Preview templates, then buy on Gumroad."
					/>
				</Head>
				<div className="min-h-screen flex flex-col">
					<Navbar />
					<main className="flex-1">
						<ProductHome />
					</main>
					<Footer />
				</div>
			</>
		);
	}

	return (
		<>
			<Head>
				<title>{preset.seoTitle}</title>
				<meta name="description" content={preset.seoDescription} />
			</Head>

			<div className="min-h-screen flex flex-col">
				<Navbar />
				<main className="flex-1">
					<Landing key={preset.id} />
				</main>
				<Footer />
			</div>
		</>
	);
};

export default HomePage;
