/**
 * Every public page renders.
 *
 * Same reasoning as the panel screen tests: a page reaching for produce or an
 * article the data does not contain typechecks fine and throws the moment
 * someone opens it. Rendered to a string, so the suite still needs no browser.
 */

import { renderToString } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route, Routes } from "react-router-dom";
import { StaticRouter } from "react-router-dom/server";
import { describe, expect, it } from "vitest";

import Home from "@/pages/site/Home";
import About from "@/pages/site/About";
import Services from "@/pages/site/Services";
import Showroom from "@/pages/site/Showroom";
import Product from "@/pages/site/Product";
import Technology from "@/pages/site/Technology";
import SitePartners from "@/pages/site/Partners";
import News from "@/pages/site/News";
import Article from "@/pages/site/Article";
import Careers from "@/pages/site/Careers";
import Contact from "@/pages/site/Contact";
import Assistant from "@/components/site/Assistant";
import { NAV, NavGroup } from "@/components/site/SiteShell";
import { NEWS, PRODUCE } from "@/lib/site-data";
import "@/i18n";

const PAGES: [string, string, React.ComponentType][] = [
  ["home", "/", Home],
  ["about", "/about", About],
  ["services", "/services", Services],
  ["showroom", "/showroom", Showroom],
  ["technology", "/technology", Technology],
  ["partners", "/partners", SitePartners],
  ["news", "/news", News],
  ["careers", "/careers", Careers],
  ["contact", "/contact", Contact],
];

const render = (path: string, route: string, Page: React.ComponentType) =>
  renderToString(
    // The hero card and the trial chart read two open endpoints; the query
    // client is what lets them fall back to the shipped figures here.
    <QueryClientProvider client={new QueryClient()}>
      <StaticRouter location={path}>
        <Routes>
          <Route path={route} element={<Page />} />
        </Routes>
      </StaticRouter>
    </QueryClientProvider>,
  );

describe("website pages", () => {
  it.each(PAGES)("%s renders", (_name, path, Page) => {
    expect(render(path, path, Page).length).toBeGreaterThan(0);
  });

  // Both detail pages read an id out of the URL, so every id in the data has
  // to resolve - a listing that opens onto "not found" is worse than no link.
  it.each(PRODUCE.map((p) => p.id))("produce %s has a page", (id) => {
    const html = render(`/showroom/${id}`, "/showroom/:id", Product);
    expect(html).not.toContain("404");
  });

  it.each(NEWS.map((n) => n.id))("article %s has a page", (id) => {
    const html = render(`/news/${id}`, "/news/:id", Article);
    expect(html).not.toContain("404");
  });
});

/**
 * The assistant sits in the corner of every one of the pages above, so it is
 * rendered here rather than beside them. What matters on the server pass is
 * that it renders at all and that it renders *closed*: the panel asks the
 * backend whether there is a model behind it, and a widget that opened a text
 * box before hearing back would be offering a conversation it may not be able
 * to have.
 */
describe("the assistant", () => {
  const html = renderToString(
    <QueryClientProvider client={new QueryClient()}>
      <StaticRouter location="/">
        <Assistant />
      </StaticRouter>
    </QueryClientProvider>,
  );

  it("puts a launcher on the page, with its label on it", () => {
    expect(html).toContain("ai-launch");
    expect(html).toContain('aria-expanded="false"');
    // A bare icon in the corner is what the first version was, and it went
    // unnoticed. The word beside it is what makes it a thing a reader sees.
    expect(html).toContain("ai-launch-t");
  });

  it("does not render the panel until it is opened", () => {
    expect(html).not.toContain("ai-panel");
    expect(html).not.toContain("textarea");
  });

  it("holds the invitation back until the page has settled", () => {
    // It is on a timer, and the timer is in an effect - so a server pass, and
    // the first paint in a browser, carry the launcher and nothing else.
    expect(html).not.toContain("ai-peek");
  });
});

/**
 * The navigation, which is the one piece of the shell every page shares.
 *
 * Technology and Partners live under Ecosystem now, and the thing worth
 * asserting about a dropdown is that it is not a trapdoor: both links are in
 * the markup whether it is open or not - hidden by CSS, present to a crawler
 * and to anyone without JavaScript - and the parent still says where you are
 * once you are inside one of them.
 */
describe("the site navigation", () => {
  const eco = NAV.find((item) => "items" in item);

  const render = (path: string) =>
    renderToString(
      <StaticRouter location={path}>
        <NavGroup k={eco!.k} items={"items" in eco! ? eco.items : []} />
      </StaticRouter>,
    );

  it("groups technology and partners under one item", () => {
    expect(eco && "items" in eco && eco.items.map(([to]) => to)).toEqual([
      "/technology",
      "/partners",
    ]);
    // And neither is still sitting in the bar on its own.
    const top = NAV.filter((item) => "to" in item).map((item) => item.to);
    expect(top).not.toContain("/technology");
    expect(top).not.toContain("/partners");
  });

  it("keeps both links in the markup while it is collapsed", () => {
    // A dropdown is not a trapdoor: closed is a CSS state, so the links are
    // there for a crawler and for anyone without JavaScript.
    const html = render("/");

    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('href="/technology"');
    expect(html).toContain('href="/partners"');
  });

  it("marks the group as current while either page inside it is open", () => {
    for (const path of ["/technology", "/partners"]) {
      const trigger = render(path).match(/class="nav-group-t[^"]*"/)?.[0];
      expect(trigger).toContain("on");
    }
  });

  it("leaves the group unmarked on a page outside it", () => {
    const trigger = render("/news").match(/class="nav-group-t[^"]*"/)?.[0];
    expect(trigger).not.toContain("on");
  });
});
