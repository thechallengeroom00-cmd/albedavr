# GeeGee AI Workshop Platform — V1 Starter

Dit is de eerste bouwbare basis voor het GeeGee AI Workshop Platform.

## Wat zit erin?

- GeeGee admin dashboard
- Workshop plannen met naam, locatie, datum, tijd en instellingen
- Publieke locatie- en momentkeuze voor deelnemers
- Demo workshop `DEMO123`
- Doelgroepmodus: basisschool / middelbare school
- Nickname + groep/team login
- 6 hoofdtopics
- Chatomgeving met oefen-AI of echte OpenAI-chat
- Veilige AI-afbeeldingen maken en downloaden
- Inputmoderatie en outputmoderatie
- Live dashboard met deelnemers en meldingen
- Module toggles voor afbeeldingen, internet, audio, bestanden en muziek
- Eindscherm voor deelnemers
- Centrale eindscherm-push vanuit backend
- Printbaar certificaat op nickname

## Snel starten

```bash
npm install
npm run dev
```

Open daarna:

```text
http://localhost:3000
```

Admin:

```text
http://localhost:3000/admin
```

Demo deelnemer:

```text
http://localhost:3000/workshop/DEMO123
```

Demo live dashboard:

```text
http://localhost:3000/admin/workshops/DEMO123
```

## Belangrijk

Deze starter gebruikt tijdelijk een in-memory store. Dat betekent dat data verdwijnt wanneer de dev-server herstart.

Voor productie moet dit vervangen worden door:

- PostgreSQL database
- veilige bestandsopslag
- echte admin-authenticatie
- OpenAI/Claude API-koppeling
- logging/audit trail
- privacy- en bewaartermijnlogica

## OpenAI instellen

Maak een `.env.local` met:

```text
OPENAI_API_KEY=sk-...
OPENAI_TEXT_MODEL=gpt-5.5
OPENAI_IMAGE_MODEL=gpt-image-2
```

Start de applicatie daarna opnieuw. Kies bij de workshopinstellingen `OpenAI` als provider en zet de module `Afbeeldingen genereren` aan. Zonder sleutel blijft `Mock AI` beschikbaar om de workshopflow kosteloos te testen.

Chat gebruikt de OpenAI Responses API. Afbeeldingen worden in deze prototypeversie als tijdelijk resultaat in het geheugen bewaard en verdwijnen bij een herstart.

## Certificaten mailen

Deelnemers kunnen hun certificaat mailen naar een ouder/verzorger of school. Vanuit het live dashboard kunnen alle certificaten van een workshop in één e-mail worden verstuurd.

Maak een `.env.local` met:

```text
RESEND_API_KEY=re_...
EMAIL_FROM=GeeGee AI <certificaten@jouwdomein.nl>
```

Het afzenderdomein moet in Resend zijn geverifieerd. E-mailadressen van ontvangers worden niet opgeslagen in de workshopdata.

## Veiligheid

De moderatie staat in `lib/moderation.ts`. Dit is een eerste prototype met simpele regexregels. Voor productie moet dit worden uitgebreid met:

- OpenAI moderation of vergelijkbare safety classifier
- PII-detectie
- leeftijdsmodus per workshop
- escalatieregels
- human-in-the-loop dashboard
- audit logging

## Volgende bouwstappen

1. In-memory store vervangen door PostgreSQL.
2. Admin-login toevoegen.
3. Claude als tweede AI-provider koppelen.
4. Gegenereerde media in veilige objectopslag bewaren.
5. Muziek/audio provider koppelen.
6. Veilige webzoekmodus toevoegen.
7. Certificaat als echte PDF genereren.
8. Export per workshop maken.
