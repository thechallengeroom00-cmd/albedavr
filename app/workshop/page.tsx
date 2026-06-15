"use client";

import { useEffect, useMemo, useState } from "react";
import type { Workshop } from "@/lib/types";

function formatWorkshopDate(date: string) {
  return new Intl.DateTimeFormat("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(new Date(`${date}T12:00:00`));
}

export default function WorkshopSelectPage() {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/workshops", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => setWorkshops((data.workshops || []).filter((workshop: Workshop) => workshop.status === "active")))
      .finally(() => setLoading(false));
  }, []);

  const locations = useMemo(() => {
    const counts = new Map<string, number>();
    for (const workshop of workshops) {
      const location = workshop.location.trim();
      if (location) counts.set(location, (counts.get(location) || 0) + 1);
    }
    return Array.from(counts.entries()).sort(([a], [b]) => a.localeCompare(b, "nl"));
  }, [workshops]);

  const locationWorkshops = useMemo(() => {
    return workshops
      .filter((workshop) => workshop.location === selectedLocation)
      .sort((a, b) => `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`));
  }, [selectedLocation, workshops]);

  return (
    <main className="container">
      <header className="header">
        <a className="logo" href="/">GeeGee<span>AI</span></a>
        <span className="badge">Workshop kiezen</span>
      </header>

      <section className="locationHero">
        <span className="badge">Stap {selectedLocation ? "2 van 2" : "1 van 2"}</span>
        <h1 className="h1">{selectedLocation ? "Kies jouw workshopmoment" : "Waar volg jij de workshop?"}</h1>
        <p className="muted">
          {selectedLocation
            ? `Dit zijn de beschikbare momenten bij ${selectedLocation}.`
            : "Kies eerst je locatie. Daarna zie je alleen de workshops die daar gepland staan."}
        </p>
      </section>

      {loading ? <section className="card">Workshops laden...</section> : null}

      {!loading && !selectedLocation ? (
        <section className="locationGrid">
          {locations.map(([location, count]) => (
            <button className="locationCard" key={location} onClick={() => setSelectedLocation(location)}>
              <span className="locationPin">⌖</span>
              <span>
                <strong>{location}</strong>
                <small>{count} {count === 1 ? "workshopmoment" : "workshopmomenten"}</small>
              </span>
              <span className="locationArrow">→</span>
            </button>
          ))}
          {locations.length === 0 ? (
            <div className="card">
              <h2 className="h2">Nog geen workshops gepland</h2>
              <p className="muted">Vraag de begeleider wanneer jouw locatie beschikbaar komt.</p>
            </div>
          ) : null}
        </section>
      ) : null}

      {!loading && selectedLocation ? (
        <>
          <button className="btn secondary locationBack" onClick={() => setSelectedLocation("")}>← Andere locatie kiezen</button>
          <section className="momentGrid">
            {locationWorkshops.map((workshop) => (
              <article className="momentCard" key={workshop.code}>
                <div className="momentDate">
                  <span>{new Intl.DateTimeFormat("nl-NL", { month: "short" }).format(new Date(`${workshop.date}T12:00:00`))}</span>
                  <strong>{new Date(`${workshop.date}T12:00:00`).getDate()}</strong>
                </div>
                <div className="momentInfo">
                  <span className="badge">{workshop.audienceMode === "primary" ? "Basisschool" : "Middelbare school"}</span>
                  <h2>{workshop.title}</h2>
                  {workshop.clientName ? <p>{workshop.clientName}</p> : null}
                  <dl>
                    <div><dt>Datum</dt><dd>{formatWorkshopDate(workshop.date)}</dd></div>
                    <div><dt>Tijd</dt><dd>{workshop.startTime}{workshop.endTime ? `–${workshop.endTime}` : ""}</dd></div>
                    <div><dt>Locatie</dt><dd>{workshop.location}</dd></div>
                  </dl>
                  <a className="btn" href={`/workshop/${workshop.code}`}>Start hier</a>
                </div>
              </article>
            ))}
          </section>
        </>
      ) : null}
    </main>
  );
}
