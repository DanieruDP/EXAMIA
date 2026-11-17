import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentQuestion } from "@/lib/exam-service";
import { getCurrentUser } from "@/lib/auth";
import { canAccessAttempt } from "@/lib/access";
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const actor = await getCurrentUser();
  const attempt = await prisma.exam.findUnique({ where: { id }, select: { studentId: true } });
  if (!attempt || !canAccessAttempt(actor, attempt.studentId)) return NextResponse.json({ error: "Intento no encontrado." }, { status: 404 });
  const result = await currentQuestion(id);
  if (!result) {
    const exam = await prisma.exam.findUnique({ where: { id }, include: { publishedExam: { select: { title: true } } } });
    if (!exam) return NextResponse.json({ error: "Examen no encontrado." }, { status: 404 });
    return NextResponse.json({ exam: { id: exam.id, studentName: exam.studentName, topic: exam.topic, title: exam.publishedExam?.title ?? exam.topic, questionCount: exam.questionCount, durationMinutes: exam.durationMinutes, currentLevel: exam.currentLevel, startedAt: exam.startedAt }, question: null, complete: true });
  }
  const { exam, question } = result;
  return NextResponse.json({ exam: { id: exam.id, studentName: exam.studentName, topic: exam.topic, title: exam.publishedExam?.title ?? exam.topic, questionCount: exam.questionCount, durationMinutes: exam.durationMinutes, currentLevel: exam.currentLevel, startedAt: exam.startedAt }, question }, { headers: { "Cache-Control": "no-store" } });
}
