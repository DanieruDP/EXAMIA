import { test } from "node:test";
import assert from "node:assert/strict";
import { chooseAdaptiveQuestion, examQuestionFilter, grade, nextLevel, sanitizeQuestion, Question } from "../lib/domain";
import { validateDraft } from "../lib/generate";
import { extractMaterials } from "../lib/material";
import { canAccessAttempt, canManageExam, canPublishExam, canStartSharedExam, countUniqueParticipants, fixedAttemptConfiguration, publicExamOverview, shouldRevealStudentResults, teacherExamFilter } from "../lib/access";
import { createShareCode, isValidShareCode, normalizeShareCode } from "../lib/share-code";
const q: Question = { id: "q1", prompt: "¿Qué es una arquitectura?", options: ["A", "B", "C", "D"], answerIndex: 2, explanation: "Explicación", difficulty: 3, topic: "Biología", material: "Apunte", examId: "exam-a" };
test("la adaptación empieza en intermedio y respeta límites", () => {
  assert.equal(nextLevel(3, true), 4); assert.equal(nextLevel(3, false), 2);
  assert.equal(nextLevel(5, true), 5); assert.equal(nextLevel(1, false), 1);
});

test("las consultas de preguntas se aíslan al examen que las creó", () => {
  assert.deepEqual(examQuestionFilter("exam-a", ["q1"]), { examId: "exam-a", active: true, id: { notIn: ["q1"] } });
  assert.notDeepEqual(examQuestionFilter("exam-a", []), examQuestionFilter("exam-b", []));
});

test("el enlace solo inicia exámenes publicados y respeta permisos de rol y propiedad", () => {
  assert.equal(canStartSharedExam("DRAFT"), false);
  assert.equal(canStartSharedExam("CLOSED"), false);
  assert.equal(canStartSharedExam("PUBLISHED"), true);
  assert.equal(canManageExam({ id: "teacher-1", role: "TEACHER" }, "teacher-1"), true);
  assert.equal(canManageExam({ id: "teacher-2", role: "TEACHER" }, "teacher-1"), false);
  assert.equal(canManageExam({ id: "student-1", role: "STUDENT" }, "teacher-1"), false);
  assert.deepEqual(teacherExamFilter("teacher-1"), { teacherId: "teacher-1" });
  assert.equal(canPublishExam("DRAFT", 10, 10, 1), true);
  assert.equal(canPublishExam("DRAFT", 9, 10, 1), false);
  assert.equal(canPublishExam("DRAFT", 10, 10, 0), false);
  assert.equal(canPublishExam("PUBLISHED", 10, 10, 1), false);
});

test("la página pública de un examen solo expone información de acceso", () => {
  const view = publicExamOverview({ title: "Evaluación 1", subject: "Historia", instructions: "Lee con atención", questionCount: 10, durationMinutes: 30, id: "private-id", status: "PUBLISHED", answerIndex: 2 } as any);
  assert.deepEqual(view, { title: "Evaluación 1", subject: "Historia", instructions: "Lee con atención", questionCount: 10, durationMinutes: 30 });
});

test("el alumno solo accede a su intento y el anfitrión anónimo no altera la configuración", () => {
  assert.equal(canAccessAttempt({ id: "student-1", role: "STUDENT" }, "student-1"), true);
  assert.equal(canAccessAttempt({ id: "student-2", role: "STUDENT" }, "student-1"), false);
  assert.equal(canAccessAttempt({ id: "teacher-1", role: "TEACHER" }, null), false);
  assert.equal(canAccessAttempt(null, null), true);
  assert.deepEqual(fixedAttemptConfiguration({ subject: "Historia", questionCount: 12, durationMinutes: 40 }), { topic: "Historia", questionCount: 12, durationMinutes: 40, currentLevel: 3 });
});

test("la visibilidad de resultados sigue la configuración del profesor y el código compartido se valida", () => {
  assert.equal(shouldRevealStudentResults(false), false);
  assert.equal(shouldRevealStudentResults(true), true);
  const code = createShareCode();
  assert.equal(code.length, 12);
  assert.equal(isValidShareCode(code), true);
  assert.equal(normalizeShareCode(code.toLowerCase()), code);
});

