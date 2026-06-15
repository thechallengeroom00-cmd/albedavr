"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import type { ChatMessage, Participant, ResultItem, TopicId, Workshop } from "@/lib/types";
import { secondaryTopicIdeas, topicIdeas, topicLabels } from "@/lib/topics";

const moduleIcons: Partial<Record<keyof Workshop["modules"], { icon: string; label: string }>> = {
  textChat: { icon: "💬", label: "Chat" },
  images: { icon: "🎨", label: "Beeld" },
  internet: { icon: "🌐", label: "Web" },
  audio: { icon: "🎙️", label: "Spraak" },
  files: { icon: "📎", label: "Bestand" },
  musicIdeas: { icon: "🎵", label: "Muziek" },
  lyrics: { icon: "✍️", label: "Songtekst" },
  beatSuggestions: { icon: "🥁", label: "Beat" },
  realAudio: { icon: "🔊", label: "Audio" }
};

export default function WorkshopChatPage() {
  const params = useParams<{ code: string }>();
  const code = String(params.code || "").toUpperCase();
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [results, setResults] = useState<ResultItem[]>([]);
  const [topic, setTopic] = useState<TopicId | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [showGameMaker, setShowGameMaker] = useState(false);
  const [showCharacterMaker, setShowCharacterMaker] = useState(false);
  const [gameType, setGameType] = useState("verzamelspel");
  const [gameTheme, setGameTheme] = useState("");
  const [characterName, setCharacterName] = useState("");
  const [characterRole, setCharacterRole] = useState("held");
  const [characterPower, setCharacterPower] = useState("");
  const [characterLook, setCharacterLook] = useState("");
  const [characterWeakness, setCharacterWeakness] = useState("");

  const participantId = useMemo(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem(`geegee-participant-${code}`) || "";
  }, [code]);

  const timeline = useMemo(() => {
    const messageItems = messages.map((message) => ({
      kind: "message" as const,
      createdAt: message.createdAt,
      item: message
    }));
    const imageItems = results
      .filter((result) => result.type === "image")
      .map((result) => ({
        kind: "image" as const,
        createdAt: result.createdAt,
        item: result
      }));

    return [...messageItems, ...imageItems].sort(
      (first, second) => new Date(first.createdAt).getTime() - new Date(second.createdAt).getTime()
    );
  }, [messages, results]);

  async function load() {
    const res = await fetch(`/api/workshops/${code}`, { cache: "no-store" });
    const data = await res.json();
    setWorkshop(data.workshop || null);
    const found = (data.participants || []).find((p: Participant) => p.id === participantId) || null;
    setParticipant(found);
    setMessages((data.messages || []).filter((m: ChatMessage) => m.participantId === participantId));
    setResults((data.results || []).filter((result: ResultItem) => result.participantId === participantId));
    if (data.workshop?.forceEndScreen) window.location.href = `/workshop/${code}/end`;
  }

  useEffect(() => {
    if (!participantId) {
      window.location.href = `/workshop/${code}`;
      return;
    }
    load();
    const timer = setInterval(load, 2000);
    return () => clearInterval(timer);
  }, [participantId, code]);

  async function send(event: FormEvent) {
    event.preventDefault();
    if (!topic || !input.trim()) return;
    setLoading(true);
    setNotice("");
    try {
      const res = await fetch(`/api/workshops/${code}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantId, topic, content: input })
      });
      const data = await res.json();
      if (data.blocked) setNotice(data.reason || "Je bericht is geblokkeerd.");
      if (!res.ok) {
        setNotice(data.error || "Bericht versturen lukt niet.");
        return;
      }
      setInput("");
      await load();
    } catch {
      setNotice("De verbinding met de AI lukt nu niet. Probeer het nog een keer.");
    } finally {
      setLoading(false);
    }
  }

  async function createImage() {
    if (!topic || !input.trim()) {
      setNotice("Beschrijf eerst welke afbeelding je wilt maken.");
      return;
    }

    setImageLoading(true);
    setNotice("");
    try {
      const res = await fetch(`/api/workshops/${code}/images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantId, topic, prompt: input })
      });
      const data = await res.json();
      if (!res.ok) {
        setNotice(data.error || "Afbeelding maken lukt nu niet.");
        return;
      }
      setInput("");
      await load();
    } catch {
      setNotice("De verbinding met de beeldgenerator lukt nu niet. Probeer het nog een keer.");
    } finally {
      setImageLoading(false);
    }
  }

  function useIdea(idea: string) {
    setInput(workshop?.audienceMode === "secondary"
      ? `Ik wil dit concept uitwerken: ${idea}. Analyseer de sterke en zwakke punten, stel alleen noodzakelijke vragen en help mij daarna een concrete keuze maken.`
      : `Help mij hiermee: ${idea}. Stel eerst maximaal 3 korte vragen en help mij daarna stap voor stap.`);
  }

  function improvePrompt() {
    if (workshop?.audienceMode === "secondary") {
      setInput(input.trim()
        ? `Verbeter deze prompt op precisie, context, beperkingen en gewenste output. Leg kort uit welke keuzes je maakt: ${input}`
        : "Help mij een sterke prompt ontwerpen. Breng doel, context, randvoorwaarden, outputformaat en beoordelingscriteria in kaart.");
      return;
    }
    setInput(input.trim()
      ? `Maak deze prompt duidelijker en beter, maar houd mijn idee hetzelfde: ${input}`
      : "Help mij een goede prompt maken. Vraag naar mijn onderwerp, doel, stijl en gewenste uitkomst.");
  }

  function askGuidingQuestions() {
    setInput(workshop?.audienceMode === "secondary"
      ? "Daag mijn idee kritisch uit. Benoem één belangrijke aanname, één risico en stel maximaal 2 vragen die mijn concept echt sterker maken."
      : "Stel mij maximaal 3 korte vragen om van mijn eerste idee een duidelijk plan te maken.");
  }

  function buildGamePrompt() {
    const theme = gameTheme.trim() || "een zelfgekozen vrolijk thema";
    setInput(workshop?.audienceMode === "secondary"
      ? `Ontwikkel met mij een haalbaar prototype voor een ${gameType} met als thema ${theme}. De bouwtijd is maximaal 2 uur. Help mij een compacte conceptbrief maken met: kernlus, spelerkeuzes, win/verliesconditie, besturing, scope, technische risico's en minimale testcriteria. Geef opties, maar laat mij de ontwerpkeuzes maken.`
      : `Ik wil een eenvoudig ${gameType} maken met als thema ${theme}. Het spel moet binnen 2 uur te maken zijn, op één scherm passen, één kernmechaniek hebben, maximaal 3 soorten objecten gebruiken en werken met pijltjestoetsen of muisklikken. Help mij stap voor stap met: doel, spelregels, besturing, uiterlijk en een korte testlijst.`);
    setShowGameMaker(false);
  }

  function buildCharacterPrompt() {
    const name = characterName.trim() || "een naam die bij het karakter past";
    const power = characterPower.trim() || "één eenvoudige speciale kracht";
    const look = characterLook.trim() || "een opvallend maar eenvoudig uiterlijk";
    const weakness = characterWeakness.trim() || "één grappige of spannende zwakte";

    setInput(workshop?.audienceMode === "secondary"
      ? `Werk dit gamekarakter uit als onderdeel van een gameconcept. Naam: ${name}. Rol: ${characterRole}. Kracht: ${power}. Visuele richting: ${look}. Zwakte of beperking: ${weakness}. Maak een compacte character design brief met motivatie, gameplay-functie, kracht-zwaktebalans, visuele kenmerken en mogelijke ontwikkeling. Benoem ook één cliché dat we moeten vermijden.`
      :
      `Ontwikkel samen met mij een gamekarakter. De naam is ${name}. ` +
      `De rol is ${characterRole}. De speciale kracht is ${power}. ` +
      `Het uiterlijk is ${look}. De zwakte is ${weakness}. ` +
      "Maak een korte karakterkaart met: naam, rol, uiterlijk, kracht, zwakte, doel in het spel " +
      "en een achtergrondverhaal van maximaal 4 zinnen. Houd het karakter eenvoudig genoeg voor een klein spel dat binnen 2 uur gemaakt kan worden."
    );
    setShowCharacterMaker(false);
  }

  if (!workshop || !participant) {
    return <main className="container"><div className="card">Chat laden...</div></main>;
  }

  const isSecondary = workshop.audienceMode === "secondary";
  const activeIdeas = isSecondary ? secondaryTopicIdeas[topic || "prompting"] : topicIdeas[topic || "prompting"];

  return (
    <main className="container">
      <header className="header">
        <a className="logo" href="/">GeeGee<span>AI</span></a>
        <div className="row">
          <span className="badge">{participant.nickname}</span>
          <span className="badge">{participant.groupName}</span>
          <button className="btn secondary" onClick={() => window.location.href = `/workshop/${code}/end`}>Naar mijn eindscherm</button>
        </div>
      </header>

      {!topic ? (
        <section className={`card ${isSecondary ? "secondaryMode" : ""}`}>
          <h1 className="h2">Kies je hoofdtopic</h1>
          <p className="muted">{isSecondary ? "Kies een richting om je concept te onderzoeken en verder te ontwikkelen." : "Je keuze helpt de AI om jou beter en veiliger te begeleiden."}</p>
          <div className="grid three" style={{ marginTop: 16 }}>
            {workshop.topics.map((topicId) => (
              <button className="topic" key={topicId} onClick={() => setTopic(topicId)}>
                <span className="emoji">{topicLabels[topicId].emoji}</span>
                <strong>{topicLabels[topicId].title}</strong>
                <p className="muted">{topicLabels[topicId].description}</p>
              </button>
            ))}
          </div>
        </section>
      ) : (
        <section className={`chatShell ${isSecondary ? "secondaryMode" : ""}`}>
          <aside className="card">
            <span className="badge">{topicLabels[topic].emoji} {topicLabels[topic].title}</span>
            <p className="muted">{topicLabels[topic].description}</p>
            <button className="btn secondary" onClick={() => setTopic(null)}>Ander topic kiezen</button>
            <hr style={{ borderColor: "var(--line)", margin: "18px 0" }} />
            <h3>{isSecondary ? "Werk je idee verder uit" : "Waarmee zal ik helpen?"}</h3>
            <div className="helperGrid">
              <button className="helperButton" onClick={improvePrompt}><span>✨</span>{isSecondary ? "Scherp mijn prompt aan" : "Help met mijn prompt"}</button>
              <button className="helperButton" onClick={askGuidingQuestions}><span>❓</span>{isSecondary ? "Daag mijn idee uit" : "Stel mij vragen"}</button>
              {topic === "ai-gaming" ? (
                <>
                  <button
                    className="helperButton featured"
                    onClick={() => {
                      setShowGameMaker((value) => !value);
                      setShowCharacterMaker(false);
                    }}
                  >
                  <span>🕹️</span>{isSecondary ? "Ontwikkel een gameconcept" : "Maak je eigen spel"}
                  </button>
                  <button
                    className="helperButton character"
                    onClick={() => {
                      setShowCharacterMaker((value) => !value);
                      setShowGameMaker(false);
                    }}
                  >
                    <span>🦸</span>{isSecondary ? "Character design" : "Ontwikkel je gamekarakter"}
                  </button>
                </>
              ) : null}
            </div>
            {showGameMaker && topic === "ai-gaming" ? (
              <div className="gameMaker">
                <strong>{isSecondary ? "Gameconcept" : "Kleine gamebouwer"}</strong>
                <p className="small">{isSecondary ? "Ontwerp een sterke kernlus en bewaak de scope voor een prototype van maximaal 2 uur." : "Eén scherm, één spelregel en eenvoudige besturing. Zo blijft je spel haalbaar."}</p>
                <label className="label">Soort spel
                  <select className="select" value={gameType} onChange={(event) => setGameType(event.target.value)}>
                    <option value="verzamelspel">Verzamelspel</option>
                    <option value="ontwijkspel">Ontwijkspel</option>
                    <option value="klikspel">Klikspel</option>
                    <option value="kort keuzesverhaal">Keuzesverhaal</option>
                  </select>
                </label>
                <label className="label">Thema
                  <input className="input" value={gameTheme} onChange={(event) => setGameTheme(event.target.value)} placeholder="Ruimte, voetbal, snoep..." />
                </label>
                <button className="btn" onClick={buildGamePrompt}>{isSecondary ? "Maak conceptbrief" : "Maak mijn gameplan"}</button>
              </div>
            ) : null}
            {showCharacterMaker && topic === "ai-gaming" ? (
              <div className="gameMaker characterMaker">
                <strong>{isSecondary ? "Character design brief" : "Gamekarakter-maker"}</strong>
                <p className="small">{isSecondary ? "Koppel motivatie, visueel ontwerp en gameplay-functie tot één geloofwaardig concept." : "Maak één duidelijk karakter met één kracht en één zwakte. Zo blijft het makkelijk om in je spel te gebruiken."}</p>
                <label className="label">Naam
                  <input className="input" value={characterName} onChange={(event) => setCharacterName(event.target.value)} placeholder="Bijv. Pixel Puck" />
                </label>
                <label className="label">Rol
                  <select className="select" value={characterRole} onChange={(event) => setCharacterRole(event.target.value)}>
                    <option value="held">Held</option>
                    <option value="helper">Helper</option>
                    <option value="tegenstander">Tegenstander</option>
                    <option value="grappig bijpersonage">Grappig bijpersonage</option>
                  </select>
                </label>
                <label className="label">Speciale kracht
                  <input className="input" value={characterPower} onChange={(event) => setCharacterPower(event.target.value)} placeholder="Bijv. kan 3 seconden vliegen" />
                </label>
                <label className="label">Uiterlijk
                  <input className="input" value={characterLook} onChange={(event) => setCharacterLook(event.target.value)} placeholder="Bijv. paarse jas en lichtgevende schoenen" />
                </label>
                <label className="label">Zwakte
                  <input className="input" value={characterWeakness} onChange={(event) => setCharacterWeakness(event.target.value)} placeholder="Bijv. is bang voor water" />
                </label>
                <button className="btn" onClick={buildCharacterPrompt}>{isSecondary ? "Maak design brief" : "Maak mijn karakterkaart"}</button>
              </div>
            ) : null}
            <h3 className="ideasTitle">Ideeën om te starten</h3>
            <div className="ideaList">
              {activeIdeas.map((idea) => (
                <button key={idea} onClick={() => useIdea(idea)}>{idea}</button>
              ))}
            </div>
            <div className="moduleDock" aria-label="Beschikbare mogelijkheden">
              {(Object.keys(workshop.modules) as Array<keyof Workshop["modules"]>)
                .filter((key) => workshop.modules[key] && moduleIcons[key])
                .map((key) => (
                  <span title={moduleIcons[key]?.label} key={key}>{moduleIcons[key]?.icon}</span>
                ))}
            </div>
          </aside>

          <div className="card">
            <div className="messageList">
              {timeline.length === 0 ? <p className="muted">Stel je eerste vraag.</p> : null}
              {timeline.map((timelineItem) => {
                if (timelineItem.kind === "image") {
                  const result = timelineItem.item;
                  return (
                    <div className="generatedImageCard" key={result.id}>
                      <img className="generatedImage" src={result.content} alt={result.title || "Gegenereerde afbeelding"} />
                      <div className="generatedImageInfo">
                        <strong>{result.title}</strong>
                        <a className="btn secondary" href={result.content} download={`geegee-afbeelding-${result.id}.png`}>
                          Download afbeelding
                        </a>
                      </div>
                    </div>
                  );
                }

                const message = timelineItem.item;
                return (
                  <div key={message.id} className={`msg ${message.role === "participant" ? "participant" : "assistant"} ${message.moderationStatus === "blocked" ? "blocked" : ""}`}>
                    {message.moderationStatus === "blocked" ? message.moderationReason : message.content}
                  </div>
                );
              })}
            </div>
            {notice ? <p className="alert">{notice}</p> : null}
            <form className="row" style={{ marginTop: 12 }} onSubmit={send}>
              <input className="input" style={{ flex: 1 }} value={input} onChange={(e) => setInput(e.target.value)} placeholder="Typ je vraag aan AI..." />
              {workshop.modules.images ? (
                <button className="btn imageButton" type="button" onClick={createImage} disabled={loading || imageLoading}>
                  {imageLoading ? "Beeld maken..." : "Maak afbeelding"}
                </button>
              ) : null}
              <button className="btn" disabled={loading || imageLoading}>{loading ? "Bezig..." : "Verstuur"}</button>
            </form>
          </div>
        </section>
      )}
    </main>
  );
}
