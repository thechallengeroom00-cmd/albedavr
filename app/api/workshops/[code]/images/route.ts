import { NextResponse } from "next/server";
import { AiProviderError, generateAiImage } from "@/lib/ai";
import { moderateText } from "@/lib/moderation";
import { addMessage, addModerationEvent, addResult, getWorkshop, store } from "@/lib/store";
import type { TopicId } from "@/lib/types";

export async function POST(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const workshop = getWorkshop(code);
  if (!workshop) return NextResponse.json({ error: "Workshop niet gevonden" }, { status: 404 });
  if (!workshop.modules.images) {
    return NextResponse.json({ error: "Afbeeldingen maken staat uit voor deze workshop." }, { status: 403 });
  }
  if (workshop.provider !== "openai" && workshop.provider !== "both") {
    return NextResponse.json(
      { error: "Kies OpenAI als AI-provider in de workshopinstellingen om afbeeldingen te maken." },
      { status: 409 }
    );
  }

  const body = await request.json();
  const participantId = String(body.participantId || "");
  const prompt = String(body.prompt || "").trim();
  const topic = String(body.topic || "images-music") as TopicId;
  const participant = store.participants.find(
    (item) => item.id === participantId && item.workshopCode === workshop.code
  );

  if (!participant) return NextResponse.json({ error: "Deelnemer niet gevonden" }, { status: 404 });
  if (participant.isBlocked || participant.isPaused) {
    return NextResponse.json({ error: "Deze sessie is gepauzeerd of geblokkeerd." }, { status: 403 });
  }
  if (!prompt) return NextResponse.json({ error: "Beschrijf eerst welke afbeelding je wilt maken." }, { status: 400 });

  const moderation = moderateText(prompt, workshop.audienceMode);
  if (moderation.status === "blocked") {
    addModerationEvent({
      workshopCode: workshop.code,
      participantId,
      severity: moderation.severity,
      category: moderation.category,
      originalInput: prompt,
      action: "blocked"
    });
    return NextResponse.json({ error: moderation.reason || "Deze beeldprompt is geblokkeerd." }, { status: 400 });
  }

  participant.activeTopic = topic;

  try {
    const imageUrl = await generateAiImage({
      topic,
      audienceMode: workshop.audienceMode,
      prompt
    });

    addMessage({
      workshopCode: workshop.code,
      participantId,
      role: "participant",
      content: `Maak een afbeelding: ${prompt}`,
      topic,
      moderationStatus: "allowed"
    });

    const result = addResult({
      workshopCode: workshop.code,
      participantId,
      type: "image",
      title: prompt.slice(0, 80),
      content: imageUrl
    });

    addMessage({
      workshopCode: workshop.code,
      participantId,
      role: "assistant",
      content: "Je afbeelding is klaar. Je kunt hem hieronder bekijken en downloaden.",
      topic,
      moderationStatus: "allowed"
    });

    return NextResponse.json({ result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Afbeelding maken lukt nu niet.";
    const status = error instanceof AiProviderError ? error.status : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
