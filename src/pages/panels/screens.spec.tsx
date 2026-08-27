/**
 * Every panel screen renders.
 *
 * Forty-four screens over one dataset: the failure this catches is a screen
 * reaching for a lot, zone or role that is not there, which typechecks fine
 * and throws the moment someone opens the page.
 *
 * The fixtures are handed to `PanelDataProvider` directly, so no request is
 * made and no database is needed. They are shaped exactly like a live
 * response - that equivalence is what makes this test worth running.
 *
 * Rendered to a string rather than to a DOM so the suite needs no browser
 * environment. That is enough to run every component body, every hook and
 * every lookup in the screen.
 */

import { renderToString } from "react-dom/server";
import { Route, Routes } from "react-router-dom";
import { StaticRouter } from "react-router-dom/server";
import { describe, expect, it } from "vitest";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { PanelDataProvider } from "@/lib/panel-data";
import { FIXTURES } from "@/lib/panel-fixtures";
import { PANELS, panelScreens } from "@/lib/panels";
import { SCREENS } from "@/pages/panels/registry";
import "@/i18n";

const cases = PANELS.flatMap((panel) =>
  panelScreens(panel).map((screen) => ({
    name: `${panel.path}/${screen.slug} (${screen.id})`,
    path: `${panel.path}/${screen.slug}`.replace(/\/$/, ""),
    id: screen.id,
  })),
);

describe("panel screens", () => {
  it("all have a component", () => {
    const missing = cases.filter((c) => !SCREENS[c.id]);
    expect(missing.map((c) => c.id)).toEqual([]);
  });

  it.each(cases)("$name renders", ({ path, id }) => {
    const Screen = SCREENS[id];
    const html = renderToString(
      <QueryClientProvider client={new QueryClient()}>
        <PanelDataProvider value={FIXTURES}>
          <StaticRouter location={path}>
            <Routes>
              <Route path={path} element={<Screen />} />
            </Routes>
          </StaticRouter>
        </PanelDataProvider>
      </QueryClientProvider>,
    );
    expect(html.length).toBeGreaterThan(0);
  });
});
