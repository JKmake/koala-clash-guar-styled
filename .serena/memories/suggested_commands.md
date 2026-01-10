# Suggested commands

- pnpm install: install dependencies
- pnpm dev: run Electron + Vite dev server (renderer HMR; restart main manually)
- pnpm lint: run ESLint
- pnpm format: run Prettier
- pnpm typecheck: full TypeScript check (or pnpm typecheck:node / pnpm typecheck:web)
- pnpm build:mac | pnpm build:win | pnpm build:linux: build platform artifacts
- pnpm postinstall: install Electron deps
- node node_modules/electron/install.js: fix Electron install if dev commands fail

Handy local utilities: rg (ripgrep) for searches, ls for directory listing, git status for repo state.
