import { supabase } from "../../../../lib/config/supabase";

/**
 * Delete a form submission
 * DELETE /api/forms/submissions/delete
 * Body: { id }
 */
export default async function handler(req, res) {
    if (req.method !== "DELETE") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({ error: "Submission ID is required" });
        }

        if (!supabase) {
            return res.status(500).json({
                error: "Supabase Service Role Key missing. Cannot perform admin operations."
            });
        }

        const { error } = await supabase
            .from("form_submissions")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("Supabase delete error:", error);
            return res.status(500).json({ error: error.message });
        }

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error("Error deleting submission:", error);
        return res.status(500).json({ error: error.message });
    }
}
