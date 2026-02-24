import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { supabase } from '../lib/supabase'
import { askMentor, MENTOR_SYSTEM } from '../lib/claude'

const DURATION = 25 * 60 // 25 minutes in seconds

// ---- RITUEL MATIN ----

export function RituelMatin() {
  const { user, profile } = useApp()
  const navigate = useNavigate()
  const [intention, setIntention] = useState(null)
  const [loading, setLoading] = useState(true)
  const [started, setStarted] = useState(false)

  const today = new Date().toISOString().slice(0, 10)

  useEffect(() => {
    if (!user) return
    supabase.from('intentions')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .maybeSingle()
      .then(({ data }) => {
        setIntention(data)
        setLoading(false)
      })
  }, [user])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#333' }}>
        <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 12 }}>CHARGEMENT...</span>
      </div>
    )
  }

  if (!intention) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#080808',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        textAlign: 'center',
        maxWidth: 480,
        margin: '0 auto',
      }}>
        <p style={{
          color: '#444',
          fontSize: 13,
          fontFamily: 'Space Mono, monospace',
          lineHeight: 1.7,
          marginBottom: 32,
        }}>Tu n'as pas préparé ton intention pour aujourd'hui.</p>
        <button
          onClick={() => navigate('/rituel-soir')}
          style={{
            background: '#FF4D00',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            padding: '16px 24px',
            fontSize: 13,
            fontFamily: 'Syne, sans-serif',
            fontWeight: 800,
            letterSpacing: '0.1em',
            cursor: 'pointer',
          }}
        >
          PREPARER MON INTENTION ▶
        </button>
      </div>
    )
  }

  if (started) {
    return <BlocActif intention={intention} />
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#080808',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: 24,
      maxWidth: 480,
      margin: '0 auto',
    }}>
      <div className="fade-up">
        <p style={{ color: '#444', fontSize: 10, fontFamily: 'Space Mono, monospace', letterSpacing: '0.1em', marginBottom: 12 }}>
          RITUEL DU MATIN
        </p>
        <h2 style={{
          fontFamily: 'Syne, sans-serif',
          fontWeight: 900,
          fontSize: 28,
          color: '#fff',
          lineHeight: 1.2,
          marginBottom: 24,
        }}>Ton intention du jour</h2>

        <div style={{
          background: '#0e0e0e',
          border: '1px solid #1f1f1f',
          borderLeft: '3px solid #FF4D00',
          borderRadius: 4,
          padding: 20,
          marginBottom: 16,
        }}>
          <p style={{ color: '#fff', fontSize: 16, fontFamily: 'Space Mono, monospace', lineHeight: 1.6, marginBottom: 10 }}>
            {intention.tache}
          </p>
          {intention.projet && (
            <span style={{
              background: '#FF4D0015',
              border: '1px solid #FF4D0030',
              borderRadius: 3,
              padding: '3px 8px',
              fontSize: 10,
              color: '#FF4D00',
              fontFamily: 'Space Mono, monospace',
            }}>{intention.projet}</span>
          )}
        </div>

        {profile?.jalon_30 && (
          <div style={{
            background: '#0e0e0e',
            border: '1px solid #1a1a1a',
            borderRadius: 4,
            padding: 16,
            marginBottom: 32,
          }}>
            <p style={{ color: '#333', fontSize: 10, fontFamily: 'Space Mono, monospace', letterSpacing: '0.08em', marginBottom: 6 }}>
              JALON 30 JOURS
            </p>
            <p style={{ color: '#666', fontSize: 12, fontFamily: 'Space Mono, monospace', lineHeight: 1.6 }}>
              {profile.jalon_30}
            </p>
          </div>
        )}

        <button
          onClick={() => setStarted(true)}
          className="pulse-glow"
          style={{
            width: '100%',
            background: '#FF4D00',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            padding: '20px 24px',
            fontSize: 16,
            fontFamily: 'Syne, sans-serif',
            fontWeight: 900,
            letterSpacing: '0.15em',
            cursor: 'pointer',
          }}
        >
          JE DEMARRE ▶
        </button>
      </div>
    </div>
  )
}

// ---- BLOC ACTIF ----

