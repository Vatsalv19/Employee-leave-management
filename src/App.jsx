import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";
import { ThemeProvider } from "./context/ThemeContext";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Toast from "./components/Toast";

// Auth Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";

// Employee Pages
import EmployeeDashboard from "./pages/EmployeeDashboard";
import LeaveCalendar from "./pages/LeaveCalendar";
import Profile from "./pages/Profile";
import LeaveForm from "./components/LeaveForm";

// Admin Pages
import AdminDashboard from "./pages/AdminDashboard";
import Employees from "./pages/admin/Employees";
import Departments from "./pages/admin/Departments";
import Holidays from "./pages/admin/Holidays";
import Policies from "./pages/admin/Policies";
import Reports from "./pages/admin/Reports";
import Settings from "./pages/admin/Settings";

// Shared Pages
import Notifications from "./pages/Notifications";
import AIAssistant from "./pages/AIAssistant";
import NotFound from "./pages/NotFound";

/* ── Authenticated Layout ── */
function AppLayout() {
  return (
    <div className="min-h-screen bg-theme-surface">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:ml-60 min-h-[calc(100vh-57px)]">
          <Outlet />
        </main>
      </div>
      <Toast />
    </div>
  );
}

/* ── Route Guards ── */
function ProtectedRoute({ children, requiredRoles }) {
  const { currentUser } = useApp();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (requiredRoles && !requiredRoles.includes(currentUser.role)) {
    const home = currentUser.role === "admin" ? "/admin" : currentUser.role === "manager" ? "/manager" : "/employee";
    return <Navigate to={home} replace />;
  }
  return children || <Outlet />;
}

function AuthRoute({ children }) {
  const { currentUser } = useApp();
  if (currentUser) {
    const home = currentUser.role === "admin" ? "/admin" : currentUser.role === "manager" ? "/manager" : "/employee";
    return <Navigate to={home} replace />;
  }
  return children;
}

function RedirectHome() {
  const { currentUser } = useApp();
  if (!currentUser) return <Navigate to="/login" replace />;
  const home = currentUser.role === "admin" ? "/admin" : currentUser.role === "manager" ? "/manager" : "/employee";
  return <Navigate to={home} replace />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <Router>
          <Routes>
            {/* Public / Auth Routes */}
            <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
            <Route path="/register" element={<AuthRoute><Register /></AuthRoute>} />
            <Route path="/forgot-password" element={<AuthRoute><ForgotPassword /></AuthRoute>} />

            {/* Root redirect */}
            <Route index element={<RedirectHome />} />

            {/* Authenticated Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                {/* Employee */}
                <Route path="employee" element={<ProtectedRoute requiredRoles={["employee", "manager"]}><EmployeeDashboard /></ProtectedRoute>} />
                <Route path="employee/apply" element={<ProtectedRoute requiredRoles={["employee", "manager"]}><LeaveForm /></ProtectedRoute>} />
                <Route path="employee/calendar" element={<ProtectedRoute requiredRoles={["employee", "manager"]}><LeaveCalendar /></ProtectedRoute>} />
                <Route path="employee/profile" element={<Profile />} />

                {/* Manager */}
                <Route path="manager" element={<ProtectedRoute requiredRoles={["manager"]}><AdminDashboard /></ProtectedRoute>} />

                {/* Admin */}
                <Route path="admin" element={<ProtectedRoute requiredRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
                <Route path="admin/employees" element={<ProtectedRoute requiredRoles={["admin"]}><Employees /></ProtectedRoute>} />
                <Route path="admin/departments" element={<ProtectedRoute requiredRoles={["admin"]}><Departments /></ProtectedRoute>} />
                <Route path="admin/holidays" element={<ProtectedRoute requiredRoles={["admin"]}><Holidays /></ProtectedRoute>} />
                <Route path="admin/policies" element={<ProtectedRoute requiredRoles={["admin"]}><Policies /></ProtectedRoute>} />
                <Route path="admin/reports" element={<ProtectedRoute requiredRoles={["admin"]}><Reports /></ProtectedRoute>} />
                <Route path="admin/settings" element={<ProtectedRoute requiredRoles={["admin"]}><Settings /></ProtectedRoute>} />

                {/* Shared */}
                <Route path="notifications" element={<Notifications />} />
                <Route path="assistant" element={<AIAssistant />} />
              </Route>
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AppProvider>
    </ThemeProvider>
  );
}
