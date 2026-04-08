import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { departments } from "../data/mockData";
import { Mail, Lock, User, Phone, Building2, UserPlus } from "lucide-react";

export default function Register() {
  const { register } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", phone: "", departmentId: "" });
  const [errors, setErrors] = useState({});

  function validate() {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.lastName.trim()) e.lastName = "Required";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Valid email required";
    if (form.password.length < 6) e.password = "Minimum 6 characters";
    if (!form.departmentId) e.departmentId = "Select department";
    return e;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    const user = register(form);
    if (user) navigate("/login");
  }

  function handleChange(field, value) {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: undefined }));
  }

  const fields = [
    { name: "firstName", icon: User, placeholder: "First name", type: "text" },
    { name: "lastName", icon: User, placeholder: "Last name", type: "text" },
    { name: "email", icon: Mail, placeholder: "Email address", type: "email" },
    { name: "password", icon: Lock, placeholder: "Password (min 6 chars)", type: "password" },
    { name: "phone", icon: Phone, placeholder: "Phone (optional)", type: "tel" },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-accent-cyan/8 blur-3xl" />
      </div>
      <div className="relative w-full max-w-md animate-scale-in">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-lg font-bold text-white shadow-xl shadow-primary-500/30">EL</div>
          <h1 className="text-2xl font-bold"><span className="gradient-text">Create Account</span></h1>
          <p className="mt-1 text-sm text-theme-secondary">Join ELMS to manage your leaves</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {fields.slice(0, 2).map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.name} className="relative">
                  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
                  <input type={f.type} placeholder={f.placeholder} value={form[f.name]} onChange={(e) => handleChange(f.name, e.target.value)} className={`input-field pl-10 ${errors[f.name] ? "input-error" : ""}`} />
                  {errors[f.name] && <p className="mt-1 text-xs text-rose-400">{errors[f.name]}</p>}
                </div>
              );
            })}
          </div>
          {fields.slice(2).map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.name} className="relative">
                <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
                <input type={f.type} placeholder={f.placeholder} value={form[f.name]} onChange={(e) => handleChange(f.name, e.target.value)} className={`input-field pl-10 ${errors[f.name] ? "input-error" : ""}`} />
                {errors[f.name] && <p className="mt-1 text-xs text-rose-400">{errors[f.name]}</p>}
              </div>
            );
          })}
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
            <select value={form.departmentId} onChange={(e) => handleChange("departmentId", e.target.value)} className={`input-field pl-10 ${errors.departmentId ? "input-error" : ""}`}>
              <option value="">Select department</option>
              {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            {errors.departmentId && <p className="mt-1 text-xs text-rose-400">{errors.departmentId}</p>}
          </div>
          <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
            <UserPlus className="w-4 h-4" /> Create Account
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-theme-secondary">
          Already have an account? <Link to="/login" className="text-primary-400 font-medium hover:text-primary-300">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
