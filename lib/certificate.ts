import type { Participant, Workshop } from "./types";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function certificateMarkup(workshop: Workshop, participant: Participant) {
  return `
    <section class="certificate-card">
      <div class="certificate-confetti confetti-one"></div>
      <div class="certificate-confetti confetti-two"></div>
      <div class="certificate-confetti confetti-three"></div>
      <div class="certificate-inner">
        <div class="certificate-kicker">GeeGee<span>AI</span> presenteert</div>
        <p class="certificate-label">Certificaat van deelname</p>
        <h2>${escapeHtml(workshop.title)}</h2>
        <p class="certificate-for">met trots uitgereikt aan</p>
        <h1>${escapeHtml(participant.nickname)}</h1>
        <p class="certificate-team">Groep/team: ${escapeHtml(participant.groupName)}</p>
        <div class="certificate-badges">
          <span>AI Explorer</span>
          <span>Prompt Starter</span>
          <span>Safe AI User</span>
        </div>
        <p class="certificate-meta">${escapeHtml(workshop.date)} · ${escapeHtml(workshop.location || workshop.clientName || "GeeGee AI Workshop")}</p>
      </div>
    </section>`;
}

export const certificateStyles = `
  .certificate-card{position:relative;overflow:hidden;background:linear-gradient(145deg,#fffaf0 0%,#ffffff 48%,#eef6ff 100%);border:10px solid #ffd166;border-radius:32px;padding:18px;color:#10213b;box-shadow:0 24px 70px rgba(7,19,38,.25);page-break-after:always}
  .certificate-inner{position:relative;z-index:2;min-height:500px;border:3px dashed #7c5cff;border-radius:22px;padding:48px 34px;text-align:center;display:flex;flex-direction:column;align-items:center;justify-content:center}
  .certificate-kicker{font-size:26px;font-weight:900;letter-spacing:-1px}.certificate-kicker span{color:#2776ff}
  .certificate-label{text-transform:uppercase;letter-spacing:4px;color:#7c5cff;font-weight:800;font-size:13px;margin:18px 0 10px}
  .certificate-card h2{font-size:28px;margin:0;color:#244164}.certificate-for{margin:28px 0 4px;color:#667892}
  .certificate-card h1{font-size:54px;line-height:1;margin:8px 0;color:#ef476f;letter-spacing:-2px}
  .certificate-team{font-size:18px;font-weight:700;margin:8px 0 24px}
  .certificate-badges{display:flex;flex-wrap:wrap;justify-content:center;gap:10px}.certificate-badges span{background:#e8f3ff;border:2px solid #79b7ff;border-radius:999px;padding:8px 13px;font-weight:700;font-size:13px}
  .certificate-meta{font-size:13px;color:#71809a;margin:28px 0 0}
  .certificate-confetti{position:absolute;border-radius:6px;transform:rotate(18deg)}.confetti-one{width:84px;height:24px;background:#06d6a0;left:-24px;top:54px}.confetti-two{width:70px;height:20px;background:#ef476f;right:-18px;top:120px;transform:rotate(-28deg)}.confetti-three{width:90px;height:22px;background:#7c5cff;left:36px;bottom:28px;transform:rotate(-12deg)}
`;

export function certificateEmailDocument(workshop: Workshop, participants: Participant[]) {
  const title = participants.length === 1
    ? `Certificaat voor ${participants[0].nickname}`
    : `${participants.length} certificaten van ${workshop.title}`;

  return `<!doctype html>
  <html lang="nl">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <title>${escapeHtml(title)}</title>
      <style>
        body{margin:0;padding:24px;background:#071326;font-family:Arial,sans-serif}
        .email-intro{max-width:820px;margin:0 auto 20px;color:#fff;text-align:center}.email-intro p{color:#b9c9df}
        .certificate-card{max-width:820px;margin:0 auto 24px}
        ${certificateStyles}
      </style>
    </head>
    <body>
      <div class="email-intro">
        <h1>${escapeHtml(title)}</h1>
        <p>Deze certificaten horen bij workshopcode ${escapeHtml(workshop.code)}. Ze kunnen vanuit de e-mail worden afgedrukt of als PDF worden bewaard.</p>
      </div>
      ${participants.map((participant) => certificateMarkup(workshop, participant)).join("")}
    </body>
  </html>`;
}
