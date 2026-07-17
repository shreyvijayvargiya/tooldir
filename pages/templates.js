import React from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Navbar from "../app/frontend/Navbar";
import Footer from "../app/frontend/Footer";
import TemplatesBrowse from "../app/frontend/marketing/TemplatesBrowse";
import { isPresetSwitcherEnabled } from "@/lib/presets";

/**
 * Demo-only template browser: searchable grid → live preview on /demo.
 */
const TemplatesPage = () => {
	const router = useRouter();
	const isDemo = isPresetSwitcherEnabled();

	React.useEffect(() => {
		if (!isDemo) {
			router.replace("/");
		}
	}, [isDemo, router]);

	if (!isDemo) return null;

	return (
		<>
			<Head>
				<title>Browse directory templates — ToolDir</title>
				<meta
					name="description"
					content="Browse every niche landing template included with ToolDir — deals, Notion, jobs, courses, ebooks, and more."
				/>
				<meta name="robots" content="noindex, follow" />
			</Head>

			<div className="flex min-h-screen flex-col">
				<Navbar />
				<main className="flex-1">
					<TemplatesBrowse />
				</main>
				<Footer />
			</div>
		</>
	);
};

export default TemplatesPage;
