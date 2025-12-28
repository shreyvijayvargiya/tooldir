/**
 * Convert various date formats to a consistent Date object
 * Handles Date objects, Unix timestamps, and ISO strings
 *
 * @param {any} dateValue - Date value in various formats
 * @returns {Date|null} Normalized Date object or null
 */
export function normalizeDate(dateValue) {
	if (!dateValue) return null;

	// Already a Date object
	if (dateValue instanceof Date) {
		return dateValue;
	}

	// Unix timestamp (seconds)
	if (typeof dateValue === "number") {
		return new Date(dateValue * 1000);
	}

	// ISO string or other string format
	if (typeof dateValue === "string") {
		return new Date(dateValue);
	}

	return null;
}

/**
 * Get a consistent date for Supabase storage
 * Always returns ISO string for consistency
 *
 * @param {any} dateValue - Date value in various formats
 * @returns {string} ISO string or current date ISO string
 */
export function getFirestoreDate(dateValue) {
	const normalized = normalizeDate(dateValue);
	return normalized ? normalized.toISOString() : new Date().toISOString();
}
