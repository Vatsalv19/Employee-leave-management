// ──────────────────────────────────────────────
// ELMS — Expanded Mock Data for Frontend Prototype
// ──────────────────────────────────────────────

export const roles = [
  { id: "role-1", name: "admin", permissions: ["all"] },
  { id: "role-2", name: "manager", permissions: ["approve_leave", "view_team", "view_reports"] },
  { id: "role-3", name: "employee", permissions: ["apply_leave", "view_own"] },
];

export const departments = [
  { id: "dept-1", name: "Engineering", description: "Software development & architecture", headId: "user-3", isActive: true, employeeCount: 3 },
  { id: "dept-2", name: "Design", description: "UI/UX design & branding", headId: "user-5", isActive: true, employeeCount: 2 },
  { id: "dept-3", name: "Human Resources", description: "People operations & talent management", headId: "user-7", isActive: true, employeeCount: 2 },
  { id: "dept-4", name: "Marketing", description: "Growth, content & digital marketing", headId: null, isActive: true, employeeCount: 1 },
  { id: "dept-5", name: "Finance", description: "Accounting, budgeting & financial planning", headId: null, isActive: true, employeeCount: 1 },
];

export const leaveTypes = [
  { id: "lt-1", name: "Sick Leave", description: "For illness or medical appointments", color: "#f43f5e", defaultDays: 12, isPaid: true, requiresDocument: true, isActive: true },
  { id: "lt-2", name: "Casual Leave", description: "For personal reasons", color: "#6366f1", defaultDays: 10, isPaid: true, requiresDocument: false, isActive: true },
  { id: "lt-3", name: "Annual Leave", description: "Planned annual vacation", color: "#10b981", defaultDays: 15, isPaid: true, requiresDocument: false, isActive: true },
  { id: "lt-4", name: "Maternity Leave", description: "For expecting mothers", color: "#ec4899", defaultDays: 180, isPaid: true, requiresDocument: true, isActive: true },
  { id: "lt-5", name: "Paternity Leave", description: "For new fathers", color: "#8b5cf6", defaultDays: 15, isPaid: true, requiresDocument: true, isActive: true },
  { id: "lt-6", name: "Bereavement Leave", description: "Due to loss of a family member", color: "#64748b", defaultDays: 5, isPaid: true, requiresDocument: false, isActive: true },
  { id: "lt-7", name: "Comp Off", description: "Compensatory off for extra work", color: "#f59e0b", defaultDays: 0, isPaid: true, requiresDocument: false, isActive: true },
  { id: "lt-8", name: "Unpaid Leave", description: "Leave without pay", color: "#94a3b8", defaultDays: 0, isPaid: false, requiresDocument: false, isActive: true },
];

export const users = [
  {
    id: "user-1", firstName: "Vatsal", lastName: "Shukla", email: "vatsal@company.com", password: "password123",
    phone: "+91 98765 43210", role: "employee", departmentId: "dept-1", managerId: "user-3",
    avatar: "VS", joinedDate: "2024-06-15", isActive: true,
  },
  {
    id: "user-2", firstName: "Priya", lastName: "Sharma", email: "priya@company.com", password: "password123",
    phone: "+91 98765 43211", role: "employee", departmentId: "dept-2", managerId: "user-5",
    avatar: "PS", joinedDate: "2024-03-10", isActive: true,
  },
  {
    id: "user-3", firstName: "Rahul", lastName: "Kumar", email: "rahul@company.com", password: "password123",
    phone: "+91 98765 43212", role: "manager", departmentId: "dept-1", managerId: "user-7",
    avatar: "RK", joinedDate: "2023-01-20", isActive: true,
  },
  {
    id: "user-4", firstName: "Ananya", lastName: "Patel", email: "ananya@company.com", password: "password123",
    phone: "+91 98765 43213", role: "employee", departmentId: "dept-1", managerId: "user-3",
    avatar: "AP", joinedDate: "2025-01-05", isActive: true,
  },
  {
    id: "user-5", firstName: "Sneha", lastName: "Reddy", email: "sneha@company.com", password: "password123",
    phone: "+91 98765 43214", role: "manager", departmentId: "dept-2", managerId: "user-7",
    avatar: "SR", joinedDate: "2023-06-01", isActive: true,
  },
  {
    id: "user-6", firstName: "Arjun", lastName: "Mehta", email: "arjun@company.com", password: "password123",
    phone: "+91 98765 43215", role: "employee", departmentId: "dept-4", managerId: "user-7",
    avatar: "AM", joinedDate: "2025-02-14", isActive: true,
  },
  {
    id: "user-7", firstName: "Admin", lastName: "User", email: "admin@company.com", password: "admin123",
    phone: "+91 98765 43216", role: "admin", departmentId: "dept-3", managerId: null,
    avatar: "AU", joinedDate: "2022-01-01", isActive: true,
  },
  {
    id: "user-8", firstName: "Kavita", lastName: "Singh", email: "kavita@company.com", password: "password123",
    phone: "+91 98765 43217", role: "employee", departmentId: "dept-5", managerId: "user-7",
    avatar: "KS", joinedDate: "2024-09-01", isActive: true,
  },
  {
    id: "user-9", firstName: "Deepak", lastName: "Verma", email: "deepak@company.com", password: "password123",
    phone: "+91 98765 43218", role: "employee", departmentId: "dept-3", managerId: "user-7",
    avatar: "DV", joinedDate: "2024-11-01", isActive: false,
  },
];

