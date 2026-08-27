import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CheckCircle2, XCircle } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import api from "@/lib/api";
import { MODULES, PHASE_LABEL, type Phase } from "@/lib/modules";
import { API_BASE_URL } from "@/config";

/**
 * The platform view: it proves the frontend can reach the backend, and lays
 * out which clusters are built versus coming.
 *
 * This is not the product's front door - that is the panel index at `/`. This
 * page is for the people building it, which is why it talks about clusters and
 * phases rather than about a hub or a bank.
 */
const Overview = () => {
  const { t } = useTranslation();
  const health = useQuery({
    queryKey: ["health"],
    queryFn: api.health,
    retry: false,
    refetchInterval: 30_000,
  });

  const phases: Phase[] = [1, 2, 3];

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          {t("overview", "Overview")}
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          One lot ID, one event log. Every module below is a different question
          asked about the same lot.
        </p>
        <p className="text-sm text-muted-foreground">
          Looking for the panels?{" "}
          <Link
            to="/panels"
            className="text-primary underline underline-offset-4"
          >
            The eight user panels
          </Link>{" "}
          are the product; the modules below are the clusters that will serve
          them.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Backend</CardTitle>
          <CardDescription className="font-mono text-xs">
            {API_BASE_URL}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {health.isPending && (
            <p className="text-sm text-muted-foreground">Checking…</p>
          )}

          {health.isError && (
            <p className="flex items-center gap-2 text-sm text-destructive">
              <XCircle className="h-4 w-4" />
              Unreachable — {(health.error as Error).message}
            </p>
          )}

          {health.data && (
            <p className="flex flex-wrap items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>
                {health.data.service} v{health.data.version}
              </span>
              <span className="text-muted-foreground">
                · database {health.data.database} ({health.data.engine})
              </span>
            </p>
          )}
        </CardContent>
      </Card>

      {phases.map((phase) => (
        <section key={phase} className="space-y-3">
          <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {PHASE_LABEL[phase]}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {MODULES.filter((m) => m.phase === phase).map((module) => (
              <Link key={module.key} to={module.path} className="block">
                <Card className="h-full transition-colors hover:border-primary/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      {t(module.titleKey, module.title)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {module.blurb}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

export default Overview;
