import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.104.1";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_GROQ_MODEL = "llama-3.1-8b-instant";
const MAX_MESSAGES = 10;
const MAX_MESSAGE_LENGTH = 1200;
const MAX_MARKETPLACE_ROWS = 120;
const MAX_MARKETPLACE_MATCHES = 8;
const MAX_BOOKING_MATCHES = 6;

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

interface MarketplaceRecord {
  id: number | string;
  title: string;
  providerName: string;
  serviceType: string;
  description: string;
  location: string;
  priceLabel: string;
  amount: number | null;
  currency: string;
  rateBasis: string;
  bookingMode: string;
  pricingModel: string;
  rating: number | null;
  reviews: number;
  createdAt: string;
  searchableText: string;
  score: number;
}

interface MarketplaceSearch {
  isMarketplaceIntent: boolean;
  isPriceIntent: boolean;
  records: MarketplaceRecord[];
  queryTerms: string[];
  totalFetched: number;
  error?: string;
}

interface BookingRecord {
  id: string;
  status: string;
  serviceTitle: string;
  providerName: string;
  participantRole: string;
  scheduleLabel: string;
  priceLabel: string;
  paymentMethod: string;
  quoteApproved: boolean | null;
  updatedAt: string;
}

interface BookingLookup {
  isBookingIntent: boolean;
  records: BookingRecord[];
  error?: string;
}

const viewGuidance: Record<string, string> = {
  "client-dashboard": "The user is on the home dashboard. Point them to Browse, Bookings, My Work, Profile, or Settings based on intent.",
  "browse-services": "The user is browsing services. Help them search, compare providers, inspect profiles, ask for quotes, and start bookings.",
  "my-bookings": "The user is on My Bookings. Help with booking status, schedule changes, payments, reviews, cancellations, and refunds without inventing account data.",
  "my-work": "The user is in seller tools. Help with service listings, schedule slots, quote handling, payment options, and profile setup.",
  "worker-dashboard": "The user is in a worker dashboard. Help improve listings, manage availability, and understand seller workflows.",
  profile: "The user is on Profile. Help with public profile details, location, photo, portfolio, and account-facing profile actions.",
  "account-settings": "The user is in account and privacy settings. Help with password, privacy, verification, and account information.",
  settings: "The user is in Settings. Help with theme, language, notification, and preference changes.",
  landing: "The user may not be logged in. Explain public browsing, login, signup, and seller onboarding at a high level.",
};

const marketplaceIntentTerms = [
  "service",
  "services",
  "provider",
  "providers",
  "worker",
  "workers",
  "price",
  "prices",
  "pricing",
  "cost",
  "costs",
  "rate",
  "rates",
  "quote",
  "quotes",
  "book",
  "booking",
  "compare",
  "find",
  "search",
  "near",
  "available",
  "cleaner",
  "cleaning",
  "tutor",
  "tutorial",
  "technician",
  "repair",
  "electrician",
  "plumber",
  "laundry",
  "wellness",
  "grooming",
];

const bookingIntentTerms = [
  "appointment",
  "appointments",
  "booked",
  "booking",
  "bookings",
  "cancel",
  "cancelled",
  "confirmed",
  "message",
  "messages",
  "my booking",
  "my bookings",
  "pay",
  "payment",
  "payments",
  "pending",
  "refund",
  "refunds",
  "reschedule",
  "schedule",
  "scheduled",
  "status",
];

const priceIntentTerms = [
  "price",
  "prices",
  "pricing",
  "cost",
  "costs",
  "rate",
  "rates",
  "fee",
  "fees",
  "quote",
  "quotes",
  "budget",
  "cheap",
  "cheapest",
  "affordable",
  "how much",
  "php",
  "peso",
  "pesos",
  "\u20b1",
];

