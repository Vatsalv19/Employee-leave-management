import { useState } from "react";
import { Search, FileText, Download, ChevronLeft, ChevronRight } from "lucide-react";

const STATUS_BADGES = {
  Pending: "badge badge-pending",
  Approved: "badge badge-approved",
  Rejected: "badge badge-rejected",
};

const PAGE_SIZE = 8;

export default function LeaveTable({
  leaves,
  showUser = false,
  showActions = false,
  onApprove,
  onReject,
  onCancel,
  compact = false,
}) {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const filters = ["All", "Pending", "Approved", "Rejected"];

  const filteredLeaves = leaves.filter((leave) => {
    const matchesFilter = filter === "All" || leave.status === filter;
    const q = search.toLowerCase();
    const matchesSearch = !q ||
      leave.userName?.toLowerCase().includes(q) ||
      leave.type.toLowerCase().includes(q) ||
      leave.reason?.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  const totalPages = Math.ceil(filteredLeaves.length / PAGE_SIZE);
  const paged = filteredLeaves.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleFilterChange(f) {
    setFilter(f);
    setPage(1);
  }

  function handleReject(id) {
    if (rejectingId === id) {
      onReject?.(id, rejectReason);
      setRejectingId(null);
      setRejectReason("");
    } else {
      setRejectingId(id);
      setRejectReason("");
    }
  }

  function exportCSV() {
    const headers = ["Employee", "Type", "Start", "End", "Days", "Reason", "Status", "Applied On"];
    const rows = filteredLeaves.map((l) => [l.userName, l.type, l.startDate, l.endDate, l.totalDays, `"${l.reason}"`, l.status, l.appliedOn]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "leave_requests.csv";
    a.click();
  }

  return (
    <div className="glass-card-static rounded-2xl animate-slide-up">
      {/* Header & Filters */}
      <div className="flex flex-col gap-3 border-b border-theme p-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-base font-semibold text-theme-primary">
          {showUser ? "All Leave Requests" : "Leave History"}
        </h3>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {showUser && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-theme-muted" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="input-field pl-9 sm:w-48"
              />
            </div>
          )}
          <div className="flex gap-1 rounded-lg bg-theme-surface p-1">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => handleFilterChange(f)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                  filter === f
                    ? "bg-primary-500/20 text-primary-400 shadow-sm"
                    : "text-theme-muted hover:text-theme-primary"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <button onClick={exportCSV} className="p-2 rounded-lg text-theme-muted hover:text-primary-400 hover:bg-primary-500/10 transition-all" title="Export CSV">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full">
          <thead>
            <tr className="border-b border-theme">
              {showUser && <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-theme-muted">Employee</th>}
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-theme-muted">Type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-theme-muted">Duration</th>
              {!compact && <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-theme-muted">Reason</th>}
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-theme-muted">Status</th>
              {showActions && <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-theme-muted">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/20">
            {paged.length === 0 ? (
              <tr>
                <td colSpan={showUser ? 6 : 5} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="w-10 h-10 text-theme-muted opacity-40" />
                    <p className="text-sm text-theme-muted">No leave requests found</p>
                  </div>
                </td>
              </tr>
            ) : (
              paged.map((leave) => (
                <tr key={leave.id} className="hover-theme-row transition-colors">
                  {showUser && (
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-theme-primary">{leave.userName}</p>
                      <p className="text-xs text-theme-muted">{leave.department}</p>
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-theme-secondary">{leave.type}</span>
                    {leave.isHalfDay && <span className="ml-1.5 text-[10px] badge badge-info">Half</span>}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-theme-secondary">{leave.startDate}</p>
                    {leave.startDate !== leave.endDate && <p className="text-xs text-theme-muted">to {leave.endDate}</p>}
                    <p className="text-xs text-theme-muted">{leave.totalDays} day{leave.totalDays !== 1 ? "s" : ""}</p>
                  </td>
                  {!compact && (
                    <td className="px-4 py-3">
                      <p className="max-w-xs truncate text-sm text-theme-muted">{leave.reason}</p>
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <span className={STATUS_BADGES[leave.status]}>{leave.status}</span>
                  </td>
                  {showActions && (
                    <td className="px-4 py-3 text-right">
                      {leave.status === "Pending" ? (
                        <div className="flex justify-end gap-2 flex-wrap">
                          {onApprove && (
                            <button onClick={() => onApprove(leave.id)} className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400 transition-all hover:bg-emerald-500/20">
                              Approve
                            </button>
                          )}
                          {onReject && (
                            <button onClick={() => handleReject(leave.id)} className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-400 transition-all hover:bg-rose-500/20">
                              Reject
                            </button>
                          )}
                          {onCancel && (
                            <button onClick={() => onCancel(leave.id)} className="rounded-lg border border-slate-500/30 bg-slate-500/10 px-3 py-1.5 text-xs font-semibold text-slate-400 transition-all hover:bg-slate-500/20">
                              Cancel
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-theme-muted">—</span>
                      )}
                      {rejectingId === leave.id && (
                        <div className="mt-2 flex gap-2">
                          <input
                            type="text"
                            placeholder="Rejection reason..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            className="input-field text-xs py-1.5 flex-1"
                          />
                          <button onClick={() => { onReject?.(leave.id, rejectReason); setRejectingId(null); }} className="text-xs text-rose-400 font-semibold">
                            Submit
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer with pagination */}
      <div className="flex items-center justify-between border-t border-theme px-4 py-3">
        <p className="text-xs text-theme-muted">
          Showing {paged.length} of {filteredLeaves.length} requests
        </p>
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg text-theme-muted hover:text-theme-primary hover:bg-primary-500/10 transition-all disabled:opacity-30">
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-7 h-7 rounded-lg text-xs font-medium transition-all ${
                  page === i + 1 ? "bg-primary-500/20 text-primary-400" : "text-theme-muted hover:text-theme-primary"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-lg text-theme-muted hover:text-theme-primary hover:bg-primary-500/10 transition-all disabled:opacity-30">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
