import crypto from "crypto";
import { cookies, headers } from "next/headers";
import type { NextRequest } from "next/server";
import { fail } from "@/lib/http";

type AuthPayload = {
  sub: string;
  tenantId: string;
  role: string;
  email: string;
  name: string;
  exp: number;
};

type RateBucket = {
  count: number;
  resetAt: number;
};

const TOKEN_COOKIE = "campus_nexus_token";
const rateMemory = new Map<string, RateBucket>();

function getSecret() {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret || secret.length < 24) {
    throw new Error("NEXTAUTH_SECRET must be configured and at least 24 characters long");
  }
  return secret;
}

function b64url(input: string | Buffer) {
  const base = Buffer.isBuffer(input) ? input.toString("base64") : Buffer.from(input).toString("base64");
  return base.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function unb64url(input: string) {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = normalized.length % 4 ? "=".repeat(4 - (normalized.length % 4)) : "";
  return Buffer.from(normalized + pad, "base64").toString("utf8");
}

export function createToken(payload: Omit<AuthPayload, "exp">, ttlSeconds = 60 * 60 * 8) {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const full: AuthPayload = { ...payload, exp };
  const body = b64url(JSON.stringify(full));
  const signature = b64url(crypto.createHmac("sha256", getSecret()).update(body).digest());
  return `${body}.${signature}`;
}

export function verifyToken(token: string): AuthPayload | null {
  const [body, signature] = token.split(".");
  if (!body || !signature) {
    return null;
  }

  const expected = b64url(crypto.createHmac("sha256", getSecret()).update(body).digest());
  if (signature !== expected) {
    return null;
  }

  const parsed = JSON.parse(unb64url(body)) as AuthPayload;
  if (!parsed.exp || parsed.exp < Math.floor(Date.now() / 1000)) {
    return null;
  }

  return parsed;
}

export function readTokenFromRequest(request: Request | NextRequest) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const match = cookieHeader
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${TOKEN_COOKIE}=`));

  return match ? decodeURIComponent(match.split("=")[1] ?? "") : null;
}

export async function setAuthCookie(token: string) {
  (await cookies()).set(TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8
  });
}

export async function clearAuthCookie() {
  (await cookies()).set(TOKEN_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0
  });
}

export function getClientIp(request: Request | NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

export function limitByIp(request: Request | NextRequest, keyPrefix: string, limit: number, windowMs: number) {
  const ip = getClientIp(request);
  const key = `${keyPrefix}:${ip}`;
  const now = Date.now();
  const current = rateMemory.get(key);

  if (!current || current.resetAt <= now) {
    rateMemory.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  if (current.count >= limit) {
    const retryAfter = Math.ceil((current.resetAt - now) / 1000);
    return fail("Rate limit exceeded", 429, { retryAfter });
  }

  current.count += 1;
  rateMemory.set(key, current);
  return null;
}

export function sanitizeText(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .replace(/[<>]/g, "")
    .replace(/javascript:/gi, "")
    .trim();
}

export function authContextFromRequest(request: Request | NextRequest) {
  const token = readTokenFromRequest(request);
  if (!token) {
    return null;
  }
  return verifyToken(token);
}

export function tenantFromRequest(request: Request | NextRequest) {
  const headerStore = request.headers;
  const headerTenant = headerStore.get("x-tenant-id");
  if (headerTenant) {
    return headerTenant;
  }
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host") ?? "campus-nexus.local";
  return host.split(".")[0] ?? "campus-demo";
}

export function tenantFromServerHeaders() {
  const h = headers();
  return h.get("x-tenant-id") ?? "campus-demo";
}
