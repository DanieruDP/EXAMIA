import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { canAccessAttempt, shouldRevealStudentResults } from "@/lib/access";
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const exam = await prisma.exam.findUnique({ where: { id }, include: { publishedExam: { select: { showResultsToStudents: true, materials: { select: { name: true } } } }, answers: { include: { question: true }, orderBy: { answeredAt: "asc" } } } });
  if (!exam) return NextResponse.json({ error: "Examen no encontrado." }, { status: 404 });
  if (!canAccessAttempt(await getCurrentUser(), exam.studentId)) return NextResponse.json({ error: "Intento no encontrado." }, { status: 404 });
  const timedOut = Date.now() >= exam.startedAt.getTime() + exam.durationMinutes * 60_000;
  if (exam.status === "active" && exam.answers.length < exam.questionCount && !timedOut) return NextResponse.json({ error: "El examen sigue en curso." }, { status: 409 });
  if (exam.status === "active") await prisma.exam.update({ where: { id }, data: { status: "completed", finishedAt: new Date() } });
  if (!shouldRevealStudentResults(exam.publishedExam?.showResultsToStudents ?? true)) {
    return NextResponse.json({ exam: { id: exam.id, studentName: exam.studentName, topic: exam.topic, resultsHidden: true }, topics: [], answers: [], materials: [] }, { headers: { "Cache-Control": "private, no-store" } });
  }
  const topics = new Map<string, { total: number; correct: number }>();
  for (const a of exam.answers) { const entry = topics.get(a.question.topic) ?? { total: 0, correct: 0 }; entry.total++; if (a.correct) entry.correct++; topics.set(a.question.topic, entry); }
  const answerDetails = exam.answers.map(a => ({ prompt: a.question.prompt, options: a.question.options, selected: a.selected, correctIndex: a.question.answerIndex, correct: a.correct, points: a.points, difficulty: a.askedLevel, explanation: a.question.explanation, topic: a.question.topic, material: a.question.material }));
  const highestLevel = exam.answers.reduce((max, answer) => Math.max(max, answer.askedLevel), 1);
  const materials = exam.publishedExam?.materials ?? exam.materialFiles;
  return NextResponse.json({ exam: { id: exam.id, studentName: exam.studentName, topic: exam.topic, questionCount: exam.questionCount, score: exam.score, correctCount: exam.correctCount, incorrectCount: exam.answers.length - exam.correctCount, percent: exam.answers.length ? Math.round(exam.correctCount / exam.answers.length * 100) : 0, highestLevel, currentLevel: exam.currentLevel, totalAnswered: exam.answers.length, durationMinutes: exam.durationMinutes }, materials, topics: [...topics.entries()].map(([topic, v]) => ({ topic, ...v, percent: Math.round(v.correct / v.total * 100) })).sort((a, b) => b.percent - a.percent), answers: answerDetails }, { headers: { "Cache-Control": "private, no-store" } });
}
