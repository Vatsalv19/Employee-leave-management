import { useApp } from "../context/AppContext";
import { useTheme } from "../context/ThemeContext";
import { Bell, Sun, Moon, Menu, LogOut } from "lucide-react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const { currentUser, logout, unreadNotificationCount, setSidebarOpen, sidebarOpen } = useApp();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="glass sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-3">
      <div className="flex items-center gap-3">
        {currentUser && (
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-1.5 rounded-lg text-theme-secondary hover:bg-primary-500/10 transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 text-sm font-bold text-white shadow-lg shadow-primary-500/25">
            EL
          </div>
          <h1 className="text-lg font-bold tracking-tight">
            <span className="gradient-text">ELMS</span>
          </h1>
        </Link>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-theme-secondary hover:bg-primary-500/10 transition-all"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
        </button>

        {currentUser && (
          <>
            {/* Notification Bell */}
            <Link
              to="/notifications"
              className="relative p-2 rounded-lg text-theme-secondary hover:bg-primary-500/10 transition-all"
              aria-label="Notifications"
            >
              <Bell className="w-[18px] h-[18px]" />
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent-rose text-[10px] font-bold text-white">
                  {unreadNotificationCount > 9 ? "9+" : unreadNotificationCount}
                </span>
              )}
            </Link>

            {/* User Info */}
            <div className="hidden sm:flex items-center gap-3 ml-1 pl-3 border-l border-theme">
              <div className="text-right">
                <p className="text-sm font-semibold text-theme-primary">{currentUser.firstName} {currentUser.lastName}</p>
                <p className="text-xs text-theme-muted capitalize">{currentUser.role}</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-accent-cyan text-xs font-bold text-white">
                {currentUser.avatar}
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={logout}
              className="p-2 rounded-lg text-theme-secondary hover:text-accent-rose hover:bg-accent-rose/10 transition-all"
              aria-label="Logout"
            >
              <LogOut className="w-[18px] h-[18px]" />
            </button>
          </>
        )}
      </div>
    </header>
  );
}
