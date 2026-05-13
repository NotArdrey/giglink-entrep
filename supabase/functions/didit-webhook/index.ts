// @ts-nocheck
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import {
  buildIdentityDocumentFingerprint,
  cleanString,
  corsHeaders,
  createAdminClient,
  extractIdentityDocument,
  findDecisionObject,
  hmacSha256Hex,
  isUuid,
  jsonResponse,
  normalizeEmail,
  normalizeStatus,
  queueManualIdentityReview,
  resolveDiditDecisionStatus,
  sanitizeIdentityVerificationData,
  sha256Hex,
  upsertIdentityDocumentClaim,
} from "../_shared/identityRegistration.ts";

const constantTimeEqual = (a: string, b: string) => {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let index = 0; index < a.length; index += 1) {
    result |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return result === 0;
};

const hasFreshTimestamp = (value: string) => {
  const timestamp = Number.parseInt(value, 10);
  if (!Number.isFinite(timestamp)) return false;
  return Math.abs(Math.floor(Date.now() / 1000) - timestamp) <= 300;
};

const sortJsonKeys = (value: any): any => {
  if (Array.isArray(value)) return value.map(sortJsonKeys);
  if (value && typeof value === "object") {
    return Object.keys(value).sort().reduce((result: Record<string, unknown>, key) => {
      result[key] = sortJsonKeys(value[key]);
      return result;
    }, {});
  }
  return value;
};

const verifyWebhookSignature = async (rawBody: string, payload: any, headers: Headers) => {
  const secret = cleanString(Deno.env.get("DIDIT_WEBHOOK_SECRET") || Deno.env.get("WEBHOOK_SECRET_KEY"));
  const timestamp = cleanString(headers.get("x-timestamp"));
  if (!secret || !timestamp || !hasFreshTimestamp(timestamp)) return false;

  const signatureV2 = cleanString(headers.get("x-signature-v2")).toLowerCase();
  const signature = cleanString(headers.get("x-signature")).toLowerCase();
  const signatureSimple = cleanString(headers.get("x-signature-simple")).toLowerCase();

  if (signatureV2) {
    const expected = await hmacSha256Hex(JSON.stringify(sortJsonKeys(payload)), secret);
    if (constantTimeEqual(expected, signatureV2)) return true;
  }

  if (signature) {
    const expected = await hmacSha256Hex(`${timestamp}.${rawBody}`, secret);
    if (constantTimeEqual(expected, signature)) return true;
  }

  if (signatureSimple) {
    const expected = await hmacSha256Hex([
      payload?.timestamp || "",
      payload?.session_id || payload?.sessionId || "",
      payload?.status || "",
      payload?.webhook_type || payload?.event || payload?.type || "",
    ].join(":"), secret);
    if (constantTimeEqual(expected, signatureSimple)) return true;
  }

  return false;
};

