import React from 'react'

function StatusIndicator({ status, label }) {
  return (
    <div id="status" className={status}>
      <span className="dot"></span>
      {label}
    </div>
  )
}

export default StatusIndicator