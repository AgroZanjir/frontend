import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LayoutDashboard, LogOut, Sprout } from "lucide-react";

import { LangSeg, ThemeSeg } from "@/components/layout/PanelShell";
import { cn } from "@/lib/utils";
import { MODULES } from "@/lib/modules";
import { APP_NAME } from "@/config";
import userStore from "@/store/UserStore";

const Sidebar = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = userStore((state) => state.user);
  const hasRole = userStore((state) => state.hasRole);
  const logout = userStore((state) => state.logout);

  const visible = MODULES.filter(
    (m) => m.roles.length === 0 || hasRole(m.roles),
  );

  const handleLogout = () => {
    logout();
    navigate("/panels");
  };

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r bg-card">
      <div className="flex items-center gap-2 border-b px-5 py-4">
        <Sprout className="h-5 w-5 text-primary" />
        <span className="text-sm font-semibold leading-tight">{APP_NAME}</span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        <NavLink
          to="/overview"
          end
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
              isActive
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )
          }
        >
          <LayoutDashboard className="h-4 w-4" />
          {t("overview", "Overview")}
        </NavLink>

        {visible.map((module) => (
          <NavLink
            key={module.key}
            to={module.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )
            }
          >
            <module.icon className="h-4 w-4" />
            <span className="flex-1">{t(module.titleKey, module.title)}</span>
            {module.phase > 1 && (
              <span className="rounded-full border px-1.5 text-[10px] leading-4 text-muted-foreground">
                P{module.phase}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* The same language and theme controls the panels use - one control
          for one setting, wherever you happen to be. */}
      <div className="space-y-3 border-t p-3">
        <div className="flex items-center gap-2">
          <LangSeg style={{ flex: 1 }} />
          <ThemeSeg />
        </div>

        {user && (
          <button
            className="flex items-center gap-2 px-1 text-xs text-muted-foreground hover:text-foreground"
            onClick={handleLogout}
          >
            <LogOut className="h-3.5 w-3.5" />
            {t("logout", "Sign out")}
          </button>
        )}

        {user && (
          <div className="truncate px-1 text-xs text-muted-foreground">
            {user.firstName} {user.lastName ?? ""}
            <span className="block truncate">{user.email}</span>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
