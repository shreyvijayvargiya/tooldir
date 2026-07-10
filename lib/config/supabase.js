import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;

export const isSupabaseConfigured = () =>
	Boolean(supabaseUrl && supabaseKey);

export const supabase = isSupabaseConfigured()
	? createClient(supabaseUrl, supabaseKey)
	: null;

export const requireSupabase = () => {
	if (!supabase) {
		throw new Error(
			"Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_KEY."
		);
	}
	return supabase;
};