const searchStopWords = new Set([
  "a",
  "about",
  "all",
  "an",
  "and",
  "any",
  "are",
  "around",
  "ask",
  "available",
  "book",
  "booking",
  "budget",
  "can",
  "cheap",
  "cheapest",
  "compare",
  "cost",
  "costs",
  "do",
  "fee",
  "fees",
  "find",
  "for",
  "from",
  "get",
  "giglink",
  "have",
  "help",
  "how",
  "i",
  "in",
  "is",
  "list",
  "looking",
  "max",
  "maximum",
  "me",
  "near",
  "need",
  "of",
  "on",
  "or",
  "php",
  "please",
  "price",
  "prices",
  "pricing",
  "provider",
  "providers",
  "quote",
  "quotes",
  "rate",
  "rates",
  "search",
  "service",
  "services",
  "show",
  "that",
  "the",
  "to",
  "under",
  "up",
  "what",
  "with",
  "within",
  "you",
]);

const shortcutReplies: Record<string, string> = {
  hi: "Hi. What would you like to do in GigLink: find a service, check a booking, or set up seller tools?",
  hello: "Hi. What would you like to do in GigLink: find a service, check a booking, or set up seller tools?",
  hey: "Hi. What would you like to do in GigLink: find a service, check a booking, or set up seller tools?",
  help: "I can help with services, bookings, seller setup, quotes, payments, refunds, profiles, or settings. What are you trying to do right now?",
  qr: "Do you mean a seller payment QR, identity verification, or a booking payment step?",
  id: "Do you mean identity verification, your profile details, or an account issue?",
  ok: "Got it. What would you like to do next in GigLink?",
};

const lowConfidenceRepliesByView: Record<string, string> = {
  "browse-services": "I did not catch that yet. Are you trying to search providers, compare a service, or start a booking?",
  "my-bookings": "I did not catch that yet. Are you checking a booking, rescheduling, paying, or asking about a refund?",
  "my-work": "I did not catch that yet. Are you updating services, editing slots, handling quotes, or setting payment options?",
  "worker-dashboard": "I did not catch that yet. Are you improving your listing, checking work, or managing your schedule?",
  profile: "I did not catch that yet. Are you updating profile details, location, privacy, or account information?",
  "account-settings": "I did not catch that yet. Are you changing your password, privacy settings, or identity verification details?",
  settings: "I did not catch that yet. Are you changing theme, language, or notification preferences?",
};

const defaultLowConfidenceReply =
  "I did not catch that yet. Are you trying to find a service, check a booking, manage seller work, or handle payments?";

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

const normalizeSignal = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");

const isLowConfidenceMessage = (value: string) => {
  const compactValue = normalizeSignal(value.trim());

  if (!compactValue || shortcutReplies[compactValue]) return false;
  if (compactValue.length <= 2) return true;
  if (compactValue.length <= 4 && /^([a-z0-9])\1+$/.test(compactValue)) return true;

  return false;
};

const buildDeterministicReply = (latestUserMessage: string, context: ChatContext = {}) => {
  const compactValue = normalizeSignal(latestUserMessage);

  if (shortcutReplies[compactValue]) {
    return shortcutReplies[compactValue];
  }

  if (!isLowConfidenceMessage(latestUserMessage)) {
    return "";
  }

  const currentView = normalizeContextValue(context.currentView, "landing");
  return lowConfidenceRepliesByView[currentView] || defaultLowConfidenceReply;
};

const getText = (value: unknown) => (typeof value === "string" ? value.trim() : "");

const getNumberOrNull = (value: unknown) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string") return null;

  const parsed = Number(value.replace(/,/g, "").trim());
  return Number.isFinite(parsed) ? parsed : null;
};

const getObject = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
};

const getRelatedObject = (value: unknown): Record<string, unknown> => {
  if (Array.isArray(value)) return getObject(value[0]);
  return getObject(value);
};

const shorten = (value: string, maxLength = 150) => {
  const cleanValue = value.replace(/\s+/g, " ").trim();
  if (cleanValue.length <= maxLength) return cleanValue;
  return `${cleanValue.slice(0, maxLength - 1).trim()}...`;
};

const tokenize = (value: string) =>
  (value.toLowerCase().replace(/\u20b1/g, " php ").match(/[a-z0-9]+/g) || []);

