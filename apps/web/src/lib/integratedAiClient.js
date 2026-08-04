import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from './runtimeConfig.js';
import { supabase } from './supabaseClient.js';

const INTEGRATED_AI_URL = `${SUPABASE_URL}/functions/v1/integrated-ai`;

async function getAccessToken() {
	const { data } = await supabase.auth.getSession();
	return data.session?.access_token;
}

const integratedAiClient = {
	fetch: async (path, options = {}) => {
		const accessToken = await getAccessToken();
		if (!accessToken) throw new Error('Debes iniciar sesión para usar el chat de IA.');

		const response = await window.fetch(INTEGRATED_AI_URL, {
			...options,
			headers: {
				apikey: SUPABASE_PUBLISHABLE_KEY,
				...options.headers,
				Authorization: `Bearer ${accessToken}`,
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
		if (!accessToken) throw new Error('Debes iniciar sesión para usar el chat de IA.');

		const headers = {
			Accept: 'text/event-stream',
			apikey: SUPABASE_PUBLISHABLE_KEY,
			Authorization: `Bearer ${accessToken}`,
		};

		const formData = new FormData();
		formData.append('message', JSON.stringify(body.message));

		images.forEach((image) => {
			formData.append('images', image);
		});

		const response = await window.fetch(INTEGRATED_AI_URL, {
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

	clearHistory: async () => integratedAiClient.fetch('', { method: 'DELETE' }),
};

export default integratedAiClient;

export { integratedAiClient };
