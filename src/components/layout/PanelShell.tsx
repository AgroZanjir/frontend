/**
 * The frame every panel screen renders inside.
 *
 * The prototype's chrome, rebuilt on the router: the sidebar lists the
 * sections of the panel you are in, the panel selector only offers the panels
 * your session can actually open, and the breadcrumb names the screen. The
 * demo bar sits above all of it and says, on every screen, that the data is
 * illustrative.
 */

import { useEffect, useRef, useState } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useTranslation } from "react-i18next";

import PanelIcon from "@/components/panel/icons";
import BrandMark from "@/components/panel/brand";
import { usePanelT } from "@/lib/panel-format";
import { SCREEN_LABEL, panelByPath, type PanelDef } from "@/lib/panels";
import { useQuery } from "@tanstack/react-query";

import api from "@/lib/api";
import PanelToasts from "@/components/panel/toast";
import { PanelToastProvider, useAction } from "@/lib/panel-actions";
import { usePanelData } from "@/lib/panel-data";
import { useOptionalPanelData } from "@/lib/panel-context";
import { signOut, usePanelPersona } from "@/lib/panel-session";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import userStore from "@/store/UserStore";

/* ===== the demo bar ===== */

/**
 * The bar wraps to two lines on a narrow viewport, so its height is measured
 * rather than assumed: the sidebar is 100vh minus whatever it actually takes.
 */
export const DemoBar = () => {
  const { t } = usePanelT();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const set = () =>
      document.documentElement.style.setProperty(
        "--demo-h",
        `${el.offsetHeight}px`,
      );
    set();
    const observer = new ResizeObserver(set);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="demo-bar" ref={ref}>
      <b>{t("demo")}</b> · {t("demo2")}
    </div>
  );
};

/* ===== language and theme, the prototype's two segmented controls ===== */