const recordWebhookEvent = async (supabaseAdmin: any, payload: any, rawBody: string) => {
  const payloadHash = await sha256Hex(rawBody);
  const sessionId = cleanString(payload?.session_id || payload?.sessionId || payload?.id);
  const explicitKey = cleanString(payload?.event_id || payload?.webhook_id || payload?.webhook_event_id || payload?.event?.id);
  const eventKey = explicitKey
    ? `didit:${explicitKey}`
    : `didit:${sessionId || "unknown"}:${cleanString(payload?.status)}:${cleanString(payload?.webhook_type || payload?.event || payload?.type)}:${payloadHash}`;

  const { error } = await supabaseAdmin.from("didit_webhook_events").insert({
    event_key: eventKey,
    session_id: sessionId || null,
    status: cleanString(payload?.status) || null,
    payload_hash: payloadHash,
    processed_at: new Date().toISOString(),
  });

  if (!error) return { duplicate: false, eventKey };
  if (error.code === "23505" || /duplicate key/i.test(error.message || "")) {
    return { duplicate: true, eventKey };
  }
  throw error;
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    const rawBody = await req.text();
    const payload = JSON.parse(rawBody);

    if (!(await verifyWebhookSignature(rawBody, payload, req.headers))) {
      return jsonResponse({ error: "Invalid Didit webhook signature" }, 401);
    }

    const supabaseAdmin = createAdminClient();
    const webhookEvent = await recordWebhookEvent(supabaseAdmin, payload, rawBody);
    if (webhookEvent.duplicate) {
      return jsonResponse({ received: true, duplicate: true });
    }

    const sessionId = cleanString(payload.session_id || payload.sessionId || payload.id);
    const vendorData = cleanString(payload.vendor_data || payload.reference || payload.external_id || payload.metadata?.user_id);
    const decision = findDecisionObject(payload);
    const status = resolveDiditDecisionStatus(payload) || normalizeStatus(payload.status) || "PENDING";
    const sanitizedPayload = sanitizeIdentityVerificationData(payload);
    const document = extractIdentityDocument(payload);
    const documentFingerprint = await buildIdentityDocumentFingerprint(payload, {
      documentTypeKey: document.documentType,
      fullName: document.fullName,
    }).catch(() => null);

    if (sessionId) {
      const { data: existingSession } = await supabaseAdmin
        .from("verification_sessions")
        .select("verification_data")
        .eq("session_ref", sessionId)
        .maybeSingle();

      await supabaseAdmin
        .from("verification_sessions")
        .upsert({
          session_ref: sessionId,
          status,
          user_id: isUuid(vendorData) ? vendorData : null,
          verification_data: {
            ...(existingSession?.verification_data || {}),
            status,
            raw_didit_status: payload.status || null,
            vendor_data: vendorData || existingSession?.verification_data?.vendor_data || null,
            decision: sanitizeIdentityVerificationData(decision),
            raw_payload: sanitizedPayload,
            webhook_received_at: new Date().toISOString(),
          },
        }, { onConflict: "session_ref" });
    }

    if (isUuid(vendorData)) {
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("email, role, identity_role")
        .eq("user_id", vendorData)
        .maybeSingle();

      const appRole = cleanString(profile?.role || "client");
      const identityRole = cleanString(profile?.identity_role || (appRole === "worker" ? "musician" : "fan"));
      const profileUpdate = {
        verification_status: status,
        identity_required: true,
        identity_role: identityRole,
        didit_session_id: sessionId || null,
        id_document_expiry: document.expiry || null,
        is_verified: false,
        id_verified_at: status === "APPROVED" ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      };

      await supabaseAdmin.from("profiles").update(profileUpdate).eq("user_id", vendorData);

      if (status === "APPROVED" || status === "PENDING_REVIEW") {
        const review = status === "PENDING_REVIEW"
          ? await queueManualIdentityReview(supabaseAdmin, {
            userId: vendorData,
            email: normalizeEmail(profile?.email),
            role: identityRole,
            appRole,
            documentType: document.documentType || "Government ID",
            documentTypeKey: document.documentType || null,
            source: "DIDIT_PENDING",
            diditSessionId: sessionId,
            documentFingerprint,
            metadata: { diditWebhook: sanitizedPayload },
            verifiedFullLegalName: document.fullName,
            normalizedFullLegalName: document.normalizedFullName,
            birthDate: document.birthDate,
          })
          : null;

        await upsertIdentityDocumentClaim(supabaseAdmin, {
          userId: vendorData,
          role: identityRole,
          appRole,
          documentFingerprint,
          documentType: document.documentType || "Government ID",
          documentTypeKey: document.documentType || null,
          source: "DIDIT",
          status,
          diditSessionId: sessionId,
          manualReviewId: review?.id || null,
          email: profile?.email || null,
          metadata: { diditWebhook: sanitizedPayload },
          verifiedFullLegalName: document.fullName,
          normalizedFullLegalName: document.normalizedFullName,
          birthDate: document.birthDate,
        });
      }
    }

    return jsonResponse({ received: true, sessionId, status });
  } catch (error) {
    console.error("didit_webhook_failed", error);
    return jsonResponse({ error: error instanceof Error ? error.message : "Unable to process Didit webhook." }, 500);
  }
});