// Helper to get department name for a user
export function getDepartmentName(departmentId) {
  return departments.find(d => d.id === departmentId)?.name || "Unknown";
}

export function getUserFullName(user) {
  return `${user.firstName} ${user.lastName}`;
}

// Leave Balances for 2026 — per user per leave type
export const leaveBalances = [
  // Vatsal (user-1)
  { id: "lb-1", userId: "user-1", leaveTypeId: "lt-1", year: 2026, totalAllocated: 12, used: 3, pending: 0, carriedOver: 0 },
  { id: "lb-2", userId: "user-1", leaveTypeId: "lt-2", year: 2026, totalAllocated: 10, used: 1, pending: 0, carriedOver: 2 },
  { id: "lb-3", userId: "user-1", leaveTypeId: "lt-3", year: 2026, totalAllocated: 15, used: 0, pending: 5, carriedOver: 3 },
  { id: "lb-4", userId: "user-1", leaveTypeId: "lt-7", year: 2026, totalAllocated: 2, used: 1, pending: 0, carriedOver: 0 },
  // Priya (user-2)
  { id: "lb-5", userId: "user-2", leaveTypeId: "lt-1", year: 2026, totalAllocated: 12, used: 2, pending: 0, carriedOver: 0 },
  { id: "lb-6", userId: "user-2", leaveTypeId: "lt-2", year: 2026, totalAllocated: 10, used: 0, pending: 0, carriedOver: 1 },
  { id: "lb-7", userId: "user-2", leaveTypeId: "lt-3", year: 2026, totalAllocated: 15, used: 5, pending: 5, carriedOver: 0 },
  // Rahul (user-3)
  { id: "lb-8", userId: "user-3", leaveTypeId: "lt-1", year: 2026, totalAllocated: 12, used: 1, pending: 0, carriedOver: 0 },
  { id: "lb-9", userId: "user-3", leaveTypeId: "lt-2", year: 2026, totalAllocated: 10, used: 3, pending: 0, carriedOver: 2 },
  { id: "lb-10", userId: "user-3", leaveTypeId: "lt-3", year: 2026, totalAllocated: 15, used: 2, pending: 0, carriedOver: 5 },
  // Ananya (user-4)
  { id: "lb-11", userId: "user-4", leaveTypeId: "lt-1", year: 2026, totalAllocated: 12, used: 0, pending: 3, carriedOver: 0 },
  { id: "lb-12", userId: "user-4", leaveTypeId: "lt-2", year: 2026, totalAllocated: 10, used: 2, pending: 0, carriedOver: 0 },
  { id: "lb-13", userId: "user-4", leaveTypeId: "lt-3", year: 2026, totalAllocated: 15, used: 0, pending: 0, carriedOver: 0 },
  // Sneha (user-5)
  { id: "lb-14", userId: "user-5", leaveTypeId: "lt-1", year: 2026, totalAllocated: 12, used: 4, pending: 0, carriedOver: 0 },
  { id: "lb-15", userId: "user-5", leaveTypeId: "lt-2", year: 2026, totalAllocated: 10, used: 1, pending: 0, carriedOver: 3 },
  { id: "lb-16", userId: "user-5", leaveTypeId: "lt-3", year: 2026, totalAllocated: 15, used: 3, pending: 0, carriedOver: 2 },
  // Arjun (user-6)
  { id: "lb-17", userId: "user-6", leaveTypeId: "lt-1", year: 2026, totalAllocated: 12, used: 0, pending: 0, carriedOver: 0 },
  { id: "lb-18", userId: "user-6", leaveTypeId: "lt-2", year: 2026, totalAllocated: 10, used: 5, pending: 0, carriedOver: 0 },
  { id: "lb-19", userId: "user-6", leaveTypeId: "lt-3", year: 2026, totalAllocated: 15, used: 0, pending: 0, carriedOver: 0 },
  // Kavita (user-8)
  { id: "lb-20", userId: "user-8", leaveTypeId: "lt-1", year: 2026, totalAllocated: 12, used: 1, pending: 0, carriedOver: 0 },
  { id: "lb-21", userId: "user-8", leaveTypeId: "lt-2", year: 2026, totalAllocated: 10, used: 0, pending: 0, carriedOver: 0 },
  { id: "lb-22", userId: "user-8", leaveTypeId: "lt-3", year: 2026, totalAllocated: 15, used: 0, pending: 0, carriedOver: 0 },
];

