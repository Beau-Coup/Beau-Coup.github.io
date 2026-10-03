/**
 * Custom KaTeX macros, handed to rehype-katex via its `macros` option.
 *
 * KaTeX has no `\usepackage`, so the LaTeX `physics` package can't be loaded;
 * these reimplement the pieces of it we actually use (`\dv`, `\pdv`, `\dd`),
 * plus a few probability shorthands matching the notation already used in the
 * posts (`\mathbb{E}[…]`, `\mathrm{Var}`, `\mathbf{1}_{…}`, plain `P(…)`).
 *
 * They're written as *function* macros rather than plain string expansions
 * because KaTeX's `\newcommand` still can't take optional arguments, which
 * `\dv[2]{f}{x}` needs. A function macro receives the macro expander and
 * consumes its own arguments, then returns the TeX to expand to. Nothing here
 * keeps state, so the exported map is safe to share across every render.
 */

/** Minimal view of KaTeX's MacroExpander (`katex/src/defineMacro.ts`). */
interface Token {
  text: string;
}
interface MacroContext {
  future(): Token;
  popToken(): Token;
  pushToken(token: Token): void;
  consumeSpaces(): void;
  consumeArgs(numArgs: number): Token[][];
}

/**
 * Source text of a token run, in reading order. The lexer has already eaten
 * the space that terminated each control word, so one is put back — otherwise
 * `\cap B` would be reassembled as the undefined `\capB`.
 */
function tokenText(tokens: Token[]): string {
  return tokens
    .map((t) => (/^\\[a-zA-Z]+$/.test(t.text) ? `${t.text} ` : t.text))
    .join("");
}

/** Source text of a consumed argument; KaTeX hands those back in stack order. */
function argText(tokens: Token[]): string {
  return tokenText(tokens.slice().reverse());
}

/**
 * Text up to the closer matching an *already consumed* opener, ignoring
 * anything nested inside braces or inside a nested open/close pair — so
 * `\E[\E[X \given \G] \given \F]` splits where a reader would expect, which
 * KaTeX's own delimited arguments (first closer wins) do not.
 */
function balancedText(ctx: MacroContext, open: string, close: string): string {
  const tokens: Token[] = [];
  let depth = 0;
  let braces = 0;

  for (;;) {
    const tok = ctx.popToken();
    if (tok.text === "EOF") {
      // Unterminated: hand it back and let KaTeX report the real error.
      ctx.pushToken(tok);
      break;
    }
    if (tok.text === "{") {
      braces++;
    } else if (tok.text === "}") {
      braces--;
    } else if (braces === 0) {
      if (tok.text === open) {
        depth++;
      } else if (tok.text === close) {
        if (depth === 0) break;
        depth--;
      }
    }
    tokens.push(tok);
  }

  return tokenText(tokens);
}

/** A `physics`-style optional order: `\dv[2]{f}{x}` → `"2"`, absent → `null`. */
function optArg(ctx: MacroContext): string | null {
  ctx.consumeSpaces();
  if (ctx.future().text !== "[") return null;
  ctx.popToken();
  return balancedText(ctx, "[", "]");
}

/** True if a braced group follows, i.e. there's another argument to take. */
function hasGroup(ctx: MacroContext): boolean {
  ctx.consumeSpaces();
  return ctx.future().text === "{";
}

/** `2` → `^{2}`, absent order → `""`. */
function power(order: string | null): string {
  return order === null ? "" : `^{${order}}`;
}

/**
 * Shared body of `\dv` and `\pdv`. With two arguments this is the derivative of
 * `f` with respect to `x`; with one it's the bare operator (`\dv{x}` →
 * `d/dx`). As in the real `physics` package, the one-vs-two argument choice is
 * made by peeking for a following group, so `\dv{x} {f}` would be read as two
 * arguments — brace-free the second factor if that's not what you meant.
 */
function derivative(ctx: MacroContext, d: string): string {
  const order = optArg(ctx);
  const first = argText(ctx.consumeArgs(1)[0]);

  // `\pdv{f}{x}{y}`: a third argument means a mixed second partial.
  if (hasGroup(ctx)) {
    const second = argText(ctx.consumeArgs(1)[0]);
    if (d === "\\partial" && order === null && hasGroup(ctx)) {
      const third = argText(ctx.consumeArgs(1)[0]);
      return `\\frac{${d}^{2}{${first}}}{${d}{${second}}\\,${d}{${third}}}`;
    }
    const p = power(order);
    return `\\frac{${d}${p}{${first}}}{${d}{${second}}${p}}`;
  }

  const p = power(order);
  return `\\frac{${d}${p}}{${d}{${first}}${p}}`;
}

/**
 * A name that takes its argument in any of `{…}`, `[…]` or `(…)` and wraps it
 * in auto-sized `open`/`close` delimiters — `\E{X}`, `\E[X]` and `\E(X)` all
 * give `E[X]`. With nothing following, expands to the bare symbol so `\E X`
 * and `\Var` on its own still work.
 */
function applied(symbol: string, open: string, close: string) {
  const wrap = (body: string) =>
    `${symbol}\\left${open}{${body}}\\right${close}`;

  return (ctx: MacroContext): string => {
    ctx.consumeSpaces();
    const next = ctx.future().text;
    if (next === "{") return wrap(argText(ctx.consumeArgs(1)[0]));
    if (next === "[") {
      ctx.popToken();
      return wrap(balancedText(ctx, "[", "]"));
    }
    if (next === "(") {
      ctx.popToken();
      return wrap(balancedText(ctx, "(", ")"));
    }
    return symbol;
  };
}

export const KATEX_MACROS = {
  // ---- physics: differentials and derivatives (upright d, as it should be) --
  "\\dd": (ctx: MacroContext): string => {
    const order = optArg(ctx);
    // Bare `\dd`, as in `\int f \dd x`: just the upright d, no added space.
    if (!hasGroup(ctx)) return `\\mathrm{d}${power(order)}`;
    return `\\,\\mathrm{d}${power(order)}{${argText(ctx.consumeArgs(1)[0])}}`;
  },
  "\\dv": (ctx: MacroContext): string => derivative(ctx, "\\mathrm{d}"),
  "\\pdv": (ctx: MacroContext): string => derivative(ctx, "\\partial"),

  // ---- probability -------------------------------------------------------
  "\\E": applied("\\mathbb{E}", "[", "]"),
  "\\Var": applied("\\mathrm{Var}", "(", ")"),
  "\\Cov": applied("\\mathrm{Cov}", "(", ")"),
  "\\Prob": applied("P", "(", ")"),
  "\\ind": (ctx: MacroContext): string =>
    `\\mathbf{1}_{${argText(ctx.consumeArgs(1)[0])}}`,
  "\\indep": "\\perp\\!\\!\\!\\perp",
  // Conditioning bar that grows with its surrounding \left…\right pair.
  "\\given": "\\;\\middle\\vert\\;",
};
