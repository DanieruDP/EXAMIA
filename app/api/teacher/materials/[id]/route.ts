import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { readPrivateMaterial } from "@/lib/private-storage";
import { canManageExam } from "@/lib/access";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireRole("TEACHER");
  if (!user) return response ?? NextResponse.json({ error: "Inicia sesión para continuar." }, { status: 401 });
  const { id } = await params;
  const file = await prisma.materialAsset.findUnique({ where: { id }, include: { publishedExam: { select: { teacherId: true } } } });
  if (!file || !canManageExam(user, file.publishedExam.teacherId)) return NextResponse.json({ error: "Material no encontrado." }, { status: 404 });
  try {
    const bytes = await readPrivateMaterial(file.storageKey);
    return new NextResponse(bytes, { headers: { "Content-Type": file.mimeType, "Content-Length": String(bytes.byteLength), "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(file.name)}`, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } });
  } catch {
    return NextResponse.json({ error: "El archivo no está disponible en el almacenamiento privado." }, { status: 404 });
  }
}
