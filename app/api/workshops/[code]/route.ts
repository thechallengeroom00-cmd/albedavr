import { NextResponse } from "next/server";
import { getWorkshop, store } from "@/lib/store";
import type { Workshop } from "@/lib/types";

export async function GET(_: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const workshop = getWorkshop(code);
  if (!workshop) return NextResponse.json({ error: "Workshop niet gevonden" }, { status: 404 });

  const participants = store.participants.filter((p) => p.workshopCode === workshop.code);
  const messages = store.messages.filter((m) => m.workshopCode === workshop.code);
  const results = store.results.filter((r) => r.workshopCode === workshop.code);
  const moderationEvents = store.moderationEvents.filter((e) => e.workshopCode === workshop.code);

  return NextResponse.json({ workshop, participants, messages, results, moderationEvents });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const workshop = getWorkshop(code);
  if (!workshop) return NextResponse.json({ error: "Workshop niet gevonden" }, { status: 404 });

  const body = (await request.json()) as Partial<Workshop>;
  Object.assign(workshop, body, {
    modules: body.modules ? { ...workshop.modules, ...body.modules } : workshop.modules
  });

  return NextResponse.json({ workshop });
}
