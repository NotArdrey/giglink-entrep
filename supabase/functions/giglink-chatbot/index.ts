import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.1-8b-instant";
const MAX_MESSAGES = 10;
const MAX_MESSAGE_LENGTH = 1200;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type ChatRole = "user" | "assistant";

interface ChatMessage {
  role?: string;
  content?: unknown;
}

interface ChatContext {
  currentView?: unknown;
  isLoggedIn?: unknown;
  role?: unknown;
}

interface ChatRequestBody {
  messages?: ChatMessage[];
  context?: ChatContext;
}

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });

const normalizeMessage = (message: ChatMessage): { role: ChatRole; content: string } | null => {
  const role = message.role === "assistant" ? "assistant" : "user";
  const content = typeof message.content === "string" ? message.content.trim() : "";

  if (!content) return null;

  return {
    role,
    content: content.slice(0, MAX_MESSAGE_LENGTH),
  };
};

const normalizeContextValue = (value: unknown, fallback: string) => {
  if (typeof value !== "string") return fallback;
  const cleanValue = value.trim().replace(/[^a-z0-9_\-\s]/gi, "").slice(0, 60);
  return cleanValue || fallback;
};

const buildSystemPrompt = (context: ChatContext = {}) => {
  const currentView = normalizeContextValue(context.currentView, "landing");
  const role = normalizeContextValue(context.role, "guest");
  const isLoggedIn = Boolean(context.isLoggedIn);

  return [
    "You are the GigLink Assistant inside a local-service marketplace web app.",
    "Help users understand service discovery, bookings, seller onboarding, quotes, scheduling, payments, refunds, profile settings, and account navigation.",
    "Keep answers concise, practical, and specific to GigLink.",
    "Do not claim to access private account data, bookings, payments, or database records unless the user provides the details in the chat.",
    "If a user needs account-specific help, explain the relevant screen or next step without inventing private status.",
    "For payments and refunds, give app-navigation guidance and remind users to follow in-app confirmation flows.",
    `Current app view: ${currentView}.`,
    `User login state: ${isLoggedIn ? "logged in" : "guest"}.`,
    `User role: ${role}.`,
  ].join("\n");
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  try {
    const groqApiKey = Deno.env.get("GROQ_API_KEY")?.trim();
    if (!groqApiKey) {
      console.error("giglink-chatbot missing GROQ_API_KEY secret");
      return jsonResponse({ error: "The assistant is not configured yet." }, 503);
    }

    let body: ChatRequestBody;
    try {
      body = await req.json();
    } catch {
      return jsonResponse({ error: "Invalid request body." }, 400);
    }

    const messages = (Array.isArray(body.messages) ? body.messages : [])
      .map(normalizeMessage)
      .filter((message): message is { role: ChatRole; content: string } => Boolean(message))
      .slice(-MAX_MESSAGES);

    if (messages.length === 0) {
      return jsonResponse({ error: "A message is required." }, 400);
    }

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${groqApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: "system", content: buildSystemPrompt(body.context) },
          ...messages,
        ],
        temperature: 0.4,
        max_completion_tokens: 420,
      }),
    });

    if (!response.ok) {
      const providerBody = await response.text();
      console.error("giglink-chatbot provider error", {
        status: response.status,
        body: providerBody.slice(0, 500),
      });
      return jsonResponse({ error: "The assistant could not answer right now." }, 502);
    }

    const payload = await response.json();
    const content = typeof payload?.choices?.[0]?.message?.content === "string"
      ? payload.choices[0].message.content.trim()
      : "";

    if (!content) {
      return jsonResponse({ error: "The assistant returned an empty response." }, 502);
    }

    return jsonResponse({
      message: content.slice(0, 2000),
      model: payload?.model || GROQ_MODEL,
    });
  } catch (error) {
    console.error("giglink-chatbot unexpected error", error);
    return jsonResponse({ error: "The assistant is unavailable right now." }, 500);
  }
});
