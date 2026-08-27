/**
 * The panel manifest.
 *
 * One entry per approved panel, in the order the prototype numbers them. The
 * panel index, the sidebar, the routes, the breadcrumbs and the access checks
 * are all generated from this list - adding a screen is an entry here plus a
 * component, not a hunt through five files.
 *
 * A panel is not a module. `lib/modules.ts` lists the backend clusters that
 * own the data; a panel is one audience's way through several of them. The
 * bank panel reads lots, storage and finance; the lot passport shows quality,
 * storage and finance on one page. Keeping the two lists apart is what lets
 * the clusters stay independent (rule 6 in the root README) while the panels
 * stay whole.
 */

import type { PartyType, Role } from "@/store/UserStore";

export interface PanelScreen {
  /** The prototype's screen id. Kept so the two can be compared screen by screen. */
  id: string;
  /** Route segment under the panel's path. Empty string means the index. */
  slug: string;
  /** i18n key under the `panel` namespace. */
  labelKey: string;
  icon: string;
  /** Rendered with a count badge in the sidebar, as the prototype does. */
  badge?: number;
}

export interface PanelDef {
  /** Single-letter id, as in the prototype. */
  id: string;
  /** Two-digit number the prototype and the client's deck both use. */
  no: string;
  path: string;
  /** i18n key for the panel's name. */
  key: string;
  /** i18n key for the one-line description. */
  descKey: string;
  icon: string;
  screens: PanelScreen[];
  /**
   * Screens owned by another panel but reachable from this one - the lot
   * passport opened from a hub, bank or export table. They get a route here so
   * the reader never leaves the panel they are working in.
   */
  extra?: PanelScreen[];
  /** Role i18n keys shown as chips on the panel index. */
  roleKeys: string[];
  /** Party types whose members belong in this panel. */
  parties: PartyType[];
  /** Roles that may open it regardless of party. */
  roles: Role[];
  /** True for the public panel, which needs no session at all. */
  open?: boolean;
  /** True for the administration panel: a platform role, or nothing. */
  platformOnly?: boolean;
}

/** The lot passport, reachable from four panels. */
const LOT_PASSPORT: PanelScreen = {
  id: "f_lot",
  slug: "lot",
  labelKey: "n_lot",
  icon: "lot",
};

