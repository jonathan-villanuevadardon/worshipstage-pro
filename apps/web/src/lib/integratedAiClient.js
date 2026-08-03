import { API_SERVER_URL } from './runtimeConfig.js';
import { supabase } from './supabaseClient.js';

async function getAccessToken() {
	const { data } = await supabase.auth.getSession();
	return data.session?.access_token;
}

const integratedAiClient = {
	fetch: async (path, options = {}) => {
		const accessToken = await getAccessToken();

		const response = await window.fetch(API_SERVER_URL + path, {
			...options,
			headers: {
				...options.headers,
				...(accessToken && { Authorization: `Bearer ${accessToken}` }),
			},
		});

		if (!response.ok) {
			const errorBody = await response.text();

			let message;
			try {
				const parsed = JSON.parse(errorBody);
				message = parsed?.error?.message || parsed?.message;
			} catch {
				message = errorBody;
			}

			const error = new Error(message || `Request failed (${response.status})`);
			error.status = response.status;
			throw error;
		}

		return response.json();
	},

	stream: async (path, { body, signal, images = [] } = {}) => {
		const accessToken = await getAccessToken();

		const headers = {
			Accept: 'text/event-stream',
			...(accessToken && { Authorization: `Bearer ${accessToken}` }),
		};

		const formData = new FormData();
		formData.append('message', JSON.stringify(body.message));

		images.forEach((image) => {
			formData.append('images', image);
		});

		const response = await window.fetch(API_SERVER_URL + path, {
			method: 'POST',
			headers,
			body: formData,
			signal,
		});

		if (!response.ok) {
			const errorBody = await response.text();

			let message;
			try {
				const parsed = JSON.parse(errorBody);
				message = parsed?.error?.message || parsed?.message;
			} catch {
				message = errorBody;
			}

			const error = new Error(message || `Request failed (${response.status})`);
			error.status = response.status;
			throw error;
		}

		if (!response.body) {
			throw new Error('No response body');
		}

		return response;
	},
};

export default integratedAiClient;

export { integratedAiClient };
