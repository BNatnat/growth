import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const tabs = [
  { label: 'BASE', icon: '⬡', path: '/' },
  { label: 'PROJETS', icon: '◈', path: '/projets' },
  { label: 'FOCUS', icon: '▶', path: '/bloc' },
  { label: 'MENTOR', icon: '◉', path: '/mentor' },
  { label: 'BILAN', icon: '◎', path: '/bilan' },
]

export default function NavBar() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: 480,
      background: '#0e0e0e',
      borderTop: '1px solid #1a1a1a',
      display: 'flex',
      zIndex: 100,
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {tabs.map((tab) => {
        const active = location.pathname === tab.path || (tab.path === '/bloc' && (location.pathname === '/rituel-matin' || location.pathname === '/bloc'))
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              padding: '10px 0 12px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: active ? '#FF4D00' : '#444',
              transform: active ? 'translateY(-2px)' : 'none',
              transition: 'color 0.2s, transform 0.2s',
            }}
          >
            <span style={{ fontSize: 18, lineHeight: 1 }}>{tab.icon}</span>
            <span style={{
              fontSize: 9,
              fontFamily: 'Space Mono, monospace',
              fontWeight: 700,
              letterSpacing: '0.05em',
            }}>{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
