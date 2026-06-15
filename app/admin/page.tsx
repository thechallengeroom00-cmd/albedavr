"use client";

import { FormEvent, useEffect, useState } from "react";
import type { ModuleSettings, Workshop } from "@/lib/types";

const moduleLabels: Record<keyof ModuleSettings, string> = {
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

const defaultModules: ModuleSettings = {
  textChat: true,
  images: false,
  internet: false,
  audio: false,
  files: false,
  musicIdeas: true,
  lyrics: true,
  beatSuggestions: true,
  realAudio: false
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("nl-NL", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(new Date(`${date}T12:00:00`));
}

export default function AdminPage() {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [title, setTitle] = useState("AI Workshop");
  const [location, setLocation] = useState("");
  const [clientName, setClientName] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState("14:00");
  const [endTime, setEndTime] = useState("16:00");
  const [audienceMode, setAudienceMode] = useState<Workshop["audienceMode"]>("primary");
  const [provider, setProvider] = useState<Workshop["provider"]>("mock");
  const [webMode, setWebMode] = useState<Workshop["webMode"]>("safe");
  const [modules, setModules] = useState<ModuleSettings>(defaultModules);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch("/api/workshops", { cache: "no-store" });
    const data = await res.json();
    setWorkshops(data.workshops || []);
  }

  useEffect(() => { load(); }, []);

  async function createWorkshop(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch("/api/workshops", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        location,
        clientName,
        date,
        startTime,
        endTime,
        audienceMode,
        provider,
        webMode,
        modules,
        status: "active"
      })
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Workshop opslaan is niet gelukt.");
      setSaving(false);
      return;
    }
    if (data.workshop?.code) window.location.href = `/admin/workshops/${data.workshop.code}`;
  }

  return (
    <main className="container">
      <header className="header">
        <a className="logo" href="/">GeeGee<span>AI</span></a>
        <span className="badge">Admin dashboard</span>
      </header>

      <form className="card workshopPlanner" onSubmit={createWorkshop}>
        <div className="plannerIntro">
          <div>
            <span className="badge">Nieuwe workshop</span>
            <h1 className="h1 plannerTitle">Plan een workshopmoment</h1>
            <p className="muted">Vul het moment en de locatie in. Deelnemers kunnen deze workshop daarna zelf vinden via de locatiekeuze.</p>
          </div>
          <button className="btn plannerSave" disabled={saving}>
            {saving ? "Aanmaken..." : "Workshop aanmaken en openen"}
          </button>
        </div>

        <div className="plannerSections">
          <section className="plannerSection">
            <h2>Basisgegevens</h2>
            <div className="grid two">
              <label className="label">Workshopnaam
                <input className="input" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Bijv. AI Ontdekkersmiddag" required />
              </label>
              <label className="label">School / organisatie
                <input className="input" value={clientName} onChange={(event) => setClientName(event.target.value)} placeholder="Bijv. Basisschool De Regenboog" />
              </label>
            </div>
            <label className="label">Locatie
              <input className="input" value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Bijv. GeeGee Gaming Utrecht" required />
            </label>
          </section>

          <section className="plannerSection">
            <h2>Datum en tijd</h2>
            <div className="plannerTimeGrid">
              <label className="label">Datum
                <input className="input" type="date" value={date} onChange={(event) => setDate(event.target.value)} required />
              </label>
              <label className="label">Begintijd
                <input className="input" type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} required />
              </label>
              <label className="label">Eindtijd
                <input className="input" type="time" value={endTime} onChange={(event) => setEndTime(event.target.value)} />
              </label>
            </div>
            <div className="label">
              Doelgroep en moeilijkheid
              <div className="audiencePicker">
                <button
                  className={`audienceOption ${audienceMode === "primary" ? "selected" : ""}`}
                  type="button"
                  onClick={() => setAudienceMode("primary")}
                  aria-pressed={audienceMode === "primary"}
                >
                  <span className="audienceIcon">🧩</span>
                  <strong>Basisschool</strong>
                  <small>Veel begeleiding, korte stappen en eenvoudige voorbeelden.</small>
                </button>
                <button
                  className={`audienceOption ${audienceMode === "secondary" ? "selected" : ""}`}
                  type="button"
                  onClick={() => setAudienceMode("secondary")}
                  aria-pressed={audienceMode === "secondary"}
                >
                  <span className="audienceIcon">⚡</span>
                  <strong>Middelbare school</strong>
                  <small>Meer vrijheid, complexere keuzes en kritische feedback.</small>
                </button>
              </div>
            </div>
          </section>

          <section className="plannerSection">
            <h2>AI-instellingen</h2>
            <div className="grid two">
              <label className="label">AI-provider
                <select className="select" value={provider} onChange={(event) => setProvider(event.target.value as Workshop["provider"])}>
                  <option value="mock">Mock AI</option>
                  <option value="openai">OpenAI</option>
                  <option value="claude">Claude</option>
                  <option value="both">OpenAI + Claude</option>
                </select>
              </label>
              <label className="label">Webmodus
                <select className="select" value={webMode} onChange={(event) => setWebMode(event.target.value as Workshop["webMode"])}>
                  <option value="off">Uit</option>
                  <option value="safe">Veilige webmodus</option>
                  <option value="filtered">Gefilterde webmodus</option>
                </select>
              </label>
            </div>
          </section>

          <section className="plannerSection">
            <h2>Beschikbare onderdelen</h2>
            <div className="modulePlannerGrid">
              {(Object.keys(moduleLabels) as Array<keyof ModuleSettings>).map((key) => (
                <label className="switch" key={key}>
                  <span>{moduleLabels[key]}</span>
                  <input
                    type="checkbox"
                    checked={modules[key]}
                    disabled={key === "textChat"}
                    onChange={(event) => setModules({ ...modules, [key]: event.target.checked })}
                  />
                </label>
              ))}
            </div>
          </section>
        </div>

        {error ? <p className="alert">{error}</p> : null}
        <div className="plannerBottom">
          <p className="small">Na aanmaken opent direct het live workshopoverzicht met de workshopcode en deelnemers.</p>
          <button className="btn" disabled={saving}>{saving ? "Aanmaken..." : "Workshop aanmaken en openen"}</button>
        </div>
      </form>

      <section className="card" style={{ marginTop: 16 }}>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div>
            <h2 className="h2">Geplande workshops</h2>
            <p className="muted">Alle momenten die deelnemers via hun locatie kunnen kiezen.</p>
          </div>
          <a className="btn secondary" href="/workshop">Bekijk deelnemerskeuze</a>
        </div>
        <div className="workshopList">
          {workshops.map((workshop) => (
            <article className="scheduledWorkshop" key={workshop.code}>
              <div className="scheduleDate">
                <strong>{new Date(`${workshop.date}T12:00:00`).getDate()}</strong>
                <span>{new Intl.DateTimeFormat("nl-NL", { month: "short" }).format(new Date(`${workshop.date}T12:00:00`))}</span>
              </div>
              <div className="scheduleInfo">
                <a className="scheduleTitleLink" href={`/admin/workshops/${workshop.code}`}>{workshop.title}</a>
                <span>{workshop.location || "Locatie niet ingevuld"}</span>
                <small>{formatDate(workshop.date)} · {workshop.startTime || "Tijd onbekend"}{workshop.endTime ? `–${workshop.endTime}` : ""}</small>
              </div>
              <span className="badge">{workshop.audienceMode === "primary" ? "Basisschool" : "Middelbare school"}</span>
              <a className="btn secondary" href={`/admin/workshops/${workshop.code}`}>Bekijk live workshop</a>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
