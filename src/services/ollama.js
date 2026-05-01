const GOOGLE_AI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models'
const MODEL = 'gemma-2.0-flash'

const getApiKey = () => import.meta.env.VITE_GOOGLE_AI_KEY

const callGemini = async (prompt, imageBase64 = null) => {
  const apiKey = getApiKey()
  const parts = []

  if (imageBase64) {
    parts.push({ inlineData: { mimeType: 'image/jpeg', data: imageBase64 } })
  }
  parts.push({ text: prompt })

  const response = await fetch(
    `${GOOGLE_AI_BASE_URL}/${MODEL}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
      }),
    }
  )

  const data = await response.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
}

export async function generateSmartReplies(transcription, userProfile) {
  const prompt = `You are an AAC (Augmentative and Alternative Communication) assistant helping a speech-impaired person communicate naturally in conversation.

User's communication profile:
- Tone: ${userProfile.tone || 'casual and warm'}
- Common phrases: ${userProfile.phrases?.join(', ') || 'none yet'}
- Style: ${userProfile.style || 'friendly and conversational'}

The other person just said: "${transcription}"

Generate exactly 4 short, natural reply suggestions that match the user's communication style.
Replies should be conversational, brief (max 8 words each), and feel human — not robotic.
Respond ONLY with a JSON array of strings, nothing else.
Example: ["Oh really? That's wild!", "Yeah, totally agree!", "Hmm, tell me more", "Haha no way!"]`

  try {
    const raw = await callGemini(prompt)
    const cleaned = raw.replace(/```json|```/g, '').trim()
    return JSON.parse(cleaned)
  } catch {
    return ["Yes!", "No thanks", "Tell me more", "Interesting!"]
  }
}

export async function generateSmartRepliesWithImage(transcription, userProfile, imageBase64) {
  const prompt = `You are an AAC (Augmentative and Alternative Communication) assistant helping a speech-impaired person communicate naturally.

User's communication profile:
- Tone: ${userProfile.tone || 'casual and warm'}
- Style: ${userProfile.style || 'friendly and conversational'}

The other person just said: "${transcription || 'What do you think about this?'}"

You are also given an image showing the context of their conversation (e.g. a restaurant menu, a whiteboard, a product, a sign, etc.).

Look at the image carefully. Use what you see in the image COMBINED with what was said to generate 4 highly relevant, natural reply suggestions.

For example:
- If image shows a restaurant menu → suggest replies about food choices, recommendations, or preferences
- If image shows a whiteboard with math → suggest replies about the content on the board
- If image shows a product → suggest replies about opinions, price, or interest

Replies must:
- Be conversational and brief (max 8 words each)
- Feel human and match the user's tone
- Be directly relevant to BOTH the image and what was said

Respond ONLY with a JSON array of 4 strings, nothing else.
Example: ["I'll have the pasta!", "That looks delicious", "What do you recommend?", "Is it spicy?"]`

  try {
    const raw = await callGemini(prompt, imageBase64)
    const cleaned = raw.replace(/```json|```/g, '').trim()
    return JSON.parse(cleaned)
  } catch {
    return ["Looks interesting!", "Tell me more", "I like it!", "What's this about?"]
  }
}

export async function buildVoiceProfile(conversations) {
  const prompt = `Analyze these conversations and extract the person's communication style.
  
Conversations:
${conversations.map((c, i) => `${i + 1}. "${c}"`).join('\n')}

Respond ONLY with a JSON object:
{
  "tone": "brief description of tone",
  "phrases": ["common phrase 1", "common phrase 2", "common phrase 3"],
  "language": "English",
  "style": "brief description of communication style"
}`

  try {
    const raw = await callGemini(prompt)
    const cleaned = raw.replace(/```json|```/g, '').trim()
    return JSON.parse(cleaned)
  } catch {
    return { tone: 'casual', phrases: [], language: 'English', style: 'friendly' }
  }
}

export async function detectContextLabel(imageBase64) {
  try {
    const prompt = 'What is in this image? Reply with ONLY 1-3 words and a fitting emoji. Example: "Menu 🍜" or "Whiteboard 📋" or "Product 🛍️"'
    const raw = await callGemini(prompt, imageBase64)
    return raw?.trim().slice(0, 30) || '📷 Context'
  } catch {
    return '📷 Context'
  }
}