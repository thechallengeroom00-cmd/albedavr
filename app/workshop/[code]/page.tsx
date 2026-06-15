"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { Workshop } from "@/lib/types";

export default function WorkshopJoinPage() {
  const params = useParams<{ code: string }>();
  const code = String(params.code || "").toUpperCase();
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [nickname, setNickname] = useState("");
  const [groupName, setGroupName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/workshops/${code}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => setWorkshop(data.workshop || null));
  }, [code]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    const res = await fetch(`/api/workshops/${code}/participants`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nickname, groupName })
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Inloggen lukt niet.");
      return;
    }
    localStorage.setItem(`geegee-participant-${code}`, data.participant.id);
    window.location.href = `/workshop/${code}/chat`;
  }

  if (!workshop) return <main className="container"><div className="card">Workshop laden...</div></main>;

  return (
    <main className="container">
      <header className="header">
        <a className="logo" href="/workshop">GeeGee<span>AI</span></a>
        <span className="badge">Workshopcode: {code}</span>
      </header>

      <section className="grid two">
        <div className="card">
          <h1 className="h1">Welkom bij de GeeGee AI Workshop</h1>
          <p className="muted">{workshop.title}</p>
          <div className="joinSchedule">
            <div><span>Locatie</span><strong>{workshop.location}</strong></div>
            <div><span>Datum</span><strong>{new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "long", year: "numeric" }).format(new Date(`${workshop.date}T12:00:00`))}</strong></div>
            <div><span>Tijd</span><strong>{workshop.startTime}{workshop.endTime ? `–${workshop.endTime}` : ""}</strong></div>
          </div>
          <div className="alert" style={{ marginTop: 18 }}>
            Je werkt vandaag met AI. Gebruik een nickname en deel geen privégegevens. AI kan fouten maken, dus blijf zelf nadenken. Typ respectvol. Als iets niet past binnen deze workshop, wordt het bericht gestopt.
          </div>
        </div>

        <form className="card grid" onSubmit={submit}>
          <h2 className="h2">Start anoniem</h2>
          <label className="label">Nickname
            <input className="input" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="Bijv. Gamer12" maxLength={40} />
          </label>
          <label className="label">Groep/team
            <input className="input" value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="Bijv. Team Blauw" maxLength={40} />
          </label>
          {error ? <p style={{ color: "var(--danger)" }}>{error}</p> : null}
          <button className="btn" type="submit">Start workshop</button>
          <p className="small">Geen e-mail, geen wachtwoord en geen echte volledige naam nodig.</p>
        </form>
      </section>
    </main>
  );
}
