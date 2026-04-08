import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { Search, Plus, Edit3, UserX, UserCheck, X } from "lucide-react";

export default function Employees() {
  const { allUsers, addUser, updateUser, toggleUserActive, departments, getDepartmentName } = useApp();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("active");
  const [modal, setModal] = useState(null); // null | 'add' | user object for edit
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "password123", phone: "", departmentId: "", role: "employee", managerId: "" });

  const filtered = allUsers.filter((u) => {
    const matchFilter = filter === "all" || (filter === "active" ? u.isActive : !u.isActive);
    const q = search.toLowerCase();
    const matchSearch = !q || `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  function openAdd() {
    setForm({ firstName: "", lastName: "", email: "", password: "password123", phone: "", departmentId: "", role: "employee", managerId: "" });
    setModal("add");
  }

  function openEdit(user) {
    setForm({ firstName: user.firstName, lastName: user.lastName, email: user.email, password: "", phone: user.phone || "", departmentId: user.departmentId || "", role: user.role, managerId: user.managerId || "" });
    setModal(user);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (modal === "add") {
      addUser(form);
    } else {
      const updates = { ...form };
      delete updates.password;
      updateUser(modal.id, updates);
    }
    setModal(null);
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-theme-primary">Employees</h2>
          <p className="mt-1 text-sm text-theme-secondary">Manage your organization's employees</p>
        </div>
        <button onClick={openAdd} className="btn-primary inline-flex items-center gap-2 self-start">
          <Plus className="w-4 h-4" /> Add Employee
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
          <input type="text" placeholder="Search employees..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-9" />
        </div>
        <div className="flex gap-1 rounded-lg bg-theme-surface p-1">
          {[["active", "Active"], ["inactive", "Inactive"], ["all", "All"]].map(([v, l]) => (
            <button key={v} onClick={() => setFilter(v)} className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${filter === v ? "bg-primary-500/20 text-primary-400" : "text-theme-muted hover:text-theme-primary"}`}>{l}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card-static rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-theme">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-theme-muted">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-theme-muted">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-theme-muted">Department</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-theme-muted">Role</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-theme-muted">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-theme-muted">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/20">
              {filtered.map((user) => (
                <tr key={user.id} className="hover-theme-row transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500/20 to-accent-cyan/20 text-xs font-bold text-primary-400">{user.avatar}</div>
                      <p className="text-sm font-medium text-theme-primary">{user.firstName} {user.lastName}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-theme-secondary">{user.email}</td>
                  <td className="px-4 py-3 text-sm text-theme-secondary">{getDepartmentName(user.departmentId)}</td>
                  <td className="px-4 py-3"><span className="badge badge-info capitalize text-xs">{user.role}</span></td>
                  <td className="px-4 py-3">
                    <span className={`badge text-xs ${user.isActive ? "badge-approved" : "badge-rejected"}`}>{user.isActive ? "Active" : "Inactive"}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => openEdit(user)} className="p-1.5 rounded-lg text-theme-muted hover:text-primary-400 hover:bg-primary-500/10 transition-all"><Edit3 className="w-4 h-4" /></button>
                      <button onClick={() => toggleUserActive(user.id)} className="p-1.5 rounded-lg text-theme-muted hover:text-amber-400 hover:bg-amber-500/10 transition-all">
                        {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-theme px-4 py-3">
          <p className="text-xs text-theme-muted">Showing {filtered.length} of {allUsers.length} employees</p>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-theme-primary">{modal === "add" ? "Add Employee" : "Edit Employee"}</h3>
              <button onClick={() => setModal(null)} className="p-1 rounded-lg text-theme-muted hover:text-theme-primary"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="First name" value={form.firstName} onChange={(e) => setForm(p => ({ ...p, firstName: e.target.value }))} required className="input-field" />
                <input placeholder="Last name" value={form.lastName} onChange={(e) => setForm(p => ({ ...p, lastName: e.target.value }))} required className="input-field" />
              </div>
              <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))} required className="input-field" />
              {modal === "add" && <input placeholder="Password" value={form.password} onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))} required className="input-field" />}
              <input placeholder="Phone" value={form.phone} onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))} className="input-field" />
              <select value={form.departmentId} onChange={(e) => setForm(p => ({ ...p, departmentId: e.target.value }))} required className="input-field">
                <option value="">Select department</option>
                {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              <select value={form.role} onChange={(e) => setForm(p => ({ ...p, role: e.target.value }))} className="input-field">
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary">{modal === "add" ? "Add Employee" : "Save Changes"}</button>
                <button type="button" onClick={() => setModal(null)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