export const LangSeg = ({ style }: { style?: React.CSSProperties }) => {
  const { i18n } = useTranslation();
  const active = (i18n.resolvedLanguage ?? i18n.language ?? "uz").split("-")[0];
  return (
    <div className="seg" style={style}>
      {(["uz", "ru", "en"] as const).map((l) => (
        <button
          key={l}
          className={cn(active === l && "on")}
          style={{ flex: 1 }}
          onClick={() => i18n.changeLanguage(l)}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
};

export const ThemeSeg = () => {
  const { actualTheme, setTheme } = useTheme();
  return (
    <div className="seg">
      <button
        className={cn(actualTheme === "light" && "on")}
        title="Light"
        aria-label="Light theme"
        onClick={() => setTheme("light")}
      >
        ☀
      </button>
      <button
        className={cn(actualTheme === "dark" && "on")}
        title="Dark"
        aria-label="Dark theme"
        onClick={() => setTheme("dark")}
      >
        ☾
      </button>
    </div>
  );
};

/* ===== sidebar ===== */

const PanelSidebar = ({ panel }: { panel: PanelDef }) => {
  const { t } = usePanelT();
  const navigate = useNavigate();
  const persona = usePanelPersona();
  const user = userStore((s) => s.user);

  const leave = () => {
    // Ends it at the backend too, which is what clears the refresh cookie.
    // Clearing only the tab would leave a session a reload could resurrect.
    void signOut();
    navigate("/panels");
  };

  return (
    <aside className="side" id="panel-sections">
      {/* The mark is the way back to the panel index, which is where someone
          who works in two panels changes between them. */}
      <Link className="brand" to="/panels">
        <BrandMark />
        <div>
          <div className="brand-t">Agro Zanjir</div>
          <div className="brand-s">Digital</div>
        </div>
      </Link>

      {/* A panel is one audience's portal, and the sidebar names the one you
          are in. It is not a switcher: offering a hub operator the bank's
          portal - or, worse, administration - implies an access they do not
          have and the API would refuse. The prototype states it the same way:
          one portal per panel, as a label. */}
      <div className="side-lbl">{t("portal")}</div>
      <div
        className="row"
        style={{
          gap: 8,
          padding: "6px 9px",
          borderRadius: "var(--r-sm)",
          background: "var(--primary-soft)",
          color: "var(--primary-ink)",
        }}
      >
        <PanelIcon name={panel.icon} />
        <span style={{ fontWeight: 600, fontSize: "12.5px" }}>
          {t(panel.key)}
        </span>
      </div>

      <div className="side-lbl">{t("sections")}</div>
      <nav className="nav">
        {panel.screens.map((s) => (
          <NavLink
            key={s.id}
            to={s.slug ? `${panel.path}/${s.slug}` : panel.path}
            end={s.slug === ""}
            className={({ isActive }) => (isActive ? "on" : "")}
          >
            <PanelIcon name={s.icon} />
            {t(s.labelKey)}
            {s.badge && <span className="badge">{s.badge}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="side-foot">
        {persona && (
          <div className="who">
            <div className="avatar">{persona.ini}</div>
            <div style={{ minWidth: 0 }}>
              <div className="who-n">{persona.name}</div>
              {persona.org && <div className="who-r">{persona.org}</div>}
            </div>
          </div>
        )}
        {/* The public panel is reachable without a session, so this is a way
            in as often as it is a way out. */}
        <button
          className="btn btn-q btn-sm"
          style={{ justifyContent: "flex-start" }}
          onClick={user ? leave : () => navigate(`/signin/${panel.id}`)}
        >
          <PanelIcon name="login" />
          {user ? t("n_signout") : t("n_signin")}
        </button>
        <div className="row" style={{ gap: 6 }}>
          <LangSeg style={{ flex: 1 }} />
          <ThemeSeg />
        </div>
      </div>
    </aside>
  );
};

/* ===== search ===== */

/**
 * The box in the top bar. It was decoration: a magnifier and the word
 * "Search…" that did nothing when clicked.
 *
 * It searches what the caller can already see - the endpoint scopes lots the
 * same way the tables do - so it cannot become a way around `party_scope`.
 * Results are keyed to a screen each kind opens on.
 */
const PanelSearch = ({ panel }: { panel: PanelDef }) => {
  const { t } = usePanelT();
  const signedIn = userStore((state) => state.isAuthenticated);
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  // 250ms after the last keystroke, not on every one: this runs five queries
  // per call and a hub manager types faster than that.
  const debounced = useDebounced(query, 250);
  const { data } = useQuery({
    queryKey: ["panel-search", debounced],
    queryFn: () =>
      api.get<{ results: SearchHit[] }>(
        `/panels/search/?q=${encodeURIComponent(debounced)}`,
      ),
    enabled: debounced.trim().length >= 2,
    staleTime: 20_000,
  });
  const hits = data?.results ?? [];

  useEffect(() => {
    const close = (e: PointerEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  const go = (hit: SearchHit) => {
    setOpen(false);
    setQuery("");
    // The lot passport is reachable from four panels; open the one belonging
    // to the panel the reader is standing in rather than sending them
    // somewhere their role may not go.
    navigate(hit.path === "/lot" ? `${panel.path}/lot` : hit.path);
  };

  // The endpoint is scoped to the caller, so there is nothing to search
  // without one - and the public panel is reachable with no session at all.
  if (!signedIn) return null;

  return (
    <div className="topsearch-wrap" ref={box}>
      <div className="topsearch">
        <PanelIcon name="srch" className="" />
        <input
          value={query}
          placeholder={t("search")}
          aria-label={t("srch_hint")}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
            if (e.key === "Enter" && hits[0]) go(hits[0]);
          }}
        />
      </div>
      {open && debounced.trim().length >= 2 && (
        <div className="srch-drop">
          {hits.length === 0 ? (
            <div className="srch-empty">{t("srch_none")}</div>
          ) : (
            hits.map((hit) => (
              <button
                type="button"
                key={`${hit.kind}-${hit.code}`}
                className="srch-hit"
                onClick={() => go(hit)}
              >
                <span className="srch-k">{t(`sk_${hit.kind}`)}</span>
                <span className="mono">{hit.label}</span>
                <span className="t-xs muted-2">{hit.detail}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

interface SearchHit {
  kind: string;
  code: string;
  label: string;
  detail: string;
  path: string;
}

/** Wait for the typing to stop before asking. */
const useDebounced = (value: string, ms: number) => {
  const [settled, setSettled] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setSettled(value), ms);
    return () => window.clearTimeout(timer);
  }, [value, ms]);
  return settled;
};

/* ===== the bell ===== */

/**
 * What the dot on the bell was promising.
 *
 * The notifications were already loaded with the rest of the dataset and had
 * nowhere to go. Reading one marks it read for the person who read it -
 * including a platform-wide notice, which gets a per-person copy rather than
 * being hidden from everybody at once.
 */
const PanelBell = () => {
  const { t } = usePanelT();
  // Optional, because this bar is also the public panel's, and that panel has
  // no session and therefore no dataset. Reading it unconditionally took the
  // whole screen down for an anonymous visitor.
  const data = useOptionalPanelData();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const notifications = data?.NOTIFS ?? [];
  const unread = notifications.filter((n) => !n.read);

  const read = useAction(
    (id: string) => api.post(`/panels/notifications/${id}/read/`),
    { success: "act_saved" },
  );

  useEffect(() => {
    const close = (e: PointerEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  return (
    <div className="bell-wrap" ref={box}>
      <button
        className="iconbtn"
        aria-label={t("nt_exc")}
        aria-expanded={open}
        onClick={() => setOpen((was) => !was)}
      >
        <PanelIcon name="bell" className="" />
        {unread.length > 0 && <span className="dot" />}
      </button>
      {open && (
        <div className="bell-drop">
          {notifications.length === 0 ? (
            <div className="srch-empty">{t("nt_empty")}</div>
          ) : (
            notifications.map((n) => (
              <button
                type="button"
                key={n.id}
                className={cn("bell-row", n.read && "read")}
                disabled={read.busy || n.read}
                onClick={() => void read.run(n.id)}
              >
                <span
                  className={`pill p-${n.lvl === "crit" ? "crit" : n.lvl === "warn" ? "warn" : n.lvl === "good" ? "good" : "info"}`}
                >
                  <span className="dot" />
                </span>
                <span style={{ minWidth: 0 }}>
                  <span className="bell-t">{t(n.k)}</span>
                  <span className="bell-s mono">{n.v}</span>
                </span>
                <span className="t-xs muted-2">{n.at}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

/* ===== top bar ===== */

const TopBar = ({
  panel,
  onMenu,
  open,
}: {
  panel: PanelDef;
  onMenu: () => void;
  open: boolean;
}) => {
  const { t } = usePanelT();
  const { pathname } = useLocation();
  const label = SCREEN_LABEL[pathname.replace(/\/$/, "")] ?? "n_dash";

  return (
    <div className="top">
      <button
        type="button"
        className="side-toggle"
        aria-expanded={open}
        aria-controls="panel-sections"
        aria-label={t(open ? "w_menu_close" : "w_menu_open")}
        onClick={onMenu}
      >
        <span />
        <span />
        <span />
      </button>
      <div className="crumb">
        <span>{t(panel.key)}</span>
        <PanelIcon name="chev" className="" />
        <b>{t(label)}</b>
      </div>
      <div className="top-r">
        <PanelSearch panel={panel} />
        <PanelBell />
      </div>
    </div>
  );
};

/* ===== the frame ===== */

/**
 * The sidebar on a phone.
 *
 * Ten sections, a person and three controls stacked to 550px of chrome before
 * the reader saw a number. Below the breakpoint the sidebar becomes a drawer
 * behind the button in the top bar, and the scrim is what closes it - along
 * with Escape, a route change, and the viewport growing back.
 */
const useDrawer = () => {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const wide = window.matchMedia("(min-width: 941px)");
    const onWide = () => wide.matches && setOpen(false);
    document.addEventListener("keydown", onKey);
    wide.addEventListener("change", onWide);
    return () => {
      document.removeEventListener("keydown", onKey);
      wide.removeEventListener("change", onWide);
    };
  }, [open]);

  return { open, setOpen };
};

const PanelShell = () => {
  const { t } = usePanelT();
  const { pathname } = useLocation();
  const panel = panelByPath(pathname);
  const { open, setOpen } = useDrawer();

  // Every route under this shell comes from the manifest, so a missing panel
  // means the route table and the manifest have drifted apart.
  if (!panel) return null;

  return (
    // Everything below can report what it did: the toast stack, the bell in
    // the top bar and every form on every screen inside the outlet.
    <PanelToastProvider>
      <div className={cn("appwrap", open && "drawer-open")}>
        <DemoBar />
        <PanelToasts />
        <div className="frame">
          <PanelSidebar panel={panel} />
          {/* Only ever visible on a phone, and only while the drawer is. */}
          <button
            type="button"
            className="side-scrim"
            tabIndex={open ? 0 : -1}
            aria-hidden={!open}
            aria-label={t("w_menu_close")}
            onClick={() => setOpen(false)}
          />
          <div className="main">
            <TopBar
              panel={panel}
              onMenu={() => setOpen((was) => !was)}
              open={open}
            />
            <div className="body">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </PanelToastProvider>
  );
};

export default PanelShell;
