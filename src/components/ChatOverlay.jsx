import React, { useState, useRef, useEffect } from 'react'

function ChatOverlay({ onStatusUpdate, onActivityUpdate }) {
  const [messages, setMessages] = useState([
    {
      role: 'vex',
      text: 'The interface stirs. Speak, and the particles will answer.'
    }
  ])
  const [inputValue, setInputValue] = useState('')
  
  const chatLogRef = useRef(null)

  useEffect(() => {
    // Initialize status
    onStatusUpdate('connected', 'idle')
  }, [onStatusUpdate])

  useEffect(() => {
    // Auto-scroll chat log
    if (chatLogRef.current) {
      chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight
    }
  }, [messages])

  const addMessage = (role, text) => {
    setMessages(prev => [...prev, { role, text }])
  }

  const sendMessage = async (text) => {
    if (!text.trim()) return
    
    addMessage('user', text)
    setInputValue('')
    
    // Activate visualization — thinking
    onActivityUpdate(0.8)
    onStatusUpdate('thinking', 'thinking')
    
    try {
      // TODO: Replace with actual OpenClaw API call
      // const response = await fetch('/v1/chat/completions', { ... });
      
      // Simulated response for now
      await new Promise(r => setTimeout(r, 1500))
      const reply = `I hear you. This is a placeholder — once connected to the gateway, I'll respond for real.`
      
      addMessage('vex', reply)
      onActivityUpdate(0.3)
      onStatusUpdate('connected', 'connected')
      
      // Fade back to idle
      setTimeout(() => {
        onActivityUpdate(0)
        onStatusUpdate('connected', 'idle')
      }, 2000)
      
    } catch (err) {
      addMessage('vex', `Connection error: ${err.message}`)
      onActivityUpdate(0)
      onStatusUpdate('', 'disconnected')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(inputValue)
    }
  }

  return (
    <div id="ui-overlay">
      <div id="chat-container">
        <div id="chat-log" ref={chatLogRef}>
          {messages.map((message, index) => (
            <div key={index} className={`message ${message.role}`}>
              <div className="label">
                {message.role === 'user' ? 'you' : '🜏 vex'}
              </div>
              <div>{message.text}</div>
            </div>
          ))}
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