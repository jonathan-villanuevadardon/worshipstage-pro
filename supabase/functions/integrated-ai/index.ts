import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.111.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, DELETE, OPTIONS",
};

const MAX_HISTORY_RECORDS = 20;
const MAX_MESSAGE_LENGTH = 4000;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_IMAGES = 3;
const DEFAULT_MODEL = "vendouple/laguna-s-2.1:free";
const DEFAULT_PROVIDER_URL = "https://gen.pollinations.ai/v1/chat/completions";
const DEFAULT_ANONYMOUS_URL = "https://text.pollinations.ai";
const systemPrompt = [
  "Eres el asistente de WorshipStage Pro, una aplicación para organizar iglesias,",
  "equipos de alabanza, repertorios, canciones y servicios.",
  "Responde en el idioma del usuario, de forma clara, práctica y respetuosa.",
  "No inventes información privada de la iglesia ni afirmes haber modificado datos.",
].join(" ");

type ContentBlock = { type: "text"; text: string } | { type: "image"; image: string };
type HistoryRecord = { role: string; content: unknown };

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function sseResponse(content: string) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({
        type: "content",
        data: { content },
      })}\n\n`));
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({
        type: "completed",
        data: { content: "[COMPLETED]" },
      })}\n\n`));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      ...corsHeaders,
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}

function assistantText(content: unknown) {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content
    .filter((event) => event && typeof event === "object" && ["content", "reasoning"].includes(String(event.type)))
    .map((event) => String(event?.data?.content || ""))
    .join("");
}

function userText(content: unknown) {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content
    .filter((block) => block?.type === "text")
    .map((block) => String(block.text || ""))
    .join("\n");
}

function mapHistory(records: HistoryRecord[]) {
  return records
    .map((record) => ({
      role: record.role === "assistant" ? "assistant" : "user",
      content: record.role === "assistant" ? assistantText(record.content) : userText(record.content),
    }))
    .filter((message) => message.content);
}

function getProviderKey() {
  const raw = Deno.env.get("AI_CHAT_API_KEY")
    || Deno.env.get("POLLINATIONS_API_KEY")
    || Deno.env.get("INTEGRATED_AI_API_KEY");
  if (!raw) return null;

  const trimmed = raw.trim().replace(/^['"]|['"]$/g, "");
  const assignment = trimmed.match(/^(?:AI_CHAT_API_KEY|POLLINATIONS_API_KEY|INTEGRATED_AI_API_KEY)\s*=\s*(.+)$/);
  return (assignment?.[1] || trimmed).trim().replace(/^['"]|['"]$/g, "");
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }
  return btoa(binary);
}

async function fileToDataUrl(file: File) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    throw new Error("Formato de imagen no compatible.");
  }
  if (file.size > MAX_IMAGE_BYTES) throw new Error("Cada imagen debe pesar 5 MB o menos.");
  const bytes = new Uint8Array(await file.arrayBuffer());
  return `data:${file.type};base64,${bytesToBase64(bytes)}`;
}

async function generateWithConfiguredProvider(
  history: Array<{ role: string; content: string }>,
  message: string,
  images: File[],
) {
  const apiKey = getProviderKey();
  if (!apiKey) return null;

  const userContent: unknown = images.length
    ? [
        { type: "text", text: message },
        ...await Promise.all(images.map(async (file) => ({
          type: "image_url",
          image_url: { url: await fileToDataUrl(file), detail: "auto" },
        }))),
      ]
    : message;
  const response = await fetch(Deno.env.get("AI_CHAT_API_URL") || DEFAULT_PROVIDER_URL, {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: Deno.env.get("AI_CHAT_MODEL") || DEFAULT_MODEL,
      stream: false,
      messages: [
        { role: "system", content: systemPrompt },
        ...history,
        { role: "user", content: userContent },
      ],
    }),
  });
  if (!response.ok) {
    const body = (await response.text()).slice(0, 500);
    if (response.status === 401) {
      throw new Error("La clave AI_CHAT_API_KEY no fue aceptada por Pollinations. Reemplázala por una clave real sk_ o pk_ generada en enter.pollinations.ai.");
    }
    throw new Error(`El proveedor de IA respondió ${response.status}: ${body}`);
  }
  const payload = await response.json();
  const content = payload?.choices?.[0]?.message?.content;
  if (!content || typeof content !== "string") throw new Error("El proveedor de IA devolvió una respuesta vacía.");
  return content.trim();
}

