/**
 * The module manifest.
 *
 * One entry per cluster in section 03 of the blueprint, in the order section 06
 * builds them. The sidebar, the routes and the placeholder pages are all
 * generated from this list, so adding a module is one entry plus one real
 * page component - not a hunt through three files.
 */

import {
  Boxes,
  FileText,
  FlaskConical,
  Landmark,
  Truck,
  Warehouse,
  type LucideIcon,
} from "lucide-react";

import type { Role } from "@/store/UserStore";

export type Phase = 1 | 2 | 3;

export interface ModuleDef {
  key: string;
  path: string;
  /** Flat i18n key, matching the existing locale files. Falls back to `title`. */
  titleKey: string;
  title: string;
  /** What the module is for, in one line. */
  blurb: string;
  /** Entities it owns, from the blueprint. */
  entities: string[];
  phase: Phase;
  /** Who can open it. Empty means any signed-in user. */
  roles: Role[];
  /** lucide-react icon, resolved in the sidebar. */
  icon: LucideIcon;
}

export const MODULES: ModuleDef[] = [
  {
    key: "lots",
    path: "/lots",
    titleKey: "module_lots",
    title: "Lots",
    blurb:
      "The spine. Every other module is a different question asked about the same lot.",
    entities: ["lot", "lot_event", "lot_relation"],
    phase: 1,
    roles: [],
    icon: Boxes,
  },
  {
    key: "quality",
    path: "/quality",
    titleKey: "module_quality",
    title: "Quality & trials",
    blurb:
      "QC capture per product spec, and the controlled ZEROCO-versus-conventional comparison the business case rests on.",
    entities: ["qc_record", "pilot_trial", "trial_observation"],
    phase: 1,
    roles: ["qc_inspector", "hub_manager", "analyst", "admin"],
    icon: FlaskConical,
  },
  {
    key: "storage",
    path: "/storage",
    titleKey: "module_storage",
    title: "Storage",
    blurb:
      "Facilities, zones, placements, and the temperature and humidity series behind every excursion.",
    entities: [
      "facility",
      "storage_zone",
      "storage_placement",
      "condition_reading",
    ],
    phase: 1,
    roles: ["warehouse_operator", "hub_manager", "analyst", "admin"],
    icon: Warehouse,
  },
  {
    key: "commercial",
    path: "/commercial",
    titleKey: "module_commercial",
    title: "Contracts & shipments",
    blurb:
      "Offtake and export contracts, shipment planning, and the excursions detected in transit.",
    entities: [
      "offtake_contract",
      "export_contract",
      "shipment",
      "condition_excursion",
    ],
    phase: 2,
    roles: ["hub_manager", "analyst", "admin"],
    icon: Truck,
  },
  {
    key: "documents",
    path: "/documents",
    titleKey: "module_documents",
    title: "Documents",
    blurb:
      "Phytosanitary certificates, lab reports, invoices, packing lists. Every one has an issuer and an expiry.",
    entities: ["document"],
    phase: 2,
    roles: [],
    icon: FileText,
  },
  {
    key: "finance",
    path: "/finance",
    titleKey: "module_finance",
    title: "Finance & risk",
    blurb:
      "Credit applications, liens that block dispatch, policies, claims, and the settlement waterfall.",
    entities: [
      "finance_application",
      "encumbrance",
      "policy",
      "claim",
      "settlement_allocation",
    ],
    phase: 3,
    roles: ["finance_officer", "admin"],
    icon: Landmark,
  },
];

export const PHASE_LABEL: Record<Phase, string> = {
  1: "Phase 1 · Pilot data system",
  2: "Phase 2 · Hub operations",
  3: "Phase 3 · Finance, insurance, export",
};

export const getModule = (key: string): ModuleDef | undefined =>
  MODULES.find((m) => m.key === key);
