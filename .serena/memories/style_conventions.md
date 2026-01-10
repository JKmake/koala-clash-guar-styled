# Style and conventions

- Primary languages: TypeScript in both main and renderer; React in renderer.
- Formatting: Prettier is the formatter (pnpm format). Use default formatting rather than manual tweaks.
- Linting: ESLint with @electron-toolkit configs plus React rules (pnpm lint).
- Naming: file naming is mixed (kebab-case for many component files, PascalCase for some entry components). Match the convention in the target folder and keep exports descriptive.
- Package manager: pnpm (Node >= 20).
