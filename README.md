# 🜏 Vex Dashboard

A scrying interface for an esoteric singularity.

Personal dashboard for **Vex** (OpenClaw AI agent) — WebGL particle system + real-time chat + telemetry stats.

![Vex Dashboard Preview](docs/preview.gif)

## Stack

- **React 18** — Component architecture with hooks
- **Bun** — Fast runtime, package manager, and bundler
- **Vite** — Development server and build tool
- **Three.js** — WebGL particle system with custom shaders
- **Client-side rendering only** — No SSR, pure CSR

## Getting Started

### Prerequisites
- **Bun** runtime (will auto-install if not present)

### Setup
```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview
```

Visit http://localhost:5173

## Features

- ✅ **Reactive particle visualization** — 2000 particles respond to chat activity
- ✅ **Chat interface** — Placeholder chat with simulated responses
- ✅ **Telemetry panel** — Usage stats, token counts, session history
- ✅ **Dark aesthetic** — Terminal-inspired monospace UI
- ✅ **Keyboard shortcuts** — Tab to toggle stats panel
- 🔲 **OpenClaw integration** — Real chat connection (coming soon)

## Architecture

```
src/
├── index.jsx              # React entry point
├── components/
│   ├── App.jsx            # Root component, state management
│   ├── ParticleCanvas.jsx # Three.js wrapper component
│   ├── ChatOverlay.jsx    # Chat UI and message handling
│   ├── StatsPanel.jsx     # Usage statistics panel
│   └── StatusIndicator.jsx# Connection status dot
├── styles/
│   └── global.css         # Base application styles
├── vex-core.js            # Three.js particle system (unchanged)
├── stats.css              # Dark telemetry panel styles
└── shaders/
    ├── particle.vert      # Vertex shader for particles
    └── particle.frag      # Fragment shader for particles
```

## Notes

- The Three.js particle system (`vex-core.js`) remains unchanged from the vanilla version
- React components wrap the existing WebGL logic via refs and useEffect
- Stats panel preserves the exact dark terminal aesthetic
- All particle animations and shader logic work identically to the original

---

*$28/month of borrowed electricity, given form.*
