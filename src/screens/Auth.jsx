import React, { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Auth() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
      }
    } catch (err) {
      setError(err.message || 'Une erreur est survenue.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#080808',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        width: '100%',
        maxWidth: 400,
        position: 'relative',
      }}>
        {/* Radial glow */}
        <div style={{
          position: 'absolute',
          top: -120,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 300,
          height: 300,
          background: 'radial-gradient(circle, #FF4D0015 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h1 style={{
            fontFamily: 'Syne, sans-serif',
            fontWeight: 900,
            fontSize: 48,
            color: '#FF4D00',
            letterSpacing: '0.15em',
            lineHeight: 1,
          }}>GROWTH</h1>
          <p style={{
            color: '#444',
            fontSize: 11,
            fontFamily: 'Space Mono, monospace',
            marginTop: 8,
            letterSpacing: '0.1em',
          }}>PRODUCTIVITE EXIGEANTE</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <input
            type="email"
            placeholder="EMAIL"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{
              background: '#0e0e0e',
              border: '1px solid #1f1f1f',
              borderRadius: 4,
              padding: '14px 16px',
              color: '#fff',
              fontSize: 13,
              fontFamily: 'Space Mono, monospace',
              letterSpacing: '0.05em',
              width: '100%',
            }}
          />
          <input
            type="password"
            placeholder="MOT DE PASSE"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{
              background: '#0e0e0e',
              border: '1px solid #1f1f1f',
              borderRadius: 4,
              padding: '14px 16px',
              color: '#fff',
              fontSize: 13,
              fontFamily: 'Space Mono, monospace',
              letterSpacing: '0.05em',
              width: '100%',
            }}
          />

          {error && (
            <p style={{
              color: '#FF4D00',
              fontSize: 12,
              fontFamily: 'Space Mono, monospace',
              padding: '10px 14px',
              background: '#FF4D0010',
              border: '1px solid #FF4D0030',
              borderRadius: 4,
            }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? '#1a1a1a' : '#FF4D00',
              color: loading ? '#666' : '#fff',
              border: 'none',
              borderRadius: 4,
              padding: '16px 24px',
              fontSize: 14,
              fontFamily: 'Syne, sans-serif',
              fontWeight: 800,
              letterSpacing: '0.1em',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
              marginTop: 8,
            }}
          >
            {loading ? 'CHARGEMENT...' : (mode === 'login' ? 'ENTRER ▶' : 'COMMENCER ▶')}
          </button>
        </form>

        <button
          onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }}
          style={{
            display: 'block',
            margin: '24px auto 0',
            background: 'none',
            border: 'none',
            color: '#444',
            fontSize: 11,
            fontFamily: 'Space Mono, monospace',
            cursor: 'pointer',
            letterSpacing: '0.05em',
            textDecoration: 'underline',
          }}
        >
          {mode === 'login' ? 'Pas encore de compte ? Créer un compte' : 'Déjà un compte ? Se connecter'}
        </button>
      </div>
    </div>
  )
}
