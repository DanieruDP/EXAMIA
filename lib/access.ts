export type AccountRole = "TEACHER" | "STUDENT";
export type ExamPublicationState = "DRAFT" | "PUBLISHED" | "CLOSED";
export type AccessUser = { id: string; role: AccountRole } | null;

export function canManageExam(user: AccessUser, teacherId: string) {
  return user?.role === "TEACHER" && user.id === teacherId;
}

export function canStartSharedExam(state: ExamPublicationState) {
  return state === "PUBLISHED";
}

export function canPublishExam(state: ExamPublicationState, questionCount: number, requiredQuestions: number, materialCount: number) {
  return state === "DRAFT" && questionCount === requiredQuestions && materialCount > 0;
}

export function teacherExamFilter(teacherId: string) {
  return { teacherId };
}

export function publicExamOverview(exam: { title: string; subject: string; instructions: string; questionCount: number; durationMinutes: number }) {
  return { title: exam.title, subject: exam.subject, instructions: exam.instructions, questionCount: exam.questionCount, durationMinutes: exam.durationMinutes };
}

export function canAccessAttempt(user: AccessUser, studentId: string | null) {
  if (!user) return studentId === null;
  if (user.role !== "STUDENT") return false;
  return studentId === null || studentId === user.id;
}

export function shouldRevealStudentResults(showResults: boolean, ownerView = false) {
  return ownerView || showResults;
}

export function fixedAttemptConfiguration(publishedExam: { subject: string; questionCount: number; durationMinutes: number }) {
  return { topic: publishedExam.subject, questionCount: publishedExam.questionCount, durationMinutes: publishedExam.durationMinutes, currentLevel: 3 };
}

export function countUniqueParticipants(attempts: Array<{ studentId: string | null; studentName: string }>) {
  return new Set(attempts.map(attempt => attempt.studentId ? `account:${attempt.studentId}` : `guest:${attempt.studentName.trim().toLocaleLowerCase("es")}`)).size;
}

export function redactStudentResults<T extends { answers: Array<Record<string, unknown>> }>(data: T, show: boolean) {
  if (show) return data;
  return {
    ...data,
    answers: data.answers.map(({ correctIndex: _correctIndex, explanation: _explanation, material: _material, correct: _correct, points: _points, ...answer }) => answer),
  };
}
