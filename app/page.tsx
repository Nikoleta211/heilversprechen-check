"use client";

import { useRef, useState } from "react";

type Ampel = "gruen" | "gelb" | "rot";

type ContentIdee = {
  ansatz: string;
  hook: string;
  text: string;
};

type Result = {
  ampel: Ampel;
  begruendung: string;
  musterErklaerung: string;
  umformulierung: string;
  contentIdeen: ContentIdee[];
};

const AMPEL_LABEL: Record<Ampel, string> = {
  gruen: "Passt so",
  gelb: "Geht schärfer",
  rot: "Würde ich anpassen",
};

const AMPEL_EMOJI: Record<Ampel, string> = {
  gruen: "🟢",
  gelb: "🟡",
  rot: "🔴",
};

const ROT_WOERTER = [
  "heilt",
  "geheilt",
  "heilung",
  "krankheit",
  "krebs",
  "diabetes",
  "depression",
  "medikament",
  "ersetzt den arzt",
  "ersetzt medikamente",
];

const GELB_WOERTER = [
  "schmerzen weg",
  "abnehmen",
  "wirkt gegen",
  "lindert",
  "kg in",
  "gewicht verlieren",
  "heilversprechen",
  "studien belegen",
];

const BEISPIELE = [
  {
    situation: "Schlaf",
    lieber: "Statt: \"Seit ich das nehme, schlafe ich super.\"\nBesser: \"Meine Abendroutine fühlt sich seit einer Weile ganz anders an.\"",
  },
  {
    situation: "Energie",
    lieber: "Statt: \"Das gibt mir sofort mehr Energie.\"\nBesser: \"Ich merke seit ein paar Wochen, dass ich morgens leichter aus dem Bett komme.\"",
  },
  {
    situation: "Gewicht",
    lieber: "Statt: \"10 kg in 3 Wochen abgenommen.\"\nBesser: \"Ich fühl mich seit einer Weile einfach wohler in meinen Klamotten.\"",
  },
  {
    situation: "Wohlbefinden",
    lieber: "Statt: \"Das hat meine Depression geheilt.\"\nBesser: \"Ich hab seit einer Weile das Gefühl, stabiler durch schwierige Tage zu kommen.\"",
  },
];

