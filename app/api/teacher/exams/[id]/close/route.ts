import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { canManageExam } from "@/lib/access";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireRole("TEACHER");
  if (!user) return response ?? NextResponse.json({ error: "Inicia sesión para continuar." }, { status: 401 });
  const { id } = await params;
  const exam = await prisma.publishedExam.findUnique({ where: { id }, select: { teacherId: true, status: true } });
  if (!exam || !canManageExam(user, exam.teacherId)) return NextResponse.json({ error: "Examen no encontrado." }, { status: 404 });
  if (exam.status === "CLOSED") return NextResponse.json({ ok: true, status: "CLOSED" });
  const closed = await prisma.publishedExam.updateMany({ where: { id, teacherId: user.id, status: exam.status }, data: { status: "CLOSED", closedAt: new Date() } });
  if (!closed.count) return NextResponse.json({ error: "El estado del examen cambió. Actualiza la página." }, { status: 409 });
  return NextResponse.json({ ok: true, status: "CLOSED" });
}
