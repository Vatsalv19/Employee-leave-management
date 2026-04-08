import { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
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
import { auth } from "../lib/firebase";
import * as firestoreService from "../lib/firestore";

const AppContext = createContext(null);

function getFirebaseAuthErrorMessage(errorCode) {
  switch (errorCode) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Invalid email or password. If you're a new user, please register first.";
    case "auth/email-already-in-use":
      return "Email already registered";
    case "auth/weak-password":
      return "Password should be at least 6 characters";
    case "auth/invalid-email":
      return "Please enter a valid email address";
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later";
    case "auth/configuration-not-found":
      return "Firebase Auth not configured. Please enable Email/Password sign-in in Firebase Console.";
    case "auth/network-request-failed":
      return "Network error. Please check your internet connection.";
    case "auth/operation-not-allowed":
      return "Email/Password sign-in is not enabled. Please enable it in Firebase Console.";
    default:
      return "Something went wrong. Please try again";
  }
}

function buildUserFromFirebase(firebaseUser) {
  const displayName = (firebaseUser.displayName || "").trim();
  const [firstFromName = "", ...rest] = displayName.split(" ").filter(Boolean);
  const lastFromName = rest.join(" ");
  const emailPrefix = (firebaseUser.email || "user").split("@")[0] || "user";

  return {
    id: `user-${Date.now()}`,
    firstName: firstFromName || emailPrefix,
    lastName: lastFromName || "User",
    email: firebaseUser.email || "",
    phone: "",
    role: "employee",
    departmentId: defaultDepartments[0]?.id || "dept-1",
    managerId: "user-7",
    avatar: ((firstFromName || emailPrefix)[0] || "U").toUpperCase() + (lastFromName[0] || "S").toUpperCase(),
    joinedDate: new Date().toISOString().split("T")[0],
    isActive: true,
  };
}

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);
  const [allUsers, setAllUsers] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [leaveTypesState, setLeaveTypes] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [settings, setSettings] = useState(defaultSettings);
  const [toasts, setToasts] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ── Toast ──
  const addToast = useCallback((message, type = "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ── Load Initial Data from Firestore ──
  const loadData = useCallback(async () => {
    try {
      // First seed if empty
      await firestoreService.seedInitialData({
        users: defaultUsers,
        departments: defaultDepartments,
        leaveTypes: defaultLeaveTypes,
        holidays: defaultHolidays,
        leaveBalances: defaultBalances,
        leaveRequests: initialLeaveRequests,
        notifications: initialNotifications,
        policies: defaultPolicies,
        settings: defaultSettings,
      });

      // Load all data using direct queries (not subscriptions)
      const [users, requests, balances, hols, depts, types, pols, sett] = await Promise.all([
        firestoreService.getAllUsers(),
        firestoreService.getAllLeaveRequests(),
        firestoreService.getAllLeaveBalances(),
        firestoreService.getAllHolidays(),
        firestoreService.getAllDepartments(),
        firestoreService.getAllLeaveTypes(),
        firestoreService.getAllPolicies(),
        firestoreService.getSettings(),
      ]);

      setAllUsers(users);
      setLeaveRequests(requests);
      setLeaveBalances(balances);
      setHolidays(hols);
      setDepartments(depts);
      setLeaveTypes(types);
      setPolicies(pols);
      if (sett) setSettings(sett);

      setDataLoading(false);
    } catch (error) {
      console.error("Error loading Firestore data:", error);
      
      // If Firestore is not configured, show a helpful error
      if (error.message?.includes("CONFIGURATION_NOT_FOUND") || error.message?.includes("not been used")) {
        addToast("Please enable Firestore in Firebase Console first", "error");
      }
      
      setDataLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        if (!firebaseUser?.email) {
          setCurrentUser(null);
          setAuthLoading(false);
          setNotifications([]);
          return;
        }

        try {
          // First check if user exists in Firestore
          let existingUser = await firestoreService.getUserByEmail(firebaseUser.email);
          
          if (existingUser) {
            setCurrentUser(existingUser);
            // Load notifications for this user (direct query, not subscription)
            const notifs = await firestoreService.getNotificationsByUser(existingUser.id);
            setNotifications(notifs);
          } else {
            // Create new user in Firestore
            const newUser = buildUserFromFirebase(firebaseUser);
            await firestoreService.createUser(newUser);
            
            // Create default leave balances for new user
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
            await firestoreService.createMultipleBalances(newBalances);
            
            setCurrentUser(newUser);
            setNotifications([]);
          }
        } catch (error) {
          console.error("Error handling auth state change:", error);
        }

        setAuthLoading(false);
      },
      () => {
        setCurrentUser(null);
        setAuthLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  // ── Auth ──
  const login = useCallback(async (email, password) => {
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);

      const existing = await firestoreService.getUserByEmail(credential.user.email);
      if (existing && !existing.isActive) {
        await signOut(auth);
        addToast("Your account is inactive. Please contact admin", "error");
        return null;
      }

      const appUser = existing || buildUserFromFirebase(credential.user);
      if (!existing) {
        await firestoreService.createUser(appUser);
        // Create default leave balances
        const newBalances = defaultLeaveTypes.filter(lt => lt.id !== "lt-7" && lt.id !== "lt-8").map((lt, i) => ({
          id: `lb-new-${Date.now()}-${i}`,
          userId: appUser.id,
          leaveTypeId: lt.id,
          year: 2026,
          totalAllocated: lt.defaultDays,
          used: 0,
          pending: 0,
          carriedOver: 0,
        }));
        await firestoreService.createMultipleBalances(newBalances);
      }

      setCurrentUser(appUser);
      
      // Load notifications for this user (direct query, not subscription)
      const notifs = await firestoreService.getNotificationsByUser(appUser.id);
      setNotifications(notifs);
      
      addToast(`Welcome back, ${appUser.firstName}!`, "success");
      return appUser;
    } catch (error) {
      console.error("Login error:", error);
      
      // Check for configuration errors
      if (error.message?.includes("CONFIGURATION_NOT_FOUND") || error.code === 400) {
        addToast("Firebase Auth not enabled. Please enable Email/Password sign-in in Firebase Console.", "error");
        console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.error("FIREBASE AUTH SETUP REQUIRED:");
        console.error("1. Go to: https://console.firebase.google.com/project/employee-leave-managemen-6d86c/authentication/providers");
        console.error("2. Click on 'Email/Password'");
        console.error("3. Enable 'Email/Password' sign-in");
        console.error("4. Click 'Save'");
        console.error("5. Then register a new user through the Register page");
        console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      } else {
        addToast(getFirebaseAuthErrorMessage(error.code), "error");
      }
      return null;
    }
  }, [addToast]);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setNotifications([]);
      addToast("Logged out successfully", "info");
    } catch {
      addToast("Logout failed. Please try again", "error");
    }
  }, [addToast]);

  const register = useCallback(async (userData) => {
    const exists = await firestoreService.getUserByEmail(userData.email);
    if (exists) {
      addToast("Email already registered", "error");
      return null;
    }

    try {
      const credential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
      await updateProfile(credential.user, {
        displayName: `${userData.firstName} ${userData.lastName}`.trim(),
      });

      const newUser = {
        id: `user-${Date.now()}`,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone || "",
        role: "employee",
        departmentId: userData.departmentId,
        managerId: "user-7",
        avatar: `${userData.firstName[0]}${userData.lastName[0]}`.toUpperCase(),
        joinedDate: new Date().toISOString().split("T")[0],
        isActive: true,
      };

      // Save user to Firestore
      await firestoreService.createUser(newUser);

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
      await firestoreService.createMultipleBalances(newBalances);

      // Firebase signs user in after create; sign out to preserve existing app flow.
      await signOut(auth);
      setCurrentUser(null);

      addToast("Registration successful! Please login.", "success");
      return newUser;
    } catch (error) {
      console.error("Registration error:", error);
      
      // Check for configuration errors
      if (error.message?.includes("CONFIGURATION_NOT_FOUND") || error.code === 400) {
        addToast("Firebase Auth not enabled. Please enable Email/Password sign-in in Firebase Console.", "error");
        console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.error("FIREBASE AUTH SETUP REQUIRED:");
        console.error("1. Go to: https://console.firebase.google.com/project/employee-leave-managemen-6d86c/authentication/providers");
        console.error("2. Click on 'Email/Password'");
        console.error("3. Enable 'Email/Password' sign-in");
        console.error("4. Click 'Save'");
        console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      } else {
        addToast(getFirebaseAuthErrorMessage(error.code), "error");
      }
      return null;
    }
  }, [addToast]);

  const resetPassword = useCallback(async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      addToast("Password reset link sent", "success");
      return true;
    } catch (error) {
      addToast(getFirebaseAuthErrorMessage(error.code), "error");
      return false;
    }
  }, [addToast]);

  // ── Notifications ──
  const addNotification = useCallback(async (userId, type, title, message) => {
    const notif = {
      userId,
      type,
      title,
      message,
      isRead: false,
      createdAt: new Date().toISOString(),
      
    };
    try {
      await firestoreService.createNotification(notif);
    } catch (error) {
      console.error("Error creating notification:", error);
    }
  }, []);

  const markNotificationRead = useCallback(async (id) => {
    try {
      await firestoreService.updateNotification(id, { isRead: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  }, []);

  const markAllNotificationsRead = useCallback(async () => {
    if (!currentUser) return;
    try {
      await firestoreService.markAllNotificationsRead(currentUser.id);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  }, [currentUser]);

  const deleteNotification = useCallback(async (id) => {
    try {
      await firestoreService.deleteNotification(id);
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  }, []);

  // ── Leave Management ──
  const addLeave = useCallback(async (leaveData) => {
    const start = new Date(leaveData.startDate);
    const end = new Date(leaveData.endDate);
    const totalDays = leaveData.isHalfDay ? 0.5 : Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    const newLeave = {
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

    try {
      await firestoreService.createLeaveRequest(newLeave);

      // Update pending balance
      const userBalance = leaveBalances.find(
        (b) => b.userId === currentUser.id && b.leaveTypeId === leaveData.leaveTypeId && b.year === 2026
      );
      if (userBalance) {
        await firestoreService.updateLeaveBalance(userBalance.id, {
          pending: userBalance.pending + totalDays,
        });
      }

      // Notify admin/manager
      await addNotification("user-7", "leave_request", "New Leave Request",
        `${getUserFullName(currentUser)} has requested ${leaveData.type} from ${leaveData.startDate} to ${leaveData.endDate}.`);
      if (currentUser.managerId && currentUser.managerId !== "user-7") {
        await addNotification(currentUser.managerId, "leave_request", "New Leave Request",
          `${getUserFullName(currentUser)} has requested ${leaveData.type} from ${leaveData.startDate} to ${leaveData.endDate}.`);
      }

      addToast("Leave request submitted successfully!", "success");
    } catch (error) {
      console.error("Error creating leave request:", error);
      addToast("Failed to submit leave request", "error");
    }
  }, [currentUser, leaveBalances, addToast, addNotification]);

  const approveLeave = useCallback(async (leaveId) => {
    const leave = leaveRequests.find((lr) => lr.id === leaveId);
    if (!leave) return;

    try {
      await firestoreService.updateLeaveRequest(leaveId, {
        status: "Approved",
        approvedBy: currentUser?.id,
      });

      // Update balance: move from pending to used
      const userBalance = leaveBalances.find(
        (b) => b.userId === leave.userId && b.leaveTypeId === leave.leaveTypeId && b.year === 2026
      );
      if (userBalance) {
        await firestoreService.updateLeaveBalance(userBalance.id, {
          used: userBalance.used + leave.totalDays,
          pending: Math.max(0, userBalance.pending - leave.totalDays),
        });
      }

      await addNotification(leave.userId, "leave_approved", "Leave Approved",
        `Your ${leave.type} from ${leave.startDate} to ${leave.endDate} has been approved.`);
      addToast("Leave request approved", "success");
    } catch (error) {
      console.error("Error approving leave:", error);
      addToast("Failed to approve leave request", "error");
    }
  }, [leaveRequests, leaveBalances, currentUser, addNotification, addToast]);

  const rejectLeave = useCallback(async (leaveId, reason = "") => {
    const leave = leaveRequests.find((lr) => lr.id === leaveId);
    if (!leave) return;

    try {
      await firestoreService.updateLeaveRequest(leaveId, {
        status: "Rejected",
        rejectionReason: reason || "Request denied by admin.",
      });

      // Remove from pending balance
      const userBalance = leaveBalances.find(
        (b) => b.userId === leave.userId && b.leaveTypeId === leave.leaveTypeId && b.year === 2026
      );
      if (userBalance) {
        await firestoreService.updateLeaveBalance(userBalance.id, {
          pending: Math.max(0, userBalance.pending - leave.totalDays),
        });
      }

      await addNotification(leave.userId, "leave_rejected", "Leave Rejected",
        `Your ${leave.type} from ${leave.startDate} to ${leave.endDate} has been rejected.${reason ? " Reason: " + reason : ""}`);
      addToast("Leave request rejected", "error");
    } catch (error) {
      console.error("Error rejecting leave:", error);
      addToast("Failed to reject leave request", "error");
    }
  }, [leaveRequests, leaveBalances, addNotification, addToast]);

  const cancelLeave = useCallback(async (leaveId) => {
    const leave = leaveRequests.find((lr) => lr.id === leaveId);
    if (!leave || leave.status !== "Pending") return;

    try {
      await firestoreService.deleteLeaveRequest(leaveId);

      // Remove from pending balance
      const userBalance = leaveBalances.find(
        (b) => b.userId === leave.userId && b.leaveTypeId === leave.leaveTypeId && b.year === 2026
      );
      if (userBalance) {
        await firestoreService.updateLeaveBalance(userBalance.id, {
          pending: Math.max(0, userBalance.pending - leave.totalDays),
        });
      }

      addToast("Leave request cancelled", "info");
    } catch (error) {
      console.error("Error cancelling leave:", error);
      addToast("Failed to cancel leave request", "error");
    }
  }, [leaveRequests, leaveBalances, addToast]);

  // ── User Management (Admin) ──
  const addUser = useCallback(async (userData) => {
    const exists = await firestoreService.getUserByEmail(userData.email);
    if (exists) { addToast("Email already exists", "error"); return null; }

    const newUser = {
      id: `user-${Date.now()}`,
      ...userData,
      avatar: `${userData.firstName[0]}${userData.lastName[0]}`.toUpperCase(),
      joinedDate: new Date().toISOString().split("T")[0],
      isActive: true,
    };

    try {
      await firestoreService.createUser(newUser);

      const newBalances = defaultLeaveTypes.filter(lt => lt.id !== "lt-7" && lt.id !== "lt-8").map((lt, i) => ({
        id: `lb-new-${Date.now()}-${i}`,
        userId: newUser.id,
        leaveTypeId: lt.id,
        year: 2026,
        totalAllocated: lt.defaultDays,
        used: 0, pending: 0, carriedOver: 0,
      }));
      await firestoreService.createMultipleBalances(newBalances);
      addToast("Employee added successfully", "success");
      return newUser;
    } catch (error) {
      console.error("Error adding user:", error);
      addToast("Failed to add employee", "error");
      return null;
    }
  }, [addToast]);

  const updateUser = useCallback(async (userId, updates) => {
    try {
      await firestoreService.updateUser(userId, updates);
      if (currentUser?.id === userId) {
        setCurrentUser((prev) => ({ ...prev, ...updates }));
      }
      addToast("Employee updated", "success");
    } catch (error) {
      console.error("Error updating user:", error);
      addToast("Failed to update employee", "error");
    }
  }, [currentUser, addToast]);

  const toggleUserActive = useCallback(async (userId) => {
    const user = allUsers.find((u) => u.id === userId);
    if (!user) return;

    try {
      await firestoreService.updateUser(userId, { isActive: !user.isActive });
      addToast("Employee status updated", "info");
    } catch (error) {
      console.error("Error toggling user status:", error);
      addToast("Failed to update employee status", "error");
    }
  }, [allUsers, addToast]);

  // ── Department Management ──
  const addDepartment = useCallback(async (dept) => {
    const newDept = { ...dept, isActive: true, employeeCount: 0 };
    try {
      const created = await firestoreService.createDepartment(newDept);
      addToast("Department created", "success");
      return created;
    } catch (error) {
      console.error("Error creating department:", error);
      addToast("Failed to create department", "error");
      return null;
    }
  }, [addToast]);

  const updateDepartment = useCallback(async (id, updates) => {
    try {
      await firestoreService.updateDepartment(id, updates);
      addToast("Department updated", "success");
    } catch (error) {
      console.error("Error updating department:", error);
      addToast("Failed to update department", "error");
    }
  }, [addToast]);

  const deleteDepartment = useCallback(async (id) => {
    try {
      await firestoreService.deleteDepartment(id);
      addToast("Department deleted", "info");
    } catch (error) {
      console.error("Error deleting department:", error);
      addToast("Failed to delete department", "error");
    }
  }, [addToast]);

  // ── Holiday Management ──
  const addHoliday = useCallback(async (hol) => {
    try {
      const created = await firestoreService.createHoliday(hol);
      addToast("Holiday added", "success");
      return created;
    } catch (error) {
      console.error("Error adding holiday:", error);
      addToast("Failed to add holiday", "error");
      return null;
    }
  }, [addToast]);

  const updateHoliday = useCallback(async (id, updates) => {
    try {
      await firestoreService.updateHoliday(id, updates);
      addToast("Holiday updated", "success");
    } catch (error) {
      console.error("Error updating holiday:", error);
      addToast("Failed to update holiday", "error");
    }
  }, [addToast]);

  const deleteHoliday = useCallback(async (id) => {
    try {
      await firestoreService.deleteHoliday(id);
      addToast("Holiday deleted", "info");
    } catch (error) {
      console.error("Error deleting holiday:", error);
      addToast("Failed to delete holiday", "error");
    }
  }, [addToast]);

  // ── Settings ──
  const updateSettings = useCallback(async (updates) => {
    try {
      await firestoreService.updateSettings(updates);
      addToast("Settings updated", "success");
    } catch (error) {
      console.error("Error updating settings:", error);
      addToast("Failed to update settings", "error");
    }
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

  const unreadNotificationCount = notifications.filter((n) => !n.isRead).length;

  const value = {
    // Auth
    currentUser, authLoading, dataLoading, login, logout, register, resetPassword,
    // Data
    allUsers, leaveRequests, leaveBalances, notifications,
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
