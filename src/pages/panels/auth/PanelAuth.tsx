/**
 * The two screens in front of every panel.
 *
 * Access has two gates and the design shows both: OneID proves the person,
 * and administration verification admits the organisation. Someone who has
 * cleared the first but not the second sees the waiting screen, not an empty
 * panel and not a dead end - they can see exactly which check is outstanding
 * and who is doing it.
 *
 * Neither screen shows the sidebar. The person is not admitted yet, and
 * showing them navigation they cannot use would be a lie.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import PanelIcon from "@/components/panel/icons";
import BrandMark from "@/components/panel/brand";
import { DemoBar, LangSeg, ThemeSeg } from "@/components/layout/PanelShell";
import { Btn, KV, Note, PanelCard, Tag } from "@/components/panel/primitives";
import { usePanelT } from "@/lib/panel-format";
import { getPanel } from "@/lib/panels";
import { fetchPersonas, signIn, signInToPanel } from "@/lib/panel-session";
import { ApiError } from "@/lib/api";

const AuthFrame = ({ children }: { children: React.ReactNode }) => (
  <div className="appwrap">
    <DemoBar />
    <div className="authwrap">
      <div className="authbar">
        <LangSeg />
        <ThemeSeg />
      </div>
      <div className="authbody">{children}</div>
    </div>
  </div>
);

/* ===== sign in ===== */

