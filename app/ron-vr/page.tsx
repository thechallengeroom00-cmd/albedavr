"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./ron-vr.module.css";

type Level = {
  eyebrow: string;
  title: string;
  instruction: string;
  action: string;
  pin: string;
  pinMark: string;
  scene: "school" | "festival" | "city" | "challenge" | "finale" | "badge";
};

const levels: Level[] = [
  {
    eyebrow: "Level 1",
    title: "Welkom op je opleiding",
    instruction: "Loop naar Sam en maak kennis.",
    action: "Maak kennis",
    pin: "Kennismaking",
    pinMark: "HI",
    scene: "school",
  },
  {
    eyebrow: "Level 2",
    title: "Kick-off Festival",
    instruction: "Ga naar het podium en bekijk de show.",
    action: "Bekijk de show",
    pin: "Festival",
    pinMark: "LIVE",
    scene: "festival",
  },
  {
    eyebrow: "Level 3",
    title: "Impact Tour",
    instruction: "Kies een plek en ontdek Rotterdam.",
    action: "Reis naar de locatie",
    pin: "Rotterdam",
    pinMark: "010",
    scene: "city",
  },
  {
    eyebrow: "Level 4",
    title: "Doe iets met impact",
    instruction: "Kies een challenge die bij jou past.",
    action: "Start de challenge",
    pin: "Impact",
    pinMark: "+",
    scene: "challenge",
  },
  {
    eyebrow: "Level 5",
    title: "Dit hebben wij gedaan",
    instruction: "Deel jullie resultaat met de klas.",
    action: "Presenteer project",
    pin: "Samen",
    pinMark: "WIJ",
    scene: "finale",
  },
  {
    eyebrow: "Eindstation",
    title: "Ontgrendel je Edubadge",
    instruction: "Alle pins zijn binnen. Activeer je badge.",
    action: "Ontgrendel Edubadge",
    pin: "Edubadge",
    pinMark: "EDU",
    scene: "badge",
  },
];

