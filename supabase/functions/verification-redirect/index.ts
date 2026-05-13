// @ts-nocheck
Deno.serve(async (req: Request) => {
  const url = new URL(req.url);
  const redirectTo = url.searchParams.get("redirect_to");
  const params = new URLSearchParams(url.searchParams);
  params.delete("redirect_to");
  params.delete("apikey");

  if (redirectTo) {
    const target = decodeURIComponent(redirectTo);
    const separator = target.includes("?") ? "&" : "?";
    const suffix = params.toString();
    return new Response(null, {
      status: 302,
      headers: {
        Location: suffix ? `${target}${separator}${suffix}` : target,
      },
    });
  }

  return new Response(
    "<!doctype html><html><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>Verification Complete</title></head><body><main style=\"font-family:system-ui,sans-serif;max-width:640px;margin:12vh auto;padding:24px;\"><h1>Verification complete</h1><p>You can return to GigLink and continue account creation.</p></main></body></html>",
    {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      },
    },
  );
});

