// ────────────────────────────────────────────────
// Firestore Service Layer for ELMS
// ────────────────────────────────────────────────

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

// Collection names
const COLLECTIONS = {
  USERS: "users",
  LEAVE_REQUESTS: "leaveRequests",
  LEAVE_BALANCES: "leaveBalances",
  NOTIFICATIONS: "notifications",
  HOLIDAYS: "holidays",
  DEPARTMENTS: "departments",
  LEAVE_TYPES: "leaveTypes",
  POLICIES: "policies",
  SETTINGS: "settings",
};

// ───────────────── USERS ─────────────────
export async function createUser(userData) {
  const userRef = doc(db, COLLECTIONS.USERS, userData.id);
  await setDoc(userRef, {
    ...userData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return userData;
}

export async function getUser(userId) {
  const userRef = doc(db, COLLECTIONS.USERS, userId);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() ? { id: userSnap.id, ...userSnap.data() } : null;
}

export async function getUserByEmail(email) {
  const q = query(collection(db, COLLECTIONS.USERS), where("email", "==", email));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() };
}

export async function getAllUsers() {
  const snapshot = await getDocs(collection(db, COLLECTIONS.USERS));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function updateUser(userId, updates) {
  const userRef = doc(db, COLLECTIONS.USERS, userId);
  await updateDoc(userRef, { ...updates, updatedAt: serverTimestamp() });
}

export function subscribeToUsers(callback) {
  return onSnapshot(collection(db, COLLECTIONS.USERS), (snapshot) => {
    const users = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    callback(users);
  });
}

// ───────────────── LEAVE REQUESTS ─────────────────
export async function createLeaveRequest(leaveData) {
  const docRef = await addDoc(collection(db, COLLECTIONS.LEAVE_REQUESTS), {
    ...leaveData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return { id: docRef.id, ...leaveData };
}

export async function getAllLeaveRequests() {
  const q = query(collection(db, COLLECTIONS.LEAVE_REQUESTS), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function updateLeaveRequest(leaveId, updates) {
  const leaveRef = doc(db, COLLECTIONS.LEAVE_REQUESTS, leaveId);
  await updateDoc(leaveRef, { ...updates, updatedAt: serverTimestamp() });
}

export async function deleteLeaveRequest(leaveId) {
  const leaveRef = doc(db, COLLECTIONS.LEAVE_REQUESTS, leaveId);
  await deleteDoc(leaveRef);
}

export function subscribeToLeaveRequests(callback) {
  const q = query(collection(db, COLLECTIONS.LEAVE_REQUESTS), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const requests = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    callback(requests);
  });
}

// ───────────────── LEAVE BALANCES ─────────────────
export async function createLeaveBalance(balanceData) {
  const docRef = await addDoc(collection(db, COLLECTIONS.LEAVE_BALANCES), {
    ...balanceData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return { id: docRef.id, ...balanceData };
}

export async function getLeaveBalancesByUser(userId, year = 2026) {
  const q = query(
    collection(db, COLLECTIONS.LEAVE_BALANCES),
    where("userId", "==", userId),
    where("year", "==", year)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function getAllLeaveBalances() {
  const snapshot = await getDocs(collection(db, COLLECTIONS.LEAVE_BALANCES));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function updateLeaveBalance(balanceId, updates) {
  const balanceRef = doc(db, COLLECTIONS.LEAVE_BALANCES, balanceId);
  await updateDoc(balanceRef, { ...updates, updatedAt: serverTimestamp() });
}

export async function createMultipleBalances(balances) {
  const batch = writeBatch(db);
  balances.forEach((balance) => {
    const docRef = doc(collection(db, COLLECTIONS.LEAVE_BALANCES));
    batch.set(docRef, { ...balance, id: docRef.id, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  });
  await batch.commit();
}

export function subscribeToLeaveBalances(callback) {
  return onSnapshot(collection(db, COLLECTIONS.LEAVE_BALANCES), (snapshot) => {
    const balances = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    callback(balances);
  });
}

// ───────────────── NOTIFICATIONS ─────────────────
export async function createNotification(notifData) {
  const docRef = await addDoc(collection(db, COLLECTIONS.NOTIFICATIONS), {
    ...notifData,
    createdAt: serverTimestamp(),
  });
  return { id: docRef.id, ...notifData };
}

export async function getNotificationsByUser(userId) {
  const q = query(
    collection(db, COLLECTIONS.NOTIFICATIONS),
    where("userId", "==", userId)
  );
  const snapshot = await getDocs(q);
  const notifications = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  // Sort client-side to avoid composite index requirement
  return notifications.sort((a, b) => {
    const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt) || new Date(0);
    const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt) || new Date(0);
    return dateB - dateA;
  });
}

export async function updateNotification(notifId, updates) {
  const notifRef = doc(db, COLLECTIONS.NOTIFICATIONS, notifId);
  await updateDoc(notifRef, updates);
}

export async function deleteNotification(notifId) {
  const notifRef = doc(db, COLLECTIONS.NOTIFICATIONS, notifId);
  await deleteDoc(notifRef);
}

export async function markAllNotificationsRead(userId) {
  const q = query(
    collection(db, COLLECTIONS.NOTIFICATIONS),
    where("userId", "==", userId),
    where("isRead", "==", false)
  );
  const snapshot = await getDocs(q);
  const batch = writeBatch(db);
  snapshot.docs.forEach((doc) => batch.update(doc.ref, { isRead: true }));
  await batch.commit();
}

export function subscribeToNotifications(userId, callback) {
  const q = query(
    collection(db, COLLECTIONS.NOTIFICATIONS),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    callback(notifications);
  });
}

// ───────────────── HOLIDAYS ─────────────────
export async function createHoliday(holidayData) {
  const docRef = await addDoc(collection(db, COLLECTIONS.HOLIDAYS), {
    ...holidayData,
    createdAt: serverTimestamp(),
  });
  return { id: docRef.id, ...holidayData };
}

export async function getAllHolidays() {
  const q = query(collection(db, COLLECTIONS.HOLIDAYS), orderBy("date"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function updateHoliday(holidayId, updates) {
  const holidayRef = doc(db, COLLECTIONS.HOLIDAYS, holidayId);
  await updateDoc(holidayRef, updates);
}

export async function deleteHoliday(holidayId) {
  const holidayRef = doc(db, COLLECTIONS.HOLIDAYS, holidayId);
  await deleteDoc(holidayRef);
}

export function subscribeToHolidays(callback) {
  const q = query(collection(db, COLLECTIONS.HOLIDAYS), orderBy("date"));
  return onSnapshot(q, (snapshot) => {
    const holidays = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    callback(holidays);
  });
}

// ───────────────── DEPARTMENTS ─────────────────
export async function createDepartment(deptData) {
  const docRef = await addDoc(collection(db, COLLECTIONS.DEPARTMENTS), {
    ...deptData,
    createdAt: serverTimestamp(),
  });
  return { id: docRef.id, ...deptData };
}

export async function getAllDepartments() {
  const snapshot = await getDocs(collection(db, COLLECTIONS.DEPARTMENTS));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function updateDepartment(deptId, updates) {
  const deptRef = doc(db, COLLECTIONS.DEPARTMENTS, deptId);
  await updateDoc(deptRef, updates);
}

export async function deleteDepartment(deptId) {
  const deptRef = doc(db, COLLECTIONS.DEPARTMENTS, deptId);
  await deleteDoc(deptRef);
}

export function subscribeToDepartments(callback) {
  return onSnapshot(collection(db, COLLECTIONS.DEPARTMENTS), (snapshot) => {
    const departments = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    callback(departments);
  });
}

// ───────────────── LEAVE TYPES ─────────────────
export async function createLeaveType(typeData) {
  const docRef = await addDoc(collection(db, COLLECTIONS.LEAVE_TYPES), {
    ...typeData,
    createdAt: serverTimestamp(),
  });
  return { id: docRef.id, ...typeData };
}

export async function getAllLeaveTypes() {
  const snapshot = await getDocs(collection(db, COLLECTIONS.LEAVE_TYPES));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function updateLeaveType(typeId, updates) {
  const typeRef = doc(db, COLLECTIONS.LEAVE_TYPES, typeId);
  await updateDoc(typeRef, updates);
}

export function subscribeToLeaveTypes(callback) {
  return onSnapshot(collection(db, COLLECTIONS.LEAVE_TYPES), (snapshot) => {
    const types = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    callback(types);
  });
}

// ───────────────── POLICIES ─────────────────
export async function getAllPolicies() {
  const snapshot = await getDocs(collection(db, COLLECTIONS.POLICIES));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function updatePolicy(policyId, updates) {
  const policyRef = doc(db, COLLECTIONS.POLICIES, policyId);
  await updateDoc(policyRef, updates);
}

export function subscribeToPolicies(callback) {
  return onSnapshot(collection(db, COLLECTIONS.POLICIES), (snapshot) => {
    const policies = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    callback(policies);
  });
}

// ───────────────── SETTINGS ─────────────────
const SETTINGS_DOC_ID = "company-settings";

export async function getSettings() {
  const settingsRef = doc(db, COLLECTIONS.SETTINGS, SETTINGS_DOC_ID);
  const settingsSnap = await getDoc(settingsRef);
  return settingsSnap.exists() ? settingsSnap.data() : null;
}

export async function updateSettings(updates) {
  const settingsRef = doc(db, COLLECTIONS.SETTINGS, SETTINGS_DOC_ID);
  await setDoc(settingsRef, { ...updates, updatedAt: serverTimestamp() }, { merge: true });
}

export function subscribeToSettings(callback) {
  const settingsRef = doc(db, COLLECTIONS.SETTINGS, SETTINGS_DOC_ID);
  return onSnapshot(settingsRef, (doc) => {
    callback(doc.exists() ? doc.data() : null);
  });
}

// ───────────────── DATA SEEDING ─────────────────
export async function seedInitialData(initialData) {
  try {
    // Check if data already exists
    const usersSnapshot = await getDocs(collection(db, COLLECTIONS.USERS));
    if (!usersSnapshot.empty) {
      console.log("Data already exists in Firestore, skipping seed");
      return false;
    }

    const batch = writeBatch(db);

    // Seed users
    initialData.users.forEach((user) => {
      const userRef = doc(db, COLLECTIONS.USERS, user.id);
      batch.set(userRef, { ...user, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    });

    // Seed departments
    initialData.departments.forEach((dept) => {
      const deptRef = doc(db, COLLECTIONS.DEPARTMENTS, dept.id);
      batch.set(deptRef, { ...dept, createdAt: serverTimestamp() });
    });

    // Seed leave types
    initialData.leaveTypes.forEach((lt) => {
      const ltRef = doc(db, COLLECTIONS.LEAVE_TYPES, lt.id);
      batch.set(ltRef, { ...lt, createdAt: serverTimestamp() });
    });

    // Seed holidays
    initialData.holidays.forEach((h) => {
      const hRef = doc(db, COLLECTIONS.HOLIDAYS, h.id);
      batch.set(hRef, { ...h, createdAt: serverTimestamp() });
    });

    // Seed leave balances
    initialData.leaveBalances.forEach((lb) => {
      const lbRef = doc(db, COLLECTIONS.LEAVE_BALANCES, lb.id);
      batch.set(lbRef, { ...lb, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    });

    // Seed leave requests
    initialData.leaveRequests.forEach((lr) => {
      const lrRef = doc(db, COLLECTIONS.LEAVE_REQUESTS, lr.id);
      batch.set(lrRef, { ...lr, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    });

    // Seed notifications
    initialData.notifications.forEach((n) => {
      const nRef = doc(db, COLLECTIONS.NOTIFICATIONS, n.id);
      batch.set(nRef, { ...n });
    });

    // Seed policies
    initialData.policies.forEach((p) => {
      const pRef = doc(db, COLLECTIONS.POLICIES, p.id);
      batch.set(pRef, { ...p, createdAt: serverTimestamp() });
    });

    // Seed settings
    const settingsRef = doc(db, COLLECTIONS.SETTINGS, SETTINGS_DOC_ID);
    batch.set(settingsRef, { ...initialData.settings, createdAt: serverTimestamp() });

    await batch.commit();
    console.log("Initial data seeded to Firestore");
    return true;
  } catch (error) {
    // Handle the case where Firestore is not yet configured
    if (error.code === 400 || error.message?.includes("CONFIGURATION_NOT_FOUND")) {
      console.error("Firestore is not configured. Please enable Firestore in your Firebase console:");
      console.error("1. Go to https://console.firebase.google.com/");
      console.error("2. Select your project: employee-leave-managemen-6d86c");
      console.error("3. Click on 'Firestore Database' in the sidebar");
      console.error("4. Click 'Create database'");
      console.error("5. Select 'Start in test mode' for development");
      console.error("6. Choose your preferred location and click 'Enable'");
    }
    throw error;
  }
}

export { COLLECTIONS };
