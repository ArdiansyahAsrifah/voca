import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// --- DATA ---
const FEATURES = [
  {
    emoji: '🎤',
    title: 'Real-Time Transcription',
    description: 'VOCA listens to your conversation partner and instantly transcribes what they say — so you never miss a word.',
  },
  {
    emoji: '✨',
    title: 'AI-Powered Smart Replies',
    description: 'Gemma 4 analyzes what was said and instantly suggests 4 natural replies that sound just like you — tap to speak.',
  },
  {
    emoji: '🔊',
    title: 'Speaks For You',
    description: 'Tap any reply and VOCA reads it out loud clearly — so your conversation partner hears you, naturally.',
  },
]

const TONES = [
  { id: 'casual', label: '😄 Casual', desc: 'Relaxed & everyday' },
  { id: 'warm', label: '🤗 Warm', desc: 'Kind & caring' },
  { id: 'witty', label: '😏 Witty', desc: 'Clever & funny' },
  { id: 'formal', label: '👔 Formal', desc: 'Professional & polite' },
]

const STYLES = [
  { id: 'short', label: '⚡ Short & Punchy', desc: 'Quick, direct replies' },
  { id: 'detailed', label: '📝 Detailed', desc: 'Thoughtful & elaborate' },
  { id: 'humorous', label: '😂 Humorous', desc: 'Jokes & banter' },
  { id: 'empathetic', label: '💙 Empathetic', desc: 'Supportive & understanding' },
]

const TOPICS = [
  { id: 'family', label: '👨‍👩‍👧 Family' },
  { id: 'work', label: '💼 Work' },
  { id: 'health', label: '🏥 Health' },
  { id: 'hobbies', label: '🎨 Hobbies' },
  { id: 'food', label: '🍜 Food' },
  { id: 'sports', label: '⚽ Sports' },
  { id: 'travel', label: '✈️ Travel' },
  { id: 'tech', label: '💻 Tech' },
  { id: 'music', label: '🎵 Music' },
  { id: 'movies', label: '🎬 Movies' },
]

// Total steps: 4 feature slides + 3 profile steps + 1 done = 8
const TOTAL_STEPS = 8

