import { supabase } from "../config/supabase";

const FORMS_TABLE = "forms";
const FORM_SUBMISSIONS_TABLE = "form_submissions";

const toFormModel = (row) => {
	if (!row) return row;
	return {
		...row,
		isPublished: row.is_published,
		formSlug: row.form_slug,
		createdAt: row.created_at,
		updatedAt: row.updated_at,
	};
};

const toSubmissionModel = (row) => {
	if (!row) return row;
	return {
		...row,
		formId: row.form_id,
		createdAt: row.created_at,
	};
};

/**
 * Get all forms
 * @returns {Promise<Array>} Array of form documents
 */
export const getAllForms = async () => {
	try {
		const { data, error } = await supabase
			.from(FORMS_TABLE)
			.select("*")
			.order("created_at", { ascending: false });

		if (error) throw error;

		return (data || []).map(toFormModel);
	} catch (error) {
		console.error("Error getting forms:", error);
		throw error;
	}
};

/**
 * Get a single form by ID or slug
 * @param {string} idOrSlug - Form document ID or slug
 * @returns {Promise<Object>} Form document
 */
export const getFormById = async (idOrSlug) => {
	try {
		// First try to get by UUID id
		const { data: byId, error: byIdError } = await supabase
			.from(FORMS_TABLE)
			.select("*")
			.eq("id", idOrSlug)
			.single();

		if (byId && !byIdError) {
			return toFormModel(byId);
		}

		// If not found by id, try slug
		const { data: bySlug, error: bySlugError } = await supabase
			.from(FORMS_TABLE)
			.select("*")
			.eq("form_slug", idOrSlug)
			.single();

		if (bySlugError) {
			if (bySlugError.code === "PGRST116") {
				throw new Error("Form not found");
			}
			throw bySlugError;
		}

		return toFormModel(bySlug);
	} catch (error) {
		console.error("Error getting form:", error);
		throw error;
	}
};

/**
 * Create a new form
 * @param {Object} formData - Form data object
 * @param {string} formData.title - Form title
 * @param {string} formData.description - Form description
 * @param {Array} formData.fields - Array of form fields
 * @param {boolean} formData.isPublished - Whether form is published
 * @returns {Promise<string>} Document ID of created form
 */
export const createForm = async (formData) => {
	try {
		const title = formData.title || "Untitled Form";
		const insertRow = {
			title: title,
			description: formData.description || "",
			fields: formData.fields || [],
			is_published: !!formData.isPublished,
			form_slug: formData.formSlug || generateSlug(title || "form"),
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		};

		const { data, error } = await supabase
			.from(FORMS_TABLE)
			.insert(insertRow)
			.select()
			.single();

		if (error) throw error;

		return data.id;
	} catch (error) {
		console.error("Error creating form:", error);
		throw error;
	}
};

/**
 * Update an existing form
 * @param {string} id - Form document ID
 * @param {Object} formData - Updated form data
 * @returns {Promise<void>}
 */
export const updateForm = async (id, formData) => {
	try {
		const updateRow = {
			title: formData.title,
			description: formData.description,
			fields: formData.fields,
			is_published:
				formData.isPublished === undefined ? undefined : !!formData.isPublished,
			form_slug: formData.formSlug,
			updated_at: new Date().toISOString(),
		};

		// Ensure slug exists, generate if missing
		if (!updateRow.form_slug && formData.title) {
			updateRow.form_slug = generateSlug(formData.title);
		}

		// Remove undefined values
		Object.keys(updateRow).forEach(
			(key) => updateRow[key] === undefined && delete updateRow[key]
		);

		const { error } = await supabase.from(FORMS_TABLE).update(updateRow).eq("id", id);

		if (error) throw error;
	} catch (error) {
		console.error("Error updating form:", error);
		throw error;
	}
};

/**
 * Delete a form
 * @param {string} id - Form document ID
 * @returns {Promise<void>}
 */
export const deleteForm = async (id) => {
	try {
		const { error } = await supabase.from(FORMS_TABLE).delete().eq("id", id);
		if (error) throw error;
	} catch (error) {
		console.error("Error deleting form:", error);
		throw error;
	}
};

/**
 * Get all submissions for a form
 * @param {string} formId - Form document ID
 * @returns {Promise<Array>} Array of submission documents
 */
export const getFormSubmissions = async (formId) => {
	try {
		const { data, error } = await supabase
			.from(FORM_SUBMISSIONS_TABLE)
			.select("*")
			.eq("form_id", formId)
			.order("created_at", { ascending: false });

		if (error) throw error;

		return (data || []).map(toSubmissionModel);
	} catch (error) {
		console.error("Error getting form submissions:", error);
		throw error;
	}
};

/**
 * Get submission count for a form
 * @param {string} formId - Form document ID
 * @returns {Promise<number>} Number of submissions
 */
