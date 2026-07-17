import React from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { ArrowLeft } from "lucide-react";
import Navbar from "../app/frontend/Navbar";
import Footer from "../app/frontend/Footer";
import { usePreset } from "@/lib/presets/PresetContext";
import { getLandingComponent } from "../app/frontend/landings";
import { isPresetSwitcherEnabled } from "@/lib/presets";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/**
 * Live niche template preview (demo site only).
 * Buyer installs keep niches on / — this route still works if opened.
 */
const DemoPage = () => {
	const router = useRouter();
	const { preset } = usePreset();
	const Landing = getLandingComponent(preset);
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
				<title>
					{preset.brand} template preview — ToolDir
				</title>
				<meta
					name="description"
					content={`Preview the ${preset.brand} niche landing template included with ToolDir.`}
				/>
				<meta name="robots" content="noindex, follow" />
			</Head>

			<div className="min-h-screen flex flex-col">
				<div className="sticky top-0 z-[60] border-b bg-background/95 backdrop-blur-md">
					<div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2 sm:px-6 lg:px-8">
						<div className="flex min-w-0 items-center gap-3">
							<Button asChild variant="ghost" size="sm" className="shrink-0">
								<Link href="/templates">
									<ArrowLeft className="size-4" />
									All templates
								</Link>
							</Button>
							<Badge variant="secondary" className="hidden sm:inline-flex">
								Live preview
							</Badge>
							<p className="truncate text-sm text-muted-foreground">
								<span className="font-medium text-foreground">
									{preset.brand}
								</span>
								{" — "}
								{preset.tagline}. Switch niches in the bottom dock.
							</p>
						</div>
						<Button asChild size="sm" className="shrink-0">
							<a
								href="https://shreyvijayvargiya.gumroad.com/l/nextjs-supabase-directory-boilerplate?layout=profile"
								target="_blank"
								rel="noopener noreferrer"
							>
								Buy template
							</a>
						</Button>
					</div>
				</div>
				<Navbar />
				<main className="flex-1">
					<Landing key={preset.id} />
				</main>
				<Footer />
			</div>
		</>
	);
};

export default DemoPage;