export const PANELS: PanelDef[] = [
  {
    id: "f",
    no: "01",
    path: "/farmer",
    key: "pf",
    descKey: "pd_f",
    icon: "harvest",
    screens: [
      { id: "f_dash", slug: "", labelKey: "n_dash", icon: "dash" },
      { id: "f_farms", slug: "farms", labelKey: "n_farms", icon: "farms" },
      {
        id: "f_harvest",
        slug: "harvest",
        labelKey: "n_harvest",
        icon: "harvest",
      },
      { id: "f_lots", slug: "lots", labelKey: "n_lots", icon: "lots" },
      LOT_PASSPORT,
    ],
    roleKeys: ["r_oown", "r_fmgr", "r_frec", "r_agro"],
    parties: ["farmer", "cooperative", "aggregator"],
    roles: ["org_owner", "farm_manager", "field_recorder", "agronomist"],
  },
  {
    id: "h",
    no: "02",
    path: "/hub",
    key: "ph",
    descKey: "pd_h",
    icon: "ops",
    screens: [
      { id: "h_ops", slug: "", labelKey: "n_ops", icon: "ops" },
      { id: "h_gate", slug: "gate", labelKey: "n_gate", icon: "gate" },
      { id: "h_weigh", slug: "weigh", labelKey: "n_weigh", icon: "weigh" },
      { id: "h_qc", slug: "qc", labelKey: "n_qc", icon: "qc" },
      { id: "h_grade", slug: "grade", labelKey: "n_grade", icon: "grade" },
      { id: "h_zones", slug: "zones", labelKey: "n_zones", icon: "zones" },
      { id: "h_place", slug: "place", labelKey: "n_place", icon: "place" },
      { id: "h_cond", slug: "conditions", labelKey: "n_cond", icon: "cond" },
      {
        id: "h_exc",
        slug: "excursion",
        labelKey: "n_exc",
        icon: "exc",
        badge: 1,
      },
      { id: "h_disp", slug: "dispatch", labelKey: "n_disp", icon: "disp" },
    ],
    extra: [LOT_PASSPORT],
    roleKeys: ["r_hmgr", "r_gate", "r_qc", "r_pack", "r_wh", "r_disp"],
    parties: ["operator", "processor"],
    roles: [
      "hub_manager",
      "gate_operator",
      "qc_inspector",
      "packhouse_supervisor",
      "warehouse_operator",
      "dispatch_coordinator",
    ],
  },
  {
    id: "z",
    no: "03",
    path: "/trials",
    key: "pz",
    descKey: "pd_z",
    icon: "trials",
    screens: [
      { id: "z_list", slug: "", labelKey: "n_trials", icon: "trials" },
      { id: "z_cmp", slug: "compare", labelKey: "n_trial", icon: "trial" },
      { id: "z_obs", slug: "observe", labelKey: "n_obs", icon: "obs" },
    ],
    roleKeys: ["r_qc", "r_hmgr"],
    parties: ["operator", "laboratory"],
    roles: ["qc_inspector", "hub_manager", "lab_technician", "lab_approver"],
  },
  {
    id: "b",
    no: "04",
    path: "/bank",
    key: "pb",
    descKey: "pd_b",
    icon: "port",
    screens: [
      { id: "b_port", slug: "", labelKey: "n_port", icon: "port" },
      { id: "b_apps", slug: "applications", labelKey: "n_apps", icon: "apps" },
      { id: "b_app", slug: "application", labelKey: "n_app", icon: "app" },
      { id: "b_coll", slug: "collateral", labelKey: "n_coll", icon: "coll" },
      { id: "b_lien", slug: "liens", labelKey: "n_lien", icon: "lien" },
    ],
    extra: [LOT_PASSPORT],
    roleKeys: ["r_credit", "r_risk", "r_collin", "r_capp"],
    parties: ["bank"],
    roles: [
      "credit_officer",
      "risk_analyst",
      "collateral_inspector",
      "credit_approver",
    ],
  },
  {
    id: "i",
    no: "05",
    path: "/insurance",
    key: "pi",
    descKey: "pd_i",
    icon: "claims",
    screens: [
      { id: "i_claims", slug: "", labelKey: "n_claims", icon: "claims" },
      { id: "i_claim", slug: "claim", labelKey: "n_claim", icon: "claims" },
      { id: "i_evid", slug: "evidence", labelKey: "n_evid", icon: "evid" },
    ],
    roleKeys: ["r_uw", "r_claims"],
    parties: ["insurer"],
    roles: ["underwriter", "claims_adjuster"],
  },
  {
    id: "e",
    no: "06",
    path: "/export",
    key: "pe",
    descKey: "pd_e",
    icon: "ship",
    screens: [
      { id: "e_dash", slug: "", labelKey: "n_dash", icon: "dash" },
      {
        id: "e_source",
        slug: "sourcing",
        labelKey: "n_source",
        icon: "source",
      },
      { id: "e_ex", slug: "contract", labelKey: "n_ex", icon: "ex" },
      { id: "e_ship", slug: "shipment", labelKey: "n_ship", icon: "ship" },
      { id: "e_cust", slug: "customs", labelKey: "n_cust", icon: "cust" },
      {
        id: "e_transit",
        slug: "transit",
        labelKey: "n_transit",
        icon: "transit",
      },
    ],
    extra: [LOT_PASSPORT],
    roleKeys: ["r_comm", "r_doc", "r_logco"],
    parties: ["exporter", "cooperative", "aggregator"],
    roles: [
      "commercial_manager",
      "documentation_officer",
      "logistics_coordinator",
    ],
  },
  {
    id: "p",
    no: "07",
    path: "/public",
    key: "pp",
    descKey: "pd_p",
    icon: "pub",
    screens: [
      { id: "p_lookup", slug: "", labelKey: "n_lookup", icon: "lookup" },
      { id: "p_pass", slug: "passport", labelKey: "n_public", icon: "pub" },
      { id: "p_login", slug: "signin", labelKey: "n_login", icon: "login" },
    ],
    roleKeys: ["pd_noreg"],
    parties: [],
    roles: [],
    open: true,
  },
  {
    id: "a",
    no: "08",
    path: "/admin",
    key: "pa",
    descKey: "pd_a",
    icon: "lien",
    screens: [
      { id: "a_dash", slug: "", labelKey: "n_adash", icon: "dash" },
      {
        id: "a_orgs",
        slug: "organisations",
        labelKey: "n_orgs",
        icon: "farms",
      },
      { id: "a_org", slug: "organisation", labelKey: "n_org", icon: "check" },
      { id: "a_users", slug: "users", labelKey: "n_users", icon: "apps" },
      { id: "a_user", slug: "user", labelKey: "n_user", icon: "lot" },
      { id: "a_roles", slug: "roles", labelKey: "n_roles", icon: "lien" },
      { id: "a_invite", slug: "invite", labelKey: "n_invite", icon: "plus" },
      { id: "a_audit", slug: "audit", labelKey: "n_audit", icon: "evid" },
      { id: "a_access", slug: "sharing", labelKey: "n_access", icon: "pub" },
    ],
    roleKeys: ["r_pown", "r_padmin", "r_verif", "r_auditor"],
    // No party type opens this one. Working *at* the operator's organisation
    // is not the same as running the platform, and a QC inspector at the hub
    // was being offered the administration panel because it was.
    parties: [],
    roles: [
      "platform_owner",
      "platform_admin",
      "verification_officer",
      "auditor",
    ],
    platformOnly: true,
  },
];

