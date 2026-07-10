import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import {
	Check,
	ChevronRight,
	ChevronLeft,
	Upload,
	Copy,
	Shield,
	Calendar,
	Sparkles,
	X,
	FileText,
	ClipboardCheck,
	Globe,
	ImageIcon,
	Tag,
	ExternalLink,
} from "lucide-react";
import Navbar from "../app/frontend/Navbar";
import Footer from "../app/frontend/Footer";
import PricingCalendar from "../app/frontend/marketing/PricingCalendar";
import { TOOL_CATEGORIES } from "@/lib/data/tools";
import { formatDateKey, getSlotPricing } from "@/lib/data/pricing-slots";
import { usePricingSlots } from "@/lib/hooks/usePricingSlots";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const STEPS = [
	{ label: "Tool Details", icon: FileText },
	{ label: "Add Badge", icon: Shield },
	{ label: "Book Slot", icon: Calendar },
	{ label: "Review", icon: ClipboardCheck },
];

const BADGE_SCRIPT = `<a href="https://tooldir.com" target="_blank" rel="noopener">
  <img src="https://tooldir.com/badge.svg" alt="Featured on ToolDir" width="200" height="54" />
</a>`;

const ImagePreview = ({ src, alt, onRemove, className }) => (
	<div className={cn("relative group shrink-0", className)}>
		<img
			src={src}
			alt={alt}
			className="h-24 w-24 rounded-xl object-cover border bg-muted"
		/>
		<Button
			type="button"
			variant="destructive"
			size="icon"
			className="absolute -top-2 -right-2 h-6 w-6 rounded-full shadow-sm"
			onClick={onRemove}
			aria-label={`Remove ${alt}`}
		>
			<X className="h-3.5 w-3.5" />
		</Button>
	</div>
);

