import { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  users as defaultUsers,
  initialLeaveRequests,
  leaveBalances as defaultBalances,
  initialNotifications,
  holidays as defaultHolidays,
  departments as defaultDepartments,
  leaveTypes as defaultLeaveTypes,
  leavePolicies as defaultPolicies,
  companySettings as defaultSettings,
  getDepartmentName,
  getUserFullName,
} from "../data/mockData";

const AppContext = createContext(null);

const STORAGE_KEYS = {
  USER: "elms_currentUser",
  LEAVES: "elms_leaveRequests",
  USERS: "elms_users",
  BALANCES: "elms_leaveBalances",
  NOTIFICATIONS: "elms_notifications",
  HOLIDAYS: "elms_holidays",
  DEPARTMENTS: "elms_departments",
  LEAVE_TYPES: "elms_leaveTypes",
  POLICIES: "elms_policies",
  SETTINGS: "elms_settings",
};

function load(key, fallback) {
  try {
    const s = localStorage.getItem(key);
    return s ? JSON.parse(s) : fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch { /* storage full */ }
}

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => load(STORAGE_KEYS.USER, null));
  const [allUsers, setAllUsers] = useState(() => load(STORAGE_KEYS.USERS, defaultUsers));
  const [leaveRequests, setLeaveRequests] = useState(() => load(STORAGE_KEYS.LEAVES, initialLeaveRequests));
  const [leaveBalances, setLeaveBalances] = useState(() => load(STORAGE_KEYS.BALANCES, defaultBalances));
  const [notifications, setNotifications] = useState(() => load(STORAGE_KEYS.NOTIFICATIONS, initialNotifications));
  const [holidays, setHolidays] = useState(() => load(STORAGE_KEYS.HOLIDAYS, defaultHolidays));
  const [departments, setDepartments] = useState(() => load(STORAGE_KEYS.DEPARTMENTS, defaultDepartments));
  const [leaveTypesState, setLeaveTypes] = useState(() => load(STORAGE_KEYS.LEAVE_TYPES, defaultLeaveTypes));
  const [policies, setPolicies] = useState(() => load(STORAGE_KEYS.POLICIES, defaultPolicies));
  const [settings, setSettings] = useState(() => load(STORAGE_KEYS.SETTINGS, defaultSettings));
  const [toasts, setToasts] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Persist
  useEffect(() => { save(STORAGE_KEYS.USER, currentUser); }, [currentUser]);
  useEffect(() => { save(STORAGE_KEYS.USERS, allUsers); }, [allUsers]);
  useEffect(() => { save(STORAGE_KEYS.LEAVES, leaveRequests); }, [leaveRequests]);
  useEffect(() => { save(STORAGE_KEYS.BALANCES, leaveBalances); }, [leaveBalances]);
  useEffect(() => { save(STORAGE_KEYS.NOTIFICATIONS, notifications); }, [notifications]);
  useEffect(() => { save(STORAGE_KEYS.HOLIDAYS, holidays); }, [holidays]);
  useEffect(() => { save(STORAGE_KEYS.DEPARTMENTS, departments); }, [departments]);
  useEffect(() => { save(STORAGE_KEYS.LEAVE_TYPES, leaveTypesState); }, [leaveTypesState]);
  useEffect(() => { save(STORAGE_KEYS.POLICIES, policies); }, [policies]);
  useEffect(() => { save(STORAGE_KEYS.SETTINGS, settings); }, [settings]);

  // ── Toast ──
  const addToast = useCallback((message, type = "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ── Auth ──
  const login = useCallback((email, password) => {
    const user = allUsers.find((u) => u.email === email && u.password === password && u.isActive);
    if (user) {
      setCurrentUser(user);
      addToast(`Welcome back, ${user.firstName}!`, "success");
      return user;
    }
    addToast("Invalid email or password", "error");
    return null;
  }, [allUsers, addToast]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEYS.USER);
    addToast("Logged out successfully", "info");
  }, [addToast]);

  const register = useCallback((userData) => {
    const exists = allUsers.find((u) => u.email === userData.email);
    if (exists) {
      addToast("Email already registered", "error");
      return null;
    }
    const newUser = {
      id: `user-${Date.now()}`,
      ...userData,
      role: "employee",
      avatar: `${userData.firstName[0]}${userData.lastName[0]}`.toUpperCase(),
      joinedDate: new Date().toISOString().split("T")[0],
      isActive: true,
      managerId: "user-7",
    };
    setAllUsers((prev) => [...prev, newUser]);
    // Create default balances for new user
    const newBalances = defaultLeaveTypes.filter(lt => lt.id !== "lt-7" && lt.id !== "lt-8").map((lt, i) => ({
      id: `lb-new-${Date.now()}-${i}`,
      userId: newUser.id,
      leaveTypeId: lt.id,
      year: 2026,
      totalAllocated: lt.defaultDays,
      used: 0,
      pending: 0,
      carriedOver: 0,
    }));
    setLeaveBalances((prev) => [...prev, ...newBalances]);
    addToast("Registration successful! Please login.", "success");
    return newUser;
  }, [allUsers, addToast]);

  // ── Notifications ──
  const addNotification = useCallback((userId, type, title, message) => {
    const notif = {
      id: `notif-${Date.now()}`,
      userId,
      type,
      title,
      message,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [notif, ...prev]);
  }, []);

  const markNotificationRead = useCallback((id) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    if (!currentUser) return;
    setNotifications((prev) => prev.map((n) => n.userId === currentUser.id ? { ...n, isRead: true } : n));
  }, [currentUser]);

  const deleteNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // ── Leave Management ──
  const addLeave = useCallback((leaveData) => {
    const start = new Date(leaveData.startDate);
    const end = new Date(leaveData.endDate);
    const totalDays = leaveData.isHalfDay ? 0.5 : Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    const newLeave = {
      id: `lr-${Date.now()}`,
      userId: currentUser.id,
      userName: getUserFullName(currentUser),
      department: getDepartmentName(currentUser.departmentId),
      type: leaveData.type,
      leaveTypeId: leaveData.leaveTypeId,
      startDate: leaveData.startDate,
      endDate: leaveData.endDate,
      totalDays,
      reason: leaveData.reason,
      status: "Pending",
      appliedOn: new Date().toISOString().split("T")[0],
      isHalfDay: leaveData.isHalfDay || false,
      approvedBy: null,
      rejectionReason: null,
    };
    setLeaveRequests((prev) => [newLeave, ...prev]);

    // Update pending balance
    setLeaveBalances((prev) => prev.map((b) => {
      if (b.userId === currentUser.id && b.leaveTypeId === leaveData.leaveTypeId && b.year === 2026) {
        return { ...b, pending: b.pending + totalDays };
      }
      return b;
    }));

    // Notify admin/manager
    addNotification("user-7", "leave_request", "New Leave Request",
      `${getUserFullName(currentUser)} has requested ${leaveData.type} from ${leaveData.startDate} to ${leaveData.endDate}.`);
    if (currentUser.managerId && currentUser.managerId !== "user-7") {
      addNotification(currentUser.managerId, "leave_request", "New Leave Request",
        `${getUserFullName(currentUser)} has requested ${leaveData.type} from ${leaveData.startDate} to ${leaveData.endDate}.`);
    }

    addToast("Leave request submitted successfully!", "success");
  }, [currentUser, addToast, addNotification]);

  const approveLeave = useCallback((leaveId) => {
    const leave = leaveRequests.find((lr) => lr.id === leaveId);
    if (!leave) return;

    setLeaveRequests((prev) => prev.map((lr) =>
      lr.id === leaveId ? { ...lr, status: "Approved", approvedBy: currentUser?.id } : lr
    ));

    // Update balance: move from pending to used
    setLeaveBalances((prev) => prev.map((b) => {
      if (b.userId === leave.userId && b.leaveTypeId === leave.leaveTypeId && b.year === 2026) {
        return { ...b, used: b.used + leave.totalDays, pending: Math.max(0, b.pending - leave.totalDays) };
      }
      return b;
    }));

    addNotification(leave.userId, "leave_approved", "Leave Approved",
      `Your ${leave.type} from ${leave.startDate} to ${leave.endDate} has been approved.`);
    addToast("Leave request approved", "success");
  }, [leaveRequests, currentUser, addNotification, addToast]);

  const rejectLeave = useCallback((leaveId, reason = "") => {
    const leave = leaveRequests.find((lr) => lr.id === leaveId);
    if (!leave) return;

    setLeaveRequests((prev) => prev.map((lr) =>
      lr.id === leaveId ? { ...lr, status: "Rejected", rejectionReason: reason || "Request denied by admin." } : lr
    ));

    // Remove from pending balance
    setLeaveBalances((prev) => prev.map((b) => {
      if (b.userId === leave.userId && b.leaveTypeId === leave.leaveTypeId && b.year === 2026) {
        return { ...b, pending: Math.max(0, b.pending - leave.totalDays) };
      }
      return b;
    }));

    addNotification(leave.userId, "leave_rejected", "Leave Rejected",
      `Your ${leave.type} from ${leave.startDate} to ${leave.endDate} has been rejected.${reason ? " Reason: " + reason : ""}`);
    addToast("Leave request rejected", "error");
  }, [leaveRequests, addNotification, addToast]);

  const cancelLeave = useCallback((leaveId) => {
    const leave = leaveRequests.find((lr) => lr.id === leaveId);
    if (!leave || leave.status !== "Pending") return;

    setLeaveRequests((prev) => prev.filter((lr) => lr.id !== leaveId));

    setLeaveBalances((prev) => prev.map((b) => {
      if (b.userId === leave.userId && b.leaveTypeId === leave.leaveTypeId && b.year === 2026) {
        return { ...b, pending: Math.max(0, b.pending - leave.totalDays) };
      }
      return b;
    }));

    addToast("Leave request cancelled", "info");
  }, [leaveRequests, addToast]);

  // ── User Management (Admin) ──
  const addUser = useCallback((userData) => {
    const exists = allUsers.find((u) => u.email === userData.email);
    if (exists) { addToast("Email already exists", "error"); return null; }

    const newUser = {
      id: `user-${Date.now()}`,
      ...userData,
      avatar: `${userData.firstName[0]}${userData.lastName[0]}`.toUpperCase(),
      joinedDate: new Date().toISOString().split("T")[0],
      isActive: true,
    };
    setAllUsers((prev) => [...prev, newUser]);

    const newBalances = defaultLeaveTypes.filter(lt => lt.id !== "lt-7" && lt.id !== "lt-8").map((lt, i) => ({
      id: `lb-new-${Date.now()}-${i}`,
      userId: newUser.id,
      leaveTypeId: lt.id,
      year: 2026,
      totalAllocated: lt.defaultDays,
      used: 0, pending: 0, carriedOver: 0,
    }));
    setLeaveBalances((prev) => [...prev, ...newBalances]);
    addToast("Employee added successfully", "success");
    return newUser;
  }, [allUsers, addToast]);

  const updateUser = useCallback((userId, updates) => {
    setAllUsers((prev) => prev.map((u) => u.id === userId ? { ...u, ...updates } : u));
    if (currentUser?.id === userId) {
      setCurrentUser((prev) => ({ ...prev, ...updates }));
    }
    addToast("Employee updated", "success");
  }, [currentUser, addToast]);

  const toggleUserActive = useCallback((userId) => {
    setAllUsers((prev) => prev.map((u) => u.id === userId ? { ...u, isActive: !u.isActive } : u));
    addToast("Employee status updated", "info");
  }, [addToast]);

  // ── Department Management ──
  const addDepartment = useCallback((dept) => {
    const newDept = { id: `dept-${Date.now()}`, ...dept, isActive: true, employeeCount: 0 };
    setDepartments((prev) => [...prev, newDept]);
    addToast("Department created", "success");
    return newDept;
  }, [addToast]);

  const updateDepartment = useCallback((id, updates) => {
    setDepartments((prev) => prev.map((d) => d.id === id ? { ...d, ...updates } : d));
    addToast("Department updated", "success");
  }, [addToast]);

  const deleteDepartment = useCallback((id) => {
    setDepartments((prev) => prev.filter((d) => d.id !== id));
    addToast("Department deleted", "info");
  }, [addToast]);

  // ── Holiday Management ──
  const addHoliday = useCallback((hol) => {
    const newHol = { id: `hol-${Date.now()}`, ...hol };
    setHolidays((prev) => [...prev, newHol].sort((a, b) => a.date.localeCompare(b.date)));
    addToast("Holiday added", "success");
    return newHol;
  }, [addToast]);

  const updateHoliday = useCallback((id, updates) => {
    setHolidays((prev) => prev.map((h) => h.id === id ? { ...h, ...updates } : h));
    addToast("Holiday updated", "success");
  }, [addToast]);

  const deleteHoliday = useCallback((id) => {
    setHolidays((prev) => prev.filter((h) => h.id !== id));
    addToast("Holiday deleted", "info");
  }, [addToast]);

  // ── Settings ──
  const updateSettings = useCallback((updates) => {
    setSettings((prev) => ({ ...prev, ...updates }));
    addToast("Settings updated", "success");
  }, [addToast]);

  // ── Computed ──
  const userLeaves = currentUser
    ? leaveRequests.filter((lr) => lr.userId === currentUser.id)
    : [];

  const userBalances = currentUser
    ? leaveBalances.filter((b) => b.userId === currentUser.id && b.year === 2026)
    : [];

  const totalBalance = userBalances.reduce((sum, b) => sum + b.totalAllocated + b.carriedOver, 0);
  const usedLeaves = userBalances.reduce((sum, b) => sum + b.used, 0);
  const pendingLeaves = userBalances.reduce((sum, b) => sum + b.pending, 0);
  const remainingLeaves = totalBalance - usedLeaves - pendingLeaves;

  const userNotifications = currentUser
    ? notifications.filter((n) => n.userId === currentUser.id)
    : [];
  const unreadNotificationCount = userNotifications.filter((n) => !n.isRead).length;

  const value = {
    // Auth
    currentUser, login, logout, register,
    // Data
    allUsers, leaveRequests, leaveBalances, notifications: userNotifications,
    holidays, departments, leaveTypes: leaveTypesState, policies, settings,
    // Leave
    userLeaves, userBalances, totalBalance, usedLeaves, pendingLeaves, remainingLeaves,
    addLeave, approveLeave, rejectLeave, cancelLeave,
    // Users
    addUser, updateUser, toggleUserActive,
    // Departments
    addDepartment, updateDepartment, deleteDepartment,
    // Holidays
    addHoliday, updateHoliday, deleteHoliday,
    // Notifications
    unreadNotificationCount, markNotificationRead, markAllNotificationsRead, deleteNotification,
    // Settings
    updateSettings,
    // Toast
    toasts, addToast, removeToast,
    // UI
    sidebarOpen, setSidebarOpen,
    // Helpers
    getDepartmentName, getUserFullName,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within an AppProvider");
  return context;
}
