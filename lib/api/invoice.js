import { supabase } from "./supabase";

const INVOICES_TABLE = "invoices";

/**
 * Get all invoices from Supabase
 * @returns {Promise<Array>} Array of invoice documents
 */
export const getAllInvoices = async () => {
	try {
		const { data, error } = await supabase
			.from(INVOICES_TABLE)
			.select("*")
			.order("created_at", { ascending: false });

		if (error) {
			throw error;
		}

		// Transform snake_case to camelCase for consistency
		return (data || []).map((invoice) => ({
			...invoice,
			invoiceNumber: invoice.invoice_number,
			invoiceDate: invoice.invoice_date,
			dueDate: invoice.due_date,
			from: invoice.from_details,
			to: invoice.to_details,
			items: invoice.items,
			clientType: invoice.client_type,
			clientId: invoice.client_id,
			createdAt: invoice.created_at,
			updatedAt: invoice.updated_at,
		}));
	} catch (error) {
		console.error("Error getting invoices:", error);
		throw error;
	}
};

/**
 * Get a single invoice by ID
 * @param {string} id - Invoice document ID
 * @returns {Promise<Object>} Invoice document
 */
export const getInvoiceById = async (id) => {
	try {
		const { data, error } = await supabase
			.from(INVOICES_TABLE)
			.select("*")
			.eq("id", id)
			.single();

		if (error) {
			if (error.code === "PGRST116") {
				throw new Error("Invoice not found");
			}
			throw error;
		}

		// Transform snake_case to camelCase for consistency
		return {
			...data,
			invoiceNumber: data.invoice_number,
			invoiceDate: data.invoice_date,
			dueDate: data.due_date,
			from: data.from_details,
			to: data.to_details,
			items: data.items,
			clientType: data.client_type,
			clientId: data.client_id,
			createdAt: data.created_at,
			updatedAt: data.updated_at,
		};
	} catch (error) {
		console.error("Error getting invoice:", error);
		throw error;
	}
};

/**
 * Create a new invoice
 * @param {Object} invoiceData - Invoice data object
 * @param {string} invoiceData.invoiceNumber - Invoice number
 * @param {Date} invoiceData.invoiceDate - Invoice date
 * @param {Date} invoiceData.dueDate - Due date (optional)
 * @param {Object} invoiceData.from - From details (JSONB)
 * @param {Object} invoiceData.to - To details (JSONB)
 * @param {Array} invoiceData.items - Invoice items (JSONB)
 * @param {number} invoiceData.total - Total amount
 * @param {string} invoiceData.notes - Notes (optional)
 * @param {string} invoiceData.signature - Signature (optional)
 * @param {string} invoiceData.status - Status (default: 'unpaid')
 * @param {string} invoiceData.clientType - Client type (optional)
 * @param {string} invoiceData.clientId - Client ID (optional)
 * @returns {Promise<string>} Document ID of created invoice
 */
export const createInvoice = async (invoiceData) => {
	try {
		const { data, error } = await supabase
			.from(INVOICES_TABLE)
			.insert({
				invoice_number: invoiceData.invoiceNumber,
				invoice_date: invoiceData.invoiceDate
					? new Date(invoiceData.invoiceDate).toISOString()
					: new Date().toISOString(),
				due_date: invoiceData.dueDate
					? new Date(invoiceData.dueDate).toISOString()
					: null,
				from_details: invoiceData.from || {},
				to_details: invoiceData.to || {},
				items: invoiceData.items || [],
				total: invoiceData.total || 0,
				notes: invoiceData.notes || null,
				signature: invoiceData.signature || null,
				status: invoiceData.status || "unpaid",
				client_type: invoiceData.clientType || null,
				client_id: invoiceData.clientId || null,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
			})
			.select()
			.single();

		if (error) {
			throw error;
		}

		return data.id;
	} catch (error) {
		console.error("Error creating invoice:", error);
		throw error;
	}
};

/**
 * Update an existing invoice
 * @param {string} id - Invoice document ID
 * @param {Object} invoiceData - Updated invoice data
 * @returns {Promise<void>}
 */
export const updateInvoice = async (id, invoiceData) => {
	try {
		const updateData = {
			invoice_number: invoiceData.invoiceNumber,
			invoice_date: invoiceData.invoiceDate
				? new Date(invoiceData.invoiceDate).toISOString()
				: undefined,
			due_date: invoiceData.dueDate
				? new Date(invoiceData.dueDate).toISOString()
				: invoiceData.dueDate === null
					? null
					: undefined,
			from_details: invoiceData.from,
			to_details: invoiceData.to,
			items: invoiceData.items,
			total: invoiceData.total,
			notes: invoiceData.notes,
			signature: invoiceData.signature,
			status: invoiceData.status,
			client_type: invoiceData.clientType,
			client_id: invoiceData.clientId,
			updated_at: new Date().toISOString(),
		};

		// Remove undefined values
		Object.keys(updateData).forEach(
			(key) => updateData[key] === undefined && delete updateData[key]
		);

		const { error } = await supabase
			.from(INVOICES_TABLE)
			.update(updateData)
			.eq("id", id);

		if (error) {
			throw error;
		}
	} catch (error) {
		console.error("Error updating invoice:", error);
		throw error;
	}
};

/**
 * Delete an invoice
 * @param {string} id - Invoice document ID
 * @returns {Promise<void>}
 */
export const deleteInvoice = async (id) => {
	try {
		const { error } = await supabase.from(INVOICES_TABLE).delete().eq("id", id);

		if (error) {
			throw error;
		}
	} catch (error) {
		console.error("Error deleting invoice:", error);
		throw error;
	}
};

/**
 * Mark invoice as paid
 * @param {string} id - Invoice document ID
 * @returns {Promise<void>}
 */
export const markInvoiceAsPaid = async (id) => {
	try {
		const { error } = await supabase
			.from(INVOICES_TABLE)
			.update({
				status: "paid",
				updated_at: new Date().toISOString(),
			})
			.eq("id", id);

		if (error) {
			throw error;
		}
	} catch (error) {
		console.error("Error marking invoice as paid:", error);
		throw error;
	}
};

/**
 * Mark invoice as unpaid
 * @param {string} id - Invoice document ID
 * @returns {Promise<void>}
 */
export const markInvoiceAsUnpaid = async (id) => {
	try {
		const { error } = await supabase
			.from(INVOICES_TABLE)
			.update({
				status: "unpaid",
				updated_at: new Date().toISOString(),
			})
			.eq("id", id);

		if (error) {
			throw error;
		}
	} catch (error) {
		console.error("Error marking invoice as unpaid:", error);
		throw error;
	}
};