export const PanelSignIn = ({ panelId }: { panelId: string }) => {
  const { t } = usePanelT();
  const navigate = useNavigate();
  const panel = getPanel(panelId)!;
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Who the stub identity adapter will accept. Empty once OneID is connected,
  // and the picker disappears with it.
  const { data } = useQuery({
    queryKey: ["personas"],
    queryFn: fetchPersonas,
    retry: false,
    staleTime: Infinity,
  });
  const personas = data?.personas ?? [];
  const [persona, setPersona] = useState("");

  const enter = async (who?: string) => {
    setBusy(true);
    setError("");
    try {
      if (who) await signIn({ persona: who });
      else await signInToPanel(panel);
      navigate(panel.path);
    } catch (exc) {
      setError(
        exc instanceof ApiError ? exc.message : ((exc as Error).message ?? ""),
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthFrame>
      <div style={{ maxWidth: 412, margin: "44px auto" }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <BrandMark px={46} />
          <div className="t-display" style={{ marginTop: 13 }}>
            {t("lg_title")}
          </div>
          <div className="t-sm muted" style={{ marginTop: 4 }}>
            {t("lg_sub")}
          </div>
        </div>

        <PanelCard bodyCls="stack" bodyStyle={{ gap: 14 }}>
          <div
            className="row"
            style={{
              gap: 10,
              padding: "10px 12px",
              borderRadius: "var(--r-sm)",
              background: "var(--primary-soft)",
              alignItems: "center",
            }}
          >
            <Tag cls="p-good" style={{ padding: 6 }}>
              <PanelIcon name={panel.icon} />
            </Tag>
            <div style={{ minWidth: 0 }}>
              <div className="t-h3">{t(panel.key)}</div>
              <div className="t-xs muted" style={{ marginTop: 1 }}>
                {t(panel.descKey)}
              </div>
            </div>
          </div>

          <Btn
            cls="btn-p"
            icon="login"
            style={{ justifyContent: "center", padding: 11 }}
            disabled={busy}
            onClick={() => void enter(persona || undefined)}
          >
            {t("lg_oneid")}
          </Btn>

          {/* While the stub adapter is answering, this is the only way to say
              who you are - and it names the adapter so nobody mistakes the
              session for a real one. */}
          {personas.length > 0 && (
            <div className="field">
              <label htmlFor="persona">{t("lg_persona")}</label>
              <select
                id="persona"
                className="inp"
                value={persona}
                onChange={(e) => setPersona(e.target.value)}
              >
                <option value="">{t("lg_default_persona")}</option>
                {personas.map((p) => (
                  <option key={p.persona} value={p.persona}>
                    {p.name} · {p.org}
                  </option>
                ))}
              </select>
            </div>
          )}

          {error && (
            <div className="alert a-crit">
              <div className="at">{t("lg_failed")}</div>
              <div className="ad">{error}</div>
            </div>
          )}

          <div className="row" style={{ gap: 10 }}>
            <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
            <span className="t-xs muted-2">{t("lg_or")}</span>
            <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
          </div>

          <div className="field">
            <label htmlFor="phone">{t("lg_phone")}</label>
            <input
              id="phone"
              className="inp mono"
              defaultValue="+998 __ ___ __ __"
            />
          </div>
          <Btn style={{ justifyContent: "center", padding: 9 }} disabled>
            {t("confirm")}
          </Btn>

          <p
            className="t-xs muted-2"
            style={{ margin: 0, textAlign: "center", lineHeight: 1.5 }}
          >
            {t("lg_note")}
          </p>
          <p
            className="t-xs"
            style={{
              margin: 0,
              textAlign: "center",
              lineHeight: 1.5,
              color: "var(--warn)",
            }}
          >
            {t("lg_demo_note")}
          </p>
        </PanelCard>

        <PanelCard style={{ marginTop: 12 }}>
          <div
            className="row"
            style={{ gap: 10, alignItems: "flex-start", flexWrap: "nowrap" }}
          >
            <Tag cls="p-warn" style={{ padding: 6, flex: "none" }}>
              <PanelIcon name="lien" />
            </Tag>
            <div style={{ minWidth: 0 }}>
              <div className="t-h3">{t("lg_gate_t")}</div>
              <div
                className="t-xs muted"
                style={{ marginTop: 3, lineHeight: 1.5 }}
              >
                {t("lg_gate_d")}
              </div>
              <Btn
                cls="btn-q"
                sm
                style={{ marginTop: 8, paddingLeft: 0 }}
                onClick={() => navigate(`/pending/${panel.id}`)}
              >
                {t("lg_see_pending")}
                <PanelIcon name="arr" />
              </Btn>
            </div>
          </div>
        </PanelCard>
      </div>
    </AuthFrame>
  );
};

/* ===== verification gate: signed in, not yet admitted ===== */

export const PanelPending = ({ panelId }: { panelId: string }) => {
  const { t } = usePanelT();
  const navigate = useNavigate();
  const panel = getPanel(panelId)!;

  const steps: [string, string, string][] = [
    ["done", "lg_s1", "lg_s1d"],
    ["done", "lg_s2", "lg_s2d"],
    ["now", "lg_s3", "lg_s3d"],
    ["wait", "lg_s4", "lg_s4d"],
  ];

  const enter = async () => {
    await signInToPanel(panel);
    navigate(panel.path);
  };

  return (
    <AuthFrame>
      <div style={{ maxWidth: 520, margin: "36px auto" }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <BrandMark px={40} />
          <div className="t-h1" style={{ marginTop: 12 }}>
            {t("lg_pending_t")}
          </div>
          <p
            className="t-sm muted"
            style={{ margin: "6px auto 0", maxWidth: "46ch" }}
          >
            {t("lg_pending_d")}
          </p>
        </div>

        <PanelCard>
          <div className="grid g2" style={{ gap: 12 }}>
            <KV
              rows={[
                [t("au_org"), "Uztrans Logistic MChJ"],
                [t("ao_tin"), <span className="mono">307 991 002</span>],
              ]}
            />
            <KV
              rows={[
                [t("ao_type"), t("ot_carrier")],
                [
                  t("ao_st"),
                  <span className="pill p-warn">
                    <span className="dot" />
                    {t("s_review")}
                  </span>,
                ],
              ]}
            />
          </div>
          <div className="hr" />
          <div className="tl">
            {steps.map(([st, k, d]) => (
              <div className="tl-row" key={k}>
                <div
                  className={`tl-dot ${st === "done" ? "acc" : st === "now" ? "wr" : ""}`}
                >
                  <PanelIcon
                    name={
                      st === "done" ? "check" : st === "now" ? "cond" : "lien"
                    }
                    className=""
                  />
                </div>
                <div>
                  <div className="tl-t">
                    {t(k)}
                    {st === "now" && (
                      <span className="pill p-warn" style={{ marginLeft: 4 }}>
                        {t("s_review")}
                      </span>
                    )}
                  </div>
                  <div className="tl-d">{t(d)}</div>
                </div>
              </div>
            ))}
          </div>
        </PanelCard>

        <Note style={{ marginTop: 12 }}>{t("lg_pending_note")}</Note>

        <div
          className="row"
          style={{ marginTop: 14, justifyContent: "center", gap: 8 }}
        >
          <Btn
            cls="btn-q"
            icon="back"
            onClick={() => navigate(`/signin/${panel.id}`)}
          >
            {t("back")}
          </Btn>
          <Btn onClick={() => void enter()}>
            {t("lg_demo_skip")}
            <PanelIcon name="arr" />
          </Btn>
        </div>
      </div>
    </AuthFrame>
  );
};
