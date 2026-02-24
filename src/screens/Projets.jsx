import React, { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { supabase } from '../lib/supabase'

const PROJECT_COLORS = ['#FF4D00', '#FFB800', '#00E5A0', '#7B61FF', '#FF61B6']

export default function Projets() {
  const { user, profile } = useApp()
  const [openId, setOpenId] = useState(null)
  const [blocs, setBlocs] = useState([])

  const projects = profile?.projects || []

  useEffect(() => {
    if (!user) return
    supabase.from('blocs').select('*').eq('user_id', user.id).then(({ data }) => {
      setBlocs(data || [])
    })
  }, [user])

  function getBlocsForProject(projectName) {
    return blocs.filter(b => b.projet === projectName)
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

        <div style={{ marginBottom: 28 }}>
          <p style={{ color: '#444', fontSize: 10, fontFamily: 'Space Mono, monospace', letterSpacing: '0.1em', marginBottom: 4 }}>
            {projects.length} PROJET{projects.length !== 1 ? 'S' : ''}
          </p>
          <h2 style={{
            fontFamily: 'Syne, sans-serif',
            fontWeight: 900,
            fontSize: 28,
            color: '#fff',
          }}>Tes projets</h2>
        </div>

        {projects.length === 0 && (
          <p style={{ color: '#333', fontSize: 12, fontFamily: 'Space Mono, monospace' }}>
            Aucun projet défini. Complète l'onboarding.
          </p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {projects.map((p, i) => {
            const color = PROJECT_COLORS[i % PROJECT_COLORS.length]
            const projBlocs = getBlocsForProject(p.name)
            const maxBlocs = 40
            const pct = Math.min((projBlocs.length / maxBlocs) * 100, 100)
            const isOpen = openId === (p.id || i)

            return (
              <div
                key={p.id || i}
                style={{
                  background: '#0e0e0e',
                  border: `1px solid ${isOpen ? color + '50' : '#1a1a1a'}`,
                  borderRadius: 4,
                  overflow: 'hidden',
                  transition: 'border-color 0.2s',
                }}
              >
                {/* Header */}
                <button
                  onClick={() => setOpenId(isOpen ? null : (p.id || i))}
                  style={{
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    padding: '16px 20px',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{
                      color: '#fff',
                      fontSize: 14,
                      fontFamily: 'Syne, sans-serif',
                      fontWeight: 700,
                    }}>{p.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{
                        color: '#444',
                        fontSize: 10,
                        fontFamily: 'Space Mono, monospace',
                      }}>{projBlocs.length} blocs</span>
                      <span style={{ color: color, fontSize: 14 }}>{isOpen ? '▲' : '▼'}</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div style={{ height: 3, background: '#1a1a1a', borderRadius: 2 }}>
                    <div style={{
                      height: '100%',
                      width: `${pct}%`,
                      background: color,
                      borderRadius: 2,
                      transition: 'width 0.6s ease',
                    }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                    <span style={{ color: '#333', fontSize: 9, fontFamily: 'Space Mono, monospace' }}>0</span>
                    <span style={{ color: color, fontSize: 9, fontFamily: 'Space Mono, monospace', fontWeight: 700 }}>
                      {Math.round(pct)}%
                    </span>
                    <span style={{ color: '#333', fontSize: 9, fontFamily: 'Space Mono, monospace' }}>40</span>
                  </div>
                </button>

                {/* Expanded */}
                {isOpen && (
                  <div style={{
                    padding: '0 20px 20px',
                    borderTop: '1px solid #111',
                  }}>
                    {p.objectif && (
                      <div style={{ marginBottom: 16 }}>
                        <p style={{ color: '#333', fontSize: 10, fontFamily: 'Space Mono, monospace', letterSpacing: '0.08em', marginBottom: 6 }}>
                          OBJECTIF
                        </p>
                        <p style={{ color: '#666', fontSize: 12, fontFamily: 'Space Mono, monospace', lineHeight: 1.6 }}>
                          {p.objectif}
                        </p>
                      </div>
                    )}

                    {/* Blocs grid */}
                    <div style={{ marginTop: 16 }}>
                      <p style={{ color: '#333', fontSize: 10, fontFamily: 'Space Mono, monospace', letterSpacing: '0.08em', marginBottom: 10 }}>
                        BLOCS REALISES
                      </p>
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 4,
                      }}>
                        {projBlocs.map((b, j) => (
                          <div
                            key={b.id || j}
                            title={new Date(b.created_at).toLocaleDateString('fr-FR')}
                            style={{
                              width: 20,
                              height: 20,
                              borderRadius: 3,
                              background: color + '80',
                              border: `1px solid ${color}40`,
                            }}
                          />
                        ))}
                        {projBlocs.length === 0 && (
                          <p style={{ color: '#222', fontSize: 11, fontFamily: 'Space Mono, monospace' }}>
                            Aucun bloc encore.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
