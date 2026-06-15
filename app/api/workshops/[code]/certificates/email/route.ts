import { NextResponse } from "next/server";
import { certificateEmailDocument } from "@/lib/certificate";
import { getWorkshop, store } from "@/lib/store";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const workshop = getWorkshop(code);
  if (!workshop) return NextResponse.json({ error: "Workshop niet gevonden." }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  const recipient = String(body.recipient || "").trim().toLowerCase();
  const participantId = String(body.participantId || "").trim();

  if (!emailPattern.test(recipient)) {
    return NextResponse.json({ error: "Vul een geldig e-mailadres in." }, { status: 400 });
  }

  const participants = store.participants.filter((participant) => {
    if (participant.workshopCode !== workshop.code) return false;
    return participantId ? participant.id === participantId : true;
  });

  if (participants.length === 0) {
    return NextResponse.json({ error: "Er zijn nog geen certificaten om te versturen." }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    return NextResponse.json({
      error: "E-mail is nog niet geconfigureerd. Voeg RESEND_API_KEY en EMAIL_FROM toe aan .env.local."
    }, { status: 503 });
  }

  const subject = participants.length === 1
    ? `Certificaat GeeGee AI Workshop voor ${participants[0].nickname}`
    : `Alle certificaten van ${workshop.title}`;

  let response: Response;
  try {
    response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from,
        to: [recipient],
        subject,
        html: certificateEmailDocument(workshop, participants)
      })
    });
  } catch {
    return NextResponse.json({
      error: "Er kon geen verbinding worden gemaakt met de e-mailprovider."
    }, { status: 502 });
  }

  if (!response.ok) {
    const providerError = await response.json().catch(() => ({}));
    return NextResponse.json({
      error: providerError?.message || "De e-mailprovider kon de certificaten niet versturen."
    }, { status: 502 });
  }

  return NextResponse.json({
    sent: true,
    count: participants.length,
    message: participants.length === 1
      ? `Het certificaat is verstuurd naar ${recipient}.`
      : `${participants.length} certificaten zijn verstuurd naar ${recipient}.`
  });
}
