import React from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Footer from "../app/frontend/Footer";
import TemplatesBrowse from "../app/frontend/marketing/TemplatesBrowse";
import { isPresetSwitcherEnabled } from "@/lib/presets";

/**
 * Demo-only template browser: search, filter chips, live preview, Gumroad CTA.
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
					content="Search and preview every niche landing template included with ToolDir — deals, Notion, jobs, courses, and more."
				/>
				<meta name="robots" content="noindex, follow" />
			</Head>

			<div className="min-h-screen flex flex-col">
				<main className="flex-1">
					<TemplatesBrowse />
				</main>
				<Footer />
			</div>
		</>
	);
};

export default TemplatesPage;
