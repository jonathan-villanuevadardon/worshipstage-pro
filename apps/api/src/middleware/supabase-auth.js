import { createSupabaseClient } from '../utils/supabaseClient.js';

function authError(message, status = 401) {
  const error = new Error(message);
  error.status = status;
  return error;
}

export async function supabaseAuth(req, _res, next) {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (scheme !== 'Bearer' || !token) {
    return next(authError('A valid Supabase bearer token is required.'));
  }

  try {
    const client = createSupabaseClient(token);
    const { data: { user }, error: authErrorResult } = await client.auth.getUser(token);
    if (authErrorResult || !user) throw authErrorResult || new Error('Invalid session');

    const { data: profile, error: profileError } = await client
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
    if (profileError || !profile) throw profileError || new Error('Profile not found');
    if (profile.status !== 'active') return next(authError('This account is inactive.', 403));
    if (!user.email_confirmed_at) return next(authError('Please verify your email before continuing.', 403));

    req.supabase = client;
    req.userId = user.id;
    req.user = profile;
    next();
  } catch (error) {
    next(authError(error?.message || 'Invalid or expired Supabase session.'));
  }
}
