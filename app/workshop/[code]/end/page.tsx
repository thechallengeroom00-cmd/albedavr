"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { ChatMessage, Participant, ResultItem, Workshop } from "@/lib/types";

export default function EndPage() {
  const params = useParams<{ code: string }>();
  const code = String(params.code || "").toUpperCase();
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [results, setResults] = useState<ResultItem[]>([]);
  const [recipient, setRecipient] = useState("");
  const [emailStatus, setEmailStatus] = useState("");
  const [sending, setSending] = useState(false);
  const participantId = typeof window !== "undefined" ? localStorage.getItem(`geegee-participant-${code}`) || "" : "";

  useEffect(() => {
    fetch(`/api/workshops/${code}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        setWorkshop(data.workshop || null);
        setParticipant((data.participants || []).find((p: Participant) => p.id === participantId) || null);
        setMessages((data.messages || []).filter((m: ChatMessage) => m.participantId === participantId));
        setResults((data.results || []).filter((r: ResultItem) => r.participantId === participantId));
      });
  }, [code, participantId]);

  const bestPrompt = [...messages].reverse().find((m) => m.role === "participant" && m.moderationStatus === "allowed")?.content || "Nog geen prompt gekozen.";
  const bestResult = [...results].reverse().find((r) => r.type === "text")?.content || "Nog geen resultaat opgeslagen.";

  async function emailCertificate() {
    if (!participant || !recipient.trim()) return;
    setSending(true);
    setEmailStatus("");
    const response = await fetch(`/api/workshops/${code}/certificates/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipient, participantId: participant.id })
    });
    const data = await response.json();
    setEmailStatus(data.message || data.error || "Versturen is niet gelukt.");
    setSending(false);
  }

  if (!workshop || !participant) return <main className="container"><div className="card">Eindscherm laden...</div></main>;

  return (
    <main className="container">
      <header className="header">
        <a className="logo" href="/">GeeGee<span>AI</span></a>
        <span className="badge">Eindscherm</span>
      </header>

      <section className="grid two">
        <div className="card">
          <h1 className="h1">Goed gedaan, {participant.nickname}!</h1>
          <p className="muted">Je hebt gewerkt aan de GeeGee AI Workshop.</p>
          <h2>Jouw beste prompt</h2>
          <div className="msg participant">{bestPrompt}</div>
          <h2>Jouw resultaat</h2>
          <div className="msg assistant">{bestResult}</div>
          <div className="row" style={{ marginTop: 20 }}>
            <a className="btn" href={`/api/workshops/${code}/certificate/${participant.id}`} target="_blank">Certificaat openen</a>
            <a className="btn secondary" href={`/workshop/${code}/chat`}>Terug naar chat</a>
          </div>
          <div className="emailPanel">
            <h2>Mail mijn certificaat</h2>
            <p className="small">Gebruik het e-mailadres van een ouder/verzorger of van school. Je adres wordt niet bij je workshopprofiel opgeslagen.</p>
            <div className="row">
              <input
                className="input"
                style={{ flex: 1 }}
                type="email"
                value={recipient}
                onChange={(event) => setRecipient(event.target.value)}
                placeholder="ouder@voorbeeld.nl"
              />
              <button className="btn" onClick={emailCertificate} disabled={sending || !recipient.trim()}>
                {sending ? "Versturen..." : "Mail certificaat"}
              </button>
            </div>
            {emailStatus ? <p className="small statusText">{emailStatus}</p> : null}
          </div>
        </div>

        <div className="certificatePreview">
          <div className="certificateDecoration decorationOne"></div>
          <div className="certificateDecoration decorationTwo"></div>
          <div className="certificatePreviewInner">
            <div className="logo">GeeGee<span>AI</span></div>
            <p className="certificateLabel">Certificaat van deelname</p>
            <h2>{workshop.title}</h2>
            <p className="small">met trots uitgereikt aan</p>
            <h1>{participant.nickname}</h1>
            <p><strong>Groep/team: {participant.groupName}</strong></p>
            <div className="certificateBadges">
              <span>AI Explorer</span>
              <span>Prompt Starter</span>
              <span>Safe AI User</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