const hasAnyTerm = (value: string, terms: string[]) => {
  const lowerValue = value.toLowerCase();
  return terms.some((term) => lowerValue.includes(term));
};

const getSearchTerms = (value: string) =>
  tokenize(value)
    .filter((term) => term.length > 1)
    .filter((term) => !/^\d+$/.test(term))
    .filter((term) => !searchStopWords.has(term))
    .slice(0, 8);

const extractPriceLimit = (value: string) => {
  const normalized = value.replace(/,/g, "");
  const patterns = [
    /(?:under|below|less than|maximum|max|budget|within|up to)\s*(?:php|peso|pesos|\u20b1)?\s*([0-9]+(?:\.[0-9]+)?)/i,
    /(?:php|peso|pesos|\u20b1)\s*([0-9]+(?:\.[0-9]+)?)\s*(?:or less|below|max|maximum|budget)?/i,
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    if (!match?.[1]) continue;

    const amount = Number(match[1]);
    if (Number.isFinite(amount)) return amount;
  }

  return null;
};

const normalizeRateBasis = (value: unknown) => {
  const raw = getText(value).toLowerCase().replace(/_/g, "-");
  if (raw === "per-hour" || raw === "hourly") return "per-hour";
  if (raw === "per-day" || raw === "daily") return "per-day";
  if (raw === "per-week" || raw === "weekly") return "per-week";
  if (raw === "per-month" || raw === "monthly") return "per-month";
  if (raw === "per-project" || raw === "project" || raw === "package" || raw === "fixed") return "per-project";
  return "";
};

const getRateSuffix = (rateBasis: string) => {
  const suffixMap: Record<string, string> = {
    "per-hour": "hour",
    "per-day": "day",
    "per-week": "week",
    "per-month": "month",
    "per-project": "project",
  };

  return suffixMap[rateBasis] || "service";
};

