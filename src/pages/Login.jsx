import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Mail, Lock, LogIn, Eye, EyeOff, AlertTriangle } from "lucide-react";

export default function Login() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);

    try {
      const user = await login(email, password);
      if (user) {
        navigate(user.role === "admin" ? "/admin" : user.role === "manager" ? "/manager" : "/employee");
      }
    } catch (error) {
      if (error?.message?.includes("CONFIGURATION_NOT_FOUND") || error?.code === "auth/configuration-not-found") {
        setAuthError("firebase-auth");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-accent-cyan/8 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-scale-in">
        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-xl font-bold text-white shadow-xl shadow-primary-500/30">
            EL
          </div>
          <h1 className="text-3xl font-bold"><span className="gradient-text">ELMS</span></h1>
          <p className="mt-2 text-sm text-theme-secondary">Employee Leave Management System</p>
        </div>

        {/* Login Form */}
        <div className="glass-card rounded-2xl p-6">
          {/* Firebase Auth Warning */}
          {authError === "firebase-auth" && (
            <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-400">Firebase Auth Not Enabled</p>
                  <p className="text-xs text-amber-300/80 mt-1">
                    Please enable Email/Password sign-in in Firebase Console, then register a new account.
                  </p>
                  <a 
                    href="https://console.firebase.google.com/project/employee-leave-managemen-6d86c/authentication/providers" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block mt-2 text-xs text-amber-400 underline hover:text-amber-300"
                  >
                    Open Firebase Console →
                  </a>
                </div>
              </div>
            </div>
          )}

          <h2 className="mb-1 text-lg font-semibold text-theme-primary">Sign In</h2>
          <p className="mb-6 text-sm text-theme-secondary">Enter your credentials to continue</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-field pl-10"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
              <input
                type={showPass ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-field pl-10 pr-10"
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-muted hover:text-theme-primary">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs text-primary-400 hover:text-primary-300 transition-colors">
                Forgot password?
              </Link>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <LogIn className="w-4 h-4" />}
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Info about registration */}
          <div className="mt-4 rounded-lg bg-primary-500/5 border border-primary-500/20 px-3 py-2">
            <p className="text-xs text-theme-muted text-center">
              First time? <Link to="/register" className="text-primary-400 font-medium hover:text-primary-300">Create an account</Link> to get started.
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-theme-secondary">
          Don't have an account?{" "}
          <Link to="/register" className="text-primary-400 font-medium hover:text-primary-300">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
