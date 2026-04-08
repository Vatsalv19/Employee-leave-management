import { useState } from "react";
import { useApp } from "../context/AppContext";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function LeaveCalendar() {
  const { userLeaves, holidays, currentUser } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = currentDate.toLocaleDateString("en", { month: "long", year: "numeric" });

  function prevMonth() { setCurrentDate(new Date(year, month - 1, 1)); }
  function nextMonth() { setCurrentDate(new Date(year, month + 1, 1)); }
  function goToday() { setCurrentDate(new Date()); }

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  // Build calendar days
  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  function getDateStr(day) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  function getLeavesForDay(dateStr) {
    return userLeaves.filter((l) => l.startDate <= dateStr && l.endDate >= dateStr && l.status !== "Rejected");
  }

  function getHolidayForDay(dateStr) {
    return holidays.find((h) => h.date === dateStr);
  }

  const statusColors = {
    Pending: "bg-amber-500/80",
    Approved: "bg-emerald-500/80",
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-theme-primary">Leave Calendar</h2>
        <p className="mt-1 text-sm text-theme-secondary">View your leaves and holidays at a glance</p>
      </div>

      <div className="glass-card-static rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-theme">
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="p-1.5 rounded-lg text-theme-muted hover:text-theme-primary hover:bg-primary-500/10 transition-all"><ChevronLeft className="w-5 h-5" /></button>
            <h3 className="text-lg font-semibold text-theme-primary min-w-[180px] text-center">{monthName}</h3>
            <button onClick={nextMonth} className="p-1.5 rounded-lg text-theme-muted hover:text-theme-primary hover:bg-primary-500/10 transition-all"><ChevronRight className="w-5 h-5" /></button>
          </div>
          <button onClick={goToday} className="text-xs font-medium text-primary-400 hover:text-primary-300 transition-colors">Today</button>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 border-b border-theme">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="p-2 text-center text-xs font-semibold text-theme-muted uppercase">{d}</div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7">
          {days.map((day, idx) => {
            if (!day) return <div key={`empty-${idx}`} className="min-h-[80px] border-b border-r border-theme opacity-30" />;

            const dateStr = getDateStr(day);
            const isToday = dateStr === todayStr;
            const dayLeaves = getLeavesForDay(dateStr);
            const holiday = getHolidayForDay(dateStr);
            const isWeekend = (idx % 7 === 0) || (idx % 7 === 6);

            return (
              <div
                key={day}
                className={`min-h-[80px] border-b border-r border-theme p-1.5 calendar-day ${isWeekend ? "bg-slate-800/20" : ""}`}
              >
                <div className={`text-xs font-medium mb-1 ${isToday ? "flex items-center justify-center w-6 h-6 rounded-full bg-primary-500 text-white" : "text-theme-secondary pl-1"}`}>
                  {day}
                </div>
                <div className="space-y-0.5">
                  {holiday && (
                    <div className="text-[10px] font-medium text-rose-400 bg-rose-500/10 rounded px-1 py-0.5 truncate">
                      🎉 {holiday.name}
                    </div>
                  )}
                  {dayLeaves.map((l) => (
                    <div key={l.id} className={`text-[10px] text-white rounded px-1 py-0.5 truncate ${statusColors[l.status] || "bg-slate-500/80"}`}>
                      {l.type}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 p-3 border-t border-theme">
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /><span className="text-xs text-theme-muted">Approved</span></div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-amber-500" /><span className="text-xs text-theme-muted">Pending</span></div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-rose-500/40" /><span className="text-xs text-theme-muted">Holiday</span></div>
        </div>
      </div>
    </div>
  );
}
