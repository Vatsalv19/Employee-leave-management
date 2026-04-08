import { useState } from "react";
import { useApp } from "../context/AppContext";
import { User, Mail, Phone, Building2, Calendar, Save, Edit3 } from "lucide-react";

export default function Profile() {
  const { currentUser, updateUser, getDepartmentName } = useApp();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    firstName: currentUser?.firstName || "",
    lastName: currentUser?.lastName || "",
    phone: currentUser?.phone || "",
  });

  if (!currentUser) return null;

  function handleSave() {
    updateUser(currentUser.id, form);
    setEditing(false);
  }

  return (
    <div className="animate-fade-in max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-theme-primary">My Profile</h2>
        <p className="mt-1 text-sm text-theme-secondary">View and manage your personal information</p>
      </div>

      {/* Profile Card */}
      <div className="glass-card-static rounded-2xl p-6">
        <div className="flex items-start gap-5 mb-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-accent-cyan text-2xl font-bold text-white shadow-lg shadow-primary-500/20">
            {currentUser.avatar}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-theme-primary">{currentUser.firstName} {currentUser.lastName}</h3>
            <p className="text-sm text-theme-secondary capitalize">{currentUser.role} · {getDepartmentName(currentUser.departmentId)}</p>
            <p className="text-xs text-theme-muted mt-1">Member since {new Date(currentUser.joinedDate + "T00:00:00").toLocaleDateString("en", { month: "long", year: "numeric" })}</p>
          </div>
          <button
            onClick={() => editing ? handleSave() : setEditing(true)}
            className={editing ? "btn-primary inline-flex items-center gap-2 text-sm" : "btn-secondary inline-flex items-center gap-2 text-sm"}
          >
            {editing ? <><Save className="w-4 h-4" /> Save</> : <><Edit3 className="w-4 h-4" /> Edit</>}
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-theme-muted flex items-center gap-1.5 mb-1.5"><User className="w-3.5 h-3.5" /> First Name</label>
              {editing ? (
                <input value={form.firstName} onChange={(e) => setForm(p => ({ ...p, firstName: e.target.value }))} className="input-field" />
              ) : (
                <p className="text-sm text-theme-primary font-medium">{currentUser.firstName}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-theme-muted flex items-center gap-1.5 mb-1.5"><User className="w-3.5 h-3.5" /> Last Name</label>
              {editing ? (
                <input value={form.lastName} onChange={(e) => setForm(p => ({ ...p, lastName: e.target.value }))} className="input-field" />
              ) : (
                <p className="text-sm text-theme-primary font-medium">{currentUser.lastName}</p>
              )}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-theme-muted flex items-center gap-1.5 mb-1.5"><Mail className="w-3.5 h-3.5" /> Email</label>
            <p className="text-sm text-theme-primary">{currentUser.email}</p>
          </div>

          <div>
            <label className="text-xs font-medium text-theme-muted flex items-center gap-1.5 mb-1.5"><Phone className="w-3.5 h-3.5" /> Phone</label>
            {editing ? (
              <input value={form.phone} onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))} className="input-field" />
            ) : (
              <p className="text-sm text-theme-primary">{currentUser.phone || "Not provided"}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-theme-muted flex items-center gap-1.5 mb-1.5"><Building2 className="w-3.5 h-3.5" /> Department</label>
              <p className="text-sm text-theme-primary">{getDepartmentName(currentUser.departmentId)}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-theme-muted flex items-center gap-1.5 mb-1.5"><Calendar className="w-3.5 h-3.5" /> Joined</label>
              <p className="text-sm text-theme-primary">{currentUser.joinedDate}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
