import React from "react";
import Head from "next/head";
import Navbar from "../app/frontend/Navbar";
import Footer from "../app/frontend/Footer";
import { usePreset } from "@/lib/presets/PresetContext";
import { getLandingComponent } from "../app/frontend/landings";

/**
 * Home route — picks a niche landing from the active preset.
 * Navbar niche dropdown (demo) changes preset → this re-renders a different landing file.
 */
const HomePage = () => {
	const { preset } = usePreset();
	const Landing = getLandingComponent(preset);

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
