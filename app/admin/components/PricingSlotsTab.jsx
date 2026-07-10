import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Save, DollarSign } from "lucide-react";
import PricingCalendar from "../../frontend/marketing/PricingCalendar";
import { getSlotPricing, formatDateKey } from "../../../lib/data/pricing-slots";
import { usePricingSlots } from "../../../lib/hooks/usePricingSlots";
import { isSupabaseConfigured } from "../../../lib/config/supabase";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const PricingSlotsTab = ({ queryClient }) => {
	const tomorrow = new Date();
	tomorrow.setDate(tomorrow.getDate() + 1);

	const [selectedDate, setSelectedDate] = useState(tomorrow);
	const [form, setForm] = useState(getSlotPricing(tomorrow));
	const [perksText, setPerksText] = useState(
		getSlotPricing(tomorrow).perks.join("\n")
	);

	const { data: slotsMap = {}, refetch } = usePricingSlots();

	const getSlotForDate = (date) => {
		const key = formatDateKey(date);
		return slotsMap[key] || getSlotPricing(date);
	};

	useEffect(() => {
		const slot = getSlotForDate(selectedDate);
		setForm(slot);
		setPerksText((slot.perks || []).join("\n"));
	}, [selectedDate, slotsMap]);

	const saveMutation = useMutation({
		mutationFn: async () => {
			const res = await fetch("/api/pricing-slots/upsert", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					slotDate: formatDateKey(selectedDate),
					price: Number(form.price) || 0,
					label: form.label,
					description: form.description,
					isPaid: form.isPaid,
					perks: perksText.split("\n").filter(Boolean),
				}),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Save failed");
			return data;
		},
		onSuccess: () => {
			refetch();
			queryClient.invalidateQueries({ queryKey: ["pricingSlots"] });
			toast.success("Pricing slot saved! Frontend will reflect this date.");
		},
		onError: (err) => toast.error(err.message),
	});

	return (
		<div className="p-6 space-y-6">
			<div>
				<h1 className="text-xl font-bold text-foreground flex items-center gap-2">
					<DollarSign className="w-5 h-5" />
					Launch Slot Pricing
				</h1>
				<p className="text-sm text-muted-foreground mt-1">
					Select a date on the calendar and set pricing shown on the public
					pricing page and submit flow.
				</p>
			</div>

			{!isSupabaseConfigured() && (
				<div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
					Connect Supabase to persist custom pricing. Until then, default pricing
					rules apply on the frontend.
				</div>
			)}

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<div>
					<PricingCalendar
						selectedDate={selectedDate}
						slotsMap={slotsMap}
						onSelectSlot={(date, info) => {
							setSelectedDate(date);
							setForm(info);
							setPerksText((info.perks || []).join("\n"));
						}}
					/>
				</div>

				<Card>
					<CardHeader>
						<CardTitle className="text-base">
							Edit Pricing —{" "}
							{selectedDate.toLocaleDateString("en-US", {
								month: "long",
								day: "numeric",
								year: "numeric",
							})}
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="label">Slot Label</Label>
							<Input
								id="label"
								value={form.label}
								onChange={(e) =>
									setForm((f) => ({ ...f, label: e.target.value }))
								}
							/>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="price">Price ($)</Label>
								<Input
									id="price"
									type="number"
									min="0"
									value={form.price}
									onChange={(e) =>
										setForm((f) => ({
											...f,
											price: Number(e.target.value),
											isPaid: Number(e.target.value) > 0,
										}))
									}
								/>
							</div>
							<div className="space-y-2 flex flex-col justify-end">
								<Label>Type</Label>
								<Badge variant={form.isPaid ? "default" : "secondary"}>
									{form.isPaid ? "Paid" : "Free"}
								</Badge>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="description">Description</Label>
							<Textarea
								id="description"
								rows={3}
								value={form.description}
								onChange={(e) =>
									setForm((f) => ({ ...f, description: e.target.value }))
								}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="perks">Perks (one per line)</Label>
							<Textarea
								id="perks"
								rows={4}
								value={perksText}
								onChange={(e) => setPerksText(e.target.value)}
							/>
						</div>

						<Button
							className="w-full"
							onClick={() => saveMutation.mutate()}
							disabled={saveMutation.isPending}
						>
							<Save className="w-4 h-4" />
							{saveMutation.isPending ? "Saving..." : "Save Pricing for Date"}
						</Button>
					</CardContent>
				</Card>
			</div>
		</div>
	);
};

export default PricingSlotsTab;
