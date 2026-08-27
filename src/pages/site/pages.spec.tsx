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
