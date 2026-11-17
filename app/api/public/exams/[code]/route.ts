import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { canStartSharedExam, publicExamOverview } from "@/lib/access";
import { isValidShareCode, normalizeShareCode } from "@/lib/share-code";

export async function GET(_req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code: rawCode } = await params;
  const code = normalizeShareCode(rawCode);
  if (!isValidShareCode(code)) return NextResponse.json({ error: "Enlace o código no válido." }, { status: 404 });
  const exam = await prisma.publishedExam.findUnique({ where: { accessCode: code }, select: { id: true, title: true, subject: true, instructions: true, questionCount: true, durationMinutes: true, status: true } });
  if (!exam || !canStartSharedExam(exam.status)) return NextResponse.json({ error: "Este examen no está disponible." }, { status: 404 });
  return NextResponse.json({ exam: publicExamOverview(exam) }, { headers: { "Cache-Control": "no-store" } });
}
