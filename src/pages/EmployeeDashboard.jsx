import { useApp } from "../context/AppContext";
import DashboardCards from "../components/DashboardCards";
import LeaveTable from "../components/LeaveTable";
import { Link } from "react-router-dom";
import { PlusCircle, CalendarDays } from "lucide-react";

export default function EmployeeDashboard() {
  const { currentUser, userLeaves, totalBalance, usedLeaves, pendingLeaves, remainingLeaves, userBalances, leaveTypes, holidays, cancelLeave } = useApp();

  // Upcoming holidays
  const today = new Date().toISOString().split("T")[0];
  const upcomingHolidays = holidays.filter((h) => h.date >= today).slice(0, 4);

  // Balance per type
  const typeBalances = userBalances.map((b) => {
    const lt = leaveTypes.find((t) => t.id === b.leaveTypeId);
    return { ...b, name: lt?.name || "Unknown", color: lt?.color || "#6366f1", remaining: b.totalAllocated + b.carriedOver - b.used - b.pending };
  });

  return (
    <div className="animate-fade-in space-y-6">
      {/* Greeting */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-theme-primary">Welcome back, {currentUser?.firstName} 👋</h2>
          <p className="mt-1 text-sm text-theme-secondary">Here's your leave overview for 2026</p>
        </div>
        <Link to="/employee/apply" className="btn-primary inline-flex items-center gap-2 self-start">
          <PlusCircle className="w-4 h-4" /> Apply Leave
        </Link>
      </div>

      {/* Stats Cards */}
      <DashboardCards totalBalance={totalBalance} usedLeaves={usedLeaves} pendingLeaves={pendingLeaves} remainingLeaves={remainingLeaves} />

      {/* Balance per Type + Upcoming Holidays */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Balance per type */}
        <div className="lg:col-span-2 glass-card-static rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-theme-primary mb-4">Balance by Leave Type</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {typeBalances.map((b) => (
              <div key={b.id} className="flex items-center gap-3 rounded-xl p-3 hover-theme-row transition-colors">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: b.color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-theme-primary truncate">{b.name}</p>
                  <div className="flex gap-3 text-xs text-theme-muted mt-0.5">
                    <span>Total: {b.totalAllocated}{b.carriedOver > 0 ? `+${b.carriedOver}` : ""}</span>
                    <span>Used: {b.used}</span>
                    {b.pending > 0 && <span className="text-amber-400">Pending: {b.pending}</span>}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-theme-primary">{b.remaining}</p>
                  <p className="text-[10px] text-theme-muted">left</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Holidays */}
        <div className="glass-card-static rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-theme-primary mb-4 flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-primary-400" /> Upcoming Holidays
          </h3>
          <div className="space-y-3">
            {upcomingHolidays.length === 0 ? (
              <p className="text-sm text-theme-muted">No upcoming holidays</p>
            ) : (
              upcomingHolidays.map((h) => (
                <div key={h.id} className="flex items-center gap-3 rounded-lg p-2 hover-theme-row transition-colors">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-500/10">
                    <span className="text-xs font-bold text-primary-400">
                      {new Date(h.date + "T00:00:00").toLocaleDateString("en", { day: "2-digit" })}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-theme-primary truncate">{h.name}</p>
                    <p className="text-xs text-theme-muted">
                      {new Date(h.date + "T00:00:00").toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" })}
                      {h.isOptional && <span className="ml-1.5 badge badge-info text-[10px] py-0 px-1.5">Optional</span>}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Leave History */}
      <LeaveTable leaves={userLeaves} showActions onCancel={cancelLeave} />
    </div>
  );
}
