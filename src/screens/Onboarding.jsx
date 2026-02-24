import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import { supabase } from '../lib/supabase'
import { askMentor } from '../lib/claude'

const STEPS = [
  {
    question: "Dans 5 ans, tu vis comment ?",
    subtitle: "Décris ta vie idéale concrètement.",
    placeholder: "Dans 5 ans, je me lève à 7h dans ma maison à...",
    field: 'vision',
  },
  {
    question: "Quels sont tes projets actifs ?",
    subtitle: "Liste-les, un par ligne.",
    placeholder: "Lancer mon SaaS\nFinir mon livre\nAtteindre 10k/mois...",
    field: 'projects_raw',
  },
  {
    question: "Dans 30 jours, qu'est-ce qui doit avoir changé ?",
    subtitle: "Concrètement. Pas de vague.",
    placeholder: "J'ai les 3 premiers clients payants de mon SaaS...",
    field: 'jalon_30',
  },
  {
    question: "Qu'est-ce qui t'a empêché d'avancer jusqu'ici ?",
    subtitle: "Tes vrais blocages. Sois honnête.",
    placeholder: "Je procrastine dès que c'est difficile. Je commence des projets...",
    field: 'blocages',
  },
]

export default function Onboarding() {
  const { user, refreshProfile } = useApp()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({ vision: '', projects_raw: '', jalon_30: '', blocages: '' })
  const [loading, setLoading] = useState(false)
  const [welcomeMsg, setWelcomeMsg] = useState('')
  const [done, setDone] = useState(false)

  const current = STEPS[step]
  const progress = ((step) / STEPS.length) * 100

  function parseProjects(raw) {
    return raw.split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0)
      .map((name, i) => ({ id: i + 1, name, blocs: 0, objectif: '' }))
  }

  async function handleNext() {
    if (!answers[current.field]?.trim()) return

    if (step < STEPS.length - 1) {
      setStep(step + 1)
      return
    }

    // Last step — save profile and get welcome message
    setLoading(true)
    try {
      const projects = parseProjects(answers.projects_raw)
      const profileData = {
        vision: answers.vision,
        projects,
        jalon_30: answers.jalon_30,
        blocages: answers.blocages,
        onboarding_done: true,
      }

      await supabase.from('profiles').update(profileData).eq('id', user.id)

      const sys = `Tu es un mentor exigeant et direct. Génère un message d'accueil personnalisé (3-4 phrases max) pour accueillir cet utilisateur dans GROWTH. Sois percutant, tutoie-le, montre que tu as compris ses ambitions et ses blocages. Pas de blabla.`
      const msg = await askMentor(sys, [
        {
          role: 'user',
          content: `Vision : ${answers.vision}\nProjets : ${answers.projects_raw}\nJalon 30j : ${answers.jalon_30}\nBlocages : ${answers.blocages}`,
        }
      ])
      setWelcomeMsg(msg)
      setDone(true)
      await refreshProfile()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (done) {
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
          <div style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: '#00E5A020',
            border: '1px solid #00E5A040',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 24,
            fontSize: 24,
          }}>
            ✓
          </div>
          <h2 style={{
            fontFamily: 'Syne, sans-serif',
            fontWeight: 800,
            fontSize: 28,
            color: '#fff',
            marginBottom: 24,
            lineHeight: 1.2,
          }}>Ton profil est prêt.</h2>

          <div style={{
            background: '#0e0e0e',
            border: '1px solid #1f1f1f',
            borderLeft: '3px solid #FF4D00',
            borderRadius: 4,
            padding: 20,
            marginBottom: 32,
          }}>
            <p style={{
              color: '#aaa',
              fontSize: 13,
              fontFamily: 'Space Mono, monospace',
              lineHeight: 1.7,
            }}>{welcomeMsg}</p>
          </div>

          <button
            onClick={() => refreshProfile()}
            style={{
              width: '100%',
              background: '#FF4D00',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              padding: '16px 24px',
              fontSize: 14,
              fontFamily: 'Syne, sans-serif',
              fontWeight: 800,
              letterSpacing: '0.1em',
              cursor: 'pointer',
            }}
          >
            ENTRER DANS GROWTH ▶
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
      padding: 24,
      maxWidth: 480,
      margin: '0 auto',
    }}>
      {/* Progress bar */}
      <div style={{
        width: '100%',
        height: 2,
        background: '#1a1a1a',
        borderRadius: 1,
        marginBottom: 48,
        marginTop: 24,
      }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          background: '#FF4D00',
          borderRadius: 1,
          transition: 'width 0.4s ease',
        }} />
      </div>

      <div className="fade-up" key={step} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <p style={{
          color: '#444',
          fontSize: 11,
          fontFamily: 'Space Mono, monospace',
          letterSpacing: '0.1em',
          marginBottom: 16,
        }}>ETAPE {step + 1} / {STEPS.length}</p>

        <h2 style={{
          fontFamily: 'Syne, sans-serif',
          fontWeight: 800,
          fontSize: 26,
          color: '#fff',
          lineHeight: 1.2,
          marginBottom: 8,
        }}>{current.question}</h2>

        <p style={{
          color: '#666',
          fontSize: 13,
          fontFamily: 'Space Mono, monospace',
          marginBottom: 32,
          lineHeight: 1.6,
        }}>{current.subtitle}</p>

        <textarea
          value={answers[current.field]}
          onChange={e => setAnswers({ ...answers, [current.field]: e.target.value })}
          placeholder={current.placeholder}
          rows={6}
          style={{
            background: '#0e0e0e',
            border: '1px solid #1f1f1f',
            borderRadius: 4,
            padding: '16px',
            color: '#fff',
            fontSize: 13,
            fontFamily: 'Space Mono, monospace',
            lineHeight: 1.7,
            width: '100%',
            flex: 1,
            minHeight: 160,
          }}
        />

        <button
          onClick={handleNext}
          disabled={!answers[current.field]?.trim() || loading}
          style={{
            marginTop: 24,
            background: (!answers[current.field]?.trim() || loading) ? '#1a1a1a' : '#FF4D00',
            color: (!answers[current.field]?.trim() || loading) ? '#444' : '#fff',
            border: 'none',
            borderRadius: 4,
            padding: '16px 24px',
            fontSize: 14,
            fontFamily: 'Syne, sans-serif',
            fontWeight: 800,
            letterSpacing: '0.1em',
            cursor: (!answers[current.field]?.trim() || loading) ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s, color 0.2s',
          }}
        >
          {loading ? 'ANALYSE EN COURS...' : (step < STEPS.length - 1 ? 'CONTINUER ▶' : 'TERMINER ▶')}
        </button>
      </div>
    </div>
  )
}
