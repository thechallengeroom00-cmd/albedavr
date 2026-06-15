import { getWorkshop, store } from "@/lib/store";
import { certificateMarkup, certificateStyles } from "@/lib/certificate";

export async function GET(_: Request, { params }: { params: Promise<{ code: string; participantId: string }> }) {
  const { code, participantId } = await params;
  const workshop = getWorkshop(code);
  const participant = store.participants.find((p) => p.id === participantId && p.workshopCode.toUpperCase() === code.toUpperCase());

  if (!workshop || !participant) {
    return new Response("Niet gevonden", { status: 404 });
  }

  const html = `<!doctype html>
<html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Certificaat</title>
<style>
body{font-family:Arial,sans-serif;background:radial-gradient(circle at top,#244d89,#071326 55%);margin:0;padding:36px;color:#071326}.wrap{max-width:940px;margin:auto}.btn{display:inline-block;margin:24px auto 0;padding:13px 19px;background:#2776ff;color:#fff;border-radius:13px;text-decoration:none;font-weight:800}.actions{text-align:center}${certificateStyles}@media print{body{background:#fff;padding:0}.actions{display:none}.certificate-card{box-shadow:none;border-width:6px}}
</style></head><body><div class="wrap">${certificateMarkup(workshop, participant)}<div class="actions"><a class="btn" href="javascript:window.print()">Print of bewaar als PDF</a></div></div></body></html>`;

  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
