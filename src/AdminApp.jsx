import { useState, useEffect } from "react";
import { LoginScreen } from "./components/LoginScreen";
import { AdminView } from "./components/admin/AdminView";
import { RefereeView } from "./components/referee/RefereeView";
import { DisplayOnlyTemplate } from "./components/DisplayOnlyTemplate";
import { ThemeToggle } from "./components/ThemeToggle";
import { LanguageToggle } from "./components/LanguageToggle";
import { LanguageProvider } from "./contexts/LanguageContext";
import { SESSION_KEY, SESSION_LIFETIME_MS, CAMERA_SERVER } from "./constants";

function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed.expiresAt || Date.now() > parsed.expiresAt) { localStorage.removeItem(SESSION_KEY); return null; }
    return parsed.user;
  } catch {
    return null;
  }
}
function saveSession(user) {
  try { localStorage.setItem(SESSION_KEY, JSON.stringify({ user, expiresAt: Date.now() + SESSION_LIFETIME_MS })); } catch {}
}
function clearSession() {
  try { localStorage.removeItem(SESSION_KEY); } catch {}
}

function Routes() {
  const [user, setUser] = useState(() => loadSession());
  const [monitorCount, setMonitorCount] = useState(4); // cached at mount so login's auto-open stays synchronous (popup blockers require it)
  const isDisplayMode = new URLSearchParams(window.location.search).get("display") === "template";

  useEffect(() => {
    fetch(`${CAMERA_SERVER}/api/config`).then((r) => r.json()).then((c) => setMonitorCount(c.monitorCount || 4)).catch(() => {});
  }, []);

  const handleLogin = (loggedInUser) => {
    saveSession(loggedInUser);
    setUser(loggedInUser);
    if (loggedInUser.role === "referee" && loggedInUser.access?.template) {
      for (let n = 1; n <= monitorCount; n++) {
        window.open(`${window.location.origin}${window.location.pathname}?display=template&monitor=${n}`, `ibrvar_monitor_${n}`);
      }
    }
  };
  const handleLogout = () => { clearSession(); setUser(null); };

  if (isDisplayMode) return <DisplayOnlyTemplate />;
  if (!user) return (<><LoginScreen onLogin={handleLogin} /><ThemeToggle /><LanguageToggle /></>);
  if (user.role === "admin") return (<><AdminView user={user} onLogout={handleLogout} /><ThemeToggle /><LanguageToggle /></>);
  return (<><RefereeView user={user} onLogout={handleLogout} /><ThemeToggle /><LanguageToggle /></>);
}

// Top-level app: session persistence (1 day) + role-based routing. Login is
// checked against the backend (src/users.js). A single LanguageProvider
// wraps everything so theme/language state never resets when switching
// between login/admin/referee views.
export default function AdminApp() {
  return (
    <LanguageProvider>
      <Routes />
    </LanguageProvider>
  );
}