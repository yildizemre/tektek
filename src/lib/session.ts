import { jwtVerify, SignJWT } from "jose";

export const SESSION_COOKIE = "tt_session";
const ISSUER = "tek-teknoloji";

export type SessionRole = "admin" | "user";

export type SessionPayload = {
  sub: string;
  email: string;
  name: string;
  role: SessionRole;
};

function secretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET ?? "tek-teknoloji-dev-secret-change-me-please-32chars";
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ email: payload.email, name: payload.name, role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuer(ISSUER)
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secretKey());
}

export async function verifySession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secretKey(), { issuer: ISSUER });
    const role = payload.role === "admin" ? "admin" : "user";

    return {
      sub: String(payload.sub ?? ""),
      email: String(payload.email ?? ""),
      name: String(payload.name ?? ""),
      role,
    };
  } catch {
    return null;
  }
}
