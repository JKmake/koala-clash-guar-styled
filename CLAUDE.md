# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Sparkle is a desktop GUI for [Mihomo](https://github.com/MetaCubeX/mihomo) (proxy/clash core), built with Electron + React + TypeScript.

## Common Commands

```bash
pnpm install          # Install dependencies
pnpm dev              # Start development server (hot reload for renderer, manual restart for main)
pnpm lint             # Run ESLint
pnpm format           # Format code with Prettier
pnpm typecheck        # Run TypeScript type checking (both main and renderer)
pnpm typecheck:node   # Type check main process only
pnpm typecheck:web    # Type check renderer process only

# Build for specific platform
pnpm build:win        # Build Windows version
pnpm build:mac        # Build macOS version
pnpm build:linux      # Build Linux version

# Build with architecture/format options
pnpm build:win --x64          # Specify architecture
pnpm build:mac pkg --arm64    # Specify format and architecture
```

## Architecture

### Process Structure

```
src/
├── main/           # Electron main process
├── renderer/       # React frontend (rendered in Electron window)
├── preload/        # Preload scripts (context bridge for IPC)
└── shared/types/   # TypeScript types shared between processes
```

### Main Process (`src/main/`)

- **`index.ts`** - App lifecycle, window creation, IPC handler registration, deep link handling
- **`core/`** - Mihomo core management
  - `manager.ts` - Core lifecycle (start/stop/restart)
  - `mihomoApi.ts` - HTTP/WebSocket client to Mihomo via Unix socket
  - `factory.ts` - Profile generation and runtime config
- **`config/`** - Configuration file management (app, profiles, overrides)
- **`resolve/`** - Feature modules (tray, shortcuts, auto-updater, floating window, backup)
- **`sys/`** - System integration (sysproxy, autorun, network interfaces)
- **`service/`** - Windows service mode communication

### Renderer Process (`src/renderer/`)

- **React 19** with **React Router** for SPA navigation
- **HeroUI (NextUI)** + **Tailwind CSS** for styling
- **SWR** for data fetching with IPC-driven cache mutations
- **Context-based state** - Providers in `hooks/` wrap app state (no Redux)

Key directories:
- **`pages/`** - Page components (proxies, profiles, settings, rules, connections, etc.)
- **`components/`** - Reusable UI components
- **`hooks/`** - Context providers and custom hooks for state management
- **`utils/ipc.ts`** - All IPC invoke wrappers

### IPC Communication Pattern

**Main → Renderer (events):**
```typescript
mainWindow.webContents.send('appConfigUpdated')
```

**Renderer → Main (invoke/handle):**
```typescript
// Renderer
await window.electron.ipcRenderer.invoke('getAppConfig')

// Main
ipcMain.handle('getAppConfig', ipcErrorWrapper(getAppConfig))
```

Error handling uses `ipcErrorWrapper()` on both sides to return `{ invokeError: message }`.

### Shared Types (`src/shared/types/`)

- `app.d.ts` - `AppConfig` interface (UI settings, proxy config, etc.)
- `controller.d.ts` - Mihomo API response types
- `mihomo.d.ts` - Mihomo configuration types

## Development Notes

- Main process changes require dev server restart
- Renderer supports hot reload
- On Windows, TUN (virtual network adapter) may cause blank screen in dev mode - disable it
- If Electron fails to install: `cd node_modules/electron && node install.js`
- Preload script modifications require app restart
- pnpm >= 9.0.0 and Node.js >= 20.0.0 required
