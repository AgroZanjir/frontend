/**
 * The frame every public page renders inside.
 *
 * Deliberately separate from `PanelShell`: this is the public surface. It has
 * no sidebar, no panel switching and no session - the only thing it knows
 * about the operator side is where the door is.
 *
 * The `site` class on `<body>` is what turns `styles/site.css` on. Scoping it
 * there rather than at `:root` is why the panels keep their own typeface and
 * palette while this sheet is loaded.
 */

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";

import PanelIcon from "@/components/panel/icons";
import { LangSeg, ThemeSeg } from "@/components/layout/PanelShell";
import { usePanelT } from "@/lib/panel-format";
import { cn } from "@/lib/utils";

/**
 * Seven primary items. Home is the logo and Careers lives in the footer -
 * nine would wrap to a second row in Uzbek, which is the longest language.
 */
const NAV: [string, string][] = [
  ["/about", "w_about"],
  ["/services", "w_services"],
  ["/showroom", "w_showroom"],
  ["/technology", "w_tech"],
  ["/partners", "w_partners"],
  ["/news", "w_news"],
  ["/contact", "w_contact"],
];

const Mark = ({ stroke = "2" }: { stroke?: string }) => (
  <div className="brand-mark">
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="#fff"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 21V9" />
      <path d="M12 9C12 9 12 3 18 3C18 3 18 9 12 9Z" />
      <path d="M12 13C12 13 12 8 6 8C6 8 6 13 12 13Z" />
    </svg>
  </div>
);

/**
 * The nav pill tightens once the page leaves the top. Passive listener, one
 * boolean, and the transition itself is CSS - the scroll handler must never
 * be the thing that costs a frame.
 */
const useScrolled = () => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return scrolled;
};

/**
 * The menu on a phone.
 *
 * Seven links, two segmented controls and a button do not fit on 390px, and
 * wrapping them cost a quarter of the screen before the reader saw anything.
 * Below the breakpoint they collapse behind one button.
 *
 * The state closes itself on four things, because a menu that stays open is
 * how a phone user loses the page: a route change, Escape, a tap outside, and
 * the viewport growing past the breakpoint - the menu is `display: contents`
 * on a desktop, so an `open` left set there would be invisible but still true.
 */
const useNavMenu = (barRef: RefObject<HTMLElement | null>) => {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onPointer = (e: PointerEvent) => {
      if (!barRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const wide = window.matchMedia("(min-width: 861px)");
    const onWide = () => wide.matches && setOpen(false);

    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    wide.addEventListener("change", onWide);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
      wide.removeEventListener("change", onWide);
    };
  }, [open, barRef]);

  return [open, setOpen] as const;
};

const SiteHeader = () => {
  const { t } = usePanelT();
  const scrolled = useScrolled();
  const bar = useRef<HTMLElement>(null);
  const [open, setOpen] = useNavMenu(bar);

  return (
    <div className="navwrap">
      <header
        ref={bar}
        className={cn("navbar", scrolled && "scrolled", open && "open")}
      >
        <Link className="site-logo" to="/">
          <Mark stroke="2.1" />
          <div className="brand-t">Agro Zanjir</div>
        </Link>

        {/* `display: contents` on a wide screen, so these sit in the bar
            exactly as they always did; a sheet under it on a phone. One copy
            of the markup either way - two would be two things to keep in
            step. */}
        <div className="nav-drop" id="site-menu">
          <nav className="site-nav">
            {NAV.map(([to, k]) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => (isActive ? "on" : "")}
              >
                {t(k)}
              </NavLink>
            ))}
          </nav>

          <div className="site-actions">
            <LangSeg />
            <ThemeSeg />
          </div>
        </div>

        {/* The one door to the operator side. It stays on the bar at every
            width: it is what an operator opens the site for. */}
        <Link className="btn btn-p nav-enter" to="/panels">
          {t("w_enter")}
        </Link>

        <button
          type="button"
          className="nav-burger"
          aria-expanded={open}
          aria-controls="site-menu"
          aria-label={t(open ? "w_menu_close" : "w_menu_open")}
          onClick={() => setOpen((was) => !was)}
        >
          <span />
          <span />
          <span />
        </button>
      </header>
    </div>
  );
};

