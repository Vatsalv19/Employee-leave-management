import { useApp } from "../context/AppContext";
import LeaveTable from "../components/LeaveTable";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";
import { Users, Clock, CheckCircle, XCircle, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
  const { leaveRequests, approveLeave, rejectLeave, allUsers, departments } = useApp();

  const totalRequests = leaveRequests.length;
  const pendingCount = leaveRequests.filter((lr) => lr.status === "Pending").length;
  const approvedCount = leaveRequests.filter((lr) => lr.status === "Approved").length;
  const rejectedCount = leaveRequests.filter((lr) => lr.status === "Rejected").length;
  const activeEmployees = allUsers.filter((u) => u.isActive && u.role !== "admin").length;

  const statsCards = [
    { title: "Total Requests", value: totalRequests, icon: TrendingUp, color: "text-primary-400", bg: "bg-primary-500/15" },
    { title: "Pending", value: pendingCount, icon: Clock, color: "text-amber-400", bg: "bg-amber-500/15" },
    { title: "Approved", value: approvedCount, icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/15" },
    { title: "Rejected", value: rejectedCount, icon: XCircle, color: "text-rose-400", bg: "bg-rose-500/15" },
    { title: "Employees", value: activeEmployees, icon: Users, color: "text-cyan-400", bg: "bg-cyan-500/15" },
  ];

  // Department-wise chart data
  const deptData = departments.map((d) => ({
    name: d.name,
    leaves: leaveRequests.filter((lr) => lr.department === d.name).length,
  })).filter((d) => d.leaves > 0);

  const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#f43f5e", "#06b6d4", "#8b5cf6"];

  // Monthly trend
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyData = months.map((m, i) => ({
    month: m,
    count: leaveRequests.filter((lr) => {
      const d = new Date(lr.appliedOn);
      return d.getMonth() === i;
    }).length,
  }));

  // Leave type distribution
  const typeMap = {};
  leaveRequests.forEach((lr) => { typeMap[lr.type] = (typeMap[lr.type] || 0) + 1; });
  const typeData = Object.entries(typeMap).map(([name, value]) => ({ name, value }));

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-theme-primary">Admin Dashboard</h2>
        <p className="mt-1 text-sm text-theme-secondary">Manage and review all employee leave requests</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5 animate-slide-up">
        {statsCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="glass-card rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.bg}`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <div>
                  <p className="text-xs font-medium text-theme-muted">{card.title}</p>
                  <p className="text-xl font-bold text-theme-primary">{card.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Department Pie Chart */}
        <div className="glass-card-static rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-theme-primary mb-4">Leaves by Department</h3>
          {deptData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={deptData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3} dataKey="leaves">
                  {deptData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--bg-surface-light)", border: "1px solid var(--border-color)", borderRadius: "0.75rem", color: "var(--text-primary)" }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-theme-muted py-10 text-center">No data</p>}
          <div className="flex flex-wrap gap-3 mt-2">
            {deptData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-xs text-theme-muted">{d.name} ({d.leaves})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="glass-card-static rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-theme-primary mb-4">Monthly Leave Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--text-muted)" }} />
              <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} />
              <Tooltip contentStyle={{ background: "var(--bg-surface-light)", border: "1px solid var(--border-color)", borderRadius: "0.75rem", color: "var(--text-primary)" }} />
              <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} dot={{ fill: "#6366f1", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Leave Type Bar */}
        <div className="glass-card-static rounded-2xl p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-theme-primary mb-4">Leaves by Type</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={typeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--text-muted)" }} />
              <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} />
              <Tooltip contentStyle={{ background: "var(--bg-surface-light)", border: "1px solid var(--border-color)", borderRadius: "0.75rem", color: "var(--text-primary)" }} />
              <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Requests Table */}
      <LeaveTable leaves={leaveRequests} showUser showActions onApprove={approveLeave} onReject={rejectLeave} />
    </div>
  );
}
