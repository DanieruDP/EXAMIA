export const LEVEL_NAMES = ["", "Muy básico", "Básico", "Intermedio", "Avanzado", "Experto"] as const;
export type Question = { id: string; prompt: string; options: string[]; answerIndex: number; explanation: string; difficulty: number; topic: string; material: string; examId?: string | null; publishedExamId?: string | null };
export function nextLevel(level: number, correct: boolean): number { return Math.max(1, Math.min(5, level + (correct ? 1 : -1))); }
export function grade(question: Question, selected: number) { const correct = selected === question.answerIndex; return { correct, points: correct ? question.difficulty : 0, nextLevel: nextLevel(question.difficulty, correct) }; }
export function chooseAdaptiveQuestion<T extends { difficulty: number; createdAt: Date }>(pool: T[], level: number): T | undefined {
  return [...pool].sort((a, b) => Math.abs(a.difficulty - level) - Math.abs(b.difficulty - level) || a.createdAt.getTime() - b.createdAt.getTime())[0];
}
export function examQuestionFilter(examId: string, answeredIds: string[]) {
  return { examId, active: true, id: { notIn: answeredIds } };
}
export function sanitizeQuestion(q: Question) {
  return { id: q.id, prompt: q.prompt, options: q.options, difficulty: q.difficulty, topic: q.topic, material: q.material };
}
