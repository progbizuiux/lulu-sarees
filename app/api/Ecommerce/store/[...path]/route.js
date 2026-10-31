// Forwards every shop API call from the browser to the ERP API, as the ERP handover asks:
//   browser → /api/Ecommerce/store/<name> (our site) → ERP_API_URL/api/Ecommerce/store/<name>
// Why:
// - The shop key (ERP_STORE_KEY) is added here, on our server, so it never reaches the browser.
// - The browser only talks to our own site, so the login/cart cookies (pb_store, pb_cart) are
//   same-site cookies. Safari and Firefox would block them if the browser called the ERP directly.

export const dynamic = "force-dynamic"; // never cache: carts, logins and prices change per shopper

const ERP_API_URL = (process.env.ERP_API_URL || "").replace(/\/+$/, "");
const ERP_STORE_KEY = process.env.ERP_STORE_KEY || "";
const TIMEOUT_MS = 20000;

// Browser headers passed on to the ERP. Origin/Referer let the ERP check the allowed domains;
// X-Forwarded-For lets it limit attempts per shopper.
const FORWARD_REQUEST_HEADERS = ["accept", "accept-language", "content-type", "cookie", "origin", "referer", "user-agent", "x-forwarded-for"];

// Response headers not copied back. fetch() already unzipped the body, so the size/zip headers
// would be wrong; Set-Cookie is copied separately below so several cookies stay separate.
const SKIP_RESPONSE_HEADERS = ["content-encoding", "content-length", "transfer-encoding", "connection", "keep-alive", "set-cookie"];

// Same error shape as the ERP, so the site shows these like any other API error.
function errorResponse(status, message) {
  return Response.json(
    { errorCode: status, responseTitle: "Error", responseMessage: message, responseErrorDescription: "" },
    { status }
  );
}

async function forward(request, { params }) {
  if (!ERP_API_URL || !ERP_STORE_KEY) {
    return errorResponse(503, "The shop API isn't set up yet (ERP_API_URL / ERP_STORE_KEY missing).");
  }

  const { path = [] } = await params;
  // Only plain endpoint names: no "..", so a request can't reach anything outside /store.
  if (!path.length || path.some((part) => part === "." || part === ".." || part.includes("/"))) {
    return errorResponse(400, "Unknown API path.");
  }

  const { search } = new URL(request.url);
  const target = `${ERP_API_URL}/api/Ecommerce/store/${path.map(encodeURIComponent).join("/")}${search}`;

  const headers = new Headers();
  for (const name of FORWARD_REQUEST_HEADERS) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  headers.set("X-Storefront-Key", ERP_STORE_KEY);
  // The ERP answers 500 to "Accept-Language: *", which fetch() sends when the request has none
  // (server-side calls, curl). Always send a real language instead.
  const language = headers.get("accept-language");
  if (!language || language.trim() === "*") headers.set("accept-language", "en-IN");

  let erpResponse;
  try {
    erpResponse = await fetch(target, {
      method: request.method,
      headers,
      body: request.method === "GET" || request.method === "HEAD" ? undefined : await request.arrayBuffer(),
      cache: "no-store",
      redirect: "manual",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (error) {
    const timedOut = error?.name === "TimeoutError";
    return errorResponse(timedOut ? 504 : 502, timedOut ? "The shop API took too long to answer." : "Couldn't reach the shop API.");
  }

  const responseHeaders = new Headers();
  erpResponse.headers.forEach((value, name) => {
    if (!SKIP_RESPONSE_HEADERS.includes(name.toLowerCase())) responseHeaders.set(name, value);
  });
  for (const cookie of erpResponse.headers.getSetCookie()) responseHeaders.append("set-cookie", cookie);

  return new Response(erpResponse.body, { status: erpResponse.status, headers: responseHeaders });
}

export { forward as GET, forward as POST };
