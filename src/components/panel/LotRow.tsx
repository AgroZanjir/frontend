/**
 * One lot, as a table row.
 *
 * Four panels list lots and all four want the same columns in the same order,
 * so the row lives here rather than being retyped per screen. Clicking it
 * opens the lot passport inside whichever panel the reader is already in.
 */

import { useLocation, useNavigate } from "react-router-dom";

import { Pill, Tag } from "@/components/panel/primitives";
import { daysLeft, usePanelT } from "@/lib/panel-format";
import type { Lot } from "@/lib/panel-types";
import { usePanelData } from "@/lib/panel-data";
import { panelByPath } from "@/lib/panels";

/** The lot passport, in the panel the reader is currently working in. */
/** The passport link for one lot, in whichever panel is asking. */
export const useLotLink = () => {
  const { pathname } = useLocation();
  const panel = panelByPath(pathname);
  const base = `${panel?.path ?? "/farmer"}/lot`;
  // The code travels: without it every row opened the one lot the dataset
  // bundles, whatever row was clicked.
  return (code: string) => `${base}?l=${encodeURIComponent(code)}`;
};

const LotRow = ({ l, farm }: { l: Lot; farm?: boolean }) => {
  const { FARMS, PRODUCTS } = usePanelData();
  const { t, nf, pn } = usePanelT();
  const navigate = useNavigate();
  const lotLink = useLotLink();

  const dl = daysLeft(l);
  // A lot that has left the hub has no sales window left to count down.
  const gone = ["dispatched", "settled", "written_off"].includes(l.st);
  const closing = !gone && dl != null && dl < 14;

  return (
    <tr className="click" onClick={() => navigate(lotLink(l.c))}>
      <td>
        <span className="lotid">{l.c}</span>
        {l.pledge && (
          <>
            {" "}
            <Tag cls="p-warn">{t("pledged")}</Tag>
          </>
        )}
      </td>
      <td>
        {pn(l.p)} <span className="muted-2">{PRODUCTS[l.p].v}</span>
      </td>
      {farm && <td>{FARMS[l.f].n}</td>}
      <td className="r">{nf(l.net)}</td>
      <td>{l.g}</td>
      <td>
        <Pill s={l.st} />
      </td>
      <td
        className="r"
        style={closing ? { color: "var(--warn)", fontWeight: 600 } : undefined}
      >
        {gone || dl == null ? (
          <span className="muted-2">—</span>
        ) : (
          `${dl} ${t("days")}`
        )}
      </td>
    </tr>
  );
};

export default LotRow;
