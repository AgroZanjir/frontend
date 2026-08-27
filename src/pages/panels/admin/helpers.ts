/**
 * Lookups the administration screens share.
 *
 * Each returns an i18n key rather than a translated string, so the caller
 * translates once and these stay usable outside a component.
 */

import { usePanelData } from "@/lib/panel-data";
import type { Cap, Org, OrgTypeDef, RoleGroup } from "@/lib/panel-types";

/** The catalogues these lookups read. Passed in, because they are now data. */
export interface Catalogues {
  CAPS: Cap[];
  ORGTYPES: OrgTypeDef[];
  ROLES: RoleGroup[];
}

export const orgTypeKey = (c: Catalogues, code: string): string =>
  c.ORGTYPES.find((o) => o[0] === code)?.[1] ?? code;

export const roleLabelKey = (c: Catalogues, code: string): string => {
  for (const group of c.ROLES) {
    const role = group.items.find((r) => r[0] === code);
    if (role) return role[1];
  }
  return code;
};

export const capLabelKey = (c: Catalogues, code: string): string =>
  c.CAPS.find((c2) => c2[0] === code)?.[1] ?? code;

/**
 * The short form used in the permission matrix header, where ten columns share
 * the width. Two capabilities have abbreviated keys - the prototype's matrix
 * asked for `cs_configure` and `cs_administer`, which do not exist, so it
 * printed the raw key in two of its ten columns.
 */
export const capShortKey = (code: string): string => {
  const short: Record<string, string> = {
    administer: "admin",
    configure: "config",
  };
  return `cs_${short[code] ?? code}`;
};

/** Capabilities a role carries, as i18n keys. */
export const roleCaps = (c: Catalogues, code: string): string[] =>
  c.ROLES.flatMap((g) => g.items).find((r) => r[0] === code)?.[2] ?? [];

/**
 * The same lookups, bound to the loaded catalogues.
 *
 * `const { orgTypeKey } = useLabels();` reads the way the screens already
 * called these before the catalogues came from the API.
 */
export const useLabels = () => {
  const { CAPS, ORGTYPES, ROLES } = usePanelData();
  const c: Catalogues = { CAPS, ORGTYPES, ROLES };
  return {
    orgTypeKey: (code: string) => orgTypeKey(c, code),
    roleLabelKey: (code: string) => roleLabelKey(c, code),
    capLabelKey: (code: string) => capLabelKey(c, code),
    roleCaps: (code: string) => roleCaps(c, code),
    capShortKey,
  };
};

export const ORG_STATUS_CLASS: Record<Org["st"], string> = {
  verified: "p-good",
  review: "p-warn",
  pending: "p-neut",
  rejected: "p-crit",
};

/** Verification result to `[i18n key, pill class]`. */
export const VRESULT: Record<string, [string, string]> = {
  pass: ["av_pass", "p-good"],
  review: ["av_review", "p-warn"],
  na: ["av_na", "p-neut"],
  fail: ["av_fail", "p-crit"],
};
