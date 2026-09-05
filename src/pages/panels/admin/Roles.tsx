/**
 * A6 - roles and the permission matrix.
 *
 * Thirty-seven roles built from ten capabilities. The matrix is the whole
 * argument: roles are not arbitrary labels, they are named bundles of the same
 * small set of primitives, which is why a new sector can be added without
 * inventing a new permission system.
 *
 * The scope column matters as much as the ticks - the same capability held
 * platform-wide, at one organisation, or at a single facility is three
 * different amounts of power.
 */

import { Fragment } from "react";

import PanelIcon from "@/components/panel/icons";
import { Btn, Note, PageHead, Stat, Tag } from "@/components/panel/primitives";
import { capShortKey } from "@/pages/panels/admin/helpers";
import { usePanelT } from "@/lib/panel-format";
import { downloadCsv } from "@/lib/panel-download";
import { usePanelData } from "@/lib/panel-data";

const AdminRoles = () => {
  const { CAPS, ORGTYPES, ROLES, ROLE_COUNT } = usePanelData();
  const { t } = usePanelT();

  return (
    <>
      <PageHead
        title={t("ar_title")}
        sub={t("ar_sub")}
        actions={
          /* The matrix is the argument this screen makes, and it is what a
             compliance reviewer asks to be sent. One row per role, one column
             per capability, ticked or not. */
          <Btn
            icon="down"
            onClick={() =>
              downloadCsv(
                "roles-and-capabilities",
                [t("ar_role"), t("ar_scope"), ...CAPS.map(([, label]) => t(label))],
                ROLES.flatMap((group) =>
                  group.items.map((r) => [
                    t(r[1]),
                    t(`sc_${r[3]}`),
                    ...CAPS.map(([c]) => (r[2].includes(c) ? "x" : "")),
                  ]),
                ),
              )
            }
          >
            {t("export")}
          </Btn>
        }
      />

      <div className="grid g3" style={{ marginBottom: 14 }}>
        <Stat k={t("n_orgtypes")} v={ORGTYPES.length} d={t("ar_d1")} />
        <Stat k={t("n_rolecount")} v={ROLE_COUNT} d={t("ar_d2")} acc />
        <Stat k={t("n_capcount")} v={CAPS.length} d={t("ar_d3")} />
      </div>

      <div className="tw">
        <table style={{ minWidth: 1000, tableLayout: "fixed" }}>
          <colgroup>
            <col style={{ width: 230 }} />
            <col style={{ width: 104 }} />
            {CAPS.map(([c]) => (
              <col key={c} />
            ))}
          </colgroup>
          <thead>
            <tr>
              <th>{t("ar_role")}</th>
              <th>{t("ar_scope")}</th>
              {CAPS.map(([c]) => (
                <th
                  key={c}
                  style={{
                    textAlign: "center",
                    fontSize: "9.5px",
                    whiteSpace: "normal",
                    lineHeight: 1.25,
                    padding: "9px 4px",
                  }}
                >
                  {t(capShortKey(c))}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROLES.map((group) => (
              <Fragment key={group.g}>
                <tr>
                  <td
                    colSpan={CAPS.length + 2}
                    style={{
                      background: "var(--surface-2)",
                      fontWeight: 600,
                      fontSize: 11,
                      letterSpacing: ".06em",
                      textTransform: "uppercase",
                      color: "var(--ink-3)",
                    }}
                  >
                    {t(group.g)}
                  </td>
                </tr>
                {group.items.map(([id, label, caps, scope]) => (
                  <tr key={id}>
                    <td style={{ fontWeight: 500, whiteSpace: "nowrap" }}>
                      {t(label)}
                    </td>
                    <td>
                      <Tag cls="p-line">{t(`sc_${scope}`)}</Tag>
                    </td>
                    {CAPS.map(([c]) => (
                      <td key={c} style={{ textAlign: "center" }}>
                        {caps.includes(c) ? (
                          <span style={{ color: "var(--primary)" }}>
                            <PanelIcon name="check" />
                          </span>
                        ) : (
                          <span className="muted-2">·</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <Note style={{ marginTop: 12 }}>{t("ar_legend")}</Note>
    </>
  );
};

export default AdminRoles;
