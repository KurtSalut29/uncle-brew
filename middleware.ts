import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/sign-in", "/sign-up"];
const SECRET = process.env.JWT_SECRET || "milktea_secret_key_change_in_prod";

async function verifyJWT(token: string): Promise<boolean> {
  try {
    const [headerB64, payloadB64, signatureB64] = token.split(".");
    if (!headerB64 || !payloadB64 || !signatureB64) return false;

    const encoder = new TextEncoder();
    const keyData = encoder.encode(SECRET);
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const data = encoder.encode(`${headerB64}.${payloadB64}`);
    const signature = Uint8Array.from(
      atob(signatureB64.replace(/-/g, "+").replace(/_/g, "/")),
      (c) => c.charCodeAt(0)
    );

    const valid = await crypto.subtle.verify("HMAC", cryptoKey, signature, data);
    if (!valid) return false;

    const payload = JSON.parse(atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/")));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return false;

    return true;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Never intercept API routes
  if (pathname.startsWith("/api")) return NextResponse.next();

  const token = req.cookies.get("token")?.value;
  const isAuthenticated = token ? await verifyJWT(token) : false;

  // Root: redirect authenticated users to dashboard, guests see landing page
  if (pathname === "/") {
    if (isAuthenticated) return NextResponse.redirect(new URL("/orders", req.url));
    return NextResponse.next();
  }

  // Auth pages: redirect authenticated users away
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    if (isAuthenticated) return NextResponse.redirect(new URL("/orders", req.url));
    return NextResponse.next();
  }

  // Protected pages: redirect unauthenticated users to sign-in
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|public|uploads).*)"],
};
