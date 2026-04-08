import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { Plus, Edit3, Trash2, X, Building2 } from "lucide-react";

export default function Departments() {
  const { departments, addDepartment, updateDepartment, deleteDepartment, allUsers } = useApp();
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", headId: "" });

  function openAdd() { setForm({ name: "", description: "", headId: "" }); setModal("add"); }
  function openEdit(dept) { setForm({ name: dept.name, description: dept.description, headId: dept.headId || "" }); setModal(dept); }

  function handleSubmit(e) {
    e.preventDefault();
    if (modal === "add") addDepartment(form);
    else updateDepartment(modal.id, form);
    setModal(null);
  }

  const managers = allUsers.filter((u) => u.role === "manager" || u.role === "admin");

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-theme-primary">Departments</h2>
          <p className="mt-1 text-sm text-theme-secondary">Organize your company structure</p>
        </div>
        <button onClick={openAdd} className="btn-primary inline-flex items-center gap-2"><Plus className="w-4 h-4" /> Add Department</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map((dept) => {
          const head = allUsers.find((u) => u.id === dept.headId);
          const empCount = allUsers.filter((u) => u.departmentId === dept.id && u.isActive).length;
          return (
            <div key={dept.id} className="glass-card rounded-2xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-500/15">
                  <Building2 className="w-5 h-5 text-primary-400" />
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(dept)} className="p-1.5 rounded-lg text-theme-muted hover:text-primary-400 hover:bg-primary-500/10 transition-all"><Edit3 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => deleteDepartment(dept.id)} className="p-1.5 rounded-lg text-theme-muted hover:text-rose-400 hover:bg-rose-500/10 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <h3 className="text-base font-semibold text-theme-primary">{dept.name}</h3>
              <p className="text-xs text-theme-muted mt-1 line-clamp-2">{dept.description}</p>
              <div className="mt-4 pt-3 border-t border-theme flex items-center justify-between">
                <span className="text-xs text-theme-muted">{empCount} employee{empCount !== 1 ? "s" : ""}</span>
                {head && <span className="text-xs text-primary-400">Head: {head.firstName}</span>}
              </div>
            </div>
          );
        })}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-theme-primary">{modal === "add" ? "Add Department" : "Edit Department"}</h3>
              <button onClick={() => setModal(null)} className="p-1 rounded-lg text-theme-muted hover:text-theme-primary"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input placeholder="Department name" value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} required className="input-field" />
              <textarea placeholder="Description" value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} className="input-field resize-none" rows={3} />
              <select value={form.headId} onChange={(e) => setForm(p => ({ ...p, headId: e.target.value }))} className="input-field">
                <option value="">Select department head</option>
                {managers.map((m) => <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>)}
              </select>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary">{modal === "add" ? "Create" : "Save"}</button>
                <button type="button" onClick={() => setModal(null)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
