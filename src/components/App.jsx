import React, { useState, useRef } from 'react'
import ParticleCanvas from './ParticleCanvas'
import ChatOverlay from './ChatOverlay'
import StatsPanel from './StatsPanel'
import StatusIndicator from './StatusIndicator'

function App() {
  const [activityLevel, setActivityLevel] = useState(0)
  const [connectionStatus, setConnectionStatus] = useState('connected')
  const [connectionLabel, setConnectionLabel] = useState('idle')
  const [isStatsPanelOpen, setIsStatsPanelOpen] = useState(false)
  
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

  return (
    <>
      <ParticleCanvas ref={vexCoreRef} />
      <StatusIndicator status={connectionStatus} label={connectionLabel} />
      <ChatOverlay 
        onStatusUpdate={updateStatus}
        onActivityUpdate={updateActivity}
      />
      <StatsPanel 
        isOpen={isStatsPanelOpen}
        onToggle={toggleStatsPanel}
      />
    </>
  )
}

export default App