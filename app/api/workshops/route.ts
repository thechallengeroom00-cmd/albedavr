import { NextResponse } from "next/server";
import { createWorkshop, store } from "@/lib/store";
import type { Workshop } from "@/lib/types";

export async function GET() {
  return NextResponse.json({ workshops: store.workshops });
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<Workshop>;
  if (!body.title?.trim() || !body.location?.trim() || !body.date || !body.startTime) {
    return NextResponse.json({
      error: "Vul workshopnaam, locatie, datum en begintijd in."
    }, { status: 400 });
  }
  const workshop = createWorkshop(body);
  return NextResponse.json({ workshop }, { status: 201 });
}
