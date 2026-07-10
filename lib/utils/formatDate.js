/**
 * Parse YYYY-MM-DD (or ISO string) as a local calendar date — avoids UTC timezone shifts in SSR.
 */
export function parseLocalDate(dateStr) {
	if (!dateStr) return null;
	const datePart = String(dateStr).split("T")[0];
	const [year, month, day] = datePart.split("-").map(Number);
	if (!year || !month || !day) return null;
	return new Date(year, month - 1, day);
}

export function formatDisplayDate(dateStr, { style = "long" } = {}) {
	const date = parseLocalDate(dateStr);
	if (!date || isNaN(date.getTime())) return "—";
	return date.toLocaleDateString("en-US", {
		month: style === "short" ? "short" : "long",
		day: "numeric",
		year: "numeric",
	});
}

export function formatDisplayDateShort(dateStr) {
	return formatDisplayDate(dateStr, { style: "short" });
}
