import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.111.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

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
    .select("id,role,status,organization_id")
    .eq("id", authData.user.id)
    .single();

  if (callerError || !caller || caller.status !== "active") {
    return jsonResponse({ error: "Active administrator account required" }, 403);
  }

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const action = String(payload.action || "");
  const targetUserId = String(payload.target_user_id || "");
  if (!targetUserId) return jsonResponse({ error: "Target user is required" }, 400);
  if (targetUserId === caller.id) {
    return jsonResponse({ error: "You cannot manage your own account from this action" }, 400);
  }

  const { data: target, error: targetError } = await admin
    .from("users")
    .select("id,email,role,status,organization_id")
    .eq("id", targetUserId)
    .single();

  if (targetError || !target) return jsonResponse({ error: "User not found" }, 404);
  if (target.role === "super_admin") {
    return jsonResponse({ error: "Super Admin accounts cannot be changed here" }, 403);
  }

  if (action === "delete") {
    if (caller.role !== "super_admin") {
      return jsonResponse({ error: "Only a Super Admin can permanently delete users" }, 403);
    }

    const { error: deleteError } = await admin.auth.admin.deleteUser(targetUserId);
    if (deleteError) return jsonResponse({ error: deleteError.message }, 400);

    return jsonResponse({ deleted: true, user_id: targetUserId });
  }

  if (action === "set_status") {
    const statusManagers = new Set(["super_admin", "church_admin", "pastor"]);
    if (!statusManagers.has(caller.role)) {
      return jsonResponse({ error: "You do not have permission to change user status" }, 403);
    }
    if (caller.role !== "super_admin" && target.organization_id !== caller.organization_id) {
      return jsonResponse({ error: "You can only manage users in your church" }, 403);
    }

    const status = String(payload.status || "");
    if (status !== "active" && status !== "inactive") {
      return jsonResponse({ error: "Status must be active or inactive" }, 400);
    }

    const { data: updated, error: updateError } = await admin
      .from("users")
      .update({ status, updated: new Date().toISOString() })
      .eq("id", targetUserId)
      .select("id,email,role,status,organization_id")
      .single();

    if (updateError || !updated) {
      return jsonResponse({ error: updateError?.message || "Unable to update user status" }, 400);
    }

    return jsonResponse({ user: updated });
  }

  return jsonResponse({ error: "Invalid action" }, 400);
});