function BlocActif({ intention }) {
  const { user, profile, refreshProfile } = useApp()
  const navigate = useNavigate()

  const [running, setRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [finished, setFinished] = useState(false)
  const [mentorMsg, setMentorMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    return () => clearInterval(intervalRef.current)
  }, [])

  function toggleTimer() {
    if (!running) {
      intervalRef.current = setInterval(() => {
        setElapsed(prev => {
          if (prev >= DURATION - 1) {
            clearInterval(intervalRef.current)
            handleFinish()
            return DURATION
          }
          return prev + 1
        })
      }, 1000)
      setRunning(true)
    } else {
      clearInterval(intervalRef.current)
      setRunning(false)
    }
  }

  async function handleFinish() {
    clearInterval(intervalRef.current)
    setRunning(false)
    setLoading(true)

    try {
      await supabase.from('blocs').insert({
        user_id: user.id,
        projet: intention?.projet || '',
        tache: intention?.tache || '',
        duration: 25,
      })

      // Increment streak
      const newStreak = (profile?.streak || 0) + 1
      await supabase.from('profiles').update({
        streak: newStreak,
        last_active: new Date().toISOString(),
      }).eq('id', user.id)
      await refreshProfile()

      const msg = await askMentor(MENTOR_SYSTEM(profile), [
        {
          role: 'user',
          content: `Je viens de terminer un bloc de 25 minutes sur : "${intention?.tache}" (projet: ${intention?.projet || 'non défini'}). Donne-moi un retour court.`,
        }
      ])
      setMentorMsg(msg)
    } catch (err) {
      console.error(err)
      setMentorMsg('Bloc enregistré.')
    } finally {
      setLoading(false)
      setFinished(true)
    }
  }

  const remaining = DURATION - elapsed
  const minutes = Math.floor(remaining / 60)
  const seconds = remaining % 60
  const progress = elapsed / DURATION

  // SVG circle timer
  const radius = 80
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference * (1 - progress)

  if (finished) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#080808',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        maxWidth: 480,
        margin: '0 auto',
      }}>
        <div className="fade-up" style={{ width: '100%', textAlign: 'center' }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: '#00E5A015',
            border: '1px solid #00E5A040',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            fontSize: 28,
          }}>✓</div>

          <h2 style={{
            fontFamily: 'Syne, sans-serif',
            fontWeight: 900,
            fontSize: 28,
            color: '#fff',
            marginBottom: 8,
          }}>BLOC TERMINE</h2>
          <p style={{ color: '#444', fontSize: 12, fontFamily: 'Space Mono, monospace', marginBottom: 32 }}>
            25 minutes — {intention?.projet || 'Travail'}
          </p>

          {mentorMsg && (
            <div style={{
              background: '#0e0e0e',
              border: '1px solid #1a1a1a',
              borderRadius: 4,
              padding: 20,
              marginBottom: 32,
              textAlign: 'left',
            }}>
              <p style={{ color: '#444', fontSize: 10, fontFamily: 'Space Mono, monospace', letterSpacing: '0.08em', marginBottom: 10 }}>
                TON MENTOR
              </p>
              <p style={{ color: '#aaa', fontSize: 13, fontFamily: 'Space Mono, monospace', lineHeight: 1.7 }}>
                {mentorMsg}
              </p>
            </div>
          )}

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => { setFinished(false); setElapsed(0); setRunning(false); setMentorMsg('') }}
              style={{
                flex: 1,
                background: '#FF4D00',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                padding: '14px 16px',
                fontSize: 12,
                fontFamily: 'Syne, sans-serif',
                fontWeight: 800,
                letterSpacing: '0.05em',
                cursor: 'pointer',
              }}
            >
              ENCHAÎNER ▶
            </button>
            <button
              onClick={() => navigate('/')}
              style={{
                flex: 1,
                background: '#0e0e0e',
                color: '#fff',
                border: '1px solid #1f1f1f',
                borderRadius: 4,
                padding: '14px 16px',
                fontSize: 12,
                fontFamily: 'Syne, sans-serif',
                fontWeight: 700,
                letterSpacing: '0.05em',
                cursor: 'pointer',
              }}
            >
              J'AI FINI
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#080808',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      maxWidth: 480,
      margin: '0 auto',
    }}>
      <div style={{ textAlign: 'center', width: '100%' }}>
        <p style={{ color: '#333', fontSize: 10, fontFamily: 'Space Mono, monospace', letterSpacing: '0.1em', marginBottom: 24 }}>
          {intention?.tache || 'FOCUS'}
        </p>

        {/* Circular timer */}
        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 32 }}>
          <svg width={200} height={200}>
            {/* Background circle */}
            <circle
              cx={100}
              cy={100}
              r={radius}
              fill="none"
              stroke="#1a1a1a"
              strokeWidth={6}
            />
            {/* Progress circle */}
            <circle
              className="timer-circle"
              cx={100}
              cy={100}
              r={radius}
              fill="none"
              stroke="#FF4D00"
              strokeWidth={6}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          <div style={{
            position: 'absolute',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
            <span style={{
              fontFamily: 'Space Mono, monospace',
              fontWeight: 700,
              fontSize: 32,
              color: '#fff',
              lineHeight: 1,
            }}>
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
            <span style={{ color: '#333', fontSize: 10, fontFamily: 'Space Mono, monospace', marginTop: 4 }}>
              {running ? 'EN COURS' : 'PAUSE'}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button
            onClick={toggleTimer}
            disabled={loading}
            style={{
              background: running ? '#1a1a1a' : '#FF4D00',
              color: '#fff',
              border: running ? '1px solid #333' : 'none',
              borderRadius: 4,
              padding: '16px 32px',
              fontSize: 14,
              fontFamily: 'Syne, sans-serif',
              fontWeight: 800,
              letterSpacing: '0.1em',
              cursor: 'pointer',
            }}
          >
            {running ? 'PAUSE' : 'DEMARRER'}
          </button>

          <button
            onClick={handleFinish}
            disabled={loading || elapsed === 0}
            style={{
              background: '#0e0e0e',
              color: (loading || elapsed === 0) ? '#333' : '#fff',
              border: `1px solid ${(loading || elapsed === 0) ? '#111' : '#1f1f1f'}`,
              borderRadius: 4,
              padding: '16px 20px',
              fontSize: 18,
              cursor: (loading || elapsed === 0) ? 'not-allowed' : 'pointer',
            }}
          >
            ✓
          </button>
        </div>

        {loading && (
          <p style={{ color: '#444', fontSize: 11, fontFamily: 'Space Mono, monospace', marginTop: 20 }}>
            ENREGISTREMENT...
          </p>
        )}
      </div>
    </div>
  )
}

// Default export: check for today's intention, show RituelMatin or BlocActif
export default function Bloc() {
  return <RituelMatin />
}