export default function RonVrPage() {
  const [levelIndex, setLevelIndex] = useState(0);
  const [phase, setPhase] = useState<"explore" | "reward" | "complete">("explore");
  const [pins, setPins] = useState<string[]>([]);
  const [videoOpen, setVideoOpen] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [choice, setChoice] = useState("");
  const [confetti, setConfetti] = useState(false);

  const level = levels[levelIndex];
  const progress = Math.round((pins.length / 5) * 100);

  useEffect(() => {
    if (!videoOpen) return;
    setVideoProgress(0);
    const timer = window.setInterval(() => {
      setVideoProgress((current) => {
        if (current >= 100) {
          window.clearInterval(timer);
          setVideoOpen(false);
          setPhase("reward");
          return 100;
        }
        return current + 2;
      });
    }, 80);
    return () => window.clearInterval(timer);
  }, [videoOpen]);

  const confettiPieces = useMemo(
    () =>
      Array.from({ length: 36 }, (_, index) => ({
        left: `${(index * 29) % 100}%`,
        delay: `${(index % 9) * 0.08}s`,
        color: ["#ef476f", "#ffd166", "#06d6a0", "#6c63ff", "#2ec4ff"][index % 5],
      })),
    [],
  );

  function doPrimaryAction() {
    if (level.scene === "festival") {
      setVideoOpen(true);
      return;
    }
    if (level.scene === "challenge" && !choice) return;
    if (level.scene === "badge") {
      setConfetti(true);
      setPhase("complete");
      return;
    }
    setPhase("reward");
  }

  function collectPin() {
    if (levelIndex >= 5) return;
    setPins((current) => [...current, level.pin]);
    setPhase("explore");
    setChoice("");
    setLevelIndex((current) => current + 1);
  }

  function resetJourney() {
    setLevelIndex(0);
    setPins([]);
    setPhase("explore");
    setChoice("");
    setConfetti(false);
    setVideoOpen(false);
  }

  return (
    <main className={styles.app}>
      <div className={styles.skyGlow} />

      <header className={styles.topbar}>
        <a href="/" className={styles.brand} aria-label="Terug naar GeeGee AI">
          <span className={styles.brandMark}>A</span>
          <span>
            <strong>ALBEDA</strong>
            <small>Impact Journey</small>
          </span>
        </a>
        <div className={styles.levelProgress}>
          <span>{level.eyebrow}</span>
          <div className={styles.progressTrack}>
            <i style={{ width: `${levelIndex === 5 ? 100 : progress}%` }} />
          </div>
          <strong>{Math.min(pins.length, 5)}/5 pins</strong>
        </div>
        <button className={styles.iconButton} onClick={resetJourney} aria-label="Opnieuw beginnen">
          ↻
        </button>
      </header>

      <section className={`${styles.world} ${styles[level.scene]}`}>
        <div className={styles.worldLabel}>ROTTERDAM · IMPACT EXPERIENCE</div>
        <div className={styles.sun} />
        <div className={styles.cloudOne} />
        <div className={styles.cloudTwo} />
        <Scene level={level} choice={choice} setChoice={setChoice} />

        <div className={styles.crosshair} aria-hidden="true">
          <span />
        </div>

        <section className={styles.missionCard}>
          <div className={styles.missionNumber}>{String(levelIndex + 1).padStart(2, "0")}</div>
          <div>
            <span className={styles.kicker}>{level.eyebrow}</span>
            <h1>{level.title}</h1>
            <p>{level.instruction}</p>
          </div>
          {phase !== "complete" && (
            <button
              className={styles.primaryButton}
              onClick={doPrimaryAction}
              disabled={level.scene === "challenge" && !choice}
            >
              <span className={styles.gazeDot} />
              {level.action}
            </button>
          )}
          {phase === "complete" && (
            <button className={styles.primaryButton} onClick={resetJourney}>
              Speel opnieuw
            </button>
          )}
        </section>

        <aside className={styles.pinRail} aria-label="Verzamelde pins">
          <div className={styles.pinRailHead}>
            <span>Mijn pins</span>
            <strong>{pins.length}/5</strong>
          </div>
          <div className={styles.pinSlots}>
            {levels.slice(0, 5).map((item, index) => {
              const unlocked = pins.includes(item.pin);
              const currentReward = phase === "reward" && levelIndex === index;
              return (
                <div
                  className={`${styles.pinSlot} ${unlocked ? styles.unlocked : ""} ${
                    currentReward ? styles.pending : ""
                  }`}
                  key={item.pin}
                >
                  <span>{unlocked ? item.pinMark : index + 1}</span>
                  <small>{unlocked ? item.pin : "Nog te halen"}</small>
                </div>
              );
            })}
          </div>
          <div className={styles.badgeSlot}>
            <span>EDU</span>
            <div>
              <small>EDUBADGE</small>
              <strong>{phase === "complete" ? "VERDIEND" : "VERGRENDELD"}</strong>
            </div>
          </div>
        </aside>

        <div className={styles.controls}>
          <span><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> bewegen</span>
          <span><i /> kijken</span>
          <span><kbd>●</kbd> kiezen</span>
        </div>
      </section>

      {phase === "reward" && (
        <div className={styles.overlay}>
          <div className={styles.rewardCard}>
            <span className={styles.rewardKicker}>MISSIE VOLTOOID</span>
            <div className={styles.bigPin}>{level.pinMark}</div>
            <h2>{level.pin}-pin</h2>
            <p>Goed gedaan, Ron. Geef de pin een plek op je verzamelbord.</p>
            <button className={styles.pinButton} onClick={collectPin}>
              Pin vastzetten
            </button>
          </div>
        </div>
      )}

      {videoOpen && (
        <div className={styles.overlay}>
          <div className={styles.videoPlayer}>
            <div className={styles.stageVideo}>
              <span>ALBEDA</span>
              <strong>THE NEXT</strong>
              <small>KICK-OFF FESTIVAL · AHOY</small>
              <div className={styles.stageLights} />
            </div>
            <div className={styles.videoControls}>
              <button
                onClick={() => {
                  setVideoOpen(false);
                  setPhase("reward");
                }}
              >
                Overslaan
              </button>
              <div><i style={{ width: `${videoProgress}%` }} /></div>
              <span>{Math.ceil((100 - videoProgress) / 12)} sec</span>
            </div>
          </div>
        </div>
      )}

      {confetti && (
        <div className={styles.confetti} aria-hidden="true">
          {confettiPieces.map((piece, index) => (
            <i
              key={index}
              style={{ left: piece.left, animationDelay: piece.delay, background: piece.color }}
            />
          ))}
        </div>
      )}
    </main>
  );
}

