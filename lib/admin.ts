import { NextRequest, NextResponse } from "next/server";
export function requireAdmin(request: NextRequest) {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected || request.headers.get("authorization") !== `Bearer ${expected}`) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  return null;
}
