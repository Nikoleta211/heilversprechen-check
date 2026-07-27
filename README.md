# Der Heilversprechen-Check

Tool für Network Secrets. Networker geben ihren Content oder ihre Idee ein und bekommen sofort eine Ampel-Einschätzung (grün/gelb/rot), eine Begründung und bei Bedarf eine konkrete Umformulierung.

## Deployment auf Vercel

1. Dieses Projekt als neues Repo auf GitHub hochladen (oder Ordner direkt in Vercel importieren).
2. In Vercel: "New Project" → Repo auswählen → Deploy.
3. Unter Project Settings → Environment Variables:
   - `ANTHROPIC_API_KEY` = dein Anthropic API Key (aus der Anthropic Console)
4. Redeploy nach dem Setzen der Env Variable.

## Lokal testen

```
npm install
cp .env.example .env.local
# .env.local mit echtem API Key befüllen
npm run dev
```

Läuft dann auf http://localhost:3000

## Wie es funktioniert

- `app/page.tsx`: Frontend, Formular mit Textfeld
- `app/api/check/route.ts`: Server-Route, schickt den Content an Claude (claude-sonnet-4-6) mit einem Prompt, der auf HWG-relevante Heilversprechen prüft
- Antwort kommt als JSON zurück: Ampel, Begründung, Umformulierung

## Anpassen

Der Prüf-Prompt liegt in `app/api/check/route.ts` in der Konstante `SYSTEM_PROMPT`. Dort kannst du die Kriterien erweitern, z.B. um weitere Produktkategorien oder eigene Beispiele aus deiner Community.