function Scene({
  level,
  choice,
  setChoice,
}: {
  level: Level;
  choice: string;
  setChoice: (choice: string) => void;
}) {
  if (level.scene === "festival") {
    return (
      <div className={styles.scene}>
        <div className={styles.ahoy}>
          <div className={styles.ahoyRoof}>AHOY</div>
          <div className={styles.videoScreen}>THE NEXT</div>
          <div className={styles.stageBase} />
        </div>
        <div className={styles.crowd}>
          {Array.from({ length: 14 }).map((_, index) => <i key={index} />)}
        </div>
        <Ron />
      </div>
    );
  }

  if (level.scene === "city") {
    return (
      <div className={styles.scene}>
        <div className={styles.cityMap}>
          <div className={styles.river} />
          <button className={`${styles.mapPoint} ${styles.bridgePoint}`}>Erasmusbrug</button>
          <button className={`${styles.mapPoint} ${styles.communityPoint}`}>Buurthuis</button>
          <button className={`${styles.mapPoint} ${styles.marketPoint}`}>Markthal</button>
        </div>
        <Ron />
      </div>
    );
  }

  if (level.scene === "challenge") {
    return (
      <div className={styles.scene}>
        <div className={styles.challengeChoices}>
          <button
            className={choice === "help" ? styles.choiceActive : ""}
            onClick={() => setChoice("help")}
          >
            <span className={styles.bagIcon}>▰</span>
            <strong>Help de buurvrouw</strong>
            <small>Steek je handen uit de mouwen</small>
          </button>
          <button
            className={choice === "money" ? styles.choiceActive : ""}
            onClick={() => setChoice("money")}
          >
            <span className={styles.moneyIcon}>€</span>
            <strong>Leer over geld</strong>
            <small>Maak slimme keuzes</small>
          </button>
        </div>
        <Ron />
      </div>
    );
  }

  if (level.scene === "finale") {
    return (
      <div className={styles.scene}>
        <div className={styles.classBoard}>
          <small>ONZE IMPACT</small>
          <strong>DIT HEBBEN<br />WIJ GEDAAN!</strong>
          <div className={styles.boardChart}><i /><i /><i /><i /></div>
        </div>
        <div className={styles.classmates}><i /><i /><i /></div>
        <Ron />
      </div>
    );
  }

  if (level.scene === "badge") {
    return (
      <div className={styles.scene}>
        <div className={styles.finalBadge}>
          <span>ALBEDA</span>
          <strong>IMPACT<br />MAKER</strong>
          <small>EDUBADGE · 2026</small>
        </div>
        <div className={styles.badgeRings}><i /><i /><i /></div>
        <Ron />
      </div>
    );
  }

  return (
    <div className={styles.scene}>
      <div className={styles.schoolHall}>
        <div className={styles.door}><span>A1.04</span></div>
        <div className={styles.noticeBoard}>WELKOM<br />BIJ ALBEDA</div>
        <div className={styles.lockers}>{Array.from({ length: 6 }).map((_, index) => <i key={index} />)}</div>
      </div>
      <div className={styles.student}>
        <div className={styles.personHead} />
        <div className={styles.personBody}>SAM</div>
        <span>Welkom bij de opleiding!</span>
      </div>
      <Ron />
    </div>
  );
}

function Ron() {
  return (
    <div className={styles.ron} aria-label="Ron">
      <div className={styles.ronHair} />
      <div className={styles.ronHead}><i /><i /><b /></div>
      <div className={styles.ronBody}>
        <span className={styles.ronLogo}>R</span>
        <i className={styles.ronArmLeft} />
        <i className={styles.ronArmRight} />
      </div>
      <div className={styles.ronLegs}><i /><i /></div>
      <span className={styles.ronName}>RON</span>
    </div>
  );
}
