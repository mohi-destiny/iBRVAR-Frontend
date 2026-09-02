import { useState } from "react";
import {
  LogOut, Settings, Video, PlaySquare, Users, MapPin, Clock,
  Crosshair, Ruler, Monitor, ChevronDown, ChevronRight, ShieldCheck,
  PanelLeftClose, PanelLeftOpen,
} from "lucide-react";
import { useCameras } from "../../hooks/useCameras";
import { useSharedConfig } from "../../hooks/useSharedConfig";
import { useTranslation } from "../../contexts/LanguageContext";
import { LiveCamerasTab } from "../live/LiveCamerasTab";
import { UserManagementScreen } from "./UserManagementScreen";
import { VariousSettingsScreen } from "./VariousSettingsScreen";
import { FrameCalibrationScreen } from "./FrameCalibrationScreen";
import { LineBasedPlaceholder } from "./LineBasedPlaceholder";
import { MonitorAssignmentScreen } from "./MonitorAssignmentScreen";
import { RaceRecordingScreen } from "../RaceRecordingScreen";
import { PlaybackScreen } from "../PlaybackScreen";

function getSettingsSubmenu(t) {
  return [
    { key: "users", label: t("nav.userManagement"), icon: Users },
    { key: "various", label: t("nav.variousSettings"), icon: Settings },
    { key: "pit", label: t("nav.pitPosition"), icon: MapPin },
    { key: "t60", label: t("nav.standbyT60"), icon: Clock },
    { key: "t12", label: t("nav.t12Position"), icon: Crosshair },
    { key: "eventline", label: t("nav.eventLineCross"), icon: Ruler },
    { key: "linemarker", label: t("nav.lineMarker"), icon: Ruler },
    { key: "monitor", label: t("nav.monitorConfig"), icon: Monitor },
  ];
}

// Admin — full sidebar per the PDF's 4 top-level modules (ログイン handled
// by AdminApp itself, 設定/録画/再生 below).
export function AdminView({ user, onLogout }) {
  const { t } = useTranslation();
  const camState = useCameras();
  const { config, updateConfig } = useSharedConfig();
  const [section, setSection] = useState("live");
  const [settingsOpen, setSettingsOpen] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const settingsSubmenu = getSettingsSubmenu(t);

  const renderMain = () => {
    switch (section) {
      case "live": return <LiveCamerasTab {...camState} delaySeconds={config.delaySeconds} setDelaySeconds={(v) => updateConfig({ delaySeconds: v })} cpuLog={[]} handleCpuLog={() => {}} showInfo={false} setShowInfo={() => {}} openDelayId={null} setOpenDelayId={() => {}} />;
      case "users": return <UserManagementScreen />;
      case "various": return <VariousSettingsScreen config={config} updateConfig={updateConfig} />;
      case "pit": return <FrameCalibrationScreen title={t("nav.pitPosition")} cameras={camState.cameras} />;
      case "t60": return <FrameCalibrationScreen title={t("nav.standbyT60")} cameras={camState.cameras} />;
      case "t12": return <FrameCalibrationScreen title={t("nav.t12Position")} cameras={camState.cameras} />;
      case "eventline": return <LineBasedPlaceholder title={t("nav.eventLineCross")} cameras={camState.cameras} />;
      case "linemarker": return <LineBasedPlaceholder title={t("nav.lineMarker")} cameras={camState.cameras} />;
      case "monitor": return <MonitorAssignmentScreen config={config} updateConfig={updateConfig} cameras={camState.cameras} />;
      case "recording": return <RaceRecordingScreen cameras={camState.cameras} maxRaces={config.maxRaces} venue={config.venue} delaySeconds={config.delaySeconds} />;
      case "playback": return <PlaybackScreen liveCam={camState.cameras[0]} delaySeconds={config.delaySeconds} />;
      default: return null;
    }
  };

  const NavItem = ({ k, label, Icon, indent }) => (
    <button
      onClick={() => setSection(k)}
      title={collapsed ? label : undefined}
      className={`w-full flex items-center gap-2 text-xs px-3 py-2 rounded transition text-left ${section === k ? "bg-cyan-500 text-zinc-950 font-medium" : "text-zinc-400 hover:bg-zinc-800"} ${indent && !collapsed ? "ml-4" : ""} ${collapsed ? "justify-center" : ""}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" /> {!collapsed && <span className="truncate">{label}</span>}
    </button>
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex">
      <aside className={`border-r border-zinc-800 p-3 flex flex-col gap-1 shrink-0 transition-all duration-200 ${collapsed ? "w-14" : "w-64"}`}>
        <div className={`flex items-center gap-2 px-2 py-2 mb-2 ${collapsed ? "justify-center" : "justify-between"}`}>
          {!collapsed && (
            <div className="flex items-center gap-2 min-w-0">
              <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="text-sm font-semibold truncate">iBRVAR Admin</span>
            </div>
          )}
          <button onClick={() => setCollapsed((v) => !v)} className="text-zinc-500 hover:text-zinc-200 shrink-0" title={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
            {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>
        <NavItem k="live" label={t("nav.liveCameras")} Icon={Video} />
        <button onClick={() => setSettingsOpen((v) => !v)} className={`w-full flex items-center gap-2 text-xs px-3 py-2 rounded text-zinc-300 hover:bg-zinc-800 ${collapsed ? "justify-center" : ""}`} title={collapsed ? t("nav.settings") : undefined}>
          {!collapsed && (settingsOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />)}
          <Settings className="w-3.5 h-3.5" /> {!collapsed && t("nav.settings")}
        </button>
        {settingsOpen && settingsSubmenu.map(({ key, label, icon }) => <NavItem key={key} k={key} label={label} Icon={icon} indent />)}
        <NavItem k="recording" label={t("nav.recording")} Icon={Video} />
        <NavItem k="playback" label={t("nav.playback")} Icon={PlaySquare} />
        <div className="flex-1" />
        {!collapsed && <div className="text-[11px] text-zinc-600 px-2 mb-1 truncate">{user.label}</div>}
        <button onClick={onLogout} className={`w-full flex items-center gap-2 text-xs px-3 py-2 rounded text-zinc-400 hover:bg-zinc-800 ${collapsed ? "justify-center" : ""}`} title={collapsed ? t("common.logout") : undefined}>
          <LogOut className="w-3.5 h-3.5" /> {!collapsed && t("common.logout")}
        </button>
      </aside>
      <main className="flex-1 p-4 overflow-auto">{renderMain()}</main>
    </div>
  );
}