import "server-only";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  createUser,
  getAdminByEmail,
  getUserByEmail,
  getUserById,
  updateUserPassword,
} from "./queries";
import { one, run } from "./db";
import { SESSION_COOKIE, signSession, verifySession, type SessionPayload } from "./session";
import type { User } from "./types";

const MAX_AGE = 60 * 60 * 24 * 30;

async function setSession(payload: SessionPayload) {
  const store = await cookies();
  store.set(SESSION_COOKIE, await signSession(payload), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

/**
 * One entry point for the whole site: the storefront login form checks staff
 * credentials first, so there is no separate admin login page to discover.
 */
export async function signIn(
  identifier: string,
  password: string,
): Promise<{ role: "admin" | "user" } | { error: string }> {
  const value = identifier.trim().toLowerCase();
  if (!value || !password) return { error: "E-posta ve şifre gerekli." };

  const admin = await getAdminByEmail(value);
  if (admin && (await bcrypt.compare(password, admin.password_hash))) {
    await setSession({ sub: String(admin.id), email: admin.email, name: admin.name, role: "admin" });
    return { role: "admin" };
  }

  const user = await getUserByEmail(value);
  if (user && (await bcrypt.compare(password, user.password_hash))) {
    if (user.is_active !== 1) return { error: "Hesabınız askıya alınmış. Lütfen bizimle iletişime geçin." };
    await setSession({ sub: String(user.id), email: user.email, name: user.name, role: "user" });
    return { role: "user" };
  }

  return { error: "E-posta veya şifre hatalı." };
}

export async function register(input: {
  email: string;
  name: string;
  phone: string;
  password: string;
}): Promise<{ ok: true } | { error: string }> {
  const email = input.email.trim().toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Geçerli bir e-posta adresi girin." };
  if (input.password.length < 6) return { error: "Şifre en az 6 karakter olmalı." };
  if (!input.name.trim()) return { error: "Ad soyad gerekli." };
  if (await getUserByEmail(email)) return { error: "Bu e-posta ile kayıtlı bir hesap zaten var." };

  const id = await createUser({
    email,
    name: input.name.trim(),
    phone: input.phone.trim(),
    passwordHash: await bcrypt.hash(input.password, 10),
  });

  await setSession({ sub: String(id), email, name: input.name.trim(), role: "user" });
  return { ok: true };
}

export async function signOut() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  return verifySession(store.get(SESSION_COOKIE)?.value);
}

export async function getAdmin(): Promise<SessionPayload | null> {
  const session = await getSession();
  return session?.role === "admin" ? session : null;
}

export async function requireAdmin(): Promise<SessionPayload> {
  const admin = await getAdmin();
  if (!admin) redirect("/giris");
  return admin;
}

export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession();
  if (!session || session.role !== "user") return null;
  return getUserById(Number(session.sub));
}

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/giris?devam=/hesap");
  return user;
}

export async function changeUserPassword(
  userId: number,
  currentPassword: string,
  newPassword: string,
): Promise<string | null> {
  const user = await getUserById(userId);
  if (!user) return "Kullanıcı bulunamadı.";
  if (!(await bcrypt.compare(currentPassword, user.password_hash))) return "Mevcut şifre hatalı.";
  if (newPassword.length < 6) return "Yeni şifre en az 6 karakter olmalı.";

  await updateUserPassword(userId, await bcrypt.hash(newPassword, 10));
  return null;
}

export async function changeAdminPassword(
  adminId: string,
  currentPassword: string,
  newPassword: string,
): Promise<string | null> {
  const admin = await one<{ id: number; password_hash: string }>(
    "SELECT id, password_hash FROM admin_users WHERE id = ?",
    [Number(adminId)],
  );

  if (!admin) return "Kullanıcı bulunamadı.";
  if (!(await bcrypt.compare(currentPassword, admin.password_hash))) return "Mevcut şifre hatalı.";
  if (newPassword.length < 6) return "Yeni şifre en az 6 karakter olmalı.";

  await run("UPDATE admin_users SET password_hash = ? WHERE id = ?", [
    await bcrypt.hash(newPassword, 10),
    admin.id,
  ]);
  return null;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}
