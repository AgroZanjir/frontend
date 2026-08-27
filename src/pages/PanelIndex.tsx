/**
 * The panel index.
 *
 * The prototype's `00-Panellar` screen: every panel, who works in it, and the
 * four steps that stand between signing in and seeing it. Public, because the
 * page is also how a first-time visitor works out which panel is theirs.
 */

import { Link } from "react-router-dom";

import PanelIcon from "@/components/panel/icons";
import BrandMark from "@/components/panel/brand";
import { DemoBar, LangSeg, ThemeSeg } from "@/components/layout/PanelShell";
import { PanelCard, Tag } from "@/components/panel/primitives";
import { usePanelT } from "@/lib/panel-format";
import { PANELS } from "@/lib/panels";

const PanelIndex = () => {
  const { t } = usePanelT();

  return (
    <div className="appwrap">
      <DemoBar />
      <div className="authbar">
        <LangSeg />
        <ThemeSeg />
      </div>

      <div className="wrap" style={{ paddingTop: 12 }}>
        <div className="hero">
          <BrandMark px={46} />
          <div className="t-display" style={{ marginTop: 14 }}>
            {t("ix_title")}
          </div>
          <p
            className="psub"
            style={{ margin: "8px auto 0", maxWidth: "56ch" }}
          >
            {t("ix_sub")}
          </p>
        </div>

        <div className="panels">
          {PANELS.map((p) => (
            <Link key={p.id} className="panel" to={p.path}>
              <div className="pnum">{p.no}</div>
              <div className="pico">
                <PanelIcon name={p.icon} className="" />
              </div>
              <div className="pbody">
                <div className="pname">{t(p.key)}</div>
                <div className="pdesc">{t(p.descKey)}</div>
                <div className="proles">
                  {p.roleKeys.map((r) => (
                    <span key={r}>{t(r)}</span>
                  ))}
                </div>
              </div>
              <div className="parr">
                <PanelIcon name="arr" className="" />
              </div>
            </Link>
          ))}
        </div>

        <div className="flow">
          <PanelCard>
            <div className="t-label" style={{ marginBottom: 10 }}>
              {t("ix_flow")}
            </div>
            <div
              className="row"
              style={{ gap: 10, flexWrap: "wrap", alignItems: "center" }}
            >
              <Tag cls="p-good">{t("ix_f1")}</Tag>
              <span style={{ color: "var(--ink-3)" }}>
                <PanelIcon name="arr" />
              </span>
              <Tag cls="p-good">{t("ix_f2")}</Tag>
              <span style={{ color: "var(--ink-3)" }}>
                <PanelIcon name="arr" />
              </span>
              <Tag cls="p-warn">{t("ix_f3")}</Tag>
              <span style={{ color: "var(--ink-3)" }}>
                <PanelIcon name="arr" />
              </span>
              <Tag cls="p-good">{t("ix_f4")}</Tag>
            </div>
            <p
              className="t-xs muted-2"
              style={{ margin: "11px 0 0", maxWidth: "74ch" }}
            >
              {t("ix_note")}
            </p>
          </PanelCard>
        </div>
      </div>
    </div>
  );
};

export default PanelIndex;
