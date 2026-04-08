import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { Plus, Edit3, Trash2, X, CalendarDays, Star } from "lucide-react";

export default function Holidays() {
  const { holidays, addHoliday, updateHoliday, deleteHoliday } = useApp();
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name: "", date: "", type: "mandatory", isOptional: false, year: 2026 });

  function openAdd() { setForm({ name: "", date: "", type: "mandatory", isOptional: false, year: 2026 }); setModal("add"); }
  function openEdit(h) { setForm({ name: h.name, date: h.date, type: h.type, isOptional: h.isOptional, year: h.year }); setModal(h); }

  function handleSubmit(e) {
    e.preventDefault();
    const data = { ...form, isOptional: form.type === "optional" };
    if (modal === "add") addHoliday(data);
    else updateHoliday(modal.id, data);
    setModal(null);
  }

  const mandatory = holidays.filter((h) => !h.isOptional);
  const optional = holidays.filter((h) => h.isOptional);

  function HolidaySection({ title, items, icon }) {
    return (
      <div className="glass-card-static rounded-2xl">
        <div className="flex items-center gap-2 p-4 border-b border-theme">
          {icon}
          <h3 className="text-sm font-semibold text-theme-primary">{title}</h3>
          <span className="ml-auto badge badge-info text-xs">{items.length}</span>
        </div>
        <div className="divide-y divide-slate-700/20">
          {items.map((h) => (
            <div key={h.id} className="flex items-center gap-4 px-4 py-3 hover-theme-row transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-500/10 shrink-0">
                <span className="text-xs font-bold text-primary-400">{new Date(h.date + "T00:00:00").toLocaleDateString("en", { day: "2-digit" })}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-theme-primary">{h.name}</p>
                <p className="text-xs text-theme-muted">{new Date(h.date + "T00:00:00").toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric" })}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => openEdit(h)} className="p-1.5 rounded-lg text-theme-muted hover:text-primary-400 hover:bg-primary-500/10 transition-all"><Edit3 className="w-3.5 h-3.5" /></button>
                <button onClick={() => deleteHoliday(h.id)} className="p-1.5 rounded-lg text-theme-muted hover:text-rose-400 hover:bg-rose-500/10 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-theme-primary">Holidays</h2>
          <p className="mt-1 text-sm text-theme-secondary">Manage company holidays for 2026</p>
        </div>
        <button onClick={openAdd} className="btn-primary inline-flex items-center gap-2"><Plus className="w-4 h-4" /> Add Holiday</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <HolidaySection title="Mandatory Holidays" items={mandatory} icon={<CalendarDays className="w-4 h-4 text-primary-400" />} />
        <HolidaySection title="Optional Holidays" items={optional} icon={<Star className="w-4 h-4 text-amber-400" />} />
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-theme-primary">{modal === "add" ? "Add Holiday" : "Edit Holiday"}</h3>
              <button onClick={() => setModal(null)} className="p-1 rounded-lg text-theme-muted hover:text-theme-primary"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input placeholder="Holiday name" value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} required className="input-field" />
              <input type="date" value={form.date} onChange={(e) => setForm(p => ({ ...p, date: e.target.value }))} required className="input-field" />
              <select value={form.type} onChange={(e) => setForm(p => ({ ...p, type: e.target.value }))} className="input-field">
                <option value="mandatory">Mandatory</option>
                <option value="optional">Optional</option>
              </select>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary">{modal === "add" ? "Add" : "Save"}</button>
                <button type="button" onClick={() => setModal(null)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
