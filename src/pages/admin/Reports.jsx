import { useApp } from "../../context/AppContext";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from "recharts";
import { Download, TrendingUp } from "lucide-react";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#f43f5e", "#06b6d4", "#8b5cf6", "#ec4899", "#64748b"];

export default function Reports() {
  const { leaveRequests, allUsers, departments, leaveTypes: types } = useApp();

  // Dept-wise leaves
  const deptData = departments.map((d) => ({
    name: d.name,
    total: leaveRequests.filter((lr) => lr.department === d.name).length,
    approved: leaveRequests.filter((lr) => lr.department === d.name && lr.status === "Approved").length,
    pending: leaveRequests.filter((lr) => lr.department === d.name && lr.status === "Pending").length,
  })).filter((d) => d.total > 0);

  // Type-wise
  const typeData = types.map((t) => ({
    name: t.name,
    value: leaveRequests.filter((lr) => lr.type === t.name).length,
    color: t.color,
  })).filter((d) => d.value > 0);

  // Monthly trend with status breakdown
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyData = months.map((m, i) => {
    const monthLeaves = leaveRequests.filter((lr) => new Date(lr.appliedOn).getMonth() === i);
    return { month: m, total: monthLeaves.length, approved: monthLeaves.filter(l => l.status === "Approved").length, rejected: monthLeaves.filter(l => l.status === "Rejected").length };
  });

  // Employee leave ranking
  const empLeaves = allUsers.filter(u => u.role !== "admin" && u.isActive).map((u) => ({
    name: `${u.firstName} ${u.lastName[0]}.`,
    days: leaveRequests.filter(lr => lr.userId === u.id && lr.status === "Approved").reduce((s, l) => s + l.totalDays, 0),
  })).sort((a, b) => b.days - a.days).slice(0, 8);

  function exportCSV() {
    const headers = ["Employee", "Type", "Start", "End", "Days", "Status", "Applied"];
    const rows = leaveRequests.map((l) => [l.userName, l.type, l.startDate, l.endDate, l.totalDays, l.status, l.appliedOn]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `elms_report_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  }

  const tooltipStyle = { background: "var(--bg-surface-light)", border: "1px solid var(--border-color)", borderRadius: "0.75rem", color: "var(--text-primary)" };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-theme-primary">Reports & Analytics</h2>
          <p className="mt-1 text-sm text-theme-secondary">Insights into leave patterns across the organization</p>
        </div>
        <button onClick={exportCSV} className="btn-secondary inline-flex items-center gap-2"><Download className="w-4 h-4" /> Export CSV</button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Requests", val: leaveRequests.length, color: "text-primary-400" },
          { label: "Avg Days/Employee", val: (leaveRequests.reduce((s, l) => s + l.totalDays, 0) / Math.max(allUsers.filter(u => u.role !== "admin").length, 1)).toFixed(1), color: "text-cyan-400" },
          { label: "Approval Rate", val: `${leaveRequests.length > 0 ? Math.round((leaveRequests.filter(l => l.status === "Approved").length / leaveRequests.length) * 100) : 0}%`, color: "text-emerald-400" },
          { label: "Pending Now", val: leaveRequests.filter(l => l.status === "Pending").length, color: "text-amber-400" },
        ].map((s) => (
          <div key={s.label} className="glass-card-static rounded-xl p-4 text-center">
            <p className="text-xs text-theme-muted font-medium">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.val}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Dept Pie */}
        <div className="glass-card-static rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-theme-primary mb-4">Leaves by Department</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={deptData} cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={3} dataKey="total">
                {deptData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-2 justify-center">
            {deptData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} /><span className="text-xs text-theme-muted">{d.name}</span></div>
            ))}
          </div>
        </div>

        {/* Type Bar */}
        <div className="glass-card-static rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-theme-primary mb-4">Leaves by Type</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={typeData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "var(--text-muted)" }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "var(--text-muted)" }} width={100} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {typeData.map((entry, i) => <Cell key={i} fill={entry.color || COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Trend */}
        <div className="glass-card-static rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-theme-primary mb-4">Monthly Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--text-muted)" }} />
              <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={2} />
              <Line type="monotone" dataKey="approved" stroke="#10b981" strokeWidth={2} />
              <Line type="monotone" dataKey="rejected" stroke="#f43f5e" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Leavers */}
        <div className="glass-card-static rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-theme-primary mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary-400" /> Top Leave Takers (Approved Days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={empLeaves}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
              <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="days" fill="#06b6d4" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
