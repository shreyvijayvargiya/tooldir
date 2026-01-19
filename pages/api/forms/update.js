import { supabase } from "../../../lib/config/supabase";

/**
 * Update a form
 * PATCH /api/forms/update
 * Body: { id, data: { title, description, fields, isPublished } }
 */
export default async function handler(req, res) {
    if (req.method !== "PATCH") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { id, data } = req.body;

        if (!id) {
            return res.status(400).json({ error: "Form ID is required" });
        }

        if (!supabase) {
            return res.status(500).json({
                error: "Supabase Service Role Key missing. Cannot perform admin operations."
            });
        }

        const updateRow = {};
        if (data.title !== undefined) updateRow.title = data.title;
        if (data.description !== undefined) updateRow.description = data.description;
        if (data.fields !== undefined) updateRow.fields = data.fields;
        if (data.isPublished !== undefined) updateRow.is_published = !!data.isPublished;

        updateRow.updated_at = new Date().toISOString();

        // Update slug if title changed (optional, maybe better not to break links?)
        // Let's keep slug stable for now unless explicitly requested.

        const { data: updatedForm, error } = await supabase
            .from("forms")
            .update(updateRow)
            .eq("id", id)
            .select()
            .single();

        if (error) {
            console.error("Supabase update error:", error);
            return res.status(500).json({ error: error.message });
        }

        return res.status(200).json({ success: true, data: updatedForm });
    } catch (error) {
        console.error("Error updating form:", error);
        return res.status(500).json({ error: error.message });
    }
}
