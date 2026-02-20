import React, { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'

function ChatOverlay({ onStatusUpdate, onActivityUpdate, currentSessionId, onSessionChange }) {
  const [messages, setMessages] = useState([
    {
      role: 'vex',
      text: 'The interface stirs. Speak, and the particles will answer.'
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [sessionId, setSessionId] = useState(currentSessionId)
  
  const chatLogRef = useRef(null)
  const saveTimeoutRef = useRef(null)

  useEffect(() => {
    // Initialize status
    onStatusUpdate('connected', 'idle')
  }, [onStatusUpdate])

  // Load session when currentSessionId changes
  useEffect(() => {
    if (currentSessionId && currentSessionId !== sessionId) {
      loadSession(currentSessionId)
    } else if (!currentSessionId) {
      // Start new chat
      setMessages([{
        role: 'vex',
        text: 'The interface stirs. Speak, and the particles will answer.'
      }])
      setSessionId(null)
    }
  }, [currentSessionId])

  // Auto-save session after exchanges (debounced)
  useEffect(() => {
    if (sessionId && messages.length > 1) {
      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      
      // Set new timeout for auto-save
      saveTimeoutRef.current = setTimeout(() => {
        saveSession()
      }, 1000) // 1 second debounce
    }
  }, [messages, sessionId])

  useEffect(() => {
    // Auto-scroll chat log
    if (chatLogRef.current) {
      chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight
    }
  }, [messages])

  const addMessage = (role, text) => {
    setMessages(prev => [...prev, { role, text }])
  }

  // Load a session from API
  const loadSession = async (sessionIdToLoad) => {
    try {
      const response = await fetch(`/api/sessions/${sessionIdToLoad}`)
      if (response.ok) {
        const sessionData = await response.json()
        setMessages(sessionData.messages || [])
        setSessionId(sessionIdToLoad)
      }
    } catch (err) {
      console.error('Failed to load session:', err)
    }
  }

  // Save current session
  const saveSession = async () => {
    try {
      if (sessionId) {
        // Update existing session
        await fetch(`/api/sessions/${sessionId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages })
        })
      } else if (messages.length > 1) {
        // Create new session (only if there's at least one exchange)
        const response = await fetch('/api/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages })
        })
        
        if (response.ok) {
          const sessionData = await response.json()
          setSessionId(sessionData.id)
          if (onSessionChange) {
            onSessionChange(sessionData.id)
          }
        }
      }
    } catch (err) {
      console.error('Failed to save session:', err)
    }
  }

  // Convert messages to API format
  const formatMessagesForAPI = () => {
    return messages
      .filter(msg => msg.role === 'user' || msg.role === 'vex')
      .map(msg => ({
        role: msg.role === 'vex' ? 'assistant' : 'user',
        content: msg.text
      }))
  }

  const sendMessage = async (text) => {
    if (!text.trim()) return
    
    addMessage('user', text)
    setInputValue('')
    
    // Add thinking indicator
    setIsThinking(true)
    
    // Activate visualization — thinking
    onActivityUpdate(0.8)
    onStatusUpdate('thinking', 'thinking')
    
    try {
      // Build conversation history including the new message
      const conversationHistory = [
        ...formatMessagesForAPI(),
        { role: 'user', content: text }
      ]

      // Real OpenClaw API call with full conversation context
      const response = await fetch('/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_GATEWAY_TOKEN}`
        },
        body: JSON.stringify({
          model: 'anthropic/claude-opus-4-6',
          messages: conversationHistory,
          stream: false
        })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      const reply = data.choices?.[0]?.message?.content || 'No response received.'
      
      setIsThinking(false)
      addMessage('vex', reply)
      onActivityUpdate(0.3)
      onStatusUpdate('connected', 'connected')
      
      // Auto-save will be triggered by the useEffect that watches messages
      
      // Fade back to idle
      setTimeout(() => {
        onActivityUpdate(0)
        onStatusUpdate('connected', 'idle')
      }, 2000)
      
    } catch (err) {
      console.error('Chat API error:', err)
      setIsThinking(false)
      addMessage('vex', `Connection error: ${err.message}`)
      onActivityUpdate(0)
      onStatusUpdate('error', 'disconnected')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(inputValue)
    }
  }

  const startNewChat = () => {
    setMessages([{
      role: 'vex',
      text: 'The interface stirs. Speak, and the particles will answer.'
    }])
    setSessionId(null)
    if (onSessionChange) {
      onSessionChange(null)
    }
  }

  return (
    <div id="ui-overlay">
      <div id="chat-container">
        <div className="chat-header">
          <button className="new-chat-btn" onClick={startNewChat} title="Start new chat">
            +
          </button>
        </div>
        <div id="chat-log" ref={chatLogRef}>
          {messages.map((message, index) => (
            <div key={index} className={`message ${message.role}`}>
              <div className="label">
                {message.role === 'user' ? 'you' : '🜏 vex'}
              </div>
              <div className="message-content">
                {message.role === 'vex' ? (
                  <ReactMarkdown>{message.text}</ReactMarkdown>
                ) : (
                  message.text
                )}
              </div>
            </div>
          ))}
          {isThinking && (
            <div className="message vex">
              <div className="label">🜏 vex</div>
              <div className="message-content">
                <div className="thinking-orb">
                  <svg width="24" height="24" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="8" fill="none" stroke="rgba(139, 92, 246, 0.6)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="12 6" className="orb-ring"/>
                    <circle cx="12" cy="12" r="4" fill="rgba(245, 158, 11, 0.4)" className="orb-core"/>
                    <circle cx="12" cy="12" r="2" fill="rgba(139, 92, 246, 0.8)" className="orb-center"/>
                  </svg>
                </div>
              </div>
            </div>
          )}
        </div>
        <div id="input-container">
          <input
            type="text"
            id="chat-input"
            placeholder="speak..."
            autoComplete="off"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>
    </div>
  )
}

export default ChatOverlay