const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const DIST_DIR = "/root/vex-dashboard/dist";
const GATEWAY_URL = "http://127.0.0.1:18789";
const USAGE_SCRIPT = "/root/.openclaw/workspace/skills/usage-tracker/scripts/usage_tracker.py";
const SESSIONS_DIR = "/root/vex-dashboard/data/sessions";

// Ensure sessions directory exists
if (!fs.existsSync(SESSIONS_DIR)) {
  fs.mkdirSync(SESSIONS_DIR, { recursive: true });
}

// Helper functions for session management
function getAllSessions() {
  try {
    const files = fs.readdirSync(SESSIONS_DIR).filter(f => f.endsWith('.json'));
    const sessions = files.map(filename => {
      const filePath = path.join(SESSIONS_DIR, filename);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      return {
        id: data.id,
        title: data.title,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        messageCount: data.messages ? data.messages.length : 0
      };
    });
    // Sort by updatedAt desc
    return sessions.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  } catch (err) {
    console.error('Error reading sessions:', err);
    return [];
  }
}

function getSession(sessionId) {
  try {
    const filePath = path.join(SESSIONS_DIR, `${sessionId}.json`);
    if (!fs.existsSync(filePath)) {
      return null;
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    console.error('Error reading session:', err);
    return null;
  }
}

function saveSession(sessionData) {
  try {
    const filePath = path.join(SESSIONS_DIR, `${sessionData.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(sessionData, null, 2));
    return true;
  } catch (err) {
    console.error('Error saving session:', err);
    return false;
  }
}

function deleteSession(sessionId) {
  try {
    const filePath = path.join(SESSIONS_DIR, `${sessionId}.json`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (err) {
    console.error('Error deleting session:', err);
    return false;
  }
}

function generateTitle(messages) {
  if (!messages || messages.length === 0) return 'New Chat';
  
  // Find first user message
  const firstUserMessage = messages.find(m => m.role === 'user');
  if (!firstUserMessage) return 'New Chat';
  
  // Truncate to 50 characters
  const title = firstUserMessage.content || firstUserMessage.text || 'New Chat';
  return title.length > 50 ? title.substring(0, 47) + '...' : title;
}

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

    // --- API: Session management ---
    if (url.pathname === "/api/sessions") {
      if (req.method === "GET") {
        // List all sessions
        const sessions = getAllSessions();
        return new Response(JSON.stringify(sessions), {
          headers: { "Content-Type": "application/json" }
        });
      } else if (req.method === "POST") {
        // Create new session
        try {
          const body = await req.json();
          const sessionId = crypto.randomUUID();
          const now = new Date().toISOString();
          const sessionData = {
            id: sessionId,
            title: generateTitle(body.messages),
            messages: body.messages || [],
            createdAt: now,
            updatedAt: now
          };
          
          if (saveSession(sessionData)) {
            return new Response(JSON.stringify(sessionData), {
              headers: { "Content-Type": "application/json" },
              status: 201
            });
          } else {
            return new Response(JSON.stringify({ error: "Failed to save session" }), { status: 500 });
          }
        } catch (e) {
          return new Response(JSON.stringify({ error: e.message }), { status: 400 });
        }
      }
    }

    // Match session ID routes
    const sessionMatch = url.pathname.match(/^\/api\/sessions\/([^\/]+)$/);
    if (sessionMatch) {
      const sessionId = sessionMatch[1];
      
      if (req.method === "GET") {
        // Get specific session
        const session = getSession(sessionId);
        if (session) {
          return new Response(JSON.stringify(session), {
            headers: { "Content-Type": "application/json" }
          });
        } else {
          return new Response(JSON.stringify({ error: "Session not found" }), { status: 404 });
        }
      } else if (req.method === "PUT") {
        // Update session
        try {
          const body = await req.json();
          const existingSession = getSession(sessionId);
          if (!existingSession) {
            return new Response(JSON.stringify({ error: "Session not found" }), { status: 404 });
          }
          
          const updatedSession = {
            ...existingSession,
            messages: body.messages || existingSession.messages,
            updatedAt: new Date().toISOString()
          };
          
          if (saveSession(updatedSession)) {
            return new Response(JSON.stringify(updatedSession), {
              headers: { "Content-Type": "application/json" }
            });
          } else {
            return new Response(JSON.stringify({ error: "Failed to update session" }), { status: 500 });
          }
        } catch (e) {
          return new Response(JSON.stringify({ error: e.message }), { status: 400 });
        }
      } else if (req.method === "DELETE") {
        // Delete session
        if (deleteSession(sessionId)) {
          return new Response(JSON.stringify({ success: true }), {
            headers: { "Content-Type": "application/json" }
          });
        } else {
          return new Response(JSON.stringify({ error: "Session not found" }), { status: 404 });
        }
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
