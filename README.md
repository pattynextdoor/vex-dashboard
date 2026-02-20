# 🜏 Vex Dashboard

A personal interface for an AI agent that lives on a DigitalOcean droplet.

WebGL particle visualization + real-time chat + usage telemetry — built as the primary interface for [OpenClaw](https://github.com/openclaw/openclaw).

![Vex Dashboard Preview](docs/preview.gif)

## Features

- **Reactive particle system** — 8,000 particles with custom GLSL shaders, hollow-eye vortex, mouse interaction. Animation shifts dramatically when the agent is thinking.
- **Chat interface** — Talk directly to the agent (Claude Opus). Full conversation context, session persistence (save/load/delete).
- **Usage telemetry** — Real-time cost tracking, token counts, session history, daily spend charts.
- **Thinking indicator** — Animated SVG orb + particle animation shift while the agent processes.
- **Dark terminal aesthetic** — Near-black backgrounds, monospace type, muted red/green accents. No borders, no shadows.

## Stack

- **React 18** + **Vite** — CSR only, no SSR
- **Bun** — Runtime, package manager, server
- **Three.js** — WebGL with custom vertex/fragment shaders
- **OpenClaw** — AI agent gateway (chat completions API)

## Architecture

```
src/
├── components/
│   ├── App.jsx              # Root state management
│   ├── ParticleCanvas.jsx   # Three.js wrapper
│   ├── ChatOverlay.jsx      # Chat UI + API calls
│   ├── SessionDrawer.jsx    # Session history sidebar
│   ├── StatsPanel.jsx       # Usage telemetry panel
│   └── StatusIndicator.jsx  # Connection status
├── shaders/
│   ├── particle.vert        # Vertex shader (vortex, noise, breathing)
│   └── particle.frag        # Fragment shader (glow, color)
├── styles/
│   └── global.css           # Base styles + markdown rendering
├── vex-core.js              # Three.js particle system core
├── stats.css                # Telemetry panel styles
└── sessions.css             # Session drawer styles
```

## Hosting & Security

This dashboard is hosted via **[Tailscale](https://tailscale.com/)** — it's only accessible on a private tailnet. There is no public URL. You cannot reach my OpenClaw agent from the internet.

The Bun server (`serve.js`) runs on the droplet and handles:
- `/api/usage` — proxies to a local usage tracker script
- `/api/sessions/*` — chat session CRUD (stored as JSON files on disk)
- `/v1/*` — proxies to the OpenClaw gateway on localhost (authenticated with a token that never leaves the server)
- `/*` — serves the static Vite build

The gateway token is stored in `.env` (gitignored, never committed). Even if you clone this repo and run it, you'd need your own OpenClaw instance and gateway token.

## Running Your Own

```bash
# Install dependencies
bun install

# Development
bun run dev          # http://localhost:5173

# Production build
bun run build

# Serve (requires OpenClaw gateway on localhost:18789)
node serve.js        # http://localhost:3333
```

You'll need:
1. An [OpenClaw](https://github.com/openclaw/openclaw) instance with `http.endpoints.chatCompletions.enabled: true`
2. A `.env` file with `VITE_GATEWAY_TOKEN=<your-gateway-token>`
3. Optionally, Tailscale for private hosting

## Credits

Built by [pattynextdoor](https://github.com/pattynextdoor) and Vex (the agent that lives inside it).

---

*$28/month of borrowed electricity, given form.*