const formatAmount = (amount: number) =>
  new Intl.NumberFormat("en-PH", {
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);

const normalizeMarketplaceRecord = (row: Record<string, unknown>): MarketplaceRecord => {
  const seller = getRelatedObject(row["sellers"] || row["seller"]);
  const metadata = getObject(row["metadata"]);
  const sellerMeta = getObject(seller["search_meta"]);
  const sellerLocation = getObject(sellerMeta["location"]);
  const amount = getNumberOrNull(row["base_price"]);
  const rateBasis = normalizeRateBasis(
    metadata["rate_basis"]
    || metadata["rateBasis"]
    || metadata["billing_unit"]
    || row["price_type"]
  ) || "per-project";
  const pricingModel = getText(metadata["pricing_model"] || metadata["pricingModel"] || row["pricing_model"]).toLowerCase();
  const priceType = getText(row["price_type"]).toLowerCase();
  const currency = getText(row["currency"] || seller["default_currency"]) || "PHP";
  const isInquiry = pricingModel === "inquiry" || priceType === "custom" || amount === null;
  const priceLabel = isInquiry
    ? "Price on inquiry"
    : `${currency} ${formatAmount(amount)}/${getRateSuffix(rateBasis)}`;
  const serviceType =
    getText(sellerMeta["service_type"])
    || getText(metadata["service_type"] || metadata["serviceType"])
    || "Service";
  const providerName =
    getText(seller["display_name"])
    || getText(sellerMeta["name"])
    || getText(row["title"])
    || "Service Provider";
  const city = getText(sellerLocation["city"] || seller["city"]);
  const province = getText(sellerLocation["province"] || seller["province"]);
  const barangay = getText(sellerLocation["barangay"] || seller["barangay"]);
  const location = [barangay, city, province].filter(Boolean).join(", ");
  const title = getText(row["title"]) || serviceType;
  const description =
    getText(row["short_description"])
    || getText(row["description"])
    || getText(seller["tagline"])
    || getText(seller["about"])
    || "Professional service available through GigLink.";
  const bookingMode =
    getText(metadata["booking_mode"] || metadata["bookingMode"] || sellerMeta["booking_mode"])
    || "with-slots";
  const rating = getNumberOrNull(row["rating"] || seller["avg_rating"]);
  const reviews = getNumberOrNull(row["reviews_count"] || seller["rating_count"]) || 0;
  const searchableText = [
    title,
    description,
    serviceType,
    providerName,
    location,
    getText(row["description"]),
    getText(seller["headline"]),
    getText(seller["tagline"]),
    getText(seller["about"]),
  ].join(" ").toLowerCase();

  return {
    id: getNumberOrNull(row["id"]) ?? getText(row["id"]) ?? "unknown",
    title,
    providerName,
    serviceType,
    description,
    location,
    priceLabel,
    amount,
    currency,
    rateBasis,
    bookingMode,
    pricingModel: pricingModel || (isInquiry ? "inquiry" : "fixed"),
    rating,
    reviews,
    createdAt: getText(row["created_at"]),
    searchableText,
    score: 0,
  };
};

const scoreMarketplaceRecord = (record: MarketplaceRecord, queryTerms: string[], priceLimit: number | null) => {
  let score = queryTerms.length === 0 ? 1 : 0;

  queryTerms.forEach((term) => {
    if (!record.searchableText.includes(term)) return;
    score += 2;
    if (record.title.toLowerCase().includes(term)) score += 2;
    if (record.serviceType.toLowerCase().includes(term)) score += 3;
    if (record.providerName.toLowerCase().includes(term)) score += 2;
    if (record.location.toLowerCase().includes(term)) score += 1;
  });

  if (priceLimit !== null) {
    if (record.amount !== null && record.amount <= priceLimit) score += 5;
    else if (record.amount !== null && record.amount > priceLimit) score -= 4;
    else score -= 1;
  }

  return score;
};

const createSupabaseClient = (req: Request) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim();
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim();
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")?.trim();
  const apiKey = serviceRoleKey || anonKey;

  if (!supabaseUrl || !apiKey) return null;

  return createClient(supabaseUrl, apiKey, {
    global: {
      headers: serviceRoleKey
        ? { "X-Client-Info": "giglink-chatbot" }
        : {
          Authorization: req.headers.get("Authorization") || `Bearer ${anonKey}`,
          "X-Client-Info": "giglink-chatbot",
        },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};

const getBearerToken = (req: Request) => {
  const authHeader = req.headers.get("Authorization") || "";
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || "";
};

const getAuthenticatedUserId = async (req: Request) => {
  const token = getBearerToken(req);
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")?.trim();

  if (!token || token === anonKey) return "";

  const supabase = createSupabaseClient(req);
  if (!supabase) return "";

  const { data, error } = await supabase.auth.getUser(token);
  if (error) {
    console.error("giglink-chatbot auth lookup error", {
      message: error.message,
      status: error.status,
    });
    return "";
  }

  return data.user?.id || "";
};

const formatDateTimeLabel = (value: unknown) => {
  const rawValue = getText(value);
  if (!rawValue) return "No schedule selected";

  const date = new Date(rawValue);
  if (Number.isNaN(date.getTime())) return rawValue;

  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

const getMetadataBoolean = (metadata: Record<string, unknown>, key: string) => {
  if (typeof metadata[key] === "boolean") return metadata[key] as boolean;
  if (typeof metadata[key] === "string") return metadata[key] === "true";
  return null;
};

const normalizeBookingRecord = (row: Record<string, unknown>, userId: string): BookingRecord => {
  const service = getRelatedObject(row["services"] || row["service"]);
  const seller = getRelatedObject(row["sellers"] || row["seller"]);
  const sellerMeta = getObject(seller["search_meta"]);
  const metadata = getObject(row["metadata"]);
  const serviceMetadata = getObject(service["metadata"]);
  const amount =
    getNumberOrNull(row["total_amount"])
    ?? getNumberOrNull(metadata["quote_amount"])
    ?? getNumberOrNull(metadata["quoteAmount"])
    ?? getNumberOrNull(service["base_price"]);
  const currency = getText(row["currency"] || service["currency"] || seller["default_currency"]) || "PHP";
  const rateBasis = normalizeRateBasis(
    serviceMetadata["rate_basis"]
    || serviceMetadata["rateBasis"]
    || service["price_type"]
  ) || "per-project";
  const priceLabel = amount === null
    ? "Price on inquiry"
    : `${currency} ${formatAmount(amount)}/${getRateSuffix(rateBasis)}`;
  const serviceTitle =
    getText(service["title"])
    || getText(metadata["service_type"] || metadata["serviceType"])
    || "Service";
  const providerName =
    getText(seller["display_name"])
    || getText(sellerMeta["name"])
    || getText(metadata["worker_name"] || metadata["workerName"])
    || "Service Provider";
  const participantRole = String(row["seller_id"] || "") === userId ? "seller" : "client";
  const startLabel = formatDateTimeLabel(row["start_ts"]);
  const endLabel = getText(row["end_ts"]) ? formatDateTimeLabel(row["end_ts"]) : "";
  const paymentMethod = getText(metadata["payment_method"] || metadata["paymentMethod"]) || "Not selected";

  return {
    id: getText(row["id"]),
    status: getText(row["status"]) || "pending",
    serviceTitle,
    providerName,
    participantRole,
    scheduleLabel: endLabel && startLabel !== "No schedule selected" ? `${startLabel} to ${endLabel}` : startLabel,
    priceLabel,
    paymentMethod,
    quoteApproved: getMetadataBoolean(metadata, "quote_approved"),
    updatedAt: getText(row["updated_at"]),
  };
};

const fetchBookingLookup = async (
  req: Request,
  latestUserMessage: string,
  context: ChatContext = {}
): Promise<BookingLookup> => {
  const currentView = normalizeContextValue(context.currentView, "landing");
  const isBookingIntent =
    currentView === "my-bookings"
    || hasAnyTerm(latestUserMessage, bookingIntentTerms);

  const baseLookup: BookingLookup = {
    isBookingIntent,
    records: [],
  };

  if (!isBookingIntent) return baseLookup;

  if (!Boolean(context.isLoggedIn)) {
    return {
      ...baseLookup,
      error: "User is not logged in, so private bookings cannot be loaded.",
    };
  }

  const userId = await getAuthenticatedUserId(req);
  if (!userId) {
    return {
      ...baseLookup,
      error: "Authenticated user could not be verified for booking lookup.",
    };
  }

  const supabase = createSupabaseClient(req);
  if (!supabase) {
    return {
      ...baseLookup,
      error: "Supabase is not configured for booking lookup.",
    };
  }

  const selectColumns =
    "id,service_id,seller_id,buyer_id,slot_id,start_ts,end_ts,status,total_amount,currency,metadata,created_at,updated_at,services(id,title,price_type,base_price,currency,metadata),sellers(user_id,display_name,default_currency,search_meta)";
  let bookingRows: Record<string, unknown>[] = [];

  const { data, error } = await supabase
    .from("bookings")
    .select(selectColumns)
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .order("updated_at", { ascending: false })
    .limit(MAX_BOOKING_MATCHES);

  if (error) {
    console.error("giglink-chatbot booking lookup relation error", {
      message: error.message,
      code: error.code,
      details: error.details,
    });

    const fallback = await supabase
      .from("bookings")
      .select("id,service_id,seller_id,buyer_id,slot_id,start_ts,end_ts,status,total_amount,currency,metadata,created_at,updated_at")
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
      .order("updated_at", { ascending: false })
      .limit(MAX_BOOKING_MATCHES);

    if (fallback.error) {
      console.error("giglink-chatbot booking lookup error", {
        message: fallback.error.message,
        code: fallback.error.code,
        details: fallback.error.details,
      });
      return {
        ...baseLookup,
        error: "Unable to load recent bookings.",
      };
    }

    bookingRows = (fallback.data || []) as Record<string, unknown>[];
  } else {
    bookingRows = (data || []) as Record<string, unknown>[];
  }

  return {
    ...baseLookup,
    records: bookingRows.map((row) => normalizeBookingRecord(row, userId)),
  };
};

const fetchMarketplaceSearch = async (
  req: Request,
  latestUserMessage: string,
  context: ChatContext = {}
): Promise<MarketplaceSearch> => {
  const currentView = normalizeContextValue(context.currentView, "landing");
  const isPriceIntent = hasAnyTerm(latestUserMessage, priceIntentTerms);
  const isMarketplaceIntent =
    currentView === "browse-services"
    || isPriceIntent
    || hasAnyTerm(latestUserMessage, marketplaceIntentTerms);

  const baseSearch: MarketplaceSearch = {
    isMarketplaceIntent,
    isPriceIntent,
    records: [],
    queryTerms: getSearchTerms(latestUserMessage),
    totalFetched: 0,
  };

  if (!isMarketplaceIntent) return baseSearch;

  const supabase = createSupabaseClient(req);
  if (!supabase) {
    return {
      ...baseSearch,
      error: "Supabase is not configured for marketplace search.",
    };
  }

  const selectColumns =
    "id,title,slug,description,short_description,price_type,base_price,currency,duration_minutes,active,metadata,created_at,sellers(user_id,display_name,headline,tagline,about,profile_photo,avatar_url,is_verified,verification_status,response_time_minutes,default_currency,search_meta)";

  const query = supabase
    .from("services")
    .select(selectColumns)
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(MAX_MARKETPLACE_ROWS);

  const { data, error } = await query;

  if (error) {
    console.error("giglink-chatbot marketplace search error", {
      message: error.message,
      code: error.code,
      details: error.details,
    });
    return {
      ...baseSearch,
      error: "Unable to load active marketplace services.",
    };
  }

  const priceLimit = extractPriceLimit(latestUserMessage);
  const normalizedRecords = ((data || []) as Record<string, unknown>[])
    .map(normalizeMarketplaceRecord)
    .map((record) => ({
      ...record,
      score: scoreMarketplaceRecord(record, baseSearch.queryTerms, priceLimit),
    }));
  const hasSearchFilters = baseSearch.queryTerms.length > 0 || priceLimit !== null;
  const matches = normalizedRecords
    .filter((record) => !hasSearchFilters || record.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (isPriceIntent && a.amount !== null && b.amount !== null) return a.amount - b.amount;
      if (isPriceIntent && a.amount !== null) return -1;
      if (isPriceIntent && b.amount !== null) return 1;
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    })
    .slice(0, MAX_MARKETPLACE_MATCHES);

  return {
    ...baseSearch,
    records: matches,
    totalFetched: normalizedRecords.length,
  };
};

const buildMarketplacePromptContext = (marketplaceSearch: MarketplaceSearch) => {
  if (!marketplaceSearch.isMarketplaceIntent) {
    return "No marketplace database lookup was needed for this message.";
  }

  if (marketplaceSearch.error) {
    return `Marketplace database lookup failed: ${marketplaceSearch.error}. Do not invent provider names or prices.`;
  }

  if (marketplaceSearch.records.length === 0) {
    return [
      "Marketplace database lookup found no matching active service records for the user's latest query.",
      `Active service rows scanned: ${marketplaceSearch.totalFetched}.`,
      "Tell the user no matching listing was found and ask for a broader service type, location, or budget.",
    ].join("\n");
  }

  return [
    "Marketplace database lookup results from active services. Use these exact records for provider and price answers:",
    ...marketplaceSearch.records.map((record, index) => (
      `${index + 1}. service_id=${record.id}; service="${record.title}"; provider="${record.providerName}"; type="${record.serviceType}"; location="${record.location || "Not specified"}"; price="${record.priceLabel}"; booking="${record.bookingMode}"; rating="${record.rating ?? "New"}"; reviews=${record.reviews}; description="${shorten(record.description, 120)}"`
    )),
  ].join("\n");
};

const buildBookingPromptContext = (bookingLookup: BookingLookup) => {
  if (!bookingLookup.isBookingIntent) {
    return "No private booking database lookup was needed for this message.";
  }

  if (bookingLookup.error) {
    return `Private booking database lookup was not available: ${bookingLookup.error}. Do not invent booking status.`;
  }

  if (bookingLookup.records.length === 0) {
    return "Private booking database lookup found no recent bookings for the signed-in user.";
  }

  return [
    "Private booking database lookup results for the signed-in user. Use these exact records for booking-status answers:",
    ...bookingLookup.records.map((record, index) => (
      `${index + 1}. booking_id=${record.id}; role="${record.participantRole}"; service="${record.serviceTitle}"; provider="${record.providerName}"; status="${record.status}"; schedule="${record.scheduleLabel}"; price="${record.priceLabel}"; payment="${record.paymentMethod}"; quote_approved="${record.quoteApproved ?? "unknown"}"; updated_at="${record.updatedAt}"`
    )),
  ].join("\n");
};

const buildBookingFallbackReply = (bookingLookup: BookingLookup) => {
  if (!bookingLookup.isBookingIntent) return "";

  if (bookingLookup.error) {
    return "I could not load your current booking data right now. Open Bookings to check the latest status, payments, or messages.";
  }

  if (bookingLookup.records.length === 0) {
    return "I checked your GigLink bookings and did not find any recent booking records. You can start one from Browse by opening a provider profile.";
  }

  const lines = bookingLookup.records.slice(0, 4).map((record, index) =>
    `${index + 1}. ${record.serviceTitle} with ${record.providerName}: ${record.status}, ${record.scheduleLabel}, ${record.priceLabel}`
  );

  return `I found these recent bookings from your account:\n\n${lines.join("\n")}\n\nOpen Bookings to continue chat, payment, rescheduling, or refund actions.`;
};

const buildDatabaseFallbackReply = (marketplaceSearch: MarketplaceSearch, bookingLookup: BookingLookup) => {
  const bookingFallback = buildBookingFallbackReply(bookingLookup);
  if (bookingFallback) return bookingFallback;

  if (!marketplaceSearch.isMarketplaceIntent) return "";

  if (marketplaceSearch.error) {
    return "I could not load current marketplace data right now, so I cannot safely answer with live prices. Try again in a moment or search from Browse.";
  }

  if (marketplaceSearch.records.length === 0) {
    return "I checked the active GigLink listings, but I could not find a matching service price for that search. Try a broader service name, location, or budget.";
  }

  const intro = marketplaceSearch.isPriceIntent
    ? "I found these current prices from active GigLink listings:"
    : "I found these active GigLink services:";
  const lines = marketplaceSearch.records.slice(0, 5).map((record, index) => {
    const location = record.location ? ` in ${record.location}` : "";
    return `${index + 1}. ${record.title} by ${record.providerName}${location}: ${record.priceLabel}`;
  });

  return `${intro}\n\n${lines.join("\n")}\n\nOpen Browse to view the provider profile, compare details, or start a booking.`;
};

const buildMatchesPayload = (marketplaceSearch: MarketplaceSearch) =>
  marketplaceSearch.records.map((record) => ({
    id: record.id,
    title: record.title,
    providerName: record.providerName,
    serviceType: record.serviceType,
    location: record.location,
    priceLabel: record.priceLabel,
    amount: record.amount,
    currency: record.currency,
    rateBasis: record.rateBasis,
  }));

const buildSystemPrompt = (
  context: ChatContext = {},
  marketplaceSearch: MarketplaceSearch,
  bookingLookup: BookingLookup
) => {
  const currentView = normalizeContextValue(context.currentView, "landing");
  const role = normalizeContextValue(context.role, "guest");
  const isLoggedIn = Boolean(context.isLoggedIn);

  return [
    "You are the GigLink Assistant inside a local-service marketplace web app.",
    "Help users understand service discovery, bookings, seller onboarding, quotes, scheduling, payments, refunds, profile settings, and account navigation.",
    "Act like a smart in-app copilot: infer the user's likely intent from typos, partial words, and the screen they are on, but ask a clarifying question when confidence is low.",
    "Keep answers concise, practical, and specific to GigLink. Prefer 2 to 4 direct steps or one short paragraph.",
    "Do not give a giant menu of every feature unless the user explicitly asks what the app can do.",
    "For accidental or low-signal input such as repeated letters, one or two random characters, or keyboard mashes, say you did not catch it and offer three likely directions based on the current screen.",
    "Do not claim to access private account data, bookings, payments, or database records unless the user provides the details in the chat.",
    "If a user needs account-specific help, explain the relevant screen or next step without inventing private status.",
    "For payments and refunds, give app-navigation guidance and remind users to follow in-app confirmation flows.",
    "Navigation names you can use: Dashboard, Browse, Bookings, My Work, Profile, Settings, and Account & Privacy.",
    "Booking flow guidance: browse or search services, open a provider profile, choose a service or slot, confirm details, then follow the in-app payment or quote flow.",
    "Seller flow guidance: open seller setup or My Work, complete profile and service details, set pricing, availability, payment options, and keep listings current.",
    "Quote guidance: explain that quotes should clarify scope, schedule, price, and payment terms before confirmation.",
    "When the user asks about services, providers, or prices, use the marketplace database lookup context below. Give exact prices from that context only.",
    "When the user asks about their bookings, payments, refunds, or schedule status, use the private booking lookup context below if available.",
    "If the database lookup has no matching service records, say that clearly. Do not estimate, make up price ranges, or invent providers.",
    "If private booking lookup is unavailable, explain that the Bookings screen has the latest account-specific status.",
    "For price searches, answer with a compact list that includes service, provider, price basis, and location when available.",
    `Current app view: ${currentView}.`,
    `Current screen hint: ${viewGuidance[currentView] || "Use the current view and role to choose the next best navigation step."}`,
    `User login state: ${isLoggedIn ? "logged in" : "guest"}.`,
    `User role: ${role}.`,
    buildMarketplacePromptContext(marketplaceSearch),
    buildBookingPromptContext(bookingLookup),
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

    const latestUserMessage = [...messages].reverse().find((message) => message.role === "user")?.content || "";
    const deterministicReply = buildDeterministicReply(latestUserMessage, body.context);
    if (deterministicReply) {
      return jsonResponse({
        message: deterministicReply,
        model: "giglink-intent-router",
        matches: [],
      });
    }

    const marketplaceSearch = await fetchMarketplaceSearch(req, latestUserMessage, body.context);
    const bookingLookup = await fetchBookingLookup(req, latestUserMessage, body.context);
    const groqApiKey = Deno.env.get("GROQ_API_KEY")?.trim();
    const groqModel = Deno.env.get("GROQ_CHATBOT_MODEL")?.trim() || DEFAULT_GROQ_MODEL;
    if (!groqApiKey) {
      const fallbackReply = buildDatabaseFallbackReply(marketplaceSearch, bookingLookup);
      if (fallbackReply) {
        return jsonResponse({
          message: fallbackReply,
          model: "giglink-db-search",
          matches: buildMatchesPayload(marketplaceSearch),
        });
      }

      console.error("giglink-chatbot missing GROQ_API_KEY secret");
      return jsonResponse({ error: "The assistant is not configured yet." }, 503);
    }

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${groqApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: groqModel,
        messages: [
          { role: "system", content: buildSystemPrompt(body.context, marketplaceSearch, bookingLookup) },
          ...messages,
        ],
        temperature: 0.35,
        max_completion_tokens: 420,
      }),
    });

    if (!response.ok) {
      const providerBody = await response.text();
      console.error("giglink-chatbot provider error", {
        status: response.status,
        body: providerBody.slice(0, 500),
      });

      const fallbackReply = buildDatabaseFallbackReply(marketplaceSearch, bookingLookup);
      if (fallbackReply) {
        return jsonResponse({
          message: fallbackReply,
          model: "giglink-db-search",
          matches: buildMatchesPayload(marketplaceSearch),
        });
      }

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
      model: payload?.model || groqModel,
      matches: buildMatchesPayload(marketplaceSearch),
    });
  } catch (error) {
    console.error("giglink-chatbot unexpected error", error);
    return jsonResponse({ error: "The assistant is unavailable right now." }, 500);
  }
});
