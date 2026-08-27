/**
 * P3 - OneID sign-in, from the public side.
 *
 * The same gate as every panel, reached from the public pages: someone who
 * followed a QR code and turns out to be a hub operator ends up here rather
 * than hunting for a login link.
 */

import { useNavigate } from "react-router-dom";

import BrandMark from "@/components/panel/brand";
import { Btn, Field, PanelCard } from "@/components/panel/primitives";
import { usePanelT } from "@/lib/panel-format";

const PublicSignIn = () => {
  const { t } = usePanelT();
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: 400, margin: "52px auto" }}>
      <div style={{ textAlign: "center", marginBottom: 22 }}>
        <BrandMark px={46} />
        <div className="t-display" style={{ marginTop: 14 }}>
          {t("lg_title")}
        </div>
        <div className="t-sm muted" style={{ marginTop: 5 }}>
          {t("lg_sub")}
        </div>
      </div>

      <PanelCard bodyCls="stack" bodyStyle={{ gap: 13 }}>
        <Btn
          cls="btn-p"
          icon="login"
          style={{ justifyContent: "center", padding: 11 }}
          onClick={() => navigate("/panels")}
        >
          {t("lg_oneid")}
        </Btn>

        <div className="row" style={{ gap: 10 }}>
          <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
          <span className="t-xs muted-2">{t("lg_or")}</span>
          <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
        </div>

        <Field label={t("lg_phone")}>
          <input className="inp mono" defaultValue="+998 __ ___ __ __" />
        </Field>
        <Btn style={{ justifyContent: "center", padding: 9 }} disabled>
          {t("confirm")}
        </Btn>

        <p
          className="t-xs muted-2"
          style={{ margin: 0, textAlign: "center", lineHeight: 1.5 }}
        >
          {t("lg_note")}
        </p>
      </PanelCard>
    </div>
  );
};

export default PublicSignIn;
