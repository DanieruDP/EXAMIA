import { NextRequest, NextResponse } from "next/server";
import { createSession, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = String(body.name || "").trim().slice(0, 80);
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const role = body.role;
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return NextResponse.json({ error: "Escribe un nombre y un correo válidos." }, { status: 400 });
    if (password.length < 10 || password.length > 128) return NextResponse.json({ error: "La contraseña debe tener entre 10 y 128 caracteres." }, { status: 400 });
    if (role !== "TEACHER" && role !== "STUDENT") return NextResponse.json({ error: "Selecciona Profesor o Alumno." }, { status: 400 });
    if (await prisma.user.findUnique({ where: { email }, select: { id: true } })) return NextResponse.json({ error: "Ya existe una cuenta con ese correo." }, { status: 409 });
    const user = await prisma.user.create({ data: { name, email, role, passwordHash: await hashPassword(password) }, select: { id: true, name: true, email: true, role: true } });
    const response = NextResponse.json({ user }, { status: 201 });
    await createSession(user.id, response);
    return response;
  } catch {
    return NextResponse.json({ error: "No se pudo crear la cuenta. Revisa los datos e inténtalo de nuevo." }, { status: 400 });
  }
}
