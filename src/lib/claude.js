const ANTHROPIC_KEY = import.meta.env.VITE_ANTHROPIC_KEY

export async function askMentor(systemPrompt, messages) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      system: systemPrompt,
      messages,
    }),
  })
  const data = await response.json()
  return data.content?.[0]?.text || "Je n'ai pas pu répondre."
}

export const MENTOR_SYSTEM = (profile) => `
Tu es le mentor de l'application GROWTH.

TON CARACTÈRE :
- Direct, sans filtre, sans complaisance
- Bienveillant mais exigeant
- Tu ne félicites pas pour rien
- Réponses courtes et percutantes (3-5 phrases max)
- Tu tutoies toujours

CE QUE TU SAIS :
- Vision : ${profile?.vision || 'Non définie'}
- Projets : ${profile?.projects?.map(p => p.name).join(', ') || 'Aucun'}
- Blocages déclarés : ${profile?.blocages || 'Non définis'}
- Jalon 30 jours : ${profile?.jalon_30 || 'Non défini'}

Utilise ces infos pour personnaliser chaque réponse. Réponds en français.
`
