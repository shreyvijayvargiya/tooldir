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
 * Create a new form via Server-Side API
 * @param {Object} formData - Form data object
 * @returns {Promise<string>} Document ID of created form
 */
export const createForm = async (formData) => {
	try {
		const response = await fetch("/api/forms/create", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(formData),
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.error || "Failed to create form");
		}

		const result = await response.json();
		return result.data.id;
	} catch (error) {
		console.error("Error creating form:", error);
		throw error;
	}
};

/**
 * Update an existing form via Server-Side API
 * @param {string} id - Form document ID
 * @param {Object} formData - Updated form data
 * @returns {Promise<void>}
 */
export const updateForm = async (id, formData) => {
	try {
		const response = await fetch("/api/forms/update", {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ id, data: formData }),
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.error || "Failed to update form");
		}
	} catch (error) {
		console.error("Error updating form:", error);
		throw error;
	}
};

/**
 * Delete a form via Server-Side API
 * @param {string} id - Form document ID
 * @returns {Promise<void>}
 */
export const deleteForm = async (id) => {
	try {
		const response = await fetch("/api/forms/delete", {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ id }),
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.error || "Failed to delete form");
		}
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
 * Create a new form submission (Public, Client-side)
 * Uses Supabase directly, assuming public access RLS is configured for submissions
 * @param {Object} submissionData - Submission data object
 * @returns {Promise<string>} Document ID of created submission
 */
export const createFormSubmission = async (submissionData) => {
	try {
		// Validate input
		if (!submissionData || !submissionData.data) {
			throw new Error("No valid form data provided");
		}

		// Clean data
		const cleanedData = {};
		const dataKeys = Object.keys(submissionData.data || {});

		if (dataKeys.length === 0) {
			throw new Error("No valid form data provided");
		}

		dataKeys.forEach((key) => {
			if (!key || key.trim() === "") return;
			const value = submissionData.data[key];
			if (value !== undefined && value !== null) {
				cleanedData[key] = value;
			}
		});

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
 * Submit a form (client-side submission wrapper)
 */
export const submitForm = async (formIdOrSlug, formData) => {
	try {
		const form = await getFormById(formIdOrSlug);
		if (!form) throw new Error("Form not found");
		if (!form.isPublished) throw new Error("Form is not published");

		// Validation logic (simplified)
		if (form.fields && Array.isArray(form.fields)) {
			for (const field of form.fields) {
				if (!field.label || field.label.trim() === "") continue;
				if (field.required) {
					const value = formData[field.label];
					if (value === null || value === undefined || value === "" || (Array.isArray(value) && value.length === 0)) {
						throw new Error(`Field "${field.label}" is required`);
					}
				}
			}
		}

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
 * Delete a form submission via Server-Side API
 * @param {string} id - Submission document ID
 * @returns {Promise<void>}
 */
export const deleteFormSubmission = async (id) => {
	try {
		const response = await fetch("/api/forms/submissions/delete", {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ id }),
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.error || "Failed to delete submission");
		}
	} catch (error) {
		console.error("Error deleting form submission:", error);
		throw error;
	}
};