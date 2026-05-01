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
        title: "Certified stability margins for policy-gradient controllers in nonlinear regimes",
        venue: "L4DC",
        authors: "I. Halverson, M. Tanaka",
        note: "oral",
    },
    {
        year: 2022,
        title: "Learning Agile Paths from Optimal Control",
        venue: "Conference on Robot Learning: Workshop on Agile Locomotion",
        authors: "Alex Beaudin and Hsiu-Chin Lin",
    }
];

export const PROJECTS = [
    {
        title: "soft-lyapunov",
        desc: "A small Python library for fitting neural Lyapunov candidates with verified sub-level sets. Used in two of my papers.",
        status: "maintained",
    },
    {
        title: "control-notes",
        desc: "Open lecture notes from the reading group I co-ran on robust and adaptive control. Roughly 180 pages, still being edited.",
        status: "in progress",
    },
    {
        title: "tinympc-jax",
        desc: "A pedagogical reimplementation of model predictive control in JAX, ~400 lines. Mostly an excuse to understand implicit differentiation.",
        status: "archived",
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
            { date: "2025-02-04", v: 0, ref: "a1f3c0d", msg: "init: σ-algebras feel arbitrary" },
            { date: "2025-04-18", v: 1, ref: "7c92be4", msg: "Carathéodory's extension clicked, sort of" },
            { date: "2025-08-02", v: 1, ref: "e44a217", msg: "still confused about Radon-Nikodym" },
            { date: "2025-11-19", v: 2, ref: "b13d8f9", msg: "RN as a derivative — entropy reading helped", linkPost: "carathéodory" },
            { date: "2026-03-08", v: 3, ref: "0aa6c12", msg: "comfortable. moving on to Lp", tag: "v1.0" },
        ],
    },
    {
        id: "spectral",
        name: "spectral-theory",
        branch: 1,
        series: [
            { date: "2025-06-10", v: 1, ref: "f10b3e2", msg: "init: spectrum vs eigenvalues" },
            { date: "2025-09-22", v: 1, ref: "229ad07", msg: "compact operators are the friendly case" },
            { date: "2026-01-14", v: 2, ref: "c4e1d8a", msg: "resolvent set, yes — functional calculus, no", linkPost: "spectral-radius" },
            { date: "2026-04-02", v: 2, ref: "9b7c0e3", msg: "Gelfand's formula keeps sliding out of my head" },
        ],
    },
    {
        id: "infogeo",
        name: "info-geometry",
        branch: 2,
        series: [
            { date: "2025-07-30", v: 0, ref: "3d2f8a1", msg: "init: what even is a statistical manifold" },
            { date: "2025-10-12", v: 1, ref: "ee4b9c7", msg: "Fisher metric, definitions yes" },
            { date: "2026-02-25", v: 1, ref: "82a3fd6", msg: "still feels like a coincidence", linkPost: "fisher-coincidence" },
        ],
    },
    {
        id: "sde",
        name: "sde",
        branch: 3,
        series: [
            { date: "2025-03-19", v: 1, ref: "5e018af", msg: "init: Itô vs Stratonovich" },
            { date: "2025-07-08", v: 2, ref: "60c4d2b", msg: "Itô's lemma clicked on a long flight" },
            { date: "2025-12-01", v: 3, ref: "a98e145", msg: "wrote the lecture notes" },
            { date: "2026-04-15", v: 3, ref: "1f3b806", msg: "comfortable enough to teach it", tag: "teaching" },
        ],
    },
];

export const READING = [
    { title: "Real Analysis: Modern Techniques", author: "Folland", state: "rereading ch. 6" },
    { title: "The Idea of the World", author: "Bernardo Kastrup", state: "slowly" },
    { title: "Linear Systems Theory", author: "Hespanha", state: "for teaching" },
    { title: "The Overstory", author: "Powers", state: "before bed" },
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
