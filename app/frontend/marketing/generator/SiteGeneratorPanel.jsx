import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
	Blocks,
	Download,
	ExternalLink,
	LayoutTemplate,
	Loader2,
	Lock,
	Package,
	Palette,
	Shapes,
	Sparkles,
	Terminal,
	Wand2,
} from "lucide-react";
import { PRESET_LIST } from "@/lib/presets";
import { usePreset } from "@/lib/presets/PresetContext";
import { getCurrentUserEmail } from "@/lib/utils/getCurrentUserEmail";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import GeneratedSitePreview from "./GeneratedSitePreview";
import { GUMROAD_TEMPLATE_URL } from "../ProductHome";
import { cn } from "@/lib/utils";

const PRESET_ICONS = {
	"ai-tools": Sparkles,
	"prompt-library": Terminal,
	"design-resources": Palette,
	"ui-inspiration": LayoutTemplate,
	resources: Package,
	"icons-library": Shapes,
	"components-library": Blocks,
};

const PRO_KEY_STORAGE = "tooldir-generator-pro-key";

/**
 * AI SiteSpec planner UI — preview free, download PRO.
 */
export default function SiteGeneratorPanel() {
	const { setPresetId, switcherEnabled } = usePreset();
	const [prompt, setPrompt] = useState(
		"A directory of open-source DevOps tools for indie hackers"
	);
	const [style, setStyle] = useState("minimal, developer-focused");
	const [mode, setMode] = useState("fullstack");
	const [loading, setLoading] = useState(false);
	const [downloading, setDownloading] = useState(false);
	const [spec, setSpec] = useState(null);
	const [planMeta, setPlanMeta] = useState(null);
	const [proAllowed, setProAllowed] = useState(false);
	const [proReason, setProReason] = useState("");
	const [proKey, setProKey] = useState("");
	const [email, setEmail] = useState("");

	useEffect(() => {
		try {
			const stored = window.localStorage.getItem(PRO_KEY_STORAGE);
			if (stored) setProKey(stored);
		} catch {
			/* ignore */
		}
		getCurrentUserEmail().then((e) => {
			if (e) setEmail(e);
		});
	}, []);

	const refreshPro = async (nextEmail = email, nextKey = proKey) => {
		try {
			const res = await fetch("/api/generator/pro-status", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email: nextEmail, proKey: nextKey }),
			});
			const data = await res.json();
			setProAllowed(Boolean(data.allowed));
			setProReason(data.reason || "");
		} catch {
			setProAllowed(false);
		}
	};

	useEffect(() => {
		refreshPro();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleGenerate = async (e) => {
		e?.preventDefault?.();
		if (!prompt.trim()) {
			toast.error("Describe the directory you want to build");
			return;
		}
		setLoading(true);
		try {
			const res = await fetch("/api/generator/plan", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ prompt, mode, style }),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Generation failed");
			setSpec(data.spec);
			setPlanMeta({ source: data.source, reason: data.reason, model: data.model });
			toast.success(
				data.source === "openrouter"
					? "Site planned with OpenRouter"
					: "Site planned (local fallback)"
			);
		} catch (err) {
			toast.error(err.message || "Could not generate plan");
		} finally {
			setLoading(false);
		}
	};

	const handleDownload = async () => {
		if (!spec) return;
		setDownloading(true);
		try {
			const res = await fetch("/api/generator/download", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					spec,
					mode: spec.mode,
					email,
					proKey,
				}),
			});

			if (res.status === 403) {
				const data = await res.json();
				toast.error("PRO required to download", {
					description: "Buy the ToolDir template, then unlock downloads.",
				});
				if (data.buyUrl) window.open(data.buyUrl, "_blank", "noopener");
				return;
			}

			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				throw new Error(data.error || "Download failed");
			}

			const blob = await res.blob();
			const disposition = res.headers.get("Content-Disposition") || "";
			const match = disposition.match(/filename="([^"]+)"/);
			const filename = match?.[1] || "tooldir-starter.zip";
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = filename;
			document.body.appendChild(a);
			a.click();
			a.remove();
			URL.revokeObjectURL(url);
			toast.success("Download started");
		} catch (err) {
			toast.error(err.message || "Download failed");
		} finally {
			setDownloading(false);
		}
	};

	const saveProKey = async () => {
		try {
			window.localStorage.setItem(PRO_KEY_STORAGE, proKey);
		} catch {
			/* ignore */
		}
		try {
			const res = await fetch("/api/generator/pro-status", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, proKey }),
			});
			const data = await res.json();
			setProAllowed(Boolean(data.allowed));
			setProReason(data.reason || "");
			toast.success(
				data.allowed ? "PRO unlocked for downloads" : "Still on free tier"
			);
		} catch {
			toast.error("Could not verify PRO status");
		}
	};

	return (
		<div className="space-y-10">
			<form
				onSubmit={handleGenerate}
				className="space-y-4 rounded-2xl border bg-background p-5 shadow-sm sm:p-6"
			>
				<div className="flex flex-wrap items-center gap-2">
					<Badge variant="secondary" className="gap-1">
						<Wand2 className="size-3" />
						AI SiteSpec planner
					</Badge>
					{proAllowed ? (
						<Badge className="bg-emerald-600 hover:bg-emerald-600">PRO unlocked</Badge>
					) : (
						<Badge variant="outline" className="gap-1">
							<Lock className="size-3" />
							Preview free · Download PRO
						</Badge>
					)}
				</div>

				<div className="space-y-2">
					<Label htmlFor="gen-prompt">Describe your directory</Label>
					<Textarea
						id="gen-prompt"
						value={prompt}
						onChange={(e) => setPrompt(e.target.value)}
						rows={3}
						placeholder="e.g. A directory of climate-tech startups with EU focus"
						className="resize-y"
					/>
				</div>

				<div className="grid gap-3 sm:grid-cols-2">
					<div className="space-y-2">
						<Label>Stack mode</Label>
						<Select value={mode} onValueChange={setMode}>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="fullstack">
									Full-stack (Next + Supabase + Stripe)
								</SelectItem>
								<SelectItem value="frontend">Frontend-focused starter</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div className="space-y-2">
						<Label htmlFor="gen-style">Style notes (optional)</Label>
						<Input
							id="gen-style"
							value={style}
							onChange={(e) => setStyle(e.target.value)}
							placeholder="minimal, playful, dark, etc."
						/>
					</div>
				</div>

				<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
					<Button type="submit" size="lg" disabled={loading}>
						{loading ? (
							<>
								<Loader2 className="size-4 animate-spin" />
								Planning…
							</>
						) : (
							<>
								<Wand2 className="size-4" />
								Generate plan &amp; preview
							</>
						)}
					</Button>
					{planMeta ? (
						<p className="text-xs text-muted-foreground">
							Source: {planMeta.source}
							{planMeta.model ? ` · ${planMeta.model}` : ""}
							{planMeta.reason ? ` · ${planMeta.reason}` : ""}
						</p>
					) : null}
				</div>
			</form>

			{/* PRO unlock helpers */}
			<Card className="border-dashed">
				<CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
					<div className="grid flex-1 gap-3 sm:grid-cols-2">
						<div className="space-y-1.5">
							<Label htmlFor="gen-email">Account email</Label>
							<Input
								id="gen-email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="you@email.com"
							/>
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="gen-key">PRO unlock key (optional)</Label>
							<Input
								id="gen-key"
								value={proKey}
								onChange={(e) => setProKey(e.target.value)}
								placeholder="GENERATOR_PRO_SECRET"
							/>
						</div>
					</div>
					<div className="flex gap-2">
						<Button type="button" variant="outline" onClick={saveProKey}>
							Check PRO
						</Button>
						<Button asChild variant="secondary">
							<a
								href={GUMROAD_TEMPLATE_URL}
								target="_blank"
								rel="noopener noreferrer"
							>
								Buy PRO
								<ExternalLink className="size-3.5 opacity-80" />
							</a>
						</Button>
					</div>
				</CardContent>
			</Card>

			{spec ? (
				<div className="space-y-4">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<div>
							<h3 className="text-lg font-semibold">Generated preview</h3>
							<p className="text-sm text-muted-foreground">
								Live SiteSpec render — download ships config + SEO/marketing docs
								{proAllowed ? "" : " (PRO)"}.
							</p>
						</div>
						<Button
							onClick={handleDownload}
							disabled={downloading}
							className={cn(!proAllowed && "opacity-90")}
						>
							{downloading ? (
								<Loader2 className="size-4 animate-spin" />
							) : proAllowed ? (
								<Download className="size-4" />
							) : (
								<Lock className="size-4" />
							)}
							{proAllowed ? "Download repository pack" : "Download (PRO)"}
						</Button>
					</div>
					<GeneratedSitePreview spec={spec} />
					{spec.cursorPrompt ? (
						<details className="rounded-xl border bg-muted/20 p-4 text-sm">
							<summary className="cursor-pointer font-medium">
								Cursor prompt (editable later in ZIP)
							</summary>
							<pre className="mt-3 whitespace-pre-wrap font-mono text-xs text-muted-foreground">
								{spec.cursorPrompt}
							</pre>
						</details>
					) : null}
				</div>
			) : null}

			{/* Existing templates */}
			<div className="space-y-4">
				<div>
					<h3 className="text-lg font-semibold">Current templates</h3>
					<p className="text-sm text-muted-foreground">
						Click to preview a niche landing. Repository download for templates
						is PRO (same Gumroad pack / unlock key).
					</p>
				</div>
				<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{PRESET_LIST.map((preset) => {
						const Icon = PRESET_ICONS[preset.id] || LayoutTemplate;
						return (
							<Card key={preset.id} className="overflow-hidden">
								<CardContent className="flex h-full flex-col gap-3 p-4">
									<div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
										<Icon className="size-4 text-primary" />
									</div>
									<div className="min-w-0 flex-1">
										<p className="font-semibold">{preset.brand}</p>
										<p className="text-xs text-muted-foreground">
											{preset.tagline}
										</p>
									</div>
									<div className="flex gap-2">
										<Button asChild size="sm" variant="outline" className="flex-1">
											<Link
												href="/demo"
												onClick={() => {
													if (switcherEnabled) setPresetId(preset.id);
												}}
											>
												Preview
											</Link>
										</Button>
										<Button
											size="sm"
											className="flex-1"
											variant={proAllowed ? "default" : "secondary"}
											onClick={async () => {
												if (!proAllowed) {
													toast.error("PRO required to download templates");
													window.open(
														GUMROAD_TEMPLATE_URL,
														"_blank",
														"noopener"
													);
													return;
												}
												// PRO users: generate a quick overlay for that template niche
												setLoading(true);
												try {
													const res = await fetch("/api/generator/plan", {
														method: "POST",
														headers: { "Content-Type": "application/json" },
														body: JSON.stringify({
															prompt: `${preset.brand}: ${preset.seoDescription}`,
															mode,
															style: preset.tagline,
														}),
													});
													const data = await res.json();
													if (!res.ok) throw new Error(data.error);
													const forced = {
														...data.spec,
														template: preset.id,
														brand: {
															...data.spec.brand,
															name: preset.brand,
															tagline: preset.tagline,
														},
													};
													setSpec(forced);
													setPlanMeta({
														source: data.source,
														reason: "template_click",
													});
													toast.success(`Prepared ${preset.brand} pack — download below`);
												} catch (err) {
													toast.error(err.message || "Failed");
												} finally {
													setLoading(false);
												}
											}}
										>
											{proAllowed ? (
												<>
													<Download className="size-3.5" />
													Prep ZIP
												</>
											) : (
												<>
													<Lock className="size-3.5" />
													PRO
												</>
											)}
										</Button>
									</div>
								</CardContent>
							</Card>
						);
					})}
				</div>
			</div>
		</div>
	);
}
