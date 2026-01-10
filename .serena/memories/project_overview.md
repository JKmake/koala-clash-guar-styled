# Sparkle project overview

- Purpose: Sparkle is a desktop GUI for the Mihomo (clash core) proxy engine.
- Tech stack: Electron main process + React 19 renderer + TypeScript; electron-vite for dev/build, electron-builder for packaging. UI uses HeroUI (NextUI), Tailwind CSS, SWR, and Monaco Editor.
- Code structure:
  - src/main/: Electron main process (core, config, resolve, sys, utils)
  - src/renderer/src/: React UI (components, pages, hooks, routes, assets, utils)
  - src/preload/: IPC bridge
  - src/shared/types/: shared TS types
  - resources/, extra/: bundled assets
  - electron-builder.yml: packaging config
- Dev notes: renderer hot reloads; main/preload changes require app restart. On Windows, TUN can cause blank screen; disable it during dev.