test("el profesor ve participantes únicos además del total de intentos", () => {
  assert.equal(countUniqueParticipants([
    { studentId: "student-1", studentName: "Ana" },
    { studentId: "student-1", studentName: "Ana" },
    { studentId: null, studentName: "Luis" },
    { studentId: null, studentName: " luis " },
  ]), 2);
});
test("cada acierto vale el nivel de la pregunta y el error vale cero", () => {
  assert.deepEqual(grade(q, 2), { correct: true, points: 3, nextLevel: 4 });
  assert.deepEqual(grade(q, 1), { correct: false, points: 0, nextLevel: 2 });
});
test("un acierto selecciona una pregunta del nivel siguiente que paga más puntos", () => {
  const candidates = [1, 3, 4, 5].map(difficulty => ({ difficulty, createdAt: new Date(difficulty * 1000) }));
  const levelAfterCorrect = grade(q, q.answerIndex).nextLevel;
  const next = chooseAdaptiveQuestion(candidates, levelAfterCorrect);
  assert.equal(next?.difficulty, 4);
  assert.equal(grade({ ...q, difficulty: next!.difficulty }, q.answerIndex).points, 4);
});
test("un error elige nivel inferior, elige el nivel disponible más cercano y conserva el desempate cronológico", () => {
  const candidates = [
    { id: "older", difficulty: 2, createdAt: new Date("2026-01-01") },
    { id: "newer", difficulty: 2, createdAt: new Date("2026-02-01") },
    { id: "farther", difficulty: 4, createdAt: new Date("2025-01-01") },
  ];
  const nextLevelAfterError = grade(q, 0).nextLevel;
  assert.equal(nextLevelAfterError, 2);
  assert.equal(chooseAdaptiveQuestion(candidates, nextLevelAfterError)?.id, "older");
});
test("la pregunta pública no expone respuesta correcta ni explicación", () => {
  const publicQuestion = sanitizeQuestion(q);
  assert.equal("answerIndex" in publicQuestion, false); assert.equal("explanation" in publicQuestion, false);
  assert.equal("examId" in publicQuestion, false); assert.equal("sourceUrl" in publicQuestion, false);
  assert.equal(publicQuestion.prompt, q.prompt); assert.deepEqual(publicQuestion.options, q.options);
});

test("la carga valida el tipo real del archivo y no confía en su extensión", async () => {
  const forged = new File([Buffer.from("contenido que no es una imagen")], "apunte.png", { type: "image/png" });
  await assert.rejects(extractMaterials([forged], () => {}), /no es un PDF, JPG, JPEG o PNG válido/);
  const mismatched = new File([Buffer.from("%PDF-1.7")], "apunte.jpg", { type: "image/jpeg" });
  await assert.rejects(extractMaterials([mismatched], () => {}), /extensión no coincide/);
});

test("la generación exige una cita textual del material aportado", () => {
  const evidence = "La membrana celular regula el intercambio de sustancias entre la célula y su entorno.";
  const draft = { prompt: "¿Qué función cumple la membrana celular?", options: ["Regula el intercambio", "Produce luz", "Almacena aire", "Forma huesos"], answerIndex: 0, explanation: "Regula el paso de sustancias, según el texto.", difficulty: 2, topic: "Membrana celular", material: evidence };
  assert.equal(validateDraft(draft, `Apuntes:\n${evidence}`, "Biología").material, evidence);
  assert.throws(() => validateDraft({ ...draft, material: "La mitocondria produce energía para la célula y realiza respiración celular." }, evidence, "Biología"), /evidencia textual/);
});

test("el generador rechaza opciones duplicadas y conserva únicamente nivel 1 a 5", () => {
  const evidence = "La membrana celular regula el intercambio de sustancias entre la célula y su entorno.";
  const draft = { prompt: "¿Qué función cumple la membrana celular?", options: ["Regula el intercambio", "Regula el intercambio", "Almacena aire", "Forma huesos"], answerIndex: 0, explanation: "Lo indica el material.", difficulty: 2, topic: "Membrana celular", material: evidence };
  assert.throws(() => validateDraft(draft, evidence, "Biología"), /evidencia textual/);
  assert.throws(() => validateDraft({ ...draft, options: ["Regula", "No produce luz", "Almacena aire", "Forma huesos"], difficulty: 6 }, evidence, "Biología"), /evidencia textual/);
});
