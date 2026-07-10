import { upsertPricingSlot } from "../../../lib/api/pricingSlots";

export default async function handler(req, res) {
	if (req.method !== "POST") {
		return res.status(405).json({ error: "Method not allowed" });
	}

	try {
		const { slotDate, price, label, description, isPaid, perks } = req.body;

		if (!slotDate || !label) {
			return res.status(400).json({ error: "slotDate and label are required" });
		}

		const slot = await upsertPricingSlot({
			slotDate,
			price: price ?? 0,
			label,
			description,
			isPaid,
			perks: perks || [],
		});

		return res.status(200).json({ success: true, slot });
	} catch (error) {
		console.error("Error upserting pricing slot:", error);
		return res.status(500).json({
			error: error.message || "Failed to save pricing slot",
		});
	}
}
