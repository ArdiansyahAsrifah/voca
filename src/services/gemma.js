const GOOGLE_AI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models'
const MODEL = 'gemma-4-26b-a4b-it'

const getApiKey = () => import.meta.env.VITE_GOOGLE_AI_KEY

const extractJSON = (raw) => {
  if (!raw) throw new Error('Empty response')
  const cleaned = raw.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '').trim()
  try { return JSON.parse(cleaned) } catch (_) {}
  const arrMatch = cleaned.match(/\[[\s\S]*?\]/)
  if (arrMatch) { try { return JSON.parse(arrMatch[0]) } catch (_) {} }
  const objMatch = cleaned.match(/\{[\s\S]*?\}/)
  if (objMatch) { try { return JSON.parse(objMatch[0]) } catch (_) {} }
  throw new Error(`Could not extract JSON from: ${raw.slice(0, 100)}`)
}

const callGemma = async ({ system, turns, imageBase64 = null, jsonMode = false }) => {
  const apiKey = getApiKey()
  if (!apiKey) throw new Error('VITE_GOOGLE_AI_KEY is not set.')

  const contents = turns.map((t, i) => {
    const parts = []
    if (imageBase64 && t.role === 'user' && i === turns.length - 1) {
      parts.push({ inlineData: { mimeType: 'image/jpeg', data: imageBase64 } })
    }
    parts.push({ text: t.text })
    return { role: t.role, parts }
  })

  const body = {
    systemInstruction: { parts: [{ text: system }] },
    contents,
    generationConfig: {
      temperature: 0.3,
      topP: 0.7,
      maxOutputTokens: 80,
      ...(jsonMode && { responseMimeType: 'application/json' }),
    },
  }

  const response = await fetch(
    `${GOOGLE_AI_BASE_URL}/${MODEL}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  )

  const data = await response.json()
  if (!response.ok) {
    console.error('Gemma API error:', data)
    throw new Error(data.error?.message || `API failed: ${response.status}`)
  }

  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
}

export async function generateSmartReplies(transcription, userProfile) {
  try {
    const raw = await callGemma({
      system: `You are an AAC reply generator. Output ONLY a JSON array of 4 short strings, max 6 words each.`,
      turns: [
        { role: 'user', text: `Tone: ${userProfile.tone || 'casual'}. They said: "${transcription}". JSON array:` },
      ],
      jsonMode: true,
    })

    const parsed = extractJSON(raw)
    if (Array.isArray(parsed) && parsed.length > 0) return parsed.slice(0, 4)
    throw new Error('Not an array')
  } catch (e) {
    console.error('generateSmartReplies error:', e)
    return ["Yes!", "No thanks", "Tell me more", "Interesting!"]
  }
}

export async function generateSmartRepliesWithImage(transcription, userProfile, imageBase64) {
  try {
    const raw = await callGemma({
      system: `You are an AAC reply generator. Output ONLY a JSON array of 4 short strings, max 6 words each.`,
      turns: [
        { role: 'user', text: `Tone: ${userProfile.tone || 'casual'}. They said: "${transcription || 'What do you think?'}". Look at the image. JSON array:` },
      ],
      imageBase64,
      jsonMode: true,
    })

    const parsed = extractJSON(raw)
    if (Array.isArray(parsed) && parsed.length > 0) return parsed.slice(0, 4)
    throw new Error('Not an array')
  } catch (e) {
    console.error('generateSmartRepliesWithImage error:', e)
    return ["Looks interesting!", "Tell me more", "I like it!", "What's this about?"]
  }
}

export async function buildVoiceProfile(conversations) {
  try {
    const raw = await callGemma({
      system: `You analyze text and output ONLY a valid JSON object. Never output anything else.`,
      turns: [
        { role: 'user', text: `Analyze style:\n${conversations.map((c, i) => `${i + 1}. "${c}"`).join('\n')}\n→ JSON object with keys: tone, phrases (array), language, style:` },
      ],
      jsonMode: true,
    })
    return extractJSON(raw)
  } catch (e) {
    console.error('buildVoiceProfile error:', e)
    return { tone: 'casual', phrases: [], language: 'English', style: 'friendly' }
  }
}

export async function detectContextLabel(imageBase64) {
  try {
    const raw = await callGemma({
      system: `You describe images in 1-3 words + emoji only. Never output anything else.`,
      turns: [
        { role: 'user', text: 'What is in this image? 1-3 words + emoji only:' },
      ],
      imageBase64,
    })
    return raw?.trim().slice(0, 30) || '📷 Context'
  } catch (e) {
    console.error('detectContextLabel error:', e)
    return '📷 Context'
  }
}