export const initialLeaveRequests = [
  {
    id: "lr-1", userId: "user-1", userName: "Vatsal Shukla", department: "Engineering",
    type: "Sick Leave", leaveTypeId: "lt-1", startDate: "2026-03-20", endDate: "2026-03-22",
    totalDays: 3, reason: "Not feeling well, need rest.", status: "Pending",
    appliedOn: "2026-03-19", isHalfDay: false, approvedBy: null, rejectionReason: null,
  },
  {
    id: "lr-2", userId: "user-1", userName: "Vatsal Shukla", department: "Engineering",
    type: "Casual Leave", leaveTypeId: "lt-2", startDate: "2026-02-14", endDate: "2026-02-14",
    totalDays: 1, reason: "Personal work.", status: "Approved",
    appliedOn: "2026-02-10", isHalfDay: false, approvedBy: "user-3", rejectionReason: null,
  },
  {
    id: "lr-3", userId: "user-2", userName: "Priya Sharma", department: "Design",
    type: "Annual Leave", leaveTypeId: "lt-3", startDate: "2026-04-01", endDate: "2026-04-05",
    totalDays: 5, reason: "Family vacation planned.", status: "Pending",
    appliedOn: "2026-03-18", isHalfDay: false, approvedBy: null, rejectionReason: null,
  },
  {
    id: "lr-4", userId: "user-1", userName: "Vatsal Shukla", department: "Engineering",
    type: "Comp Off", leaveTypeId: "lt-7", startDate: "2026-01-10", endDate: "2026-01-10",
    totalDays: 1, reason: "Worked on weekend for product launch.", status: "Approved",
    appliedOn: "2026-01-08", isHalfDay: false, approvedBy: "user-3", rejectionReason: null,
  },
  {
    id: "lr-5", userId: "user-2", userName: "Priya Sharma", department: "Design",
    type: "Sick Leave", leaveTypeId: "lt-1", startDate: "2026-03-01", endDate: "2026-03-02",
    totalDays: 2, reason: "Flu symptoms.", status: "Rejected",
    appliedOn: "2026-02-28", isHalfDay: false, approvedBy: null, rejectionReason: "Insufficient documentation provided.",
  },
  {
    id: "lr-6", userId: "user-3", userName: "Rahul Kumar", department: "Engineering",
    type: "Casual Leave", leaveTypeId: "lt-2", startDate: "2026-03-15", endDate: "2026-03-15",
    totalDays: 1, reason: "Bank work.", status: "Approved",
    appliedOn: "2026-03-12", isHalfDay: true, approvedBy: "user-7", rejectionReason: null,
  },
  {
    id: "lr-7", userId: "user-4", userName: "Ananya Patel", department: "Engineering",
    type: "Sick Leave", leaveTypeId: "lt-1", startDate: "2026-03-25", endDate: "2026-03-27",
    totalDays: 3, reason: "Dental surgery appointment.", status: "Pending",
    appliedOn: "2026-03-20", isHalfDay: false, approvedBy: null, rejectionReason: null,
  },
  {
    id: "lr-8", userId: "user-5", userName: "Sneha Reddy", department: "Design",
    type: "Annual Leave", leaveTypeId: "lt-3", startDate: "2026-04-14", endDate: "2026-04-16",
    totalDays: 3, reason: "Short trip with family.", status: "Approved",
    appliedOn: "2026-04-01", isHalfDay: false, approvedBy: "user-7", rejectionReason: null,
  },
  {
    id: "lr-9", userId: "user-6", userName: "Arjun Mehta", department: "Marketing",
    type: "Casual Leave", leaveTypeId: "lt-2", startDate: "2026-03-28", endDate: "2026-03-28",
    totalDays: 1, reason: "Moving to new apartment.", status: "Pending",
    appliedOn: "2026-03-25", isHalfDay: false, approvedBy: null, rejectionReason: null,
  },
  {
    id: "lr-10", userId: "user-8", userName: "Kavita Singh", department: "Finance",
    type: "Sick Leave", leaveTypeId: "lt-1", startDate: "2026-02-20", endDate: "2026-02-20",
    totalDays: 1, reason: "Migraine.", status: "Approved",
    appliedOn: "2026-02-19", isHalfDay: true, approvedBy: "user-7", rejectionReason: null,
  },
  {
    id: "lr-11", userId: "user-3", userName: "Rahul Kumar", department: "Engineering",
    type: "Sick Leave", leaveTypeId: "lt-1", startDate: "2026-01-15", endDate: "2026-01-15",
    totalDays: 1, reason: "Fever.", status: "Approved",
    appliedOn: "2026-01-14", isHalfDay: false, approvedBy: "user-7", rejectionReason: null,
  },
  {
    id: "lr-12", userId: "user-5", userName: "Sneha Reddy", department: "Design",
    type: "Casual Leave", leaveTypeId: "lt-2", startDate: "2026-02-05", endDate: "2026-02-05",
    totalDays: 1, reason: "Parent teacher meeting.", status: "Approved",
    appliedOn: "2026-02-03", isHalfDay: false, approvedBy: "user-7", rejectionReason: null,
  },
  {
    id: "lr-13", userId: "user-1", userName: "Vatsal Shukla", department: "Engineering",
    type: "Annual Leave", leaveTypeId: "lt-3", startDate: "2026-04-10", endDate: "2026-04-14",
    totalDays: 5, reason: "Vacation trip to Goa.", status: "Pending",
    appliedOn: "2026-03-27", isHalfDay: false, approvedBy: null, rejectionReason: null,
  },
  {
    id: "lr-14", userId: "user-6", userName: "Arjun Mehta", department: "Marketing",
    type: "Casual Leave", leaveTypeId: "lt-2", startDate: "2026-01-20", endDate: "2026-01-22",
    totalDays: 3, reason: "Wedding ceremony.", status: "Approved",
    appliedOn: "2026-01-15", isHalfDay: false, approvedBy: "user-7", rejectionReason: null,
  },
  {
    id: "lr-15", userId: "user-4", userName: "Ananya Patel", department: "Engineering",
    type: "Casual Leave", leaveTypeId: "lt-2", startDate: "2026-02-28", endDate: "2026-02-28",
    totalDays: 1, reason: "Personal errands.", status: "Approved",
    appliedOn: "2026-02-25", isHalfDay: false, approvedBy: "user-3", rejectionReason: null,
  },
  {
    id: "lr-16", userId: "user-5", userName: "Sneha Reddy", department: "Design",
    type: "Sick Leave", leaveTypeId: "lt-1", startDate: "2026-03-05", endDate: "2026-03-08",
    totalDays: 4, reason: "Throat infection, doctor advised rest.", status: "Approved",
    appliedOn: "2026-03-05", isHalfDay: false, approvedBy: "user-7", rejectionReason: null,
  },
];

