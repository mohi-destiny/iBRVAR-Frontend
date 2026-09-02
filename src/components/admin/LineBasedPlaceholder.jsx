import { useTranslation } from "../../contexts/LanguageContext";

export function LineBasedPlaceholder({ title, cameras }) {
  const { t } = useTranslation();
  const cam = cameras[0];
  return (
    <div className="bg-zinc-950 text-zinc-100 p-4 rounded-lg border border-zinc-800">
      <h2 className="text-sm font-semibold mb-3">{title}</h2>
      <div className="relative bg-black rounded overflow-hidden aspect-video mb-3 flex items-center justify-center">
        <p className="text-zinc-600 text-xs">{cam ? t("calibration.lineBasedComingSoon") : t("calibration.noCameraShort")}</p>
      </div>
      <p className="text-[11px] text-zinc-600">{t("calibration.lineBasedHint")}</p>
    </div>
  );
}