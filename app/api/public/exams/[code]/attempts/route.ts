import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { canStartSharedExam, fixedAttemptConfiguration } from "@/lib/access";
import { currentQuestion } from "@/lib/exam-service";
import { isValidShareCode, normalizeShareCode } from "@/lib/share-code";

export async function POST(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  try {
    const user = await getCurrentUser();
    if (user && user.role !== "STUDENT") return NextResponse.json({ error: "Las cuentas de profesor no pueden iniciar intentos de estudiante." }, { status: 403 });
    const { code: rawCode } = await params;
    const code = normalizeShareCode(rawCode);
    if (!isValidShareCode(code)) return NextResponse.json({ error: "Enlace o código no válido." }, { status: 404 });
    const body = await req.json();
    const studentName = String(body.studentName || "").trim().slice(0, 80);
    if (!studentName) return NextResponse.json({ error: "Escribe tu nombre antes de comenzar." }, { status: 400 });
    const published = await prisma.publishedExam.findUnique({ where: { accessCode: code } });
    if (!published || !canStartSharedExam(published.status)) return NextResponse.json({ error: "Este examen no está disponible." }, { status: 404 });
    const settings = fixedAttemptConfiguration(published);
    const attempt = await prisma.exam.create({ data: {
      id: randomBytes(24).toString("base64url"),
      studentName, studentId: user?.id ?? null, publishedExamId: published.id,
      ...settings,
    } });
    const first = await currentQuestion(attempt.id);
    if (!first) {
      await prisma.exam.delete({ where: { id: attempt.id } });
      return NextResponse.json({ error: "El examen no tiene preguntas disponibles." }, { status: 409 });
    }
    return NextResponse.json({
      exam: { id: attempt.id, studentName, topic: published.subject, title: published.title, questionCount: settings.questionCount, durationMinutes: settings.durationMinutes, currentLevel: settings.currentLevel, startedAt: attempt.startedAt },
      question: first.question,
    }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "No se pudo iniciar el examen." }, { status: 400 });
  }
}
