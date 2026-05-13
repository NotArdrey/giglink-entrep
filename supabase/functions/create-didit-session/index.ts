// @ts-nocheck
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import {
  assertPublicSignupAllowed,
  cleanString,
  corsHeaders,
  createAdminClient,
  createSessionNonce,
  findDecisionObject,
  findProfileByEmail,
  firstString,
  hashSessionNonce,
  identityRoleFromAppRole,
  isUuid,
  jsonResponse,
  normalizeAppRole,
  normalizeEmail,
  normalizeIdentityRole,
  normalizeStatus,
  parseJsonBody,
  recordRegistrationAttempt,
  RegistrationRateLimitError,
  resolveDiditDecisionStatus,
  sanitizeIdentityVerificationData,
  sha256Hex,
  updateRegistrationAttempt,
} from "../_shared/identityRegistration.ts";

const DIDIT_SESSION_URL = "https://verification.didit.me/v3/session/";

const isHttpUrl = (value: unknown) => /^https?:\/\//i.test(cleanString(value));

const resolveDiditVerificationUrl = (diditData: any) => {
  const explicitUrl = firstString([
    diditData?.verificationUrl,
    diditData?.verification_url,
    diditData?.url,
    diditData?.sessionUrl,
    diditData?.session_url,
    diditData?.session?.verification_url,
    diditData?.session?.url,
    diditData?.links?.verification_url,
    diditData?.links?.url,
  ]);
  if (isHttpUrl(explicitUrl)) return explicitUrl;

  const sessionToken = firstString([
    diditData?.session_token,
    diditData?.sessionToken,
    diditData?.token,
    diditData?.session?.session_token,
    diditData?.session?.token,
  ]);
  return sessionToken ? `https://verify.didit.me/session/${encodeURIComponent(sessionToken)}` : "";
};

