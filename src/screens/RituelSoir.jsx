import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { supabase } from '../lib/supabase'
import { askMentor, MENTOR_SYSTEM } from '../lib/claude'

export default function RituelSoir() {
  const { user, profile } = useApp()
  const navigate = useNavigate()

  const [step, setStep] = useState(0)
  const [projet, setProjet] = useState('')
  const [blocage, setBlocage] = useState('')
  const [tacheRaw, setTacheRaw] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null) // { tache, mentorMsg }

  const projects = profile?.projects || []

  async function handleFinish() {
    setLoading(true)
    try {
      // Call 1: reformulate task
      const tache = await askMentor(
        `Tu es un assistant qui reformule des intentions en actions concrètes. Transforme l'intention suivante en une action précise avec un verbe d'action au début. Maximum 15 mots. Pas de ponctuation finale.`,
        [{ role: 'user', content: `Projet: ${projet}\nBlocage: ${blocage}\nIntention: ${tacheRaw}` }]
      )

      // Call 2: mentor encouragement
      const mentorMsg = await askMentor(
        MENTOR_SYSTEM(profile),
        [{ role: 'user', content: `Je viens de définir mon intention pour demain : "${tache}" sur le projet "${projet}". Donne-moi un message court pour cette nuit.` }]
      )

      // Save to Supabase (date = tomorrow)
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const dateStr = tomorrow.toISOString().slice(0, 10)

      await supabase.from('intentions').upsert({
        user_id: user.id,
        date: dateStr,
        tache,
        projet,
        pourquoi: blocage,
        done: false,
      }, { onConflict: 'user_id,date' })

      setResult({ tache, mentorMsg })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (result) {
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
        <div className="fade-up" style={{ width: '100%' }}>
          <p style={{
            color: '#444',
            fontSize: 10,
            fontFamily: 'Space Mono, monospace',
            letterSpacing: '0.1em',
            marginBottom: 16,
          }}>INTENTION VERROUILLEE</p>

          <div style={{
            background: '#0e0e0e',
            border: '1px solid #1f1f1f',
            borderLeft: '3px solid #FF4D00',
            borderRadius: 4,
            padding: 20,
            marginBottom: 20,
          }}>
            <p style={{
              color: '#fff',
              fontSize: 16,
              fontFamily: 'Syne, sans-serif',
              fontWeight: 700,
              lineHeight: 1.4,
              marginBottom: 8,
            }}>{result.tache}</p>
            {projet && (
              <span style={{
                background: '#FF4D0015',
                border: '1px solid #FF4D0030',
                borderRadius: 3,
                padding: '3px 8px',
                fontSize: 10,
                color: '#FF4D00',
                fontFamily: 'Space Mono, monospace',
              }}>{projet}</span>
            )}
          </div>

          <div style={{
            background: '#0e0e0e',
            border: '1px solid #1a1a1a',
            borderRadius: 4,
            padding: 20,
            marginBottom: 32,
          }}>
            <p style={{ color: '#444', fontSize: 10, fontFamily: 'Space Mono, monospace', letterSpacing: '0.08em', marginBottom: 10 }}>
              TON MENTOR
            </p>
            <p style={{
              color: '#aaa',
              fontSize: 13,
              fontFamily: 'Space Mono, monospace',
              lineHeight: 1.7,
            }}>{result.mentorMsg}</p>
          </div>

          <button
            onClick={() => navigate('/')}
            style={{
              width: '100%',
              background: '#111',
              border: '1px solid #1f1f1f',
              borderRadius: 4,
              padding: '16px 24px',
              color: '#fff',
              fontSize: 13,
              fontFamily: 'Syne, sans-serif',
              fontWeight: 700,
              letterSpacing: '0.1em',
              cursor: 'pointer',
            }}
          >
            C'EST NOTE. BONNE NUIT ◐
          </button>
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
      padding: '24px 20px',
      maxWidth: 480,
      margin: '0 auto',
    }}>

      {/* Progress */}
      <div style={{
        width: '100%',
        height: 2,
        background: '#1a1a1a',
        borderRadius: 1,
        marginBottom: 36,
        marginTop: 16,
      }}>
        <div style={{
          height: '100%',
          width: `${((step) / 3) * 100}%`,
          background: '#FF4D00',
          borderRadius: 1,
          transition: 'width 0.4s ease',
        }} />
      </div>

      <div className="fade-up" key={step} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* Step 0 - Projet choice */}
        {step === 0 && (
          <>
            <p style={{ color: '#444', fontSize: 11, fontFamily: 'Space Mono, monospace', letterSpacing: '0.1em', marginBottom: 16 }}>
              RITUEL DU SOIR — 1/3
            </p>
            <h2 style={{
              fontFamily: 'Syne, sans-serif',
              fontWeight: 800,
              fontSize: 24,
              color: '#fff',
              lineHeight: 1.2,
              marginBottom: 8,
            }}>Sur quel projet demain ?</h2>
            <p style={{ color: '#666', fontSize: 12, fontFamily: 'Space Mono, monospace', marginBottom: 32 }}>
              Choisis un projet pour cette session.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
              {projects.map((p, i) => (
                <button
                  key={p.id || i}
                  onClick={() => { setProjet(p.name); setStep(1) }}
                  style={{
                    background: projet === p.name ? '#FF4D00' : '#0e0e0e',
                    border: `1px solid ${projet === p.name ? '#FF4D00' : '#1f1f1f'}`,
                    borderRadius: 4,
                    padding: '16px 20px',
                    color: projet === p.name ? '#fff' : '#ccc',
                    fontSize: 13,
                    fontFamily: 'Space Mono, monospace',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s',
                  }}
                >
                  {p.name}
                </button>
              ))}
              {projects.length === 0 && (
                <p style={{ color: '#333', fontSize: 12, fontFamily: 'Space Mono, monospace' }}>
                  Aucun projet. Complète d'abord ton onboarding.
                </p>
              )}
            </div>
          </>
        )}

        {/* Step 1 - Blocage */}
        {step === 1 && (
          <>
            <p style={{ color: '#444', fontSize: 11, fontFamily: 'Space Mono, monospace', letterSpacing: '0.1em', marginBottom: 16 }}>
              RITUEL DU SOIR — 2/3
            </p>
            <h2 style={{
              fontFamily: 'Syne, sans-serif',
              fontWeight: 800,
              fontSize: 24,
              color: '#fff',
              lineHeight: 1.2,
              marginBottom: 8,
            }}>Qu'est-ce qui bloque ?</h2>
            <p style={{ color: '#666', fontSize: 12, fontFamily: 'Space Mono, monospace', marginBottom: 4 }}>
              Projet : <span style={{ color: '#FF4D00' }}>{projet}</span>
            </p>
            <p style={{ color: '#666', fontSize: 12, fontFamily: 'Space Mono, monospace', marginBottom: 28 }}>
              Qu'est-ce qui bloque sur ce projet en ce moment ?
            </p>
            <textarea
              value={blocage}
              onChange={e => setBlocage(e.target.value)}
              placeholder="Le front n'avance pas parce que je n'arrive pas à..."
              rows={5}
              style={{
                background: '#0e0e0e',
                border: '1px solid #1f1f1f',
                borderRadius: 4,
                padding: 16,
                color: '#fff',
                fontSize: 13,
                fontFamily: 'Space Mono, monospace',
                lineHeight: 1.7,
                width: '100%',
                flex: 1,
              }}
            />
            <button
              onClick={() => setStep(2)}
              disabled={!blocage.trim()}
              style={{
                marginTop: 20,
                background: !blocage.trim() ? '#1a1a1a' : '#FF4D00',
                color: !blocage.trim() ? '#444' : '#fff',
                border: 'none',
                borderRadius: 4,
                padding: '16px 24px',
                fontSize: 14,
                fontFamily: 'Syne, sans-serif',
                fontWeight: 800,
                letterSpacing: '0.1em',
                cursor: !blocage.trim() ? 'not-allowed' : 'pointer',
              }}
            >
              CONTINUER ▶
            </button>
          </>
        )}

        {/* Step 2 - Task */}
        {step === 2 && (
          <>
            <p style={{ color: '#444', fontSize: 11, fontFamily: 'Space Mono, monospace', letterSpacing: '0.1em', marginBottom: 16 }}>
              RITUEL DU SOIR — 3/3
            </p>
            <h2 style={{
              fontFamily: 'Syne, sans-serif',
              fontWeight: 800,
              fontSize: 22,
              color: '#fff',
              lineHeight: 1.2,
              marginBottom: 8,
            }}>Une seule chose demain matin.</h2>
            <p style={{ color: '#666', fontSize: 12, fontFamily: 'Space Mono, monospace', marginBottom: 28, lineHeight: 1.6 }}>
              Si tu ne pouvais faire qu'une seule chose en 30 min, ce serait quoi ?
            </p>
            <textarea
              value={tacheRaw}
              onChange={e => setTacheRaw(e.target.value)}
              placeholder="Coder le système d'authentification..."
              rows={5}
              style={{
                background: '#0e0e0e',
                border: '1px solid #1f1f1f',
                borderRadius: 4,
                padding: 16,
                color: '#fff',
                fontSize: 13,
                fontFamily: 'Space Mono, monospace',
                lineHeight: 1.7,
                width: '100%',
                flex: 1,
              }}
            />
            <button
              onClick={handleFinish}
              disabled={!tacheRaw.trim() || loading}
              style={{
                marginTop: 20,
                background: (!tacheRaw.trim() || loading) ? '#1a1a1a' : '#FF4D00',
                color: (!tacheRaw.trim() || loading) ? '#444' : '#fff',
                border: 'none',
                borderRadius: 4,
                padding: '16px 24px',
                fontSize: 14,
                fontFamily: 'Syne, sans-serif',
                fontWeight: 800,
                letterSpacing: '0.1em',
                cursor: (!tacheRaw.trim() || loading) ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'ANALYSE EN COURS...' : 'VERROUILLER L\'INTENTION ▶'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
