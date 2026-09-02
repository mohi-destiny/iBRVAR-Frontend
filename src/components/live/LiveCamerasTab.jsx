import { useState, useEffect } from "react";
import { Camera, Plus, Layers, TriangleAlert, Info } from "lucide-react";
import { CameraCard } from "./CameraCard";
import { CpuLog } from "./CpuLog";
import { DelayModal } from "./DelayModal";
import { CAMERA_SERVER } from "../../constants";
import { useTranslation } from "../../contexts/LanguageContext";

export function LiveCamerasTab({
  cameras, urlInput, setUrlInput, nameInput, setNameInput, delaySeconds, setDelaySeconds,
  addStatus, addCamera, removeCamera, cpuLog, handleCpuLog, showInfo, setShowInfo,
  openDelayId, setOpenDelayId,
}) {
  const { t } = useTranslation();
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const iv = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(iv);
  }, []);

  const openCam = cameras.find((c) => c.id === openDelayId);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-cyan-400" />
          <h1 className="text-lg font-semibold">{t("liveCameras.title")}</h1>
        </div>
        <button onClick={() => setShowInfo((v) => !v)} className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300">
          <Info className="w-3.5 h-3.5" /> {t("liveCameras.howThisWorks")}
        </button>
      </div>

      {showInfo && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 mb-4 text-xs text-zinc-400 space-y-1.5">
          <p><span className="text-cyan-400 font-medium">{t("liveCameras.infoLive")}</span> — {t("liveCameras.infoLiveDesc")}</p>
          <p><span className="text-teal-400 font-medium">{t("liveCameras.infoRecording")}</span> — {t("liveCameras.infoRecordingDesc")}</p>
          <p><span className="text-violet-400 font-medium">{t("liveCameras.infoDelay")}</span> — {t("liveCameras.infoDelayDesc1")} {delaySeconds}{t("liveCameras.infoDelayDesc2")}</p>
          <p>{t("liveCameras.infoPaste")}</p>
        </div>
      )}

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 mb-4 flex flex-wrap gap-2 items-end">
        <div className="flex-1 min-w-[220px]">
          <label className="text-xs text-zinc-500 block mb-1">{t("liveCameras.cameraUrlLabel")}</label>
          <input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCamera()}
            placeholder="rtsp://camera-ip/stream  or  http://192.168.x.x:8080/video"
            className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-1.5 text-sm font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-cyan-400"
          />
        </div>
        <div className="w-40">
          <label className="text-xs text-zinc-500 block mb-1">{t("liveCameras.nameLabel")}</label>
          <input
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCamera()}
            placeholder={t("liveCameras.namePlaceholder")}
            className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-1.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-cyan-400"
          />
        </div>
        <div className="w-28">
          <label className="text-xs text-zinc-500 block mb-1">{t("liveCameras.delayLabel")}</label>
          <input
            type="number" min={1} max={60}
            value={delaySeconds}
            onChange={(e) => setDelaySeconds(Number(e.target.value) || 10)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-1.5 text-sm font-mono text-zinc-200 focus:outline-none focus:ring-1 focus:ring-cyan-400"
          />
        </div>
        <button onClick={addCamera} disabled={addStatus === "adding"} className="flex items-center gap-1 bg-cyan-500 text-zinc-950 text-sm font-medium px-3 py-1.5 rounded hover:bg-cyan-400 transition disabled:opacity-50">
          <Plus className="w-4 h-4" /> {addStatus === "adding" ? t("liveCameras.starting") : t("liveCameras.addCamera")}
        </button>
      </div>
      {addStatus === "error" && (
        <p className="text-xs text-red-400 mb-3">
          {t("liveCameras.couldntReach")} {CAMERA_SERVER} — {t("liveCameras.makeSureRunning")} <code className="font-mono">node server.js</code> {t("liveCameras.isRunning")}
        </p>
      )}

      <CpuLog entries={cpuLog} />

      <div className="flex items-center justify-between mt-5 mb-2">
        <p className="text-xs text-zinc-500 font-mono">{cameras.length} {t("liveCameras.camerasConnected")}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cameras.map((cam) => (
          <CameraCard key={cam.id} cam={cam} now={now} onRemove={removeCamera} onOpenDelay={setOpenDelayId} delaySeconds={delaySeconds} />
        ))}
      </div>

      {cameras.length === 0 && (
        <div className="text-center py-16 text-zinc-600 text-sm flex flex-col items-center gap-2">
          <Camera className="w-6 h-6" />
          <TriangleAlert className="w-4 h-4 hidden" />
          {t("liveCameras.noCamerasYet")}
        </div>
      )}

      {openCam && <DelayModal cam={openCam} delaySeconds={delaySeconds} onClose={() => setOpenDelayId(null)} onCpuLog={handleCpuLog} />}
    </div>
  );
}