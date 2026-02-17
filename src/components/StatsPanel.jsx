import React, { useState, useEffect } from 'react'
import '../stats.css'

function StatsPanel({ isOpen, onToggle }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    // Tab key toggle listener
    const handleKeyDown = (e) => {
      if (e.key === 'Tab' && !e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault()
        onToggle()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onToggle])

  useEffect(() => {
    if (isOpen && data) {
      // Refresh data when panel opens
      loadData()
    }
  }, [isOpen])

  const loadData = async () => {
    try {
      const response = await fetch('/api/usage.json')
      const jsonData = await response.json()
      setData(jsonData)
      setLoading(false)
    } catch (error) {
      console.error('Failed to load usage stats:', error)
      setLoading(false)
    }
  }

  const formatCost = (cost) => {
    return `$${cost.toFixed(4)}`
  }

  const formatTokens = (tokens) => {
    if (tokens >= 1000000) {
      return `${(tokens / 1000000).toFixed(1)}M`
    } else if (tokens >= 1000) {
      return `${(tokens / 1000).toFixed(1)}K`
    }
    return tokens.toString()
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    })
  }

  const formatTime = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    })
  }

  const renderSessions = (sessions) => {
    if (!sessions || sessions.length === 0) {
      return <div className="loading">NO SESSION DATA</div>
    }

    return sessions.slice(0, 8).map((session, index) => {
      const startTime = formatTime(session.start)
      return (
        <div key={index} className="session-entry">
          <span className="session-time">{startTime}</span>
          <span className="session-cost">{formatCost(session.cost_total)}</span>
          <span className="session-messages">{session.message_count}msg</span>
        </div>
      )
    })
  }

  const renderDaily = (daily) => {
    if (!daily || Object.keys(daily).length === 0) {
      return <div className="loading">NO DAILY DATA</div>
    }

    const dailyEntries = Object.entries(daily)
      .sort(([a], [b]) => new Date(b) - new Date(a))
      .slice(0, 10)

    if (dailyEntries.length === 0) return <div className="loading">NO DATA</div>

    const maxCost = Math.max(...dailyEntries.map(([_, cost]) => cost))

    return dailyEntries.map(([date, cost], index) => {
      const percentage = maxCost > 0 ? (cost / maxCost) * 100 : 0
      return (
        <div key={index} className="daily-bar">
          <span className="daily-label">{formatDate(date)}</span>
          <div className="daily-bar-container">
            <div className="daily-bar-fill" style={{ width: `${percentage}%` }}></div>
          </div>
          <span className="daily-value">{formatCost(cost)}</span>
        </div>
      )
    })
  }

  if (loading) {
    return (
      <>
        <div id="stats-toggle" onClick={onToggle} title="Toggle stats panel (Tab)">
          ⚡
        </div>
        <div id="stats-panel" className={isOpen ? 'visible' : ''}>
          <div className="loading">LOADING TELEMETRY...</div>
        </div>
      </>
    )
  }

  if (!data) {
    return (
      <>
        <div id="stats-toggle" onClick={onToggle} title="Toggle stats panel (Tab)">
          ⚡
        </div>
        <div id="stats-panel" className={isOpen ? 'visible' : ''}>
          <div className="loading">TELEMETRY ERROR</div>
        </div>
      </>
    )
  }

  const { today, all_time, sessions, daily } = data

  return (
    <>
      <div id="stats-toggle" onClick={onToggle} title="Toggle stats panel (Tab)">
        ⚡
      </div>
      <div id="stats-panel" className={isOpen ? 'visible' : ''}>
        <div className="stats-content">
          <div className="stats-section">
            <h2>VITALS</h2>
            <div className="stats-grid">
              <div className="stats-item">
                <span className="stats-label">today</span>
                <span className="stats-value highlight">{formatCost(today.cost)}</span>
              </div>
              <div className="stats-item">
                <span className="stats-label">month</span>
                <span className="stats-value highlight">{formatCost(data.this_month.cost)}</span>
              </div>
              <div className="stats-item">
                <span className="stats-label">all-time</span>
                <span className="stats-value highlight">{formatCost(all_time.cost)}</span>
              </div>
              <div className="stats-item">
                <span className="stats-label">messages</span>
                <span className="stats-value">{all_time.message_count}</span>
              </div>
              <div className="stats-item">
                <span className="stats-label">avg/msg</span>
                <span className="stats-value">{formatCost(all_time.avg_cost_per_message)}</span>
              </div>
            </div>
          </div>

          <div className="stats-section">
            <h2>TOKENS</h2>
            <div className="stats-grid">
              <div className="stats-item">
                <span className="stats-label">input</span>
                <span className="stats-value">{formatTokens(all_time.tokens.input)}</span>
              </div>
              <div className="stats-item">
                <span className="stats-label">output</span>
                <span className="stats-value">{formatTokens(all_time.tokens.output)}</span>
              </div>
              <div className="stats-item">
                <span className="stats-label">cache-read</span>
                <span className="stats-value positive">{formatTokens(all_time.tokens.cache_read)}</span>
              </div>
              <div className="stats-item">
                <span className="stats-label">cache-write</span>
                <span className="stats-value positive">{formatTokens(all_time.tokens.cache_write)}</span>
              </div>
            </div>
          </div>

          <div className="stats-section">
            <h2>SESSIONS</h2>
            {renderSessions(sessions)}
          </div>

          <div className="stats-section">
            <h2>DAILY</h2>
            {renderDaily(daily)}
          </div>
        </div>
      </div>
    </>
  )
}

export default StatsPanel