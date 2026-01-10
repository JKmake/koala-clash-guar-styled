# Repository Guidelines

## Project Structure & Module Organization
- `src/main/`: Electron main process (core lifecycle, config, system integration).
- `src/renderer/src/`: React UI (components, pages, hooks, routes, assets, utils).
- `src/preload/`: IPC bridge between renderer and main.
- `src/shared/types/`: TypeScript types shared across processes.
- `resources/`, `extra/`: bundled assets; `electron-builder.yml` for packaging; `out/` for build output.

## Build, Test, and Development Commands
- `pnpm install`: install dependencies.
- `pnpm dev`: start Electron + Vite dev server (renderer hot reload; restart main manually).
- `pnpm lint`: run ESLint checks.
- `pnpm format`: run Prettier formatting.
- `pnpm typecheck`: full TypeScript type check (use `pnpm typecheck:node` or `pnpm typecheck:web` for scoped checks).
- `pnpm build:mac|win|linux`: build platform-specific artifacts (electron-vite + electron-builder).
- If Electron install is broken, run `node node_modules/electron/install.js` after install.

## Coding Style & Naming Conventions
- TypeScript-first; React 19 in the renderer; Electron in the main process.
- Formatting is enforced by Prettier (`pnpm format`); lint rules come from the Electron toolkit config plus React.
- File naming is mixed (kebab-case in many component files, PascalCase for some entry components); match the local folder’s convention and keep exports descriptive.

## Testing Guidelines
- No automated test runner is configured.
- Before submitting changes, run `pnpm typecheck` and `pnpm lint`, then smoke-test with `pnpm dev`.
- Changes in `src/main/` or `src/preload/` require a full app restart; renderer changes hot-reload.

## Commit & Pull Request Guidelines
- This checkout has no `.git` history, so commit patterns can’t be derived; follow the README example with an imperative summary (e.g., `Add some AmazingFeature`) and use feature branches like `feature/<name>`.
- PRs should include a concise description, test notes (OS + commands run), and screenshots for UI changes.
- The maintainer notes the project is personal; keep PRs focused and easy to review.

## Environment & Configuration Notes
- Required: Node.js >= 20 and pnpm (packageManager is `pnpm@10.15.0`).
- Windows dev tip: if the window is blank, disable TUN.
