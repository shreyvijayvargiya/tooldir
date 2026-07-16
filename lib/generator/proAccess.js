import { getCustomerByEmail } from "../api/customers";

/**
 * Server-side PRO gate for generator downloads.
 *
 * Unlock paths (any one):
 * 1. GENERATOR_ALLOW_ALL=true (local/demo)
 * 2. Header / body proKey matches GENERATOR_PRO_SECRET
 * 3. Email in GENERATOR_PRO_EMAILS (comma-separated)
 * 4. customers row with status=active and plan_name matching /pro|tooldir|boilerplate/i
 */
export async function resolveProAccess({ email, proKey } = {}) {
	if (process.env.GENERATOR_ALLOW_ALL?.trim() === "true") {
		return { allowed: true, reason: "allow_all" };
	}

	const secret = process.env.GENERATOR_PRO_SECRET?.trim();
	if (secret && proKey && String(proKey).trim() === secret) {
		return { allowed: true, reason: "pro_key" };
	}

	const normalized = email ? String(email).toLowerCase().trim() : "";
	if (!normalized) {
		return { allowed: false, reason: "login_required" };
	}

	const allowList = (process.env.GENERATOR_PRO_EMAILS || "")
		.split(",")
		.map((e) => e.trim().toLowerCase())
		.filter(Boolean);
	if (allowList.includes(normalized)) {
		return { allowed: true, reason: "allowlist", email: normalized };
	}

	try {
		const customer = await getCustomerByEmail(normalized);
		if (!customer) {
			return { allowed: false, reason: "not_pro", email: normalized };
		}
		const plan = String(customer.plan_name || customer.planName || "").toLowerCase();
		const status = String(customer.status || "").toLowerCase();
		const looksPro =
			status === "active" &&
			(/pro|tooldir|boilerplate|gumroad|lifetime/.test(plan) ||
				Boolean(customer.plan_id));
		if (looksPro) {
			return { allowed: true, reason: "customer", email: normalized };
		}
		return { allowed: false, reason: "not_pro", email: normalized };
	} catch {
		return { allowed: false, reason: "lookup_failed", email: normalized };
	}
}
