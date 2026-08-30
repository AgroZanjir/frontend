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
// Every capture screen reports what it did; the provider is part of the panel
// environment, exactly like the dataset is.
import { PanelToastProvider } from "@/lib/panel-actions";
import { FIXTURES } from "@/lib/panel-fixtures";
import { PANELS, panelScreens } from "@/lib/panels";
import { SCREENS } from "@/pages/panels/registry";
import PanelAssistant from "@/components/panel/Assistant";
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
        <PanelToastProvider>
          <PanelDataProvider value={FIXTURES}>
            <StaticRouter location={path}>
              <Routes>
                <Route path={path} element={<Screen />} />
              </Routes>
            </StaticRouter>
          </PanelDataProvider>
        </PanelToastProvider>
      </QueryClientProvider>,
    );
    expect(html.length).toBeGreaterThan(0);
  });
});

/**
 * The assistant sits in the corner of all forty-four of them, so it is
 * rendered here rather than beside each. What matters on the server pass is
 * that it renders *closed*: it asks the backend whether there is a model
 * behind it, and a widget that opened a text box before hearing back would be
 * offering a conversation it may not be able to have.
 */
describe("the panel assistant", () => {
  const html = renderToString(
    <QueryClientProvider client={new QueryClient()}>
      <StaticRouter location="/farmer/lots">
        <PanelAssistant />
      </StaticRouter>
    </QueryClientProvider>,
  );

  it("puts a launcher on every panel screen", () => {
    expect(html).toContain("pai-launch");
    expect(html).toContain('aria-expanded="false"');
  });

  it("does not render the panel until it is opened", () => {
    expect(html).not.toContain("pai-panel");
    expect(html).not.toContain("textarea");
  });

  it("uses the operator design system, not the website's", () => {
    // Both sheets are global and the panels must not pick up the site's
    // serif-and-navy widget. Different prefixes are what keeps them apart -
    // matched on a word boundary, since `pai-launch` contains `ai-launch`.
    expect(html).not.toMatch(/class="[^"]*\bai-/);
    expect(html).toMatch(/class="[^"]*\bpai-/);
  });
});
