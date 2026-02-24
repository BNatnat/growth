import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { supabase } from '../lib/supabase'

const PROJECT_COLORS = ['#FF4D00', '#FFB800', '#00E5A0', '#7B61FF', '#FF61B6']

function Heatmap({ blocs }) {
  const days = 70
  const today = new Date()
  const cells = []

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    const count = blocs.filter(b => b.created_at?.slice(0, 10) === dateStr).length
    cells.push({ dateStr, count })
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(10, 1fr)',
      gridTemplateRows: 'repeat(7, 1fr)',
      gap: 3,
      width: '100%',
    }}>
      {cells.map((cell, i) => (
        <div
          key={i}
          title={`${cell.dateStr}: ${cell.count} bloc(s)`}
          style={{
            aspectRatio: '1',
            borderRadius: 2,
            background: cell.count === 0
              ? '#111'
              : cell.count === 1
              ? '#FF4D0050'
              : cell.count === 2
              ? '#FF4D0090'
              : '#FF4D00',
          }}
        />
      ))}
    </div>
  )
}

export default function Dashboard() {
  const { user, profile } = useApp()
  const navigate = useNavigate()
  const [intention, setIntention] = useState(null)
  const [blocs, setBlocs] = useState([])
  const [loading, setLoading] = useState(true)

  const today = new Date().toISOString().slice(0, 10)
  const todayDate = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })

  useEffect(() => {
    if (!user) return
    async function load() {
      const [intentionRes, blocsRes] = await Promise.all([
        supabase.from('intentions').select('*').eq('user_id', user.id).eq('date', today).maybeSingle(),
        supabase.from('blocs').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      ])
      setIntention(intentionRes.data)
      setBlocs(blocsRes.data || [])
      setLoading(false)
    }
    load()
  }, [user])

  // Velocity: blocs this week vs last week
  function getWeekBlocs(offset = 0) {
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay() - offset * 7)
    startOfWeek.setHours(0, 0, 0, 0)
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 7)
    return blocs.filter(b => {
      const d = new Date(b.created_at)
      return d >= startOfWeek && d < endOfWeek
    }).length
  }

  const thisWeek = getWeekBlocs(0)
  const lastWeek = getWeekBlocs(1)
  const velocity = lastWeek === 0 ? (thisWeek > 0 ? '+100%' : '0%') : `${Math.round(((thisWeek - lastWeek) / lastWeek) * 100)}%`
  const velocityUp = thisWeek >= lastWeek

  const projects = profile?.projects || []

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#333' }}>
        <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 12 }}>CHARGEMENT...</span>
      </div>
    )
  }

  return (
    <div style={{
      paddingTop: 68,
      paddingBottom: 80,
      maxWidth: 480,
      margin: '0 auto',
      minHeight: '100vh',
      background: '#080808',
    }}>
      <div style={{ padding: '0 20px' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <p style={{
            color: '#444',
            fontSize: 11,
            fontFamily: 'Space Mono, monospace',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: 4,
          }}>{todayDate}</p>
          <h2 style={{
            fontFamily: 'Syne, sans-serif',
            fontWeight: 800,
            fontSize: 22,
            color: '#fff',
            lineHeight: 1.2,
          }}>Que construis-tu aujourd'hui ?</h2>
        </div>

        {/* Intention card */}
        {intention ? (
          <div
            onClick={() => navigate('/bloc')}
            style={{
              background: '#0e0e0e',
              border: '1px solid #1f1f1f',
              borderLeft: '3px solid #FF4D00',
              borderRadius: 4,
              padding: 20,
              marginBottom: 20,
              cursor: 'pointer',
            }}
          >
            <p style={{ color: '#666', fontSize: 10, fontFamily: 'Space Mono, monospace', letterSpacing: '0.1em', marginBottom: 8 }}>
              INTENTION DU JOUR
            </p>
            <p style={{ color: '#fff', fontSize: 14, fontFamily: 'Space Mono, monospace', lineHeight: 1.6, marginBottom: 12 }}>
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
            <div style={{ marginTop: 16 }}>
              <span style={{
                color: '#FF4D00',
                fontSize: 12,
                fontFamily: 'Syne, sans-serif',
                fontWeight: 700,
                letterSpacing: '0.05em',
              }}>DEMARRER ▶</span>
            </div>
          </div>
        ) : (
          <div
            onClick={() => navigate('/rituel-soir')}
            style={{
              background: '#0e0e0e',
              border: '1px dashed #1f1f1f',
              borderRadius: 4,
              padding: 20,
              marginBottom: 20,
              cursor: 'pointer',
              textAlign: 'center',
            }}
          >
            <p style={{ color: '#333', fontSize: 11, fontFamily: 'Space Mono, monospace', marginBottom: 12 }}>
              Aucune intention définie
            </p>
            <span style={{
              color: '#FF4D00',
              fontSize: 12,
              fontFamily: 'Syne, sans-serif',
              fontWeight: 700,
              letterSpacing: '0.05em',
            }}>PREPARER TON INTENTION ▶</span>
          </div>
        )}

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          <div style={{
            background: '#0e0e0e',
            border: '1px solid #1a1a1a',
            borderRadius: 4,
            padding: 16,
          }}>
            <p style={{ color: '#444', fontSize: 10, fontFamily: 'Space Mono, monospace', letterSpacing: '0.08em', marginBottom: 8 }}>SERIE ACTIVE</p>
            <p style={{ color: '#FF4D00', fontSize: 28, fontFamily: 'Syne, sans-serif', fontWeight: 900, lineHeight: 1 }}>
              {profile?.streak || 0}
            </p>
            <p style={{ color: '#333', fontSize: 10, fontFamily: 'Space Mono, monospace', marginTop: 4 }}>jours</p>
          </div>
          <div style={{
            background: '#0e0e0e',
            border: '1px solid #1a1a1a',
            borderRadius: 4,
            padding: 16,
          }}>
            <p style={{ color: '#444', fontSize: 10, fontFamily: 'Space Mono, monospace', letterSpacing: '0.08em', marginBottom: 8 }}>VELOCITE</p>
            <p style={{
              color: velocityUp ? '#00E5A0' : '#FF4D00',
              fontSize: 28,
              fontFamily: 'Syne, sans-serif',
              fontWeight: 900,
              lineHeight: 1,
            }}>
              {thisWeek}
            </p>
            <p style={{ color: '#333', fontSize: 10, fontFamily: 'Space Mono, monospace', marginTop: 4 }}>
              blocs ({velocity} vs S-1)
            </p>
          </div>
        </div>

        {/* Projects */}
        {projects.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <p style={{ color: '#333', fontSize: 10, fontFamily: 'Space Mono, monospace', letterSpacing: '0.1em', marginBottom: 12 }}>PROJETS</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {projects.map((p, i) => {
                const projBlocs = blocs.filter(b => b.projet === p.name).length
                const maxBlocs = 40
                const pct = Math.min((projBlocs / maxBlocs) * 100, 100)
                return (
                  <div key={p.id || i} style={{
                    background: '#0e0e0e',
                    border: '1px solid #1a1a1a',
                    borderRadius: 4,
                    padding: '12px 16px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{
                        color: '#fff',
                        fontSize: 12,
                        fontFamily: 'Space Mono, monospace',
                        fontWeight: 700,
                      }}>{p.name}</span>
                      <span style={{
                        color: '#444',
                        fontSize: 10,
                        fontFamily: 'Space Mono, monospace',
                      }}>{projBlocs} blocs</span>
                    </div>
                    <div style={{ height: 2, background: '#1a1a1a', borderRadius: 1 }}>
                      <div style={{
                        height: '100%',
                        width: `${pct}%`,
                        background: PROJECT_COLORS[i % PROJECT_COLORS.length],
                        borderRadius: 1,
                        transition: 'width 0.6s ease',
                      }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Heatmap */}
        <div style={{
          background: '#0e0e0e',
          border: '1px solid #1a1a1a',
          borderRadius: 4,
          padding: 16,
          marginBottom: 20,
        }}>
          <p style={{ color: '#333', fontSize: 10, fontFamily: 'Space Mono, monospace', letterSpacing: '0.1em', marginBottom: 12 }}>
            ACTIVITE — 70 JOURS
          </p>
          <Heatmap blocs={blocs} />
        </div>

        {/* CTA */}
        <button
          onClick={() => navigate('/rituel-soir')}
          style={{
            width: '100%',
            background: '#0e0e0e',
            border: '1px solid #1f1f1f',
            borderRadius: 4,
            padding: '16px 24px',
            color: '#fff',
            fontSize: 13,
            fontFamily: 'Syne, sans-serif',
            fontWeight: 700,
            letterSpacing: '0.1em',
            cursor: 'pointer',
            textAlign: 'center',
          }}
        >
          PREPARER DEMAIN SOIR ◐
        </button>
      </div>
    </div>
  )
}
