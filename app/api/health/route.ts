import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ ok: true, app: "GeeGee AI Workshop Platform", version: "0.1.0" });
}
