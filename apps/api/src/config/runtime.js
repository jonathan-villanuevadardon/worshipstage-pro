function normalizeBaseUrl(value, fallback) {
	return (value?.trim() || fallback).replace(/\/+$/, '');
}

export const SUPABASE_URL = normalizeBaseUrl(
	process.env.SUPABASE_URL,
	'https://dmwkgxzkwilzwssoejuk.supabase.co',
);

export const SUPABASE_PUBLISHABLE_KEY = (
	process.env.SUPABASE_PUBLISHABLE_KEY
	|| 'sb_publishable_zCpWrpH602hsS5Mdggtnig_oqFrMik0'
).trim();

export const CORS_ORIGINS = (process.env.CORS_ORIGIN || '')
	.split(',')
	.map((origin) => origin.trim())
	.filter(Boolean);
