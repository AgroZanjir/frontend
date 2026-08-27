/**
 * The one place the API's vocabulary meets the panels'.
 *
 * The backend speaks in full words and base units - `net_weight_g`,
 * `valuation_minor`, `amount_minor` - because that is what a system of record
 * must store. The screens speak the prototype's shorthand and think in
 * kilograms and sum. Everything that translates between the two lives here,
 * so a field rename on either side costs one file.
 *
 * Three conversions worth naming, because getting them wrong is expensive:
 *
 *   grams -> kilograms       every quantity the screens show
 *   minor units -> major     money, per currency (UZS and USD have 2, JPY 0)
 *   codes -> array indices   `Lot.f` and `PlatformUser.org`, which the
 *                            prototype defined as positions in a list
 */

import api from "@/lib/api";
import userStore from "@/store/UserStore";
import type {
  Arrival,
  AuditEntry,
  Cap,
  Claim,
  Doc,
  Excursion,
  ExportContract,
  Farm,
  FinanceApp,
  Grant,
  Hub,
  Lien,
  Lot,
  LotEvent,
  LotStatus,
  Notif,
  Org,
  OrgTypeDef,
  PlatformUser,
  Product,
  ProductCode,
  QcRecord,
  RoleGroup,
  Shipment,
  TrialDetail,
  TrialSeries,
  TrialSummary,
  VCheck,
  Zone,
  ZoneMode,
} from "@/lib/panel-types";
import type { PanelData } from "@/lib/panel-data";

/* ===== units ===== */

const kg = (grams: number | null | undefined): number =>
  Math.round(((grams ?? 0) / 1000) * 100) / 100;

/** Minor units to major. JPY has no minor unit, which is why this is a table. */
const MINOR: Record<string, number> = { UZS: 100, USD: 100, JPY: 1 };
const major = (minor: number | null | undefined, currency = "UZS"): number =>
  (minor ?? 0) / (MINOR[currency] ?? 100);

const num = (value: string | number | null | undefined): number =>
  value === null || value === undefined ? 0 : Number(value);

