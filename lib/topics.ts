import type { AudienceMode, TopicId } from "./types";

export const topicLabels: Record<TopicId, { title: string; description: string; emoji: string }> = {
  "ai-gaming": {
    title: "AI en gaming",
    description: "Ontdek AI in games of bedenk een eigen klein spel dat je binnen de workshop kunt maken.",
    emoji: "🎮"
  },
  stories: {
    title: "Verhalen maken",
    description: "Maak samen met AI verhalen, personages en spannende scènes.",
    emoji: "📚"
  },
  learning: {
    title: "Leren met AI",
    description: "Gebruik AI als leermaatje voor uitleg, quizvragen en samenvattingen.",
    emoji: "🧠"
  },
  prompting: {
    title: "Prompten",
    description: "Leer betere vragen stellen en verbeter je prompts stap voor stap.",
    emoji: "💬"
  },
  "media-literacy": {
    title: "Mediawijsheid",
    description: "Leer omgaan met AI, nepnieuws, privacy en online veiligheid.",
    emoji: "🛡️"
  },
  "images-music": {
    title: "Afbeeldingen en muziek",
    description: "Maak veilige beeldprompts, songteksten, beats en muziekideeën.",
    emoji: "🎨"
  }
};

export const topicIdeas: Record<TopicId, string[]> = {
  "ai-gaming": [
    "Bedenk een grappige gamewereld",
    "Maak een held en een tegenstander",
    "Verzin één simpele spelregel",
    "Ontwerp een eigen gamekarakter"
  ],
  stories: [
    "Schrijf een grappig feestgedicht",
    "Bedenk een held met een geheim",
    "Maak een verhaal met drie scènes"
  ],
  learning: [
    "Leg een moeilijk onderwerp simpel uit",
    "Maak vijf quizvragen",
    "Help mij een samenvatting maken"
  ],
  prompting: [
    "Maak mijn vraag duidelijker",
    "Geef drie versies van mijn prompt",
    "Wat ontbreekt nog in mijn prompt?"
  ],
  "media-literacy": [
    "Hoe herken ik een nepbericht?",
    "Welke gegevens houd ik privé?",
    "Kan AI fouten maken?"
  ],
  "images-music": [
    "Bedenk een kleurrijke beeldprompt",
    "Maak een refrein over mijn onderwerp",
    "Verzin een beat en sfeer"
  ]
};

export const secondaryTopicIdeas: Record<TopicId, string[]> = {
  "ai-gaming": [
    "Ontwerp een originele gameplay-loop",
    "Werk een gameconcept met risico en beloning uit",
    "Ontwikkel een karakter met een gameplay-functie",
    "Bedenk hoe AI een NPC geloofwaardig laat reageren"
  ],
  stories: [
    "Schrijf een verhaal met een onverwacht perspectief",
    "Ontwikkel een personage met een moreel dilemma",
    "Experimenteer met spanning en verteltempo"
  ],
  learning: [
    "Vergelijk twee verklaringen van hetzelfde onderwerp",
    "Maak een oefentoets met feedbackmodel",
    "Onderzoek waar deze uitleg te simpel wordt"
  ],
  prompting: [
    "Optimaliseer mijn prompt voor controle en creativiteit",
    "Maak aannames en beperkingen expliciet",
    "Vergelijk drie promptstrategieën"
  ],
  "media-literacy": [
    "Analyseer de betrouwbaarheid van een AI-antwoord",
    "Onderzoek framing en mogelijke bias",
    "Maak een verificatieplan voor online informatie"
  ],
  "images-music": [
    "Ontwikkel een samenhangende visuele art direction",
    "Maak een muziekconcept met structuur en dynamiek",
    "Vertaal een sfeer naar concrete creatieve keuzes"
  ]
};

const primaryTone =
  "Je praat met een leerling uit groep 6 t/m 8. Gebruik korte zinnen, eenvoudige woorden, positieve begeleiding en veilige voorbeelden.";
const secondaryTone =
  "Je praat met een middelbare scholier. Je mag iets uitgebreider uitleggen, maar blijft duidelijk, veilig en respectvol.";

export function getSystemPrompt(topic: TopicId, audienceMode: AudienceMode) {
  const tone = audienceMode === "primary" ? primaryTone : secondaryTone;
  const commonSafety =
    "Vraag nooit om privégegevens. Geef geen volwassen, schadelijke, gevaarlijke, discriminerende of expliciete inhoud. Help de deelnemer leren, maken en reflecteren.";

  const topicInstruction: Record<TopicId, string> = {
    "ai-gaming":
      "Help de deelnemer ontdekken hoe AI in games werkt en een eigen klein spel ontwerpen. Houd een workshopspel haalbaar binnen twee uur: één scherm, één kernmechaniek, simpele toetsen of muisklikken, maximaal drie soorten objecten en geen accounts, online multiplayer, 3D-wereld of ingewikkelde inventaris. Werk in korte stappen: idee, doel, spelregel, besturing, uiterlijk en testen.",
    stories:
      "Help de deelnemer een creatief verhaal te maken. Stel korte vragen, geef voorbeelden en help structuur maken met begin, midden en einde.",
    learning:
      "Help de deelnemer leren met AI. Leg onderwerpen simpel uit, maak quizvragen, geef samenvattingen en moedig zelfstandig nadenken aan.",
    prompting:
      "Help de deelnemer beter prompten. Verbeter vragen, leg uit wat context, doel en stijl doen, en laat de deelnemer oefenen.",
    "media-literacy":
      "Help de deelnemer bewust omgaan met AI, bronnen, nepnieuws, privacy, online gedrag en de vraag of AI kan liegen of fouten kan maken.",
    "images-music":
      "Help de deelnemer veilige prompts maken voor afbeeldingen, muziekideeën, songteksten, beatsuggesties en korte audio-concepten. Geen nabootsing van bestaande artiesten."
  };

  return `${tone}\n${topicInstruction[topic]}\n${commonSafety}`;
}
