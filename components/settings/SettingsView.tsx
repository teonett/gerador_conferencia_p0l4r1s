import { useEffect, useRef, useState } from "react";
import { SETTINGS, LOGO_BG_LABELS } from "../../domain/constants";
import { MainHero } from "../main/MainHero";
import { BTN_PRIMARY, CARD, INPUT } from "../ui/classes";

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

      <div className={`${CARD} p-6`}>
        <h3 className="text-base font-semibold mb-4">Logo</h3>

        {logoUrl ? (
          <div
            className={`inline-block rounded-lg mb-4 ${
              logoBg === "transparent" ? "" : "px-3 py-2"
            }`}
            style={logoBg === "transparent" ? undefined : { backgroundColor: logoBg }}
          >
            <img
              src={logoUrl}
              alt="Logo atual"
              className="max-h-16 max-w-60 block"
            />
          </div>
        ) : (
          <p className="text-[13px] text-gray-600 mb-4">
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
          className={INPUT}
        />
        <p className="text-xs text-gray-600 mt-1.5">
          PNG ou JPEG, até {Math.round(SETTINGS.logoMaxBytes / (1024 * 1024))} MB.
        </p>

        <h4 className="text-sm font-semibold mt-5 mb-2">
          Cor de fundo do logo
        </h4>
        {SETTINGS.logoBgOptions.map((option) => (
          <label key={option} className="flex items-center gap-2 mb-1.5">
            <input
              type="radio"
              name="logo-bg"
              checked={logoBg === option}
              onChange={() => setLogoBg(option)}
              className="w-3.5 h-3.5 m-0"
            />
            <span className="text-sm">{LOGO_BG_LABELS[option]}</span>
            {option !== "transparent" && (
              <span
                className="w-4 h-4 rounded border border-gray-300 inline-block"
                style={{ backgroundColor: option }}
              />
            )}
          </label>
        ))}

        <button className={`${BTN_PRIMARY} mt-4`} onClick={handleSave} disabled={saving}>
          {saving ? "Salvando..." : file ? "Salvar logo" : "Salvar cor de fundo"}
        </button>

        {message && <p className="mt-3 text-[13px]">{message}</p>}
      </div>
    </div>
  );
}
