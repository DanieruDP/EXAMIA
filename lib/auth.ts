import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { AccountRole } from "@/lib/access";

const COOKIE_NAME = "examia_session";
const SESSION_DAYS = 14;
const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export type SessionUser = { id: string; name: string; email: string; role: AccountRole };

export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const session = await prisma.session.findUnique({ where: { tokenHash: hashToken(token) }, include: { user: { select: { id: true, name: true, email: true, role: true } } } });
  if (!session || session.expiresAt <= new Date()) {
    if (session) await prisma.session.delete({ where: { id: session.id } });
    return null;
  }
  return session.user;
}

export async function requireRole(role: AccountRole) {
  const user = await getCurrentUser();
  if (!user) return { user: null, response: NextResponse.json({ error: "Inicia sesión para continuar." }, { status: 401 }) };
  if (user.role !== role) return { user: null, response: NextResponse.json({ error: "Tu tipo de cuenta no tiene permiso para esta acción." }, { status: 403 }) };
  return { user, response: null };
}

export async function createSession(userId: string, response: NextResponse) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await prisma.session.create({ data: { userId, tokenHash: hashToken(token), expiresAt } });
  response.cookies.set(COOKIE_NAME, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", expires: expiresAt });
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (token) await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  cookieStore.delete(COOKIE_NAME);
}

export async function passwordMatches(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}
