"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import type { ChatMessage, ModerationEvent, Participant, ResultItem, Workshop } from "@/lib/types";
import { topicLabels } from "@/lib/topics";

const moduleLabels: Record<keyof Workshop["modules"], string> = {
  textChat: "Tekstchat",
  images: "Afbeeldingen genereren",
  internet: "Internet/web",
  audio: "Audio/spraak",
  files: "Bestanden uploaden",
  musicIdeas: "Muziekideeën",
  lyrics: "Songteksten",
  beatSuggestions: "Beatsuggesties",
  realAudio: "Echte muziek/audio"
};

export default function AdminWorkshopPage() {
  const routeParams = useParams<{ code: string }>();
  const code = String(routeParams.code || "");
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [results, setResults] = useState<ResultItem[]>([]);
  const [events, setEvents] = useState<ModerationEvent[]>([]);
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);
  const [certificateRecipient, setCertificateRecipient] = useState("");
  const [emailStatus, setEmailStatus] = useState("");
  const [sendingCertificates, setSendingCertificates] = useState(false);

  async function load() {
    if (!code) return;
    const res = await fetch(`/api/workshops/${code}`, { cache: "no-store" });
    const data = await res.json();
    setWorkshop(data.workshop || null);
    setParticipants(data.participants || []);
    setMessages(data.messages || []);
    setResults(data.results || []);
    setEvents(data.moderationEvents || []);
  }

  useEffect(() => {
    load();
    const timer = setInterval(load, 2000);
    return () => clearInterval(timer);
  }, [code]);

  const messagesByParticipant = useMemo(() => {
    const map = new Map<string, ChatMessage[]>();
    for (const message of messages) {
      map.set(message.participantId, [...(map.get(message.participantId) || []), message]);
    }
    return map;
  }, [messages]);

  const selectedParticipant = participants.find((participant) => participant.id === selectedParticipantId) || null;
  const selectedMessages = selectedParticipant
    ? messagesByParticipant.get(selectedParticipant.id) || []
    : [];
  const selectedResults = selectedParticipant
    ? results.filter((result) => result.participantId === selectedParticipant.id)
    : [];
  const selectedEvents = selectedParticipant
    ? events.filter((event) => event.participantId === selectedParticipant.id)
    : [];

  async function updateWorkshop(patch: Partial<Workshop>) {
    await fetch(`/api/workshops/${code}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch)
    });
    await load();
  }

  async function pushEndScreen() {
    await fetch(`/api/workshops/${code}/end`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ forceEndScreen: true })
    });
    await load();
  }

  async function emailAllCertificates() {
    if (!certificateRecipient.trim()) return;
    setSendingCertificates(true);
    setEmailStatus("");
    const response = await fetch(`/api/workshops/${code}/certificates/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipient: certificateRecipient })
    });
    const data = await response.json();
    setEmailStatus(data.message || data.error || "Versturen is niet gelukt.");
    setSendingCertificates(false);
  }

  if (!workshop) {
    return <main className="container"><div className="card">Workshop laden...</div></main>;
  }

  return (
    <main className="container">
      <header className="header">
        <div>
          <a className="logo" href="/admin">GeeGee<span>AI</span></a>
          <a className="adminBreadcrumb" href="/admin">← Alle workshops</a>
        </div>
        <div className="row">
          <a className="btn secondary" href={`/workshop/${workshop.code}`}>Deelnemerlink</a>
          <button className="btn ok" onClick={pushEndScreen}>Stuur iedereen naar eindscherm</button>
        </div>
      </header>

      <section className="card">
        <div className="workshopLiveHeader">
          <div>
            <span className="badge">Live workshopoverzicht</span>
            <a className="workshopTitleLink" href="#live-deelnemers">
              <h1>{workshop.title}</h1>
              <span>Bekijk deelnemers en live details ↓</span>
            </a>
            <p className="muted">
              Code: <strong>{workshop.code}</strong> · {workshop.location} · {workshop.date} · {workshop.startTime}{workshop.endTime ? `–${workshop.endTime}` : ""}
            </p>
          </div>
          <span className="badge">{workshop.forceEndScreen ? "Eindscherm actief" : "Workshop actief"}</span>
        </div>
        <div className="workshopQuickStats">
          <div><strong>{participants.length}</strong><span>deelnemers</span></div>
          <div><strong>{messages.filter((message) => message.role === "participant").length}</strong><span>vragen</span></div>
          <div><strong>{events.length}</strong><span>waarschuwingen</span></div>
          <div><strong>{workshop.audienceMode === "primary" ? "Basisschool" : "Middelbare school"}</strong><span>doelgroep</span></div>
        </div>
      </section>

      <section className="grid two" style={{ marginTop: 16 }}>
        <div className="card">
          <h2 className="h2">Modules aan/uit</h2>
          <div className="grid">
            {(Object.keys(moduleLabels) as Array<keyof Workshop["modules"]>).map((key) => (
              <label className="switch" key={key}>
                <span>{moduleLabels[key]}</span>
                <input
                  type="checkbox"
                  checked={workshop.modules[key]}
                  disabled={key === "textChat"}
                  onChange={(e) => updateWorkshop({ modules: { ...workshop.modules, [key]: e.target.checked } })}
                />
              </label>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="h2">Workshopinstellingen</h2>
          <div className="grid">
            <label className="label">Workshopnaam
              <input
                className="input"
                value={workshop.title}
                onChange={(event) => setWorkshop({ ...workshop, title: event.target.value })}
                onBlur={() => updateWorkshop({ title: workshop.title })}
              />
            </label>
            <label className="label">Locatie
              <input
                className="input"
                value={workshop.location}
                onChange={(event) => setWorkshop({ ...workshop, location: event.target.value })}
                onBlur={() => updateWorkshop({ location: workshop.location })}
              />
            </label>
            <label className="label">Datum
              <input className="input" type="date" value={workshop.date} onChange={(event) => updateWorkshop({ date: event.target.value })} />
            </label>
            <label className="label">Doelgroep
              <select className="select" value={workshop.audienceMode} onChange={(e) => updateWorkshop({ audienceMode: e.target.value as Workshop["audienceMode"] })}>
                <option value="primary">Basisschool groep 6 t/m 8</option>
                <option value="secondary">Middelbare school</option>
              </select>
            </label>
            <label className="label">Webmodus
              <select className="select" value={workshop.webMode} onChange={(e) => updateWorkshop({ webMode: e.target.value as Workshop["webMode"] })}>
                <option value="off">Uit</option>
                <option value="safe">Veilige webmodus</option>
                <option value="filtered">Gefilterde webmodus</option>
              </select>
            </label>
            <label className="label">AI-provider
              <select className="select" value={workshop.provider} onChange={(e) => updateWorkshop({ provider: e.target.value as Workshop["provider"] })}>
                <option value="mock">Mock AI</option>
                <option value="openai">OpenAI</option>
                <option value="claude">Claude</option>
                <option value="both">OpenAI + Claude</option>
              </select>
            </label>
          </div>
        </div>
      </section>

      <section className="card" style={{ marginTop: 16 }}>
        <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h2 className="h2">Alle certificaten mailen</h2>
            <p className="muted">Verstuur de certificaten van alle deelnemers in één e-mail naar school of de workshopbegeleider.</p>
          </div>
          <span className="badge">{participants.length} {participants.length === 1 ? "certificaat" : "certificaten"}</span>
        </div>
        <div className="row">
          <input
            className="input"
            style={{ flex: 1 }}
            type="email"
            value={certificateRecipient}
            onChange={(event) => setCertificateRecipient(event.target.value)}
            placeholder="school@voorbeeld.nl"
          />
          <button
            className="btn"
            onClick={emailAllCertificates}
            disabled={sendingCertificates || !certificateRecipient.trim() || participants.length === 0}
          >
            {sendingCertificates ? "Versturen..." : "Mail alles tegelijk"}
          </button>
        </div>
        {emailStatus ? <p className="small statusText">{emailStatus}</p> : null}
      </section>

      <section className="grid two" id="live-deelnemers" style={{ marginTop: 16, scrollMarginTop: 20 }}>
        <div className="card">
          <h2 className="h2">Live deelnemers</h2>
          {participants.length === 0 ? <p className="muted">Nog geen deelnemers.</p> : null}
          <div className="grid">
            {participants.map((participant) => (
              <button
                className="participantCard"
                key={participant.id}
                onClick={() => setSelectedParticipantId(participant.id)}
                aria-label={`Bekijk alles van ${participant.nickname}`}
              >
                <div className="participantSummary">
                  <div>
                    <span className="small">Naam</span>
                    <strong>{participant.nickname}</strong>
                  </div>
                  <div>
                    <span className="small">Team</span>
                    <strong>{participant.groupName}</strong>
                  </div>
                  <div>
                    <span className="small">Topic</span>
                    <strong>
                      {participant.activeTopic
                        ? `${topicLabels[participant.activeTopic].emoji} ${topicLabels[participant.activeTopic].title}`
                        : "Nog niet gekozen"}
                    </strong>
                  </div>
                  <div>
                    <span className="small">Waarschuwingen</span>
                    {events.filter((event) => event.participantId === participant.id).length > 0 ? (
                      <span className="warningCount">
                        {events.filter((event) => event.participantId === participant.id).length}
                      </span>
                    ) : (
                      <span className="safeStatus">Geen</span>
                    )}
                  </div>
                </div>
                <small className="participantOpenHint">Bekijk volledige activiteit →</small>
              </button>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="h2">Moderatiemeldingen</h2>
          {events.length === 0 ? <p className="muted">Geen meldingen.</p> : null}
          <div className="grid">
            {events.slice(-12).reverse().map((event) => (
              <div className="alert" key={event.id}>
                <strong>{event.category}</strong> · {event.severity}
                <p>{event.originalInput}</p>
                <p className="small">Actie: {event.action}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {selectedParticipant ? (
        <div className="participantModalBackdrop" role="presentation" onClick={() => setSelectedParticipantId(null)}>
          <section
            className="participantModal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="participant-detail-title"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="participantModalHeader">
              <div>
                <p className="small">Volledige deelnemersactiviteit</p>
                <h2 className="h2" id="participant-detail-title">{selectedParticipant.nickname}</h2>
                <div className="row">
                  <span className="badge">{selectedParticipant.groupName}</span>
                  <span className="badge">
                    {selectedParticipant.activeTopic
                      ? `${topicLabels[selectedParticipant.activeTopic].emoji} ${topicLabels[selectedParticipant.activeTopic].title}`
                      : "Nog geen topic"}
                  </span>
                  <span className="badge">{selectedMessages.length} berichten</span>
                </div>
              </div>
              <button className="modalClose" onClick={() => setSelectedParticipantId(null)} aria-label="Sluiten">×</button>
            </header>

            <div className="participantStats">
              <div><strong>{selectedMessages.filter((message) => message.role === "participant").length}</strong><span>vragen</span></div>
              <div><strong>{selectedResults.length}</strong><span>resultaten</span></div>
              <div><strong>{selectedEvents.length}</strong><span>meldingen</span></div>
              <div><strong>{new Date(selectedParticipant.joinedAt).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}</strong><span>gestart</span></div>
            </div>

            <div className="participantDetailGrid">
              <div>
                <h3>Volledige chat</h3>
                {selectedMessages.length === 0 ? <p className="muted">Deze deelnemer heeft nog niets verstuurd.</p> : null}
                <div className="participantHistory">
                  {selectedMessages.map((message) => (
                    <article
                      className={`detailMessage ${message.role === "participant" ? "participant" : "assistant"} ${message.moderationStatus === "blocked" ? "blocked" : ""}`}
                      key={message.id}
                    >
                      <div className="detailMessageMeta">
                        <strong>{message.role === "participant" ? selectedParticipant.nickname : "GeeGee AI"}</strong>
                        <span>{new Date(message.createdAt).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                      <p>{message.moderationStatus === "blocked" ? message.moderationReason : message.content}</p>
                    </article>
                  ))}
                </div>
              </div>

              <aside className="participantSideInfo">
                <h3>Opgeslagen resultaten</h3>
                {selectedResults.length === 0 ? <p className="small">Nog geen resultaten opgeslagen.</p> : null}
                {selectedResults.map((result) => (
                  <div className="resultCard" key={result.id}>
                    <span className="badge">{result.type}</span>
                    <strong>{result.title}</strong>
                    <p>{result.content}</p>
                  </div>
                ))}

                <h3>Moderatie</h3>
                {selectedEvents.length === 0 ? <p className="small">Geen meldingen voor deze deelnemer.</p> : null}
                {selectedEvents.map((event) => (
                  <div className="alert" key={event.id}>
                    <strong>{event.category}</strong> · {event.severity}
                    <p>{event.originalInput}</p>
                    <p className="small">Actie: {event.action}</p>
                  </div>
                ))}
              </aside>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}
