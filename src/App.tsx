import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { ThemeProvider } from "@/contexts/ThemeContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import PanelGate from "@/components/PanelGate";
import AppShell from "@/components/layout/AppShell";
import PanelShell from "@/components/layout/PanelShell";

import SiteShell from "@/components/site/SiteShell";
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

import PanelIndex from "@/pages/PanelIndex";
import { PanelPending, PanelSignIn } from "@/pages/panels/auth/PanelAuth";
import { SCREENS } from "@/pages/panels/registry";
import Overview from "@/pages/Overview";
import ModulePage from "@/pages/ModulePage";
import Forbidden from "@/pages/Forbidden";
import NotFound from "@/pages/NotFound";

import { MODULES } from "@/lib/modules";
import { PanelDataProvider } from "@/lib/panel-data";
import { restoreSession } from "@/lib/panel-session";
import { PANELS, panelScreens } from "@/lib/panels";

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false } },
});

/**
 * Three surfaces, in the order a visitor meets them: the public website, the
 * panel index, and the panels themselves.
 *
 * Authentication is the panels' own: OneID proves the person, and the
 * administration panel's verification admits their organisation. Both screens
 * live in `pages/panels/auth`, and both are reached per panel - which panel
 * you were heading for is part of what the gate has to say.
 */
const App = () => {
  // One exchange of the refresh cookie on load. Until it answers the guards
  // wait, because bouncing a reader to the sign-in screen for the half-second
  // before their token comes back reads as being logged out.
  useEffect(() => {
    void restoreSession();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            {/* The public website. Its own shell: no sidebar, no session. */}
            <Route element={<SiteShell />}>
              <Route index element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/services" element={<Services />} />
              <Route path="/showroom" element={<Showroom />} />
              <Route path="/showroom/:id" element={<Product />} />
              <Route path="/technology" element={<Technology />} />
              <Route path="/partners" element={<SitePartners />} />
              <Route path="/news" element={<News />} />
              <Route path="/news/:id" element={<Article />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/contact" element={<Contact />} />
            </Route>

            {/* The door between the two: which panel is yours. */}
            <Route path="/panels" element={<PanelIndex />} />

            {/* One route tree per panel, generated from the manifest. */}
            {PANELS.map((panel) => (
              <Route key={panel.id}>
                <Route
                  path={`/signin/${panel.id}`}
                  element={<PanelSignIn panelId={panel.id} />}
                />
                <Route
                  path={`/pending/${panel.id}`}
                  element={<PanelPending panelId={panel.id} />}
                />
                <Route element={<PanelGate panel={panel} />}>
                  <Route
                    path={panel.path}
                    element={
                      // The operator dataset is loaded once per session and
                      // shared by every screen inside the shell. The public
                      // panel is not part of it: it needs no session, so
                      // asking for a token-scoped dataset there left an
                      // anonymous visitor looking at a spinner. Its screens
                      // read the open endpoints directly.
                      panel.open ? (
                        <PanelShell />
                      ) : (
                        <PanelDataProvider>
                          <PanelShell />
                        </PanelDataProvider>
                      )
                    }
                  >
                    {panelScreens(panel).map((screen) => {
                      const Screen = SCREENS[screen.id];
                      return screen.slug ? (
                        <Route
                          key={screen.id}
                          path={screen.slug}
                          element={<Screen />}
                        />
                      ) : (
                        <Route key={screen.id} index element={<Screen />} />
                      );
                    })}
                  </Route>
                </Route>
              </Route>
            ))}

            {/* The platform view: backend health and the cluster placeholders
              the panels will be served by. */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppShell />}>
                <Route path="/overview" element={<Overview />} />
                <Route path="/forbidden" element={<Forbidden />} />

                {MODULES.map((module) => (
                  <Route
                    key={module.key}
                    element={<ProtectedRoute allowedRoles={module.roles} />}
                  >
                    <Route
                      path={module.path}
                      element={<ModulePage moduleKey={module.key} />}
                    />
                  </Route>
                ))}

                <Route path="/404" element={<NotFound />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
