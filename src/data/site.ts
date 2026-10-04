export const PROFILE = {
    name: "Alex Beaudin",
    role: "PhD student · Robotics & Control",
    affil: "UC Berkeley",
    blurb:
        "I'm Alex, I work at the intersection of data-driven optimal control through the lens of uncertainty and sampling.",
    longer:
        "Before the PhD, I completed my B.Sc. at McGill University in my hometown. I'm advised by Murat Arcak.",
    email: "alex [dot] beaudin [at] berkeley.edu",
    links: [
        { label: "CV (PDF)", href: "/cv.pdf" },
        { label: "Google Scholar", href: "https://scholar.google.com/citations?user=bIktwIQAAAAJ&hl=en&citsig=ADQXK0yUKCIZPm9PGih3FLRWbl5U" },
        { label: "GitHub", href: "https://github.com/beau-coup" },
        { label: "a.b [at] berkeley.edu", href: "" },
    ],
};

export type PubLink = { label: string; href: string };
export type PubStatus = {
    label: string;
    variant?: "oral" | "spotlight" | "best" | "preprint";
};
export type Publication = {
    year: number;
    title: string;
    venue: string;
    authors: string;
    note?: string;
    /* Optional — when present, render the transit-line resource links / status
       tags from the design handoff. When `links` is omitted, PubList falls back
       to placeholder `#` links so the transit motif still renders. */
    links?: PubLink[];
    status?: PubStatus[];
};

export const PUBLICATIONS: Publication[] = [
    {
        year: 2026,
        title: "Reducing the Sample Complexity of Sampling-based Control via Horizon Splitting",
        venue: "ICLR",
        authors: "Alex Beaudin et. al.",
        status: [{ label: "Under Review", variant: "preprint" }],
    },
    {
        year: 2026,
        title: "Learning-enabled Parameter Synthesis for Nonlinear Systems from Signal Temporal Logic",
        venue: "arXiv:2607.08899",
        authors: "Alex Beaudin and Hanna Krasowski et. al.",
        links: [{ label: "ArXiv", href: "https://arxiv.org/abs/2607.08899" }],
        status: [{ label: "poster", variant: "preprint" }],
    },
    {
        year: 2026,
        title: "Any-Body Guard: Universal Safeguarding for Manipulation Policies via Action Masking",
        venue: "arXiv:2606.22278",
        authors: "Alex Beaudin and Hanna Krasowski and Kartik Nagpal et. al.",
        note: "preprint",
        links: [{ label: "ArXiv", href: "https://arxiv.org/abs/2606.22278" }],
    },
    {
        year: 2026,
        title: "Multi-Step Gaussian Process Propagation for Adaptive Path Planning",
        venue: "arXiv:2604.19148",
        authors: "Alex Beaudin and Bjørn Andreas Kristiansen et. al.",
        note: "preprint",
        links: [{ label: "ArXiv", href: "https://arxiv.org/abs/2604.19148" }],
    },
    {
        year: 2022,
        title: "Learning Agile Paths from Optimal Control",
        venue: "Conference on Robot Learning: Workshop on Agile Locomotion",
        authors: "Alex Beaudin and Hsiu-Chin Lin",
    },
];

export const PROJECTS = [
    {
        title: "GGPy",
        desc: "A small Gaussian Process library aimed at modularity used in my projects.",
        status: "in progress",
    },
    {
        title: "biolearn",
        desc: "An implementation of different benchmarks for learning from STL specifications.",
        status: "in progress",
    },
];

export const READING = [
    { title: "Measure, Integration and Real Analysis", author: "Sheldon Axler", state: "Trudging along" },
    { title: "Style: Ten Lessons in Clarity and Grace", author: "Joseph M. Williams", state: "I can't write" },
];

export function fmtDate(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}
