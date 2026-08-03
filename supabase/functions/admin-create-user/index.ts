import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.111.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const assignableRoles = new Set([
  "church_admin",
  "pastor",
  "worship_leader",
  "musician",
  "volunteer",
]);

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  const authorization = request.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return jsonResponse({ error: "Authentication required" }, 401);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ error: "Server configuration is incomplete" }, 500);
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  const token = authorization.slice("Bearer ".length);
  const { data: authData, error: authError } = await admin.auth.getUser(token);
  if (authError || !authData.user) return jsonResponse({ error: "Invalid session" }, 401);

  const { data: caller, error: callerError } = await admin
    .from("users")
    .select("role,status,organization_id")
    .eq("id", authData.user.id)
    .single();

  const managerRoles = new Set(["super_admin", "church_admin", "pastor", "worship_leader"]);
  if (callerError || !caller || caller.status !== "active" || !managerRoles.has(caller.role)) {
    return jsonResponse({ error: "You do not have permission to create users" }, 403);
  }

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const email = String(payload.email || "").trim().toLowerCase();
  const password = String(payload.password || "");
  const firstName = String(payload.first_name || "").trim();
  const lastName = String(payload.last_name || "").trim();
  const role = String(payload.role || "volunteer");
  const requestedOrganization = String(payload.organization_id || "");

  if (!email || !email.includes("@") || password.length < 8 || !firstName) {
    return jsonResponse({ error: "Email, first name and a password of at least 8 characters are required" }, 400);
  }
  if (!assignableRoles.has(role)) return jsonResponse({ error: "Invalid role" }, 400);
  if (role === "church_admin" && caller.role !== "super_admin") {
    return jsonResponse({ error: "Only a super admin can create a church admin" }, 403);
  }

  const organizationId = caller.role === "super_admin"
    ? (requestedOrganization || caller.organization_id)
    : caller.organization_id;
  if (!organizationId) return jsonResponse({ error: "An organization is required" }, 400);

  const { data: organization, error: organizationError } = await admin
    .from("organizations")
    .select("id")
    .eq("id", organizationId)
    .eq("status", "active")
    .single();
  if (organizationError || !organization) return jsonResponse({ error: "Invalid organization" }, 400);

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      first_name: firstName,
      last_name: lastName,
      organization_id: organizationId,
    },
  });

  if (createError || !created.user) {
    return jsonResponse({ error: createError?.message || "Unable to create user" }, 400);
  }

  const { data: profile, error: profileError } = await admin
    .from("users")
    .update({
      first_name: firstName,
      last_name: lastName,
      role,
      status: "active",
      organization_id: organizationId,
      updated: new Date().toISOString(),
    })
    .eq("id", created.user.id)
    .select("id,email,first_name,last_name,role,status,organization_id")
    .single();

  if (profileError || !profile) {
    await admin.auth.admin.deleteUser(created.user.id);
    return jsonResponse({ error: "Unable to create the user profile" }, 500);
  }

  return jsonResponse({ user: profile }, 201);
});
