/**
 * The website's own data.
 *
 * The public pages describe the programme rather than an operation, so they
 * carry their own list of produce, news, partners and roles. The one thing
 * they share with the panels is the demo lot: the hero card shows the same
 * `AZ-2026-SMQ-0412` an operator would see, which is the point of putting it
 * there.
 *
 * Produce carries a colour pair instead of a photograph. Those are deliberate
 * placeholders - designed, not missing - and they are what a real photo
 * replaces before launch.
 */

export interface ProduceItem {
  id: string;
  /** i18n key for the name. */
  k: string;
  /** Variety, as the trade names it. */
  v: string;
  hs: string;
  /** `[first month, last month]`, 1-indexed; may wrap across the new year. */
  season: [number, number];
  regions: string[];
  grades: string;
  /** Indicative annual tonnage. */
  vol: string;
  /** The gradient pair the placeholder composition is built from. */
  c: [string, string];
  certs: string[];
}

export const PRODUCE: ProduceItem[] = [
  {
    id: "melon",
    k: "w_p_melon",
    v: "Torpeda",
    hs: "0807.19",
    season: [6, 9],
    regions: ["Samarqand", "Xorazm"],
    grades: "A / B",
    vol: "12 400",
    c: ["#D8B84A", "#8FA83C"],
    certs: ["GlobalGAP"],
  },
  {
    id: "grape",
    k: "w_p_grape",
    v: "Husayni",
    hs: "0806.10",
    season: [7, 10],
    regions: ["Samarqand", "Toshkent"],
    grades: "A",
    vol: "23 800",
    c: ["#A8C25A", "#5E7C2E"],
    certs: ["GlobalGAP", "Organic"],
  },
  {
    id: "cherry",
    k: "w_p_cherry",
    v: "Bigarreau",
    hs: "0809.29",
    season: [5, 7],
    regions: ["Samarqand", "Farg‘ona"],
    grades: "A",
    vol: "4 200",
    c: ["#C2313F", "#7A1424"],
    certs: ["GlobalGAP"],
  },
  {
    id: "apricot",
    k: "w_p_apricot",
    v: "Subhoni",
    hs: "0809.10",
    season: [6, 8],
    regions: ["Samarqand", "Namangan"],
    grades: "A / B",
    vol: "9 600",
    c: ["#E09B3C", "#B85F1E"],
    certs: [],
  },
  {
    id: "pom",
    k: "w_p_pom",
    v: "Qizil anor",
    hs: "0810.90",
    season: [9, 11],
    regions: ["Surxondaryo", "Xorazm"],
    grades: "A",
    vol: "7 100",
    c: ["#C0364A", "#6E1526"],
    certs: ["GlobalGAP"],
  },
  {
    id: "persim",
    k: "w_p_persim",
    v: "Fuyu",
    hs: "0810.70",
    season: [10, 12],
    regions: ["Surxondaryo"],
    grades: "A / B",
    vol: "5 400",
    c: ["#E2802C", "#B24618"],
    certs: [],
  },
  {
    id: "tomato",
    k: "w_p_tomato",
    v: "Bella Rosa",
    hs: "0702.00",
    season: [3, 11],
    regions: ["Toshkent", "Jizzax"],
    grades: "A",
    vol: "31 200",
    c: ["#D6452F", "#8E1F1A"],
    certs: ["GlobalGAP"],
  },
  {
    id: "plum",
    k: "w_p_plum",
    v: "Stenli",
    hs: "0809.40",
    season: [7, 9],
    regions: ["Samarqand"],
    grades: "A / B",
    vol: "6 800",
    c: ["#7B4A87", "#3D2450"],
    certs: [],
  },
];

/** Month abbreviations. Intl would give these, but not in Uzbek Latin. */
export const MONTHS: Record<string, string[]> = {
  uz: [
    "yan",
    "fev",
    "mar",
    "apr",
    "may",
    "iyn",
    "iyl",
    "avg",
    "sen",
    "okt",
    "noy",
    "dek",
  ],
  ru: [
    "янв",
    "фев",
    "мар",
    "апр",
    "май",
    "июн",
    "июл",
    "авг",
    "сен",
    "окт",
    "ноя",
    "дек",
  ],
  en: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ],
};

export interface NewsItem {
  id: string;
  /** ISO date. The reader gets the month by name; the database gets this. */
  d: string;
  k: string;
  tag: string;
  c: [string, string];
}

export const NEWS: NewsItem[] = [
  {
    id: "n1",
    d: "2026-08-20",
    k: "w_n1",
    tag: "w_tag_pilot",
    c: ["#1D6B4E", "#0E2119"],
  },
  {
    id: "n2",
    d: "2026-08-04",
    k: "w_n2",
    tag: "w_tag_partner",
    c: ["#276A7C", "#0E2119"],
  },
  {
    id: "n3",
    d: "2026-07-18",
    k: "w_n3",
    tag: "w_tag_export",
    c: ["#C2761E", "#4A2A08"],
  },
  {
    id: "n4",
    d: "2026-06-29",
    k: "w_n4",
    tag: "w_tag_tech",
    c: ["#2a78d6", "#0E1B2E"],
  },
];

export interface PartnerGroup {
  g: string;
  /** `[organisation name, i18n key for its role]`. */
  items: [string, string][];
}

