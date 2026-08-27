/**
 * P1 - public lookup.
 *
 * No account, no sidebar, one field. A consumer holding a melon with a QR
 * sticker on it should reach the history in one scan, and an exporter's buyer
 * should reach the same page from the same code.
 */

import { useState } from "react";

import BrandMark from "@/components/panel/brand";
import { Btn, PanelCard, Qr } from "@/components/panel/primitives";
import { usePanelT } from "@/lib/panel-format";
import { useNavigate } from "react-router-dom";
import { SAMPLE_LOT } from "@/lib/public-api";

const PublicLookup = () => {
  const { t } = usePanelT();
  const navigate = useNavigate();
  const [code, setCode] = useState("");

  // Whatever was typed, or the code on the demonstration sticker. The passport
  // answers "no such lot" for anything else, which is the honest outcome of
  // typing a code off a label by hand.
  const look = () =>
    navigate(
      `/public/passport?lot=${encodeURIComponent(code.trim() || SAMPLE_LOT)}`,
    );

  return (
    <div style={{ maxWidth: 620, margin: "36px auto", textAlign: "center" }}>
      <BrandMark px={46} />
      <h1 className="t-display" style={{ marginTop: 18 }}>
        {t("pu_title")}
      </h1>
      <p className="psub" style={{ margin: "8px auto 22px", maxWidth: "44ch" }}>
        {t("pu_sub")}
      </p>

      <PanelCard>
        <div className="row" style={{ gap: 8 }}>
          <input
            className="inp mono"
            placeholder={t("pu_ph")}
            style={{ flex: 1 }}
            aria-label={t("pu_ph")}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && look()}
          />
          <Btn cls="btn-p" icon="srch" onClick={look}>
            {t("pu_btn")}
          </Btn>
        </div>

        <div className="hr" />

        <div className="row" style={{ justifyContent: "center", gap: 14 }}>
          <Qr seed={SAMPLE_LOT} px={92} />
          <div style={{ textAlign: "left", maxWidth: "24ch" }}>
            <div className="t-sm" style={{ fontWeight: 600 }}>
              {t("pl_scan")}
            </div>
            <div className="t-xs muted-2" style={{ marginTop: 3 }}>
              {t("pu_trust")}
            </div>
          </div>
        </div>
      </PanelCard>
    </div>
  );
};

export default PublicLookup;
