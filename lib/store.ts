import type { ChatMessage, ModerationEvent, Participant, ResultItem, TopicId, Workshop } from "./types";

function id(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
}

const defaultTopics: TopicId[] = [
  "ai-gaming",
  "stories",
  "learning",
  "prompting",
  "media-literacy",
  "images-music"
];

const memory = globalThis as typeof globalThis & {
  geegeeStore?: {
    workshops: Workshop[];
    participants: Participant[];
    messages: ChatMessage[];
    results: ResultItem[];
    moderationEvents: ModerationEvent[];
  };
};

export const store = memory.geegeeStore ?? {
  workshops: [
    {
      id: id("workshop"),
      code: "DEMO123",
      title: "Demo AI Workshop",
      location: "GeeGee Gaming",
      clientName: "Demo school",
      date: new Date().toISOString().slice(0, 10),
      startTime: "14:00",
      endTime: "16:00",
      audienceMode: "primary" as const,
      provider: "mock" as const,
      webMode: "safe" as const,
      modules: {
        textChat: true,
        images: false,
        internet: false,
        audio: false,
        files: false,
        musicIdeas: true,
        lyrics: true,
        beatSuggestions: true,
        realAudio: false
      },
      topics: defaultTopics,
      retentionDays: 30,
      forceEndScreen: false,
      status: "active" as const,
      createdAt: new Date().toISOString()
    }
  ],
  participants: [],
  messages: [],
  results: [],
  moderationEvents: []
};

memory.geegeeStore = store;

export function createWorkshop(input: Partial<Workshop>) {
  const code = (input.code || Math.random().toString(36).slice(2, 8)).toUpperCase();
  const workshop: Workshop = {
    id: id("workshop"),
    code,
    title: input.title || "Nieuwe AI Workshop",
    location: input.location || "",
    clientName: input.clientName || "",
    date: input.date || new Date().toISOString().slice(0, 10),
    startTime: input.startTime || "14:00",
    endTime: input.endTime || "16:00",
    audienceMode: input.audienceMode || "primary",
    provider: input.provider || "mock",
    webMode: input.webMode || "off",
    modules: input.modules || {
      textChat: true,
      images: false,
      internet: false,
      audio: false,
      files: false,
      musicIdeas: false,
      lyrics: false,
      beatSuggestions: false,
      realAudio: false
    },
    topics: input.topics || defaultTopics,
    retentionDays: input.retentionDays || 30,
    forceEndScreen: false,
    status: input.status || "active",
    createdAt: new Date().toISOString()
  };
  store.workshops.unshift(workshop);
  return workshop;
}

export function getWorkshop(code: string) {
  return store.workshops.find((w) => w.code.toUpperCase() === code.toUpperCase());
}

export function createParticipant(workshopCode: string, nickname: string, groupName: string) {
  const participant: Participant = {
    id: id("participant"),
    workshopCode: workshopCode.toUpperCase(),
    nickname: nickname.trim().slice(0, 40),
    groupName: groupName.trim().slice(0, 40),
    isPaused: false,
    isBlocked: false,
    joinedAt: new Date().toISOString()
  };
  store.participants.push(participant);
  return participant;
}

export function addMessage(message: Omit<ChatMessage, "id" | "createdAt">) {
  const saved: ChatMessage = { ...message, id: id("message"), createdAt: new Date().toISOString() };
  store.messages.push(saved);
  return saved;
}

export function addResult(result: Omit<ResultItem, "id" | "createdAt">) {
  const saved: ResultItem = { ...result, id: id("result"), createdAt: new Date().toISOString() };
  store.results.push(saved);
  return saved;
}

export function addModerationEvent(event: Omit<ModerationEvent, "id" | "createdAt">) {
  const saved: ModerationEvent = { ...event, id: id("mod"), createdAt: new Date().toISOString() };
  store.moderationEvents.push(saved);
  return saved;
}
