import { useMemo, useState } from "react";
import { TOPICS, RATING_LABEL, fmtDate } from "../data/site";

export default function Tracker() {
  const [active, setActive] = useState<string | null>(null);

  const [t0, t1] = useMemo(() => {
    const ts = TOPICS.flatMap((t) => t.series.map((s) => new Date(s.date).getTime()));
    return [Math.min(...ts), Math.max(...ts)];
  }, []);
  const span = Math.max(1, t1 - t0);

  const W = 700;
  const H = 360;
  const padL = 110;
  const padR = 24;
  const padT = 30;
  const padB = 40;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const laneY = (v: number) => padT + (1 - v / 3) * innerH;
  const dateX = (d: string | Date) => padL + ((new Date(d).getTime() - t0) / span) * innerW;

  const pathFor = (topic: typeof TOPICS[number]) => {
    const pts = topic.series;
    if (!pts.length) return "";
    let d = `M ${dateX(pts[0].date).toFixed(1)} ${laneY(pts[0].v).toFixed(1)}`;
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1];
      const cur = pts[i];
      const x0 = dateX(prev.date);
      const y0 = laneY(prev.v);
      const x1 = dateX(cur.date);
      const y1 = laneY(cur.v);
      if (prev.v === cur.v) {
        d += ` L ${x1.toFixed(1)} ${y1.toFixed(1)}`;
      } else {
        const mx = (x0 + x1) / 2;
        d += ` C ${mx.toFixed(1)} ${y0.toFixed(1)}, ${mx.toFixed(1)} ${y1.toFixed(1)}, ${x1.toFixed(1)} ${y1.toFixed(1)}`;
      }
    }
    return d;
  };

  const ticks = useMemo(() => {
    const out: Date[] = [];
    const start = new Date(t0);
    start.setDate(1);
    let cur = new Date(start.getFullYear(), Math.floor(start.getMonth() / 3) * 3, 1);
    while (cur.getTime() <= t1) {
      if (cur.getTime() >= t0) out.push(new Date(cur));
      cur = new Date(cur.getFullYear(), cur.getMonth() + 3, 1);
    }
    return out;
  }, [t0, t1]);

  return (
    <>
      <div className="swim-key">
        {TOPICS.map((t) => (
          <button
            key={t.id}
            className={"swim-key-item" + (active === t.id ? " is-on" : "")}
            onMouseEnter={() => setActive(t.id)}
            onMouseLeave={() => setActive(null)}
            onFocus={() => setActive(t.id)}
            onBlur={() => setActive(null)}
          >
            <span className={`swim-swatch lane-${t.branch}`} />
            <span className="swim-key-name">{t.name}</span>
          </button>
        ))}
      </div>

      <div className="swim-wrap">
        <svg
          className="swim"
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label="Confidence over time across topics"
        >
          {[0, 1, 2, 3].map((v) => (
            <g key={v} className={`swim-lane swim-lane-${v}`}>
              <line
                x1={padL}
                x2={W - padR}
                y1={laneY(v)}
                y2={laneY(v)}
                className="swim-laneline"
              />
              <text
                x={padL - 12}
                y={laneY(v) + 4}
                textAnchor="end"
                className="swim-lanelabel"
              >
                {RATING_LABEL[v]}
              </text>
            </g>
          ))}

          {ticks.map((d, i) => (
            <g key={i}>
              <line
                x1={dateX(d)}
                x2={dateX(d)}
                y1={padT - 6}
                y2={H - padB + 6}
                className="swim-tick"
              />
              <text
                x={dateX(d)}
                y={H - padB + 22}
                textAnchor="middle"
                className="swim-ticktext"
              >
                {d.toLocaleDateString("en-US", { month: "short", year: "2-digit" })}
              </text>
            </g>
          ))}

          {TOPICS.map((t) => {
            const dim = active && active !== t.id;
            return (
              <g
                key={t.id}
                className={`thread thread-${t.branch}` + (dim ? " is-dim" : "") + (active === t.id ? " is-on" : "")}
                onMouseEnter={() => setActive(t.id)}
                onMouseLeave={() => setActive(null)}
              >
                <path d={pathFor(t)} className="thread-line" />
                {t.series.map((s, i) => (
                  <g key={i} className={`node v-${s.v}`}>
                    <circle
                      cx={dateX(s.date)}
                      cy={laneY(s.v)}
                      r={4.5}
                      className="node-dot"
                    />
                    {(active === t.id || s.tag) && (
                      <text
                        x={dateX(s.date)}
                        y={laneY(s.v) - 10}
                        textAnchor="middle"
                        className="node-label"
                      >
                        {s.ref.slice(0, 7)}
                      </text>
                    )}
                  </g>
                ))}
                <text
                  x={dateX(t.series[t.series.length - 1].date) + 8}
                  y={laneY(t.series[t.series.length - 1].v) + 4}
                  className="thread-name"
                >
                  {t.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <h2 className="h2 swim-h2">Recent notes</h2>
      <ol className="commits-flat">
        {TOPICS.flatMap((t) =>
          t.series.map((s) => ({ ...s, topicId: t.id, topicName: t.name, branch: t.branch }))
        )
          .sort((a, b) => +new Date(b.date) - +new Date(a.date))
          .slice(0, 8)
          .map((c) => (
            <li
              key={c.ref}
              className={"commit-flat" + (active === c.topicId ? " is-on" : "")}
              onMouseEnter={() => setActive(c.topicId)}
              onMouseLeave={() => setActive(null)}
            >
              <span className={`thread-swatch lane-${c.branch}`} />
              <span className={`ref ref-${c.branch}`}>{c.ref.slice(0, 7)}</span>
              <span className={`pill pill-${c.v}`}>{RATING_LABEL[c.v]}</span>
              <span className="commit-msg-flat">{c.msg}</span>
              <span className="commit-meta-flat">
                <span className="commit-topic">{c.topicName}</span>
                <span className="commit-date-flat">{fmtDate(c.date)}</span>
                {c.linkPost && (
                  <a className="ulink quiet small" href={`/posts/${encodeURIComponent(c.linkPost)}`}>
                    post →
                  </a>
                )}
              </span>
            </li>
          ))}
      </ol>
    </>
  );
}
