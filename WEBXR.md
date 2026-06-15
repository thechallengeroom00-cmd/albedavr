# Ron VR WebXR

De publiceerbare WebXR-pagina staat in:

`public/ron-vr-webxr.html`

Na het starten van de Next.js-app is de pagina bereikbaar via:

`http://localhost:3006/ron-vr-webxr.html`

Voor een Meta Quest of andere VR-bril moet dezelfde pagina via HTTPS worden
gepubliceerd, bijvoorbeeld op Vercel of Netlify:

`https://jouw-domein.nl/ron-vr-webxr.html`

## Bediening

- Kies **Start VR** in de browser van de headset.
- Kijk rond door je hoofd te bewegen.
- Gebruik de trigger van een controller of een knijpgebaar met handtracking om
  de huidige opdracht uit te voeren.
- De vijf pins en de Edubadge worden in de VR-HUD bijgehouden.

## Vereisten

- HTTPS, of `localhost` tijdens lokale ontwikkeling.
- Een browser met WebXR `immersive-vr` ondersteuning.
- Handtracking is optioneel; controllers blijven als fallback werken.

De oorspronkelijke `Ron VR.html` blijft beschikbaar als desktop- en
`file://`-preview.
