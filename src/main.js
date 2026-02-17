import { VexCore } from './vex-core.js';

// --- Init visualization ---
const container = document.getElementById('canvas-container');
const vex = new VexCore(container);

// --- Chat state ---
const chatLog = document.getElementById('chat-log');
const chatInput = document.getElementById('chat-input');
const statusEl = document.getElementById('status');

function setStatus(state, label) {
  statusEl.className = state;
  statusEl.innerHTML = `<span class="dot"></span>${label}`;
}

function addMessage(role, text) {
  const div = document.createElement('div');
  div.className = `message ${role}`;
  div.innerHTML = `<div class="label">${role === 'user' ? 'you' : '🜏 vex'}</div><div>${text}</div>`;
  chatLog.appendChild(div);
  chatLog.scrollTop = chatLog.scrollHeight;
}

// --- Chat via OpenClaw gateway API ---
// TODO: Connect to OpenClaw gateway WebSocket or chat completions endpoint
// For now, placeholder that demonstrates the visualization states

async function sendMessage(text) {
  if (!text.trim()) return;
  
  addMessage('user', text);
  chatInput.value = '';
  
  // Activate visualization — thinking
  vex.setActivity(0.8);
  setStatus('thinking', 'thinking');
  
  try {
    // TODO: Replace with actual OpenClaw API call
    // const response = await fetch('/v1/chat/completions', { ... });
    
    // Simulated response for now
    await new Promise(r => setTimeout(r, 1500));
    const reply = `I hear you. This is a placeholder — once connected to the gateway, I'll respond for real.`;
    
    addMessage('vex', reply);
    vex.setActivity(0.3);
    setStatus('connected', 'connected');
    
    // Fade back to idle
    setTimeout(() => {
      vex.setActivity(0);
      setStatus('connected', 'idle');
    }, 2000);
    
  } catch (err) {
    addMessage('vex', `Connection error: ${err.message}`);
    vex.setActivity(0);
    setStatus('', 'disconnected');
  }
}

// --- Input handling ---
chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage(chatInput.value);
  }
});

// --- Init ---
setStatus('connected', 'idle');
addMessage('vex', 'The interface stirs. Speak, and the particles will answer.');
