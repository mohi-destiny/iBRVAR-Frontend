import { useState } from "react";
import { useTranslation } from "../../contexts/LanguageContext";

// 各種設定 — Various Settings, matching the PDF's field list exactly.
export function VariousSettingsScreen({ config, updateConfig }) {
  const { t } = useTranslation();
  const [local, setLocal] = useState({
    venue: config.venue, liveDelay: config.delaySeconds, maxRaces: config.maxRaces, repeatSeconds: 7,
    fleetTrackingSize: "1/2", lineMarkerCamera: "R,L,P", superimpose: "XXX",
    displayLatency: config.displayLatencySeconds ?? 5,
  });
  const [saved, setSaved] = useState(false);
  const set = (k, v) => { setLocal((s) => ({ ...s, [k]: v })); setSaved(false); };

  const save = () => {
    updateConfig({
      delaySeconds: Number(local.liveDelay) || 10,
      maxRaces: Number(local.maxRaces) || 12,
      venue: local.venue,
      displayLatencySeconds: Number(local.displayLatency) || 0,
    });
    setSaved(true);
  };

  const fields = [
    ["venue", t("variousSettings.venue"), "text"],
    ["maxRaces", t("variousSettings.maxRaces"), "number"],
    ["liveDelay", t("variousSettings.liveDelay"), "number"],
    ["repeatSeconds", t("variousSettings.repeatSeconds"), "number"],
    ["displayLatency", t("variousSettings.displayLatency"), "number"],
    ["fleetTrackingSize", t("variousSettings.fleetTrackingSize"), "text"],
    ["lineMarkerCamera", t("variousSettings.lineMarkerCamera"), "text"],
    ["superimpose", t("variousSettings.superimpose"), "text"],
  ];

  return (
    <div className="bg-zinc-950 text-zinc-100 p-4 rounded-lg border border-zinc-800 max-w-md">
      <h2 className="text-sm font-semibold mb-4">{t("variousSettings.title")}</h2>
      {fields.map(([key, label, type]) => (
        <div key={key} className="mb-3">
          <label className="text-xs text-zinc-500 block mb-1">{label}</label>
          <input type={type} value={local[key]} onChange={(e) => set(key, e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-sm font-mono" />
        </div>
      ))}
      <button onClick={save} className="mt-2 bg-cyan-500 text-zinc-950 text-xs font-medium px-4 py-2 rounded">{t("variousSettings.confirm")}</button>
      {saved && <p className="text-[11px] text-teal-400 mt-2">{t("variousSettings.saved")}</p>}
    </div>
  );
}