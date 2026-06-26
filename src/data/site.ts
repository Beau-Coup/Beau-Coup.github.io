export const PROFILE = {
    name: "Alex Beaudin",
    role: "PhD student, Electrical Engineering and Computer Science",
    affil: "UC Berkeley",
    blurb:
        "I'm Alex, I work at the intersection of optimal control from the lens of data-driven control, and using uncertainty as a decision-making tool.",
    longer:
        "Before the PhD, I completed my B.Sc. at McGill University in my hometown. I'm advised by Murat Arcak.",
    email: "alex [dot] beaudin [at] berkeley.edu",
    links: [
        { label: "CV (PDF)", href: "#cv" },
        { label: "Google Scholar", href: "" },
        { label: "GitHub", href: "https://github.com/beau-coup" },
    ],
};

export const PUBLICATIONS = [
    {
        year: 2026,
        title: "Multi-Step Gaussian Process Propagation for Adaptive Path Planning",
        venue: "arXiv:2604.19148",
        authors: "Alex Beaudin and Bjørn Andreas Kristiansen et. al.",
        note: "preprint",
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

export type TopicSeries = {
    date: string;
    v: 0 | 1 | 2 | 3;
    ref: string;
    msg: string;
    linkPost?: string;
    tag?: string;
};

export type Topic = {
    id: string;
    name: string;
    branch: 0 | 1 | 2 | 3;
    series: TopicSeries[];
};

export const TOPICS: Topic[] = [
    {
        id: "measure",
        name: "measure-theory",
        branch: 0,
        series: [
            { date: "2025-04-19", v: 0, ref: "a1f3c0d", msg: "what" },
        ],
    },
    {
        id: "sde",
        name: "sde",
        branch: 2,
        series: [
            { date: "2025-03-19", v: 1, ref: "5e018af", msg: "init: Itô vs Stratonovich" },
            { date: "2025-07-08", v: 2, ref: "60c4d2b", msg: "Itô's lemma clicked on a long flight" },
            { date: "2025-12-01", v: 3, ref: "a98e145", msg: "wrote the lecture notes" },
            { date: "2026-04-15", v: 3, ref: "1f3b806", msg: "comfortable enough to teach it", tag: "teaching" },
        ],
    },
];

export const READING = [
    { title: "Measure, Integration and Real Analysis", author: "Sheldon Axler", state: "Trudging along" },
    { title: "Style: Ten Lessons in Clarity and Grace", author: "Joseph M. Williams", state: "I can't write" },
];

export const RATING_LABEL = ["lost", "confused", "shaky", "clear"] as const;
export const RATING_DESCRIPTION: Record<number, string> = {
    0: "lost — cannot reconstruct definitions",
    1: "confused — definitions yes, intuition no",
    2: "shaky — can use it, can't yet teach it",
    3: "clear — comfortable enough to explain",
};

export function fmtDate(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}
