import { NextResponse } from "next/server";
import { createParticipant, getWorkshop } from "@/lib/store";

export async function POST(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const workshop = getWorkshop(code);
  if (!workshop) return NextResponse.json({ error: "Workshop niet gevonden" }, { status: 404 });

  const body = await request.json();
  const nickname = String(body.nickname || "").trim();
  const groupName = String(body.groupName || "").trim();

  if (!nickname || !groupName) {
    return NextResponse.json({ error: "Vul nickname en groep/team in." }, { status: 400 });
  }

  const participant = createParticipant(workshop.code, nickname, groupName);
  return NextResponse.json({ participant }, { status: 201 });
}
