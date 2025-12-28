import { supabase } from '../api-supabase/supabase';

const MESSAGES_TABLE = 'messages';

/**
 * Get all messages
 * @returns {Promise<Array>} Array of message documents
 */
export const getAllMessages = async () => {
	try {
		const { data, error } = await supabase
			.from(MESSAGES_TABLE)
			.select('*')
			.order('created_at', { ascending: false });

		if (error) {
			throw error;
		}

		return data || [];
	} catch (error) {
		console.error('Error getting messages:', error);
		throw error;
	}
};

/**
 * Get a single message by ID
 * @param {string} id - Message document ID
 * @returns {Promise<Object>} Message document
 */
export const getMessageById = async (id) => {
	try {
		const { data, error } = await supabase
			.from(MESSAGES_TABLE)
			.select('*')
			.eq('id', id)
			.single();

		if (error) {
			if (error.code === 'PGRST116') {
				throw new Error('Message not found');
			}
			throw error;
		}

		return data;
	} catch (error) {
		console.error('Error getting message:', error);
		throw error;
	}
};

/**
 * Create a new message
 * @param {Object} messageData - Message data object
 * @param {string} messageData.name - Sender name
 * @param {string} messageData.email - Sender email
 * @param {string} messageData.subject - Message subject
 * @param {string} messageData.message - Message content
 * @returns {Promise<string>} Document ID of created message
 */
export const createMessage = async (messageData) => {
	try {
		const { data, error } = await supabase
			.from(MESSAGES_TABLE)
			.insert({
				name: messageData.name,
				email: messageData.email,
				subject: messageData.subject,
				message: messageData.message,
				read: false,
				replied: false,
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
		console.error('Error creating message:', error);
		throw error;
	}
};

/**
 * Mark message as read
 * @param {string} id - Message document ID
 * @returns {Promise<void>}
 */
export const markMessageAsRead = async (id) => {
	try {
		const { error } = await supabase
			.from(MESSAGES_TABLE)
			.update({
				read: true,
				read_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
			})
			.eq('id', id);

		if (error) {
			throw error;
		}
	} catch (error) {
		console.error('Error marking message as read:', error);
		throw error;
	}
};

/**
 * Mark message as replied
 * @param {string} id - Message document ID
 * @returns {Promise<void>}
 */
export const markMessageAsReplied = async (id) => {
	try {
		const { error } = await supabase
			.from(MESSAGES_TABLE)
			.update({
				replied: true,
				replied_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
			})
			.eq('id', id);

		if (error) {
			throw error;
		}
	} catch (error) {
		console.error('Error marking message as replied:', error);
		throw error;
	}
};

/**
 * Delete a message
 * @param {string} id - Message document ID
 * @returns {Promise<void>}
 */
export const deleteMessage = async (id) => {
	try {
		const { error } = await supabase
			.from(MESSAGES_TABLE)
			.delete()
			.eq('id', id);

		if (error) {
			throw error;
		}
	} catch (error) {
		console.error('Error deleting message:', error);
		throw error;
	}
};
