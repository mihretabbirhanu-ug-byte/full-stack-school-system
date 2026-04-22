import { routeAccessMap } from "./lib/settings";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession } from "./lib/auth/token";

const matchers = Object.entries(routeAccessMap).map(([route, allowedRoles]) => ({
  regex: new RegExp(`^${route}$`),
  allowedRoles,
}));

export default async function middleware(req: NextRequest) {
  const authSecret = process.env.AUTH_SECRET;
  if (!authSecret) {
    throw new Error("Missing AUTH_SECRET env var");
  }

  const pathname = req.nextUrl.pathname;
  const token = req.cookies.get("session")?.value;
  const payload = token ? await verifySession(token, authSecret) : null;

  if (pathname.startsWith("/sign-in")) {
    if (payload) {
      return NextResponse.redirect(new URL(`/${payload.role}`, req.url));
    }
    return NextResponse.next();
  }

  if (!payload) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  for (const { regex, allowedRoles } of matchers) {
    if (regex.test(pathname) && !allowedRoles.includes(payload.role)) {
      return NextResponse.redirect(new URL(`/${payload.role}`, req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