export const PARTNERS: PartnerGroup[] = [
  {
    g: "w_pg_state",
    items: [
      ["O‘zbekiston Iqtisodiyoti Assambleyasi", "w_pr_initiator"],
      ["Qishloq xo‘jaligi vazirligi", "w_pr_ministry"],
      ["O‘simliklar karantini agentligi", "w_pr_phyto"],
      ["Bojxona qo‘mitasi", "w_pr_customs"],
    ],
  },
  {
    g: "w_pg_tech",
    items: [
      ["ZEROCO inc.", "w_pr_zeroco"],
      ["Nippon Engineering Co., Ltd.", "w_pr_nippon"],
    ],
  },
  {
    g: "w_pg_fin",
    items: [
      ["Banklar va IFI", "w_pr_banks"],
      ["Sug‘urta kompaniyalari", "w_pr_insurers"],
    ],
  },
  {
    g: "w_pg_ops",
    items: [
      ["Logistika operatorlari", "w_pr_carriers"],
      ["Akkreditlangan laboratoriyalar", "w_pr_labs"],
      ["Eksportchilar va klasterlar", "w_pr_exporters"],
    ],
  },
];

/**
 * The governance model from the concept document: committees, not invented
 * executives. Naming fictional officers of a real body would misrepresent it.
 */
export const GOVERNANCE: [string, string][] = [
  ["w_gv1", "w_gv1d"],
  ["w_gv2", "w_gv2d"],
  ["w_gv3", "w_gv3d"],
  ["w_gv4", "w_gv4d"],
  ["w_gv5", "w_gv5d"],
];

export interface Job {
  k: string;
  loc: string;
  type: string;
  team: string;
}

export const JOBS: Job[] = [
  {
    k: "w_j1",
    loc: "Toshkent",
    type: "w_ft",
    team: "w_team_eng",
  },
  {
    k: "w_j2",
    loc: "Samarqand",
    type: "w_ft",
    team: "w_team_ops",
  },
  {
    k: "w_j3",
    loc: "Samarqand",
    type: "w_ft",
    team: "w_team_qc",
  },
  {
    k: "w_j4",
    loc: "Toshkent",
    type: "w_ft",
    team: "w_team_eng",
  },
  {
    k: "w_j5",
    loc: "Toshkent",
    type: "w_pt",
    team: "w_team_fin",
  },
];

/** `[title key, description key, icon]`. */
export const SERVICES: [string, string, string][] = [
  ["w_s1", "w_s1d", "box"],
  ["w_s2", "w_s2d", "qc"],
  ["w_s3", "w_s3d", "cond"],
  ["w_s4", "w_s4d", "lien"],
  ["w_s5", "w_s5d", "ship"],
  ["w_s6", "w_s6d", "lookup"],
];

/**
 * The twelve links of the chain, and how far each one is built:
 * 0 = later phase, 1 = live in the pilot, 2 = the ZEROCO layer.
 */
export const CHAIN12: [string, number][] = [
  ["w_c1", 0],
  ["w_c2", 0],
  ["w_c3", 1],
  ["w_c4", 1],
  ["w_c5", 2],
  ["w_c6", 1],
  ["w_c7", 1],
  ["w_c8", 0],
  ["w_c9", 1],
  ["w_c10", 0],
  ["w_c11", 0],
  ["w_c12", 0],
];

/** Every region that appears in the catalogue, for the filter row. */
export const REGIONS: string[] = [
  ...new Set(PRODUCE.flatMap((p) => p.regions)),
].sort();

/** Every certification that appears in the catalogue. */
export const CERTS: string[] = [
  ...new Set(PRODUCE.flatMap((p) => p.certs)),
].sort();

/** Season membership, handling a window that wraps across the new year. */
export const inSeason = (p: ProduceItem, month: number): boolean =>
  p.season[0] <= p.season[1]
    ? month >= p.season[0] && month <= p.season[1]
    : month >= p.season[0] || month <= p.season[1];

export const findProduce = (id: string): ProduceItem | undefined =>
  PRODUCE.find((p) => p.id === id);

export const findArticle = (id: string): NewsItem | undefined =>
  NEWS.find((n) => n.id === id);

/* ===================================================================
   WHAT THE SITE SHOWS FROM THE PLATFORM ITSELF

   The hero's lot card and the technology page's comparison chart are
   real records, fetched from the two open endpoints (`site-api.ts`).
   These constants are the fallback when the API cannot be reached - the
   same seeded figures, so a visitor never sees two different truths.
   =================================================================== */

export const SHOWCASE_LOT = {
  code: "AZ-2026-SMQ-0412",
  product: "melon",
  zone: "Z-ZEROCO-01",
  netKg: 4200,
  sellBy: "2026-10-06",
  tempC: 0.4,
};

export const SHOWCASE_TRIAL = {
  code: "TR-MELON-01",
  days: [0, 7, 14, 21, 28, 35, 42, 49, 56],
  /** Modelled curves, not measurements - the chart draws them dashed. */
  zeroco: {
    loss: [0, 0.7, 1.4, 2.1, 3, 3.9, 4.9, 6, 7.2],
    waste: [0, 0.1, 0.4, 1, 2, 3.1, 4.4, 6, 8.1],
    firm: [8.4, 8.3, 8.1, 7.9, 7.6, 7.3, 7, 6.6, 6.2],
  },
  control: {
    loss: [0, 1.8, 3.4, 5.1, 7, 9.2, 11.8, 14.9, 18.4],
    waste: [0, 0.5, 1.4, 2.8, 4.5, 7.1, 10.6, 15.2, 21],
    firm: [8.4, 8, 7.5, 6.8, 5.9, 5.1, 4.4, 3.8, 3.2],
  },
  observed: 2,
};
