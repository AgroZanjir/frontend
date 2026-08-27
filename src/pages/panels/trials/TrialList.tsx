/**
 * Z1 - trials.
 *
 * A trial is two arms of the same harvest stored two ways. The observation
 * count is in the list because a trial with four observations and one with
 * eighteen are not comparable evidence, however similar their status pills.
 */

import { useNavigate } from "react-router-dom";

import { Btn, PageHead, Pill, Tbl } from "@/components/panel/primitives";
import { usePanelT } from "@/lib/panel-format";
import { usePanelData } from "@/lib/panel-data";

const TrialList = () => {
  const { TRIALS } = usePanelData();
  const { t, pn } = usePanelT();
  const navigate = useNavigate();

  return (
    <>
      <PageHead
        title={t("t_title")}
        sub={t("t_sub")}
        actions={
          <Btn cls="btn-p" icon="plus">
            {t("save")}
          </Btn>
        }
      />
      <Tbl
        min={760}
        head={[
          [t("t_code")],
          [t("t_prod")],
          [t("t_start")],
          [t("t_day"), true],
          [t("t_arms"), true],
          [t("t_obs"), true],
          [t("t_status")],
          [""],
        ]}
      >
        {TRIALS.map((x) => (
          <tr
            key={x.c}
            className="click"
            onClick={() => navigate("/trials/compare")}
          >
            <td>
              <span className="lotid">{x.c}</span>
            </td>
            <td>{pn(x.p)}</td>
            <td className="mono">{x.d0}</td>
            <td className="r">{x.day}</td>
            <td className="r">{x.arms}</td>
            <td className="r">{x.obs}</td>
            <td>
              <Pill s={x.st} />
            </td>
            <td className="r">
              <Btn sm cls="btn-q">
                {t("view")}
              </Btn>
            </td>
          </tr>
        ))}
      </Tbl>
    </>
  );
};

export default TrialList;
