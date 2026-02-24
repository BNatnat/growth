import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { supabase } from '../lib/supabase'
import { askMentor, MENTOR_SYSTEM } from '../lib/claude'

const QUESTIONS = [
  {
    id: 'q1',
    question: "As-tu fait ce que tu t'étais promis ce matin ?",
    placeholder: "Oui, j'ai fait exactement ce que j'avais prévu. / Non, j'ai été distrait par...",
  },
  {
    id: 'q2',
    question: "Si non, qu'est-ce qui s'est passé vraiment ?",
    placeholder: "Sois honnête. Qu'est-ce qui t'a empêché d'avancer ?",
  },
  {
    id: 'q3',
    question: "Qu'est-ce que tu retiens de cette journée ?",
    placeholder: "La leçon, la victoire, le pattern que tu vois...",
  },
]

export default function Bilan() {
  const { user, profile } = useApp()
  const navigate = useNavigate()

  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({ q1: '', q2: '', q3: '' })
  const [todayBlocs, setTodayBlocs] = useState(0)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const today = new Date().toISOString().slice(0, 10)

  useEffect(() => {
    if (!user) return
    supabase.from('blocs')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', today + 'T00:00:00')
      .then(({ data }) => setTodayBlocs(data?.length || 0))
  }, [user])

  async function handleFinish() {
    setLoading(true)
    try {
      const mentorReply = await askMentor(
        MENTOR_SYSTEM(profile),
        [
          {
            role: 'user',
            content: `Bilan de ma journée.\nBlocs réalisés : ${todayBlocs}\nQ1 (engagement) : ${answers.q1}\nQ2 (obstacles) : ${answers.q2}\nQ3 (leçon) : ${answers.q3}\nFais-moi un retour honnête en 4-5 phrases.`
          }
        ]
      )

      await supabase.from('bilans').upsert({
        user_id: user.id,
        date: today,
        blocs: todayBlocs,
        answers,
        mentor_reply: mentorReply,
      }, { onConflict: 'user_id,date' })

      setResult(mentorReply)
    } catch (err) {
      console.error(err)
      setResult("Bilan enregistré. Reviens demain.")
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
          <p style={{ color: '#444', fontSize: 10, fontFamily: 'Space Mono, monospace', letterSpacing: '0.1em', marginBottom: 24 }}>
            BILAN DU JOUR
          </p>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 24 }}>
            <div style={{
              background: '#0e0e0e',
              border: '1px solid #1a1a1a',
              borderRadius: 4,
              padding: '14px 12px',
              textAlign: 'center',
            }}>
              <p style={{ color: '#FF4D00', fontSize: 24, fontFamily: 'Syne, sans-serif', fontWeight: 900, lineHeight: 1 }}>
                {todayBlocs}
              </p>
              <p style={{ color: '#444', fontSize: 9, fontFamily: 'Space Mono, monospace', marginTop: 4 }}>BLOCS</p>
            </div>
            <div style={{
              background: '#0e0e0e',
              border: '1px solid #1a1a1a',
              borderRadius: 4,
              padding: '14px 12px',
              textAlign: 'center',
            }}>
              <p style={{ color: '#FF4D00', fontSize: 24, fontFamily: 'Syne, sans-serif', fontWeight: 900, lineHeight: 1 }}>
                {todayBlocs * 25}
              </p>
              <p style={{ color: '#444', fontSize: 9, fontFamily: 'Space Mono, monospace', marginTop: 4 }}>MIN</p>
            </div>
            <div style={{
              background: '#0e0e0e',
              border: '1px solid #1a1a1a',
              borderRadius: 4,
              padding: '14px 12px',
              textAlign: 'center',
            }}>
              <p style={{ color: '#FF4D00', fontSize: 24, fontFamily: 'Syne, sans-serif', fontWeight: 900, lineHeight: 1 }}>
                {profile?.streak || 0}
              </p>
              <p style={{ color: '#444', fontSize: 9, fontFamily: 'Space Mono, monospace', marginTop: 4 }}>SERIE</p>
            </div>
          </div>

          {/* Mentor */}
          <div style={{
            background: '#0e0e0e',
            border: '1px solid #1a1a1a',
            borderLeft: '3px solid #FF4D00',
            borderRadius: 4,
            padding: 20,
            marginBottom: 32,
          }}>
            <p style={{ color: '#444', fontSize: 10, fontFamily: 'Space Mono, monospace', letterSpacing: '0.08em', marginBottom: 10 }}>
              TON MENTOR
            </p>
            <p style={{ color: '#aaa', fontSize: 13, fontFamily: 'Space Mono, monospace', lineHeight: 1.7 }}>
              {result}
            </p>
          </div>

          <button
            onClick={() => navigate('/rituel-soir')}
            style={{
              width: '100%',
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
            PREPARER DEMAIN ▶
          </button>
        </div>
      </div>
    )
  }

  const current = QUESTIONS[step]

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
          width: `${(step / 3) * 100}%`,
          background: '#FF4D00',
          borderRadius: 1,
          transition: 'width 0.4s ease',
        }} />
      </div>

      <div className="fade-up" key={step} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* Blocs count */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: '#0e0e0e',
          border: '1px solid #1a1a1a',
          borderRadius: 4,
          padding: '8px 14px',
          marginBottom: 28,
          alignSelf: 'flex-start',
        }}>
          <span style={{ color: '#FF4D00', fontSize: 18, fontFamily: 'Syne, sans-serif', fontWeight: 900 }}>{todayBlocs}</span>
          <span style={{ color: '#444', fontSize: 10, fontFamily: 'Space Mono, monospace' }}>blocs aujourd'hui</span>
        </div>

        <p style={{ color: '#444', fontSize: 11, fontFamily: 'Space Mono, monospace', letterSpacing: '0.1em', marginBottom: 12 }}>
          BILAN — {step + 1}/{QUESTIONS.length}
        </p>

        <h2 style={{
          fontFamily: 'Syne, sans-serif',
          fontWeight: 800,
          fontSize: 22,
          color: '#fff',
          lineHeight: 1.3,
          marginBottom: 28,
        }}>{current.question}</h2>

        <textarea
          value={answers[current.id]}
          onChange={e => setAnswers({ ...answers, [current.id]: e.target.value })}
          placeholder={current.placeholder}
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
            minHeight: 140,
          }}
        />

        <button
          onClick={() => {
            if (step < QUESTIONS.length - 1) {
              setStep(step + 1)
            } else {
              handleFinish()
            }
          }}
          disabled={!answers[current.id]?.trim() || loading}
          style={{
            marginTop: 20,
            background: (!answers[current.id]?.trim() || loading) ? '#1a1a1a' : '#FF4D00',
            color: (!answers[current.id]?.trim() || loading) ? '#444' : '#fff',
            border: 'none',
            borderRadius: 4,
            padding: '16px 24px',
            fontSize: 14,
            fontFamily: 'Syne, sans-serif',
            fontWeight: 800,
            letterSpacing: '0.1em',
            cursor: (!answers[current.id]?.trim() || loading) ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'ANALYSE EN COURS...' : (step < QUESTIONS.length - 1 ? 'CONTINUER ▶' : 'VALIDER MON BILAN ▶')}
        </button>
      </div>
    </div>
  )
}
