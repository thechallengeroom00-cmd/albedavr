import { NextResponse } from "next/server";
import { AiProviderError, generateAiResponse } from "@/lib/ai";
import { moderateText } from "@/lib/moderation";
import { addMessage, addModerationEvent, addResult, getWorkshop, store } from "@/lib/store";
import type { TopicId } from "@/lib/types";

export async function GET(_: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const workshop = getWorkshop(code);
  if (!workshop) return NextResponse.json({ error: "Workshop niet gevonden" }, { status: 404 });

  const messages = store.messages.filter((m) => m.workshopCode === workshop.code);
  return NextResponse.json({ messages });
}

export async function POST(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const workshop = getWorkshop(code);
  if (!workshop) return NextResponse.json({ error: "Workshop niet gevonden" }, { status: 404 });

  const body = await request.json();
  const participantId = String(body.participantId || "");
  const content = String(body.content || "");
  const topic = String(body.topic || "prompting") as TopicId;
  const participant = store.participants.find((p) => p.id === participantId && p.workshopCode === workshop.code);

  if (!participant) return NextResponse.json({ error: "Deelnemer niet gevonden" }, { status: 404 });
  if (participant.isBlocked || participant.isPaused) {
    return NextResponse.json({ error: "Deze sessie is gepauzeerd of geblokkeerd." }, { status: 403 });
  }

  participant.activeTopic = topic;
  const moderation = moderateText(content, workshop.audienceMode);

  if (moderation.status === "blocked") {
    const blocked = addMessage({
      workshopCode: workshop.code,
      participantId,
      role: "participant",
      content,
      topic,
      moderationStatus: "blocked",
      moderationReason: moderation.reason
    });
    addModerationEvent({
      workshopCode: workshop.code,
      participantId,
      severity: moderation.severity,
      category: moderation.category,
      originalInput: content,
      action: "blocked"
    });
    return NextResponse.json({ blocked: true, message: blocked, reason: moderation.reason }, { status: 200 });
  }

  const userMessage = addMessage({
    workshopCode: workshop.code,
    participantId,
    role: "participant",
    content,
    topic,
    moderationStatus: "allowed"
  });

  let aiContent: string;
  try {
    aiContent = await generateAiResponse({
      provider: workshop.provider,
      topic,
      audienceMode: workshop.audienceMode,
      userMessage: content
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "De AI kan nu geen antwoord geven.";
    const status = error instanceof AiProviderError ? error.status : 502;
    return NextResponse.json({ error: message }, { status });
  }

  const outputModeration = moderateText(aiContent, workshop.audienceMode);
  if (outputModeration.status === "blocked") {
    const fallback = addMessage({
      workshopCode: workshop.code,
      participantId,
      role: "assistant",
      content: "Ik kan hier geen veilig antwoord op geven. Probeer je vraag anders te stellen of vraag hulp aan de begeleider.",
      topic,
      moderationStatus: "blocked",
      moderationReason: outputModeration.reason
    });
    return NextResponse.json({ blocked: false, userMessage, assistantMessage: fallback });
  }

  const assistantMessage = addMessage({
    workshopCode: workshop.code,
    participantId,
    role: "assistant",
    content: aiContent,
    topic,
    moderationStatus: "allowed"
  });

  addResult({
    workshopCode: workshop.code,
    participantId,
    type: "text",
    title: "AI-resultaat",
    content: aiContent
  });

  return NextResponse.json({ blocked: false, userMessage, assistantMessage });
}
