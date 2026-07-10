import { requireSupabase, isSupabaseConfigured } from "../config/supabase";
import { TOOLS } from "../data/tools";

const TABLE = "directory_tools";

const toToolModel = (row) => {
	if (!row) return row;
	return {
		id: row.id,
		slug: row.slug,
		name: row.name,
		website: row.website,
		description: row.description || "",
		stars: row.stars ?? 0,
		upvotes: row.upvotes ?? 0,
		date: row.listed_date || row.created_at?.split("T")[0],
		country: row.country || "US",
		pricing: row.pricing || "Freemium",
		category: row.category || "AI Writing",
		tags: row.tags || [],
		logo: row.logo_url,
		screenshot: row.screenshot_url,
		isListed: row.is_listed,
		featured: row.featured,
		createdAt: row.created_at,
		updatedAt: row.updated_at,
	};
};

const mockToRow = (tool) => ({
	slug: tool.slug,
	name: tool.name,
	website: tool.website,
	description: tool.description,
	stars: tool.stars,
	upvotes: tool.upvotes,
	listed_date: tool.date,
	country: tool.country,
	pricing: tool.pricing,
	category: tool.category,
	tags: tool.tags,
	logo_url: tool.logo,
	screenshot_url: tool.screenshot,
	is_listed: true,
});

export const getListedTools = async () => {
	if (!isSupabaseConfigured()) {
		return TOOLS.map((t) => toToolModel({ ...mockToRow(t), id: t.id }));
	}

	try {
		const client = requireSupabase();
		const { data, error } = await client
			.from(TABLE)
			.select("*")
			.eq("is_listed", true)
			.order("upvotes", { ascending: false });

		if (error) throw error;

		if (!data?.length) {
			return TOOLS.map((t) => toToolModel({ ...mockToRow(t), id: t.id }));
		}

		return data.map(toToolModel);
	} catch (error) {
		console.error("Error fetching listed tools:", error);
		return TOOLS.map((t) => toToolModel({ ...mockToRow(t), id: t.id }));
	}
};

export const getToolBySlug = async (slug) => {
	if (!isSupabaseConfigured()) {
		const tool = TOOLS.find((t) => t.slug === slug);
		return tool ? toToolModel({ ...mockToRow(tool), id: tool.id }) : null;
	}

	try {
		const client = requireSupabase();
		const { data, error } = await client
			.from(TABLE)
			.select("*")
			.eq("slug", slug)
			.eq("is_listed", true)
			.single();

		if (error) {
			if (error.code === "PGRST116") {
				const fallback = TOOLS.find((t) => t.slug === slug);
				return fallback
					? toToolModel({ ...mockToRow(fallback), id: fallback.id })
					: null;
			}
			throw error;
		}

		return toToolModel(data);
	} catch (error) {
		console.error("Error fetching tool by slug:", error);
		const fallback = TOOLS.find((t) => t.slug === slug);
		return fallback
			? toToolModel({ ...mockToRow(fallback), id: fallback.id })
			: null;
	}
};

export const getAllDirectoryTools = async () => {
	if (!isSupabaseConfigured()) return [];

	const client = requireSupabase();
	const { data, error } = await client
		.from(TABLE)
		.select("*")
		.order("created_at", { ascending: false });

	if (error) throw error;
	return (data || []).map(toToolModel);
};

export const createDirectoryTool = async (toolData) => {
	const client = requireSupabase();
	const slug =
		toolData.slug ||
		toolData.name
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/(^-|-$)/g, "");

	const row = {
		slug,
		name: toolData.name,
		website: toolData.website,
		description: toolData.description,
		stars: toolData.stars ?? 0,
		upvotes: toolData.upvotes ?? 0,
		listed_date: toolData.listedDate || toolData.date || new Date().toISOString().split("T")[0],
		country: toolData.country || "US",
		pricing: toolData.pricing || "Freemium",
		category: toolData.category || toolData.tags?.[0] || "AI Writing",
		tags: toolData.tags || [],
		logo_url: toolData.logoUrl || toolData.logo,
		screenshot_url: toolData.screenshotUrl || toolData.screenshot,
		is_listed: toolData.isListed ?? true,
		featured: toolData.featured ?? false,
		updated_at: new Date().toISOString(),
	};

	const { data, error } = await client.from(TABLE).insert(row).select().single();
	if (error) throw error;
	return toToolModel(data);
};

export const updateDirectoryTool = async (id, updates) => {
	const client = requireSupabase();
	const row = {
		...(updates.name !== undefined && { name: updates.name }),
		...(updates.website !== undefined && { website: updates.website }),
		...(updates.description !== undefined && { description: updates.description }),
		...(updates.isListed !== undefined && { is_listed: updates.isListed }),
		...(updates.tags !== undefined && { tags: updates.tags }),
		updated_at: new Date().toISOString(),
	};

	const { data, error } = await client
		.from(TABLE)
		.update(row)
		.eq("id", id)
		.select()
		.single();

	if (error) throw error;
	return toToolModel(data);
};

export const seedDirectoryTools = async () => {
	if (!isSupabaseConfigured()) {
		return { seeded: 0, message: "Supabase not configured" };
	}

	const client = requireSupabase();
	const { count, error: countError } = await client
		.from(TABLE)
		.select("*", { count: "exact", head: true });

	if (countError) throw countError;
	if (count > 0) {
		return { seeded: 0, message: "Tools already exist" };
	}

	const rows = TOOLS.map((tool) => ({
		...mockToRow(tool),
		is_listed: true,
	}));

	const { data, error } = await client.from(TABLE).insert(rows).select();
	if (error) throw error;
	return { seeded: data?.length || 0, message: "Seed complete" };
};

export const publishSubmissionAsTool = async (submission) => {
	const tool = await createDirectoryTool({
		name: submission.name,
		website: submission.website,
		description: submission.description,
		tags: submission.tags,
		logoUrl: submission.logoUrl,
		screenshotUrl: submission.screenshotUrl,
		category: submission.tags?.[0] || "AI Writing",
		isListed: true,
	});
	return tool;
};
