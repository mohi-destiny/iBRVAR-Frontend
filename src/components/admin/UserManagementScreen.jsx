import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, KeyRound } from "lucide-react";
import { CAMERA_SERVER } from "../../constants";
import { useTranslation } from "../../contexts/LanguageContext";

function getAccessFields(t) {
  return [
    ["recording", t("userManagement.accessRecording")],
    ["template", t("userManagement.accessTemplate")],
    ["playback", t("userManagement.accessPlayback")],
    ["liveCameras", t("userManagement.accessLiveCameras")],
  ];
}

// ユーザ管理 — real referee account management: admin adds/removes referee
// logins here, and toggles exactly which pages each one can reach. This
// replaces the earlier cosmetic-only version — it's now backed by the
// server, and login itself checks against what's stored here.
export function UserManagementScreen() {
  const { t } = useTranslation();
  const ACCESS_FIELDS = getAccessFields(t);
  const [users, setUsers] = useState([]);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [error, setError] = useState(null);
  const [passwordEdits, setPasswordEdits] = useState({}); // username -> in-progress new password

  const load = useCallback(() => {
    fetch(`${CAMERA_SERVER}/api/users`).then((r) => r.json()).then((d) => setUsers(d.users || [])).catch(() => {});
  }, []);
  useEffect(() => { load(); }, [load]);

  const addUser = async () => {
    if (!newUsername.trim() || !newPassword.trim()) { setError(t("userManagement.requiredFields")); return; }
    setError(null);
    const res = await fetch(`${CAMERA_SERVER}/api/users`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: newUsername.trim(), password: newPassword.trim(), label: newLabel.trim() || newUsername.trim() }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || t("userManagement.addFailed")); return; }
    setNewUsername(""); setNewPassword(""); setNewLabel("");
    load();
  };

  const toggleAccess = async (username, field, value) => {
    setUsers((prev) => prev.map((u) => (u.username === username ? { ...u, access: { ...u.access, [field]: value } } : u)));
    await fetch(`${CAMERA_SERVER}/api/users/${username}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ access: { [field]: value } }),
    });
  };

  const removeUser = async (username) => {
    await fetch(`${CAMERA_SERVER}/api/users/${username}`, { method: "DELETE" });
    load();
  };

  const savePassword = async (username) => {
    const newPw = (passwordEdits[username] || "").trim();
    if (!newPw) return;
    await fetch(`${CAMERA_SERVER}/api/users/${username}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: newPw }),
    });
    setPasswordEdits((prev) => ({ ...prev, [username]: "" }));
  };

  return (
    <div className="bg-zinc-950 text-zinc-100 p-4 rounded-lg border border-zinc-800 max-w-2xl">
      <h2 className="text-sm font-semibold mb-1">{t("userManagement.title")}</h2>
      <p className="text-[11px] text-zinc-500 mb-4">{t("userManagement.subtitle")}</p>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 mb-4">
        <p className="text-xs text-zinc-400 mb-2 font-medium">{t("userManagement.addReferee")}</p>
        <div className="flex flex-wrap gap-2 items-end">
          <div>
            <label className="text-[11px] text-zinc-500 block">{t("userManagement.username")}</label>
            <input value={newUsername} onChange={(e) => setNewUsername(e.target.value)} className="bg-zinc-950 border border-zinc-800 rounded px-2 py-1.5 text-xs w-32" />
          </div>
          <div>
            <label className="text-[11px] text-zinc-500 block">{t("userManagement.password")}</label>
            <input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="bg-zinc-950 border border-zinc-800 rounded px-2 py-1.5 text-xs w-32" />
          </div>
          <div>
            <label className="text-[11px] text-zinc-500 block">{t("userManagement.displayLabel")}</label>
            <input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder={t("userManagement.displayLabelPlaceholder")} className="bg-zinc-950 border border-zinc-800 rounded px-2 py-1.5 text-xs w-40" />
          </div>
          <button onClick={addUser} className="flex items-center gap-1 bg-cyan-500 text-zinc-950 text-xs font-medium px-3 py-1.5 rounded"><Plus className="w-3.5 h-3.5" /> {t("userManagement.add")}</button>
        </div>
        {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-zinc-400 border-b border-zinc-800">
            <th className="py-2 font-medium">{t("userManagement.referee")}</th>
            {ACCESS_FIELDS.map(([, label]) => <th key={label} className="py-2 font-medium text-center">{label}</th>)}
            <th className="py-2 font-medium">{t("userManagement.password")}</th>
            <th className="py-2"></th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.username} className="border-b border-zinc-800/60">
              <td className="py-2 text-zinc-300">{u.label} <span className="text-zinc-600 text-[11px]">({u.username})</span></td>
              {ACCESS_FIELDS.map(([field]) => (
                <td key={field} className="py-2 text-center">
                  <button
                    onClick={() => toggleAccess(u.username, field, !u.access?.[field])}
                    className={`w-6 h-6 rounded-full text-xs font-bold ${u.access?.[field] ? "bg-cyan-500 text-zinc-950" : "bg-zinc-800 text-zinc-600"}`}
                  >
                    {u.access?.[field] ? "○" : "×"}
                  </button>
                </td>
              ))}
              <td className="py-2">
                <div className="flex items-center gap-1">
                  <input
                    type="text" placeholder={t("userManagement.newPasswordPlaceholder")}
                    value={passwordEdits[u.username] || ""}
                    onChange={(e) => setPasswordEdits((prev) => ({ ...prev, [u.username]: e.target.value }))}
                    className="bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-xs w-28"
                  />
                  <button onClick={() => savePassword(u.username)} className="text-zinc-500 hover:text-cyan-400" title={t("userManagement.savePassword")}><KeyRound className="w-3.5 h-3.5" /></button>
                </div>
              </td>
              <td className="py-2 text-right">
                <button onClick={() => removeUser(u.username)} className="text-zinc-600 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr><td colSpan={ACCESS_FIELDS.length + 3} className="py-4 text-center text-zinc-600 text-xs">{t("userManagement.noReferees")}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}