async function generateAnonymous(history: Array<{ role: string; content: string }>, message: string) {
  const condensedHistory = history.slice(-8)
    .map((item) => `${item.role === "assistant" ? "Asistente" : "Usuario"}: ${item.content}`)
    .join("\n");
  const prompt = [
    systemPrompt,
    condensedHistory && `Conversación anterior:\n${condensedHistory}`,
    `Usuario: ${message}`,
    "Asistente:",
  ].filter(Boolean).join("\n\n").slice(-7000);
  const model = Deno.env.get("AI_CHAT_MODEL") || DEFAULT_MODEL;
  const url = `${DEFAULT_ANONYMOUS_URL}/${encodeURIComponent(prompt)}?model=${encodeURIComponent(model)}`;
  const response = await fetch(url, { headers: { "Accept": "text/plain" } });
  if (!response.ok) {
    throw new Error(response.status === 429
      ? "El servicio de IA alcanzó temporalmente su límite. Intenta nuevamente en unos minutos."
      : `El servicio de IA no está disponible (${response.status}).`);
  }
  const content = (await response.text()).trim();
  if (!content) throw new Error("El servicio de IA devolvió una respuesta vacía.");
  return content;
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST" && request.method !== "DELETE") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const authorization = request.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return jsonResponse({ error: "Debes iniciar sesión para usar el chat de IA." }, 401);
  }
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) return jsonResponse({ error: "La configuración del servidor está incompleta." }, 500);

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const token = authorization.slice("Bearer ".length);
  const { data: authData, error: authError } = await admin.auth.getUser(token);
  if (authError || !authData.user) return jsonResponse({ error: "La sesión no es válida." }, 401);
  const { data: profile, error: profileError } = await admin
    .from("users").select("id,status").eq("id", authData.user.id).single();
  if (profileError || !profile || profile.status !== "active") {
    return jsonResponse({ error: "Tu cuenta debe estar activa para usar el chat de IA." }, 403);
  }

  if (request.method === "DELETE") {
    const { error } = await admin.from("integrated_ai_messages").delete().eq("user_id", profile.id);
    return error ? jsonResponse({ error: error.message }, 400) : jsonResponse({ cleared: true });
  }

  try {
    const formData = await request.formData();
    let contentBlocks: ContentBlock[];
    try {
      contentBlocks = JSON.parse(String(formData.get("message") || ""));
    } catch {
      return jsonResponse({ error: "El mensaje no tiene un formato válido." }, 400);
    }
    const message = userText(contentBlocks).trim();
    if (!message) return jsonResponse({ error: "Escribe un mensaje antes de enviarlo." }, 400);
    if (message.length > MAX_MESSAGE_LENGTH) {
      return jsonResponse({ error: `El mensaje no puede superar ${MAX_MESSAGE_LENGTH} caracteres.` }, 400);
    }

    const images = formData.getAll("images").filter((item): item is File => item instanceof File);
    if (images.length > MAX_IMAGES) return jsonResponse({ error: `Puedes adjuntar hasta ${MAX_IMAGES} imágenes.` }, 400);
    const providerKey = getProviderKey();
    if (images.length && !providerKey) {
      return jsonResponse({ error: "El chat de texto ya está disponible. Para analizar imágenes se debe configurar AI_CHAT_API_KEY en Supabase." }, 400);
    }

    const oneMinuteAgo = new Date(Date.now() - 60_000).toISOString();
    const { count } = await admin.from("integrated_ai_messages")
      .select("id", { count: "exact", head: true })
      .eq("user_id", profile.id).eq("role", "user").gte("created", oneMinuteAgo);
    if ((count || 0) >= 8) {
      return jsonResponse({ error: "Has enviado muchos mensajes. Espera un minuto e intenta nuevamente." }, 429);
    }

    const { data: records, error: historyError } = await admin.from("integrated_ai_messages")
      .select("role,content,created").eq("user_id", profile.id)
      .order("created", { ascending: false }).limit(MAX_HISTORY_RECORDS);
    if (historyError) throw historyError;
    const history = mapHistory((records || []).reverse());
    const answer = await generateWithConfiguredProvider(history, message, images)
      || await generateAnonymous(history, message);

    const assistantEvents = [{ type: "content", data: { content: answer } }];
    const { error: saveError } = await admin.from("integrated_ai_messages").insert([
      { user_id: profile.id, role: "user", content: contentBlocks },
      { user_id: profile.id, role: "assistant", content: assistantEvents },
    ]);
    if (saveError) throw saveError;
    return sseResponse(answer);
  } catch (error) {
    console.error("integrated-ai error", error);
    return jsonResponse({ error: error instanceof Error ? error.message : "No fue posible generar una respuesta." }, 502);
  }
});
