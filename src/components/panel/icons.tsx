/**
 * The panel icon set.
 *
 * Drawn for this product rather than pulled from a library: several of these
 * (weighbridge, ZEROCO flask, cold-chain excursion) have no equivalent in
 * lucide, and a half-borrowed set reads as two sets. The markup is the
 * prototype's, verbatim.
 */

/** Icon name to the inside of a 24x24 stroke-only `<svg>`. */
export const ICON_PATHS: Record<string, string> = {
  dash: '<path d="M3 12h7V3H3zM14 21h7v-9h-7zM14 8h7V3h-7zM3 21h7v-5H3z"/>',
  farms: '<path d="M3 21V10l9-6 9 6v11"/><path d="M9 21v-7h6v7"/>',
  harvest:
    '<path d="M12 21V9"/><path d="M12 9s0-6 6-6c0 0 0 6-6 6z"/><path d="M12 13s0-5-6-5c0 0 0 5 6 5z"/>',
  lots: '<path d="M20 7 12 3 4 7v10l8 4 8-4z"/><path d="M4 7l8 4 8-4M12 11v10"/>',
  lot: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>',
  ops: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
  gate: '<path d="M3 21V6l9-3 9 3v15"/><path d="M3 21h18M9 21v-6h6v6"/>',
  weigh:
    '<path d="M12 3v18M5 8h14"/><path d="M5 8l-3 7a3 3 0 0 0 6 0z"/><path d="M19 8l-3 7a3 3 0 0 0 6 0z"/>',
  qc: '<path d="M9 3h6M10 3v5l-4 9a2 2 0 0 0 2 3h8a2 2 0 0 0 2-3l-4-9V3"/><path d="M7 16h10"/>',
  grade: '<path d="M3 6h18M7 12h10M10 18h4"/>',
  zones:
    '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  place:
    '<path d="M21 8 12 4 3 8v8l9 4 9-4z"/><path d="M3 8l9 4 9-4M12 12v8"/>',
  cond: '<path d="M14 14V5a2 2 0 0 0-4 0v9a4 4 0 1 0 4 0z"/>',
  exc: '<path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 2 18a2 2 0 0 0 1.7 3h16.6a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>',
  disp: '<path d="M1 3h15v13H1z"/><path d="M16 8h4l3 3v5h-7z"/><circle cx="5.5" cy="18.5" r="2"/><circle cx="18.5" cy="18.5" r="2"/>',
  trials:
    '<path d="M9 2v7L4 19a2 2 0 0 0 2 3h12a2 2 0 0 0 2-3l-5-10V2"/><path d="M8 2h8M7 15h10"/>',
  trial: '<path d="M3 3v18h18"/><path d="M7 15l4-5 3 3 5-7"/>',
  obs: '<path d="M12 20h9M3 20h4l11-11a2.8 2.8 0 0 0-4-4L3 16z"/>',
  port: '<path d="M3 3v18h18"/><rect x="7" y="11" width="3" height="7"/><rect x="13" y="6" width="3" height="12"/>',
  apps: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 13h6M9 17h4"/>',
  coll: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/><path d="M11 8v6M8 11h6"/>',
  lien: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  claims:
    '<path d="M9 12l2 2 4-4"/><path d="M12 3l8 4v6c0 4.5-3.2 7.8-8 9-4.8-1.2-8-4.5-8-9V7z"/>',
  evid: '<path d="M4 4h16v16H4z"/><path d="M8 8h8M8 12h8M8 16h4"/><circle cx="17" cy="17" r="3" fill="none"/>',
  source: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
  ex: '<path d="M4 4h16v16H4z"/><path d="M9 9h6v6"/><path d="M9 15l6-6"/>',
  ship: '<path d="M3 18h18M5 18V9l7-4 7 4v9"/><path d="M9 18v-5h6v5"/>',
  cust: '<path d="M12 2 3 7v6c0 5 4 8 9 9 5-1 9-4 9-9V7z"/><path d="M9 12l2 2 4-4"/>',
  transit:
    '<circle cx="12" cy="10" r="3"/><path d="M12 22s8-6 8-12a8 8 0 1 0-16 0c0 6 8 12 8 12z"/>',
  lookup:
    '<path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3z"/><path d="M14 14h3v3h-3zM18 18h3v3h-3z"/>',
  pub: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/>',
  login:
    '<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><path d="M10 17l5-5-5-5M15 12H3"/>',
  bell: '<path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>',
  srch: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
  chev: '<path d="M9 18l6-6-6-6"/>',
  back: '<path d="M15 18l-6-6 6-6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  down: '<path d="M12 3v14M6 13l6 6 6-6M4 21h16"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  box: '<path d="M21 8 12 4 3 8v8l9 4 9-4z"/><path d="M3 8l9 4 9-4"/>',
  flask: '<path d="M10 2v7L4 20h16L14 9V2"/><path d="M8 2h8"/>',
  in: '<path d="M12 5v14M5 12l7 7 7-7"/>',
  lab: '<path d="M9 3h6M10 3v5l-4 8a2 2 0 0 0 2 3h8a2 2 0 0 0 2-3l-4-8V3"/>',
  cam: '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
  print:
    '<path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v8H6z"/>',
  arr: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  up: '<path d="M18 15l-6-6-6 6"/>',
  dn: '<path d="M6 9l6 6 6-6"/>',
  sig: '<path d="M2 20h20M4 16l4-8 4 5 3-3 5 6"/>',
};

export type IconName = keyof typeof ICON_PATHS;

interface PanelIconProps {
  name: string;
  className?: string;
}

/**
 * The paths above are a static constant in this file - never user input - so
 * injecting them is safe, and it keeps the set to one line each instead of
 * three hundred hand-converted JSX elements.
 */
const PanelIcon = ({ name, className = "icn" }: PanelIconProps) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    dangerouslySetInnerHTML={{ __html: ICON_PATHS[name] ?? "" }}
  />
);

export default PanelIcon;
