import { useEffect, useRef, useState } from "react";
import { SETTINGS, LOGO_BG_LABELS } from "../../domain/constants";
import { MainHero } from "../main/MainHero";

export function SettingsView() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoBg, setLogoBg] = useState<string>(SETTINGS.logoBgDefault);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const load = () =>
      fetch("/api/settings")
        .then((res) => res.json())
        .then((payload) => {
          const data = payload as { logoUrl?: string | null; logoBg?: string };
          setLogoUrl(data.logoUrl || null);
          setLogoBg(data.logoBg || SETTINGS.logoBgDefault);
        })
        .catch(() => {});

    load();
    window.addEventListener("logo-updated", load);
    return () => window.removeEventListener("logo-updated", load);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const formData = new FormData();
      if (file) formData.append("logo", file);
      formData.append("bg", logoBg);

      const res = await fetch("/api/settings", { method: "POST", body: formData });
      const data = (await res.json()) as {
        logoUrl?: string | null;
        logoBg?: string;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error);

      setLogoUrl(data.logoUrl ?? null);
      setLogoBg(data.logoBg || logoBg);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setMessage("✓ Configurações salvas.");
      window.dispatchEvent(new Event("logo-updated"));
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Falha ao salvar as configurações.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <MainHero
        title="Configurações"
        description="Personalize a identidade visual exibida no menu lateral e no PDF."
      />

      <div style={{ background: "white", borderRadius: 12, padding: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Logo</h3>

        {logoUrl ? (
          <div
            style={{
              display: "inline-block",
              backgroundColor: logoBg === "transparent" ? undefined : logoBg,
              padding: logoBg === "transparent" ? 0 : "8px 12px",
              borderRadius: 8,
              marginBottom: 16,
            }}
          >
            <img
              src={logoUrl}
              alt="Logo atual"
              style={{ maxHeight: 64, maxWidth: 240, display: "block" }}
            />
          </div>
        ) : (
          <p style={{ fontSize: 13, color: "#666", marginBottom: 16 }}>
            Nenhum logo definido.
          </p>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg"
          onChange={(e) => {
            setFile(e.target.files?.[0] || null);
            setMessage("");
          }}
        />
        <p style={{ fontSize: 12, color: "#666", marginTop: 6 }}>
          PNG ou JPEG, até {Math.round(SETTINGS.logoMaxBytes / (1024 * 1024))} MB.
        </p>

        <h4 style={{ fontSize: 14, fontWeight: 600, marginTop: 20, marginBottom: 8 }}>
          Cor de fundo do logo
        </h4>
        {SETTINGS.logoBgOptions.map((option) => (
          <label
            key={option}
            style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}
          >
            <input
              type="radio"
              name="logo-bg"
              checked={logoBg === option}
              onChange={() => setLogoBg(option)}
              style={{ width: 14, height: 14, margin: 0 }}
            />
            <span style={{ fontSize: 14 }}>{LOGO_BG_LABELS[option]}</span>
            {option !== "transparent" && (
              <span
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 4,
                  backgroundColor: option,
                  border: `1px solid #ccc`,
                }}
              />
            )}
          </label>
        ))}

        <button
          className="primary"
          onClick={handleSave}
          disabled={saving}
          style={{ marginTop: 16 }}
        >
          {saving ? "Salvando..." : file ? "Salvar logo" : "Salvar cor de fundo"}
        </button>

        {message && <p style={{ marginTop: 12, fontSize: 13 }}>{message}</p>}
      </div>
    </div>
  );
}
