import { useMemo, useState } from "react";
import { TOPICS, RATING_LABEL, fmtDate, seriesRef } from "../data/site";

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

    // Smooth line through the nodes via a monotone cubic spline (Fritsch–Carlson
    // / PCHIP), converted to cubic Béziers. Monotone interpolation cannot
    // overshoot between points, so it stays inside the lane band without any
    // clamping (which is what kinked the curve). It keeps slope through
    // intermediate nodes but levels off at genuine peaks/plateaus — e.g. the
    // 1→2→3→3 series flows through the 2 and eases flat into the 3→3 tail.
    const pathFor = (topic: typeof TOPICS[number]) => {
        const pts = topic.series.map((s) => ({ x: dateX(s.date), y: laneY(s.v) }));
        const n = pts.length;
        if (n === 0) return "";
        const start = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
        if (n === 1) return start;
        if (n === 2) return `${start} L ${pts[1].x.toFixed(1)} ${pts[1].y.toFixed(1)}`;

        // Secant slopes and segment widths.
        const h: number[] = [];
        const delta: number[] = [];
        for (let i = 0; i < n - 1; i++) {
            const dx = pts[i + 1].x - pts[i].x || 1e-6;
            h.push(dx);
            delta.push((pts[i + 1].y - pts[i].y) / dx);
        }

        // Node tangents (Fritsch–Carlson): 0 at extrema/plateaus, else a
        // weighted harmonic mean of the neighboring secants (no overshoot).
        const m: number[] = new Array(n);
        m[0] = delta[0];
        m[n - 1] = delta[n - 2];
        for (let i = 1; i < n - 1; i++) {
            if (delta[i - 1] * delta[i] <= 0) {
                m[i] = 0;
            } else {
                const w1 = 2 * h[i] + h[i - 1];
                const w2 = h[i] + 2 * h[i - 1];
                m[i] = (w1 + w2) / (w1 / delta[i - 1] + w2 / delta[i]);
            }
        }

        let d = start;
        for (let i = 0; i < n - 1; i++) {
            const p1 = pts[i];
            const p2 = pts[i + 1];
            // Hermite -> Bézier: control points a third of the way along each tangent.
            const cp1x = p1.x + h[i] / 3;
            const cp1y = p1.y + (m[i] * h[i]) / 3;
            const cp2x = p2.x - h[i] / 3;
            const cp2y = p2.y - (m[i + 1] * h[i]) / 3;
            d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
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
                                            r={3}
                                            className="node-dot"
                                        />
                                        {(active === t.id || s.tag) && (
                                            <text
                                                x={dateX(s.date)}
                                                y={laneY(s.v) - 10}
                                                textAnchor="middle"
                                                className="node-label"
                                            >
                                                {seriesRef(t.id, s).slice(0, 7)}
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

            <p className="eyebrow sage swim-h2">Recent notes</p>
            <ol className="commits-flat">
                {TOPICS.flatMap((t) =>
                    t.series.map((s) => ({
                        ...s,
                        ref: seriesRef(t.id, s),
                        topicId: t.id,
                        topicName: t.name,
                        branch: t.branch,
                    }))
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
