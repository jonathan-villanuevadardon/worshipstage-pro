import { API_SERVER_URL } from './runtimeConfig.js';
import { supabase } from './supabaseClient.js';

const apiServerClient = {
    fetch: async (url, options = {}) => {
        const { data } = await supabase.auth.getSession();
        const accessToken = data.session?.access_token;
        return await window.fetch(API_SERVER_URL + url, {
            ...options,
            headers: {
                ...options.headers,
                ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
            },
        });
    }
};

export default apiServerClient;

export { API_SERVER_URL, apiServerClient };
