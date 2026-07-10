import { requireSupabase, isSupabaseConfigured } from "../config/supabase";

const TABLE = "tool_submissions";

const isMissingColumnError = (error) =>
	error?.code === "PGRST204" ||
	/Could not find the .+ column/i.test(error?.message || "");

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
		paymentStatus: row.payment_status || (row.slot_is_paid ? "unpaid" : "not_required"),
		paymentId: row.payment_id || null,
		stripeSessionId: row.stripe_session_id || null,
		stripeCustomerId: row.stripe_customer_id || null,
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

	const needsPayment = Boolean(
		submissionData.slotIsPaid && (submissionData.slotPrice ?? 0) > 0
	);
	const forceCheckout = Boolean(submissionData.requiresCheckout);

	const baseRow = {
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
		submitter_email: submissionData.submitterEmail
			? String(submissionData.submitterEmail).toLowerCase().trim()
			: null,
	};

	const paymentStatus =
		needsPayment || forceCheckout || submissionData.slotIsPaid
			? "unpaid"
			: "not_required";

	const withPayment = {
		...baseRow,
		payment_status: paymentStatus,
	};

	let { data, error } = await client
		.from(TABLE)
		.insert(withPayment)
		.select()
		.single();

	// Schema not migrated yet — retry without payment columns so submit still works
	if (error && isMissingColumnError(error)) {
		console.warn(
			"[tool_submissions] payment_* columns missing. Re-run supabase-migrations.sql. Retrying without payment_status."
		);
		({ data, error } = await client.from(TABLE).insert(baseRow).select().single());
	}

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
		...(updates.paymentStatus !== undefined && {
			payment_status: updates.paymentStatus,
		}),
		...(updates.paymentId !== undefined && { payment_id: updates.paymentId }),
		...(updates.stripeSessionId !== undefined && {
			stripe_session_id: updates.stripeSessionId,
		}),
		...(updates.stripeCustomerId !== undefined && {
			stripe_customer_id: updates.stripeCustomerId,
		}),
		updated_at: new Date().toISOString(),
	};

	let { data, error } = await client
		.from(TABLE)
		.update(row)
		.eq("id", id)
		.select()
		.single();

	if (error && isMissingColumnError(error)) {
		const fallback = {
			...(updates.status !== undefined && { status: updates.status }),
			...(updates.directoryToolId !== undefined && {
				directory_tool_id: updates.directoryToolId,
			}),
			updated_at: new Date().toISOString(),
		};
		({ data, error } = await client
			.from(TABLE)
			.update(fallback)
			.eq("id", id)
			.select()
			.single());
	}

	if (error) throw error;
	return toSubmissionModel(data);
};

export const deleteToolSubmission = async (id) => {
	const client = requireSupabase();
	const { error } = await client.from(TABLE).delete().eq("id", id);
	if (error) throw error;
};
