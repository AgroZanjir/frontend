/**
 * Session store.
 *
 * Three rules it exists to hold:
 *
 * 1. **The access token is never persisted.** A token in localStorage is a
 *    finding in any bank's security review, and this platform faces banks. It
 *    lives in memory for the life of the tab; the backend issues a refresh
 *    token as an httpOnly, SameSite cookie that JavaScript cannot read, and
 *    `restore()` exchanges it for a new access token on load.
 *
 * 2. **Roles are party-scoped, not flat strings.** A person belongs to a party
 *    (one of the thirteen organisation types) and holds a role at it,
 *    optionally narrowed to named facilities. `ProtectedRoute` and the panel
 *    gate both check against that shape.
 *
 * 3. **Capabilities are what anything is actually allowed by.** The role is
 *    how the product speaks; `capabilities` is what the API checks, and the
 *    session carries the resolved list so the client can hide what the server
 *    would refuse anyway.
 *
 * The session itself is minted by the OneID gate in `pages/panels/auth`.
 */

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/**
 * The party a user acts on behalf of. Mirrors `registry.OrganisationType.code`
 * - all thirteen, because the administration panel shows all thirteen.
 */
export type PartyType =
  | "farmer"
  | "cooperative"
  | "aggregator"
  | "operator"
  | "processor"
  | "laboratory"
  | "exporter"
  | "buyer"
  | "carrier"
  | "bank"
  | "insurer"
  | "customs_broker"
  | "authority";

/**
 * What a user may do. Mirrors `registry.Role.code`.
 *
 * A string union rather than an enum of the thirty-seven: the catalogue is
 * data in the backend and a role added there must not require a deployment
 * here. The five the client itself reasons about are named for type safety.
 */
export type Role =
  | "platform_owner"
  | "platform_admin"
  | "verification_officer"
  | "auditor"
  | "org_owner"
  | (string & {});

/** Capability codes. The ten primitives the API checks against. */
export type Capability =
  | "view"
  | "capture"
  | "approve"
  | "transact"
  | "sign"
  | "decide"
  | "administer"
  | "verify"
  | "configure"
  | "audit";

/** Where a role applies. A platform role sees across organisations. */
export type RoleScope = "platform" | "org" | "facility" | "region" | "national";

export interface Membership {
  partyId: string;
  partyCode: string;
  partyName: string;
  partyType: PartyType;
  /** The organisation's verification state; the gate reads this. */
  partyVerification: "verified" | "review" | "pending" | "rejected";
  role: Role;
  roleLabelKey: string;
  scope: RoleScope;
  capabilities: Capability[];
  /** Facility codes this role applies at; empty means party-wide. */
  facilityScope: string[];
}

export interface SessionUser {
  id: string;
  username: string;
  displayName: string;
  firstName: string;
  lastName?: string;
  email: string;
  initials: string;
  oneidVerified: boolean;
  eimzoVerified: boolean;
  isSuperuser: boolean;
  memberships: Membership[];
}

/** Exactly what `GET /auth/me/` and the sign-in endpoints return. */
export interface SessionPayload {
  user: {
    id: string;
    username: string;
    display_name: string;
    first_name: string;
    last_name: string;
    email: string;
    initials: string;
    status: string;
    oneid_verified: boolean;
    eimzo_verified: boolean;
    is_superuser: boolean;
  };
  memberships: {
    party_id: string;
    party_code: string;
    party_name: string;
    party_type: PartyType;
    party_verification: Membership["partyVerification"];
    role: string;
    role_label_key: string;
    scope: RoleScope;
    capabilities: Capability[];
    facility_codes: string[];
  }[];
  access?: string;
  /** `stub` while OneID is not connected. The sign-in screen prints it. */
  adapter?: string;
}

export const toSessionUser = (payload: SessionPayload): SessionUser => ({
  id: payload.user.id,
  username: payload.user.username,
  displayName: payload.user.display_name,
  firstName: payload.user.first_name,
  lastName: payload.user.last_name,
  email: payload.user.email,
  initials: payload.user.initials,
  oneidVerified: payload.user.oneid_verified,
  eimzoVerified: payload.user.eimzo_verified,
  isSuperuser: payload.user.is_superuser,
  memberships: payload.memberships.map((m) => ({
    partyId: m.party_id,
    partyCode: m.party_code,
    partyName: m.party_name,
    partyType: m.party_type,
    partyVerification: m.party_verification,
    role: m.role,
    roleLabelKey: m.role_label_key,
    scope: m.scope,
    capabilities: m.capabilities,
    facilityScope: m.facility_codes,
  })),
});

interface SessionState {
  user: SessionUser | null;
  /** In memory only - see the note at the top of this file. */
  token: string | null;
  isAuthenticated: boolean;
  /** True until `restore()` has had its answer, so guards do not bounce early. */
  isRestoring: boolean;
  /** Which identity adapter answered. `stub` means a demonstration session. */
  adapter: string | null;
  applySession: (payload: SessionPayload) => void;
  logout: () => void;
  setRestored: () => void;
  /** True if the user holds any of `roles`, optionally at `facilityId`. */
  hasRole: (roles: Role[], facilityId?: string) => boolean;
  /** True if any membership carries the capability. What the API checks. */
  can: (capability: Capability) => boolean;
}

const userStore = create<SessionState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isRestoring: true,
      adapter: null,

      applySession: (payload) =>
        set({
          user: toSessionUser(payload),
          token: payload.access ?? get().token,
          isAuthenticated: true,
          isRestoring: false,
          adapter: payload.adapter ?? get().adapter,
        }),

      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isRestoring: false,
          adapter: null,
        }),

      setRestored: () => set({ isRestoring: false }),

      hasRole: (roles, facilityId) => {
        const memberships = get().user?.memberships ?? [];
        return memberships.some(
          (m) =>
            roles.includes(m.role) &&
            (!facilityId ||
              m.facilityScope.length === 0 ||
              m.facilityScope.includes(facilityId)),
        );
      },

      can: (capability) =>
        (get().user?.memberships ?? []).some((m) =>
          m.capabilities.includes(capability),
        ),
    }),
    {
      name: "agro-zanjir-session",
      storage: createJSONStorage(() => localStorage),
      // The profile is cached so the shell can render a name before the first
      // request returns. The token is not in this list, and must not be.
      partialize: (state) => ({ user: state.user }),
    },
  ),
);

export default userStore;
