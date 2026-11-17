import { NextRequest, NextResponse } from "next/server";
import { submitAnswer, currentQuestion } from "@/lib/exam-service";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { canAccessAttempt } from "@/lib/access";
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params; const body = await req.json();
    const attempt = await prisma.exam.findUnique({ where: { id }, select: { studentId: true } });
    if (!attempt || !canAccessAttempt(await getCurrentUser(), attempt.studentId)) return NextResponse.json({ error: "Intento no encontrado." }, { status: 404 });
    await submitAnswer(id, String(body.questionId), Number(body.selected));
    const next = await currentQuestion(id);
    return NextResponse.json({ accepted: true, next: next?.question ?? null, complete: !next }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "No se pudo registrar la respuesta." }, { status: 400 }); }
}