export const getFormSubmissionCount = async (formId) => {
	try {
		const { count, error } = await supabase
			.from(FORM_SUBMISSIONS_TABLE)
			.select("id", { count: "exact", head: true })
			.eq("form_id", formId);

		if (error) throw error;

		return count || 0;
	} catch (error) {
		console.error("Error getting form submission count:", error);
		return 0;
	}
};

/**
 * Get a single submission by ID
 * @param {string} id - Submission document ID
 * @returns {Promise<Object>} Submission document
 */
export const getSubmissionById = async (id) => {
	try {
		const { data, error } = await supabase
			.from(FORM_SUBMISSIONS_TABLE)
			.select("*")
			.eq("id", id)
			.single();

		if (error) {
			if (error.code === "PGRST116") {
				throw new Error("Submission not found");
			}
			throw error;
		}

		return toSubmissionModel(data);
	} catch (error) {
		console.error("Error getting submission:", error);
		throw error;
	}
};

/**
 * Create a new form submission
 * @param {Object} submissionData - Submission data object
 * @param {string} submissionData.formId - Form document ID
 * @param {Object} submissionData.data - Submission data (field values)
 * @returns {Promise<string>} Document ID of created submission
 */
export const createFormSubmission = async (submissionData) => {
	try {
		// Validate input
		if (!submissionData || !submissionData.data) {
			throw new Error("No valid form data provided");
		}

		// Clean data - remove empty keys, but keep valid values
		const cleanedData = {};
		const dataKeys = Object.keys(submissionData.data || {});

		// If no data keys at all, throw error
		if (dataKeys.length === 0) {
			throw new Error("No valid form data provided");
		}

		dataKeys.forEach((key) => {
			if (!key || key.trim() === "") {
				return; // Skip empty keys
			}

			const value = submissionData.data[key];

			// Include value if it's not null/undefined
			if (value !== undefined && value !== null) {
				if (Array.isArray(value)) {
					// Include arrays (even if empty - they represent image fields that might be optional)
					cleanedData[key] = value;
				} else if (typeof value === "string") {
					// Include strings (even if empty - they might be optional fields)
					// Empty strings are valid for optional fields
					cleanedData[key] = value;
				} else {
					// Include non-string values (numbers, booleans, etc.)
					cleanedData[key] = value;
				}
			}
		});

		// Ensure we have at least one field in cleanedData
		// Note: We allow empty strings and empty arrays because fields might be optional
		// The required field validation happens in submitForm before this function is called
		if (Object.keys(cleanedData).length === 0) {
			throw new Error("No valid form data provided");
		}

		const insertRow = {
			form_id: submissionData.formId,
			data: cleanedData,
			created_at: new Date().toISOString(),
		};

		const { data, error } = await supabase
			.from(FORM_SUBMISSIONS_TABLE)
			.insert(insertRow)
			.select()
			.single();

		if (error) throw error;

		return data.id;
	} catch (error) {
		console.error("Error creating form submission:", error);
		throw error;
	}
};

/**
 * Submit a form (client-side submission with validation)
 * @param {string} formIdOrSlug - Form document ID or slug
 * @param {Object} formData - Form submission data
 * @returns {Promise<Object>} Submission result
 */
export const submitForm = async (formIdOrSlug, formData) => {
	try {
		// Get form by ID or slug
		const form = await getFormById(formIdOrSlug);

		if (!form) {
			throw new Error("Form not found");
		}

		if (!form.isPublished) {
			throw new Error("Form is not published");
		}

		// Validate required fields
		if (form.fields && Array.isArray(form.fields)) {
			for (const field of form.fields) {
				if (!field.label || field.label.trim() === "") {
					continue; // Skip fields with empty labels
				}

				if (field.required) {
					const value = formData[field.label];
					// Check if value is empty (null, undefined, empty string, or empty array)
					if (
						value === null ||
						value === undefined ||
						value === "" ||
						(Array.isArray(value) && value.length === 0)
					) {
						throw new Error(`Field "${field.label}" is required`);
					}
				}
			}
		}

		// Create submission
		const submissionId = await createFormSubmission({
			formId: form.id,
			data: formData,
		});

		return {
			success: true,
			submissionId,
			message: "Form submitted successfully",
		};
	} catch (error) {
		console.error("Error submitting form:", error);
		throw error;
	}
};

/**
 * Delete a form submission
 * @param {string} id - Submission document ID
 * @returns {Promise<void>}
 */
export const deleteFormSubmission = async (id) => {
	try {
		const { error } = await supabase
			.from(FORM_SUBMISSIONS_TABLE)
			.delete()
			.eq("id", id);
		if (error) throw error;
	} catch (error) {
		console.error("Error deleting form submission:", error);
		throw error;
	}
};

/**
 * Generate a slug from title
 * @param {string} title - Title to generate slug from
 * @returns {string} Generated slug
 */
const generateSlug = (title) => {
	return title
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/(^-|-$)/g, "");
};