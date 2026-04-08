import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { ArrowLeft, Clock, Send } from "lucide-react";

export default function LeaveForm() {
  const { addLeave, leaveTypes, userBalances, holidays } = useApp();
  const navigate = useNavigate();

  const [form, setForm] = useState({ type: "", leaveTypeId: "", startDate: "", endDate: "", reason: "", isHalfDay: false });
  const [errors, setErrors] = useState({});

  const activeTypes = leaveTypes.filter((lt) => lt.isActive);

  function getBalance(typeId) {
    const bal = userBalances.find((b) => b.leaveTypeId === typeId);
    if (!bal) return null;
    return bal.totalAllocated + bal.carriedOver - bal.used - bal.pending;
  }

  function isHoliday(dateStr) {
    return holidays.find((h) => h.date === dateStr);
  }

  function validate() {
    const errs = {};
    if (!form.leaveTypeId) errs.type = "Please select a leave type";
    if (!form.startDate) errs.startDate = "Start date is required";
    if (!form.endDate) errs.endDate = "End date is required";
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      errs.endDate = "End date must be on or after start date";
    }
    if (!form.reason.trim()) errs.reason = "Please provide a reason";

    // Balance check
    if (form.leaveTypeId && form.startDate && form.endDate) {
      const remaining = getBalance(form.leaveTypeId);
      if (remaining !== null) {
        const start = new Date(form.startDate);
        const end = new Date(form.endDate);
        const days = form.isHalfDay ? 0.5 : Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        if (days > remaining) errs.balance = `Not enough balance. Available: ${remaining} days`;
      }
    }
    return errs;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    addLeave({
      type: form.type,
      leaveTypeId: form.leaveTypeId,
      startDate: form.startDate,
      endDate: form.isHalfDay ? form.startDate : form.endDate,
      reason: form.reason.trim(),
      isHalfDay: form.isHalfDay,
    });
    navigate(-1);
  }

  function handleTypeChange(typeId) {
    const lt = activeTypes.find((t) => t.id === typeId);
    setForm((prev) => ({ ...prev, leaveTypeId: typeId, type: lt?.name || "" }));
    if (errors.type) setErrors((prev) => ({ ...prev, type: undefined }));
  }

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    if (errors.balance) setErrors((prev) => ({ ...prev, balance: undefined }));
  }

  const holidayWarningStart = form.startDate ? isHoliday(form.startDate) : null;
  const holidayWarningEnd = form.endDate ? isHoliday(form.endDate) : null;
  const selectedBalance = form.leaveTypeId ? getBalance(form.leaveTypeId) : null;

  return (
    <div className="animate-fade-in max-w-2xl">
      <div className="mb-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-theme-secondary hover:text-primary-400 transition-colors mb-3">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h2 className="text-2xl font-bold text-theme-primary">Apply for Leave</h2>
        <p className="mt-1 text-sm text-theme-secondary">Fill in the details below to submit a new leave request</p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 space-y-5">
        {/* Leave Type */}
        <div>
          <label className="block text-sm font-medium text-theme-secondary mb-1.5">Leave Type</label>
          <select
            value={form.leaveTypeId}
            onChange={(e) => handleTypeChange(e.target.value)}
            className={`input-field ${errors.type ? "input-error" : ""}`}
          >
            <option value="">Select leave type</option>
            {activeTypes.map((lt) => (
              <option key={lt.id} value={lt.id}>{lt.name} ({getBalance(lt.id) ?? lt.defaultDays} days available)</option>
            ))}
          </select>
          {errors.type && <p className="mt-1 text-xs text-rose-400">{errors.type}</p>}
          {selectedBalance !== null && (
            <p className="mt-1 text-xs text-theme-muted">Available balance: <span className="font-semibold text-primary-400">{selectedBalance} days</span></p>
          )}
        </div>

        {/* Half Day Toggle */}
        <div className="flex items-center gap-3">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={form.isHalfDay}
              onChange={(e) => handleChange("isHalfDay", e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 rounded-full bg-slate-600 peer-checked:bg-primary-500 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
          </label>
          <span className="text-sm text-theme-secondary flex items-center gap-1.5">
            <Clock className="w-4 h-4" /> Half-day leave
          </span>
        </div>

        {/* Dates */}
        <div className={`grid grid-cols-1 gap-4 ${form.isHalfDay ? "" : "sm:grid-cols-2"}`}>
          <div>
            <label className="block text-sm font-medium text-theme-secondary mb-1.5">
              {form.isHalfDay ? "Date" : "Start Date"}
            </label>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => handleChange("startDate", e.target.value)}
              className={`input-field ${errors.startDate ? "input-error" : ""}`}
            />
            {errors.startDate && <p className="mt-1 text-xs text-rose-400">{errors.startDate}</p>}
            {holidayWarningStart && (
              <p className="mt-1 text-xs text-amber-400">⚠ {holidayWarningStart.name} is a holiday on this date</p>
            )}
          </div>
          {!form.isHalfDay && (
            <div>
              <label className="block text-sm font-medium text-theme-secondary mb-1.5">End Date</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => handleChange("endDate", e.target.value)}
                className={`input-field ${errors.endDate ? "input-error" : ""}`}
              />
              {errors.endDate && <p className="mt-1 text-xs text-rose-400">{errors.endDate}</p>}
              {holidayWarningEnd && (
                <p className="mt-1 text-xs text-amber-400">⚠ {holidayWarningEnd.name} is a holiday on this date</p>
              )}
            </div>
          )}
        </div>

        {/* Reason */}
        <div>
          <label className="block text-sm font-medium text-theme-secondary mb-1.5">Reason</label>
          <textarea
            rows={4}
            value={form.reason}
            onChange={(e) => handleChange("reason", e.target.value)}
            placeholder="Describe the reason for your leave..."
            className={`input-field resize-none ${errors.reason ? "input-error" : ""}`}
          />
          {errors.reason && <p className="mt-1 text-xs text-rose-400">{errors.reason}</p>}
        </div>

        {errors.balance && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3">
            <p className="text-sm text-rose-400">{errors.balance}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button type="submit" className="btn-primary inline-flex items-center gap-2">
            <Send className="w-4 h-4" /> Submit Request
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