export const holidays = [
  { id: "hol-1", name: "Republic Day", date: "2026-01-26", type: "mandatory", isOptional: false, year: 2026 },
  { id: "hol-2", name: "Holi", date: "2026-03-17", type: "mandatory", isOptional: false, year: 2026 },
  { id: "hol-3", name: "Good Friday", date: "2026-04-03", type: "mandatory", isOptional: false, year: 2026 },
  { id: "hol-4", name: "Eid ul-Fitr", date: "2026-03-31", type: "mandatory", isOptional: false, year: 2026 },
  { id: "hol-5", name: "Independence Day", date: "2026-08-15", type: "mandatory", isOptional: false, year: 2026 },
  { id: "hol-6", name: "Gandhi Jayanti", date: "2026-10-02", type: "mandatory", isOptional: false, year: 2026 },
  { id: "hol-7", name: "Diwali", date: "2026-10-20", type: "mandatory", isOptional: false, year: 2026 },
  { id: "hol-8", name: "Christmas", date: "2026-12-25", type: "mandatory", isOptional: false, year: 2026 },
  { id: "hol-9", name: "Makar Sankranti", date: "2026-01-14", type: "optional", isOptional: true, year: 2026 },
  { id: "hol-10", name: "Raksha Bandhan", date: "2026-08-09", type: "optional", isOptional: true, year: 2026 },
  { id: "hol-11", name: "Janmashtami", date: "2026-08-25", type: "optional", isOptional: true, year: 2026 },
  { id: "hol-12", name: "Ganesh Chaturthi", date: "2026-09-07", type: "optional", isOptional: true, year: 2026 },
];

