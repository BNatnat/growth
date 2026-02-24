import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext'

import Auth from './screens/Auth'
import Onboarding from './screens/Onboarding'
import Dashboard from './screens/Dashboard'
import RituelSoir from './screens/RituelSoir'
import Bloc, { RituelMatin } from './screens/Bloc'
import Projets from './screens/Projets'
import Mentor from './screens/Mentor'
import Bilan from './screens/Bilan'
import NavBar from './components/NavBar'
import TopBar from './components/TopBar'

function AppRoutes() {
  const { user, profile, loading } = useApp()

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#080808',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
        }}>
          <span style={{
            fontFamily: 'Syne, sans-serif',
            fontWeight: 900,
            fontSize: 32,
            color: '#FF4D00',
            letterSpacing: '0.15em',
          }}>GROWTH</span>
          <div style={{
            width: 24,
            height: 24,
            border: '2px solid #1a1a1a',
            borderTop: '2px solid #FF4D00',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
        </div>
      </div>
    )
  }

  if (!user) {
    return <Auth />
  }

  if (!profile?.onboarding_done) {
    return <Onboarding />
  }

  return (
    <div style={{
      maxWidth: 480,
      margin: '0 auto',
      minHeight: '100vh',
      position: 'relative',
      background: '#080808',
    }}>
      <TopBar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/rituel-soir" element={<RituelSoir />} />
        <Route path="/rituel-matin" element={<RituelMatin />} />
        <Route path="/bloc" element={<Bloc />} />
        <Route path="/projets" element={<Projets />} />
        <Route path="/mentor" element={<Mentor />} />
        <Route path="/bilan" element={<Bilan />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <NavBar />
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  )
}
