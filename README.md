# Agro Zanjir Digital — frontend

Vite + React + TypeScript. Originally forked from AgroConnect; what remains of
that fork is listed at the bottom, and it is not much.

## Run it

```sh
npm install
npm run dev          # http://localhost:5173
```

**The backend must be running.** The panels read it; the website reads two open
endpoints from it and falls back to its shipped figures if it cannot:

```sh
# from a clone of https://github.com/AgroZanjir/backend
.venv/bin/python manage.py runserver 8000
```

| Command | What it does |
| --- | --- |
| `npm run dev` | dev server on 5173 |
| `npm run build` | production build |
| `npm run typecheck` | `tsc -b` |
| `npm test` | vitest |
| `npm run api-types` | regenerate `src/lib/api-types.ts` from the backend's OpenAPI schema |

## The panels

The eight user panels are the product. They are ported from the approved HTML
prototype screen for screen, so the built thing and the design stay the same
thing. `Sign in` in the website's nav is the way in.

| Path | Panel | Screens |
| --- | --- | --- |
| `/panels` | The panel index | public |
| `/farmer` | Producer | 5 |
| `/hub` | Hub operations | 10 (+ the lot passport) |
| `/trials` | ZEROCO trial | 3 |
| `/bank` | Bank | 5 (+ the lot passport) |
| `/insurance` | Insurer | 3 |
| `/export` | Export | 6 (+ the lot passport) |
| `/public` | Public | 3, no session needed |
| `/admin` | Administration | 9 |

Where the pieces live:

| File | What it owns |
| --- | --- |
| `src/lib/panels.ts` | the manifest: panels, their screens, paths, icons, access |
| `src/pages/panels/registry.ts` | screen id to component |
| `src/lib/panel-data.tsx` | the provider and `usePanelData()` every screen reads |
| `src/lib/panel-api.ts` | the API's vocabulary and units meeting the screens' |
| `src/lib/panel-types.ts` | the view models the screens are written against |
| `src/lib/panel-fixtures.ts` | the same dataset, as the render tests' double |
| `src/lib/public-api.ts` | the public panel's own data: no session, one open endpoint |
| `src/lib/panel-actions.tsx` | `useAction` and the toast stack: every write on the panels |
| `src/styles/brand.css` | the brand layer: one palette and one pair of typefaces, which both design systems map onto |
| `src/styles/panels.css` | the operator design system, ported from the prototype |
| `src/components/panel/*` | the shared components: stats, pills, tables, charts |
| `src/components/layout/PanelShell.tsx` | sidebar, breadcrumb, demo bar |
| `src/pages/panels/auth/PanelAuth.tsx` | the OneID gate and the waiting screen |

Eight things worth knowing before changing them:

1. **Every write goes through `useAction`.** It owns the four questions each
   form would otherwise answer for itself: is it running, did it work, why did
   it not, and what does the screen show now. The last one matters most - it
   reloads the dataset on success, so the table behind a form is right before
   the toast has faded.

   It also takes the capability the endpoint requires and disables the button
   without it. The API is still the authority and refuses either way; naming it
   in the screen is what stops a lab approver being shown an observation form
   that can only ever fail.

   The failure text is the API's own words. A refused dispatch names the
   lender; a refused placement names the zone's capacity; a refused declaration
   names the documents. Replacing that with "something went wrong" would throw
   away the only part of the response worth reading.

2. **The data comes from the API, through one seam.** Every screen reads
   `usePanelData()`; the provider loads the dataset once per session and
   `panel-api.ts` is the only file that knows the backend's field names.
   Grams become kilograms and minor units become sum there, and nowhere else.
   `useRefreshPanelData()` invalidates it after a write.
3. **A panel is a portal, and the sidebar names it - it is not a switcher.**
   The prototype states it that way and it is a permission statement as much
   as a design one: offering a hub operator the bank's portal, or the
   administration panel, implies an access the API would refuse. Someone who
   works in two panels changes between them at `/panels`, which the brand mark
   links back to. Which panels are *theirs* is decided by their role, not by
   their organisation's type - working at the operator's organisation is not
   the same as running the platform.