export const getPanel = (id: string): PanelDef | undefined =>
  PANELS.find((p) => p.id === id);

export const panelByPath = (pathname: string): PanelDef | undefined =>
  PANELS.find((p) => pathname === p.path || pathname.startsWith(`${p.path}/`));

/** Every screen a panel can render, its own and the ones it borrows. */
export const panelScreens = (p: PanelDef): PanelScreen[] => [
  ...p.screens,
  ...(p.extra ?? []),
];

/** Breadcrumb label for any screen, including one borrowed across panels. */
export const SCREEN_LABEL: Record<string, string> = PANELS.reduce(
  (acc, p) => {
    panelScreens(p).forEach((s) => {
      acc[`${p.path}/${s.slug}`.replace(/\/$/, "")] = s.labelKey;
    });
    return acc;
  },
  {} as Record<string, string>,
);

/**
 * Whether a session may open a panel.
 *
 * A convenience, not a security boundary: the API enforces the same rules,
 * because a route guard is one devtools edit away from being bypassed.
 */
/**
 * Roles that exist at every kind of organisation.
 *
 * These carry no craft of their own - an owner is an owner whether the
 * organisation is a farm or a bank - so for them, and only for them, the
 * organisation's type decides which panel is theirs.
 */
const GENERIC_ORG_ROLES = new Set([
  "org_owner",
  "org_admin",
  "org_member",
  "org_viewer",
]);

/**
 * May this person open this panel?
 *
 * The role decides, not the organisation's type. The two are not the same
 * thing and treating them as one is how a QC inspector at the hub ended up
 * being offered the administration panel: the hub is an `operator`
 * organisation, and the administration panel used to admit operators.
 *
 * A convenience, not a security boundary - the API enforces the same rule, and
 * the administration endpoints check for a platform role of their own.
 */
export const canOpenPanel = (
  panel: PanelDef,
  memberships: {
    partyType: PartyType;
    role: Role;
    scope?: string;
    capabilities?: string[];
  }[],
): boolean => {
  if (panel.open) return true;

  if (panel.platformOnly) {
    return memberships.some(
      (m) =>
        m.scope === "platform" &&
        (m.capabilities ?? []).some((c) =>
          ["administer", "verify", "audit"].includes(c),
        ),
    );
  }

  return memberships.some(
    (m) =>
      // The operator's own staff support every panel; that is what a platform
      // role is for.
      m.scope === "platform" ||
      panel.roles.includes(m.role) ||
      (GENERIC_ORG_ROLES.has(m.role) && panel.parties.includes(m.partyType)),
  );
};
