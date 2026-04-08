import { useApp } from "../../context/AppContext";
import { ShieldCheck, FileText, RefreshCw, DollarSign } from "lucide-react";

export default function Policies() {
  const { leaveTypes, policies } = useApp();
  const policy = policies[0];

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-theme-primary">Leave Policies</h2>
        <p className="mt-1 text-sm text-theme-secondary">Configure leave allocation and rules</p>
      </div>

      {/* Current Policy */}
      <div className="glass-card-static rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <ShieldCheck className="w-5 h-5 text-primary-400" />
          <h3 className="text-base font-semibold text-theme-primary">{policy?.name || "Standard Policy"}</h3>
          {policy?.isDefault && <span className="badge badge-approved text-xs">Default</span>}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl p-4 bg-primary-500/5 border border-primary-500/10">
            <div className="flex items-center gap-2 mb-2"><FileText className="w-4 h-4 text-primary-400" /><span className="text-xs font-semibold text-theme-secondary">Accrual</span></div>
            <p className="text-sm text-theme-primary">Annual reset in January</p>
          </div>
          <div className="rounded-xl p-4 bg-emerald-500/5 border border-emerald-500/10">
            <div className="flex items-center gap-2 mb-2"><RefreshCw className="w-4 h-4 text-emerald-400" /><span className="text-xs font-semibold text-theme-secondary">Carry Over</span></div>
            <p className="text-sm text-theme-primary">Max {policy?.carryOverRules?.maxDays || 5} days, expires in {policy?.carryOverRules?.expiryMonths || 3} months</p>
          </div>
          <div className="rounded-xl p-4 bg-amber-500/5 border border-amber-500/10">
            <div className="flex items-center gap-2 mb-2"><DollarSign className="w-4 h-4 text-amber-400" /><span className="text-xs font-semibold text-theme-secondary">Encashment</span></div>
            <p className="text-sm text-theme-primary">Min balance: {policy?.encashmentRules?.minBalance || 10}, Max encash: {policy?.encashmentRules?.maxEncash || 5}</p>
          </div>
        </div>
      </div>

      {/* Leave Type Allocations */}
      <div className="glass-card-static rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-theme">
          <h3 className="text-sm font-semibold text-theme-primary">Leave Type Allocations</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-theme">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-theme-muted">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-theme-muted">Default Days</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-theme-muted">Paid</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-theme-muted">Requires Doc</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-theme-muted">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/20">
              {leaveTypes.map((lt) => (
                <tr key={lt.id} className="hover-theme-row transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: lt.color }} />
                      <div>
                        <p className="text-sm font-medium text-theme-primary">{lt.name}</p>
                        <p className="text-xs text-theme-muted">{lt.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-theme-secondary font-semibold">{lt.defaultDays || "—"}</td>
                  <td className="px-4 py-3"><span className={`badge text-xs ${lt.isPaid ? "badge-approved" : "badge-rejected"}`}>{lt.isPaid ? "Yes" : "No"}</span></td>
                  <td className="px-4 py-3"><span className={`badge text-xs ${lt.requiresDocument ? "badge-pending" : "badge-info"}`}>{lt.requiresDocument ? "Yes" : "No"}</span></td>
                  <td className="px-4 py-3"><span className={`badge text-xs ${lt.isActive ? "badge-approved" : "badge-rejected"}`}>{lt.isActive ? "Active" : "Inactive"}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
