/**
 * The view models the panels are written against.
 *
 * Deliberately terse - `c`, `p`, `st` - because they came from the approved
 * prototype and forty screens are written in that vocabulary. The API speaks
 * in full words (`code`, `product`, `status`); `panel-api.ts` is the one file
 * that translates, so a rename on either side costs one module rather than
 * forty.
 *
 * Two shapes here are indices rather than codes - `Lot.f` into `FARMS`,
 * `PlatformUser.org` into `ORGS`. That is the prototype's doing, and it is
 * kept: the mapper resolves the index once per response, and the alternative
 * was touching every screen that renders a farm name.
 */

export type Lang = "uz" | "ru" | "en";

export type ProductCode =
  "melon" | "grape" | "cherry" | "apricot" | "tomato" | "pom";

export interface Product {
  uz: string;
  ru: string;
  en: string;
  /** Variety, as the trade names it. */
  v: string;
  /** Customs commodity code. */
  hs: string;
}

export interface Hub {
  code: string;
  name: string;
  region: string;
}

/** Storage mode: ZEROCO chamber, conventional cold, pre-cool, dry. */
export type ZoneMode = "zeroco" | "cold" | "pre" | "dry";

export interface Zone {
  c: string;
  m: ZoneMode;
  /** Capacity and fill, in kilograms. */
  cap: number;
  used: number;
  /** Current temperature and humidity, and their targets. */
  t: number;
  rh: number;
  tt: number;
  rt: number;
  /** Set when the zone is off its target band. */
  dev?: boolean;
}

export interface Farm {
  c: string;
  n: string;
  /** Owner or legal entity. */
  o: string;
  r: string;
  d: string;
  ha: number;
  certs: string[];
  lots: number;
}

export type LotStatus =
  | "registered"
  | "graded"
  | "stored"
  | "reserved"
  | "dispatched"
  | "settled"
  | "written_off";

export interface Lot {
  c: string;
  p: ProductCode;
  /** Index into FARMS. */
  f: number;
  /** Net weight in kilograms. One base unit, as the platform rules require. */
  net: number;
  g: string;
  st: LotStatus;
  z: string | null;
  pos?: string;
  /** Harvested, placed, and the end of the sales window. */
  h: string;
  pl: string | null;
  u: string | null;
  /** An encumbrance overlay, never a status - see rule 3 in the root README. */
  pledge: boolean;
  trial?: "zeroco" | "control";
  /** Value in UZS minor-unit-free demo terms. */
  val: number;
}

export interface Arrival {
  t: string;
  v: string;
  farm: number;
  p: ProductCode;
  est: number;
  st: "weighing" | "queued";
}

export interface LotEvent {
  t: string;
  at: string;
  by: string;
  /** Icon key, resolved by `PanelIcon`. */
  ic: string;
  /**
   * The rendered sentence. Empty for anything the API returned: the message is
   * composed from `payload` in the reader's language by `eventMessage()`. The
   * prototype stored Uzbek prose here, which a Russian-speaking broker read in
   * Uzbek.
   */
  m: string;
  /** What the event actually recorded. The message is derived from this. */
  payload?: Record<string, unknown>;
  acc?: boolean;
  warn?: boolean;
}

export interface QcRecord {
  s: string;
  d: string;
  by: string;
  brix: number;
  firm: number;
  def: number;
  g: string;
}

export interface TrialArm {
  lot: string;
  zone: string;
  qty: number;
}

export interface TrialSeries {
  /** Control arm, then the ZEROCO arm, sampled on `days`. */
  c: number[];
  z: number[];
}

export interface TrialDetail {
  code: string;
  p: ProductCode;
  started: string;
  hub: string;
  z: TrialArm;
  c: TrialArm;
  days: number[];
  /** How many of those observation points have actually been recorded. */
  observed: number;
  s: { loss: TrialSeries; waste: TrialSeries; firm: TrialSeries };
}

export interface TrialSummary {
  c: string;
  p: ProductCode;
  st: "running" | "planned" | "completed";
  d0: string;
  day: number;
  arms: number;
  obs: number;
}

export interface FinanceApp {
  c: string;
  app: string;
  kind: "inventory" | "pre_export";
  amt: number;
  cur: "UZS" | "USD";
  st: "submitted" | "review" | "disbursed" | "repaid";
  lots: string[];
  ltv: number;
  date: string;
  lender: string;
}

export interface Lien {
  lot: string;
  fa: string;
  amt: number;
  since: string;
  st: "active" | "released";
  rel?: string;
}

