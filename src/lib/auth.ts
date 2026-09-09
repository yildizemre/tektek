import "server-only";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { one, run } from "./db";
import { SESSION_COOKIE, signSession, verifySession, type SessionPayload } from "./session";

type AdminRow = {
  id: number;
  email: string;
  name: string;
  password_hash: string;
};

export async function signIn(email: string, password: string): Promise<string | null> {
  const admin = await one<AdminRow>("SELECT * FROM admin_users WHERE email = ?", [
    email.trim().toLowerCase(),
  ]);

  if (!admin) return "E-posta veya şifre hatalı.";
  if (!(await bcrypt.compare(password, admin.password_hash))) return "E-posta veya şifre hatalı.";

  const token = await signSession({ sub: String(admin.id), email: admin.email, name: admin.name });
  const store = await cookies();

  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return null;
}

export async function signOut() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function getAdmin(): Promise<SessionPayload | null> {
  const store = await cookies();
  return verifySession(store.get(SESSION_COOKIE)?.value);
}

/** Guard for admin pages and server actions. */
export async function requireAdmin(): Promise<SessionPayload> {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

export async function changePassword(adminId: string, currentPassword: string, newPassword: string) {
  const admin = await one<AdminRow>("SELECT * FROM admin_users WHERE id = ?", [Number(adminId)]);
  if (!admin) return "Kullanıcı bulunamadı.";
  if (!(await bcrypt.compare(currentPassword, admin.password_hash))) return "Mevcut şifre hatalı.";
  if (newPassword.length < 6) return "Yeni şifre en az 6 karakter olmalı.";

  await run("UPDATE admin_users SET password_hash = ? WHERE id = ?", [
    await bcrypt.hash(newPassword, 10),
    admin.id,
  ]);

  return null;
}
