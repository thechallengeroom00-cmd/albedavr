import { NextResponse } from "next/server";
import { getWorkshop } from "@/lib/store";

export async function POST(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const workshop = getWorkshop(code);
  if (!workshop) return NextResponse.json({ error: "Workshop niet gevonden" }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  workshop.forceEndScreen = Boolean(body.forceEndScreen ?? true);
  return NextResponse.json({ workshop });
}
