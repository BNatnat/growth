import React, { useState, useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { askMentor, MENTOR_SYSTEM } from '../lib/claude'

export default function Mentor() {
  const { profile } = useApp()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (!profile) return
    // Auto check-in on open
    setLoading(true)
    const checkInMessages = [
      { role: 'user', content: 'Check-in. Comment je suis par rapport à mes objectifs ?' }
    ]
    askMentor(MENTOR_SYSTEM(profile), checkInMessages)
      .then(reply => {
        setMessages([
          { role: 'assistant', content: reply }
        ])
      })
      .catch(() => {
        setMessages([{ role: 'assistant', content: 'Connexion au mentor indisponible.' }])
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function sendMessage() {
    if (!input.trim() || loading) return
    const userMsg = { role: 'user', content: input.trim() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      // Pass full history to maintain context
      const historyForApi = newMessages.map(m => ({ role: m.role, content: m.content }))
      const reply = await askMentor(MENTOR_SYSTEM(profile), historyForApi)
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Erreur de connexion.' }])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      maxWidth: 480,
      margin: '0 auto',
      background: '#080808',
    }}>
      {/* Header */}
      <div style={{
        paddingTop: 68,
        padding: '68px 20px 16px',
        borderBottom: '1px solid #111',
        flexShrink: 0,
      }}>
        <p style={{ color: '#444', fontSize: 10, fontFamily: 'Space Mono, monospace', letterSpacing: '0.1em', marginBottom: 4 }}>
          IA PERSONNALISE
        </p>
        <h2 style={{
          fontFamily: 'Syne, sans-serif',
          fontWeight: 900,
          fontSize: 24,
          color: '#fff',
        }}>Ton mentor</h2>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}>
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <div style={{
              maxWidth: '80%',
              background: m.role === 'user' ? '#FF4D00' : '#0e0e0e',
              border: m.role === 'user' ? 'none' : '1px solid #1a1a1a',
              borderRadius: m.role === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
              padding: '12px 16px',
              color: '#fff',
              fontSize: 13,
              fontFamily: 'Space Mono, monospace',
              lineHeight: 1.7,
            }}>
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{
              background: '#0e0e0e',
              border: '1px solid #1a1a1a',
              borderRadius: '12px 12px 12px 4px',
              padding: '12px 16px',
            }}>
              <span style={{
                color: '#FF4D00',
                fontSize: 20,
                fontFamily: 'Space Mono, monospace',
                animation: 'blink 1.2s infinite',
              }}>...</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '12px 20px 24px',
        borderTop: '1px solid #111',
        display: 'flex',
        gap: 10,
        flexShrink: 0,
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 80px)',
      }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Pose ta question..."
          rows={1}
          style={{
            flex: 1,
            background: '#0e0e0e',
            border: '1px solid #1f1f1f',
            borderRadius: 8,
            padding: '12px 14px',
            color: '#fff',
            fontSize: 13,
            fontFamily: 'Space Mono, monospace',
            lineHeight: 1.5,
            resize: 'none',
          }}
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || loading}
          style={{
            background: (!input.trim() || loading) ? '#111' : '#FF4D00',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            width: 44,
            height: 44,
            alignSelf: 'flex-end',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: (!input.trim() || loading) ? 'not-allowed' : 'pointer',
            fontSize: 16,
            transition: 'background 0.2s',
            flexShrink: 0,
          }}
        >
          ▶
        </button>
      </div>
    </div>
  )
}
