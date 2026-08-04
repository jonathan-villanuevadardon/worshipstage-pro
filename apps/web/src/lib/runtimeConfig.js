function normalizeBaseUrl(value, fallback) {
	return (value?.trim() || fallback).replace(/\/+$/, '');
}

export const SUPABASE_URL = normalizeBaseUrl(
	import.meta.env.VITE_SUPABASE_URL,
	'https://dmwkgxzkwilzwssoejuk.supabase.co',
);

export const SUPABASE_PUBLISHABLE_KEY = (
	import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
	|| 'sb_publishable_zCpWrpH602hsS5Mdggtnig_oqFrMik0'
).trim();

export const API_SERVER_URL = normalizeBaseUrl(
	import.meta.env.VITE_API_SERVER_URL,
	'/hcgi/api',
);

const browserOrigin = typeof window === 'undefined' ? '' : window.location.origin;

export const APP_URL = normalizeBaseUrl(
	import.meta.env.VITE_APP_URL,
	import.meta.env.PROD
		? 'https://cyan-duck-221179.hostingersite.com'
		: browserOrigin,
);
