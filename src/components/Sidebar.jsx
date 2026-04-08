import { NavLink, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";
import {
  LayoutDashboard, PlusCircle, Calendar, UserCircle, Users, Building2,
  CalendarDays, ShieldCheck, BarChart3, Settings, Bot, X
} from "lucide-react";

const employeeLinks = [
  { to: "/employee", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/employee/apply", label: "Apply Leave", icon: PlusCircle },
  { to: "/employee/calendar", label: "Calendar", icon: Calendar },
  { to: "/employee/profile", label: "My Profile", icon: UserCircle },
];

const managerLinks = [
  { to: "/manager", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/employee/apply", label: "Apply Leave", icon: PlusCircle },
  { to: "/employee/calendar", label: "Calendar", icon: Calendar },
  { to: "/employee/profile", label: "My Profile", icon: UserCircle },
];

const adminLinks = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/employees", label: "Employees", icon: Users },
  { to: "/admin/departments", label: "Departments", icon: Building2 },
  { to: "/admin/holidays", label: "Holidays", icon: CalendarDays },
  { to: "/admin/policies", label: "Policies", icon: ShieldCheck },
  { to: "/admin/reports", label: "Reports", icon: BarChart3 },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

const sharedLinks = [
  { to: "/assistant", label: "AI Assistant", icon: Bot },
];

export default function Sidebar() {
  const { currentUser, sidebarOpen, setSidebarOpen } = useApp();
  const location = useLocation();

  if (!currentUser) return null;

  const roleLinks = currentUser.role === "admin"
    ? adminLinks
    : currentUser.role === "manager"
    ? managerLinks
    : employeeLinks;

  function isActive(link) {
    if (link.end) return location.pathname === link.to;
    return location.pathname.startsWith(link.to);
  }

  const NavItems = ({ links, title }) => (
    <>
      {title && (
        <p className="px-4 pt-4 pb-1 text-[10px] font-bold uppercase tracking-[0.15em] text-theme-muted">
          {title}
        </p>
      )}
      {links.map((link) => {
        const Icon = link.icon;
        const active = isActive(link);
        return (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 group ${
              active
                ? "bg-primary-500/15 text-primary-400 shadow-lg shadow-primary-500/5"
                : "text-theme-secondary hover:bg-primary-500/5 hover:text-theme-primary"
            }`}
          >
            <Icon className={`w-[18px] h-[18px] transition-colors ${active ? "text-primary-400" : "text-theme-muted group-hover:text-theme-secondary"}`} />
            {link.label}
            {active && (
              <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-400 shadow-lg shadow-primary-400/50" />
            )}
          </NavLink>
        );
      })}
    </>
  );

  const sidebarContent = (
    <>
      {/* Role Badge */}
      <div className="px-4 pt-5 pb-3">
        <div className="rounded-lg bg-primary-500/10 border border-primary-500/20 px-3 py-2">
          <p className="text-xs font-medium text-primary-400 uppercase tracking-wider">
            {currentUser.role === "admin" ? "Admin Panel" : currentUser.role === "manager" ? "Manager Panel" : "Employee Portal"}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-1 space-y-0.5 overflow-y-auto scrollbar-thin">
        <NavItems links={roleLinks} title="Main" />
        <div className="my-3 border-t border-theme mx-3" />
        <NavItems links={sharedLinks} title="Tools" />
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-theme">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500/20 to-accent-cyan/20 text-xs font-bold text-primary-400">
            {currentUser.avatar}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-theme-primary truncate">{currentUser.firstName} {currentUser.lastName}</p>
            <p className="text-xs text-theme-muted capitalize">{currentUser.role}</p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-[57px] z-20 flex h-[calc(100vh-57px)] w-60 flex-col bg-theme-surface-light border-r border-theme transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Mobile close */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden absolute top-3 right-3 p-1 rounded-lg text-theme-muted hover:text-theme-primary transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {sidebarContent}
      </aside>
    </>
  );
}
