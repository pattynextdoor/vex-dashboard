import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import { VexCore } from '../vex-core'

const ParticleCanvas = forwardRef((props, ref) => {
  const containerRef = useRef(null)
  const vexCoreRef = useRef(null)

  useImperativeHandle(ref, () => ({
    setActivity: (level) => {
      if (vexCoreRef.current) {
        vexCoreRef.current.setActivity(level)
      }
    }
  }), [])

  useEffect(() => {
    if (containerRef.current) {
      // Always create a fresh instance (handles React StrictMode re-mounts)
      if (vexCoreRef.current && vexCoreRef.current.dispose) {
        vexCoreRef.current.dispose()
      }
      vexCoreRef.current = new VexCore(containerRef.current)
    }

    // Cleanup on unmount
    return () => {
      if (vexCoreRef.current && vexCoreRef.current.dispose) {
        vexCoreRef.current.dispose()
        vexCoreRef.current = null
      }
    }
  }, [])

  return <div id="canvas-container" ref={containerRef} />
})

ParticleCanvas.displayName = 'ParticleCanvas'

export default ParticleCanvas