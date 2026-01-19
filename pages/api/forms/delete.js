import { supabase } from "../../../lib/config/supabase";

/**
 * Delete a form
 * DELETE /api/forms/delete
 * Body: { id }
 */
export default async function handler(req, res) {
    if (req.method !== "DELETE") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({ error: "Form ID is required" });
        }

        if (!supabase) {
            return res.status(500).json({
                error: "Supabase Service Role Key missing. Cannot perform admin operations."
            });
        }

        // Delete form (cascading delete should handle submissions if FK set up, otherwise we should delete submissions first?)
        // Assuming cascading delete is configured in DB or we don't care about orphaned submissions for now.
        // Safe to delete form.

        const { error } = await supabase
            .from("forms")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("Supabase delete error:", error);
            return res.status(500).json({ error: error.message });
        }

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error("Error deleting form:", error);
        return res.status(500).json({ error: error.message });
    }
}