4. **The public panel has no session and its own data path.** Panel 07 is the
   one anybody can open; it reads `lib/public-api.ts` against the two open
   endpoints, and `App` deliberately does not wrap it in `PanelDataProvider`.
   Asking for a token-scoped dataset there left an anonymous visitor looking at
   a spinner for ever.

5. **On a phone both navigations collapse behind one button.** Seven website
   links and ten panel sections do not fit on 390px, and wrapping them cost a
   quarter of the screen before the reader saw anything. The website's turn
   into a sheet under the bar (`.nav-drop`, which is `display: contents` on a
   wide screen so there is only ever one copy of the markup); the panel
   sidebar becomes a drawer behind the button in the top bar. Both close on a
   route change, on Escape, on a tap outside, and when the viewport grows past
   the breakpoint.

6. **There are two design systems and one brand layer.** `brand.css` declares
   the identity - institutional navy `#0a2540` with gold `#a8801f`, Source
   Serif 4 for headings over Inter for reading text, 14px radii, navy-tinted
   shadows - as `--b-*` tokens and styles nothing. The website's token block
   maps onto it in about twenty lines, which is the whole of what changed when
   it took the Konglomerat look: no page, no component and no class name moved.

   **The panels have not been mapped yet.** They still carry the approved
   prototype's pine green, deliberately, and switching them over is remapping
   the token block at the top of `panels.css` against the same `--b-*` names -
   not editing forty-four screens. The one thing to check when that happens is
   the semantic colours: a panel's green means *in regime* and its red means
   *excursion*, and those must not become navy and gold.

7. **The design system is not Tailwind.** `panels.css` carries the prototype's
   tokens and classes verbatim; `index.css` points shadcn's variables at the
   same palette so the carried-over auth screens do not look like a second
   product. Change a colour in `panels.css`, never in `index.css`.
8. **The sign-in is real; OneID is not yet.** `POST /auth/oneid/` returns a
   real JWT and sets the refresh cookie. Until OneID itself is connected the
   backend resolves a seeded *persona* instead of a state identity and returns
   `adapter: "stub"`, which the sign-in screen prints. The access token lives
   in memory only; a reload calls `restoreSession()`, which exchanges the
   httpOnly refresh cookie, so the session survives without the token ever
   touching localStorage.

## The website

`/` is the public website - the marketing and information layer, ported from
its own approved prototype the same way the panels were. Eleven pages, three
languages, light and dark.

| Path | Page |
| --- | --- |
| `/` | Home |
| `/about` | About |
| `/services` | Services |
| `/showroom` | Showroom - the produce catalogue, filterable |
| `/showroom/:id` | A single product |
| `/technology` | Technology (ZEROCO, the trial charts) |
| `/partners` | Partners and governance |
| `/news` | News |
| `/news/:id` | An article |
| `/careers` | Careers |
| `/contact` | Contact |

| File | What it owns |
| --- | --- |
| `src/components/site/SiteShell.tsx` | nav, footer, the reveal-on-scroll hook |
| `src/components/site/produce.tsx` | produce cards, the season calendar |
| `src/lib/site-data.ts` | the demo dataset every page reads |
| `src/styles/site.css` | the website's design system |
| `src/pages/site/*` | the eleven pages |

The website and the panels are two design systems, not one: Inter and near-black
planes against IBM Plex Sans and pine green. They share the app, the router, the
theme and the three locales, and nothing else.

**That is why every selector in `site.css` starts with `body.site`.** `SiteShell`
adds that class while a website route is mounted and removes it on the way out.
Both stylesheets are global and both define `.hero`, `.pbody` and `.pcard`; the
scoping is what keeps the second-loaded file from redecorating the first one's
screens. Add a rule to `site.css` and it needs the prefix too.

One deliberate departure from the prototype, at the bottom of `site.css`: the
prototype's light ground is flat near-white, which under the dark hero reads as
unfinished. The light plane now carries the same two things the dark planes
always had - a 66px surveyor's grid and slow-drifting light - inverted and at a
fraction of the strength, on two fixed layers behind the page. The nav pill
tightens once you leave the top, and a route change fades its page in. All of it
is off under `prefers-reduced-motion`.

