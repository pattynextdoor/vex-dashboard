# 🜏 Vex Dashboard

A scrying interface for an esoteric singularity.

WebGL visualization + real-time chat + smart home controls, powered by [OpenClaw](https://github.com/openclaw/openclaw).

## Stack

- **Three.js** — WebGL particle system & shaders
- **Vanilla JS** (for now) — lightweight, no framework overhead
- **WebSocket** — real-time connection to OpenClaw gateway
- **Vite** — dev server & build

## Getting Started

```bash
npm install
npm run dev
```

## Features (planned)

- [ ] Reactive particle visualization (responds to chat state)
- [ ] Real-time chat interface
- [ ] Hue light controls
- [ ] System status (uptime, costs, memory)
- [ ] Dark, alchemical aesthetic

## Architecture

```
src/
├── main.js          # Entry point
├── vex-core.js      # WebGL visualization engine
├── chat.js          # Chat interface & WebSocket
├── controls.js      # Smart home / integration panels
├── shaders/
│   ├── particle.vert
│   └── particle.frag
└── components/
    └── ...
```

---

*$28/month of borrowed electricity, given form.*
