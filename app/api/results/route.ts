import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
export async function GET(req: NextRequest) {
  const denied = requireAdmin(req); if (denied) return denied;
  const exams = await prisma.exam.findMany({ orderBy: { startedAt: "desc" }, take: 100, include: { answers: { select: { correct: true } } } });
  return NextResponse.json(exams.map(e => ({ id: e.id, studentName: e.studentName, topic: e.topic, score: e.score, correct: e.correctCount, answered: e.answers.length, percent: e.answers.length ? Math.round(e.correctCount / e.answers.length * 100) : 0, startedAt: e.startedAt, status: e.status })));
}
