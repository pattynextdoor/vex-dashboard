import React, { useState, useRef } from 'react'
import ParticleCanvas from './ParticleCanvas'
import ChatOverlay from './ChatOverlay'
import StatsPanel from './StatsPanel'
import StatusIndicator from './StatusIndicator'
import SessionDrawer from './SessionDrawer'

function App() {
  const [activityLevel, setActivityLevel] = useState(0)
  const [connectionStatus, setConnectionStatus] = useState('connected')
  const [connectionLabel, setConnectionLabel] = useState('idle')
  const [isStatsPanelOpen, setIsStatsPanelOpen] = useState(false)
  const [isSessionDrawerOpen, setIsSessionDrawerOpen] = useState(false)
  const [currentSessionId, setCurrentSessionId] = useState(null)
  
  const vexCoreRef = useRef(null)

  const updateStatus = (status, label) => {
    setConnectionStatus(status)
    setConnectionLabel(label)
  }

  const updateActivity = (level) => {
    setActivityLevel(level)
    if (vexCoreRef.current) {
      vexCoreRef.current.setActivity(level)
    }
  }

  const toggleStatsPanel = () => {
    setIsStatsPanelOpen(!isStatsPanelOpen)
  }

  const toggleSessionDrawer = () => {
    setIsSessionDrawerOpen(!isSessionDrawerOpen)
  }

  const loadSession = (sessionId) => {
    setCurrentSessionId(sessionId)
    setIsSessionDrawerOpen(false) // Close drawer after loading session
  }

  const startNewChat = () => {
    setCurrentSessionId(null)
    setIsSessionDrawerOpen(false)
  }

  const handleSessionChange = (sessionId) => {
    setCurrentSessionId(sessionId)
  }

  return (
    <>
      <ParticleCanvas ref={vexCoreRef} />
      <StatusIndicator status={connectionStatus} label={connectionLabel} />
      <SessionDrawer
        isOpen={isSessionDrawerOpen}
        onToggle={toggleSessionDrawer}
        onSessionLoad={loadSession}
        onNewChat={startNewChat}
        currentSessionId={currentSessionId}
      />
      <ChatOverlay 
        onStatusUpdate={updateStatus}
        onActivityUpdate={updateActivity}
        currentSessionId={currentSessionId}
        onSessionChange={handleSessionChange}
      />
      <StatsPanel 
        isOpen={isStatsPanelOpen}
        onToggle={toggleStatsPanel}
      />
    </>
  )
}

export default App