function highlightContent(text: string) {
  if (!text) return null;

  const alle = [
    ...ROT_WOERTER.map((w) => ({ w, typ: "rot" as const })),
    ...GELB_WOERTER.map((w) => ({ w, typ: "gelb" as const })),
  ].sort((a, b) => b.w.length - a.w.length);

  const pattern = alle.map((o) => o.w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  const regex = new RegExp(`(${pattern})`, "gi");
  const parts = text.split(regex);

  return parts.map((part, i) => {
    const treffer = alle.find((o) => o.w.toLowerCase() === part.toLowerCase());
    if (treffer) {
      return (
        <mark
          key={i}
          style={{
            background: treffer.typ === "rot" ? "rgba(198,40,40,0.22)" : "rgba(184,134,11,0.22)",
            color: "inherit",
            borderRadius: 3,
            padding: "0 1px",
          }}
        >
          {part}
        </mark>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export default function Home() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [showWarum, setShowWarum] = useState(false);
  const [showBeispiele, setShowBeispiele] = useState(false);

  const overlayRef = useRef<HTMLDivElement>(null);

  const charCount = content.length;
  const maxChars = 4000;

  function handleScroll(e: React.UIEvent<HTMLTextAreaElement>) {
    if (overlayRef.current) overlayRef.current.scrollTop = e.currentTarget.scrollTop;
  }

  async function handleCheck() {
    if (!content.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setShowWarum(false);

    try {
      const res = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Da ist etwas schiefgelaufen.");
        return;
      }

      setResult(data);
    } catch {
      setError("Keine Verbindung möglich. Bitte versuch es erneut.");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setContent("");
    setResult(null);
    setError(null);
    setShowWarum(false);
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <header
        style={{
          width: "100%",
          borderBottom: "1px solid var(--border)",
          background: "var(--white)",
          padding: "1.25rem 1.5rem",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div style={{ width: "100%", maxWidth: 640 }}>
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.75rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--grey-mid)",
            }}
          >
            Network Secrets
          </span>
        </div>
      </header>

      <div style={{ width: "100%", maxWidth: 640, padding: "3rem 1.5rem 5rem" }}>
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 700,
            fontSize: "2.25rem",
            color: "var(--grey-dark)",
            marginBottom: "0.75rem",
            lineHeight: 1.25,
          }}
        >
          Der{" "}
          <span style={{ fontStyle: "italic", color: "var(--pink-light)" }}>
            Heilversprechen-Check
          </span>
        </h1>

        <p
          style={{
            fontSize: "1.0625rem",
            color: "var(--grey-dark)",
            marginBottom: "0.75rem",
            maxWidth: 560,
          }}
        >
          Gib deinen Content oder deine Idee rein. Du bekommst in Sekunden eine
          Einschätzung, ob er unbedenklich ist oder ob du ihn anpassen solltest
          und wie.
        </p>

        <p
          style={{
            fontSize: "0.9375rem",
            color: "var(--grey-mid)",
            marginBottom: "2rem",
            maxWidth: 560,
          }}
        >
          Fast jeder Networker rutscht am Anfang mal in ein Heilversprechen
          rein. Das ist kein Beinbruch, hier bekommst du einfach ein Gefühl
          dafür.
        </p>

        {!result && (
          <>
            <div style={{ position: "relative" }}>
              <div
                ref={overlayRef}
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: 0,
                  padding: "1.25rem",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "1rem",
                  lineHeight: 1.6,
                  color: "var(--grey-dark)",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  overflow: "hidden",
                  pointerEvents: "none",
                }}
              >
                {highlightContent(content)}
                {content.endsWith("\n") ? " " : ""}
              </div>

              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value.slice(0, maxChars))}
                onScroll={handleScroll}
                placeholder="z.B. Seit ich das Produkt nehme, sind meine Rückenschmerzen komplett weg..."
                rows={7}
                style={{
                  position: "relative",
                  width: "100%",
                  border: "1px solid #f0d0dd",
                  borderRadius: "var(--radius-lg)",
                  padding: "1.25rem",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "1rem",
                  lineHeight: 1.6,
                  color: "transparent",
                  caretColor: "var(--grey-dark)",
                  background: "transparent",
                  boxShadow: "0 4px 24px rgba(233,30,99,0.08)",
                  resize: "none",
                  outline: "none",
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "0.5rem",
              }}
            >
              <span style={{ fontSize: "0.8125rem", color: "var(--grey-mid)" }}>
                {charCount}/{maxChars}
              </span>
            </div>

            {error && (
              <p
                style={{
                  color: "var(--ampel-rot)",
                  fontSize: "0.9375rem",
                  marginTop: "1rem",
                }}
              >
                {error}
              </p>
            )}

            <button
              onClick={handleCheck}
              disabled={loading || !content.trim()}
              style={{
                marginTop: "1.5rem",
                background: loading || !content.trim() ? "#f0a8c0" : "var(--pink)",
                color: "white",
                border: "none",
                borderRadius: "var(--radius-full)",
                padding: "1rem 2.5rem",
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                fontSize: "1rem",
                letterSpacing: "0.03em",
                cursor: loading || !content.trim() ? "default" : "pointer",
                width: "100%",
                transition: "all 0.2s ease",
              }}
            >
              {loading ? "Wird geprüft..." : "Jetzt prüfen"}
            </button>

            <p
              style={{
                fontSize: "0.8125rem",
                color: "var(--grey-mid)",
                marginTop: "0.75rem",
                textAlign: "center",
              }}
            >
              Direkte Einschätzung · Keine Speicherung deines Textes
            </p>

            <div style={{ marginTop: "2.5rem" }}>
              <button
                onClick={() => setShowBeispiele((v) => !v)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--pink-muted)",
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 600,
                  fontSize: "0.9375rem",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                {showBeispiele ? "Beispiele ausblenden ▲" : "Ein paar Beispiele ansehen ▾"}
              </button>

              {showBeispiele && (
                <div
                  style={{
                    marginTop: "1rem",
                    background: "var(--bg-section)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-lg)",
                    padding: "1.5rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "1.25rem",
                  }}
                >
                  {BEISPIELE.map((b) => (
                    <div key={b.situation}>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          letterSpacing: "0.12em",
                          textTransform: "uppercase",
                          color: "var(--pink-muted)",
                          fontWeight: 600,
                        }}
                      >
                        {b.situation}
                      </span>
                      <p
                        style={{
                          fontSize: "0.9375rem",
                          color: "var(--grey-dark)",
                          margin: "0.4rem 0 0",
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {b.lieber}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {result && (
          <div>
            <div
              style={{
                background:
                  result.ampel === "gruen"
                    ? "var(--ampel-gruen-bg)"
                    : result.ampel === "gelb"
                    ? "var(--ampel-gelb-bg)"
                    : "var(--ampel-rot-bg)",
                border: `1px solid ${
                  result.ampel === "gruen"
                    ? "var(--ampel-gruen)"
                    : result.ampel === "gelb"
                    ? "var(--ampel-gelb)"
                    : "var(--ampel-rot)"
                }`,
                borderRadius: "var(--radius-lg)",
                padding: "1.5rem",
                marginBottom: "1.5rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "0.75rem",
                }}
              >
                <span style={{ fontSize: "1.25rem" }}>
                  {AMPEL_EMOJI[result.ampel]}
                </span>
                <span
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontWeight: 700,
                    fontSize: "1.25rem",
                    color:
                      result.ampel === "gruen"
                        ? "var(--ampel-gruen)"
                        : result.ampel === "gelb"
                        ? "var(--ampel-gelb)"
                        : "var(--ampel-rot)",
                  }}
                >
                  {AMPEL_LABEL[result.ampel]}
                </span>
              </div>
              <p style={{ fontSize: "1rem", color: "var(--grey-dark)", margin: 0 }}>
                {result.begruendung}
              </p>

              {result.musterErklaerung && (
                <div style={{ marginTop: "0.75rem" }}>
                  <button
                    onClick={() => setShowWarum((v) => !v)}
                    style={{
                      background: "transparent",
                      border: "none",
                      padding: 0,
                      color:
                        result.ampel === "gruen"
                          ? "var(--ampel-gruen)"
                          : result.ampel === "gelb"
                          ? "var(--ampel-gelb)"
                          : "var(--ampel-rot)",
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 600,
                      fontSize: "0.875rem",
                      cursor: "pointer",
                    }}
                  >
                    {showWarum ? "Warum ist das so? ▲" : "Warum ist das so? ▾"}
                  </button>
                  {showWarum && (
                    <p
                      style={{
                        fontSize: "0.9375rem",
                        color: "var(--grey-dark)",
                        marginTop: "0.6rem",
                        marginBottom: 0,
                      }}
                    >
                      {result.musterErklaerung}
                    </p>
                  )}
                </div>
              )}
            </div>

            {result.umformulierung && (
              <div
                style={{
                  background: "var(--white)",
                  border: "1px solid #f0d0dd",
                  borderRadius: "var(--radius-lg)",
                  padding: "1.5rem",
                  boxShadow: "0 4px 24px rgba(233,30,99,0.08)",
                  marginBottom: "1.5rem",
                }}
              >
                <span
                  style={{
                    fontSize: "0.75rem",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--pink)",
                    fontWeight: 600,
                  }}
                >
                  Content-Richtung
                </span>
                <p
                  style={{
                    fontSize: "1rem",
                    color: "var(--grey-dark)",
                    marginTop: "0.75rem",
                    marginBottom: 0,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {result.umformulierung}
                </p>
              </div>
            )}

            {result.contentIdeen && result.contentIdeen.length > 0 && (
              <div
                style={{
                  background: "var(--bg-section)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-lg)",
                  padding: "1.5rem",
                  marginBottom: "2rem",
                }}
              >
                <span
                  style={{
                    fontSize: "0.75rem",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--pink-muted)",
                    fontWeight: 600,
                  }}
                >
                  Oder ganz anders: über dich statt über das Produkt
                </span>

                <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {result.contentIdeen.map((idee, i) => (
                    <div key={i}>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          color: "var(--pink)",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {idee.ansatz}
                      </span>
                      <p
                        style={{
                          fontSize: "1rem",
                          color: "var(--grey-dark)",
                          margin: "0.25rem 0 0",
                          whiteSpace: "pre-wrap",
                          fontWeight: 600,
                        }}
                      >
                        {idee.hook}
                      </p>
                      <p
                        style={{
                          fontSize: "0.9375rem",
                          color: "var(--grey-dark)",
                          margin: "0.4rem 0 0",
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {idee.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={reset}
              style={{
                background: "transparent",
                color: "var(--pink)",
                border: "1px solid var(--pink)",
                borderRadius: "var(--radius-full)",
                padding: "1rem 2.5rem",
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                fontSize: "1rem",
                letterSpacing: "0.03em",
                cursor: "pointer",
                width: "100%",
              }}
            >
              Nächsten Content prüfen
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
