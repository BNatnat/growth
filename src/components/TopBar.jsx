import React from 'react'
import { useApp } from '../context/AppContext'

export default function TopBar() {
  const { profile } = useApp()
  const streak = profile?.streak || 0

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: 480,
      background: '#080808',
      borderBottom: '1px solid #1a1a1a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      height: 52,
      zIndex: 100,
    }}>
      <span style={{
        fontFamily: 'Syne, sans-serif',
        fontWeight: 900,
        fontSize: 20,
        color: '#FF4D00',
        letterSpacing: '0.1em',
      }}>
        GROWTH
      </span>

      {streak > 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: '#1a1a1a',
          border: '1px solid #FF4D0030',
          borderRadius: 20,
          padding: '4px 12px',
        }}>
          <span style={{ fontSize: 12, color: '#FF4D00', fontWeight: 700 }}>{streak}</span>
          <span style={{ fontSize: 10, color: '#666', fontFamily: 'Space Mono, monospace' }}>JOURS</span>
        </div>
      )}
    </header>
  )
}