const SubmitPage = () => {
	const router = useRouter();
	const { data: slotsMap = {} } = usePricingSlots();
	const [step, setStep] = useState(0);
	const [showReview, setShowReview] = useState(false);
	const [badgeVerified, setBadgeVerified] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isAutoFilling, setIsAutoFilling] = useState(false);

	const [form, setForm] = useState({
		name: "",
		website: "",
		description: "",
		tags: [],
		logo: null,
		logoPreview: null,
		screenshots: [],
		screenshotPreviews: [],
	});
	const [tagInput, setTagInput] = useState("");
	const [selectedDate, setSelectedDate] = useState(null);
	const [slotInfo, setSlotInfo] = useState(null);

	useEffect(() => {
		const tomorrow = new Date();
		tomorrow.setHours(0, 0, 0, 0);
		tomorrow.setDate(tomorrow.getDate() + 1);
		setSelectedDate(tomorrow);
		setSlotInfo(getSlotPricing(tomorrow));
	}, []);

	const updateForm = (key, value) => setForm((f) => ({ ...f, [key]: value }));

	const handleLogo = (e) => {
		const file = e.target.files?.[0];
		if (!file) return;
		if (form.logoPreview) URL.revokeObjectURL(form.logoPreview);
		updateForm("logo", file);
		updateForm("logoPreview", URL.createObjectURL(file));
		e.target.value = "";
	};

	const removeLogo = () => {
		if (form.logoPreview) URL.revokeObjectURL(form.logoPreview);
		updateForm("logo", null);
		updateForm("logoPreview", null);
	};

	const handleScreenshots = (e) => {
		const files = Array.from(e.target.files || []);
		if (!files.length) return;
		const nextFiles = [...form.screenshots, ...files].slice(0, 6);
		const nextPreviews = [
			...form.screenshotPreviews,
			...files.map((f) => URL.createObjectURL(f)),
		].slice(0, 6);
		updateForm("screenshots", nextFiles);
		updateForm("screenshotPreviews", nextPreviews);
		e.target.value = "";
	};

	const removeScreenshot = (index) => {
		const preview = form.screenshotPreviews[index];
		if (preview) URL.revokeObjectURL(preview);
		updateForm(
			"screenshots",
			form.screenshots.filter((_, i) => i !== index)
		);
		updateForm(
			"screenshotPreviews",
			form.screenshotPreviews.filter((_, i) => i !== index)
		);
	};

	const addTag = (tag) => {
		const t = tag.trim();
		if (t && !form.tags.includes(t) && form.tags.length < 5) {
			updateForm("tags", [...form.tags, t]);
		}
		setTagInput("");
	};

	const removeTag = (tag) => {
		updateForm(
			"tags",
			form.tags.filter((t) => t !== tag)
		);
	};

	const handleAiAutofill = async () => {
		const url = form.website?.trim();
		if (!url) {
			toast.warning("Enter a website URL first");
			return;
		}

		setIsAutoFilling(true);
		try {
			let hostname = url;
			try {
				hostname = new URL(url.startsWith("http") ? url : `https://${url}`).hostname;
			} catch {
				/* keep raw */
			}

			const brand = hostname
				.replace(/^www\./, "")
				.split(".")[0]
				.replace(/[-_]/g, " ")
				.replace(/\b\w/g, (c) => c.toUpperCase());

			await new Promise((r) => setTimeout(r, 600));

			setForm((f) => ({
				...f,
				name: f.name || brand,
				description:
					f.description ||
					`${brand} is an AI-powered tool that helps teams work faster. Paste your real product pitch here after reviewing this draft.`,
				tags:
					f.tags.length > 0
						? f.tags
						: ["AI", "Productivity"].slice(0, 5),
				website: url.startsWith("http") ? url : `https://${url}`,
			}));
			toast.success("Draft details filled from your URL — edit as needed");
		} catch {
			toast.error("Could not auto-fill. Try again.");
		} finally {
			setIsAutoFilling(false);
		}
	};

	const copyBadge = () => {
		navigator.clipboard.writeText(BADGE_SCRIPT);
		toast.success("Badge script copied to clipboard!");
	};

	const verifyBadge = () => {
		setBadgeVerified(true);
		toast.success("Badge verified! You can proceed to book your slot.");
	};

	const canProceed = () => {
		if (step === 0) {
			return form.name && form.website && form.description && form.tags.length > 0;
		}
		if (step === 1) return badgeVerified;
		if (step === 2) return selectedDate && slotInfo;
		return true;
	};

	const handleBookSlot = () => {
		if (slotInfo.isPaid) {
			toast.info(
				`Proceed to pay $${slotInfo.price} for your ${slotInfo.label} slot`
			);
		} else {
			toast.success("Free slot reserved! Review your submission below.");
		}
		setShowReview(true);
	};

	const handleSubmit = async () => {
		setIsSubmitting(true);
		try {
			const res = await fetch("/api/tool-submissions/create", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: form.name,
					website: form.website,
					description: form.description,
					tags: form.tags,
					logoUrl: form.logoPreview || null,
					screenshotUrl: form.screenshotPreviews[0] || null,
					screenshotUrls: form.screenshotPreviews,
					badgeVerified,
					launchDate: selectedDate ? formatDateKey(selectedDate) : null,
					slotLabel: slotInfo?.label,
					slotPrice: slotInfo?.price ?? 0,
					slotIsPaid: slotInfo?.isPaid ?? false,
				}),
			});
			const data = await res.json();
			if (!res.ok) {
				throw new Error(data.error || "Submission failed");
			}
			toast.success("Tool submitted successfully! We'll review within 24 hours.");
			router.push("/");
		} catch (err) {
			toast.error(err.message || "Submission failed. Please try again.");
		} finally {
			setIsSubmitting(false);
			setShowReview(false);
		}
	};

	return (
		<>
			<Head>
				<title>Submit Your Tool — ToolDir</title>
				<meta
					name="description"
					content="Submit your AI tool to ToolDir. Upload details, add our badge, and book a launch slot."
				/>
			</Head>

			<div className="min-h-screen flex flex-col">
				<Navbar />

				<section className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
					<div className="max-w-2xl mx-auto">
						<div className="text-center mb-8">
							<h1 className="text-3xl font-bold text-foreground mb-2">
								Submit Your AI Tool
							</h1>
							<p className="text-muted-foreground text-sm">
								Complete all steps to get listed on ToolDir
							</p>
						</div>

						{/* Stepper: icon + label (no numbers) */}
						<div className="flex w-full mb-8">
							{STEPS.map((item, i) => {
								const Icon = item.icon;
								const done = i < step;
								const active = i === step;
								return (
									<div
										key={item.label}
										className={cn(
											"flex flex-col items-center",
											i < STEPS.length - 1 ? "flex-1" : "shrink-0"
										)}
									>
										<div className="flex w-full items-center">
											<div
												className={cn(
													"h-10 px-2.5 rounded-full flex items-center justify-center gap-1.5 text-xs font-medium border-2 shrink-0",
													done || active
														? "bg-primary text-primary-foreground border-primary"
														: "bg-muted text-muted-foreground border-border"
												)}
											>
												{done ? (
													<Check className="w-4 h-4" />
												) : (
													<Icon className="w-4 h-4" />
												)}
												<span className="hidden sm:inline whitespace-nowrap">
													{item.label}
												</span>
											</div>
											{i < STEPS.length - 1 && (
												<div
													className={cn(
														"flex-1 h-0.5 mx-2",
														i < step ? "bg-primary" : "bg-border"
													)}
												/>
											)}
										</div>
										<span
											className={cn(
												"mt-2 text-xs text-center sm:hidden px-1",
												active
													? "text-foreground font-medium"
													: "text-muted-foreground"
											)}
										>
											{item.label}
										</span>
									</div>
								);
							})}
						</div>

						<Card>
							<CardContent className="p-6">
								{step === 0 && (
									<div className="space-y-5">
										<div className="space-y-2">
											<Label htmlFor="name">Tool Name *</Label>
											<Input
												id="name"
												placeholder="e.g. Cursor"
												value={form.name}
												onChange={(e) => updateForm("name", e.target.value)}
											/>
										</div>

										<div className="space-y-2">
											<Label htmlFor="website">Website URL *</Label>
											<div className="flex gap-2 items-center">
												<Input
													id="website"
													type="url"
													className="flex-1"
													placeholder="https://yourtool.com"
													value={form.website}
													onChange={(e) =>
														updateForm("website", e.target.value)
													}
												/>
												<Button
													type="button"
													variant="outline"
													className="shrink-0 gap-1.5"
													onClick={handleAiAutofill}
													disabled={isAutoFilling}
												>
													<Sparkles className="w-4 h-4" />
													{isAutoFilling ? "Filling…" : "AI Auto Fill"}
												</Button>
											</div>
										</div>

										<div className="space-y-2">
											<Label htmlFor="description">Description *</Label>
											<Textarea
												id="description"
												placeholder="What does your tool do?"
												rows={4}
												value={form.description}
												onChange={(e) =>
													updateForm("description", e.target.value)
												}
											/>
										</div>

										{/* Logo + screenshots on their own row */}
										<div className="space-y-3">
											<div className="space-y-2">
												<Label>Logo</Label>
												<div className="flex flex-wrap gap-3 items-start">
													{form.logoPreview ? (
														<ImagePreview
															src={form.logoPreview}
															alt="Logo"
															onRemove={removeLogo}
														/>
													) : (
														<label className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-4 cursor-pointer hover:bg-muted/50 transition-colors h-24 w-24">
															<Upload className="w-5 h-5 text-muted-foreground mb-1" />
															<span className="text-[10px] text-muted-foreground text-center">
																Upload logo
															</span>
															<input
																type="file"
																accept="image/*"
																className="hidden"
																onChange={handleLogo}
															/>
														</label>
													)}
												</div>
											</div>

											<div className="space-y-2">
												<Label>Screenshots</Label>
												<div className="flex flex-wrap gap-3 items-start">
													{form.screenshotPreviews.map((src, i) => (
														<ImagePreview
															key={`${src}-${i}`}
															src={src}
															alt={`Screenshot ${i + 1}`}
															onRemove={() => removeScreenshot(i)}
														/>
													))}
													{form.screenshotPreviews.length < 6 && (
														<label className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-4 cursor-pointer hover:bg-muted/50 transition-colors h-24 w-24">
															<Upload className="w-5 h-5 text-muted-foreground mb-1" />
															<span className="text-[10px] text-muted-foreground text-center">
																Add image
															</span>
															<input
																type="file"
																accept="image/*"
																multiple
																className="hidden"
																onChange={handleScreenshots}
															/>
														</label>
													)}
												</div>
												<p className="text-xs text-muted-foreground">
													Up to 6 screenshots
												</p>
											</div>
										</div>

										<div className="space-y-2">
											<Label>Tags * (up to 5)</Label>
											<div className="flex gap-2">
												<Input
													placeholder="Add a tag..."
													value={tagInput}
													onChange={(e) => setTagInput(e.target.value)}
													onKeyDown={(e) => {
														if (e.key === "Enter") {
															e.preventDefault();
															addTag(tagInput);
														}
													}}
												/>
												<Button
													type="button"
													variant="outline"
													onClick={() => addTag(tagInput)}
												>
													Add
												</Button>
											</div>
											<div className="flex flex-wrap gap-2 mt-2">
												{form.tags.map((tag) => (
													<Badge
														key={tag}
														variant="secondary"
														className="cursor-pointer"
														onClick={() => removeTag(tag)}
													>
														{tag} ×
													</Badge>
												))}
											</div>
											<div className="flex flex-wrap gap-1 mt-1">
												{TOOL_CATEGORIES.slice(0, 4).map((cat) => (
													<Button
														key={cat}
														type="button"
														variant="ghost"
														size="sm"
														className="text-xs h-7"
														onClick={() => addTag(cat)}
													>
														+ {cat}
													</Button>
												))}
											</div>
										</div>
									</div>
								)}

								{step === 1 && (
									<div className="space-y-5">
										<div className="flex items-center gap-2 text-sm text-muted-foreground">
											<Shield className="w-4 h-4" />
											Add our badge to your website to verify your listing
										</div>

										<div className="grid grid-cols-2 gap-4">
											<Card className="bg-zinc-950 border-zinc-800">
												<CardHeader className="pb-2">
													<CardTitle className="text-sm text-zinc-400">
														Dark Badge
													</CardTitle>
												</CardHeader>
												<CardContent>
													<div className="bg-zinc-900 rounded-lg p-3 text-center">
														<span className="text-xs text-white font-medium">
															Featured on ToolDir
														</span>
													</div>
												</CardContent>
											</Card>
											<Card>
												<CardHeader className="pb-2">
													<CardTitle className="text-sm">Light Badge</CardTitle>
												</CardHeader>
												<CardContent>
													<div className="bg-muted rounded-lg p-3 text-center border">
														<span className="text-xs font-medium">
															Featured on ToolDir
														</span>
													</div>
												</CardContent>
											</Card>
										</div>

										<div className="space-y-2">
											<Label>Embed Script</Label>
											<div className="relative">
												<pre className="bg-muted rounded-lg p-3 text-xs overflow-x-auto border">
													{BADGE_SCRIPT}
												</pre>
												<Button
													type="button"
													variant="outline"
													size="sm"
													className="absolute top-2 right-2"
													onClick={copyBadge}
												>
													<Copy className="w-3.5 h-3.5" />
													Copy
												</Button>
											</div>
										</div>

										<Button
											type="button"
											onClick={verifyBadge}
											disabled={badgeVerified}
											className="w-full"
										>
											{badgeVerified ? (
												<>
													<Check className="w-4 h-4" />
													Badge Verified
												</>
											) : (
												"Verify Badge"
											)}
										</Button>
									</div>
								)}

								{step === 2 && (
									<div className="space-y-5">
										<div className="flex items-center gap-2 text-sm text-muted-foreground">
											<Calendar className="w-4 h-4" />
											Choose your launch date
										</div>

										<Popover>
											<PopoverTrigger asChild>
												<Button
													variant="outline"
													className="w-full justify-start"
												>
													<Calendar className="w-4 h-4 mr-2" />
													{selectedDate
														? selectedDate.toLocaleDateString("en-US", {
																weekday: "long",
																month: "long",
																day: "numeric",
																year: "numeric",
															})
														: "Pick a date"}
												</Button>
											</PopoverTrigger>
											<PopoverContent className="w-auto p-2" align="start">
												<PricingCalendar
													calendarOnly
													selectedDate={selectedDate}
													slotsMap={slotsMap}
													onSelectSlot={(date, info) => {
														setSelectedDate(date);
														setSlotInfo(info);
													}}
												/>
											</PopoverContent>
										</Popover>

										{slotInfo && (
											<Card>
												<CardContent className="p-4">
													<div className="flex items-center justify-between mb-2">
														<span className="font-medium">{slotInfo.label}</span>
														<Badge>
															{slotInfo.isPaid
																? `$${slotInfo.price}`
																: "Free"}
														</Badge>
													</div>
													<p className="text-sm text-muted-foreground mb-3">
														{slotInfo.description}
													</p>
													<Button
														type="button"
														className="w-full"
														onClick={handleBookSlot}
													>
														{slotInfo.isPaid
															? `Pay $${slotInfo.price} & Book Slot`
															: "Book Free Slot"}
													</Button>
												</CardContent>
											</Card>
										)}
									</div>
								)}

								{step === 3 && (
									<div className="text-center py-8">
										<Check className="w-12 h-12 text-primary mx-auto mb-4" />
										<p className="text-foreground font-medium mb-2">
											Almost done!
										</p>
										<p className="text-sm text-muted-foreground mb-4">
											Review your submission and submit for approval.
										</p>
										<Button onClick={() => setShowReview(true)}>
											Review Submission
										</Button>
									</div>
								)}
							</CardContent>
						</Card>

						<div className="flex justify-between mt-6">
							<Button
								variant="outline"
								onClick={() => setStep((s) => Math.max(0, s - 1))}
								disabled={step === 0}
							>
								<ChevronLeft className="w-4 h-4" />
								Back
							</Button>
							{step < 3 ? (
								<Button
									onClick={() => {
										if (!canProceed()) {
											toast.warning("Please complete all required fields");
											return;
										}
										if (step === 2) {
											handleBookSlot();
										}
										setStep((s) => s + 1);
									}}
									disabled={!canProceed()}
								>
									Next
									<ChevronRight className="w-4 h-4" />
								</Button>
							) : (
								<Button onClick={() => setShowReview(true)}>
									Review & Submit
								</Button>
							)}
						</div>
					</div>
				</section>

				<Footer />
			</div>

			{/* Review Modal */}
			<Dialog open={showReview} onOpenChange={setShowReview}>
				<DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Review Your Submission</DialogTitle>
						<DialogDescription>
							Confirm everything looks right before we review your listing.
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4">
						<div className="flex items-start gap-4 rounded-xl border bg-muted/40 p-4">
							{form.logoPreview ? (
								<img
									src={form.logoPreview}
									alt=""
									className="w-14 h-14 rounded-xl object-contain border bg-background shrink-0"
								/>
							) : (
								<div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary text-lg shrink-0">
									{form.name?.[0] || "?"}
								</div>
							)}
							<div className="min-w-0 flex-1 space-y-1">
								<p className="font-semibold text-lg leading-tight truncate">
									{form.name}
								</p>
								<a
									href={form.website}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center gap-1 text-sm text-primary hover:underline truncate max-w-full"
								>
									<Globe className="w-3.5 h-3.5 shrink-0" />
									<span className="truncate">{form.website}</span>
									<ExternalLink className="w-3 h-3 shrink-0 opacity-60" />
								</a>
							</div>
						</div>

						<div className="space-y-2">
							<div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
								<FileText className="w-3.5 h-3.5" />
								Description
							</div>
							<p className="text-sm text-foreground leading-relaxed">
								{form.description}
							</p>
						</div>

						{form.tags.length > 0 && (
							<div className="space-y-2">
								<div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
									<Tag className="w-3.5 h-3.5" />
									Tags
								</div>
								<div className="flex flex-wrap gap-1.5">
									{form.tags.map((tag) => (
										<Badge key={tag} variant="secondary">
											{tag}
										</Badge>
									))}
								</div>
							</div>
						)}

						{form.screenshotPreviews.length > 0 && (
							<div className="space-y-2">
								<div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
									<ImageIcon className="w-3.5 h-3.5" />
									Screenshots ({form.screenshotPreviews.length})
								</div>
								<div className="flex flex-wrap gap-2">
									{form.screenshotPreviews.map((src, i) => (
										<img
											key={`${src}-${i}`}
											src={src}
											alt={`Screenshot ${i + 1}`}
											className="h-16 w-16 rounded-lg object-cover border"
										/>
									))}
								</div>
							</div>
						)}

						<Separator />

						<div className="grid gap-3 sm:grid-cols-2">
							{selectedDate && slotInfo && (
								<Card className="shadow-none">
									<CardHeader className="p-3 pb-1">
										<CardTitle className="text-sm flex items-center gap-1.5">
											<Calendar className="w-3.5 h-3.5" />
											Launch Slot
										</CardTitle>
										<CardDescription className="text-xs">
											{selectedDate.toLocaleDateString("en-US", {
												month: "short",
												day: "numeric",
												year: "numeric",
											})}
										</CardDescription>
									</CardHeader>
									<CardContent className="p-3 pt-0">
										<div className="flex items-center justify-between gap-2">
											<span className="text-sm font-medium">
												{slotInfo.label}
											</span>
											<Badge variant={slotInfo.isPaid ? "default" : "secondary"}>
												{slotInfo.isPaid ? `$${slotInfo.price}` : "Free"}
											</Badge>
										</div>
									</CardContent>
								</Card>
							)}

							<Card className="shadow-none">
								<CardHeader className="p-3 pb-1">
									<CardTitle className="text-sm flex items-center gap-1.5">
										<Shield className="w-3.5 h-3.5" />
										Badge
									</CardTitle>
								</CardHeader>
								<CardContent className="p-3 pt-0">
									{badgeVerified ? (
										<p className="text-sm text-green-600 dark:text-green-500 flex items-center gap-1.5">
											<Check className="w-4 h-4" />
											Verified
										</p>
									) : (
										<p className="text-sm text-muted-foreground">Not verified</p>
									)}
								</CardContent>
							</Card>
						</div>
					</div>

					<DialogFooter className="gap-2 sm:gap-0">
						<Button variant="outline" onClick={() => setShowReview(false)}>
							Edit
						</Button>
						<Button onClick={handleSubmit} disabled={isSubmitting}>
							{isSubmitting ? "Submitting..." : "Submit Tool"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
};

export default SubmitPage;
