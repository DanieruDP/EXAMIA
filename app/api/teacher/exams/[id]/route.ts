import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { canManageExam, countUniqueParticipants } from "@/lib/access";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireRole("TEACHER");
  if (!user) return response ?? NextResponse.json({ error: "Inicia sesión para continuar." }, { status: 401 });
  const { id } = await params;
  const exam = await prisma.publishedExam.findUnique({
    where: { id },
    include: {
      questions: { orderBy: [{ difficulty: "asc" }, { createdAt: "asc" }] },
      materials: { select: { id: true, name: true, mimeType: true, size: true } },
      attempts: { orderBy: { startedAt: "desc" }, include: { answers: { include: { question: true }, orderBy: { answeredAt: "asc" } } } },
    },
  });
  if (!exam || !canManageExam(user, exam.teacherId)) return NextResponse.json({ error: "Examen no encontrado." }, { status: 404 });
  return NextResponse.json({
    exam: { id: exam.id, title: exam.title, subject: exam.subject, instructions: exam.instructions, questionCount: exam.questionCount, durationMinutes: exam.durationMinutes, showResultsToStudents: exam.showResultsToStudents, status: exam.status, accessCode: exam.accessCode, createdAt: exam.createdAt, publishedAt: exam.publishedAt, closedAt: exam.closedAt, participantCount: countUniqueParticipants(exam.attempts), attemptCount: exam.attempts.length },
    materials: exam.materials.map(file => ({ ...file, downloadUrl: `/api/teacher/materials/${file.id}` })),
    questions: exam.questions.map(question => ({ ...question, options: question.options as string[] })),
    attempts: exam.attempts.map(attempt => ({
      id: attempt.id, studentName: attempt.studentName, startedAt: attempt.startedAt, finishedAt: attempt.finishedAt,
      status: attempt.status, score: attempt.score, correctCount: attempt.correctCount, answered: attempt.answers.length,
      incorrectCount: attempt.answers.length - attempt.correctCount,
      percent: attempt.answers.length ? Math.round(attempt.correctCount / attempt.answers.length * 100) : 0,
      answers: attempt.answers.map(answer => ({ prompt: answer.question.prompt, options: answer.question.options, selected: answer.selected, correctIndex: answer.question.answerIndex, correct: answer.correct, points: answer.points, difficulty: answer.askedLevel, explanation: answer.question.explanation, topic: answer.question.topic, material: answer.question.material })),
    })),
  }, { headers: { "Cache-Control": "no-store" } });
}
