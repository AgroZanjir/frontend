/**
 * Screen id to component.
 *
 * The manifest in `lib/panels.ts` says which screens a panel has and where
 * they live; this says what renders. Keeping them apart means the manifest
 * stays readable data - the sidebar, the breadcrumbs and the access rules read
 * it without pulling in every screen in the product.
 */

import type { ComponentType } from "react";

import FarmerDashboard from "@/pages/panels/farmer/Dashboard";
import FarmerFarms from "@/pages/panels/farmer/Farms";
import FarmerHarvest from "@/pages/panels/farmer/Harvest";
import FarmerLots from "@/pages/panels/farmer/Lots";
import LotPassport from "@/pages/panels/farmer/LotPassport";

import HubOps from "@/pages/panels/hub/Ops";
import HubGate from "@/pages/panels/hub/Gate";
import HubWeigh from "@/pages/panels/hub/Weigh";
import HubQc from "@/pages/panels/hub/Qc";
import HubGrade from "@/pages/panels/hub/Grade";
import HubZones from "@/pages/panels/hub/Zones";
import HubPlace from "@/pages/panels/hub/Place";
import HubConditions from "@/pages/panels/hub/Conditions";
import HubExcursion from "@/pages/panels/hub/Excursion";
import HubDispatch from "@/pages/panels/hub/Dispatch";

import TrialList from "@/pages/panels/trials/TrialList";
import TrialCompare from "@/pages/panels/trials/Compare";
import TrialObserve from "@/pages/panels/trials/Observe";

import BankPortfolio from "@/pages/panels/bank/Portfolio";
import BankApplications from "@/pages/panels/bank/Applications";
import BankApplication from "@/pages/panels/bank/Application";
import BankCollateral from "@/pages/panels/bank/Collateral";
import BankLiens from "@/pages/panels/bank/Liens";

import InsuranceClaims from "@/pages/panels/insurance/Claims";
import InsuranceClaim from "@/pages/panels/insurance/Claim";
import InsuranceEvidence from "@/pages/panels/insurance/Evidence";

import ExportDashboard from "@/pages/panels/exportp/Dashboard";
import ExportSourcing from "@/pages/panels/exportp/Sourcing";
import ExportContract from "@/pages/panels/exportp/Contract";
import ExportShipment from "@/pages/panels/exportp/Shipment";
import ExportCustoms from "@/pages/panels/exportp/Customs";
import ExportTransit from "@/pages/panels/exportp/Transit";

import PublicLookup from "@/pages/panels/publicp/Lookup";
import PublicPassport from "@/pages/panels/publicp/Passport";
import PublicSignIn from "@/pages/panels/publicp/SignIn";

import AdminDashboard from "@/pages/panels/admin/Dashboard";
import AdminOrganisations from "@/pages/panels/admin/Organisations";
import AdminOrganisation from "@/pages/panels/admin/Organisation";
import AdminUsers from "@/pages/panels/admin/Users";
import AdminUser from "@/pages/panels/admin/User";
import AdminRoles from "@/pages/panels/admin/Roles";
import AdminInvite from "@/pages/panels/admin/Invite";
import AdminAudit from "@/pages/panels/admin/Audit";
import AdminSharing from "@/pages/panels/admin/Sharing";

export const SCREENS: Record<string, ComponentType> = {
  f_dash: FarmerDashboard,
  f_farms: FarmerFarms,
  f_harvest: FarmerHarvest,
  f_lots: FarmerLots,
  f_lot: LotPassport,

  h_ops: HubOps,
  h_gate: HubGate,
  h_weigh: HubWeigh,
  h_qc: HubQc,
  h_grade: HubGrade,
  h_zones: HubZones,
  h_place: HubPlace,
  h_cond: HubConditions,
  h_exc: HubExcursion,
  h_disp: HubDispatch,

  z_list: TrialList,
  z_cmp: TrialCompare,
  z_obs: TrialObserve,

  b_port: BankPortfolio,
  b_apps: BankApplications,
  b_app: BankApplication,
  b_coll: BankCollateral,
  b_lien: BankLiens,

  i_claims: InsuranceClaims,
  i_claim: InsuranceClaim,
  i_evid: InsuranceEvidence,

  e_dash: ExportDashboard,
  e_source: ExportSourcing,
  e_ex: ExportContract,
  e_ship: ExportShipment,
  e_cust: ExportCustoms,
  e_transit: ExportTransit,

  p_lookup: PublicLookup,
  p_pass: PublicPassport,
  p_login: PublicSignIn,

  a_dash: AdminDashboard,
  a_orgs: AdminOrganisations,
  a_org: AdminOrganisation,
  a_users: AdminUsers,
  a_user: AdminUser,
  a_roles: AdminRoles,
  a_invite: AdminInvite,
  a_audit: AdminAudit,
  a_access: AdminSharing,
};
