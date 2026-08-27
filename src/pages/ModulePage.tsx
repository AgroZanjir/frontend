import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getModule, PHASE_LABEL } from "@/lib/modules";
import NotFound from "@/pages/NotFound";

/**
 * Placeholder for a module that has not been built yet.
 *
 * It states plainly what the module will own and which phase it belongs to,
 * rather than showing invented data. A demo that fakes numbers is worse than
 * one that says what is coming - especially for a system whose whole value is
 * that its records can be trusted.
 */
const ModulePage = ({ moduleKey }: { moduleKey?: string }) => {
  const { t } = useTranslation();
  const params = useParams<{ moduleKey: string }>();
  const key = moduleKey ?? params.moduleKey;
  const module = key ? getModule(key) : undefined;

  if (!module) return <NotFound />;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          {PHASE_LABEL[module.phase]}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          {t(module.titleKey, module.title)}
        </h1>
        <p className="max-w-2xl text-muted-foreground">{module.blurb}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Not built yet</CardTitle>
          <CardDescription>
            The route, the guard and the navigation entry are in place. What
            lands here is the UI over the entities below, once the backend
            module exists.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1.5">
            {module.entities.map((entity) => (
              <li key={entity} className="flex items-baseline gap-3 text-sm">
                <code className="rounded border bg-muted px-1.5 py-0.5 font-mono text-xs">
                  {entity}
                </code>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default ModulePage;
