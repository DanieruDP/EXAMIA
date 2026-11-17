import { NextRequest, NextResponse } from "next/server";
import { createSession, passwordMatches } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const user = await prisma.user.findUnique({ where: { email }, select: { id: true, name: true, email: true, role: true, passwordHash: true } });
    if (!user || !(await passwordMatches(password, user.passwordHash))) return NextResponse.json({ error: "Correo o contraseña incorrectos." }, { status: 401 });
    const { passwordHash: _passwordHash, ...safeUser } = user;
    const response = NextResponse.json({ user: safeUser });
    await createSession(user.id, response);
    return response;
  } catch {
    return NextResponse.json({ error: "No se pudo iniciar sesión." }, { status: 400 });
  }
}
