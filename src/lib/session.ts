import { jwtVerify, SignJWT } from "jose";

export const SESSION_COOKIE = "en_admin_session";
const ISSUER = "enteknoloji-admin";

export type SessionPayload = {
  sub: string;
  email: string;
  name: string;
};

function secretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET ?? "enteknoloji-dev-secret-change-me-please-32chars";
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ email: payload.email, name: payload.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuer(ISSUER)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey());
}

export async function verifySession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secretKey(), { issuer: ISSUER });
    return {
      sub: String(payload.sub ?? ""),
      email: String(payload.email ?? ""),
      name: String(payload.name ?? ""),
    };
  } catch {
    return null;
  }
}