export const initialNotifications = [
  { id: "notif-1", userId: "user-1", type: "leave_approved", title: "Leave Approved", message: "Your Casual Leave on Feb 14 has been approved by Rahul Kumar.", isRead: false, createdAt: "2026-02-11T09:30:00Z" },
  { id: "notif-2", userId: "user-1", type: "leave_approved", title: "Comp Off Approved", message: "Your Comp Off on Jan 10 has been approved by Rahul Kumar.", isRead: true, createdAt: "2026-01-09T14:00:00Z" },
  { id: "notif-3", userId: "user-2", type: "leave_rejected", title: "Leave Rejected", message: "Your Sick Leave request (Mar 1-2) was rejected. Reason: Insufficient documentation.", isRead: false, createdAt: "2026-03-01T10:00:00Z" },
  { id: "notif-4", userId: "user-7", type: "leave_request", title: "New Leave Request", message: "Vatsal Shukla has requested Sick Leave from Mar 20-22.", isRead: false, createdAt: "2026-03-19T11:00:00Z" },
  { id: "notif-5", userId: "user-7", type: "leave_request", title: "New Leave Request", message: "Priya Sharma has requested Annual Leave from Apr 1-5.", isRead: false, createdAt: "2026-03-18T15:00:00Z" },
  { id: "notif-6", userId: "user-7", type: "leave_request", title: "New Leave Request", message: "Ananya Patel has requested Sick Leave from Mar 25-27.", isRead: true, createdAt: "2026-03-20T09:00:00Z" },
  { id: "notif-7", userId: "user-1", type: "system", title: "Welcome to ELMS", message: "Your account has been set up. Explore your dashboard to view leave balances.", isRead: true, createdAt: "2024-06-15T09:00:00Z" },
  { id: "notif-8", userId: "user-7", type: "leave_request", title: "New Leave Request", message: "Arjun Mehta has requested Casual Leave on Mar 28.", isRead: false, createdAt: "2026-03-25T10:00:00Z" },
  { id: "notif-9", userId: "user-7", type: "leave_request", title: "New Leave Request", message: "Vatsal Shukla has requested Annual Leave from Apr 10-14.", isRead: false, createdAt: "2026-03-27T09:00:00Z" },
];

export const leavePolicies = [
  {
    id: "pol-1", name: "Standard Policy", isDefault: true,
    accrualRules: { type: "annual", resetMonth: 1 },
    carryOverRules: { allowed: true, maxDays: 5, expiryMonths: 3 },
    encashmentRules: { allowed: true, minBalance: 10, maxEncash: 5 },
  },
];

export const companySettings = {
  companyName: "TechCorp Solutions",
  leaveYear: "January - December",
  autoApproveUnder: 0,
  emailNotifications: true,
  timezone: "Asia/Kolkata",
  currency: "INR",
};
