import { supabase } from './supabase';

const EMAILS_TABLE = 'emails';

/**
 * Get all emails
 * @returns {Promise<Array>} Array of email documents
 */
export const getAllEmails = async () => {
	try {
		const { data, error } = await supabase
			.from(EMAILS_TABLE)
			.select('*')
			.order('created_at', { ascending: false });

		if (error) {
			throw error;
		}

		// Transform snake_case to camelCase for consistency
		return (data || []).map(email => ({
			...email,
			createdAt: email.created_at,
			updatedAt: email.updated_at,
			publishedAt: email.published_at,
		}));
	} catch (error) {
		console.error('Error getting emails:', error);
		throw error;
	}
};

/**
 * Get a single email by ID
 * @param {string} id - Email document ID
 * @returns {Promise<Object>} Email document
 */
export const getEmailById = async (id) => {
	try {
		const { data, error } = await supabase
			.from(EMAILS_TABLE)
			.select('*')
			.eq('id', id)
			.single();

		if (error) {
			if (error.code === 'PGRST116') {
				throw new Error('Email not found');
			}
			throw error;
		}

		// Transform snake_case to camelCase for consistency
		return {
			...data,
			createdAt: data.created_at,
			updatedAt: data.updated_at,
			publishedAt: data.published_at,
		};
	} catch (error) {
		console.error('Error getting email:', error);
		throw error;
	}
};

/**
 * Create a new email
 * @param {Object} emailData - Email data object
 * @param {string} emailData.subject - Email subject
 * @param {string} emailData.content - Email content (HTML)
 * @param {string} emailData.status - Email status: 'draft' or 'published' (default: 'draft')
 * @returns {Promise<string>} Document ID of created email
 */
export const createEmail = async (emailData) => {
	try {
		const { data, error } = await supabase
			.from(EMAILS_TABLE)
			.insert({
				subject: emailData.subject,
				content: emailData.content,
				status: emailData.status || 'draft',
				recipients: 0,
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
		console.error('Error creating email:', error);
		throw error;
	}
};

/**
 * Update an existing email
 * @param {string} id - Email document ID
 * @param {Object} emailData - Updated email data
 * @returns {Promise<void>}
 */
export const updateEmail = async (id, emailData) => {
	try {
		const updateData = {
			subject: emailData.subject,
			content: emailData.content,
			status: emailData.status,
			recipients: emailData.recipients,
			published_at: emailData.publishedAt || emailData.published_at,
			updated_at: new Date().toISOString(),
		};

		// Remove undefined values
		Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

		const { error } = await supabase
			.from(EMAILS_TABLE)
			.update(updateData)
			.eq('id', id);

		if (error) {
			throw error;
		}
	} catch (error) {
		console.error('Error updating email:', error);
		throw error;
	}
};

/**
 * Delete an email
 * @param {string} id - Email document ID
 * @returns {Promise<void>}
 */
export const deleteEmail = async (id) => {
	try {
		const { error } = await supabase
			.from(EMAILS_TABLE)
			.delete()
			.eq('id', id);

		if (error) {
			throw error;
		}
	} catch (error) {
		console.error('Error deleting email:', error);
		throw error;
	}
};

/**
 * Mark email as published (sent)
 * @param {string} id - Email document ID
 * @param {number} recipients - Number of recipients
 * @returns {Promise<void>}
 */
export const markEmailAsSent = async (id, recipients) => {
	try {
		const { error } = await supabase
			.from(EMAILS_TABLE)
			.update({
				status: 'published',
				recipients: recipients,
				published_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
			})
			.eq('id', id);

		if (error) {
			throw error;
		}
	} catch (error) {
		console.error('Error marking email as sent:', error);
		throw error;
	}
};
