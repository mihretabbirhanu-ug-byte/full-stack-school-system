import { clearSessionCookie } from "@/lib/auth/server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  await clearSessionCookie();
  return NextResponse.redirect(new URL("/sign-in", req.url));
}

