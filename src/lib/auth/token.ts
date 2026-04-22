import type { SessionPayload } from "./types";

const encoder = new TextEncoder();

function base64UrlEncode(bytes: Uint8Array) {
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const end = Math.min(i + chunkSize, bytes.length);
    let chunk = "";
    for (let j = i; j < end; j++) chunk += String.fromCharCode(bytes[j]);
    binary += chunk;
  }
  const base64 = btoa(binary);
  return base64.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function base64UrlEncodeJson(obj: unknown) {
  return base64UrlEncode(encoder.encode(JSON.stringify(obj)));
}

function base64UrlDecodeToBytes(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "===".slice((base64.length + 3) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function base64UrlDecodeJson<T>(value: string): T {
  const bytes = base64UrlDecodeToBytes(value);
  const json = new TextDecoder().decode(bytes);
  return JSON.parse(json) as T;
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

async function hmacSha256(secret: string, data: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return new Uint8Array(signature);
}

export async function signSession(payload: SessionPayload, secret: string) {
  const header = { alg: "HS256", typ: "JWT" } as const;
  const encodedHeader = base64UrlEncodeJson(header);
  const encodedPayload = base64UrlEncodeJson(payload);
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const signature = await hmacSha256(secret, signingInput);
  const encodedSignature = base64UrlEncode(signature);
  return `${signingInput}.${encodedSignature}`;
}

export async function verifySession(token: string, secret: string) {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  try {
    const header = base64UrlDecodeJson<{ alg?: string; typ?: string }>(
      encodedHeader
    );
    if (header.alg !== "HS256") return null;

    const signingInput = `${encodedHeader}.${encodedPayload}`;
    const expected = await hmacSha256(secret, signingInput);
    const provided = base64UrlDecodeToBytes(encodedSignature);
    if (!constantTimeEqual(expected, provided)) return null;

    const payload = base64UrlDecodeJson<SessionPayload>(encodedPayload);
    const now = Math.floor(Date.now() / 1000);
    if (!payload.sub || !payload.role || !payload.username) return null;
    if (typeof payload.exp !== "number" || payload.exp <= now) return null;

    return payload;
  } catch {
    return null;
  }
}
