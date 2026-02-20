import React, { useState, useEffect } from 'react'
import '../sessions.css'

function SessionDrawer({ isOpen, onToggle, onSessionLoad, onNewChat, currentSessionId }) {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(false)

  // Load sessions from API
  const loadSessions = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/sessions')
      if (response.ok) {
        const data = await response.json()
        setSessions(data)
      }
    } catch (err) {
      console.error('Failed to load sessions:', err)
    } finally {
      setLoading(false)
    }
  }

  // Load sessions on component mount and when drawer opens
  useEffect(() => {
    if (isOpen) {
      loadSessions()
    }
  }, [isOpen])

  // Delete session
  const deleteSession = async (sessionId, e) => {
    e.stopPropagation() // Prevent triggering session load
    
    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        // Remove from local state
        setSessions(prev => prev.filter(s => s.id !== sessionId))
        
        // If this was the current session, start a new chat
        if (currentSessionId === sessionId) {
          onNewChat()
        }
      }
    } catch (err) {
      console.error('Failed to delete session:', err)
    }
  }

  // Format relative time
  const formatRelativeTime = (timestamp) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffMs = now - time
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMinutes / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMinutes < 1) return 'just now'
    if (diffMinutes < 60) return `${diffMinutes}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    
    return time.toLocaleDateString()
  }

  return (
    <>
      <div
        id="sessions-toggle"
        className={isOpen ? 'drawer-open' : ''}
        onClick={onToggle}
      >
        ≡
      </div>
      
      <div
        id="sessions-drawer"
        className={isOpen ? 'visible' : ''}
      >
        <div className="sessions-content">
          <div className="sessions-section">
            <h2>Chat Sessions</h2>
            
            <button className="new-chat-btn" onClick={onNewChat}>
              <span className="new-chat-icon">+</span>
              New Chat
            </button>

            {loading ? (
              <div className="loading">Loading sessions...</div>
            ) : sessions.length === 0 ? (
              <div className="empty-state">No saved sessions</div>
            ) : (
              <div className="session-list">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`session-item ${currentSessionId === session.id ? 'active' : ''}`}
                    onClick={() => onSessionLoad(session.id)}
                  >
                    <div className="session-header">
                      <div className="session-title">{session.title}</div>
                      <button
                        className="session-delete"
                        onClick={(e) => deleteSession(session.id, e)}
                        title="Delete session"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="session-meta">
                      <span className="session-time">
                        {formatRelativeTime(session.updatedAt)}
                      </span>
                      <span className="session-count">
                        {session.messageCount} msgs
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default SessionDrawer