import { useMemo, useState } from "react";
import { fmtDate, RATING_LABEL } from "../data/site";

export type WritingPost = {
    slug: string;
    date: string;
    title: string;
    tag: string;
    rating?: number;
    excerpt: string;
};

export default function WritingFilter({ posts }: { posts: WritingPost[] }) {
    const [filter, setFilter] = useState<string>("all");
    const tags = useMemo(() => {
        const set = new Set(posts.map((p) => p.tag));
        return ["all", ...Array.from(set)];
    }, [posts]);
    const visible = filter === "all" ? posts : posts.filter((p) => p.tag === filter);

    return (
        <>
            <div className="chips">
                {tags.map((t) => (
                    <button
                        key={t}
                        className={"chip" + (filter === t ? " is-on" : "")}
                        onClick={() => setFilter(t)}
                    >
                        {t}
                    </button>
                ))}
            </div>
            <ul className="post-list big">
                {visible.map((p) => (
                    <li key={p.slug} className="post-row">
                        <a className="post-row-btn" href={`/posts/${encodeURIComponent(p.slug)}`}>
                            <span className="post-date">{fmtDate(p.date)}</span>
                            <span className="post-title">{p.title}</span>
                            {p.rating != null && (
                                <span className={`pill pill-${p.rating}`}>{RATING_LABEL[p.rating]}</span>
                            )}
                            <span className="post-excerpt">{p.excerpt}</span>
                        </a>
                    </li>
                ))}
            </ul>
        </>
    );
}
