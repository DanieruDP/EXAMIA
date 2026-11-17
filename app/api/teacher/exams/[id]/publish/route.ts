import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { canManageExam, canPublishExam } from "@/lib/access";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireRole("TEACHER");
  if (!user) return response ?? NextResponse.json({ error: "Inicia sesión para continuar." }, { status: 401 });
  const { id } = await params;
  const exam = await prisma.publishedExam.findUnique({ where: { id }, include: { _count: { select: { questions: true, materials: true } } } });
  if (!exam || !canManageExam(user, exam.teacherId)) return NextResponse.json({ error: "Examen no encontrado." }, { status: 404 });
  if (!canPublishExam(exam.status, exam._count.questions, exam.questionCount, exam._count.materials)) return NextResponse.json({ error: "Solo se publican borradores con todas las preguntas y materiales requeridos." }, { status: 409 });
  const published = await prisma.publishedExam.updateMany({ where: { id, teacherId: user.id, status: "DRAFT" }, data: { status: "PUBLISHED", publishedAt: new Date() } });
  if (!published.count) return NextResponse.json({ error: "El estado del examen cambió. Actualiza la página." }, { status: 409 });
  return NextResponse.json({ ok: true, status: "PUBLISHED" });
}
