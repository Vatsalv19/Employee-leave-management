import { Calendar, CheckCircle, TrendingUp, Clock } from "lucide-react";

export default function DashboardCards({ totalBalance, usedLeaves, remainingLeaves, pendingLeaves }) {
  const cards = [
    {
      title: "Total Leaves",
      value: totalBalance,
      icon: Calendar,
      gradient: "from-primary-500 to-primary-700",
      shadowColor: "shadow-primary-500/20",
      iconBg: "bg-primary-500/15 text-primary-400",
    },
    {
      title: "Used Leaves",
      value: usedLeaves,
      icon: CheckCircle,
      gradient: "from-accent-amber to-orange-600",
      shadowColor: "shadow-amber-500/20",
      iconBg: "bg-amber-500/15 text-amber-400",
    },
    {
      title: "Pending",
      value: pendingLeaves || 0,
      icon: Clock,
      gradient: "from-accent-cyan to-cyan-700",
      shadowColor: "shadow-cyan-500/20",
      iconBg: "bg-cyan-500/15 text-cyan-400",
    },
    {
      title: "Remaining",
      value: remainingLeaves,
      icon: TrendingUp,
      gradient: "from-accent-emerald to-emerald-700",
      shadowColor: "shadow-emerald-500/20",
      iconBg: "bg-emerald-500/15 text-emerald-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-slide-up">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className={`glass-card relative overflow-hidden rounded-2xl p-5 ${card.shadowColor}`}
          >
            <div className={`absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br ${card.gradient} opacity-10 blur-2xl`} />
            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-theme-muted">{card.title}</p>
                <p className="mt-2 text-3xl font-bold text-theme-primary">{card.value}</p>
              </div>
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.iconBg}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4">
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-700/30">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${card.gradient} transition-all duration-700`}
                  style={{ width: `${totalBalance > 0 ? Math.min((card.value / totalBalance) * 100, 100) : 0}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
