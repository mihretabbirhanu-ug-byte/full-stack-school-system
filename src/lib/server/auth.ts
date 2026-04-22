import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { signSession, verifySession } from "../auth/token";
import type { Role, SessionPayload } from "../auth/types";

export const SESSION_COOKIE_NAME = "session";

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("Missing AUTH_SECRET env var");
  return secret;
}

export type Session = {
  userId: string;
  role: Role;
  username: string;
};

export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = await verifySession(token, getAuthSecret());
  if (!payload) return null;
  return { userId: payload.sub, role: payload.role, username: payload.username };
}

export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/sign-in");
  return session;
}

export async function setSessionCookie(input: {
  userId: string;
  role: Role;
  username: string;
  maxAgeSeconds?: number;
}) {
  const maxAgeSeconds = input.maxAgeSeconds ?? 60 * 60 * 24 * 7; // 7 days
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    sub: input.userId,
    role: input.role,
    username: input.username,
    iat: now,
    exp: now + maxAgeSeconds,
  };

  const token = await signSession(payload, getAuthSecret());
  (await cookies()).set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAgeSeconds,
  });
}

export async function clearSessionCookie() {
  (await cookies()).set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}
