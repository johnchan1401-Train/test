# CLAUDE.md

Guidance for Claude Code (and other contributors) working in this repository.

## Stack & Conventions

**Hard constraint: vanilla HTML, CSS, and JavaScript only — no frameworks, no build step.**

- No frontend frameworks or libraries (React, Vue, Svelte, Angular, jQuery, etc.).
- No CSS frameworks or preprocessors (Tailwind, Bootstrap, Sass/SCSS, Less, etc.).
- No build tools, bundlers, or compilers (Webpack, Vite, esbuild, Babel, TypeScript, etc.).
- No package manager / `node_modules` dependency for shipping the site — write plain `.html`, `.css`, and `.js` files that run directly in the browser with no compile or transpile step.
- Use modern standard browser APIs (ES modules, `fetch`, CSS custom properties, etc.) instead of pulling in a library to do the same job.
- If a third-party script is unavoidable, load it directly via a `<script>` tag (e.g. from a CDN) rather than installing it as a build dependency.

## Design Direction

**Terminal-style: near-black background, monospace type throughout, green-on-black text.**

- Background is near-black (`#0a0d0a`); no light theme.
- All type — headings, body, labels, code — uses a single monospace font stack (system monospace: `ui-monospace, Menlo, Consolas, monospace`), not a separate display/body typeface pairing.
- Text and accents are shades of green on that black background (bright green for primary text/links, a dimmer green for muted/secondary text) — no other hues.
- Cards, panels, and inputs use minimal/near-sharp corners (no large rounded corners, no pill shapes) and thin dim-green borders — no drop shadows.
- Icons are inline SVG line art colored to match the green palette via `currentColor`, never emoji.
- This is the site-wide look: it applies to every page, including tools and lessons added later, not just the ones that exist today.

## Working conventions

- Before implementing any non-trivial feature, ask clarifying questions about scope, edge cases, and constraints first — don't propose a plan until you've asked.
