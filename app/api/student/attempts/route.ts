import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { user, response } = await requireRole("STUDENT");
  if (!user) return response ?? NextResponse.json({ error: "Inicia sesión para continuar." }, { status: 401 });
  const attempts = await prisma.exam.findMany({ where: { studentId: user.id }, orderBy: { startedAt: "desc" }, include: { publishedExam: { select: { title: true, showResultsToStudents: true } }, answers: { select: { correct: true } } } });
  return NextResponse.json(attempts.map(attempt => ({
    id: attempt.id, examTitle: attempt.publishedExam?.title || attempt.topic, subject: attempt.topic,
    status: attempt.status, startedAt: attempt.startedAt, answered: attempt.answers.length,
    resultsVisible: attempt.publishedExam?.showResultsToStudents ?? true,
    ...(attempt.status === "completed" && (attempt.publishedExam?.showResultsToStudents ?? true) ? {
      score: attempt.score, correct: attempt.correctCount,
      percent: attempt.answers.length ? Math.round(attempt.correctCount / attempt.answers.length * 100) : 0,
    } : {}),
  })), { headers: { "Cache-Control": "private, no-store" } });
}