export default function Onboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0) // 0-3 = features, 4 = tone, 5 = style, 6 = topics, 7 = done

  // Profile state
  const [selectedTone, setSelectedTone] = useState(null)
  const [selectedStyle, setSelectedStyle] = useState(null)
  const [selectedTopics, setSelectedTopics] = useState([])

  const progress = ((step) / (TOTAL_STEPS - 1)) * 100

  const toggleTopic = (id) => {
    setSelectedTopics(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    )
  }

  const saveAndContinue = () => {
    const profile = {
      tone: selectedTone || 'casual',
      style: selectedStyle || 'short',
      phrases: [],
      language: 'English',
      topics: selectedTopics,
    }
    localStorage.setItem('vocaProfile', JSON.stringify(profile))
    navigate('/conversation')
  }

  const canNext = () => {
    if (step === 4) return !!selectedTone
    if (step === 5) return !!selectedStyle
    return true
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">

      {/* Background blobs */}
      <div className="bg-blob-1" />
      <div className="bg-blob-2" />

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 glass border-b border-white/60 sticky top-0 z-10">
        <span className="font-bold text-teal-600 text-lg tracking-wide">VOCA</span>
        <button
          onClick={() => {
            localStorage.setItem('vocaProfile', JSON.stringify({
              tone: 'casual', style: 'short', phrases: [], language: 'English', topics: []
            }))
            navigate('/conversation')
          }}
          className="text-xs text-stone-400 px-3 py-1.5 rounded-full glass"
        >
          Skip →
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-white/30 backdrop-blur-sm">
        <div
          className="h-1 bg-teal-500/70 backdrop-blur-sm transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-4 py-6 relative z-10">

        {/* === FEATURE SLIDES (step 0–3) === */}
        {step <= 3 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-6">
            {step === 0 && (
              <div className="mb-2">
                <p className="text-xs font-semibold text-teal-600 uppercase tracking-widest mb-1">Welcome to</p>
                <h1 className="text-4xl font-bold text-stone-800">VOCA</h1>
                <p className="text-stone-500 mt-2 text-sm">Your voice. Your words. Your personality.</p>
              </div>
            )}
            <div className="w-24 h-24 rounded-3xl glass-teal flex items-center justify-center text-5xl">
              {FEATURES[step].emoji}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-stone-800 mb-3">{FEATURES[step].title}</h2>
              <p className="text-stone-500 text-base leading-relaxed max-w-xs mx-auto">
                {FEATURES[step].description}
              </p>
            </div>

            {/* Dot indicators */}
            <div className="flex gap-2 mt-2">
              {FEATURES.map((_, i) => (
                <div key={i} className={`h-2 rounded-full transition-all duration-300 ${
                  i === step ? 'bg-teal-500 w-4' : 'bg-stone-300 w-2'
                }`} />
              ))}
            </div>
          </div>
        )}

        {/* === TONE (step 4) === */}
        {step === 4 && (
          <div className="flex-1 flex flex-col gap-4">
            <div className="text-center mb-2">
              <p className="text-xs font-semibold text-teal-600 uppercase tracking-widest mb-1">Step 1 of 3</p>
              <h2 className="text-2xl font-bold text-stone-800">What's your tone?</h2>
              <p className="text-stone-400 text-sm mt-1">Choose the one that feels most like you</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {TONES.map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTone(t.id)}
                  className={`p-4 rounded-2xl text-left transition-all ${
                    selectedTone === t.id
                      ? 'glass-btn-active'
                      : 'glass-btn'
                  }`}
                >
                  <p className={`font-semibold text-sm ${selectedTone === t.id ? 'text-teal-700' : 'text-stone-800'}`}>
                    {t.label}
                  </p>
                  <p className="text-stone-400 text-xs mt-1">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* === STYLE (step 5) === */}
        {step === 5 && (
          <div className="flex-1 flex flex-col gap-4">
            <div className="text-center mb-2">
              <p className="text-xs font-semibold text-teal-600 uppercase tracking-widest mb-1">Step 2 of 3</p>
              <h2 className="text-2xl font-bold text-stone-800">How do you reply?</h2>
              <p className="text-stone-400 text-sm mt-1">Pick your communication style</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {STYLES.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedStyle(s.id)}
                  className={`p-4 rounded-2xl text-left transition-all ${
                    selectedStyle === s.id
                      ? 'glass-btn-active'
                      : 'glass-btn'
                  }`}
                >
                  <p className={`font-semibold text-sm ${selectedStyle === s.id ? 'text-teal-700' : 'text-stone-800'}`}>
                    {s.label}
                  </p>
                  <p className="text-stone-400 text-xs mt-1">{s.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* === TOPICS (step 6) === */}
        {step === 6 && (
          <div className="flex-1 flex flex-col gap-4">
            <div className="text-center mb-2">
              <p className="text-xs font-semibold text-teal-600 uppercase tracking-widest mb-1">Step 3 of 3</p>
              <h2 className="text-2xl font-bold text-stone-800">What do you talk about?</h2>
              <p className="text-stone-400 text-sm mt-1">Select all that apply — helps VOCA suggest better replies</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {TOPICS.map(t => (
                <button
                  key={t.id}
                  onClick={() => toggleTopic(t.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedTopics.includes(t.id)
                      ? 'glass-btn-active text-teal-700'
                      : 'glass-btn text-stone-600'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* === DONE (step 7) === */}
        {step === 7 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-5">
            <div className="w-24 h-24 rounded-3xl glass-teal flex items-center justify-center text-5xl">
              🎉
            </div>
            <div>
              <h2 className="text-2xl font-bold text-stone-800 mb-2">You're all set!</h2>
              <p className="text-stone-500 text-sm leading-relaxed max-w-xs mx-auto">
                VOCA has learned your style. Your smart replies will now sound just like{' '}
                <span className="font-semibold text-teal-600">you</span>.
              </p>
            </div>
            <div className="w-full glass-teal rounded-2xl p-4 text-left">
              <p className="text-xs font-semibold text-teal-700 mb-2">Your Communication Profile</p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs glass text-teal-700 px-3 py-1 rounded-full capitalize"
                  style={{ border: '0.5px solid rgba(13,148,136,0.25)' }}>
                  {TONES.find(t => t.id === selectedTone)?.label || '😄 Casual'}
                </span>
                <span className="text-xs glass text-teal-700 px-3 py-1 rounded-full capitalize"
                  style={{ border: '0.5px solid rgba(13,148,136,0.25)' }}>
                  {STYLES.find(s => s.id === selectedStyle)?.label || '⚡ Short & Punchy'}
                </span>
                {selectedTopics.slice(0, 3).map(id => (
                  <span key={id} className="text-xs glass text-teal-700 px-3 py-1 rounded-full"
                    style={{ border: '0.5px solid rgba(13,148,136,0.25)' }}>
                    {TOPICS.find(t => t.id === id)?.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Bottom button */}
      <div className="px-4 pb-8 relative z-10">
        {step < 7 ? (
          <button
            onClick={() => setStep(s => s + 1)}
            disabled={!canNext()}
            className="w-full glass-sent text-white py-4 rounded-2xl font-semibold text-base disabled:opacity-40 active:opacity-80 transition-all"
          >
            {step <= 3 ? (step === 3 ? 'Set Up My Profile →' : 'Next →') : 'Continue →'}
          </button>
        ) : (
          <button
            onClick={saveAndContinue}
            className="w-full glass-sent text-white py-4 rounded-2xl font-semibold text-base active:opacity-80"
          >
            Start Communicating 🎤
          </button>
        )}

        {step > 0 && step < 7 && (
          <button
            onClick={() => setStep(s => s - 1)}
            className="w-full text-stone-400 text-sm py-2 mt-1"
          >
            ← Back
          </button>
        )}
      </div>

    </div>
  )
}