`site-data.ts` is the same seam as `panel-data.ts`: when produce, news or
vacancies come from an API, the pages swap an import.
`src/pages/site/pages.spec.tsx` renders all eleven pages plus every product and
every article.

## Adding a panel screen

An entry in the panel's `screens` array in `src/lib/panels.ts`, a component,
and a line in `src/pages/panels/registry.ts`. The sidebar, the route, the
breadcrumb and the access check follow from the manifest.

Three tests keep the set honest. `src/pages/panels/screens.spec.tsx` renders
every screen in the manifest against `FIXTURES` - shaped exactly like a live
response, so no server is needed and the equivalence is what makes it worth
running. `src/locales/locales.spec.ts` checks that uz, ru and en carry the same
keys and that no screen asks for one that does not exist.
`src/lib/panel-format.spec.ts` covers the event composer: the API stores what
happened and the sentence is written in the reader's language at render time,
which is the one real i18n defect the prototype had.

## Adding a module

Modules are declared once in `src/lib/modules.ts`. The sidebar, the routes,
the role guards and the placeholder pages are all generated from that list.
Adding one is an entry there plus a real page component to replace
`ModulePage`.

Placeholders say plainly what a module will own and which phase it belongs to.
They do not show invented data — a demo that fakes numbers is worse than one
that says what is coming, especially for a system whose whole value is that its
records can be trusted.

## Not built yet

- **Offline field capture.** The collection gate loses connectivity. That is an
  offline-first PWA with an IndexedDB queue and idempotent sync keys — never a
  native app for a three-person team. Nothing here is wired for it yet.
- **Real OneID.** The gate, the session, the token and the refresh cookie are
  all real. What is not real is the identity behind them: the backend's stub
  adapter resolves a seeded person, and says so in every session it issues.
- **Writes from the screens that have no form.** The capture and decision
  screens post to the API; the ones that are lists or read-only views do not,
  because there is nothing on them to send. What is genuinely missing is
  narrower than it was: photographs (the QC and observation screens show the
  slots and cannot upload yet), an adjuster's own figure on a claim, and a
  depart/deliver control on the transit screen - the endpoints exist for all
  three.

## What is left of the AgroConnect fork

Deleted, because Agro Zanjir has its own prototype and its own design for all
of it:

- `pages/auth/*` and `components/auth/*` — login, register, OTP confirm, the
  three forgot-password screens, change-email, Google OAuth, complete-profile.
  They called AgroConnect's endpoints (`/accounts/login/`, `/accounts/profile/`)
  and were never going to authenticate against this backend. The panels' OneID
  gate replaces all of them.
- `components/ui/*` — the shadcn kit, minus `card`, which the platform view
  still uses. The panels never used it; they have `styles/panels.css`.
- `components/LanguageSwitcher.tsx`, `hooks/*`, `lib/reference-data.ts`,
  `toSessionUser()`, and the toast and tooltip providers — each existed only to
  serve the screens above.
- 34 runtime dependencies, which is what those files were importing: every
  Radix package, axios, react-hook-form, zod, recharts, react-toastify, sonner,
  and the rest. `dependencies` is twelve entries now.

Kept, and still worth keeping:

- `i18n.ts` + `locales/{uz,ru,en}` — the most valuable thing in that repo for
  this client, now carrying 700+ panel strings as well as the original UI ones
- `contexts/ThemeContext.tsx`, `lib/utils.ts`
- `store/UserStore.tsx` — rewritten around party-scoped memberships and an
  in-memory token, but the same shape
- `components/ProtectedRoute.tsx` — the module guard; the panels have their own
  in `components/PanelGate.tsx`

## The other two repositories

This is one of three. They are deployed together and versioned apart:

| Repository | What it is |
| --- | --- |
| [AgroZanjir/backend](https://github.com/AgroZanjir/backend) | Django 6 + DRF: the lot registry, the event log, the six clusters and the ports |
| [AgroZanjir/frontend](https://github.com/AgroZanjir/frontend) | Vite + React: the public website and the eight operator panels |
| [AgroZanjir/infra](https://github.com/AgroZanjir/infra) | How the two are served: nginx, gunicorn, PostgreSQL, the deployment sequence |
