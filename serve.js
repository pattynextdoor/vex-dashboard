const path = require("path");

const DIST_DIR = "/root/vex-dashboard/dist";
const GATEWAY_URL = "http://127.0.0.1:18789";
const USAGE_SCRIPT = "/root/.openclaw/workspace/skills/usage-tracker/scripts/usage_tracker.py";

Bun.serve({
  port: 3333,
  hostname: "127.0.0.1",

  async fetch(req) {
    const url = new URL(req.url);

    // --- API: live usage stats ---
    if (url.pathname === "/api/usage.json" || url.pathname === "/api/usage") {
      try {
        const proc = Bun.spawn(["python3", USAGE_SCRIPT, "--json"], {
          stdout: "pipe",
          stderr: "pipe",
        });
        const output = await new Response(proc.stdout).text();
        await proc.exited;
        return new Response(output, {
          headers: { "Content-Type": "application/json", "Cache-Control": "no-cache" },
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
      }
    }

    // --- Proxy: chat completions to OpenClaw gateway ---
    if (url.pathname.startsWith("/v1/")) {
      try {
        const headers = new Headers(req.headers);
        // Forward auth header as-is (dashboard will set it)
        const resp = await fetch(`${GATEWAY_URL}${url.pathname}`, {
          method: req.method,
          headers,
          body: req.method !== "GET" ? req.body : undefined,
        });
        return new Response(resp.body, {
          status: resp.status,
          headers: resp.headers,
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 502 });
      }
    }

    // --- Static files ---
    let filePath = url.pathname === "/" ? "/index.html" : url.pathname;
    const file = Bun.file(path.join(DIST_DIR, filePath));
    if (await file.exists()) return new Response(file);

    // SPA fallback
    return new Response(Bun.file(path.join(DIST_DIR, "index.html")));
  },
});

console.log("Dashboard serving on http://127.0.0.1:3333");
console.log("  /api/usage    → live usage stats");
console.log("  /v1/*         → OpenClaw gateway proxy");
console.log("  /*            → static dashboard files");
