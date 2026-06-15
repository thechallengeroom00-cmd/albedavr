import type { AudienceMode } from "./types";

const unsafePatterns = [
  { category: "private_data", severity: "medium" as const, regex: /\b(06[-\s]?\d{8}|\+31[-\s]?6[-\s]?\d{8}|straat|postcode|adres|wachtwoord|password|bsn)\b/i },
  { category: "self_harm", severity: "high" as const, regex: /\b(zelfmoord|suicide|ik wil dood|mezelf pijn|snij mezelf)\b/i },
  { category: "violence", severity: "high" as const, regex: /\b(bom maken|iemand vermoorden|neersteken|wapen maken|school shooting)\b/i },
  { category: "sexual", severity: "high" as const, regex: /\b(seks|porno|naakt|nude|onlyfans)\b/i },
  { category: "hate", severity: "high" as const, regex: /\b(kankerjood|nazi|ras uitroeien)\b/i },
  { category: "bullying", severity: "medium" as const, regex: /\b(pesten|vernederen|maak .* belachelijk|haat .* klasgenoot)\b/i },
  { category: "jailbreak", severity: "medium" as const, regex: /\b(negeer alle regels|ignore previous instructions|jailbreak|doe alsof je geen regels hebt)\b/i }
];

export function moderateText(input: string, audienceMode: AudienceMode) {
  const trimmed = input.trim();
  if (!trimmed) {
    return { status: "blocked" as const, category: "empty", severity: "low" as const, reason: "Leeg bericht." };
  }

  const maxLength = audienceMode === "primary" ? 800 : 1500;
  if (trimmed.length > maxLength) {
    return {
      status: "blocked" as const,
      category: "too_long",
      severity: "low" as const,
      reason: `Je bericht is te lang. Maak je vraag korter dan ${maxLength} tekens.`
    };
  }

  for (const item of unsafePatterns) {
    if (item.regex.test(trimmed)) {
      return {
        status: "blocked" as const,
        category: item.category,
        severity: item.severity,
        reason: audienceMode === "primary"
          ? "Deze vraag past niet bij deze workshop. Probeer een andere vraag of vraag hulp aan de begeleider."
          : "Deze prompt is geblokkeerd omdat de inhoud niet past binnen de veiligheidsregels van deze workshop. Pas je vraag aan of vraag hulp aan de begeleider."
      };
    }
  }

  return { status: "allowed" as const };
}
