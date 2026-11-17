import { prisma } from "./prisma";
import { chooseAdaptiveQuestion, examQuestionFilter, grade, sanitizeQuestion, Question } from "./domain";
export async function currentQuestion(examId: string) {
  const exam = await prisma.exam.findUnique({ where: { id: examId }, include: { answers: true, publishedExam: { select: { title: true } } } });
  if (!exam || exam.status !== "active") return null;
  if (exam.answers.length >= exam.questionCount) return null;
  const answeredIds = exam.answers.map(a => a.questionId);
  const where = exam.publishedExamId
    ? { publishedExamId: exam.publishedExamId, active: true, id: { notIn: answeredIds } }
    : examQuestionFilter(examId, answeredIds);
  const pool = await prisma.question.findMany({ where });
  const question = chooseAdaptiveQuestion(pool, exam.currentLevel);
  if (!question) return null;
  const q = { ...question, options: question.options as string[] } as Question;
  return { exam, question: sanitizeQuestion(q) };
}
export async function submitAnswer(examId: string, questionId: string, selected: number) {
  if (!Number.isInteger(selected) || selected < 0 || selected > 3) throw new Error("Opción no válida.");
  const snapshot = await prisma.exam.findUnique({ where: { id: examId } });
  if (!snapshot || snapshot.status !== "active") throw new Error("El examen ya no está activo.");
  if (Date.now() >= snapshot.startedAt.getTime() + snapshot.durationMinutes * 60_000) {
    await prisma.exam.update({ where: { id: examId }, data: { status: "completed", finishedAt: new Date() } });
    throw new Error("El tiempo del examen terminó.");
  }
  return prisma.$transaction(async tx => {
    const exam = await tx.exam.findUnique({ where: { id: examId }, include: { answers: true } });
    if (!exam || exam.status !== "active") throw new Error("El examen ya no está activo.");
    if (exam.answers.length >= exam.questionCount) throw new Error("El examen ya terminó.");
    const question = await tx.question.findUnique({ where: { id: questionId } });
    const belongsToExam = snapshot.publishedExamId
      ? question?.publishedExamId === snapshot.publishedExamId
      : question?.examId === examId;
    if (!question || !belongsToExam || !question.active || exam.answers.some(a => a.questionId === questionId)) throw new Error("Pregunta no disponible para este examen.");
    const result = grade({ ...question, options: question.options as string[] } as Question, selected);
    await tx.examAnswer.create({ data: { examId, questionId, selected, correct: result.correct, points: result.points, askedLevel: question.difficulty } });
    await tx.exam.update({ where: { id: examId }, data: { score: { increment: result.points }, correctCount: { increment: result.correct ? 1 : 0 }, currentLevel: result.nextLevel } });
  });
}
