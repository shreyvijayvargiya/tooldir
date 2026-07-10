import { requireSupabase, isSupabaseConfigured } from "../config/supabase";
import { getSlotPricing, formatDateKey } from "../data/pricing-slots";

const TABLE = "pricing_slots";

const toSlotModel = (row) => {
	if (!row) return row;
	return {
		id: row.id,
		slotDate: row.slot_date,
		dateKey: row.slot_date,
		price: row.price,
		label: row.label,
		description: row.description,
		isPaid: row.is_paid,
		perks: row.perks || [],
		createdAt: row.created_at,
		updatedAt: row.updated_at,
	};
};

export const getAllPricingSlots = async () => {
	if (!isSupabaseConfigured()) return [];

	try {
		const client = requireSupabase();
		const { data, error } = await client
			.from(TABLE)
			.select("*")
			.order("slot_date", { ascending: true });

		if (error) throw error;
		return (data || []).map(toSlotModel);
	} catch (error) {
		console.error("Error fetching pricing slots:", error);
		return [];
	}
};

export const getPricingSlotsMap = async () => {
	const slots = await getAllPricingSlots();
	const map = {};
	slots.forEach((slot) => {
		map[slot.dateKey] = {
			price: slot.price,
			label: slot.label,
			description: slot.description,
			isPaid: slot.isPaid,
			perks: slot.perks,
		};
	});
	return map;
};

export const getSlotPricingForDate = async (date) => {
	const key = formatDateKey(date);
	if (isSupabaseConfigured()) {
		try {
			const client = requireSupabase();
			const { data, error } = await client
				.from(TABLE)
				.select("*")
				.eq("slot_date", key)
				.single();

			if (data && !error) {
				return {
					price: data.price,
					label: data.label,
					description: data.description,
					isPaid: data.is_paid,
					perks: data.perks || [],
				};
			}
		} catch (e) {
			// fall through to default
		}
	}
	return getSlotPricing(date);
};

export const upsertPricingSlot = async (slotData) => {
	const client = requireSupabase();

	const row = {
		slot_date: slotData.slotDate,
		price: slotData.price ?? 0,
		label: slotData.label,
		description: slotData.description || "",
		is_paid: slotData.isPaid ?? slotData.price > 0,
		perks: slotData.perks || [],
		updated_at: new Date().toISOString(),
	};

	const { data, error } = await client
		.from(TABLE)
		.upsert(row, { onConflict: "slot_date" })
		.select()
		.single();

	if (error) throw error;
	return toSlotModel(data);
};

export const deletePricingSlot = async (slotDate) => {
	const client = requireSupabase();
	const { error } = await client.from(TABLE).delete().eq("slot_date", slotDate);
	if (error) throw error;
};
