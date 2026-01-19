import { supabase } from "../../../lib/config/supabase";

/**
 * Create a new form
 * POST /api/forms/create
 * Body: { title, description, fields, isPublished }
 */
export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { title, description, fields, isPublished } = req.body;

        if (!supabase) {
            return res.status(500).json({
                error: "Supabase Service Role Key missing. Cannot perform admin operations."
            });
        }

        const slug = (title || "untitled-form")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "") +
            "-" + Math.random().toString(36).substring(2, 7);

        const insertRow = {
            title: title || "Untitled Form",
            description: description || "",
            fields: fields || [],
            is_published: !!isPublished,
            form_slug: slug,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        const { data, error } = await supabase
            .from("forms")
            .insert(insertRow)
            .select()
            .single();

        if (error) {
            console.error("Supabase insert error:", error);
            return res.status(500).json({ error: error.message });
        }

        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.error("Error creating form:", error);
        return res.status(500).json({ error: error.message });
    }
}
