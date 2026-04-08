import { useApp } from "../context/AppContext";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

export default function Toast() {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-400" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400" />,
    info: <Info className="w-5 h-5 text-cyan-400" />,
  };

  const bgMap = {
    success: "border-emerald-500/30 bg-emerald-500/10",
    error: "border-rose-500/30 bg-rose-500/10",
    info: "border-cyan-500/30 bg-cyan-500/10",
  };

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast-enter glass-card-static flex items-center gap-3 rounded-xl border px-4 py-3 shadow-2xl ${bgMap[toast.type] || bgMap.info}`}
        >
          {icons[toast.type] || icons.info}
          <p className="text-sm font-medium text-theme-primary flex-1">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-theme-muted hover:text-theme-primary transition-colors ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