export interface Claim {
  c: string;
  pol: string;
  kind: "storage" | "cargo";
  lot: string;
  ev: string | null;
  amt: number;
  st: "review" | "approved" | "paid";
  date: string;
  holder: string;
}

export interface Excursion {
  c: string;
  zone: string;
  metric: string;
  from: string;
  to: string;
  peak: number;
  thr: number;
  /** Duration in minutes; the screens format it in the reader's language. */
  durMin: number;
  sev: string;
  lots: string[];
  sensor: string;
  trace: number[];
}

export interface ExportContract {
  c: string;
  buyer: string;
  country: "KZ" | "LV" | "AE";
  p: ProductCode;
  qty: number;
  inc: string;
  pay: "lc" | "cad" | "advance";
  val: number;
  cur: "USD";
  st: "in_progress" | "signed" | "shipped";
  ship: string | null;
}

export interface Shipment {
  c: string;
  ex: string;
  carrier: string;
  mode: string;
  veh: string;
  set: number;
  route: string;
  dep: string;
  eta: string;
  st: string;
  km: number;
  temps: number[];
  lots: { c: string; qty: number }[];
}

export interface Doc {
  t: string;
  /**
   * i18n key for the document's name. The prototype carried these as Uzbek
   * strings, which a Russian-speaking broker would have read in Uzbek.
   */
  n: string;
  st: "issued" | "pending";
  exp: string | null;
  ref: string | null;
}

export interface Notif {
  lvl: "crit" | "warn" | "info" | "good";
  k: string;
  v: string;
  at: string;
}

/** `[capability key, i18n key]`. */
export type Cap = [string, string];

/** `[org type code, i18n key, icon key]`. */
export type OrgTypeDef = [string, string, string];

/** `[role code, i18n key, capability keys, where the role lives]`. */
export type RoleDef = [string, string, string[], string];

export interface RoleGroup {
  g: string;
  items: RoleDef[];
}

/** `[check key, i18n key, register it reads, auto or manual]`. */
export type VCheck = [string, string, string | null, "auto" | "manual"];

export interface Org {
  c: string;
  n: string;
  t: string;
  tin: string;
  r: string;
  users: number;
  st: "verified" | "review" | "pending" | "rejected";
  since: string | null;
  by: string | null;
}

export interface PlatformUser {
  n: string;
  /** Index into ORGS. */
  org: number;
  role: string;
  oneid: boolean;
  eimzo: boolean;
  last: string | null;
  st: "active" | "invited" | "pending" | "suspended";
  ini: string;
}

export interface AuditEntry {
  at: string;
  who: string;
  org: string;
  /** Action i18n key: `a_viewed`, `a_pledged`, ... */
  act: string;
  /** What was acted on - a lot code, an org id, a person. */
  obj: string;
  /** The capability the action was exercised under. */
  k: string;
}

/** Data-sharing grants: which org may see which fields of whose data. */
export interface Grant {
  org: string;
  scope: string;
  fields: string;
  st: string;
  until: string | null;
  by: string;
}

/** Everything the panels read, in the vocabulary the screens are written in. */
export interface PanelData {
  PRODUCTS: Record<ProductCode, Product>;
  HUBS: Hub[];
  ZONES: Zone[];
  FARMS: Farm[];
  LOTS: Lot[];
  ARRIVALS: Arrival[];
  /** The event log of the lot the passport is showing. */
  EVENTS: LotEvent[];
  QC: QcRecord[];
  TRIAL: TrialDetail;
  TRIALS: TrialSummary[];
  FINAPPS: FinanceApp[];
  LIENS: Lien[];
  CLAIMS: Claim[];
  EXCURSION: Excursion;
  EXPORTS: ExportContract[];
  SHIPMENT: Shipment;
  DOCS: Doc[];
  NOTIFS: Notif[];
  CAPS: Cap[];
  ORGTYPES: OrgTypeDef[];
  ROLES: RoleGroup[];
  ROLE_COUNT: number;
  VCHECKS: VCheck[];
  VREQ: Record<string, string[]>;
  VLIC: Record<string, string>;
  VSTATE: Record<string, string>;
  /** Administration only; empty for anyone without a platform role. */
  ORGS: Org[];
  USERS: PlatformUser[];
  AUDIT: AuditEntry[];
  GRANTS: Grant[];
  findLot: (code: string) => Lot;
  findZone: (code: string | null) => Zone;
  findHub: (code: string) => Hub | undefined;
}
