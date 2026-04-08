import { useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";

export default function ForgotPassword() {
  const { resetPassword } = useApp();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    const ok = await resetPassword(email.trim());
    if (ok) setSent(true);
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-accent-cyan/8 blur-3xl" />
      </div>
      <div className="relative w-full max-w-md animate-scale-in">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-lg font-bold text-white shadow-xl shadow-primary-500/30">EL</div>
          <h1 className="text-2xl font-bold"><span className="gradient-text">Reset Password</span></h1>
        </div>

        <div className="glass-card rounded-2xl p-6">
          {sent ? (
            <div className="text-center py-6 animate-fade-in">
              <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-theme-primary mb-2">Check your email</h3>
              <p className="text-sm text-theme-secondary mb-6">
                We've sent a password reset link to <span className="font-medium text-primary-400">{email}</span>
              </p>
              <Link to="/login" className="btn-primary inline-flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Back to Login
              </Link>
            </div>
          ) : (
            <>
              <p className="mb-6 text-sm text-theme-secondary">Enter your email and we'll send you a reset link.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
                  <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required className="input-field pl-10" />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? "Sending..." : "Send Reset Link"}</button>
              </form>
              <p className="mt-4 text-center text-sm text-theme-secondary">
                <Link to="/login" className="text-primary-400 font-medium hover:text-primary-300 inline-flex items-center gap-1">
                  <ArrowLeft className="w-3 h-3" /> Back to Login
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
