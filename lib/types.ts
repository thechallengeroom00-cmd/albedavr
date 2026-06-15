export type AudienceMode = "primary" | "secondary";
export type ProviderMode = "mock" | "openai" | "claude" | "both";
export type WorkshopStatus = "draft" | "active" | "ended";
export type TopicId =
  | "ai-gaming"
  | "stories"
  | "learning"
  | "prompting"
  | "media-literacy"
  | "images-music";

export type ModuleSettings = {
  textChat: boolean;
  images: boolean;
  internet: boolean;
  audio: boolean;
  files: boolean;
  musicIdeas: boolean;
  lyrics: boolean;
  beatSuggestions: boolean;
  realAudio: boolean;
};

export type WebMode = "off" | "safe" | "filtered";

export type Workshop = {
  id: string;
  code: string;
  title: string;
  location: string;
  clientName: string;
  date: string;
  startTime: string;
  endTime: string;
  audienceMode: AudienceMode;
  provider: ProviderMode;
  webMode: WebMode;
  modules: ModuleSettings;
  topics: TopicId[];
  retentionDays: number;
  forceEndScreen: boolean;
  status: WorkshopStatus;
  createdAt: string;
};

export type Participant = {
  id: string;
  workshopCode: string;
  nickname: string;
  groupName: string;
  activeTopic?: TopicId;
  isPaused: boolean;
  isBlocked: boolean;
  joinedAt: string;
};

export type MessageRole = "participant" | "assistant" | "system";
export type ModerationStatus = "allowed" | "blocked" | "flagged";

export type ChatMessage = {
  id: string;
  workshopCode: string;
  participantId: string;
  role: MessageRole;
  content: string;
  topic?: TopicId;
  moderationStatus: ModerationStatus;
  moderationReason?: string;
  createdAt: string;
};

export type ResultItem = {
  id: string;
  workshopCode: string;
  participantId: string;
  type: "text" | "image" | "audio" | "certificate";
  title: string;
  content: string;
  createdAt: string;
};

export type ModerationEvent = {
  id: string;
  workshopCode: string;
  participantId: string;
  severity: "low" | "medium" | "high";
  category: string;
  originalInput: string;
  action: "blocked" | "flagged" | "paused";
  createdAt: string;
};