const SiteFooter = () => {
  const { t } = usePanelT();

  const col = (title: string, links: [string, string | null][]) => (
    <div>
      <h5>{title}</h5>
      {links.map(([k, to]) =>
        to ? (
          <Link key={k} to={to}>
            {t(k)}
          </Link>
        ) : (
          <a key={k}>{t(k)}</a>
        ),
      )}
    </div>
  );

  return (
    <footer className="site-ft">
      <div className="ft-in">
        <div className="ft-cols">
          <div>
            <div className="row" style={{ gap: 10, marginBottom: 11 }}>
              <Mark />
              <div
                style={{
                  color: "var(--on-deep)",
                  fontWeight: 700,
                  fontSize: 15,
                }}
              >
                Agro Zanjir
              </div>
            </div>
            <div style={{ fontSize: 13, maxWidth: "34ch", lineHeight: 1.55 }}>
              {t("w_ft_tag")}
            </div>
          </div>

          {col(t("w_ft_nav"), [
            ["w_about", "/about"],
            ["w_services", "/services"],
            ["w_showroom", "/showroom"],
            ["w_tech", "/technology"],
          ])}
          {col(t("w_ft_plat"), [
            ["w_ft_panels", "/panels"],
            ["w_ft_trace", "/public"],
            ["w_partners", "/partners"],
            ["w_careers", "/careers"],
          ])}
          {col(t("w_ft_legal"), [
            ["w_ft_terms", null],
            ["w_ft_privacy", null],
            ["w_contact", "/contact"],
          ])}
        </div>

        <div className="ft-bot">
          <span>© 2026 Agro Zanjir</span>
          <span>{t("w_ft_rights")}</span>
        </div>
      </div>
    </footer>
  );
};

/**
 * Fade and rise on entry.
 *
 * Two things it must not do: hide content from anyone who asked for reduced
 * motion, and hide content that is already on screen when the page renders -
 * animating the first fold on a route change reads as a page reload.
 */
const useReveal = (key: string) => {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            observer.unobserve(e.target);
          }
        }),
      { rootMargin: "0px 0px -8% 0px", threshold: 0.04 },
    );

    document
      .querySelectorAll<HTMLElement>(
        "main .band-in > *, main .hero-in > *, .bcell, .pcard, .svc, .step, .logo, .job, .narticle",
      )
      .forEach((el, i) => {
        if (el.getBoundingClientRect().top < window.innerHeight * 0.92) {
          el.classList.add("reveal", "in");
          return;
        }
        el.classList.add("reveal");
        el.style.transitionDelay = `${Math.min(i % 6, 5) * 45}ms`;
        observer.observe(el);
      });

    return () => observer.disconnect();
  }, [key]);
};

/**
 * A deep closing band directly above the footer becomes one continuous dark
 * plane with it - two near-touching rounded blocks read as a mistake.
 */
const useMergedFooter = (key: string) => {
  useLayoutEffect(() => {
    const sections = document.querySelectorAll("main > section");
    const last = sections[sections.length - 1];
    const footer = document.querySelector(".site-ft");
    const merge = !!last?.classList.contains("deep");

    last?.classList.toggle("pre-ft", merge);
    footer?.classList.toggle("merged", merge);
  }, [key]);
};

const SiteShell = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    document.body.classList.add("site");
    return () => document.body.classList.remove("site");
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  useMergedFooter(pathname);
  useReveal(pathname);

  return (
    <>
      <SiteHeader />
      {/* Keyed on the path so the entry animation replays per route: a page
          change should be visible, not instantaneous. */}
      <main key={pathname} className="page-in">
        <Outlet />
      </main>
      <SiteFooter />
    </>
  );
};

export default SiteShell;

/* ===== the pieces every page is built from ===== */

export const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <div className="eyebrow">{children}</div>
);

export const Band = ({
  deep,
  soft,
  tight,
  style,
  children,
}: {
  deep?: boolean;
  soft?: boolean;
  tight?: boolean;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) => (
  <section
    className={cn("band", deep && "deep", soft && "soft", tight && "tight")}
    style={style}
  >
    <div className="band-in">{children}</div>
  </section>
);

/** A pill-shaped site button. `to` makes it a link, `onClick` a button. */
export const SiteBtn = ({
  children,
  to,
  onClick,
  cls,
  sm,
  icon,
  style,
}: {
  children: React.ReactNode;
  to?: string;
  onClick?: () => void;
  cls?: string;
  sm?: boolean;
  icon?: string;
  style?: React.CSSProperties;
}) => {
  const inner = (
    <>
      {children}
      {icon && <PanelIcon name={icon} />}
    </>
  );
  const className = cn("btn", cls, sm && "btn-sm");

  return to ? (
    <Link className={className} to={to} style={style}>
      {inner}
    </Link>
  ) : (
    <button className={className} onClick={onClick} style={style}>
      {inner}
    </button>
  );
};
