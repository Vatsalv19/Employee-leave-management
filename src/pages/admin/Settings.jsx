import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { Settings as SettingsIcon, Save, Building2, Clock, Bell } from "lucide-react";

export default function Settings() {
  const { settings, updateSettings } = useApp();
  const [form, setForm] = useState({ ...settings });

  function handleSave(e) {
    e.preventDefault();
    updateSettings(form);
  }

  return (
    <div className="animate-fade-in space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-theme-primary">Settings</h2>
        <p className="mt-1 text-sm text-theme-secondary">Configure system-wide preferences</p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Company Info */}
        <div className="glass-card-static rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-theme-primary flex items-center gap-2 mb-4"><Building2 className="w-4 h-4 text-primary-400" /> Company Information</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-theme-muted mb-1.5 block">Company Name</label>
              <input value={form.companyName} onChange={(e) => setForm(p => ({ ...p, companyName: e.target.value }))} className="input-field" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-theme-muted mb-1.5 block">Timezone</label>
                <input value={form.timezone} onChange={(e) => setForm(p => ({ ...p, timezone: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="text-xs font-medium text-theme-muted mb-1.5 block">Currency</label>
                <input value={form.currency} onChange={(e) => setForm(p => ({ ...p, currency: e.target.value }))} className="input-field" />
              </div>
            </div>
          </div>
        </div>

        {/* Leave Config */}
        <div className="glass-card-static rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-theme-primary flex items-center gap-2 mb-4"><Clock className="w-4 h-4 text-primary-400" /> Leave Configuration</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-theme-muted mb-1.5 block">Leave Year</label>
              <select value={form.leaveYear} onChange={(e) => setForm(p => ({ ...p, leaveYear: e.target.value }))} className="input-field">
                <option>January - December</option>
                <option>April - March</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-theme-muted mb-1.5 block">Auto-approve leaves under (days)</label>
              <input type="number" value={form.autoApproveUnder} onChange={(e) => setForm(p => ({ ...p, autoApproveUnder: parseInt(e.target.value) || 0 }))} min={0} max={5} className="input-field" />
              <p className="text-xs text-theme-muted mt-1">Set to 0 to disable auto-approval</p>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="glass-card-static rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-theme-primary flex items-center gap-2 mb-4"><Bell className="w-4 h-4 text-primary-400" /> Notifications</h3>
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input type="checkbox" checked={form.emailNotifications} onChange={(e) => setForm(p => ({ ...p, emailNotifications: e.target.checked }))} className="sr-only peer" />
              <div className="w-9 h-5 rounded-full bg-slate-600 peer-checked:bg-primary-500 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
            </div>
            <span className="text-sm text-theme-secondary">Enable email notifications for leave status changes</span>
          </label>
        </div>

        <button type="submit" className="btn-primary inline-flex items-center gap-2"><Save className="w-4 h-4" /> Save Settings</button>
      </form>
    </div>
  );
}
