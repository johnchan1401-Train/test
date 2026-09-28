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
