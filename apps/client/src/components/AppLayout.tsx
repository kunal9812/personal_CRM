import { NavLink, useNavigate } from "react-router-dom";
import { apiClient, useAuth } from "../contexts/AuthContext";

const NAV = [
  { to: "/",         label: "Dashboard" },
  { to: "/contacts", label: "Contacts"  },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { setAccessToken } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try { await apiClient.post("/auth/logout"); } finally {
      setAccessToken(null);
      navigate("/login");
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-void">

      {/* ── Sidebar ── */}
      <aside className="sidebar-bloom w-[200px] flex-shrink-0 flex flex-col select-none">

        {/* Wordmark */}
        <div className="px-8 pt-10 pb-8 border-b border-line">
          <span className="font-display font-light tracking-widest2 text-xs text-cream uppercase">
            Relate
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-8 pt-8 space-y-1 overflow-y-auto">
          {NAV.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-8 pb-8 border-t border-line pt-6">
          <button
            onClick={handleLogout}
            className="nav-link text-left w-full"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 overflow-y-auto">
        <div className="animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}
