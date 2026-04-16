import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "manager":
        return "bg-amber-100 text-amber-800 border border-amber-200";
      case "agent":
        return "bg-emerald-100 text-emerald-800 border border-emerald-200";
      case "user":
        return "bg-sky-100 text-sky-800 border border-sky-200";
      default:
        return "bg-slate-100 text-slate-700 border border-slate-200";
    }
  };

  const getRoleLabel = (role) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  return (
    <nav className="sticky top-0 !z-50 border-b border-amber-100/70 bg-white/80 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <button
            type="button"
            onClick={() => {
              if (user) {
                if (user.role === "manager") navigate("/manager-dashboard");
                else if (user.role === "agent") navigate("/agent-dashboard");
                else navigate("/dashboard");
              } else {
                navigate("/");
              }
            }}
            className="flex items-center gap-2 text-left"
          >
            <div className="h-9 w-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              SF
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                SupportFlow
              </p>
              <p className="text-xs text-slate-500">Ticket workspace</p>
            </div>
          </button>

          {/* Center Menu */}
          {user && (
            <div className="hidden md:flex items-center gap-4">
              {user.role === "user" && (
                <>
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="nav-link"
                  >
                    My Tickets
                  </button>
                  <button
                    onClick={() => navigate("/create-ticket")}
                    className="nav-link"
                  >
                    Create Ticket
                  </button>
                  <button
                    onClick={() => navigate("/messages")}
                    className="nav-link"
                  >
                    💬 Messages
                  </button>
                </>
              )}
              {user.role === "agent" && (
                <>
                  <button
                    onClick={() => navigate("/agent-dashboard")}
                    className="nav-link"
                  >
                    Assigned Tickets
                  </button>
                  <button
                    onClick={() => navigate("/agent-actions")}
                    className="nav-link"
                  >
                    Actions
                  </button>
                  <button
                    onClick={() => navigate("/messages")}
                    className="nav-link"
                  >
                    💬 Messages
                  </button>
                </>
              )}
              {user.role === "manager" && (
                <>
                  <button
                    onClick={() => navigate("/manager-dashboard")}
                    className="nav-link"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => navigate("/reports")}
                    className="nav-link"
                  >
                    Reports
                  </button>
                  <button
                    onClick={() => navigate("/manager/performance")}
                    className="nav-link"
                  >
                    Performance
                  </button>
                </>
              )}
            </div>
          )}

          <div className="flex items-center gap-4">
            <ThemeToggle />

            {user && (
              <>
                <div
                  className={`hidden sm:flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${getRoleColor(user.role)}`}
                >
                  <span>{getRoleLabel(user.role)}</span>
                </div>

                <div className="relative">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="flex items-center gap-3 text-slate-700 hover:text-slate-900 transition"
                  >
                    <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shadow">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:inline text-sm font-medium">
                      {user.name}
                    </span>
                  </button>

                  {showMenu && (
                    <div className="absolute right-0 mt-3 w-60 surface-card overflow-hidden shadow-2xl z-50">
                      <div className="p-4 border-b border-slate-200 bg-slate-50">
                        <p className="font-semibold text-slate-900">
                          {user.name}
                        </p>
                        <p className="text-sm text-slate-500">{user.email}</p>
                      </div>
                      <button
                        onClick={() => navigate("/profile")}
                        className="w-full text-left px-4 py-3 text-slate-700 hover:bg-slate-100"
                      >
                        Profile settings
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 text-rose-500 hover:bg-slate-100 border-t border-slate-200"
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
