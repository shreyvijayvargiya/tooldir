import { requireSupabase, isSupabaseConfigured } from "../config/supabase";

const TABLE = "tool_submissions";

const toSubmissionModel = (row) => {
	if (!row) return row;
	return {
		id: row.id,
		name: row.name,
		website: row.website,
		description: row.description,
		tags: row.tags || [],
		logoUrl: row.logo_url,
		screenshotUrl: row.screenshot_url,
		badgeVerified: row.badge_verified,
		launchDate: row.launch_date,
		slotLabel: row.slot_label,
		slotPrice: row.slot_price,
		slotIsPaid: row.slot_is_paid,
		status: row.status,
		directoryToolId: row.directory_tool_id,
		submitterEmail: row.submitter_email,
		createdAt: row.created_at,
		updatedAt: row.updated_at,
	};
};

export const getAllToolSubmissions = async () => {
	if (!isSupabaseConfigured()) return [];

	const client = requireSupabase();
	const { data, error } = await client
		.from(TABLE)
		.select("*")
		.order("created_at", { ascending: false });

	if (error) throw error;
	return (data || []).map(toSubmissionModel);
};

export const getToolSubmissionsByEmail = async (email) => {
	if (!email || !isSupabaseConfigured()) return [];

	const client = requireSupabase();
	const { data, error } = await client
		.from(TABLE)
		.select("*")
		.eq("submitter_email", email.toLowerCase().trim())
		.order("created_at", { ascending: false });

	if (error) throw error;
	return (data || []).map(toSubmissionModel);
};

export const createToolSubmission = async (submissionData) => {
	const client = requireSupabase();

	const row = {
		name: submissionData.name,
		website: submissionData.website,
		description: submissionData.description,
		tags: submissionData.tags || [],
		logo_url: submissionData.logoUrl || null,
		screenshot_url: submissionData.screenshotUrl || null,
		badge_verified: submissionData.badgeVerified ?? false,
		launch_date: submissionData.launchDate || null,
		slot_label: submissionData.slotLabel || null,
		slot_price: submissionData.slotPrice ?? 0,
		slot_is_paid: submissionData.slotIsPaid ?? false,
		status: "pending",
		submitter_email: submissionData.submitterEmail || null,
	};

	const { data, error } = await client.from(TABLE).insert(row).select().single();
	if (error) throw error;
	return toSubmissionModel(data);
};

export const updateToolSubmission = async (id, updates) => {
	const client = requireSupabase();

	const row = {
		...(updates.status !== undefined && { status: updates.status }),
		...(updates.directoryToolId !== undefined && {
			directory_tool_id: updates.directoryToolId,
		}),
		updated_at: new Date().toISOString(),
	};

	const { data, error } = await client
		.from(TABLE)
		.update(row)
		.eq("id", id)
		.select()
		.single();

	if (error) throw error;
	return toSubmissionModel(data);
};

export const deleteToolSubmission = async (id) => {
	const client = requireSupabase();
	const { error } = await client.from(TABLE).delete().eq("id", id);
	if (error) throw error;
};
