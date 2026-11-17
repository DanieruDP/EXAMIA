import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { extractMaterials, MAX_FILES } from "@/lib/material";
import { generateQuestions } from "@/lib/generate";
import { savePrivateMaterials, removePrivateMaterials } from "@/lib/private-storage";
import { createShareCode } from "@/lib/share-code";
import { countUniqueParticipants, teacherExamFilter } from "@/lib/access";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function GET() {
  const { user, response } = await requireRole("TEACHER");
  if (!user) return response ?? NextResponse.json({ error: "Inicia sesión para continuar." }, { status: 401 });
  const exams = await prisma.publishedExam.findMany({
    where: teacherExamFilter(user.id), orderBy: { createdAt: "desc" },
    include: { _count: { select: { questions: true } }, attempts: { select: { studentId: true, studentName: true } } },
  });
  return NextResponse.json(exams.map(exam => ({
    id: exam.id, title: exam.title, subject: exam.subject, questionCount: exam.questionCount,
    durationMinutes: exam.durationMinutes, status: exam.status, accessCode: exam.accessCode,
    showResultsToStudents: exam.showResultsToStudents, createdAt: exam.createdAt,
    participantCount: countUniqueParticipants(exam.attempts), attemptCount: exam.attempts.length, generatedQuestions: exam._count.questions,
  })), { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: NextRequest) {
  const { user, response } = await requireRole("TEACHER");
  if (!user) return response ?? NextResponse.json({ error: "Inicia sesión para continuar." }, { status: 401 });
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (event: Record<string, unknown>) => controller.enqueue(new TextEncoder().encode(`${JSON.stringify(event)}\n`));
      let saved: Awaited<ReturnType<typeof savePrivateMaterials>> = [];
      void (async () => {
        try {
          const form = await req.formData();
          const title = String(form.get("title") || "").trim().slice(0, 120);
          const subject = String(form.get("subject") || "").trim().slice(0, 100);
          const instructions = String(form.get("instructions") || "").trim().slice(0, 1000);
          const questionCount = Number(form.get("questionCount"));
          const durationMinutes = Number(form.get("durationMinutes"));
          const showResultsToStudents = form.get("showResultsToStudents") === "true";
          const values = form.getAll("files");
          if (values.some(value => !(value instanceof File))) throw new Error("Adjunta archivos de estudio válidos.");
          const files = values as File[];
          if (!title || !subject || !instructions) throw new Error("Completa el título, la materia y las instrucciones.");
          if (!Number.isInteger(questionCount) || questionCount < 1 || questionCount > 50) throw new Error("La cantidad debe estar entre 1 y 50 preguntas.");
          if (!Number.isInteger(durationMinutes) || durationMinutes < 5 || durationMinutes > 180) throw new Error("El tiempo debe estar entre 5 y 180 minutos.");
          if (!files.length || files.length > MAX_FILES) throw new Error(`Adjunta entre 1 y ${MAX_FILES} archivos PDF o imágenes.`);
          send({ type: "status", status: "Validando y extrayendo el material de estudio" });
          const materials = await extractMaterials(files, event => send({ type: "file", ...event }));
          send({ type: "status", status: "Generando y verificando preguntas con el material" });
          const questions = await generateQuestions({ text: materials.text, subject, count: questionCount, onProgress: (completed, total) => send({ type: "generation", status: `Preguntas verificadas: ${completed} de ${total}` }) });
          if (questions.length !== questionCount) throw new Error("No se generó la cantidad completa de preguntas.");

          const examId = randomBytes(24).toString("base64url");
          saved = await savePrivateMaterials(examId, materials.uploads);
          const shareCode = createShareCode();
          const exam = await prisma.publishedExam.create({
            data: {
              id: examId, teacherId: user.id, title, subject, instructions, questionCount, durationMinutes,
              showResultsToStudents, accessCode: shareCode, status: "DRAFT",
              materials: { create: saved },
              questions: { create: questions.map(question => ({ ...question, active: true })) },
            },
            select: { id: true, title: true, subject: true, status: true, accessCode: true, questionCount: true, durationMinutes: true },
          });
          send({ type: "created", exam });
        } catch (error) {
          if (saved.length) await removePrivateMaterials(saved.map(file => file.storageKey));
          send({ type: "error", error: error instanceof Error ? error.message : "No se pudo crear el examen." });
        } finally { controller.close(); }
      })();
    },
  });
  return new NextResponse(stream, { headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store, no-transform", "X-Content-Type-Options": "nosniff" } });
}
