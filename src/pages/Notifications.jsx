import { useApp } from "../context/AppContext";
import { Bell, CheckCheck, Trash2, Mail, MailOpen, CheckCircle, XCircle, AlertCircle, Info } from "lucide-react";

const typeIcons = {
  leave_approved: CheckCircle,
  leave_rejected: XCircle,
  leave_request: AlertCircle,
  system: Info,
};

const typeColors = {
  leave_approved: "text-emerald-400 bg-emerald-500/15",
  leave_rejected: "text-rose-400 bg-rose-500/15",
  leave_request: "text-amber-400 bg-amber-500/15",
  system: "text-cyan-400 bg-cyan-500/15",
};

export default function Notifications() {
  const { notifications, markNotificationRead, markAllNotificationsRead, deleteNotification, unreadNotificationCount } = useApp();

  return (
    <div className="animate-fade-in space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-theme-primary">Notifications</h2>
          <p className="mt-1 text-sm text-theme-secondary">{unreadNotificationCount} unread notification{unreadNotificationCount !== 1 ? "s" : ""}</p>
        </div>
        {unreadNotificationCount > 0 && (
          <button onClick={markAllNotificationsRead} className="btn-secondary inline-flex items-center gap-2 text-sm">
            <CheckCheck className="w-4 h-4" /> Mark all read
          </button>
        )}
      </div>

      <div className="space-y-2">
        {notifications.length === 0 ? (
          <div className="glass-card-static rounded-2xl p-12 text-center">
            <Bell className="w-12 h-12 text-theme-muted opacity-30 mx-auto mb-3" />
            <p className="text-sm text-theme-muted">No notifications yet</p>
          </div>
        ) : (
          notifications
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map((notif) => {
              const Icon = typeIcons[notif.type] || Info;
              const colors = typeColors[notif.type] || typeColors.system;
              return (
                <div
                  key={notif.id}
                  className={`glass-card-static rounded-xl p-4 flex items-start gap-3 transition-all ${!notif.isRead ? "border-primary-500/30" : "opacity-80"}`}
                >
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg shrink-0 ${colors}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-semibold text-theme-primary">{notif.title}</p>
                      {!notif.isRead && <span className="h-2 w-2 rounded-full bg-primary-400 shrink-0" />}
                    </div>
                    <p className="text-sm text-theme-secondary">{notif.message}</p>
                    <p className="text-xs text-theme-muted mt-1">
                      {new Date(notif.createdAt).toLocaleDateString("en", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {!notif.isRead && (
                      <button onClick={() => markNotificationRead(notif.id)} className="p-1.5 rounded-lg text-theme-muted hover:text-primary-400 hover:bg-primary-500/10 transition-all" title="Mark as read">
                        <MailOpen className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button onClick={() => deleteNotification(notif.id)} className="p-1.5 rounded-lg text-theme-muted hover:text-rose-400 hover:bg-rose-500/10 transition-all" title="Delete">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
        )}
      </div>
    </div>
  );
}