const fetchDiditSession = async (sessionId: string, apiKey: string) => {
  let merged: Record<string, unknown> = {};

  for (const url of [
    `${DIDIT_SESSION_URL}${encodeURIComponent(sessionId)}/decision/`,
    `${DIDIT_SESSION_URL}${encodeURIComponent(sessionId)}`,
  ]) {
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
      });
      if (!response.ok) continue;
      const payload = await response.json();
      merged = { ...merged, ...payload };
    } catch (error) {
      console.error("didit_session_fetch_failed", {
        sessionId,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return merged;
};

const handleGetSession = async (body: any) => {
  const sessionId = cleanString(body?.session_id || body?.sessionId);
  if (!sessionId) return jsonResponse({ success: false, error: "session_id is required" });

  const diditApiKey = Deno.env.get("DIDIT_API_KEY") || "";
  const supabaseAdmin = createAdminClient();

  const { data: localSession } = await supabaseAdmin
    .from("verification_sessions")
    .select("status, verification_data")
    .eq("session_ref", sessionId)
    .maybeSingle();

  const diditSession = diditApiKey ? await fetchDiditSession(sessionId, diditApiKey) : {};
  const liveStatus = resolveDiditDecisionStatus(diditSession);
  const localStatus = normalizeStatus(localSession?.status || localSession?.verification_data?.status);
  const status = liveStatus || localStatus || "PENDING";

  if (status && status !== localStatus) {
    await supabaseAdmin
      .from("verification_sessions")
      .update({
        status,
        verification_data: {
          ...(localSession?.verification_data || {}),
          status,
          raw_didit_status: diditSession?.status || null,
          decision: sanitizeIdentityVerificationData(findDecisionObject(diditSession)),
          last_checked_at: new Date().toISOString(),
        },
      })
      .eq("session_ref", sessionId);
  }

  return jsonResponse({
    success: true,
    sessionId,
    status,
    businessStatus: status,
    diditResolvedStatus: liveStatus || null,
    rawDiditStatus: diditSession?.status || null,
    verification_data: {
      ...(localSession?.verification_data || {}),
      status,
    },
  });
};

const buildVendorData = async (userId: unknown, email: string, forceNew: boolean) => {
  const explicitUserId = cleanString(userId);
  if (forceNew || !email || !explicitUserId.startsWith("TEMP_")) return explicitUserId;
  const emailHash = await sha256Hex(email);
  return `TEMP_SIGNUP_${emailHash.slice(0, 32)}`;
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ success: false, error: "Method not allowed" }, 405);

  try {
    const body = await parseJsonBody(req);
    if (body?.action === "get_session") return handleGetSession(body);

    const diditApiKey = Deno.env.get("DIDIT_API_KEY") || "";
    const workflowId = Deno.env.get("DIDIT_WORKFLOW_ID") || "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";

    if (!diditApiKey || !workflowId || !supabaseUrl || !anonKey) {
      return jsonResponse({
        success: false,
        error: "Didit registration is not configured. Set DIDIT_API_KEY, DIDIT_WORKFLOW_ID, SUPABASE_URL, and SUPABASE_ANON_KEY.",
      });
    }

    const userId = cleanString(body?.userId || body?.user_id);
    const email = normalizeEmail(body?.email);
    const appRole = normalizeAppRole(body?.app_role || body?.appRole);
    const identityRole = normalizeIdentityRole(body?.role || identityRoleFromAppRole(appRole));
    const documentType = cleanString(body?.document_type || body?.documentType || "id_card");
    const redirectTo = firstString([body?.redirect_url, body?.redirectTo, body?.callback]);
    const forceNew = body?.force_new === true || body?.forceNew === true || cleanString(body?.force_new) === "true";

    if (!userId) return jsonResponse({ success: false, error: "userId is required" });
    if (!email) return jsonResponse({ success: false, error: "email is required" });

    const supabaseAdmin = createAdminClient();
    const existingProfile = await findProfileByEmail(supabaseAdmin, email);
    assertPublicSignupAllowed(existingProfile, appRole);

    const existingSessionId = cleanString(body?.existing_session_id || body?.existingSessionId);
    if (!forceNew && existingSessionId) {
      const { data: existingSession } = await supabaseAdmin
        .from("verification_sessions")
        .select("status, verification_data")
        .eq("session_ref", existingSessionId)
        .maybeSingle();

      const storedEmail = normalizeEmail(existingSession?.verification_data?.email);
      const storedUrl = cleanString(existingSession?.verification_data?.session_url || existingSession?.verification_data?.verification_url);
      const storedStatus = normalizeStatus(existingSession?.status);
      if (existingSession && storedEmail === email && storedUrl && storedStatus === "PENDING") {
        return jsonResponse({
          success: true,
          reused: true,
          sessionId: existingSessionId,
          sessionNonce: existingSession.verification_data?.session_nonce || "",
          workflowId: existingSession.verification_data?.workflow_id || workflowId,
          verificationUrl: storedUrl,
          status: storedStatus,
        });
      }
    }

    const attemptId = await recordRegistrationAttempt(supabaseAdmin, req, {
      action: "create_didit_session",
      email,
      metadata: { identityRole, appRole, documentType },
    });

    const vendorData = await buildVendorData(userId, email, forceNew);
    const redirectBridge = new URL(`${supabaseUrl}/functions/v1/verification-redirect`);
    redirectBridge.searchParams.set("vendor_data", vendorData);
    redirectBridge.searchParams.set("apikey", anonKey);
    if (redirectTo) redirectBridge.searchParams.set("redirect_to", redirectTo);

    const diditResponse = await fetch(DIDIT_SESSION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": diditApiKey,
      },
      body: JSON.stringify({
        workflow_id: workflowId,
        vendor_data: vendorData,
        callback: redirectBridge.toString(),
        metadata: {
          signup_attempt_ref: userId.startsWith("TEMP_") ? userId : undefined,
          signup_role: identityRole,
          app_role: appRole,
          document_type: documentType,
        },
        contact_details: {
          email,
          send_notification_emails: false,
        },
      }),
    });

    if (!diditResponse.ok) {
      const details = await diditResponse.text().catch(() => "");
      await updateRegistrationAttempt(supabaseAdmin, attemptId, {
        success: false,
        reason: `didit_create_failed_${diditResponse.status}`,
      });
      return jsonResponse({ success: false, error: "Failed to create verification session.", details });
    }

    const diditData = await diditResponse.json();
    const sessionId = firstString([diditData.session_id, diditData.id, diditData.session?.id]);
    const verificationUrl = resolveDiditVerificationUrl(diditData);

    if (!sessionId || !verificationUrl) {
      await updateRegistrationAttempt(supabaseAdmin, attemptId, {
        success: false,
        reason: "didit_create_missing_session_or_url",
      });
      return jsonResponse({
        success: false,
        error: "Didit created a session but did not return a usable session URL.",
      });
    }

    const sessionNonce = createSessionNonce();
    const sessionNonceHash = await hashSessionNonce(sessionId, sessionNonce);

    if (email) {
      await supabaseAdmin
        .from("verification_sessions")
        .update({ status: "SUPERSEDED" })
        .eq("verification_data->>email", email)
        .in("status", ["PENDING", "NOT_STARTED", "IN_PROGRESS"])
        .neq("session_ref", sessionId);
    }

    const sessionPayload = {
      user_id: isUuid(userId) ? userId : null,
      session_ref: sessionId,
      status: "PENDING",
      verification_data: {
        user_ref: vendorData,
        vendor_data: vendorData,
        signup_attempt_ref: userId.startsWith("TEMP_") ? userId : null,
        email,
        signup_role: identityRole,
        app_role: appRole,
        document_type: documentType,
        workflow_id: workflowId,
        session_url: verificationUrl,
        session_nonce_hash: sessionNonceHash,
        session_nonce: sessionNonce,
        started_at: new Date().toISOString(),
      },
    };

    await supabaseAdmin.from("verification_sessions").upsert(sessionPayload, { onConflict: "session_ref" });
    await updateRegistrationAttempt(supabaseAdmin, attemptId, {
      success: true,
      didit_session_id: sessionId,
      metadata: { identityRole, appRole, documentType, workflowId },
    });

    return jsonResponse({
      success: true,
      sessionId,
      sessionNonce,
      workflowId,
      verificationUrl,
    });
  } catch (error) {
    console.error("create_didit_session_failed", error);
    const message = error instanceof RegistrationRateLimitError
      ? error.message
      : error instanceof Error
        ? error.message
        : "Unable to create Didit session.";
    return jsonResponse({ success: false, error: message }, error instanceof RegistrationRateLimitError ? 429 : 200);
  }
});
