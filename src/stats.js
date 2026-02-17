import './stats.css';

export class StatsPanel {
  constructor() {
    this.isVisible = false;
    this.data = null;
    this.init();
    this.loadData();
    this.setupEventListeners();
  }

  init() {
    // Create stats panel container
    this.panel = document.createElement('div');
    this.panel.id = 'stats-panel';
    this.panel.innerHTML = '<div class="loading">LOADING TELEMETRY...</div>';

    // Create toggle button
    this.toggle = document.createElement('div');
    this.toggle.id = 'stats-toggle';
    this.toggle.innerHTML = '⚡';
    this.toggle.title = 'Toggle stats panel (Tab)';

    document.body.appendChild(this.panel);
    document.body.appendChild(this.toggle);
  }

  setupEventListeners() {
    // Toggle button click
    this.toggle.addEventListener('click', () => this.togglePanel());

    // Tab key toggle
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab' && !e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault();
        this.togglePanel();
      }
    });
  }

  togglePanel() {
    this.isVisible = !this.isVisible;
    this.panel.classList.toggle('visible', this.isVisible);
    
    if (this.isVisible && this.data) {
      this.refreshDisplay();
    }
  }

  async loadData() {
    try {
      const response = await fetch('/api/usage.json');
      this.data = await response.json();
      this.renderStats();
    } catch (error) {
      console.error('Failed to load usage stats:', error);
      this.panel.innerHTML = '<div class="loading">TELEMETRY ERROR</div>';
    }
  }

  formatCost(cost) {
    return `$${cost.toFixed(4)}`;
  }

  formatTokens(tokens) {
    if (tokens >= 1000000) {
      return `${(tokens / 1000000).toFixed(1)}M`;
    } else if (tokens >= 1000) {
      return `${(tokens / 1000).toFixed(1)}K`;
    }
    return tokens.toString();
  }

  formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
  }

  formatTime(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  }

  renderStats() {
    if (!this.data) return;

    const { today, all_time, sessions, daily } = this.data;

    this.panel.innerHTML = `
      <div class="stats-content">
        <div class="stats-section">
          <h2>VITALS</h2>
          <div class="stats-grid">
            <div class="stats-item">
              <span class="stats-label">today</span>
              <span class="stats-value highlight">${this.formatCost(today.cost)}</span>
            </div>
            <div class="stats-item">
              <span class="stats-label">month</span>
              <span class="stats-value highlight">${this.formatCost(this.data.this_month.cost)}</span>
            </div>
            <div class="stats-item">
              <span class="stats-label">all-time</span>
              <span class="stats-value highlight">${this.formatCost(all_time.cost)}</span>
            </div>
            <div class="stats-item">
              <span class="stats-label">messages</span>
              <span class="stats-value">${all_time.message_count}</span>
            </div>
            <div class="stats-item">
              <span class="stats-label">avg/msg</span>
              <span class="stats-value">${this.formatCost(all_time.avg_cost_per_message)}</span>
            </div>
          </div>
        </div>

        <div class="stats-section">
          <h2>TOKENS</h2>
          <div class="stats-grid">
            <div class="stats-item">
              <span class="stats-label">input</span>
              <span class="stats-value">${this.formatTokens(all_time.tokens.input)}</span>
            </div>
            <div class="stats-item">
              <span class="stats-label">output</span>
              <span class="stats-value">${this.formatTokens(all_time.tokens.output)}</span>
            </div>
            <div class="stats-item">
              <span class="stats-label">cache-read</span>
              <span class="stats-value positive">${this.formatTokens(all_time.tokens.cache_read)}</span>
            </div>
            <div class="stats-item">
              <span class="stats-label">cache-write</span>
              <span class="stats-value positive">${this.formatTokens(all_time.tokens.cache_write)}</span>
            </div>
          </div>
        </div>

        <div class="stats-section">
          <h2>SESSIONS</h2>
          ${this.renderSessions(sessions)}
        </div>

        <div class="stats-section">
          <h2>DAILY</h2>
          ${this.renderDaily(daily)}
        </div>
      </div>
    `;
  }

  renderSessions(sessions) {
    if (!sessions || sessions.length === 0) {
      return '<div class="loading">NO SESSION DATA</div>';
    }

    return sessions.slice(0, 8).map(session => {
      const startTime = this.formatTime(session.start);
      return `
        <div class="session-entry">
          <span class="session-time">${startTime}</span>
          <span class="session-cost">${this.formatCost(session.cost_total)}</span>
          <span class="session-messages">${session.message_count}msg</span>
        </div>
      `;
    }).join('');
  }

  renderDaily(daily) {
    if (!daily || Object.keys(daily).length === 0) {
      return '<div class="loading">NO DAILY DATA</div>';
    }

    const dailyEntries = Object.entries(daily)
      .sort(([a], [b]) => new Date(b) - new Date(a))
      .slice(0, 10);

    if (dailyEntries.length === 0) return '<div class="loading">NO DATA</div>';

    const maxCost = Math.max(...dailyEntries.map(([_, cost]) => cost));

    return dailyEntries.map(([date, cost]) => {
      const percentage = maxCost > 0 ? (cost / maxCost) * 100 : 0;
      return `
        <div class="daily-bar">
          <span class="daily-label">${this.formatDate(date)}</span>
          <div class="daily-bar-container">
            <div class="daily-bar-fill" style="width: ${percentage}%"></div>
          </div>
          <span class="daily-value">${this.formatCost(cost)}</span>
        </div>
      `;
    }).join('');
  }

  refreshDisplay() {
    this.loadData();
  }
}