/** `2026-08-14T07:42:00+05:00` as the panels write it: `2026-08-14 07:42`. */
const stamp = (iso: string | null | undefined): string => {
  if (!iso) return "";
  const at = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${at.getFullYear()}-${pad(at.getMonth() + 1)}-${pad(at.getDate())} ` +
    `${pad(at.getHours())}:${pad(at.getMinutes())}`
  );
};

const clock = (iso: string | null | undefined): string => stamp(iso).slice(11);
const day = (iso: string | null | undefined): string =>
  (iso ?? "").slice(0, 10);

/* ===== what the endpoints return ===== */

interface Rows<T> {
  results: T[];
}

interface ApiReference {
  products: {
    code: string;
    name_uz: string;
    name_ru: string;
    name_en: string;
    variety: string;
    hs_code: string;
  }[];
  facilities: { code: string; name: string; region: string }[];
  zones: ApiZone[];
  farms: {
    code: string;
    name: string;
    owner_name: string;
    region: string;
    district: string;
    hectares: string;
    certifications: string[];
    lot_count: number;
  }[];
  org_types: {
    code: string;
    label_key: string;
    icon: string;
    required_checks: string[];
    licence_register: string;
  }[];
  capabilities: { code: string; label_key: string }[];
  role_groups: {
    group_key: string;
    roles: {
      code: string;
      label_key: string;
      scope: string;
      capabilities: string[];
    }[];
  }[];
  verification_checks: {
    code: string;
    label_key: string;
    register: string;
    mode: "auto" | "manual";
  }[];
}

interface ApiZone {
  code: string;
  mode: ZoneMode;
  capacity_g: number;
  used_g: number;
  temp_c: string | null;
  rh_pct: string | null;
  target_temp_c: string;
  target_rh_pct: string;
  off_band: boolean;
}

interface ApiLot {
  code: string;
  product: string;
  farm: string | null;
  net_weight_g: number;
  grade: string;
  status: LotStatus;
  zone: string | null;
  position: string;
  harvested_on: string | null;
  placed_at: string | null;
  sell_by: string | null;
  pledged: boolean;
  trial_arm: string;
  valuation_minor: number;
  valuation_currency: string;
}

interface ApiEvent {
  sequence: number;
  type: string;
  occurred_at: string;
  actor: string;
  facility: string;
  payload: Record<string, unknown>;
  severity: string;
}

/* ===== mappers ===== */

const toProducts = (rows: ApiReference["products"]) =>
  Object.fromEntries(
    rows.map((p) => [
      p.code,
      {
        uz: p.name_uz,
        ru: p.name_ru,
        en: p.name_en,
        v: p.variety,
        hs: p.hs_code,
      },
    ]),
  ) as Record<ProductCode, Product>;

const toZone = (z: ApiZone): Zone => ({
  c: z.code,
  m: z.mode,
  cap: kg(z.capacity_g),
  used: kg(z.used_g),
  t: num(z.temp_c),
  rh: num(z.rh_pct),
  tt: num(z.target_temp_c),
  rt: num(z.target_rh_pct),
  ...(z.off_band ? { dev: true } : {}),
});

const toFarm = (f: ApiReference["farms"][number]): Farm => ({
  c: f.code,
  n: f.name,
  o: f.owner_name,
  r: f.region,
  d: f.district,
  ha: num(f.hectares),
  certs: f.certifications,
  lots: f.lot_count,
});

const toLot = (l: ApiLot, farmIndex: Map<string, number>): Lot => ({
  c: l.code,
  p: l.product as ProductCode,
  f: farmIndex.get(l.farm ?? "") ?? 0,
  net: kg(l.net_weight_g),
  g: l.grade,
  st: l.status,
  z: l.zone,
  ...(l.position ? { pos: l.position } : {}),
  h: day(l.harvested_on),
  pl: day(l.placed_at) || null,
  u: l.sell_by,
  // An overlay, never a status - the API computes it from live liens.
  pledge: l.pledged,
  ...(l.trial_arm ? { trial: l.trial_arm as "zeroco" | "control" } : {}),
  val: major(l.valuation_minor, l.valuation_currency),
});

/**
 * Icon and tone per event type.
 *
 * The prototype stored these on each event. They are presentation, so they
 * belong here and not in the database: an event's meaning does not change
 * because a designer picks a different glyph.
 */
const EVENT_ICON: Record<string, string> = {
  registered: "in",
  sampled: "lab",
  graded: "check",
  placed: "box",
  removed: "out",
  trial_start: "flask",
  trial_observed: "flask",
  pledged: "lock",
  lien_released: "unlock",
  inspected: "lab",
  excursion: "alert",
  excursion_resolved: "check",
  dispatched: "ship",
  delivered: "check",
  settled: "money",
  written_off: "alert",
  claim_filed: "claims",
  document_issued: "doc",
  split: "grade",
  split_from: "grade",
};

const toEvent = (e: ApiEvent): LotEvent => ({
  t: e.type,
  at: stamp(e.occurred_at),
  by: e.actor,
  ic: EVENT_ICON[e.type] ?? "dot",
  // The sentence is composed in the reader's language at render time, from
  // `payload`. The prototype stored it as Uzbek prose, which a Russian broker
  // read in Uzbek.
  m: "",
  payload: e.payload,
  ...(e.severity === "accept" ? { acc: true } : {}),
  ...(e.severity === "warn" ? { warn: true } : {}),
});

/** The lot the passport screens open. See `loadPanelData`. */
export const PASSPORT_LOT = "AZ-2026-SMQ-0412";

/* ===== the loader ===== */

/**
 * One round trip per collection, all in parallel.
 *
 * Deliberately not one bootstrap endpoint: these are ordinary REST resources
 * that other clients will want individually, and the browser opens six
 * connections anyway. What it is not is one request per row.
 */
export const loadPanelData = async (): Promise<PanelData> => {
  const [
    reference,
    lots,
    arrivals,
    trials,
    applications,
    liens,
    claims,
    excursions,
    exports,
    shipments,
    notifications,
  ] = await Promise.all([
    api.get<ApiReference>("/panels/reference/"),
    api.get<Rows<ApiLot>>("/panels/lots/"),
    api.get<Rows<Record<string, never>>>("/panels/arrivals/?open=1"),
    api.get<Rows<Record<string, never>>>("/panels/trials/"),
    api.get<Rows<Record<string, never>>>("/panels/finance/applications/"),
    api.get<Rows<Record<string, never>>>("/panels/finance/liens/"),
    api.get<Rows<Record<string, never>>>("/panels/claims/"),
    api.get<Rows<Record<string, never>>>("/panels/excursions/"),
    api.get<Rows<Record<string, never>>>("/panels/exports/"),
    api.get<Rows<Record<string, never>>>("/panels/shipments/"),
    api.get<Rows<Record<string, never>>>("/panels/notifications/"),
  ]);

  const farms = reference.farms.map(toFarm);
  const farmIndex = new Map(farms.map((f, index) => [f.c, index]));
  const lotRows = lots.results.map((l) => toLot(l, farmIndex));

  // The administration screens are a platform role's. Asking for them as a
  // farmer produced four 403s per session - the client knew the answer before
  // it asked, and asking anyway is how a console fills with red lines that
  // mean nothing.
  const admin = isPlatformStaff() ? await loadAdministration() : EMPTY_ADMIN;

  // The two screens that read one record in depth. Fetched here so every
  // screen can render from one context; each is a single row.
  //
  // The passport screens open one fully-documented lot - the same one the
  // prototype used - because a passport of a lot with three events shows
  // nothing worth looking at. If the seeded dataset is not present, whichever
  // lot the caller can see comes first.
  const flagship =
    lotRows.find((l) => l.c === PASSPORT_LOT)?.c ?? lotRows[0]?.c;

  // Which trial the comparison screen opens on. Newest-first would hand it
  // TR-GRAPE-03 - planned, no arms yet - and draw an empty chart. The screen
  // is about a comparison, so it wants a trial that has two arms and has
  // started.
  const trialRows = trials.results as any[];
  const comparison =
    trialRows.find((t) => t.status === "running" && t.arms >= 2) ??
    trialRows.find((t) => t.arms >= 2) ??
    trialRows[0];

  // Which excursion the hub and insurer screens open on. The insurer's screen
  // builds a claim from it, so the excursion an open claim already names wins;
  // failing that, the worst one. Newest-first would show a minor blip while the
  // claim under review was about a critical breach in another room.
  const excursionRows = excursions.results as any[];
  const claimed = (claims.results as any[]).find((c) => c.excursion);
  const SEVERITY = ["minor", "major", "critical"];
  const incident =
    excursionRows.find((e) => e.code === claimed?.excursion) ??
    [...excursionRows].sort(
      (a, b) => SEVERITY.indexOf(b.severity) - SEVERITY.indexOf(a.severity),
    )[0];
  const [passport, trial, excursion, shipment, documents] = await Promise.all([
    flagship ? api.get<any>(`/panels/lots/${flagship}/`) : null,
    comparison ? api.get<any>(`/panels/trials/${comparison.code}/`) : null,
    incident ? api.get<any>(`/panels/excursions/${incident.code}/`) : null,
    shipments.results.length
      ? api.get<any>(`/panels/shipments/${(shipments.results[0] as any).code}/`)
      : null,
    api.get<Rows<any>>("/panels/documents/?subject_type=export_contract"),
  ]);

  const orgIndex = new Map(admin.ORGS.map((o, index) => [o.c, index]));

  return {
    PRODUCTS: toProducts(reference.products),
    HUBS: reference.facilities.map((f): Hub => ({
      code: f.code,
      name: f.name,
      region: f.region,
    })),
    ZONES: reference.zones.map(toZone),
    FARMS: farms,
    LOTS: lotRows,
    ARRIVALS: arrivals.results.map((a: any): Arrival => ({
      t: clock(a.expected_at),
      v: a.vehicle,
      farm: farmIndex.get(a.farm) ?? 0,
      p: a.product,
      est: kg(a.estimated_weight_g),
      st: a.status === "weighing" ? "weighing" : "queued",
    })),
    EVENTS: (passport?.events ?? []).map(toEvent),
    QC: (passport?.qc ?? []).map((q: any): QcRecord => ({
      s: q.stage,
      d: q.inspected_on,
      by: q.inspector,
      brix: num(q.measurements?.brix),
      firm: num(q.measurements?.firmness_n),
      def: num(q.defect_pct),
      g: q.grade_assigned,
    })),
    TRIAL: toTrial(trial),
    TRIALS: trials.results.map((t: any): TrialSummary => ({
      c: t.code,
      p: t.product,
      st: t.status,
      d0: t.started_on,
      day: t.day,
      arms: t.arms,
      obs: t.observations,
    })),
    FINAPPS: applications.results.map((a: any): FinanceApp => ({
      c: a.code,
      app: a.applicant,
      kind: a.kind,
      amt: major(a.amount_minor, a.currency),
      cur: a.currency,
      st: a.status,
      lots: a.lots,
      ltv: num(a.ltv_pct),
      date: a.applied_on,
      lender: a.lender,
    })),
    LIENS: liens.results.map((l: any): Lien => ({
      id: l.id,
      lot: l.lot,
      fa: l.application,
      amt: major(l.amount_minor, l.currency),
      since: l.created_on,
      st: l.status,
      ...(l.released_at ? { rel: day(l.released_at) } : {}),
    })),
    CLAIMS: claims.results.map((c: any): Claim => ({
      c: c.code,
      pol: c.policy,
      kind: c.kind,
      lot: c.lot,
      ev: c.excursion,
      amt: major(c.amount_minor, c.currency),
      st: c.status,
      date: c.filed_on,
      holder: c.holder,
    })),
    EXCURSION: toExcursion(excursion),
    EXPORTS: exports.results.map((e: any): ExportContract => ({
      c: e.code,
      buyer: e.buyer,
      country: e.country,
      p: e.product,
      qty: kg(e.quantity_g),
      inc: e.incoterm,
      pay: e.payment_terms,
      val: major(e.amount_minor, e.currency),
      cur: e.currency,
      st: e.status,
      ship: e.shipment,
    })),
    SHIPMENT: toShipment(shipment),
    DOCS: documents.results.map((d: any): Doc => ({
      t: d.type,
      n: d.name_key || `doc_${d.type}`,
      st: d.status === "issued" ? "issued" : "pending",
      exp: d.expires_on,
      ref: d.reference || null,
    })),
    NOTIFS: notifications.results.map((n: any): Notif => ({
      id: n.id,
      read: Boolean(n.read_at),
      lvl: n.level,
      k: n.message_key,
      v: n.subject,
      at: clock(n.occurred_at),
    })),
    CAPS: reference.capabilities.map((c): Cap => [c.code, c.label_key]),
    ORGTYPES: reference.org_types.map((t): OrgTypeDef => [
      t.code,
      t.label_key,
      t.icon,
    ]),
    ROLES: reference.role_groups.map((g): RoleGroup => ({
      g: g.group_key,
      items: g.roles.map((r) => [r.code, r.label_key, r.capabilities, r.scope]),
    })),
    ROLE_COUNT: reference.role_groups.reduce(
      (total, group) => total + group.roles.length,
      0,
    ),
    VCHECKS: reference.verification_checks.map((c): VCheck => [
      c.code,
      c.label_key,
      c.register || null,
      c.mode,
    ]),
    VREQ: Object.fromEntries(
      reference.org_types.map((t) => [t.code, t.required_checks]),
    ),
    VLIC: Object.fromEntries(
      reference.org_types
        .filter((t) => t.licence_register)
        .map((t) => [t.code, t.licence_register]),
    ),
    VSTATE: admin.VSTATE,
    ORGS: admin.ORGS,
    USERS: admin.USERS.map((u) => ({
      ...u,
      org: orgIndex.get(u.orgCode) ?? 0,
    })),
    AUDIT: admin.AUDIT,
    GRANTS: admin.GRANTS,
    findLot: (code) => lotRows.find((l) => l.c === code) as Lot,
    findZone: (code) =>
      reference.zones.map(toZone).find((z) => z.c === code) as Zone,
    findHub: (code) =>
      reference.facilities
        .map((f): Hub => ({ code: f.code, name: f.name, region: f.region }))
        .find((h) => h.code === code),
  };
};

const toTrial = (trial: any): TrialDetail => {
  const empty: TrialSeries = { c: [], z: [] };
  if (!trial) {
    return {
      code: "",
      p: "melon",
      started: "",
      hub: "",
      z: { lot: "", zone: "", qty: 0 },
      c: { lot: "", zone: "", qty: 0 },
      days: [],
      observed: 0,
      s: { loss: empty, waste: empty, firm: empty },
    };
  }

  const zeroco = trial.arms?.zeroco;
  const control = trial.arms?.control;
  /** Measured points first, then the modelled curve for the rest of the run. */
  const series = (metric: "loss" | "waste" | "firm"): TrialSeries => ({
    c: control?.projection?.[metric] ?? [],
    z: zeroco?.projection?.[metric] ?? [],
  });

  return {
    code: trial.code,
    p: trial.product,
    started: trial.started_on,
    hub: trial.facility,
    z: {
      lot: zeroco?.lot ?? "",
      zone: zeroco?.zone ?? "",
      qty: kg(zeroco?.quantity_g),
    },
    c: {
      lot: control?.lot ?? "",
      zone: control?.zone ?? "",
      qty: kg(control?.quantity_g),
    },
    days: trial.schedule_days ?? [],
    // How many sampling days have actually been recorded. Everything past this
    // point is drawn dashed, because it has not happened yet.
    observed: trial.observed_points ?? 0,
    s: { loss: series("loss"), waste: series("waste"), firm: series("firm") },
  };
};

const toExcursion = (excursion: any): Excursion => {
  if (!excursion) {
    return {
      c: "",
      zone: "",
      metric: "temp",
      from: "",
      to: "",
      peak: 0,
      thr: 0,
      durMin: 0,
      sev: "minor",
      lots: [],
      sensor: "",
      trace: [],
      resolved: false,
    };
  }
  return {
    c: excursion.code,
    zone: excursion.scope_code,
    metric: excursion.metric,
    from: stamp(excursion.started_at),
    to: stamp(excursion.ended_at),
    peak: num(excursion.peak_value),
    thr: num(excursion.threshold),
    durMin: excursion.duration_minutes,
    sev: excursion.severity,
    lots: excursion.lots ?? [],
    sensor: excursion.sensor_id,
    trace: excursion.trace ?? [],
    resolved: Boolean(excursion.resolved),
  };
};

const toShipment = (shipment: any): Shipment => {
  if (!shipment) {
    return {
      c: "",
      ex: "",
      carrier: "",
      mode: "",
      veh: "",
      set: 0,
      route: "",
      dep: "",
      eta: "",
      st: "",
      km: 0,
      temps: [],
      lots: [],
    };
  }
  return {
    c: shipment.code,
    ex: shipment.export_contract,
    carrier: shipment.carrier,
    mode: shipment.mode,
    veh: shipment.vehicle,
    set: num(shipment.set_point_c),
    route: shipment.route,
    dep: stamp(shipment.departs_at),
    eta: stamp(shipment.eta),
    st: shipment.status,
    km: shipment.distance_km,
    temps: (shipment.temps ?? []).map(num),
    lots: (shipment.lines ?? []).map((line: any) => ({
      c: line.lot,
      qty: kg(line.quantity_g),
    })),
  };
};

/* ===== administration ===== */

interface AdminData {
  ORGS: Org[];
  USERS: (PlatformUser & { orgCode: string })[];
  AUDIT: AuditEntry[];
  GRANTS: Grant[];
  VSTATE: Record<string, string>;
}

const EMPTY_ADMIN: AdminData = {
  ORGS: [],
  USERS: [],
  AUDIT: [],
  GRANTS: [],
  VSTATE: {},
};

/** Only a platform role may read the administration collections. */
const isPlatformStaff = (): boolean =>
  (userStore.getState().user?.memberships ?? []).some(
    (m) => m.scope === "platform",
  );

/**
 * The administration collections.
 *
 * Still guarded here as well as at the call site: a 403 is the system working,
 * not an error to show a farmer, so it resolves to empty collections rather
 * than failing the whole load.
 */
const loadAdministration = async (): Promise<AdminData> => {
  try {
    const [organisations, users, audit, grants] = await Promise.all([
      api.get<Rows<any>>("/panels/admin/organisations/"),
      api.get<Rows<any>>("/panels/admin/users/"),
      api.get<Rows<any>>("/panels/admin/audit/"),
      api.get<Rows<any>>("/panels/admin/grants/"),
    ]);

    const orgs: Org[] = organisations.results.map((o) => ({
      c: o.code,
      n: o.name,
      t: o.type,
      tin: o.tin,
      r: o.region,
      users: o.users,
      st: o.status,
      since: o.verified_on,
      by: o.verified_by || null,
    }));

    // The organisation the verification screen opens on: the one in review.
    const underReview = orgs.find((o) => o.st === "review");
    let checks: Record<string, string> = {};
    if (underReview) {
      const detail = await api.get<any>(
        `/panels/admin/organisations/${underReview.c}/`,
      );
      checks = Object.fromEntries(
        Object.entries(detail.checks ?? {}).map(([code, value]) => [
          code,
          (value as { result: string }).result,
        ]),
      );
    }

    return {
      ORGS: orgs,
      USERS: users.results.map((u) => ({
        id: u.id,
        n: u.name,
        orgCode: u.org,
        org: 0,
        role: u.role,
        oneid: u.oneid,
        eimzo: u.eimzo,
        last: stamp(u.last_seen_at) || null,
        st: u.status,
        ini: u.initials,
      })),
      AUDIT: audit.results.map((a) => ({
        at: stamp(a.occurred_at),
        who: a.who,
        org: a.org,
        act: a.action_key,
        obj: a.object_ref,
        k: a.capability,
      })),
      GRANTS: grants.results.map((g) => ({
        id: g.id,
        org: g.org,
        scope: g.scope_key,
        fields: g.fields_key,
        st: g.status,
        until: g.expires_on,
        by: g.basis === "law" ? "g_by_law" : "g_by_owner",
      })),
      VSTATE: checks,
    };
  } catch {
    return EMPTY_ADMIN;
  }
};
