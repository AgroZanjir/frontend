/**
 * Produce art direction.
 *
 * Every item composes its own gradient card from a colour pair and five
 * blurred blobs placed by a seeded shuffle. It is a designed placeholder for
 * photography, not a missing image - and because the seed is the produce id,
 * the same melon looks the same on every render and in every screenshot.
 */

import { Link } from "react-router-dom";

import { Tag } from "@/components/panel/primitives";
import { usePanelT } from "@/lib/panel-format";
import { MONTHS, inSeason, type ProduceItem } from "@/lib/site-data";

/** Month abbreviation in the reader's language. */
export const useMonths = () => {
  const { lang } = usePanelT();
  return (m: number) => MONTHS[lang]?.[m - 1] ?? MONTHS.en[m - 1];
};

export const PShot = ({ p, big }: { p: ProduceItem; big?: boolean }) => {
  const mon = useMonths();

  let h = 0;
  for (let i = 0; i < p.id.length; i++) h = (h * 31 + p.id.charCodeAt(i)) >>> 0;
  const rand = () => {
    h ^= h << 13;
    h >>>= 0;
    h ^= h >> 17;
    h ^= h << 5;
    h >>>= 0;
    return h / 4294967296;
  };

  const blobs = Array.from({ length: 5 }, (_, i) => {
    const size = 22 + rand() * 40;
    const x = rand() * 88 - 8;
    const y = rand() * 88 - 8;
    const opacity = 0.16 + rand() * 0.24;
    return { i, size, x, y, opacity };
  });

  return (
    <div
      className="pshot"
      style={{
        background: `linear-gradient(145deg,${p.c[0]},${p.c[1]})`,
        ...(big ? { aspectRatio: "5/4" } : null),
      }}
    >
      {blobs.map((b) => (
        <div
          key={b.i}
          className="blob"
          style={{
            width: `${b.size}%`,
            aspectRatio: "1",
            left: `${b.x}%`,
            top: `${b.y}%`,
            background: b.i % 2 ? p.c[0] : "#fff",
            opacity: b.opacity.toFixed(2),
          }}
        />
      ))}
      <div className="season">
        {mon(p.season[0])} – {mon(p.season[1])}
      </div>
    </div>
  );
};

export const ProduceCard = ({ p }: { p: ProduceItem }) => {
  const { t } = usePanelT();
  return (
    <Link className="pcard" to={`/showroom/${p.id}`}>
      <PShot p={p} />
      <div className="pbody">
        <div className="d3" style={{ fontSize: 17 }}>
          {t(p.k)}
        </div>
        <div className="t-sm muted-2">{p.v}</div>
        <div className="pmeta">
          <span>{p.regions[0]}</span>
          <span className="mono">
            {p.vol} {t("w_sr_t_kg")}
          </span>
        </div>
        <div className="pcerts">
          {p.certs.length ? (
            p.certs.map((c) => (
              <Tag key={c} cls="p-good">
                {c}
              </Tag>
            ))
          ) : (
            <Tag cls="p-line">{t("w_sr_none")}</Tag>
          )}
        </div>
      </div>
    </Link>
  );
};

/**
 * The twelve-month season band - the single most-asked question from a buyer,
 * answered without them having to read a date range twice.
 */
export const SeasonCalendar = ({ p }: { p: ProduceItem }) => {
  const mon = useMonths();
  return (
    <div className="calendar">
      {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
        <div key={m} className={inSeason(p, m) ? "cal-m on" : "cal-m"}>
          {mon(m)}
        </div>
      ))}
    </div>
  );
};
